import { auth, firestore } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export const getGeneralStatistics = async () => {
  try {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const totalUsers = usersSnapshot.size;
    
    const testsCollection = collection(firestore, 'tests');
    const testsSnapshot = await getDocs(testsCollection);
    const totalTests = testsSnapshot.size;
    
    const testResultsCollection = collection(firestore, 'testResults');
    const testResultsSnapshot = await getDocs(testResultsCollection);
    const totalCompletedTests = testResultsSnapshot.size;
    
    let totalScore = 0;
    testResultsSnapshot.forEach(doc => {
      const data = doc.data();
      totalScore += data.score || 0;
    });
    
    const averageScore = totalCompletedTests > 0 ? totalScore / totalCompletedTests : 0;
    
    return {
      totalUsers,
      totalTests,
      totalCompletedTests,
      averageScore
    };
  } catch (error) {
    console.error('Помилка отримання загальної статистики:', error);
    throw error;
  }
};

export const getFacultyStatistics = async () => {
  try {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const facultyStats = {};
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const faculty = data.faculty || 'Не вказано';
      
      if (!facultyStats[faculty]) {
        facultyStats[faculty] = 0;
      }
      
      facultyStats[faculty] += 1;
    });
    
    const result = Object.keys(facultyStats).map(faculty => ({
      faculty,
      count: facultyStats[faculty]
    }));
    
    return result;
  } catch (error) {
    console.error('Помилка отримання статистики по факультетах:', error);
    throw error;
  }
};

export const getSpecialtyStatistics = async () => {
  try {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const specialtyStats = {};
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const specialty = data.specialty || 'Не вказано';
      
      if (!specialtyStats[specialty]) {
        specialtyStats[specialty] = 0;
      }
      
      specialtyStats[specialty] += 1;
    });
    
    const result = Object.keys(specialtyStats).map(specialty => ({
      specialty,
      count: specialtyStats[specialty]
    }));
    
    return result;
  } catch (error) {
    console.error('Помилка отримання статистики по спеціальностях:', error);
    throw error;
  }
};

export const getTestsStatistics = async () => {
  try {
    const testsCollection = collection(firestore, 'tests');
    const testsSnapshot = await getDocs(testsCollection);
    const tests = [];
    
    for (const testDoc of testsSnapshot.docs) {
      const testData = testDoc.data();
      const testId = testDoc.id;
      
      const userTestsCollection = collection(firestore, 'userTests');
      const q = query(userTestsCollection, where('testId', '==', testId));
      const resultsSnapshot = await getDocs(q);
      
      const totalAttempts = resultsSnapshot.size;
      let totalScore = 0;
      
      resultsSnapshot.forEach(doc => {
        totalScore += doc.data().score || 0;
      });
      
      const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
      
      tests.push({
        id: testId,
        title: testData.title,
        totalAttempts,
        averageScore
      });
    }
    
    return tests;
  } catch (error) {
    console.error('Помилка отримання статистики по тестах:', error);
    throw error;
  }
};

export const getChartData = async () => {
  try {
    const facultyStats = await getFacultyStatistics();
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const userTestsCollection = collection(firestore, 'userTests');
    const q = query(
      userTestsCollection,
      where('completedAt', '>=', Timestamp.fromDate(oneMonthAgo)),
      orderBy('completedAt', 'asc')
    );
    
    const resultsSnapshot = await getDocs(q);
    
    const dailyResults = {};
    
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.completedAt.toDate();
      const dateString = date.toISOString().split('T')[0]; // формат YYYY-MM-DD
      
      if (!dailyResults[dateString]) {
        dailyResults[dateString] = {
          totalScore: 0,
          count: 0
        };
      }
      
      dailyResults[dateString].totalScore += data.score || 0;
      dailyResults[dateString].count += 1;
    });
    
    const dailyData = Object.keys(dailyResults).map(date => ({
      date,
      averageScore: dailyResults[date].totalScore / dailyResults[date].count
    }));
    
    return {
      facultyData: facultyStats,
      dailyData: dailyData.sort((a, b) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    console.error('Помилка отримання даних для графіків:', error);
    throw error;
  }
}; 