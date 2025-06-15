import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, saveUserProfile, logoutUser } from '../services/authService';
import { getFaculties, getSpecialties, getGroups } from '../services/facultyService';
import { getUserTestResults } from '../services/testService';
import { NavigationContext } from '../navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0
  });
  const { checkLoginStatus } = useContext(NavigationContext);

  const [faculties, setFaculties] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    loadUserProfile();
    checkAdminStatus();
    loadUserStats();
  }, []);

  useEffect(() => {
    if (isEditing) {
      loadFaculties();
    }
  }, [isEditing]);

  useEffect(() => {
    if (selectedFacultyId) {
      loadSpecialties(selectedFacultyId);
    } else {
      setSpecialties([]);
      setSelectedSpecialtyId('');
    }
  }, [selectedFacultyId]);

  useEffect(() => {
    if (selectedSpecialtyId) {
      loadGroups(selectedSpecialtyId);
    } else {
      setGroups([]);
      setSelectedGroupId('');
    }
  }, [selectedSpecialtyId]);

  const checkAdminStatus = async () => {
    try {
      const userRole = await SecureStore.getItemAsync('userRole');
      setIsAdmin(userRole === 'admin');
    } catch (error) {
      console.error('Помилка перевірки статусу адміністратора:', error);
    }
  };

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
        setSelectedFacultyId(profile.facultyId || '');
        setSelectedSpecialtyId(profile.specialtyId || '');
        setSelectedGroupId(profile.groupId || '');
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        

      }
    } catch (error) {
      console.error('Помилка завантаження профілю:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані профілю');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const results = await getUserTestResults();
      
      if (results.length > 0) {
        const totalScore = results.reduce((sum, result) => sum + result.score, 0);
        const totalTime = results.reduce((sum, result) => sum + (result.timeSpent || 0), 0);
        const bestScore = Math.max(...results.map(result => result.score));
        
        setUserStats({
          testsCompleted: results.length,
          averageScore: Math.round(totalScore / results.length),
          totalTimeSpent: Math.round(totalTime / 60), // в хвилинах
          bestScore: bestScore
        });
      }
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
    }
  };

  const loadFaculties = async () => {
    try {
      const facultiesData = await getFaculties();
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Помилка завантаження факультетів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список факультетів');
    }
  };

  const loadSpecialties = async (facultyId) => {
    try {
      const specialtiesData = await getSpecialties(facultyId);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Помилка завантаження спеціальностей:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список спеціальностей');
    }
  };

  const loadGroups = async (specialtyId) => {
    try {
      const groupsData = await getGroups(specialtyId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Помилка завантаження груп:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список груп');
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedFacultyId || !selectedSpecialtyId || !selectedGroupId) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі обов\'язкові поля (факультет, спеціальність, група)');
      return;
    }

    setIsSaving(true);
    try {
      const faculty = faculties.find(f => f.id === selectedFacultyId);
      const specialty = specialties.find(s => s.id === selectedSpecialtyId);
      const group = groups.find(g => g.id === selectedGroupId);

      const updatedProfile = {
        ...userProfile,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        facultyId: selectedFacultyId,
        specialtyId: selectedSpecialtyId,
        groupId: selectedGroupId,
        facultyName: faculty?.name || '',
        specialtyName: specialty?.name || '',
        groupName: group?.name || ''
      };

      const result = await saveUserProfile(updatedProfile);
      
      if (result.success) {
        Alert.alert('Успіх', 'Дані профілю збережено');
        setUserProfile(updatedProfile);
        setIsEditing(false);
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти дані: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Вихід з системи',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logoutUser();
              
              if (result.success) {
                if (checkLoginStatus) {
                  await checkLoginStatus();
                }
              } else {
                Alert.alert('Помилка', result.error);
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося вийти: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderStatCard = (title, value, icon, color, subtitle = null) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderDropdown = (label, items, selectedId, onSelect, placeholder) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}:</Text>
      <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.dropdownItem, selectedId === item.id && styles.dropdownItemSelected]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[
              styles.dropdownItemText, 
              selectedId === item.id && styles.dropdownItemTextSelected
            ]}>
              {item.name}
            </Text>
            {selectedId === item.id && (
              <Ionicons name="checkmark" size={20} color="#4285F4" />
            )}
          </TouchableOpacity>
        ))}
        {items.length === 0 && (
          <Text style={styles.dropdownEmptyText}>{placeholder}</Text>
        )}
      </ScrollView>
    </View>
  );

  const getUserDisplayName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'Користувач';
  };

  const getProfileCompleteness = () => {
    let completed = 0;
    const total = 5;
    
    if (firstName) completed++;
    if (lastName) completed++;
    if (selectedFacultyId) completed++;
    if (selectedSpecialtyId) completed++;
    if (selectedGroupId) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження профілю...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#4285F4" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userEmail}>{userProfile?.email}</Text>
            {userProfile?.facultyName && userProfile?.groupName && (
              <Text style={styles.userDetails}>
                {userProfile.facultyName} • {userProfile.groupName}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => navigation.navigate('Admin')}
            >
              <Ionicons name="settings" size={20} color="#fff" />
              <Text style={styles.adminButtonText}>Адмінка</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? "close" : "create"} size={20} color="#4285F4" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Статистика */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Тестів пройдено', 
              userStats.testsCompleted, 
              'checkmark-circle', 
              '#0F9D58'
            )}
            {renderStatCard(
              'Середній бал', 
              `${userStats.averageScore}%`, 
              'trophy', 
              '#F4B400'
            )}
            {renderStatCard(
              'Кращий результат', 
              `${userStats.bestScore}%`, 
              'star', 
              '#DB4437'
            )}
            {renderStatCard(
              'Часу витрачено', 
              `${userStats.totalTimeSpent} хв`, 
              'time', 
              '#4285F4'
            )}
          </View>
        </View>

        {/* Профіль */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Особиста інформація</Text>
            {!isEditing && (
              <View style={styles.completenessContainer}>
                <Text style={styles.completenessText}>
                  Заповнено: {getProfileCompleteness()}%
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProfileCompleteness()}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ім'я:</Text>
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Введіть ім'я"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Прізвище:</Text>
                <TextInput
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Введіть прізвище"
                />
              </View>

              {renderDropdown(
                'Факультет', 
                faculties, 
                selectedFacultyId, 
                (id) => {
                  setSelectedFacultyId(id);
                  setSelectedSpecialtyId('');
                  setSelectedGroupId('');
                },
                'Спочатку завантажте факультети'
              )}

              {selectedFacultyId && renderDropdown(
                'Спеціальність', 
                specialties, 
                selectedSpecialtyId, 
                (id) => {
                  setSelectedSpecialtyId(id);
                  setSelectedGroupId('');
                },
                'Виберіть факультет'
              )}

              {selectedSpecialtyId && renderDropdown(
                'Група', 
                groups, 
                selectedGroupId, 
                setSelectedGroupId,
                'Виберіть спеціальність'
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setSelectedFacultyId(userProfile?.facultyId || '');
                    setSelectedSpecialtyId(userProfile?.specialtyId || '');
                    setSelectedGroupId(userProfile?.groupId || '');
                    setFirstName(userProfile?.firstName || '');
                    setLastName(userProfile?.lastName || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Скасувати</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Зберегти</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ім'я:</Text>
                <Text style={styles.infoValue}>{firstName || 'Не вказано'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Прізвище:</Text>
                <Text style={styles.infoValue}>{lastName || 'Не вказано'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Факультет:</Text>
                <Text style={styles.infoValue}>{userProfile?.facultyName || 'Не вказано'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Спеціальність:</Text>
                <Text style={styles.infoValue}>{userProfile?.specialtyName || 'Не вказано'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Група:</Text>
                <Text style={styles.infoValue}>{userProfile?.groupName || 'Не вказано'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Дії */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дії</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tests')}
          >
            <Ionicons name="document-text" size={24} color="#4285F4" />
            <Text style={styles.actionButtonText}>Переглянути тести</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#DB4437" />
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Вийти з системи</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F9D58',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adminButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completenessContainer: {
    alignItems: 'flex-end',
  },
  completenessText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285F4',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  editForm: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  dropdownScrollView: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#4285F4',
    fontWeight: '500',
  },
  dropdownEmptyText: {
    padding: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  profileInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ffebee',
  },
  logoutButtonText: {
    color: '#DB4437',
  },
});

export default ProfileScreen; 