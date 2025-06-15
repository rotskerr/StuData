import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGroups, addGroup, updateGroup, deleteGroup } from '../services/facultyService';

const AdminGroupsScreen = ({ navigation, route }) => {
  const { specialtyId, specialtyName, facultyName } = route.params;
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await getGroups(specialtyId);
      setGroups(groupsData);
    } catch (error) {
      console.error('Помилка завантаження груп:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити групи');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Помилка', 'Введіть назву групи');
      return;
    }

    try {
      setLoading(true);
      await addGroup(newGroupName.trim(), specialtyId);
      setNewGroupName('');
      await loadGroups();
      Alert.alert('Успіх', 'Групу успішно додано');
    } catch (error) {
      console.error('Помилка додавання групи:', error);
      Alert.alert('Помилка', 'Не вдалося додати групу');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !editingGroup.name.trim()) {
      Alert.alert('Помилка', 'Введіть назву групи');
      return;
    }

    try {
      setLoading(true);
      await updateGroup(editingGroup.id, { name: editingGroup.name.trim() });
      setEditingGroup(null);
      await loadGroups();
      Alert.alert('Успіх', 'Групу успішно оновлено');
    } catch (error) {
      console.error('Помилка оновлення групи:', error);
      Alert.alert('Помилка', 'Не вдалося оновити групу');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    Alert.alert(
      'Підтвердження',
      `Ви впевнені, що хочете видалити групу "${group.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteGroup(group.id);
              await loadGroups();
              Alert.alert('Успіх', 'Групу успішно видалено');
            } catch (error) {
              console.error('Помилка видалення групи:', error);
              Alert.alert('Помилка', 'Не вдалося видалити групу');
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
    loadGroups();
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupItem}>
      {editingGroup && editingGroup.id === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editingGroup.name}
            onChangeText={(text) => setEditingGroup({ ...editingGroup, name: text })}
            placeholder="Назва групи"
          />
          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleUpdateGroup}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={() => setEditingGroup(null)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.groupActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditingGroup(item)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteGroup(item)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
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
          <Text style={styles.headerTitle}>Групи</Text>
          <Text style={styles.headerSubtitle}>{facultyName} / {specialtyName}</Text>
        </View>
      </View>

      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newGroupName}
          onChangeText={setNewGroupName}
          placeholder="Назва нової групи"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddGroup}
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
          <Text style={styles.loadingText}>Завантаження груп...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Немає груп</Text>
              <Text style={styles.emptySubText}>Додайте першу групу</Text>
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
  groupItem: {
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
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  groupActions: {
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

export default AdminGroupsScreen; 