import { auth, firestore } from '../config/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

const usersCollection = collection(firestore, 'users');

export const getUserProfile = async (userId = null) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error('Користувач не авторизований');
    }
    
    const docRef = doc(firestore, 'users', uid);
    const documentSnapshot = await getDoc(docRef);
    
    if (documentSnapshot.exists()) {
      return {
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Помилка отримання профілю користувача:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const uid = auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error('Користувач не авторизований');
    }
    
    const docRef = doc(firestore, 'users', uid);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    if (userData.faculty) {
      await SecureStore.setItemAsync('userFaculty', userData.faculty);
    }
    
    if (userData.specialty) {
      await SecureStore.setItemAsync('userSpecialty', userData.specialty);
    }
    
    if (userData.group) {
      await SecureStore.setItemAsync('userGroup', userData.group);
    }
    
    return true;
  } catch (error) {
    console.error('Помилка оновлення профілю користувача:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    const users = [];
    
    querySnapshot.forEach(documentSnapshot => {
      users.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Помилка отримання користувачів:', error);
    throw error;
  }
};

export const getUserStatistics = async (userId = null) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error('Користувач не авторизований');
    }
    
    const userTestsCollection = collection(firestore, 'userTests');
    const q = query(userTestsCollection, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const testResults = [];
    let totalScore = 0;
    let totalTests = 0;
    
    querySnapshot.forEach(documentSnapshot => {
      const data = documentSnapshot.data();
      testResults.push({
        id: documentSnapshot.id,
        ...data
      });
      
      totalScore += data.score || 0;
      totalTests += 1;
    });
    
    const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
    
    return {
      totalTests,
      averageScore,
      testResults
    };
  } catch (error) {
    console.error('Помилка отримання статистики користувача:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const docRef = doc(firestore, 'users', userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Помилка видалення користувача:', error);
    throw error;
  }
};

export const changeUserRole = async (userId, newRole) => {
  try {
    const docRef = doc(firestore, 'users', userId);
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Помилка зміни ролі користувача:', error);
    throw error;
  }
};

export const blockUser = async (userId) => {
  try {
    const docRef = doc(firestore, 'users', userId);
    await updateDoc(docRef, {
      role: 'blocked',
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Помилка блокування користувача:', error);
    throw error;
  }
};

export const unblockUser = async (userId) => {
  try {
    const docRef = doc(firestore, 'users', userId);
    await updateDoc(docRef, {
      role: 'student',
      isActive: true,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Помилка розблокування користувача:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, isActive) => {
  try {
    const docRef = doc(firestore, 'users', userId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Помилка оновлення статусу користувача:', error);
    throw error;
  }
};

export const getUsersByRole = async (role) => {
  try {
    const q = query(usersCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach(documentSnapshot => {
      users.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Помилка отримання користувачів за роллю:', error);
    throw error;
  }
};

export const getActiveUsers = async () => {
  try {
    const q = query(usersCollection, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach(documentSnapshot => {
      users.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Помилка отримання активних користувачів:', error);
    throw error;
  }
}; 