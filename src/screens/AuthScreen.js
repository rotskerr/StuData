import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loginUser, registerUser, createTestUser } from '../services/authService';
import { NavigationContext } from '../navigation/AppNavigator';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { checkLoginStatus } = useContext(NavigationContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        if (checkLoginStatus) {
          await checkLoginStatus();
        }
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося увійти: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Помилка', 'Пароль повинен містити мінімум 6 символів');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(email, password);
      
      if (result.success) {
        navigation.navigate('SetupProfile');
      } else {
        Alert.alert('Помилка', result.error);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зареєструватися: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>StuData</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Система збору анкетних даних' : 'Створіть новий обліковий запис'}
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Вхід</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Реєстрація</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Електронна пошта"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Підтвердження паролю"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Увійти' : 'Зареєструватися'}
            </Text>
          )}
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity 
            style={[styles.registerLink, { marginTop: 10 }]}
            onPress={async () => {
              setIsLoading(true);
              try {
                const result = await createTestUser();
                if (result.success) {
                  Alert.alert('Успіх', 'Тестовий користувач створений!', [
                    { text: 'OK', onPress: async () => {
                      if (checkLoginStatus) {
                        await checkLoginStatus();
                      }
                    }}
                  ]);
                } else {
                  Alert.alert('Помилка', result.error);
                }
              } catch (error) {
                Alert.alert('Помилка', 'Не вдалося створити тестового користувача: ' + error.message);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {/* <Text style={[styles.registerText, { color: '#4caf50' }]}>
              Створити тестового користувача
            </Text> */}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4285F4',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 30,
    padding: 4,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4285F4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#4285F4',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  registerLink: {
    marginTop: 20,
    padding: 5,
  },
  registerText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AuthScreen; 