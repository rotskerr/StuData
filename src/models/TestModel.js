export const TEST_TYPES = {
  TEST: 'test',
  SURVEY: 'survey',
  QUIZ: 'quiz',
};

export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  TEXT: 'text',
  NUMBER: 'number',
  RATING: 'rating',
};

export const TEST_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};
export const createTest = (data = {}) => {
  return {
    id: data.id || generateId(),
    title: data.title || '',
    description: data.description || '',
    type: data.type || TEST_TYPES.TEST,
    status: data.status || TEST_STATUSES.DRAFT,
    questions: data.questions || [],
    timeLimit: data.timeLimit || null, // в хвилинах
    availableFor: data.availableFor || {
      faculty: null,
      specialty: null,
      group: null,
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    createdBy: data.createdBy || null,
  };
};
export const createQuestion = (data = {}) => {
  return {
    id: data.id || generateId(),
    text: data.text || '',
    type: data.type || QUESTION_TYPES.SINGLE,
    options: data.options || [],
    correctAnswer: data.correctAnswer || null,
    correctAnswers: data.correctAnswers || [],
    required: data.required !== undefined ? data.required : true,
    points: data.points || 1,
  };
};
export const createOption = (data = {}) => {
  return {
    id: data.id || generateId(),
    text: data.text || '',
  };
};
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
export const validateTest = (test) => {
  const errors = {};
  
  if (!test.title || test.title.trim() === '') {
    errors.title = 'Назва тесту обов\'язкова';
  }
  
  if (!test.questions || test.questions.length === 0) {
    errors.questions = 'Тест повинен містити хоча б одне питання';
  }
  
  if (test.type === TEST_TYPES.TEST && !test.timeLimit) {
    errors.timeLimit = 'Для тесту необхідно вказати часовий ліміт';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
export const validateQuestion = (question) => {
  const errors = {};
  
  if (!question.text || question.text.trim() === '') {
    errors.text = 'Текст питання обов\'язковий';
  }
  
  if (question.type === QUESTION_TYPES.SINGLE || question.type === QUESTION_TYPES.MULTIPLE) {
    if (!question.options || question.options.length < 2) {
      errors.options = 'Питання повинно містити мінімум 2 варіанти відповіді';
    }
    
    if (question.type === QUESTION_TYPES.SINGLE && !question.correctAnswer) {
      errors.correctAnswer = 'Необхідно вказати правильну відповідь';
    }
    
    if (question.type === QUESTION_TYPES.MULTIPLE && 
        (!question.correctAnswers || question.correctAnswers.length === 0)) {
      errors.correctAnswers = 'Необхідно вказати хоча б одну правильну відповідь';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 