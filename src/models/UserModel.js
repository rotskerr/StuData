/**
 * Модель для користувачів
 */

// Ролі користувачів
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  TEACHER: 'teacher',
};

// Статуси користувачів
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

/**
 * Створює нового користувача
 * @param {Object} data - Дані користувача
 * @returns {Object} - Об'єкт користувача
 */
export const createUser = (data = {}) => {
  return {
    id: data.id || generateId(),
    email: data.email || '',
    role: data.role || USER_ROLES.USER,
    status: data.status || USER_STATUSES.ACTIVE,
    faculty: data.faculty || null,
    specialty: data.specialty || null,
    group: data.group || null,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    createdAt: data.createdAt || new Date().toISOString(),
    lastLoginAt: data.lastLoginAt || null,
  };
};

/**
 * Генерує унікальний ID
 * @returns {string} - Унікальний ID
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Валідує користувача
 * @param {Object} user - Об'єкт користувача
 * @returns {Object} - Результат валідації {isValid, errors}
 */
export const validateUser = (user) => {
  const errors = {};
  
  if (!user.email || user.email.trim() === '') {
    errors.email = 'Email обов\'язковий';
  } else if (!isValidEmail(user.email)) {
    errors.email = 'Невірний формат email';
  }
  
  if (user.role === USER_ROLES.USER) {
    if (!user.faculty) {
      errors.faculty = 'Факультет обов\'язковий';
    }
    
    if (!user.specialty) {
      errors.specialty = 'Спеціальність обов\'язкова';
    }
    
    if (!user.group) {
      errors.group = 'Група обов\'язкова';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Перевіряє валідність email
 * @param {string} email - Email для перевірки
 * @returns {boolean} - Результат перевірки
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Перевіряє, чи є користувач адміністратором
 * @param {Object} user - Об'єкт користувача
 * @returns {boolean} - true, якщо користувач адміністратор
 */
export const isAdmin = (user) => {
  return user && user.role === USER_ROLES.ADMIN;
};

/**
 * Перевіряє, чи є користувач викладачем
 * @param {Object} user - Об'єкт користувача
 * @returns {boolean} - true, якщо користувач викладач
 */
export const isTeacher = (user) => {
  return user && user.role === USER_ROLES.TEACHER;
};

/**
 * Перевіряє, чи є користувач активним
 * @param {Object} user - Об'єкт користувача
 * @returns {boolean} - true, якщо користувач активний
 */
export const isActive = (user) => {
  return user && user.status === USER_STATUSES.ACTIVE;
}; 