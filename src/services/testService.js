import * as SecureStore from 'expo-secure-store';
import { auth, firestore } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const mockTests = [
  {
    id: '1',
    title: 'Основи React Native',
    description: 'Тест для перевірки знань з основ React Native',
    type: 'test',
    questions: 10,
    timeLimit: 20,
    availableFor: {
      faculty: 'Інформаційних технологій',
      specialty: 'Комп\'ютерні науки',
      group: 'КН-21'
    }
  },
  {
    id: '2',
    title: 'Опитування щодо якості навчання',
    description: 'Анонімне опитування для покращення якості навчального процесу',
    type: 'survey',
    questions: 5,
    availableFor: {
      faculty: 'Інформаційних технологій',
      specialty: null,
      group: null
    }
  },
  {
    id: '3',
    title: 'JavaScript базовий рівень',
    description: 'Перевірка базових знань з JavaScript',
    type: 'test',
    questions: 15,
    timeLimit: 30,
    availableFor: {
      faculty: 'Інформаційних технологій',
      specialty: 'Інженерія програмного забезпечення',
      group: 'ІПЗ-11'
    }
  }
];

const testsCollection = collection(firestore, 'tests');
const userTestsCollection = collection(firestore, 'userTests');

export const getAvailableTests = async () => {
  try {
    let userId = auth.currentUser?.uid;
    let userData = null;
    
    if (userId) {
      // Firebase Auth користувач
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } else {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (!userToken) {
        throw new Error('Користувач не авторизований');
      }
      
      userId = userToken;
      
      try {
        const userDocRef = doc(firestore, 'users', userToken);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      } catch (error) {
      }
      
      if (!userData) {
        const testUsersSnapshot = await getDocs(collection(firestore, 'testUsers'));
        testUsersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.uid === userToken) {
            userData = data;
          }
        });
      }
    }
    
    if (!userData) {
      userData = {}; // Порожній об'єкт для подальшої обробки
    }
    const { facultyId, specialtyId, groupId } = userData;
    
    const querySnapshot = await getDocs(testsCollection);
    const tests = [];
    
    querySnapshot.forEach(documentSnapshot => {
      const testData = documentSnapshot.data();
      const { availability } = testData;
      
      let isAvailable = false;
      
      if (!availability || availability.type === 'all') {
        isAvailable = true;
      } else if (availability.type === 'faculty' && facultyId === availability.facultyId) {
        isAvailable = true;
      } else if (availability.type === 'specialty' && specialtyId === availability.specialtyId) {
        isAvailable = true;
      } else if (availability.type === 'group' && groupId === availability.groupId) {
        isAvailable = true;
      }
      
      if (isAvailable) {
        tests.push({
          id: documentSnapshot.id,
          ...testData
        });
      }
    });
    
    return { success: true, tests };
  } catch (error) {
    console.error('Помилка при отриманні тестів:', error);
    return { 
      success: false, 
      error: error.message || 'Помилка при отриманні тестів', 
      tests: [] 
    };
  }
};

export const getAllTests = async () => {
  try {
    const querySnapshot = await getDocs(testsCollection);
    const tests = [];
    
    querySnapshot.forEach(documentSnapshot => {
      tests.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      });
    });
    
    return tests;
  } catch (error) {
    console.error('Помилка отримання тестів:', error);
    throw error;
  }
};

export const getTestById = async (testId) => {
  try {
    const docRef = doc(firestore, 'tests', testId);
    const documentSnapshot = await getDoc(docRef);
    
    if (documentSnapshot.exists()) {
      return {
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Помилка отримання тесту:', error);
    throw error;
  }
};

export const createTest = async (testData) => {
  try {
    const result = await addDoc(testsCollection, {
      ...testData,
      createdAt: serverTimestamp()
    });
    
    return result.id;
  } catch (error) {
    console.error('Помилка створення тесту:', error);
    throw error;
  }
};

export const updateTest = async (testId, testData) => {
  try {
    const docRef = doc(firestore, 'tests', testId);
    await updateDoc(docRef, {
      ...testData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Помилка оновлення тесту:', error);
    throw error;
  }
};

export const deleteTest = async (testId) => {
  try {
    const docRef = doc(firestore, 'tests', testId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Помилка видалення тесту:', error);
    throw error;
  }
};

export const saveTestResult = async (testId, answers, score, timeSpent = 0) => {
  try {
    
    let userId = auth.currentUser?.uid;
    let userEmail = auth.currentUser?.email;
    
    if (!userId) {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (!userToken) {
        throw new Error('Користувач не авторизований');
      }
      userId = userToken;
      userEmail = await SecureStore.getItemAsync('userEmail');
    }
    
    let userData = {};
    
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } catch (error) {
    }
    
    if (!userData || Object.keys(userData).length === 0) {
      try {
        const testUsersSnapshot = await getDocs(collection(firestore, 'testUsers'));
        testUsersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.uid === userId) {
            userData = data;
          }
        });
      } catch (error) {
      }
    }
    
    let facultyName = '';
    let specialtyName = '';
    let groupName = '';
    
    if (userData.facultyId) {
      try {
        const facultyDoc = await getDoc(doc(firestore, 'faculties', userData.facultyId));
        if (facultyDoc.exists()) {
          facultyName = facultyDoc.data().name;
        }
              } catch (error) {
        }
    }
    
    if (userData.specialtyId) {
      try {
        const specialtyDoc = await getDoc(doc(firestore, 'specialties', userData.specialtyId));
        if (specialtyDoc.exists()) {
          specialtyName = specialtyDoc.data().name;
        }
              } catch (error) {
        }
    }
    
    if (userData.groupId) {
      try {
        const groupDoc = await getDoc(doc(firestore, 'groups', userData.groupId));
        if (groupDoc.exists()) {
          groupName = groupDoc.data().name;
        }
              } catch (error) {
        }
    }
    
    let normalizedAnswers = {};
    
    if (answers === undefined || answers === null) {
      console.warn('Answers is undefined or null, using empty object');
      normalizedAnswers = {};
    } else if (typeof answers !== 'object' || Array.isArray(answers)) {
      console.warn('Answers is not a valid object, converting to empty object:', typeof answers, answers);
      normalizedAnswers = {};
    } else {
      normalizedAnswers = {};
      Object.keys(answers).forEach(key => {
        if (answers[key] !== undefined && answers[key] !== null) {
          normalizedAnswers[key] = answers[key];
        }
      });
    }
    

    
    await addDoc(collection(firestore, 'testResults'), {
      userId,
      testId,
      answers: normalizedAnswers,
      score: score || 0,
      timeSpent: timeSpent || 0,
      completedAt: serverTimestamp(),
      // Інформація про користувача для звітів
      userEmail: userEmail,
      userFacultyId: userData.facultyId || null,
      userFacultyName: facultyName,
      userSpecialtyId: userData.specialtyId || null,
      userSpecialtyName: specialtyName,
      userGroupId: userData.groupId || null,
      userGroupName: groupName
    });
    
    return true;
  } catch (error) {
    console.error('Помилка збереження результатів тесту:', error);
    throw error;
  }
};

export const getUserTestResults = async () => {
  try {
    let userId = auth.currentUser?.uid;
    
    if (!userId) {
      const userToken = await SecureStore.getItemAsync('userToken');
          if (!userToken) {
      return [];
      }
      userId = userToken;
    }
    
    const q = query(
      collection(firestore, 'testResults'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach(documentSnapshot => {
      const data = documentSnapshot.data();
      results.push({
        id: documentSnapshot.id,
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt
      });
    });
    
    results.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
      return dateB - dateA;
    });
    
    return results;
  } catch (error) {
    console.error('Помилка отримання результатів тестів користувача:', error);
    return []; // Повертаємо порожній масив замість помилки
  }
};

export const getTestStatistics = async (testId) => {
  try {
    const q = query(
      userTestsCollection,
      where('testId', '==', testId)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    let totalScore = 0;
    
    querySnapshot.forEach(documentSnapshot => {
      const data = documentSnapshot.data();
      results.push({
        id: documentSnapshot.id,
        ...data
      });
      
      totalScore += data.score || 0;
    });
    
    const averageScore = results.length > 0 ? totalScore / results.length : 0;
    
    return {
      totalAttempts: results.length,
      averageScore,
      results
    };
  } catch (error) {
    console.error('Помилка отримання статистики тесту:', error);
    throw error;
  }
}; 