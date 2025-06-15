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
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTestById, saveTestResult } from '../services/testService';
import { getUserTestResults } from '../services/testService';

const { width } = Dimensions.get('window');

const TestDetailScreen = ({ navigation, route }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [userTestResults, setUserTestResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  
  const { testId, isReview = false, isPreview = false } = route.params || {};

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setIsLoading(true);
        
        if (!testId) {
          Alert.alert('Увага', 'Ідентифікатор тесту відсутній. Будь ласка, спробуйте ще раз.');
          navigation.goBack();
          return;
        }
        
        const test = await getTestById(testId);
        
        if (!test) {
          Alert.alert('Помилка', 'Тест не знайдено');
          navigation.goBack();
          return;
        }
        
        if (isReview) {
          const results = await getUserTestResults();
          const userTestResult = results.find(result => result.testId === testId);
          
          if (userTestResult) {
            setSelectedAnswers(userTestResult.answers || {});
            setScore(userTestResult.score || 0);
            setShowResults(true);
            setUserTestResults(results);
          }
        }
        
        if (isPreview) {
          const previewTest = {
            ...test,
            status: 'pending'
          };
          setTestData(previewTest);
        } else {
          setTestData(test);
        }
        
        if (!isReview && !isPreview && test.timeLimit) {
          setTimeLeft(test.timeLimit * 60); // Конвертуємо хвилини в секунди
          setStartTime(new Date());
        } else {
          setTimeLeft(9999);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка при завантаженні тесту:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити тест');
        navigation.goBack();
      }
    };
    
    loadTestData();
  }, [isReview, isPreview, testId, navigation]);

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

  useEffect(() => {
    if (testData) {
      navigation.setOptions({
        title: isReview ? 'Перегляд результатів' : isPreview ? 'Попередній перегляд' : 'Проходження тесту'
      });
    }
  }, [testData, navigation, isReview, isPreview]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return '#0F9D58'; // Зелений (більше 5 хвилин)
    if (timeLeft > 60) return '#F4B400'; // Жовтий (більше 1 хвилини)
    return '#DB4437'; // Червоний (менше 1 хвилини)
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

  const getAnsweredQuestionsCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const calculateScore = () => {
    if (!testData || !testData.questions) return 0;
    
    let correctCount = 0;
    let totalQuestions = 0;
    
    testData.questions.forEach(question => {
      if (question.type === 'text') return;
      
      totalQuestions++;
      const userAnswer = selectedAnswers[question.id];
      
      if (!userAnswer) return; // Пропускаємо питання без відповіді
      
      const options = question.options || question.answers || [];
      
      if (question.type === 'multiple') {
        const correctAnswers = options.filter(opt => opt.isCorrect).map(opt => opt.id);
        
        const isCorrect = 
          Array.isArray(userAnswer) &&
          userAnswer.length === correctAnswers.length && 
          userAnswer.every(answer => correctAnswers.includes(answer));
        
        if (isCorrect) correctCount++;
      } else if (question.type === 'single') {
        const correctOption = options.find(opt => opt.isCorrect);
        if (correctOption && userAnswer === correctOption.id) {
          correctCount++;
        }
      }
    });
    
    return totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  };

  const handleFinishTest = async () => {
    if (isPreview) {
      Alert.alert('Попередній перегляд', 'Це тільки попередній перегляд тесту. Результати не зберігаються.');
      return;
    }

    if (isReview) {
      navigation.goBack();
      return;
    }

    try {
      const finalScore = calculateScore();
      const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
      
      const validAnswers = selectedAnswers && typeof selectedAnswers === 'object' ? selectedAnswers : {};
      

      
      await saveTestResult(testId, validAnswers, finalScore, timeSpent);
      
      setScore(finalScore);
      setShowResults(true);
    } catch (error) {
      console.error('Помилка при збереженні результатів:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти результати тесту');
    }
  };

  const renderProgressBar = () => {
    if (!testData || !testData.questions || testData.questions.length === 0) return null;
    
    const progress = (currentQuestionIndex + 1) / testData.questions.length;
    const answeredCount = getAnsweredQuestionsCount();
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Питання {currentQuestionIndex + 1} з {testData.questions.length}
          </Text>
          <Text style={styles.answeredText}>
            Відповіли: {answeredCount}/{testData.questions.length}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    );
  };

  const renderTimer = () => {
    if (isReview || isPreview || !testData.timeLimit) return null;
    
    return (
      <View style={[styles.timerContainer, { backgroundColor: getTimeColor() + '20' }]}>
        <Ionicons name="time" size={20} color={getTimeColor()} />
        <Text style={[styles.timerText, { color: getTimeColor() }]}>
          {formatTime(timeLeft)}
        </Text>
      </View>
    );
  };

  const renderQuestion = () => {
    if (!testData || !testData.questions || testData.questions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Питання не знайдено</Text>
        </View>
      );
    }

    const question = testData.questions[currentQuestionIndex];
    const userAnswer = selectedAnswers[question.id];

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
        
        {question.type === 'single' && (
          <View style={styles.answersContainer}>
            {(question.options || question.answers || []).map((answer, index) => {
              const isSelected = userAnswer === answer.id;
              const isCorrect = showReview && answer.isCorrect;
              const isWrong = showReview && isSelected && !answer.isCorrect;
              
              return (
                <TouchableOpacity
                  key={answer.id}
                  style={[
                    styles.answerOption,
                    isSelected && styles.selectedAnswer,
                    showReview && isCorrect && styles.correctAnswer,
                    showReview && isWrong && styles.wrongAnswer
                  ]}
                  onPress={() => !showReview && !isPreview && handleAnswerSelect(question.id, answer.id, false)}
                  disabled={showReview || isPreview}
                >
                  <View style={styles.answerContent}>
                    <View style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                      showReview && isCorrect && styles.radioButtonCorrect,
                      showReview && isWrong && styles.radioButtonWrong
                    ]}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                      {showReview && isCorrect && <Ionicons name="checkmark" size={16} color="#fff" />}
                      {showReview && isWrong && <Ionicons name="close" size={16} color="#fff" />}
                    </View>
                    <Text style={[
                      styles.answerText,
                      isSelected && styles.selectedAnswerText,
                      showReview && isCorrect && styles.correctAnswerText,
                      showReview && isWrong && styles.wrongAnswerText
                    ]}>
                      {answer.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'multiple' && (
          <View style={styles.answersContainer}>
            <Text style={styles.multipleHint}>Виберіть всі правильні варіанти:</Text>
            {(question.options || question.answers || []).map((answer, index) => {
              const isSelected = userAnswer && userAnswer.includes(answer.id);
              const isCorrect = showReview && answer.isCorrect;
              const isWrong = showReview && isSelected && !answer.isCorrect;
              
              return (
                <TouchableOpacity
                  key={answer.id}
                  style={[
                    styles.answerOption,
                    isSelected && styles.selectedAnswer,
                    showReview && isCorrect && styles.correctAnswer,
                    showReview && isWrong && styles.wrongAnswer
                  ]}
                  onPress={() => !showReview && !isPreview && handleAnswerSelect(question.id, answer.id, true)}
                  disabled={showReview || isPreview}
                >
                  <View style={styles.answerContent}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                      showReview && isCorrect && styles.checkboxCorrect,
                      showReview && isWrong && styles.checkboxWrong
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                      {showReview && isCorrect && !isSelected && <Ionicons name="checkmark" size={16} color="#0F9D58" />}
                    </View>
                    <Text style={[
                      styles.answerText,
                      isSelected && styles.selectedAnswerText,
                      showReview && isCorrect && styles.correctAnswerText,
                      showReview && isWrong && styles.wrongAnswerText
                    ]}>
                      {answer.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'text' && (
          <View style={styles.textAnswerContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Введіть вашу відповідь..."
              value={userAnswer || ''}
              onChangeText={(text) => !showReview && !isPreview && handleAnswerSelect(question.id, text, false)}
              multiline
              numberOfLines={4}
              editable={!showReview && !isPreview}
            />
            {showReview && (
              <Text style={styles.textAnswerNote}>
                Текстові відповіді оцінюються викладачем окремо
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderNavigationButtons = () => {
    if (showResults || !testData || !testData.questions) return null;
    
    if (showReview) {
      return (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? '#ccc' : '#4285F4'} />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              Назад
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === testData.questions.length - 1 ? (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => {
                setShowReview(false);
                setShowResults(true);
              }}
            >
              <Text style={styles.finishButtonText}>Назад до результатів</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.navButtonText}>Далі</Text>
              <Ionicons name="chevron-forward" size={20} color="#4285F4" />
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? '#ccc' : '#4285F4'} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Назад
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === testData.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.finishButton, (isPreview || isReview) && styles.finishButtonDisabled]}
            onPress={() => {
              if (isReview) {
                navigation.goBack();
              } else if (isPreview) {
                Alert.alert('Попередній перегляд', 'Це тільки попередній перегляд тесту.');
              } else {
                setConfirmModalVisible(true);
              }
            }}
          >
            <Text style={styles.finishButtonText}>
              {isReview ? 'Закрити' : isPreview ? 'Попередній перегляд' : 'Завершити тест'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Далі</Text>
            <Ionicons name="chevron-forward" size={20} color="#4285F4" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderResults = () => {
    const getScoreColor = (score) => {
      if (score >= 90) return '#0F9D58';
      if (score >= 75) return '#4285F4';
      if (score >= 60) return '#F4B400';
      return '#DB4437';
    };

    const getScoreMessage = (score) => {
      if (score >= 90) return 'Відмінно!';
      if (score >= 75) return 'Добре!';
      if (score >= 60) return 'Задовільно';
      return 'Потрібно покращити';
    };

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>{score}%</Text>
          </View>
          <Text style={styles.scoreMessage}>{getScoreMessage(score)}</Text>
          <Text style={styles.scoreDescription}>
            Ви правильно відповіли на {Math.round((score / 100) * testData.questions.length)} з {testData.questions.length} питань
          </Text>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => {
              setShowResults(false);
              setShowReview(true);
              setCurrentQuestionIndex(0);
            }}
          >
            <Ionicons name="eye" size={20} color="#4285F4" />
            <Text style={styles.reviewButtonText}>Переглянути відповіді</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              navigation.navigate('Main', { 
                screen: 'Home', 
                params: { refresh: true, testCompleted: testId }
              });
            }}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.homeButtonText}>На головну</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConfirmModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="warning" size={32} color="#F4B400" />
            <Text style={styles.modalTitle}>Завершити тест?</Text>
          </View>
          
          <Text style={styles.modalText}>
            Ви відповіли на {getAnsweredQuestionsCount()} з {testData?.questions?.length || 0} питань.
          </Text>
          
          {getAnsweredQuestionsCount() < (testData?.questions?.length || 0) && (
            <Text style={styles.modalWarning}>
              Увага: Не всі питання мають відповіді. Питання без відповідей будуть зараховані як неправильні.
            </Text>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Продовжити тест</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                setConfirmModalVisible(false);
                handleFinishTest();
              }}
            >
              <Text style={styles.modalConfirmText}>Завершити</Text>
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

  if (!testData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#DB4437" />
        <Text style={styles.errorText}>Тест не знайдено</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Повернутися</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderResults()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.testTitle}>
            {showReview ? `Перегляд відповідей: ${testData.title}` : testData.title}
          </Text>
          {!showReview && renderTimer()}
        </View>
        {renderProgressBar()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion()}
      </ScrollView>

      {renderNavigationButtons()}
      {renderConfirmModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#DB4437',
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  answeredText: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  answersContainer: {
    marginTop: 10,
  },
  multipleHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  answerOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnswer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4285F4',
  },
  correctAnswer: {
    backgroundColor: '#e8f5e8',
    borderColor: '#0F9D58',
  },
  wrongAnswer: {
    backgroundColor: '#ffebee',
    borderColor: '#DB4437',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4285F4',
  },
  radioButtonCorrect: {
    borderColor: '#0F9D58',
    backgroundColor: '#0F9D58',
  },
  radioButtonWrong: {
    borderColor: '#DB4437',
    backgroundColor: '#DB4437',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#4285F4',
    backgroundColor: '#4285F4',
  },
  checkboxCorrect: {
    borderColor: '#0F9D58',
    backgroundColor: '#0F9D58',
  },
  checkboxWrong: {
    borderColor: '#DB4437',
    backgroundColor: '#DB4437',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  selectedAnswerText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  correctAnswerText: {
    color: '#0F9D58',
    fontWeight: '500',
  },
  wrongAnswerText: {
    color: '#DB4437',
    fontWeight: '500',
  },
  textAnswerContainer: {
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  textAnswerNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  navButtonDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
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
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  finishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  resultActions: {
    width: '100%',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  reviewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 8,
  },
  homeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  modalWarning: {
    fontSize: 14,
    color: '#DB4437',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  modalCancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalConfirmText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  correctAnswer: {
    backgroundColor: '#e8f5e8',
    borderColor: '#0F9D58',
  },
  wrongAnswer: {
    backgroundColor: '#ffebee',
    borderColor: '#DB4437',
  },
  correctAnswerText: {
    color: '#0F9D58',
    fontWeight: '500',
  },
  wrongAnswerText: {
    color: '#DB4437',
    fontWeight: '500',
  },
  radioButtonCorrect: {
    backgroundColor: '#0F9D58',
    borderColor: '#0F9D58',
  },
  radioButtonWrong: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },
  checkboxCorrect: {
    backgroundColor: '#0F9D58',
    borderColor: '#0F9D58',
  },
  checkboxWrong: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },
  textAnswerNote: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TestDetailScreen; 