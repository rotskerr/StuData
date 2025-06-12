import * as SecureStore from 'expo-secure-store';
import { firestore } from '../config/firebase';

// Приклади тестів
const mockTests = [
  {
    id: '1',
    title: 'Основи React Native',
    description: 'Тест для перевірки знань з основ React Native',
    type: 'test',
    questions: 10,
    timeLimit: 20, // хвилин
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

// Функція для отримання доступних тестів для користувача
export const getAvailableTests = async () => {
  try {
    // Отримання даних користувача
    const faculty = await SecureStore.getItemAsync('userFaculty');
    const specialty = await SecureStore.getItemAsync('userSpecialty');
    const group = await SecureStore.getItemAsync('userGroup');
    
    // В реальному додатку тут буде запит до Firestore
    // const snapshot = await firestore.collection('tests')
    //   .where('availableFor.faculty', '==', faculty)
    //   .get();
    
    // Фільтрація тестів для користувача
    let availableTests = [...mockTests];
    
    if (faculty) {
      availableTests = availableTests.filter(test => {
        const { faculty: testFaculty, specialty: testSpecialty, group: testGroup } = test.availableFor;
        
        // Перевірка на відповідність факультету
        if (testFaculty && testFaculty !== faculty) {
          return false;
        }
        
        // Перевірка на відповідність спеціальності, якщо вона вказана
        if (testSpecialty && testSpecialty !== specialty) {
          return false;
        }
        
        // Перевірка на відповідність групи, якщо вона вказана
        if (testGroup && testGroup !== group) {
          return false;
        }
        
        return true;
      });
    }
    
    return { success: true, tests: availableTests };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при отриманні тестів', 
      tests: [] 
    };
  }
};

// Функція для отримання деталей тесту за ID
export const getTestById = async (testId) => {
  try {
    // В реальному додатку тут буде запит до Firestore
    // const doc = await firestore.collection('tests').doc(testId).get();
    
    // Пошук тесту за ID
    const test = mockTests.find(test => test.id === testId);
    
    if (!test) {
      return { success: false, error: 'Тест не знайдено' };
    }
    
    // Приклад питань для тесту
    const questions = [
      {
        id: '1',
        text: 'Що таке React Native?',
        type: 'single',
        options: [
          { id: 'a', text: 'Фреймворк для розробки веб-додатків' },
          { id: 'b', text: 'Фреймворк для розробки мобільних додатків' },
          { id: 'c', text: 'Бібліотека для роботи з даними' },
          { id: 'd', text: 'Мова програмування' }
        ],
        correctAnswer: 'b'
      },
      {
        id: '2',
        text: 'Які компоненти є базовими в React Native?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'View' },
          { id: 'b', text: 'Text' },
          { id: 'c', text: 'Div' },
          { id: 'd', text: 'Image' }
        ],
        correctAnswers: ['a', 'b', 'd']
      },
      {
        id: '3',
        text: 'Опишіть ваш досвід використання React Native:',
        type: 'text',
        correctAnswer: null
      }
    ];
    
    return { 
      success: true, 
      test: { ...test, questions } 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при отриманні тесту' 
    };
  }
};

// Функція для збереження результатів тесту
export const saveTestResult = async (testId, answers) => {
  try {
    const userEmail = await SecureStore.getItemAsync('userEmail');
    
    // В реальному додатку тут буде запис у Firestore
    // await firestore.collection('results').add({
    //   testId,
    //   userEmail,
    //   answers,
    //   completedAt: new Date()
    // });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Помилка при збереженні результатів' 
    };
  }
}; 