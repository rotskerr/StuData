// Тут буде конфігурація Firebase
// Для імітації роботи з Firebase, створимо заглушки основних функцій

// Імітація автентифікації
export const auth = {
  signInWithEmailAndPassword: async (email, password) => {
    return new Promise((resolve, reject) => {
      // Імітація затримки мережі
      setTimeout(() => {
        if (email && password) {
          resolve({ user: { uid: '123456', email } });
        } else {
          reject(new Error('Невірний email або пароль'));
        }
      }, 1000);
    });
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({ user: { uid: '123456', email } });
        } else {
          reject(new Error('Помилка при створенні користувача'));
        }
      }, 1000);
    });
  },
  
  signOut: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
  
  onAuthStateChanged: (callback) => {
    // Імітація слухача стану автентифікації
    return () => {}; // Функція для відписки від слухача
  }
};

// Імітація Firestore
export const firestore = {
  collection: (collectionName) => {
    return {
      doc: (docId) => {
        return {
          get: async () => {
            return {
              exists: true,
              data: () => {
                // Повертаємо різні дані залежно від колекції
                if (collectionName === 'users') {
                  return {
                    email: 'user@university.edu.ua',
                    faculty: 'Інформаційних технологій',
                    specialty: 'Комп\'ютерні науки',
                    group: 'КН-21'
                  };
                } else if (collectionName === 'tests') {
                  return {
                    title: 'Тест з React Native',
                    questions: []
                  };
                }
                return {};
              }
            };
          },
          set: async (data) => {
            return Promise.resolve();
          },
          update: async (data) => {
            return Promise.resolve();
          }
        };
      },
      add: async (data) => {
        return Promise.resolve({ id: '123456' });
      },
      where: () => {
        return {
          get: async () => {
            return {
              docs: [
                {
                  id: '1',
                  data: () => ({
                    title: 'Тест 1',
                    description: 'Опис тесту 1'
                  })
                },
                {
                  id: '2',
                  data: () => ({
                    title: 'Тест 2',
                    description: 'Опис тесту 2'
                  })
                }
              ]
            };
          }
        };
      }
    };
  }
};

// Імітація Storage
export const storage = {
  ref: (path) => {
    return {
      put: async (file) => {
        return Promise.resolve();
      },
      getDownloadURL: async () => {
        return Promise.resolve('https://example.com/image.jpg');
      }
    };
  }
};

export default {
  auth,
  firestore,
  storage
}; 