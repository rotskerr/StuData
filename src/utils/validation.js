/**
 * Утиліти для валідації форм
 */

/**
 * Перевіряє, чи не пусте поле
 * @param {string} value - Значення для перевірки
 * @returns {boolean} - true, якщо поле не пусте
 */
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Перевіряє, чи валідний email
 * @param {string} email - Email для перевірки
 * @returns {boolean} - true, якщо email валідний
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Перевіряє, чи валідний університетський email
 * @param {string} email - Email для перевірки
 * @param {string} domain - Домен університету (за замовчуванням university.edu.ua)
 * @returns {boolean} - true, якщо email валідний і належить університету
 */
export const isValidUniversityEmail = (email, domain = 'university.edu.ua') => {
  return isValidEmail(email) && email.endsWith(`@${domain}`);
};

/**
 * Перевіряє, чи валідний пароль (мінімум 8 символів, містить літери та цифри)
 * @param {string} password - Пароль для перевірки
 * @returns {boolean} - true, якщо пароль валідний
 */
export const isValidPassword = (password) => {
  // Мінімум 8 символів, хоча б одна літера та одна цифра
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Перевіряє, чи співпадають паролі
 * @param {string} password - Пароль
 * @param {string} confirmPassword - Підтвердження пароля
 * @returns {boolean} - true, якщо паролі співпадають
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Перевіряє, чи валідний номер телефону
 * @param {string} phone - Номер телефону для перевірки
 * @returns {boolean} - true, якщо номер телефону валідний
 */
export const isValidPhone = (phone) => {
  // Простий регекс для українського номера телефону
  const phoneRegex = /^\+?380\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Валідує форму входу
 * @param {Object} values - Значення форми
 * @returns {Object} - Об'єкт з помилками
 */
export const validateLoginForm = (values) => {
  const errors = {};
  
  if (!isNotEmpty(values.email)) {
    errors.email = 'Email обов\'язковий';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Невірний формат email';
  }
  
  if (!isNotEmpty(values.password)) {
    errors.password = 'Пароль обов\'язковий';
  }
  
  return errors;
};

/**
 * Валідує форму реєстрації
 * @param {Object} values - Значення форми
 * @returns {Object} - Об'єкт з помилками
 */
export const validateRegisterForm = (values) => {
  const errors = {};
  
  if (!isNotEmpty(values.email)) {
    errors.email = 'Email обов\'язковий';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Невірний формат email';
  } else if (!isValidUniversityEmail(values.email)) {
    errors.email = 'Використовуйте університетську пошту';
  }
  
  if (!isNotEmpty(values.password)) {
    errors.password = 'Пароль обов\'язковий';
  } else if (!isValidPassword(values.password)) {
    errors.password = 'Пароль має містити мінімум 8 символів, літери та цифри';
  }
  
  if (!isNotEmpty(values.confirmPassword)) {
    errors.confirmPassword = 'Підтвердження пароля обов\'язкове';
  } else if (!doPasswordsMatch(values.password, values.confirmPassword)) {
    errors.confirmPassword = 'Паролі не співпадають';
  }
  
  return errors;
};

/**
 * Валідує форму профілю
 * @param {Object} values - Значення форми
 * @returns {Object} - Об'єкт з помилками
 */
export const validateProfileForm = (values) => {
  const errors = {};
  
  if (!isNotEmpty(values.faculty)) {
    errors.faculty = 'Факультет обов\'язковий';
  }
  
  if (!isNotEmpty(values.specialty)) {
    errors.specialty = 'Спеціальність обов\'язкова';
  }
  
  if (!isNotEmpty(values.group)) {
    errors.group = 'Група обов\'язкова';
  }
  
  return errors;
};

export default {
  isNotEmpty,
  isValidEmail,
  isValidUniversityEmail,
  isValidPassword,
  doPasswordsMatch,
  isValidPhone,
  validateLoginForm,
  validateRegisterForm,
  validateProfileForm,
}; 