import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loginUser } from '../services/authService';
import { NavigationContext } from '../navigation/AppNavigator';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Оновлюємо стан авторизації
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

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>StuData</Text>
      <Text style={styles.subtitle}>Система збору анкетних даних</Text>

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
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Увійти</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>
          Немає облікового запису? Зареєструватися
        </Text>
      </TouchableOpacity>
      
      {/* Додаємо кнопку для швидкого входу без реєстрації для тестування */}
      <TouchableOpacity 
        style={[styles.registerLink, { marginTop: 10 }]}
        onPress={async () => {
          setIsLoading(true);
          try {
            await loginUser('test@example.com', 'password');
            // Оновлюємо стан авторизації
            if (checkLoginStatus) {
              await checkLoginStatus();
            }
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося увійти: ' + error.message);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <Text style={[styles.registerText, { color: '#4caf50' }]}>
          Швидкий вхід для тестування
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 40,
    textAlign: 'center',
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

export default LoginScreen; 