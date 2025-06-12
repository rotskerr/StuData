import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { saveUserProfile } from '../services/authService';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const SetupProfileScreen = ({ navigation }) => {
  const [faculty, setFaculty] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [group, setGroup] = useState('');
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

  const handleSaveProfile = async () => {
    if (!faculty || !specialty || !group) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    try {
      const result = await saveUserProfile(faculty, specialty, group);
      
      if (result.success) {
        Alert.alert('Успіх', 'Профіль налаштовано успішно!', [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                // Переконуємося, що токен встановлено
                await SecureStore.setItemAsync('userToken', 'dummy-token');
                
                // Оновлюємо стан авторизації
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
      Alert.alert('Помилка', 'Не вдалося зберегти дані: ' + error.message);
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
          style={styles.button} 
          onPress={handleSaveProfile}
        >
          <Text style={styles.buttonText}>Зберегти та продовжити</Text>
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
});

export default SetupProfileScreen; 