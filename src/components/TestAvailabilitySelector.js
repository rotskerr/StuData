import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFaculties, getSpecialties, getGroups } from '../services/facultyService';

const TestAvailabilitySelector = ({ onAvailabilityChange, initialValue }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityType, setAvailabilityType] = useState('all'); // 'all', 'faculty', 'specialty', 'group'
  const [faculties, setFaculties] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  const notifyAvailabilityChange = useCallback(() => {
    if (!onAvailabilityChange) return;
    
    const availabilityData = {
      type: availabilityType,
      facultyId: selectedFaculty,
      specialtyId: selectedSpecialty,
      groupId: selectedGroup
    };
    
    onAvailabilityChange(availabilityData);
  }, [onAvailabilityChange, availabilityType, selectedFaculty, selectedSpecialty, selectedGroup]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (initialValue) {
      setAvailabilityType(initialValue.type || 'all');
      setSelectedFaculty(initialValue.facultyId || null);
      setSelectedSpecialty(initialValue.specialtyId || null);
      setSelectedGroup(initialValue.groupId || null);
    }
  }, [initialValue]);
  
  useEffect(() => {
    if (availabilityType === 'all') {
      setSelectedFaculty(null);
      setSelectedSpecialty(null);
      setSelectedGroup(null);
    } else if (availabilityType === 'faculty') {
      setSelectedSpecialty(null);
      setSelectedGroup(null);
    } else if (availabilityType === 'specialty') {
      setSelectedGroup(null);
    }
    
    notifyAvailabilityChange();
  }, [availabilityType, notifyAvailabilityChange]);
  
  useEffect(() => {
    if (selectedFaculty) {
      loadSpecialties(selectedFaculty);
    } else {
      setSpecialties([]);
      setSelectedSpecialty(null);
    }
    notifyAvailabilityChange();
  }, [selectedFaculty, notifyAvailabilityChange]);
  
  useEffect(() => {
    if (selectedSpecialty) {
      loadGroups(selectedSpecialty);
    } else {
      setGroups([]);
      setSelectedGroup(null);
    }
    notifyAvailabilityChange();
  }, [selectedSpecialty, notifyAvailabilityChange]);
  
  useEffect(() => {
    notifyAvailabilityChange();
  }, [selectedGroup, notifyAvailabilityChange]);

  const handleFacultySelect = useCallback((facultyId) => {
    setSelectedFaculty(facultyId);
  }, []);

  const handleSpecialtySelect = useCallback((specialtyId) => {
    setSelectedSpecialty(specialtyId);
  }, []);

  const handleGroupSelect = useCallback((groupId) => {
    setSelectedGroup(groupId);
  }, []);

  const handleFacultyToggle = useCallback(() => {
    setShowFacultyDropdown(!showFacultyDropdown);
    setShowSpecialtyDropdown(false);
    setShowGroupDropdown(false);
  }, [showFacultyDropdown]);

  const handleSpecialtyToggle = useCallback(() => {
    setShowSpecialtyDropdown(!showSpecialtyDropdown);
    setShowFacultyDropdown(false);
    setShowGroupDropdown(false);
  }, [showSpecialtyDropdown]);

  const handleGroupToggle = useCallback(() => {
    setShowGroupDropdown(!showGroupDropdown);
    setShowFacultyDropdown(false);
    setShowSpecialtyDropdown(false);
  }, [showGroupDropdown]);

  const handleAvailabilityTypeChange = useCallback((type) => {
    setAvailabilityType(type);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const facultiesData = await getFaculties();
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Помилка завантаження факультетів:', error);
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
          onPress={disabled ? null : onToggle}
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
                    onToggle();
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedValue === item.id && styles.dropdownItemTextSelected
                  ]}>
                    {item.name}
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
  
  const renderAvailabilityTypeSelector = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Доступність тесту:</Text>
        <View style={styles.availabilityTypes}>
          <TouchableOpacity 
            style={[
              styles.availabilityTypeButton, 
              availabilityType === 'all' && styles.availabilityTypeButtonActive
            ]}
            onPress={() => handleAvailabilityTypeChange('all')}
          >
            <Text style={[
              styles.availabilityTypeText,
              availabilityType === 'all' && styles.availabilityTypeTextActive
            ]}>Всі</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.availabilityTypeButton, 
              availabilityType === 'faculty' && styles.availabilityTypeButtonActive
            ]}
            onPress={() => handleAvailabilityTypeChange('faculty')}
          >
            <Text style={[
              styles.availabilityTypeText,
              availabilityType === 'faculty' && styles.availabilityTypeTextActive
            ]}>Факультет</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.availabilityTypeButton, 
              availabilityType === 'specialty' && styles.availabilityTypeButtonActive
            ]}
            onPress={() => handleAvailabilityTypeChange('specialty')}
          >
            <Text style={[
              styles.availabilityTypeText,
              availabilityType === 'specialty' && styles.availabilityTypeTextActive
            ]}>Спеціальність</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.availabilityTypeButton, 
              availabilityType === 'group' && styles.availabilityTypeButtonActive
            ]}
            onPress={() => handleAvailabilityTypeChange('group')}
          >
            <Text style={[
              styles.availabilityTypeText,
              availabilityType === 'group' && styles.availabilityTypeTextActive
            ]}>Група</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderFacultySelector = () => {
    if (availabilityType === 'all') return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Факультет:</Text>
        <CustomDropdown
          placeholder="Виберіть факультет"
          selectedValue={selectedFaculty}
          selectedLabel={faculties.find(f => f.id === selectedFaculty)?.name}
          data={faculties}
          onSelect={handleFacultySelect}
          isVisible={showFacultyDropdown}
          onToggle={handleFacultyToggle}
        />
      </View>
    );
  };
  
  const renderSpecialtySelector = () => {
    if (availabilityType === 'all' || availabilityType === 'faculty' || !selectedFaculty) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Спеціальність:</Text>
        <CustomDropdown
          placeholder="Виберіть спеціальність"
          selectedValue={selectedSpecialty}
          selectedLabel={specialties.find(s => s.id === selectedSpecialty)?.name}
          data={specialties}
          onSelect={handleSpecialtySelect}
          isVisible={showSpecialtyDropdown}
          onToggle={handleSpecialtyToggle}
          disabled={specialties.length === 0}
        />
      </View>
    );
  };
  
  const renderGroupSelector = () => {
    if (availabilityType !== 'group' || !selectedSpecialty) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Група:</Text>
        <CustomDropdown
          placeholder="Виберіть групу"
          selectedValue={selectedGroup}
          selectedLabel={groups.find(g => g.id === selectedGroup)?.name}
          data={groups}
          onSelect={handleGroupSelect}
          isVisible={showGroupDropdown}
          onToggle={handleGroupToggle}
          disabled={groups.length === 0}
        />
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження даних...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderAvailabilityTypeSelector()}
      {renderFacultySelector()}
      {renderSpecialtySelector()}
      {renderGroupSelector()}
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Тест буде доступний для:</Text>
        <Text style={styles.summaryText}>
          {availabilityType === 'all' && 'Всіх студентів університету'}
          {availabilityType === 'faculty' && selectedFaculty && 
            `Студентів факультету: ${faculties.find(f => f.id === selectedFaculty)?.name || ''}`}
          {availabilityType === 'specialty' && selectedFaculty && selectedSpecialty && 
            `Студентів спеціальності: ${specialties.find(s => s.id === selectedSpecialty)?.name || ''}`}
          {availabilityType === 'group' && selectedFaculty && selectedSpecialty && selectedGroup && 
            `Студентів групи: ${groups.find(g => g.id === selectedGroup)?.name || ''}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  section: {
    marginBottom: 15,
    zIndex: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  availabilityTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  availabilityTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    minWidth: '23%',
    alignItems: 'center'
  },
  availabilityTypeButtonActive: {
    backgroundColor: '#4285F4'
  },
  availabilityTypeText: {
    fontSize: 14,
    color: '#555'
  },
  availabilityTypeTextActive: {
    color: '#fff',
    fontWeight: 'bold'
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 50
  },
  dropdownButtonActive: {
    borderColor: '#4285F4',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0'
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  dropdownPlaceholderText: {
    color: '#999'
  },
  dropdownButtonTextDisabled: {
    color: '#ccc'
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4285F4',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
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
    maxHeight: 200
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f8ff'
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  dropdownItemTextSelected: {
    color: '#4285F4',
    fontWeight: '500'
  },
  summaryContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 8
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  summaryText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500'
  }
});

export default TestAvailabilitySelector; 