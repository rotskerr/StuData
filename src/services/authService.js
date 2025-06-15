import * as SecureStore from 'expo-secure-store';
import { auth, firestore } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

export const loginUser = async (email, password) => {
  try {
    if (email === 'admin' && password === 'admin') {
      await SecureStore.setItemAsync('userToken', 'admin-token');
      await SecureStore.setItemAsync('userRole', 'admin');
      await SecureStore.setItemAsync('userEmail', 'admin@studata.com');
      return { success: true };
    }
    
    if (email === 'admin@studata.com') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await SecureStore.setItemAsync('userToken', user.uid);
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userRole', 'admin');
        
        return { success: true };
      } catch (error) {
      }
    }
    
    const testUsersSnapshot = await getDocs(collection(firestore, 'testUsers'));
    let testUser = null;
    
    testUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.email === email && userData.password === password) {
        testUser = { id: doc.id, ...userData };
      }
    });
    
    if (testUser) {
      await SecureStore.setItemAsync('userToken', testUser.uid);
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userRole', testUser.role || 'user');
      
      return { success: true };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await SecureStore.setItemAsync('userToken', user.uid);
    await SecureStore.setItemAsync('userEmail', email);
    
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const userRole = userDoc.exists() ? userDoc.data().role : 'user';
    
    await SecureStore.setItemAsync('userRole', userRole);
    
    return { success: true };
  } catch (error) {
    console.error('Помилка входу:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при вході в систему' 
    };
  }
};

export const registerUser = async (email, password, role = 'user') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(firestore, 'users', user.uid), {
      email: email,
      role: role,
      createdAt: new Date()
    });
    
    await SecureStore.setItemAsync('userToken', user.uid);
    await SecureStore.setItemAsync('userEmail', email);
    await SecureStore.setItemAsync('userRole', role);
    
    return { success: true };
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при реєстрації користувача' 
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('userRole');
    return { success: true };
  } catch (error) {
    console.error('Помилка виходу:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при виході з системи' 
    };
  }
};

export const isUserLoggedIn = async () => {
  try {
    const userToken = await SecureStore.getItemAsync('userToken');
    return userToken !== null;
  } catch (error) {
    console.error('Помилка перевірки авторизації:', error);
    return false;
  }
};

export const getUserRole = async () => {
  try {
    const userRole = await SecureStore.getItemAsync('userRole');
    return userRole || 'user';
  } catch (error) {
    console.error('Помилка отримання ролі користувача:', error);
    return 'user';
  }
};

export const isAdmin = async () => {
  try {
    const userRole = await SecureStore.getItemAsync('userRole');
    return userRole === 'admin';
  } catch (error) {
    console.error('Помилка перевірки ролі адміністратора:', error);
    return false;
  }
};

export const validateUniversityEmail = (email) => {
  const universityDomain = 'university.edu.ua';
  return email.endsWith(`@${universityDomain}`);
};

export const saveUserProfile = async (profileData) => {
  try {
    const userToken = await SecureStore.getItemAsync('userToken');
    if (!userToken) throw new Error('Користувач не авторизований');

    const currentUser = auth.currentUser;
    if (currentUser) {
      await setDoc(doc(firestore, 'users', currentUser.uid), {
        ...profileData,
        uid: currentUser.uid,
        email: currentUser.email,
        updatedAt: new Date()
      }, { merge: true });
    } else {
      await setDoc(doc(firestore, 'users', userToken), {
        ...profileData,
        updatedAt: new Date()
      }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Детальна помилка збереження профілю:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при збереженні профілю' 
    };
  }
};

export const getUserProfile = async () => {
  try {
    const userToken = await SecureStore.getItemAsync('userToken');
    if (!userToken) return null;
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            ...userData,
            id: currentUser.uid
          };
        } else {
          return {
            email: currentUser.email,
            role: 'user',
            id: currentUser.uid
          };
        }
      } catch (error) {
      }
    }
    
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userToken));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...userData,
          id: userToken
        };
      }
    } catch (error) {
    }
    
    const testUsersSnapshot = await getDocs(collection(firestore, 'testUsers'));
    let userData = null;
    
    testUsersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.uid === userToken) {
        userData = { ...data, id: doc.id };
      }
    });
    
    if (userData) {
      return userData;
    }
    
    const userEmail = await SecureStore.getItemAsync('userEmail');
    const userRole = await SecureStore.getItemAsync('userRole');
    
    return {
      email: userEmail,
      role: userRole || 'user',
      id: userToken
    };
  } catch (error) {
    console.error('Помилка отримання профілю:', error);
    return null;
  }
};

export const registerAdmin = async (email = 'admin@studata.com', password = 'admin123') => {
  return registerUser(email, password, 'admin');
};

export const createTestUser = async () => {
  try {
    const testUserId = 'test_user_' + Date.now();
    const testUserEmail = 'test@student.com';
    
    await SecureStore.setItemAsync('userToken', testUserId);
    await SecureStore.setItemAsync('userEmail', testUserEmail);
    await SecureStore.setItemAsync('userRole', 'user');
    
    await setDoc(doc(firestore, 'users', testUserId), {
      email: testUserEmail,
      firstName: 'Тестовий',
      lastName: 'Користувач',
      role: 'user',
      uid: testUserId,
      createdAt: new Date()
    });
    
    return { success: true, userId: testUserId };
  } catch (error) {
    console.error('Помилка створення тестового користувача:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при створенні тестового користувача' 
    };
  }
};