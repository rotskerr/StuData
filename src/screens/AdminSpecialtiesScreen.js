import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSpecialties, addSpecialty, updateSpecialty, deleteSpecialty } from '../services/facultyService';

const AdminSpecialtiesScreen = ({ navigation, route }) => {
  const { facultyId, facultyName } = route.params;
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSpecialtyName, setNewSpecialtyName] = useState('');
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const specialtiesData = await getSpecialties(facultyId);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Помилка завантаження спеціальностей:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити спеціальності');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddSpecialty = async () => {
    if (!newSpecialtyName.trim()) {
      Alert.alert('Помилка', 'Введіть назву спеціальності');
      return;
    }

    try {
      setLoading(true);
      await addSpecialty(newSpecialtyName.trim(), facultyId);
      setNewSpecialtyName('');
      await loadSpecialties();
      Alert.alert('Успіх', 'Спеціальність успішно додано');
    } catch (error) {
      console.error('Помилка додавання спеціальності:', error);
      Alert.alert('Помилка', 'Не вдалося додати спеціальність');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpecialty = async () => {
    if (!editingSpecialty || !editingSpecialty.name.trim()) {
      Alert.alert('Помилка', 'Введіть назву спеціальності');
      return;
    }

    try {
      setLoading(true);
      await updateSpecialty(editingSpecialty.id, { name: editingSpecialty.name.trim() });
      setEditingSpecialty(null);
      await loadSpecialties();
      Alert.alert('Успіх', 'Спеціальність успішно оновлено');
    } catch (error) {
      console.error('Помилка оновлення спеціальності:', error);
      Alert.alert('Помилка', 'Не вдалося оновити спеціальність');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialty = async (specialty) => {
    Alert.alert(
      'Підтвердження',
      `Ви впевнені, що хочете видалити спеціальність "${specialty.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSpecialty(specialty.id);
              await loadSpecialties();
              Alert.alert('Успіх', 'Спеціальність успішно видалено');
            } catch (error) {
              console.error('Помилка видалення спеціальності:', error);
              Alert.alert('Помилка', 'Не вдалося видалити спеціальність');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSpecialties();
  };

  const renderSpecialtyItem = ({ item }) => (
    <View style={styles.specialtyItem}>
      {editingSpecialty && editingSpecialty.id === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editingSpecialty.name}
            onChangeText={(text) => setEditingSpecialty({ ...editingSpecialty, name: text })}
            placeholder="Назва спеціальності"
          />
          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleUpdateSpecialty}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={() => setEditingSpecialty(null)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.specialtyName}>{item.name}</Text>
          <View style={styles.specialtyActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditingSpecialty(item)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteSpecialty(item)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => navigation.navigate('AdminGroups', { 
                specialtyId: item.id, 
                specialtyName: item.name,
                facultyName
              })}
            >
              <Ionicons name="list" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Спеціальності</Text>
          <Text style={styles.headerSubtitle}>{facultyName}</Text>
        </View>
      </View>

      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newSpecialtyName}
          onChangeText={setNewSpecialtyName}
          placeholder="Назва нової спеціальності"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddSpecialty}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Завантаження спеціальностей...</Text>
        </View>
      ) : (
        <FlatList
          data={specialties}
          renderItem={renderSpecialtyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Немає спеціальностей</Text>
              <Text style={styles.emptySubText}>Додайте першу спеціальність</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    width: 46,
    height: 46,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  listContent: {
    padding: 15,
  },
  specialtyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specialtyName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  specialtyActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#4285F4',
  },
  deleteButton: {
    backgroundColor: '#EA4335',
  },
  viewButton: {
    backgroundColor: '#FBBC05',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  editButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#34A853',
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#EA4335',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default AdminSpecialtiesScreen; 