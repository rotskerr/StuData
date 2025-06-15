import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  generatePDFReport, 
  generateExcelReport, 
  shareReport, 
  cleanupReportFiles,
  getDetailedStatistics 
} from '../services/reportService';
import { getAllTests } from '../services/testService';
import { getFaculties, getSpecialties, getGroups } from '../services/facultyService';

const AdminReportsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [tests, setTests] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  const [previewStats, setPreviewStats] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadSpecialties(selectedFaculty);
    } else {
      setSpecialties([]);
      setSelectedSpecialty('');
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedSpecialty) {
      loadGroups(selectedSpecialty);
    } else {
      setGroups([]);
      setSelectedGroup('');
    }
  }, [selectedSpecialty]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [testsData, facultiesData] = await Promise.all([
        getAllTests(),
        getFaculties()
      ]);
      
      setTests(testsData);
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecialties = async (facultyId) => {
    try {
      const specialtiesData = await getSpecialties(facultyId);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Помилка завантаження спеціальностей:', error);
    }
  };

  const loadGroups = async (specialtyId) => {
    try {
      const groupsData = await getGroups(specialtyId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Помилка завантаження груп:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const closeAllDropdowns = () => {
    setShowTestDropdown(false);
    setShowFacultyDropdown(false);
    setShowSpecialtyDropdown(false);
    setShowGroupDropdown(false);
  };

  const generateFilters = () => {
    const filters = {};
    
    if (selectedTest) filters.testId = selectedTest;
    if (selectedFaculty) filters.facultyId = selectedFaculty;
    if (selectedSpecialty) filters.specialtyId = selectedSpecialty;
    if (selectedGroup) filters.groupId = selectedGroup;
    
    return filters;
  };

  const handlePreviewStats = async () => {
    setIsLoading(true);
    try {
      const filters = generateFilters();
      const stats = await getDetailedStatistics(filters);
      setPreviewStats(stats);
      setShowPreview(true);
    } catch (error) {
      console.error('Помилка отримання статистики:', error);
      Alert.alert('Помилка', 'Не вдалося отримати статистику');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (previewStats && previewStats.totalResults === 0) {
      Alert.alert(
        'Немає даних',
        'Неможливо згенерувати звіт, оскільки немає результатів тестування. Спочатку студенти повинні завершити тести.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsGenerating(true);
    try {
      const filters = generateFilters();
      const testInfo = selectedTest ? tests.find(t => t.id === selectedTest) : null;
      
      const result = await generatePDFReport(filters, testInfo);
      
      if (result.success) {
        Alert.alert(
          'Успіх',
          'PDF звіт успішно згенеровано',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Поділитися', 
              onPress: () => shareReport(result.filePath, `звіт_${Date.now()}.pdf`)
            }
          ]
        );
      } else {
        Alert.alert('Помилка', `Не вдалося згенерувати PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('Помилка генерації PDF:', error);
      Alert.alert('Помилка', 'Не вдалося згенерувати PDF звіт');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (previewStats && previewStats.totalResults === 0) {
      Alert.alert(
        'Немає даних',
        'Неможливо згенерувати звіт, оскільки немає результатів тестування. Спочатку студенти повинні завершити тести.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsGenerating(true);
    try {
      const filters = generateFilters();
      const testInfo = selectedTest ? tests.find(t => t.id === selectedTest) : null;
      
      const result = await generateExcelReport(filters, testInfo);
      
      if (result.success) {
        Alert.alert(
          'Успіх',
          'CSV звіт успішно згенеровано',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Поділитися', 
              onPress: () => shareReport(result.filePath, result.fileName)
            }
          ]
        );
      } else {
        Alert.alert('Помилка', `Не вдалося згенерувати CSV: ${result.error}`);
      }
    } catch (error) {
      console.error('Помилка генерації CSV:', error);
      Alert.alert('Помилка', 'Не вдалося згенерувати CSV звіт');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanupFiles = async () => {
    Alert.alert(
      'Очищення файлів',
      'Видалити всі тимчасові файли звітів?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cleanupReportFiles();
              if (result.success) {
                Alert.alert('Успіх', `Видалено ${result.deletedCount} файлів`);
              } else {
                Alert.alert('Помилка', result.error);
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося очистити файли');
            }
          }
        }
      ]
    );
  };

  const handleResetFilters = () => {
    setSelectedTest('');
    setSelectedFaculty('');
    setSelectedSpecialty('');
    setSelectedGroup('');
    setShowPreview(false);
    setPreviewStats(null);
    closeAllDropdowns();
  };

  const CustomDropdown = ({ 
    placeholder, 
    selectedValue, 
    selectedLabel, 
    data, 
    onSelect, 
    isVisible, 
    onToggle,
    disabled = false 
  }) => {
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={[
            styles.dropdownButton, 
            disabled && styles.dropdownButtonDisabled,
            isVisible && styles.dropdownButtonActive
          ]}
          onPress={disabled ? null : () => {
            closeAllDropdowns();
            onToggle();
          }}
          disabled={disabled}
        >
          <Text style={[
            styles.dropdownButtonText,
            !selectedValue && styles.dropdownPlaceholderText,
            disabled && styles.dropdownButtonTextDisabled
          ]}>
            {selectedLabel || placeholder}
          </Text>
          <Ionicons 
            name={isVisible ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={disabled ? "#ccc" : "#4285F4"} 
          />
        </TouchableOpacity>
        
        {isVisible && (
          <View style={styles.dropdownList}>
            <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
              {data.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    onSelect(item.id);
                    closeAllDropdowns();
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedValue === item.id && styles.dropdownItemTextSelected
                  ]}>
                    {item.title || item.name}
                  </Text>
                  {selectedValue === item.id && (
                    <Ionicons name="checkmark" size={20} color="#4285F4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Фільтри звіту</Text>
      
      {/* Вибір тесту */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Тест:</Text>
        <CustomDropdown
          placeholder="Всі тести"
          selectedValue={selectedTest}
          selectedLabel={tests.find(t => t.id === selectedTest)?.title}
          data={[{ id: '', title: 'Всі тести' }, ...tests]}
          onSelect={setSelectedTest}
          isVisible={showTestDropdown}
          onToggle={() => setShowTestDropdown(!showTestDropdown)}
        />
      </View>

      {/* Вибір факультету */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Факультет:</Text>
        <CustomDropdown
          placeholder="Всі факультети"
          selectedValue={selectedFaculty}
          selectedLabel={faculties.find(f => f.id === selectedFaculty)?.name}
          data={[{ id: '', name: 'Всі факультети' }, ...faculties]}
          onSelect={setSelectedFaculty}
          isVisible={showFacultyDropdown}
          onToggle={() => setShowFacultyDropdown(!showFacultyDropdown)}
        />
      </View>

      {/* Вибір спеціальності */}
      {selectedFaculty && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Спеціальність:</Text>
          <CustomDropdown
            placeholder="Всі спеціальності"
            selectedValue={selectedSpecialty}
            selectedLabel={specialties.find(s => s.id === selectedSpecialty)?.name}
            data={[{ id: '', name: 'Всі спеціальності' }, ...specialties]}
            onSelect={setSelectedSpecialty}
            isVisible={showSpecialtyDropdown}
            onToggle={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
            disabled={specialties.length === 0}
          />
        </View>
      )}

      {/* Вибір групи */}
      {selectedSpecialty && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Група:</Text>
          <CustomDropdown
            placeholder="Всі групи"
            selectedValue={selectedGroup}
            selectedLabel={groups.find(g => g.id === selectedGroup)?.name}
            data={[{ id: '', name: 'Всі групи' }, ...groups]}
            onSelect={setSelectedGroup}
            isVisible={showGroupDropdown}
            onToggle={() => setShowGroupDropdown(!showGroupDropdown)}
            disabled={groups.length === 0}
          />
        </View>
      )}

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleResetFilters}
      >
        <Ionicons name="refresh-outline" size={20} color="#666" />
        <Text style={styles.resetButtonText}>Скинути фільтри</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreviewSection = () => {
    if (!showPreview || !previewStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Попередній перегляд</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{previewStats.totalResults}</Text>
            <Text style={styles.statLabel}>Результатів</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{previewStats.averageScore}%</Text>
            <Text style={styles.statLabel}>Середній бал</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{previewStats.averageTime} хв</Text>
            <Text style={styles.statLabel}>Середній час</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{previewStats.passRate}%</Text>
            <Text style={styles.statLabel}>Успішність</Text>
          </View>
        </View>

        {previewStats.totalResults === 0 && (
          <View style={styles.noDataContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#999" />
            <Text style={styles.noDataText}>
              За вказаними фільтрами результатів не знайдено
            </Text>
            <Text style={styles.noDataSubtext}>
              Можливо, жоден студент ще не завершив тестування або потрібно змінити фільтри
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Дії</Text>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.previewButton]}
        onPress={handlePreviewStats}
        disabled={isLoading}
      >
        <Ionicons name="eye-outline" size={20} color="#4285F4" />
        <Text style={[styles.actionButtonText, { color: '#4285F4' }]}>
          Попередній перегляд
        </Text>
        {isLoading && <ActivityIndicator size="small" color="#4285F4" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.pdfButton]}
        onPress={handleGeneratePDF}
        disabled={isGenerating}
      >
        <Ionicons name="document-text-outline" size={20} color="#DB4437" />
        <Text style={[styles.actionButtonText, { color: '#DB4437' }]}>
          Генерувати PDF
        </Text>
        {isGenerating && <ActivityIndicator size="small" color="#DB4437" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.excelButton]}
        onPress={handleGenerateExcel}
        disabled={isGenerating}
      >
        <Ionicons name="grid-outline" size={20} color="#0F9D58" />
        <Text style={[styles.actionButtonText, { color: '#0F9D58' }]}>
          Генерувати CSV
        </Text>
        {isGenerating && <ActivityIndicator size="small" color="#0F9D58" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.cleanupButton]}
        onPress={handleCleanupFiles}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6D01" />
        <Text style={[styles.actionButtonText, { color: '#FF6D01' }]}>
          Очистити файли
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Звіти</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderFilterSection()}
        {renderPreviewSection()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4285F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  headerRight: {
    width: 34,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#666',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e0e0e0',
  },
  dropdownButtonActive: {
    borderColor: '#4285F4',
    backgroundColor: '#e3f2fd',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: '#999',
  },
  dropdownButtonTextDisabled: {
    color: '#ccc',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4285F4',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#4285F4',
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  resetButtonText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noDataSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  previewButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4285F4',
  },
  pdfButton: {
    backgroundColor: '#ffebee',
    borderColor: '#DB4437',
  },
  excelButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#0F9D58',
  },
  cleanupButton: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF6D01',
  },
});

export default AdminReportsScreen; 