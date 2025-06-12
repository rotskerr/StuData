import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TestDetailScreen = ({ navigation, route }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  
  // Отримуємо параметри з навігації
  const { testId, isReview = false, isPreview = false } = route.params || {};

  // Приклад тесту
  const mockTest = {
    id: '1',
    title: 'Основи React Native',
    description: 'Тест для перевірки знань з основ React Native',
    type: 'test',
    timeLimit: 20, // хвилин
    questions: [
      {
        id: 'q1',
        text: 'Яка компанія розробила React Native?',
        type: 'single', // single, multiple
        options: [
          { id: 'a1', text: 'Google' },
          { id: 'a2', text: 'Facebook (Meta)' },
          { id: 'a3', text: 'Microsoft' },
          { id: 'a4', text: 'Apple' }
        ],
        correctAnswer: 'a2'
      },
      {
        id: 'q2',
        text: 'Які з наступних компонентів є базовими в React Native?',
        type: 'multiple',
        options: [
          { id: 'a1', text: 'View' },
          { id: 'a2', text: 'Text' },
          { id: 'a3', text: 'Div' },
          { id: 'a4', text: 'Image' }
        ],
        correctAnswer: ['a1', 'a2', 'a4']
      },
      {
        id: 'q3',
        text: 'Який хук використовується для зберігання стану компонента?',
        type: 'single',
        options: [
          { id: 'a1', text: 'useEffect' },
          { id: 'a2', text: 'useState' },
          { id: 'a3', text: 'useContext' },
          { id: 'a4', text: 'useReducer' }
        ],
        correctAnswer: 'a2'
      },
      {
        id: 'q4',
        text: 'Який метод життєвого циклу викликається після рендерингу компонента?',
        type: 'single',
        options: [
          { id: 'a1', text: 'componentDidMount' },
          { id: 'a2', text: 'componentWillMount' },
          { id: 'a3', text: 'componentDidUpdate' },
          { id: 'a4', text: 'componentWillUpdate' }
        ],
        correctAnswer: 'a1'
      },
      {
        id: 'q5',
        text: 'Які з цих інструментів можна використовувати для навігації в React Native?',
        type: 'multiple',
        options: [
          { id: 'a1', text: 'React Navigation' },
          { id: 'a2', text: 'React Router' },
          { id: 'a3', text: 'React Native Navigation' },
          { id: 'a4', text: 'React Native Router' }
        ],
        correctAnswer: ['a1', 'a3']
      }
    ]
  };

  useEffect(() => {
    // Завантаження даних тесту
    // В реальному додатку тут буде запит до Firebase
    const loadTestData = async () => {
      try {
        setIsLoading(true);
        
        console.log('Loading test data for testId:', testId);
        
        // Перевіряємо, чи є testId
        if (!testId) {
          console.warn('TestId is missing!');
          Alert.alert('Увага', 'Ідентифікатор тесту відсутній. Будь ласка, спробуйте ще раз.');
          navigation.goBack();
          return;
        }
        
        // Симулюємо завантаження
        setTimeout(() => {
          // В реальному додатку тут буде пошук тесту за testId
          // Зараз просто використовуємо mockTest
          
          // Якщо це режим перегляду завершеного тесту, додаємо відповіді користувача
          if (isReview) {
            // Приклад відповідей користувача для режиму перегляду
            const userAnswers = {
              'q1': 'a2',
              'q2': ['a1', 'a2', 'a4'],
              'q3': 'a2',
              'q4': 'a1',
              'q5': ['a1', 'a3']
            };
            setSelectedAnswers(userAnswers);
            setScore(85); // Приклад результату
            setShowResults(true);
          }
          
          // Якщо це режим попереднього перегляду, показуємо повідомлення
          if (isPreview) {
            // Встановлюємо тестові дані з міткою "очікує"
            const previewTest = {
              ...mockTest,
              status: 'pending',
              dueDate: '2023-06-01'
            };
            setTestData(previewTest);
          } else {
            setTestData(mockTest);
          }
          
          // Встановлюємо таймер тільки якщо це не режим перегляду або попереднього перегляду
          if (!isReview && !isPreview) {
            setTimeLeft(mockTest.timeLimit * 60); // Конвертуємо хвилини в секунди
          } else {
            // Для режимів перегляду встановлюємо фіктивний час
            setTimeLeft(9999);
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Помилка при завантаженні тесту:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити тест');
        navigation.goBack();
      }
    };
    
    loadTestData();
  }, [isReview, isPreview, testId, navigation]);

  // Таймер для тесту
  useEffect(() => {
    if (isLoading || showResults || !testData || isReview || isPreview) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, showResults, testData, isReview, isPreview]);

  // Встановлюємо заголовок екрану
  useEffect(() => {
    if (testData) {
      navigation.setOptions({
        title: `Тест #${testId}: ${testData.title}`
      });
    }
  }, [testData, navigation, testId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerId, isMultiple) => {
    setSelectedAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== answerId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answerId]
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: answerId
        };
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!testData) return 0;
    
    let correctCount = 0;
    
    testData.questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      
      if (!userAnswer) return; // Пропускаємо питання без відповіді
      
      if (question.type === 'multiple') {
        // Для питань з множинним вибором
        const correctAnswers = new Set(question.correctAnswer);
        const userAnswers = new Set(userAnswer);
        
        // Перевіряємо, чи всі відповіді користувача правильні і чи всі правильні відповіді вибрані
        if (correctAnswers.size === userAnswers.size && 
            [...correctAnswers].every(answer => userAnswers.has(answer))) {
          correctCount++;
        }
      } else {
        // Для питань з одиночним вибором
        if (userAnswer === question.correctAnswer) {
          correctCount++;
        }
      }
    });
    
    return Math.round((correctCount / testData.questions.length) * 100);
  };

  const handleFinishTest = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowResults(true);
  };

  const renderQuestion = () => {
    if (!testData || isLoading) return null;
    
    const question = testData.questions[currentQuestionIndex];
    const userAnswer = selectedAnswers[question.id];
    const isAnswered = userAnswer !== undefined;
    const showCorrectAnswer = isReview || isPreview;
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Питання {currentQuestionIndex + 1} з {testData.questions.length}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
        
        <View style={styles.optionsContainer}>
          {question.options.map(option => {
            const isSelected = question.type === 'multiple' 
              ? (userAnswer || []).includes(option.id)
              : userAnswer === option.id;
            
            const isCorrect = question.type === 'multiple'
              ? (question.correctAnswer || []).includes(option.id)
              : question.correctAnswer === option.id;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                  showCorrectAnswer && isCorrect && styles.optionItemCorrect,
                  showCorrectAnswer && isSelected && !isCorrect && styles.optionItemWrong
                ]}
                onPress={() => !isReview && !isPreview && handleAnswerSelect(question.id, option.id, question.type === 'multiple')}
                disabled={isReview || isPreview}
              >
                <View style={[
                  styles.optionCheckbox,
                  question.type === 'multiple' ? styles.checkboxSquare : styles.checkboxCircle,
                  isSelected && styles.checkboxSelected,
                  showCorrectAnswer && isCorrect && styles.checkboxCorrect,
                  showCorrectAnswer && isSelected && !isCorrect && styles.checkboxWrong
                ]}>
                  {isSelected && (
                    <Ionicons 
                      name={question.type === 'multiple' ? "checkmark" : "checkmark-circle"} 
                      size={question.type === 'multiple' ? 14 : 18} 
                      color="#fff" 
                    />
                  )}
                  {showCorrectAnswer && isCorrect && !isSelected && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  showCorrectAnswer && isCorrect && styles.optionTextCorrect,
                  showCorrectAnswer && isSelected && !isCorrect && styles.optionTextWrong
                ]}>
                  {option.text}
                </Text>
                {showCorrectAnswer && (
                  <View style={styles.answerIndicator}>
                    {isCorrect && (
                      <Ionicons name="checkmark-circle" size={20} color="#0F9D58" />
                    )}
                    {isSelected && !isCorrect && (
                      <Ionicons name="close-circle" size={20} color="#DB4437" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (!testData) return null;
    
    let scoreColor = '#DB4437'; // Червоний для поганого результату
    if (score >= 90) scoreColor = '#0F9D58'; // Зелений для відмінного
    else if (score >= 75) scoreColor = '#4285F4'; // Синій для хорошого
    else if (score >= 60) scoreColor = '#F4B400'; // Жовтий для середнього
    
    return (
      <View style={styles.resultsContainer}>
        <Ionicons 
          name={score >= 60 ? "checkmark-circle" : "close-circle"} 
          size={80} 
          color={scoreColor} 
        />
        
        <Text style={styles.resultTitle}>
          {score >= 90 ? 'Відмінно!' : 
           score >= 75 ? 'Добре!' : 
           score >= 60 ? 'Задовільно' : 
           'Потрібно покращити'}
        </Text>
        
        <Text style={[styles.scoreText, { color: scoreColor }]}>
          {score}%
        </Text>
        
        <Text style={styles.resultSummary}>
          Ви відповіли правильно на {Math.round((score / 100) * testData.questions.length)} з {testData.questions.length} питань
        </Text>
        
        <TouchableOpacity 
          style={styles.reviewButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.reviewButtonText}>Повернутися до списку тестів</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConfirmModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Завершити тест?</Text>
          <Text style={styles.modalText}>
            Ви впевнені, що хочете завершити тест? Ви відповіли на {Object.keys(selectedAnswers).length} з {testData?.questions.length} питань.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.modalButtonCancelText}>Скасувати</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={() => {
                setConfirmModalVisible(false);
                handleFinishTest();
              }}
            >
              <Text style={styles.modalButtonConfirmText}>Завершити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      {!showResults ? (
        <>
          <View style={styles.header}>
            <Text style={styles.testTitle}>{testData?.title}</Text>
            <View style={styles.timerContainer}>
              {isPreview ? (
                <Text style={styles.previewText}>Попередній перегляд</Text>
              ) : (
                <>
                  <Ionicons name="time-outline" size={20} color={timeLeft < 60 ? "#DB4437" : "#666"} />
                  <Text style={[
                    styles.timerText,
                    timeLeft < 60 && styles.timerWarning
                  ]}>
                    {formatTime(timeLeft)}
                  </Text>
                </>
              )}
            </View>
          </View>
          
          {isPreview && (
            <View style={styles.previewBanner}>
              <Ionicons name="time" size={20} color="#F4B400" />
              <Text style={styles.previewBannerText}>
                Цей тест буде доступний пізніше. Зараз ви можете переглянути питання без можливості відправити відповіді.
              </Text>
            </View>
          )}
          
          <ScrollView style={styles.content}>
            {renderQuestion()}
          </ScrollView>
          
          <View style={styles.footer}>
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                onPress={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <Ionicons name="chevron-back" size={22} color={currentQuestionIndex === 0 ? "#ccc" : "#4285F4"} />
                <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                  Назад
                </Text>
              </TouchableOpacity>
              
              {currentQuestionIndex < testData.questions.length - 1 ? (
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.navButtonText}>Далі</Text>
                  <Ionicons name="chevron-forward" size={22} color="#4285F4" />
                </TouchableOpacity>
              ) : (
                !isPreview && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.finishButton]}
                    onPress={() => setConfirmModalVisible(true)}
                  >
                    <Text style={[styles.navButtonText, styles.finishButtonText]}>Завершити</Text>
                  </TouchableOpacity>
                )
              )}
              
              {isPreview && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.closeButton]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={[styles.navButtonText, styles.closeButtonText]}>Закрити</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          {renderConfirmModal()}
        </>
      ) : (
        renderResults()
      )}
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  timerWarning: {
    color: '#DB4437',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  optionItemSelected: {
    borderColor: '#4285F4',
    backgroundColor: '#e3f2fd',
  },
  optionCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircle: {
    borderRadius: 12,
  },
  checkboxSquare: {
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#4285F4',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  finishButton: {
    backgroundColor: '#4285F4',
    borderRadius: 20,
  },
  finishButtonText: {
    color: '#fff',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonCancelText: {
    color: '#666',
  },
  modalButtonConfirm: {
    backgroundColor: '#4285F4',
  },
  modalButtonConfirmText: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultSummary: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  reviewButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F4B400',
  },
  previewBanner: {
    padding: 15,
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBannerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#F4B400',
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
  },
  correctAnswerContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#333',
  },
  answerIndicator: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionItemCorrect: {
    borderColor: '#0F9D58',
    backgroundColor: '#e3f2fd',
  },
  optionItemWrong: {
    borderColor: '#DB4437',
    backgroundColor: '#f5f5f5',
  },
  checkboxCorrect: {
    backgroundColor: '#0F9D58',
    borderColor: '#0F9D58',
  },
  checkboxWrong: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },
  optionTextCorrect: {
    color: '#0F9D58',
    fontWeight: '500',
  },
  optionTextWrong: {
    color: '#DB4437',
    fontWeight: '500',
  },
});

export default TestDetailScreen; 