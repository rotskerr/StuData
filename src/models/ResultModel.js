/**
 * Модель для результатів тестів
 */

// Статуси результатів
export const RESULT_STATUSES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  EXPIRED: 'expired',
};

/**
 * Створює новий результат тесту
 * @param {Object} data - Дані результату
 * @returns {Object} - Об'єкт результату
 */
export const createResult = (data = {}) => {
  return {
    id: data.id || generateId(),
    testId: data.testId || null,
    userId: data.userId || null,
    answers: data.answers || [],
    score: data.score || null,
    maxScore: data.maxScore || null,
    percentage: data.percentage || null,
    status: data.status || RESULT_STATUSES.IN_PROGRESS,
    startedAt: data.startedAt || new Date().toISOString(),
    completedAt: data.completedAt || null,
    timeSpent: data.timeSpent || null, // в секундах
  };
};

/**
 * Створює нову відповідь
 * @param {Object} data - Дані відповіді
 * @returns {Object} - Об'єкт відповіді
 */
export const createAnswer = (data = {}) => {
  return {
    questionId: data.questionId || null,
    answer: data.answer || null, // для single і text
    answers: data.answers || [], // для multiple
    isCorrect: data.isCorrect || false,
    points: data.points || 0,
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
 * Обчислює результат тесту
 * @param {Object} test - Об'єкт тесту
 * @param {Array} answers - Масив відповідей
 * @returns {Object} - Об'єкт з результатами
 */
export const calculateTestResult = (test, answers) => {
  if (!test || !test.questions || !answers) {
    return {
      score: 0,
      maxScore: 0,
      percentage: 0,
    };
  }

  let score = 0;
  let maxScore = 0;

  // Обчислюємо максимальний бал за тест
  test.questions.forEach(question => {
    if (question.points) {
      maxScore += question.points;
    } else {
      maxScore += 1; // За замовчуванням 1 бал за питання
    }
  });

  // Обчислюємо набраний бал
  answers.forEach(answer => {
    if (answer.isCorrect) {
      score += answer.points || 0;
    }
  });

  // Обчислюємо відсоток
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return {
    score,
    maxScore,
    percentage: Math.round(percentage * 100) / 100, // Округлюємо до 2 знаків після коми
  };
};

/**
 * Перевіряє, чи є результат завершеним
 * @param {Object} result - Об'єкт результату
 * @returns {boolean} - true, якщо результат завершений
 */
export const isCompleted = (result) => {
  return result && result.status === RESULT_STATUSES.COMPLETED;
};

/**
 * Перевіряє, чи є результат в процесі
 * @param {Object} result - Об'єкт результату
 * @returns {boolean} - true, якщо результат в процесі
 */
export const isInProgress = (result) => {
  return result && result.status === RESULT_STATUSES.IN_PROGRESS;
};

/**
 * Перевіряє, чи є результат простроченим
 * @param {Object} result - Об'єкт результату
 * @returns {boolean} - true, якщо результат прострочений
 */
export const isExpired = (result) => {
  return result && result.status === RESULT_STATUSES.EXPIRED;
}; 