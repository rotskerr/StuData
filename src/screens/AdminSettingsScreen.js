import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const AdminSettingsScreen = ({ navigation }) => {
  const { checkLoginStatus } = useContext(NavigationContext);
  const [isLoading, setIsLoading] = useState(false);
  
  // Налаштування системи
  const [settings, setSettings] = useState({
    allowRegistration: true,
    requireEmailVerification: true,
    autoArchiveTests: false,
    sendNotifications: true,
    debugMode: false,
    maintenanceMode: false,
    dataBackupEnabled: true,
    analyticsEnabled: true
  });

  const toggleSetting = (key) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key]
    }));

    // Симуляція збереження налаштувань
    if (key === 'maintenanceMode') {
      Alert.alert(
        'Режим обслуговування',
        settings.maintenanceMode 
          ? 'Режим обслуговування вимкнено. Система доступна для користувачів.' 
          : 'Режим обслуговування увімкнено. Система недоступна для звичайних користувачів.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackupData = () => {
    setIsLoading(true);
    
    // Симуляція резервного копіювання
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Успіх', 'Резервне копіювання даних успішно завершено');
    }, 2000);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очищення кешу',
      'Ви впевнені, що хочете очистити кеш системи?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Очистити',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            
            // Симуляція очищення кешу
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('Успіх', 'Кеш системи успішно очищено');
            }, 1500);
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Вихід з системи',
      'Ви впевнені, що хочете вийти?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              // Видаляємо токен та роль адміністратора
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userRole');
              
              // Оновлюємо стан авторизації
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

  const renderSettingItem = (title, description, value, onToggle, icon, color = '#4285F4') => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: color + '60' }}
        thumbColor={value ? color : '#f4f3f4'}
      />
    </View>
  );

  const renderActionItem = (title, description, onPress, icon, color = '#4285F4') => (
    <TouchableOpacity 
      style={styles.actionItem}
      onPress={onPress}
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
            <Text style={styles.sectionTitle}>Загальні налаштування</Text>
            
            {renderSettingItem(
              'Реєстрація користувачів',
              'Дозволити новим користувачам реєструватися в системі',
              settings.allowRegistration,
              () => toggleSetting('allowRegistration'),
              'person-add',
              '#4285F4'
            )}
            
            {renderSettingItem(
              'Підтвердження електронної пошти',
              'Вимагати підтвердження електронної пошти при реєстрації',
              settings.requireEmailVerification,
              () => toggleSetting('requireEmailVerification'),
              'mail',
              '#4285F4'
            )}
            
            {renderSettingItem(
              'Автоматичне архівування тестів',
              'Автоматично архівувати тести після закінчення терміну дії',
              settings.autoArchiveTests,
              () => toggleSetting('autoArchiveTests'),
              'archive',
              '#F4B400'
            )}
            
            {renderSettingItem(
              'Сповіщення',
              'Надсилати сповіщення користувачам про нові тести',
              settings.sendNotifications,
              () => toggleSetting('sendNotifications'),
              'notifications',
              '#0F9D58'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Системні налаштування</Text>
            
            {renderSettingItem(
              'Режим налагодження',
              'Увімкнути розширене журналювання та інструменти розробника',
              settings.debugMode,
              () => toggleSetting('debugMode'),
              'bug',
              '#DB4437'
            )}
            
            {renderSettingItem(
              'Режим обслуговування',
              'Тимчасово закрити доступ до системи для звичайних користувачів',
              settings.maintenanceMode,
              () => toggleSetting('maintenanceMode'),
              'construct',
              '#DB4437'
            )}
            
            {renderSettingItem(
              'Резервне копіювання даних',
              'Автоматично створювати резервні копії даних щодня',
              settings.dataBackupEnabled,
              () => toggleSetting('dataBackupEnabled'),
              'save',
              '#0F9D58'
            )}
            
            {renderSettingItem(
              'Аналітика',
              'Збирати анонімну статистику використання системи',
              settings.analyticsEnabled,
              () => toggleSetting('analyticsEnabled'),
              'analytics',
              '#F4B400'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дії</Text>
            
            {renderActionItem(
              'Резервне копіювання',
              'Створити резервну копію всіх даних системи зараз',
              handleBackupData,
              'cloud-upload',
              '#4285F4'
            )}
            
            {renderActionItem(
              'Очистити кеш',
              'Видалити тимчасові файли та очистити кеш системи',
              handleClearCache,
              'trash',
              '#F4B400'
            )}
            
            {renderActionItem(
              'Вихід з системи',
              'Вийти з облікового запису адміністратора',
              handleLogout,
              'log-out',
              '#DB4437'
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Версія системи: 1.0.0</Text>
            <Text style={styles.copyrightText}>© 2023 StuData. Усі права захищено.</Text>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default AdminSettingsScreen; 