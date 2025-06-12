import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getUserProfile, saveUserProfile, logoutUser } from '../services/authService';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const ProfileScreen = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [faculty, setFaculty] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [group, setGroup] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { checkLoginStatus } = useContext(NavigationContext);

  // Приклади факультетів, спеціальностей та груп
  const faculties = ['Інформаційних технологій', 'Економіки', 'Права', 'Філології'];
  const specialties = {
    'Інформаційних технологій': ['Комп\'ютерні науки', 'Кібербезпека', 'Інженерія програмного забезпечення'],
    'Економіки': ['Фінанси', 'Маркетинг', 'Менеджмент'],
    'Права': ['Правознавство', 'Міжнародне право'],
    'Філології': ['Українська мова та література', 'Англійська філологія']
  };
  const groups = ['КН-11', 'КН-12', 'КН-21', 'КН-22', 'ІПЗ-11', 'ІПЗ-12'];

  useEffect(() => {
    const loadUserProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserEmail(profile.email || '');
        setFaculty(profile.faculty || '');
        setSpecialty(profile.specialty || '');
        setGroup(profile.group || '');
      }
    };

    loadUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!faculty || !specialty || !group) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    try {
      const result = await saveUserProfile(faculty, specialty, group);
      
      if (result.success) {
        Alert.alert('Успіх', 'Дані профілю збережено');
        setIsEditing(false);
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти дані: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      
      if (result.success) {
        Alert.alert('Успіх', 'Ви вийшли з системи', [
          { 
            text: 'OK', 
            onPress: async () => {
              // Оновлюємо стан авторизації
              if (checkLoginStatus) {
                await checkLoginStatus();
              }
            } 
          }
        ]);
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося вийти: ' + error.message);
    }
  };

  const renderFacultyPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Факультет:</Text>
      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
        {faculties.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.pickerItem, faculty === item && styles.pickerItemSelected]}
            onPress={() => {
              setFaculty(item);
              setSpecialty('');
            }}
          >
            <Text style={[styles.pickerItemText, faculty === item && styles.pickerItemTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSpecialtyPicker = () => {
    const items = faculty ? specialties[faculty] || [] : [];
    
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Спеціальність:</Text>
        <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pickerItem, specialty === item && styles.pickerItemSelected]}
              onPress={() => setSpecialty(item)}
            >
              <Text style={[styles.pickerItemText, specialty === item && styles.pickerItemTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderGroupPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Група:</Text>
      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled={true}>
        {groups.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.pickerItem, group === item && styles.pickerItemSelected]}
            onPress={() => setGroup(item)}
          >
            <Text style={[styles.pickerItemText, group === item && styles.pickerItemTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Профіль студента</Text>
        <Text style={styles.profileEmail}>{userEmail}</Text>
      </View>

      <View style={styles.profileInfo}>
        {isEditing ? (
          <>
            {renderFacultyPicker()}
            {renderSpecialtyPicker()}
            {renderGroupPicker()}
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Зберегти зміни</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Скасувати</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Факультет:</Text>
              <Text style={styles.infoValue}>{faculty || 'Не вказано'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Спеціальність:</Text>
              <Text style={styles.infoValue}>{specialty || 'Не вказано'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Група:</Text>
              <Text style={styles.infoValue}>{group || 'Не вказано'}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Редагувати профіль</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Вийти з системи</Text>
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
  profileHeader: {
    backgroundColor: '#4285F4',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileInfo: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    width: '40%',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    width: '60%',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  editButton: {
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
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#4caf50',
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 