import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Сервіс для роботи з локальним сховищем даних
 */

// Ключі для SecureStore (для чутливих даних)
const SECURE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_EMAIL: 'userEmail',
  USER_ROLE: 'userRole',
  USER_PASSWORD: 'userPassword',
};

// Ключі для AsyncStorage (для некритичних даних)
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  TESTS: 'tests',
  TEST_RESULTS: 'test_results',
  SETTINGS: 'settings',
  CACHE_TIMESTAMP: 'cache_timestamp',
};

/**
 * Зберігає дані в SecureStore
 * @param {string} key - Ключ
 * @param {string} value - Значення
 * @returns {Promise<void>}
 */
export const setSecureItem = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return { success: true };
  } catch (error) {
    console.error('Помилка збереження в SecureStore:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Отримує дані з SecureStore
 * @param {string} key - Ключ
 * @returns {Promise<string|null>} - Значення або null
 */
export const getSecureItem = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error('Помилка отримання з SecureStore:', error);
    return null;
  }
};

/**
 * Видаляє дані з SecureStore
 * @param {string} key - Ключ
 * @returns {Promise<boolean>} - Успішність операції
 */
export const removeSecureItem = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error('Помилка видалення з SecureStore:', error);
    return false;
  }
};

/**
 * Зберігає об'єкт в AsyncStorage
 * @param {string} key - Ключ
 * @param {Object} value - Об'єкт для збереження
 * @returns {Promise<boolean>} - Успішність операції
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Помилка збереження в AsyncStorage:', error);
    return false;
  }
};

/**
 * Отримує об'єкт з AsyncStorage
 * @param {string} key - Ключ
 * @returns {Promise<Object|null>} - Об'єкт або null
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Помилка отримання з AsyncStorage:', error);
    return null;
  }
};

/**
 * Видаляє дані з AsyncStorage
 * @param {string} key - Ключ
 * @returns {Promise<boolean>} - Успішність операції
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Помилка видалення з AsyncStorage:', error);
    return false;
  }
};

/**
 * Очищає всі дані з AsyncStorage
 * @returns {Promise<boolean>} - Успішність операції
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Помилка очищення AsyncStorage:', error);
    return false;
  }
};

/**
 * Зберігає профіль користувача
 * @param {Object} profile - Профіль користувача
 * @returns {Promise<boolean>} - Успішність операції
 */
export const saveUserProfile = async (profile) => {
  return await storeData(STORAGE_KEYS.USER_PROFILE, profile);
};

/**
 * Отримує профіль користувача
 * @returns {Promise<Object|null>} - Профіль користувача або null
 */
export const getUserProfile = async () => {
  return await getData(STORAGE_KEYS.USER_PROFILE);
};

/**
 * Зберігає тести
 * @param {Array} tests - Масив тестів
 * @returns {Promise<boolean>} - Успішність операції
 */
export const saveTests = async (tests) => {
  return await storeData(STORAGE_KEYS.TESTS, tests);
};

/**
 * Отримує тести
 * @returns {Promise<Array|null>} - Масив тестів або null
 */
export const getTests = async () => {
  return await getData(STORAGE_KEYS.TESTS);
};

/**
 * Зберігає результати тестів
 * @param {Array} results - Масив результатів
 * @returns {Promise<boolean>} - Успішність операції
 */
export const saveTestResults = async (results) => {
  return await storeData(STORAGE_KEYS.TEST_RESULTS, results);
};

/**
 * Отримує результати тестів
 * @returns {Promise<Array|null>} - Масив результатів або null
 */
export const getTestResults = async () => {
  return await getData(STORAGE_KEYS.TEST_RESULTS);
};

/**
 * Зберігає налаштування
 * @param {Object} settings - Об'єкт налаштувань
 * @returns {Promise<boolean>} - Успішність операції
 */
export const saveSettings = async (settings) => {
  return await storeData(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Отримує налаштування
 * @returns {Promise<Object|null>} - Об'єкт налаштувань або null
 */
export const getSettings = async () => {
  return await getData(STORAGE_KEYS.SETTINGS);
};

/**
 * Оновлює часову мітку кешу
 * @returns {Promise<boolean>} - Успішність операції
 */
export const updateCacheTimestamp = async () => {
  return await storeData(STORAGE_KEYS.CACHE_TIMESTAMP, { timestamp: Date.now() });
};

/**
 * Отримує часову мітку кешу
 * @returns {Promise<number|null>} - Часова мітка або null
 */
export const getCacheTimestamp = async () => {
  const data = await getData(STORAGE_KEYS.CACHE_TIMESTAMP);
  return data ? data.timestamp : null;
};

export default {
  SECURE_KEYS,
  STORAGE_KEYS,
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  storeData,
  getData,
  removeData,
  clearStorage,
  saveUserProfile,
  getUserProfile,
  saveTests,
  getTests,
  saveTestResults,
  getTestResults,
  saveSettings,
  getSettings,
  updateCacheTimestamp,
  getCacheTimestamp,
}; 