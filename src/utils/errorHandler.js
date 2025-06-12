/**
 * Утиліти для обробки помилок
 */

// Типи помилок
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

// Коди помилок
export const ERROR_CODES = {
  // Мережеві помилки
  NETWORK_OFFLINE: 'network_offline',
  TIMEOUT: 'timeout',
  
  // Помилки авторизації
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_ALREADY_EXISTS: 'email_already_exists',
  WEAK_PASSWORD: 'weak_password',
  UNAUTHORIZED: 'unauthorized',
  
  // Помилки валідації
  INVALID_INPUT: 'invalid_input',
  REQUIRED_FIELD: 'required_field',
  
  // Серверні помилки
  SERVER_ERROR: 'server_error',
  NOT_FOUND: 'not_found',
  
  // Інші помилки
  UNKNOWN_ERROR: 'unknown_error',
};

/**
 * Обробляє помилку та повертає структурований об'єкт помилки
 * @param {Error|Object} error - Об'єкт помилки
 * @returns {Object} - Структурований об'єкт помилки
 */
export const handleError = (error) => {
  // Базова структура помилки
  const errorObject = {
    type: ERROR_TYPES.UNKNOWN,
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'Сталася невідома помилка',
    originalError: error,
  };
  
  // Якщо помилка вже оброблена, повертаємо її
  if (error && error.type && error.code) {
    return error;
  }
  
  // Обробка мережевих помилок
  if (error && error.message && (
    error.message.includes('Network') || 
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('offline')
  )) {
    errorObject.type = ERROR_TYPES.NETWORK;
    errorObject.code = ERROR_CODES.NETWORK_OFFLINE;
    errorObject.message = 'Помилка мережі. Перевірте підключення до інтернету';
    return errorObject;
  }
  
  // Обробка помилок Firebase Auth
  if (error && error.code) {
    // Помилки авторизації
    if (error.code.includes('auth')) {
      errorObject.type = ERROR_TYPES.AUTH;
      
      if (error.code.includes('user-not-found')) {
        errorObject.code = ERROR_CODES.USER_NOT_FOUND;
        errorObject.message = 'Користувача з таким email не знайдено';
      } else if (error.code.includes('wrong-password')) {
        errorObject.code = ERROR_CODES.INVALID_CREDENTIALS;
        errorObject.message = 'Невірний пароль';
      } else if (error.code.includes('email-already-in-use')) {
        errorObject.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
        errorObject.message = 'Користувач з таким email вже існує';
      } else if (error.code.includes('weak-password')) {
        errorObject.code = ERROR_CODES.WEAK_PASSWORD;
        errorObject.message = 'Пароль занадто слабкий';
      } else if (error.code.includes('requires-recent-login')) {
        errorObject.code = ERROR_CODES.UNAUTHORIZED;
        errorObject.message = 'Для цієї дії потрібно повторно увійти в систему';
      } else {
        errorObject.code = ERROR_CODES.UNKNOWN_ERROR;
        errorObject.message = error.message || 'Помилка авторизації';
      }
      
      return errorObject;
    }
    
    // Інші помилки Firebase
    if (error.code.includes('firestore') || error.code.includes('storage')) {
      errorObject.type = ERROR_TYPES.SERVER;
      errorObject.code = ERROR_CODES.SERVER_ERROR;
      errorObject.message = error.message || 'Помилка сервера';
      return errorObject;
    }
  }
  
  // Обробка серверних помилок по статус-коду
  if (error && error.response && error.response.status) {
    errorObject.type = ERROR_TYPES.SERVER;
    
    switch (error.response.status) {
      case 400:
        errorObject.code = ERROR_CODES.INVALID_INPUT;
        errorObject.message = 'Невірні дані запиту';
        break;
      case 401:
        errorObject.type = ERROR_TYPES.AUTH;
        errorObject.code = ERROR_CODES.UNAUTHORIZED;
        errorObject.message = 'Необхідно авторизуватися';
        break;
      case 403:
        errorObject.type = ERROR_TYPES.AUTH;
        errorObject.code = ERROR_CODES.UNAUTHORIZED;
        errorObject.message = 'Доступ заборонено';
        break;
      case 404:
        errorObject.code = ERROR_CODES.NOT_FOUND;
        errorObject.message = 'Ресурс не знайдено';
        break;
      case 500:
      case 502:
      case 503:
        errorObject.code = ERROR_CODES.SERVER_ERROR;
        errorObject.message = 'Помилка сервера';
        break;
      default:
        errorObject.code = ERROR_CODES.UNKNOWN_ERROR;
        errorObject.message = error.message || 'Сталася помилка';
    }
    
    return errorObject;
  }
  
  // Якщо помилка має повідомлення, використовуємо його
  if (error && error.message) {
    errorObject.message = error.message;
  }
  
  return errorObject;
};

/**
 * Показує повідомлення про помилку користувачу
 * @param {Object} error - Об'єкт помилки
 * @param {Function} alertFunction - Функція для відображення повідомлення
 */
export const showErrorMessage = (error, alertFunction) => {
  const processedError = handleError(error);
  
  if (alertFunction && typeof alertFunction === 'function') {
    alertFunction('Помилка', processedError.message);
  } else {
    console.error('Помилка:', processedError.message);
  }
};

/**
 * Логує помилку в консоль або сервіс логування
 * @param {Object} error - Об'єкт помилки
 * @param {string} context - Контекст, в якому сталася помилка
 */
export const logError = (error, context = '') => {
  const processedError = handleError(error);
  
  console.error(
    `[${context}] Помилка (${processedError.type}:${processedError.code}):`, 
    processedError.message, 
    processedError.originalError
  );
  
  // Тут можна додати логування в зовнішній сервіс, наприклад Firebase Crashlytics
};

export default {
  ERROR_TYPES,
  ERROR_CODES,
  handleError,
  showErrorMessage,
  logError,
}; 