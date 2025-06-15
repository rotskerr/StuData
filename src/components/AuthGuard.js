import React, { useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';
const AuthGuard = ({ children, requiredRole = null }) => {
  const { checkLoginStatus } = useContext(NavigationContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        const userRole = await SecureStore.getItemAsync('userRole');

        if (!userToken) {
          if (checkLoginStatus) {
            await checkLoginStatus();
          }
          return;
        }

        if (requiredRole && userRole !== requiredRole) {
          Alert.alert(
            'Недостатньо прав',
            'У вас немає прав доступу до цього розділу',
            [
              {
                text: 'OK',
                onPress: async () => {
                  if (checkLoginStatus) {
                    await checkLoginStatus();
                  }
                }
              }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('AuthGuard: Помилка перевірки авторизації:', error);
        if (checkLoginStatus) {
          await checkLoginStatus();
        }
      }
    };

    checkAuth();
  }, [requiredRole, checkLoginStatus]);

  return children;
};

export default AuthGuard; 