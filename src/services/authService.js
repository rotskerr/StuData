import * as SecureStore from 'expo-secure-store';
import { auth, firestore } from '../config/firebase';

// Функція для входу користувача
export const loginUser = async (email, password) => {
  try {
    // Перевірка на адміністратора
    if (email === 'admin' && password === 'admin') {
      await SecureStore.setItemAsync('userToken', 'admin-token');
      await SecureStore.setItemAsync('userRole', 'admin');
      await SecureStore.setItemAsync('userEmail', 'admin@studata.com');
      
      return { success: true };
    }
    
    // В реальному додатку тут буде виклик Firebase Auth
    // const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Імітація успішного входу
    await SecureStore.setItemAsync('userToken', 'dummy-token');
    await SecureStore.setItemAsync('userEmail', email);
    await SecureStore.setItemAsync('userRole', 'user');
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при вході в систему' 
    };
  }
};

// Функція для реєстрації нового користувача
export const registerUser = async (email, password) => {
  try {
    // В реальному додатку тут буде виклик Firebase Auth
    // const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Імітація успішної реєстрації
    await SecureStore.setItemAsync('userToken', 'dummy-token');
    await SecureStore.setItemAsync('userEmail', email);
    await SecureStore.setItemAsync('userRole', 'user');
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при реєстрації користувача' 
    };
  }
};

// Функція для виходу користувача
export const logoutUser = async () => {
  try {
    // В реальному додатку тут буде виклик Firebase Auth
    // await auth.signOut();
    
    // Видалення токену та даних користувача
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('userRole');
    await SecureStore.deleteItemAsync('userFaculty');
    await SecureStore.deleteItemAsync('userSpecialty');
    await SecureStore.deleteItemAsync('userGroup');
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при виході з системи' 
    };
  }
};

// Функція для перевірки, чи користувач авторизований
export const isUserLoggedIn = async () => {
  try {
    const userToken = await SecureStore.getItemAsync('userToken');
    return userToken !== null;
  } catch (error) {
    console.error('Помилка перевірки авторизації:', error);
    return false;
  }
};

// Функція для перевірки ролі користувача
export const getUserRole = async () => {
  try {
    const userRole = await SecureStore.getItemAsync('userRole');
    return userRole || 'user'; // За замовчуванням повертаємо 'user'
  } catch (error) {
    console.error('Помилка отримання ролі користувача:', error);
    return 'user';
  }
};

// Функція для перевірки, чи користувач є адміністратором
export const isAdmin = async () => {
  try {
    const userRole = await SecureStore.getItemAsync('userRole');
    return userRole === 'admin';
  } catch (error) {
    console.error('Помилка перевірки ролі адміністратора:', error);
    return false;
  }
};

// Функція для перевірки університетської пошти
export const validateUniversityEmail = (email) => {
  // Тут можна додати перевірку на конкретний домен університету
  const universityDomain = 'university.edu.ua';
  return email.endsWith(`@${universityDomain}`);
};

// Функція для збереження даних профілю користувача
export const saveUserProfile = async (faculty, specialty, group) => {
  try {
    await SecureStore.setItemAsync('userFaculty', faculty);
    await SecureStore.setItemAsync('userSpecialty', specialty);
    await SecureStore.setItemAsync('userGroup', group);
    
    // В реальному додатку тут буде оновлення даних у Firestore
    // const userEmail = await SecureStore.getItemAsync('userEmail');
    // await firestore.collection('users').doc(userEmail).set({
    //   faculty,
    //   specialty,
    //   group
    // }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при збереженні профілю' 
    };
  }
};

// Функція для отримання даних профілю користувача
export const getUserProfile = async () => {
  try {
    const userEmail = await SecureStore.getItemAsync('userEmail');
    const faculty = await SecureStore.getItemAsync('userFaculty');
    const specialty = await SecureStore.getItemAsync('userSpecialty');
    const group = await SecureStore.getItemAsync('userGroup');
    const role = await SecureStore.getItemAsync('userRole');
    
    return {
      email: userEmail,
      faculty,
      specialty,
      group,
      role: role || 'user'
    };
  } catch (error) {
    console.error('Помилка отримання профілю:', error);
    return null;
  }
};