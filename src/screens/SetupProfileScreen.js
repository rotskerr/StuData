import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { saveUserProfile } from '../services/authService';
import { getFaculties, getSpecialties, getGroups, initializeBasicData } from '../services/facultyService';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const SetupProfileScreen = ({ navigation }) => {
  const [faculty, setFaculty] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [group, setGroup] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Дані з Firebase
  const [faculties, setFaculties] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const { checkLoginStatus } = useContext(NavigationContext);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (faculty) {
      loadSpecialties(faculty);
    } else {
      setSpecialties([]);
      setSpecialty('');
    }
  }, [faculty]);

  useEffect(() => {
    if (specialty) {
      loadGroups(specialty);
    } else {
      setGroups([]);
      setGroup('');
    }
  }, [specialty]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await initializeBasicData();
      
      const facultiesData = await getFaculties();
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecialties = async (facultyId) => {
    try {
      const specialtiesData = await getSpecialties(facultyId);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Помилка завантаження спеціальностей:', error);
    }
  };

  const loadGroups = async (specialtyId) => {
    try {
      const groupsData = await getGroups(specialtyId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Помилка завантаження груп:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!faculty || !specialty || !group) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    setIsSaving(true);
    try {
      const facultyName = faculties.find(f => f.id === faculty)?.name || '';
      const specialtyName = specialties.find(s => s.id === specialty)?.name || '';
      const groupName = groups.find(g => g.id === group)?.name || '';
      
      const profileData = {
        faculty: facultyName,
        specialty: specialtyName,
        group: groupName,
        facultyId: faculty,
        specialtyId: specialty,
        groupId: group,
        facultyName: facultyName,
        specialtyName: specialtyName,
        groupName: groupName,
        role: 'user'
      };
      
  
      const result = await saveUserProfile(profileData);
      
      if (result.success) {
        Alert.alert('Успіх', 'Профіль налаштовано успішно!', [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                const userToken = await SecureStore.getItemAsync('userToken');
                if (!userToken) {
                  await SecureStore.setItemAsync('userToken', result.userId || 'user-token');
                }
                
                if (checkLoginStatus) {
                  await checkLoginStatus();
                }
              } catch (error) {
                console.error('Помилка при переході на головний екран:', error);
              }
            } 
          }
        ]);
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      console.error('Детальна помилка збереження профілю:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти дані: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFacultyPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Факультет:</Text>
      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
        {faculties.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.pickerItem, faculty === item.id && styles.pickerItemSelected]}
            onPress={() => {
              setFaculty(item.id);
              setSpecialty('');
              setGroup('');
            }}
          >
            <Text style={[styles.pickerItemText, faculty === item.id && styles.pickerItemTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSpecialtyPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Спеціальність:</Text>
      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
        {specialties.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.pickerItem, specialty === item.id && styles.pickerItemSelected]}
            onPress={() => {
              setSpecialty(item.id);
              setGroup('');
            }}
          >
            <Text style={[styles.pickerItemText, specialty === item.id && styles.pickerItemTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {faculty && specialties.length === 0 && (
        <Text style={styles.emptyText}>Немає доступних спеціальностей</Text>
      )}
    </View>
  );

  const renderGroupPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Група:</Text>
      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
        {groups.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.pickerItem, group === item.id && styles.pickerItemSelected]}
            onPress={() => setGroup(item.id)}
          >
            <Text style={[styles.pickerItemText, group === item.id && styles.pickerItemTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {specialty && groups.length === 0 && (
        <Text style={styles.emptyText}>Немає доступних груп</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження даних...</Text>
        <Text style={styles.loadingSubtext}>Ініціалізація системи</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Налаштування профілю</Text>
        <Text style={styles.subtitle}>Будь ласка, виберіть ваш факультет, спеціальність та групу</Text>
      </View>

      <View style={styles.content}>
        {renderFacultyPicker()}
        {renderSpecialtyPicker()}
        {renderGroupPicker()}
        
        <TouchableOpacity 
          style={[styles.button, isSaving && styles.buttonDisabled]} 
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Зберегти та продовжити</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  pickerScrollView: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default SetupProfileScreen; 