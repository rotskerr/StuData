import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';
import { cleanupReportFiles } from '../services/reportService';

const AdminSettingsScreen = ({ navigation }) => {
  const { checkLoginStatus } = useContext(NavigationContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleClearReportFiles = async () => {
    Alert.alert(
      'Очищення файлів звітів',
      'Видалити всі тимчасові файли звітів?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Очистити',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await cleanupReportFiles();
              if (result.success) {
                Alert.alert('Успіх', `Видалено ${result.deletedCount} файлів`);
              } else {
                Alert.alert('Помилка', result.error);
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося очистити файли');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Вихід з системи',
      'Ви впевнені, що хочете вийти з адмінпанелі?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userRole');
              
              if (checkLoginStatus) {
                await checkLoginStatus();
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося вийти: ' + error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderActionItem = (title, description, onPress, icon, color = '#4285F4') => (
    <TouchableOpacity 
      style={styles.actionItem}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.settingIconContainer}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={22} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Налаштування системи</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Будь ласка, зачекайте...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Обслуговування системи</Text>
            
            {renderActionItem(
              'Очистити файли звітів',
              'Видалити тимчасові файли PDF та CSV звітів',
              handleClearReportFiles,
              'trash',
              '#FF6D01'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Система</Text>
            
            {renderActionItem(
              'Вихід з системи',
              'Вийти з облікового запису адміністратора',
              handleLogout,
              'log-out',
              '#DB4437'
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>StuData v1.0.0</Text>
            <Text style={styles.copyrightText}>Система тестування студентів</Text>
            <Text style={styles.copyrightText}>© 2024 Усі права захищено</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingIconContainer: {
    marginRight: 15,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});

export default AdminSettingsScreen; 