import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const getFaculties = async () => {
  try {
    const facultiesRef = collection(firestore, 'faculties');
    const q = query(facultiesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const faculties = [];
    querySnapshot.forEach((doc) => {
      faculties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return faculties;
  } catch (error) {
    console.error('Помилка отримання факультетів:', error);
    throw error;
  }
};

export const getSpecialties = async (facultyId) => {
  try {
    const specialtiesRef = collection(firestore, 'specialties');
    const q = query(specialtiesRef, where('facultyId', '==', facultyId));
    const querySnapshot = await getDocs(q);
    
    const specialties = [];
    querySnapshot.forEach((doc) => {
      specialties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return specialties.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Помилка отримання спеціальностей:', error);
    throw error;
  }
};

export const getGroups = async (specialtyId) => {
  try {
    const groupsRef = collection(firestore, 'groups');
    const q = query(groupsRef, where('specialtyId', '==', specialtyId));
    const querySnapshot = await getDocs(q);
    
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Помилка отримання груп:', error);
    throw error;
  }
};

export const addFaculty = async (name) => {
  try {
    const docRef = await addDoc(collection(firestore, 'faculties'), {
      name,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Помилка додавання факультету:', error);
    throw error;
  }
};

export const updateFaculty = async (id, data) => {
  try {
    const facultyRef = doc(firestore, 'faculties', id);
    await updateDoc(facultyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Помилка оновлення факультету:', error);
    throw error;
  }
};

export const deleteFaculty = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'faculties', id));
  } catch (error) {
    console.error('Помилка видалення факультету:', error);
    throw error;
  }
};

export const addSpecialty = async (name, facultyId) => {
  try {
    const docRef = await addDoc(collection(firestore, 'specialties'), {
      name,
      facultyId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Помилка додавання спеціальності:', error);
    throw error;
  }
};

export const updateSpecialty = async (id, data) => {
  try {
    const specialtyRef = doc(firestore, 'specialties', id);
    await updateDoc(specialtyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Помилка оновлення спеціальності:', error);
    throw error;
  }
};

export const deleteSpecialty = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'specialties', id));
  } catch (error) {
    console.error('Помилка видалення спеціальності:', error);
    throw error;
  }
};

export const addGroup = async (name, specialtyId) => {
  try {
    const docRef = await addDoc(collection(firestore, 'groups'), {
      name,
      specialtyId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Помилка додавання групи:', error);
    throw error;
  }
};

export const updateGroup = async (id, data) => {
  try {
    const groupRef = doc(firestore, 'groups', id);
    await updateDoc(groupRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Помилка оновлення групи:', error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    await deleteDoc(doc(firestore, 'groups', id));
  } catch (error) {
    console.error('Помилка видалення групи:', error);
    throw error;
  }
};

export const initializeBasicData = async () => {
  try {
    const faculties = await getFaculties();
    
    if (faculties.length === 0) {
  
      
      const facultyIds = {};
      
      const facultyData = [
        'Інформаційних технологій',
        'Економічний',
        'Юридичний',
        'Філологічний',
        'Історичний'
      ];
      
      for (const facultyName of facultyData) {
        const facultyId = await addFaculty(facultyName);
        facultyIds[facultyName] = facultyId;
      }
      
      const itSpecialties = [
        'Комп\'ютерні науки',
        'Програмна інженерія',
        'Кібербезпека',
        'Системний аналіз'
      ];
      
      const specialtyIds = {};
      
      for (const specialtyName of itSpecialties) {
        const specialtyId = await addSpecialty(specialtyName, facultyIds['Інформаційних технологій']);
        specialtyIds[specialtyName] = specialtyId;
      }
      
      const econSpecialties = [
        'Економіка підприємства',
        'Фінанси і кредит',
        'Менеджмент',
        'Маркетинг'
      ];
      
      for (const specialtyName of econSpecialties) {
        const specialtyId = await addSpecialty(specialtyName, facultyIds['Економічний']);
        specialtyIds[specialtyName] = specialtyId;
      }
      
      const csGroups = ['КН-21-1', 'КН-21-2', 'КН-22-1', 'КН-22-2', 'КН-23-1'];
      
      for (const groupName of csGroups) {
        await addGroup(groupName, specialtyIds['Комп\'ютерні науки']);
      }
      
      const seGroups = ['ПІ-21-1', 'ПІ-22-1', 'ПІ-23-1'];
      
      for (const groupName of seGroups) {
        await addGroup(groupName, specialtyIds['Програмна інженерія']);
      }
      
      const econGroups = ['ЕП-21-1', 'ЕП-22-1', 'ФК-21-1', 'МН-21-1', 'МК-21-1'];
      
      for (const groupName of econGroups) {
        if (groupName.startsWith('ЕП')) {
          await addGroup(groupName, specialtyIds['Економіка підприємства']);
        } else if (groupName.startsWith('ФК')) {
          await addGroup(groupName, specialtyIds['Фінанси і кредит']);
        } else if (groupName.startsWith('МН')) {
          await addGroup(groupName, specialtyIds['Менеджмент']);
        } else if (groupName.startsWith('МК')) {
          await addGroup(groupName, specialtyIds['Маркетинг']);
        }
      }
      

      return { success: true, message: 'Базові дані створено' };
    }
    
    return { success: true, message: 'Дані вже існують' };
  } catch (error) {
    console.error('Помилка ініціалізації базових даних:', error);
    return { success: false, error: error.message };
  }
}; 