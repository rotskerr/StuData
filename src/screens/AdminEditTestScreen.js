import React, { useState, useEffect, useCallback } from 'react';
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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TestAvailabilitySelector from '../components/TestAvailabilitySelector';
import { createTest, updateTest, getTestById } from '../services/testService';

const AdminEditTestScreen = ({ route, navigation }) => {
  const { testId, isNew } = route.params || { testId: null, isNew: true };
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState('test'); // 'test' або 'survey'
  const [timeLimit, setTimeLimit] = useState('30'); // в хвилинах
  const [isActive, setIsActive] = useState(true);
  const [availability, setAvailability] = useState({ type: 'all' });
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

  useEffect(() => {
    if (!isNew && testId) {
      loadTestData();
    }
  }, [isNew, testId]);

  const handleAvailabilityChange = useCallback((availabilityData) => {
    setAvailability(availabilityData);
  }, []);

  const loadTestData = async () => {
    setIsLoading(true);
    
    try {
      const testData = await getTestById(testId);
      
      if (testData) {
        setTitle(testData.title || '');
        setDescription(testData.description || '');
        setTestType(testData.type || 'test');
        setTimeLimit(testData.timeLimit?.toString() || '30');
        setIsActive(testData.isActive !== false);
        setAvailability(testData.availability || { type: 'all' });
        
        if (testData.questions && testData.questions.length > 0) {
          setQuestions(testData.questions);
        }
      }
    } catch (error) {
      console.error('Помилка завантаження тесту:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані тесту');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTest = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', 'Будь ласка, введіть назву тесту');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text.trim()) {
        Alert.alert('Помилка', `Питання ${i + 1} не має тексту`);
        return;
      }

      if (question.type === 'single' || question.type === 'multiple') {
        if (question.options.length < 2) {
          Alert.alert('Помилка', `Питання ${i + 1} повинно мати мінімум 2 варіанти відповіді`);
          return;
        }

        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text.trim()) {
            Alert.alert('Помилка', `Варіант ${j + 1} питання ${i + 1} не має тексту`);
            return;
          }
        }

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

    try {
      const testData = {
        title,
        description,
        type: testType,
        timeLimit: parseInt(timeLimit, 10),
        isActive,
        availability,
        questions,
      };
      
      if (isNew) {
        const newTestId = await createTest(testData);
        Alert.alert('Успіх', 'Тест успішно створено', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await updateTest(testId, testData);
        Alert.alert('Успіх', 'Тест успішно оновлено', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Помилка збереження тесту:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти тест');
    } finally {
      setIsSaving(false);
    }
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
          if (type === 'text') {
            return {
              ...q,
              type,
              options: [],
              correctAnswer: ''
            };
          }
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
          if (q.type === 'single') {
            return {
              ...q,
              options: q.options.map(opt => 
                opt.id === optionId ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }
              )
            };
          }
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isNew ? 'Новий тест' : 'Редагування тесту'}
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveTest}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Зберегти</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Загальна інформація</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Назва тесту:</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Введіть назву тесту"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Опис:</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Введіть опис тесту"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Тип:</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeSelectorButton,
                    testType === 'test' && styles.typeButtonActive
                  ]}
                  onPress={() => setTestType('test')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      testType === 'test' && styles.typeButtonTextActive
                    ]}
                  >
                    Тест
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeSelectorButton,
                    testType === 'survey' && styles.typeButtonActive
                  ]}
                  onPress={() => setTestType('survey')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      testType === 'survey' && styles.typeButtonTextActive
                    ]}
                  >
                    Опитування
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {testType === 'test' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Обмеження часу (хв):</Text>
                <TextInput
                  style={[styles.textInput, styles.numberInput]}
                  value={timeLimit}
                  onChangeText={setTimeLimit}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Активний:</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#d1d1d1', true: '#4285F4' }}
                thumbColor={isActive ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#d1d1d1"
              />
            </View>
            
            {/* Компонент вибору доступності тесту */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Доступність:</Text>
              <TestAvailabilitySelector 
                onAvailabilityChange={handleAvailabilityChange}
                initialValue={availability}
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
              <Ionicons name="add-circle" size={20} color="#4285F4" />
              <Text style={styles.addQuestionButtonText}>Додати питання</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4285F4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 15,
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
    backgroundColor: '#34A853',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d1d1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
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
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  numberInput: {
    width: '100%',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeSelectorButton: {
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4285F4',
  },
  typeButtonText: {
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
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
  typeButtonSelected: {
    backgroundColor: '#4285F4',
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
  addQuestionButtonText: {
    marginLeft: 8,
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminEditTestScreen; 