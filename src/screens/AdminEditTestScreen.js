import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  Switch,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminEditTestScreen = ({ route, navigation }) => {
  const { testId, isNew } = route.params || { testId: null, isNew: true };
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  // Дані тесту
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState('test'); // 'test' або 'survey'
  const [timeLimit, setTimeLimit] = useState('30'); // в хвилинах
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState([
    {
      id: '1',
      text: '',
      type: 'single', // 'single', 'multiple', 'text'
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ],
      correctAnswer: ''
    }
  ]);

  // Завантаження даних тесту, якщо це редагування
  useEffect(() => {
    if (!isNew && testId) {
      loadTestData();
    }
  }, [isNew, testId]);

  const loadTestData = async () => {
    setIsLoading(true);
    
    // Симуляція завантаження даних з сервера
    setTimeout(() => {
      // Приклад даних тесту
      if (testId === '1') {
        setTitle('Основи React Native');
        setDescription('Тест для перевірки базових знань з React Native');
        setTestType('test');
        setTimeLimit('30');
        setIsActive(true);
        setQuestions([
          {
            id: '1',
            text: 'Що таке React Native?',
            type: 'single',
            options: [
              { id: '1', text: 'Фреймворк для створення мобільних додатків', isCorrect: true },
              { id: '2', text: 'Бібліотека для роботи з базами даних', isCorrect: false },
              { id: '3', text: 'Серверна технологія для обробки запитів', isCorrect: false }
            ],
            correctAnswer: ''
          },
          {
            id: '2',
            text: 'Які компоненти є базовими в React Native?',
            type: 'multiple',
            options: [
              { id: '1', text: 'View', isCorrect: true },
              { id: '2', text: 'Text', isCorrect: true },
              { id: '3', text: 'Div', isCorrect: false },
              { id: '4', text: 'Image', isCorrect: true }
            ],
            correctAnswer: ''
          },
          {
            id: '3',
            text: 'Опишіть, як працює механізм віртуального DOM в React?',
            type: 'text',
            options: [],
            correctAnswer: 'Віртуальний DOM - це легка копія реального DOM, яка дозволяє React ефективно оновлювати інтерфейс.'
          }
        ]);
      } else {
        // Якщо тест не знайдено, встановлюємо значення за замовчуванням
        setTitle('');
        setDescription('');
        setTestType('test');
        setTimeLimit('30');
        setIsActive(true);
        setQuestions([
          {
            id: '1',
            text: '',
            type: 'single',
            options: [
              { id: '1', text: '', isCorrect: false },
              { id: '2', text: '', isCorrect: false }
            ],
            correctAnswer: ''
          }
        ]);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveTest = async () => {
    // Перевірка на заповненість обов'язкових полів
    if (!title.trim()) {
      Alert.alert('Помилка', 'Будь ласка, введіть назву тесту');
      return;
    }

    // Перевірка питань
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text.trim()) {
        Alert.alert('Помилка', `Питання ${i + 1} не має тексту`);
        return;
      }

      if (question.type === 'single' || question.type === 'multiple') {
        // Перевірка варіантів відповідей
        if (question.options.length < 2) {
          Alert.alert('Помилка', `Питання ${i + 1} повинно мати мінімум 2 варіанти відповіді`);
          return;
        }

        // Перевірка заповненості варіантів
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text.trim()) {
            Alert.alert('Помилка', `Варіант ${j + 1} питання ${i + 1} не має тексту`);
            return;
          }
        }

        // Перевірка наявності правильної відповіді
        if (question.type === 'single' && !question.options.some(opt => opt.isCorrect)) {
          Alert.alert('Помилка', `Питання ${i + 1} не має правильної відповіді`);
          return;
        }

        if (question.type === 'multiple' && !question.options.some(opt => opt.isCorrect)) {
          Alert.alert('Помилка', `Питання ${i + 1} не має жодної правильної відповіді`);
          return;
        }
      } else if (question.type === 'text' && !question.correctAnswer.trim()) {
        Alert.alert('Помилка', `Питання ${i + 1} не має правильної відповіді`);
        return;
      }
    }

    setIsSaving(true);

    // Симуляція збереження даних
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Успіх', 
        isNew ? 'Тест успішно створено' : 'Тест успішно оновлено',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    }, 1000);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      type: 'single',
      options: [
        { id: Date.now().toString() + '1', text: '', isCorrect: false },
        { id: Date.now().toString() + '2', text: '', isCorrect: false }
      ],
      correctAnswer: ''
    };

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId) => {
    if (questions.length <= 1) {
      Alert.alert('Помилка', 'Тест повинен мати хоча б одне питання');
      return;
    }

    Alert.alert(
      'Видалення питання',
      'Ви впевнені, що хочете видалити це питання?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            setQuestions(questions.filter(q => q.id !== questionId));
          }
        }
      ]
    );
  };

  const updateQuestionText = (questionId, text) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, text } : q
      )
    );
  };

  const updateQuestionType = (questionId, type) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          // Якщо змінюємо тип на текстовий, видаляємо варіанти
          if (type === 'text') {
            return {
              ...q,
              type,
              options: [],
              correctAnswer: ''
            };
          }
          // Якщо змінюємо тип на одиночний або множинний вибір, додаємо варіанти
          else if (q.type === 'text') {
            return {
              ...q,
              type,
              options: [
                { id: Date.now().toString() + '1', text: '', isCorrect: false },
                { id: Date.now().toString() + '2', text: '', isCorrect: false }
              ],
              correctAnswer: ''
            };
          }
          // Якщо змінюємо між одиночним і множинним, залишаємо варіанти
          return { ...q, type };
        }
        return q;
      })
    );
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: Date.now().toString(), text: '', isCorrect: false }
            ]
          };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId, optionId) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          if (q.options.length <= 2) {
            Alert.alert('Помилка', 'Питання повинно мати мінімум 2 варіанти відповіді');
            return q;
          }
          return {
            ...q,
            options: q.options.filter(opt => opt.id !== optionId)
          };
        }
        return q;
      })
    );
  };

  const updateOptionText = (questionId, optionId, text) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, text } : opt
            )
          };
        }
        return q;
      })
    );
  };

  const toggleOptionCorrect = (questionId, optionId) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          // Для одиночного вибору робимо тільки один варіант правильним
          if (q.type === 'single') {
            return {
              ...q,
              options: q.options.map(opt => 
                opt.id === optionId ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }
              )
            };
          }
          // Для множинного вибору перемикаємо стан
          else {
            return {
              ...q,
              options: q.options.map(opt => 
                opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
              )
            };
          }
        }
        return q;
      })
    );
  };

  const updateCorrectAnswer = (questionId, correctAnswer) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, correctAnswer } : q
      )
    );
  };

  // Рендер варіанта відповіді
  const renderOption = (question, option, index) => {
    return (
      <View key={option.id} style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionCheckbox,
            question.type === 'multiple' ? styles.checkboxSquare : styles.checkboxCircle,
            option.isCorrect && styles.checkboxSelected
          ]}
          onPress={() => toggleOptionCorrect(question.id, option.id)}
        >
          {option.isCorrect && (
            <Ionicons 
              name={question.type === 'multiple' ? 'checkmark' : 'checkmark'} 
              size={16} 
              color="#fff" 
            />
          )}
        </TouchableOpacity>
        
        <TextInput
          style={styles.optionInput}
          placeholder={`Варіант ${index + 1}`}
          value={option.text}
          onChangeText={(text) => updateOptionText(question.id, option.id, text)}
        />
        
        <TouchableOpacity
          style={styles.removeOptionButton}
          onPress={() => removeOption(question.id, option.id)}
        >
          <Ionicons name="close-circle" size={22} color="#DB4437" />
        </TouchableOpacity>
      </View>
    );
  };

  // Рендер питання
  const renderQuestion = (question, index) => {
    return (
      <View key={question.id} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Питання {index + 1}</Text>
          <TouchableOpacity
            style={styles.removeQuestionButton}
            onPress={() => removeQuestion(question.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#DB4437" />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.questionInput}
          placeholder="Текст питання"
          value={question.text}
          onChangeText={(text) => updateQuestionText(question.id, text)}
          multiline
        />
        
        <View style={styles.questionTypeContainer}>
          <Text style={styles.questionTypeLabel}>Тип питання:</Text>
          <View style={styles.questionTypeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                question.type === 'single' && styles.typeButtonSelected
              ]}
              onPress={() => updateQuestionType(question.id, 'single')}
            >
              <Text 
                style={[
                  styles.typeButtonText,
                  question.type === 'single' && styles.typeButtonTextSelected
                ]}
              >
                Одиночний вибір
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                question.type === 'multiple' && styles.typeButtonSelected
              ]}
              onPress={() => updateQuestionType(question.id, 'multiple')}
            >
              <Text 
                style={[
                  styles.typeButtonText,
                  question.type === 'multiple' && styles.typeButtonTextSelected
                ]}
              >
                Множинний вибір
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                question.type === 'text' && styles.typeButtonSelected
              ]}
              onPress={() => updateQuestionType(question.id, 'text')}
            >
              <Text 
                style={[
                  styles.typeButtonText,
                  question.type === 'text' && styles.typeButtonTextSelected
                ]}
              >
                Текстова відповідь
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Варіанти відповідей або текстова відповідь */}
        {question.type === 'text' ? (
          <View style={styles.textAnswerContainer}>
            <Text style={styles.textAnswerLabel}>Правильна відповідь:</Text>
            <TextInput
              style={styles.textAnswerInput}
              placeholder="Введіть правильну відповідь"
              value={question.correctAnswer}
              onChangeText={(text) => updateCorrectAnswer(question.id, text)}
              multiline
            />
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsLabel}>
              Варіанти відповідей 
              {question.type === 'single' 
                ? ' (виберіть один правильний)' 
                : ' (виберіть один або більше правильних)'}:
            </Text>
            
            {question.options.map((option, optIndex) => 
              renderOption(question, option, optIndex)
            )}
            
            <TouchableOpacity
              style={styles.addOptionButton}
              onPress={() => addOption(question.id)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4285F4" />
              <Text style={styles.addOptionText}>Додати варіант</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження тесту...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? 'Створення тесту' : 'Редагування тесту'}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveTest}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Основна інформація</Text>
          
          <Text style={styles.inputLabel}>Назва тесту</Text>
          <TextInput
            style={styles.input}
            placeholder="Введіть назву тесту"
            value={title}
            onChangeText={setTitle}
          />
          
          <Text style={styles.inputLabel}>Опис тесту</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Введіть опис тесту"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Тип</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    testType === 'test' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setTestType('test')}
                >
                  <Text 
                    style={[
                      styles.pickerButtonText,
                      testType === 'test' && styles.pickerButtonTextSelected
                    ]}
                  >
                    Тест
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    testType === 'survey' && styles.pickerButtonSelected
                  ]}
                  onPress={() => setTestType('survey')}
                >
                  <Text 
                    style={[
                      styles.pickerButtonText,
                      testType === 'survey' && styles.pickerButtonTextSelected
                    ]}
                  >
                    Опитування
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Час (хв)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                value={timeLimit}
                onChangeText={setTimeLimit}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Активний</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#ccc', true: '#4285F460' }}
              thumbColor={isActive ? '#4285F4' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Питання</Text>
          
          {questions.map((question, index) => renderQuestion(question, index))}
          
          <TouchableOpacity
            style={styles.addQuestionButton}
            onPress={addQuestion}
          >
            <Ionicons name="add-circle" size={24} color="#4285F4" />
            <Text style={styles.addQuestionText}>Додати питання</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formSection: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  pickerButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerButtonSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  pickerButtonText: {
    color: '#666',
  },
  pickerButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#666',
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  removeQuestionButton: {
    padding: 5,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  questionTypeContainer: {
    marginBottom: 15,
  },
  questionTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  questionTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  typeButtonSelected: {
    backgroundColor: '#4285F4',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxCircle: {
    borderRadius: 12,
    borderColor: '#4285F4',
  },
  checkboxSquare: {
    borderRadius: 4,
    borderColor: '#4285F4',
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  removeOptionButton: {
    padding: 5,
    marginLeft: 5,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addOptionText: {
    marginLeft: 5,
    color: '#4285F4',
    fontSize: 16,
  },
  textAnswerContainer: {
    marginBottom: 10,
  },
  textAnswerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  textAnswerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  addQuestionText: {
    marginLeft: 8,
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminEditTestScreen; 