import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const getTestResultsForReport = async (filters = {}) => {
  try {
    let q = collection(firestore, 'testResults');
    
    if (filters.testId) {
      q = query(q, where('testId', '==', filters.testId));
    } else if (filters.facultyId) {
      q = query(q, where('userFacultyId', '==', filters.facultyId));
    } else if (filters.specialtyId) {
      q = query(q, where('userSpecialtyId', '==', filters.specialtyId));
    } else if (filters.groupId) {
      q = query(q, where('userGroupId', '==', filters.groupId));
    }
    
    const snapshot = await getDocs(q);
    const results = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date()
      });
    });
    
    let filteredResults = results;
    
    if (filters.testId && filters.facultyId) {
      filteredResults = results.filter(r => r.userFacultyId === filters.facultyId);
    }
    if (filters.testId && filters.specialtyId) {
      filteredResults = results.filter(r => r.userSpecialtyId === filters.specialtyId);
    }
    if (filters.testId && filters.groupId) {
      filteredResults = results.filter(r => r.userGroupId === filters.groupId);
    }
    
    filteredResults.sort((a, b) => b.completedAt - a.completedAt);
    
    return filteredResults;
  } catch (error) {
    console.error('Помилка отримання результатів для звіту:', error);
    throw error;
  }
};

export const getDetailedStatistics = async (filters = {}) => {
  try {
    const results = await getTestResultsForReport(filters);
    
    if (results.length === 0) {
      return {
        totalResults: 0,
        averageScore: 0,
        averageTime: 0,
        passRate: 0,
        scoreDistribution: {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0
        },
        facultyStats: {},
        specialtyStats: {},
        groupStats: {}
      };
    }
    
    const totalResults = results.length;
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const totalTime = results.reduce((sum, result) => sum + (result.timeSpent || 0), 0);
    const passedResults = results.filter(result => (result.score || 0) >= 60);
    
    const averageScore = totalScore / totalResults;
    const averageTime = totalTime / totalResults;
    const passRate = (passedResults.length / totalResults) * 100;
    
    const scoreDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    results.forEach(result => {
      const score = result.score || 0;
      if (score <= 20) scoreDistribution['0-20']++;
      else if (score <= 40) scoreDistribution['21-40']++;
      else if (score <= 60) scoreDistribution['41-60']++;
      else if (score <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    });
    
    const facultyStats = {};
    const specialtyStats = {};
    const groupStats = {};
    
    results.forEach(result => {
      const faculty = result.userFacultyName || 'Невідомо';
      if (!facultyStats[faculty]) {
        facultyStats[faculty] = { count: 0, totalScore: 0, passed: 0 };
      }
      facultyStats[faculty].count++;
      facultyStats[faculty].totalScore += result.score || 0;
      if ((result.score || 0) >= 60) facultyStats[faculty].passed++;
      
      const specialty = result.userSpecialtyName || 'Невідомо';
      if (!specialtyStats[specialty]) {
        specialtyStats[specialty] = { count: 0, totalScore: 0, passed: 0 };
      }
      specialtyStats[specialty].count++;
      specialtyStats[specialty].totalScore += result.score || 0;
      if ((result.score || 0) >= 60) specialtyStats[specialty].passed++;
      
      const group = result.userGroupName || 'Невідомо';
      if (!groupStats[group]) {
        groupStats[group] = { count: 0, totalScore: 0, passed: 0 };
      }
      groupStats[group].count++;
      groupStats[group].totalScore += result.score || 0;
      if ((result.score || 0) >= 60) groupStats[group].passed++;
    });
    
    return {
      totalResults,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTime: Math.round(averageTime / 60), // в хвилинах
      passRate: Math.round(passRate * 100) / 100,
      scoreDistribution,
      facultyStats,
      specialtyStats,
      groupStats
    };
  } catch (error) {
    console.error('Помилка отримання статистики:', error);
    throw error;
  }
};

const generateReportHTML = (testInfo, statistics, results) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Звіт по тесту</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #4285F4;
          padding-bottom: 20px;
        }
        .title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #4285F4;
          margin-bottom: 10px;
        }
        .subtitle { 
          font-size: 16px; 
          color: #666; 
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 15px;
          color: #333;
          border-left: 4px solid #4285F4;
          padding-left: 10px;
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 15px; 
          margin-bottom: 20px;
        }
        .stat-card { 
          background: #f8f9fa; 
          padding: 15px; 
          border-radius: 8px; 
          text-align: center;
          border: 1px solid #e9ecef;
        }
        .stat-value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #4285F4; 
        }
        .stat-label { 
          font-size: 14px; 
          color: #666; 
          margin-top: 5px;
        }
        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
        }
        .table th, .table td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left; 
        }
        .table th { 
          background-color: #4285F4; 
          color: white; 
          font-weight: bold;
        }
        .table tr:nth-child(even) { 
          background-color: #f8f9fa; 
        }
        .distribution { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
          gap: 10px; 
        }
        .distribution-item { 
          background: #f8f9fa; 
          padding: 10px; 
          border-radius: 5px; 
          text-align: center;
          border: 1px solid #e9ecef;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Звіт по результатах тестування</div>
        <div class="subtitle">${testInfo?.title || 'Загальний звіт'}</div>
        <div class="subtitle">Згенеровано: ${formatDate(new Date())}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Загальна статистика</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${statistics.totalResults}</div>
            <div class="stat-label">Всього результатів</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics.averageScore}%</div>
            <div class="stat-label">Середній бал</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics.averageTime} хв</div>
            <div class="stat-label">Середній час</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics.passRate}%</div>
            <div class="stat-label">Відсоток успішності</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Розподіл балів</div>
        <div class="distribution">
          ${Object.entries(statistics.scoreDistribution).map(([range, count]) => `
            <div class="distribution-item">
              <div style="font-weight: bold;">${range}%</div>
              <div>${count} студентів</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${Object.keys(statistics.facultyStats).length > 0 ? `
      <div class="section">
        <div class="section-title">Статистика по факультетах</div>
        <table class="table">
          <thead>
            <tr>
              <th>Факультет</th>
              <th>Кількість</th>
              <th>Середній бал</th>
              <th>Успішність</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(statistics.facultyStats).map(([faculty, stats]) => `
              <tr>
                <td>${faculty}</td>
                <td>${stats.count}</td>
                <td>${Math.round((stats.totalScore / stats.count) * 100) / 100}%</td>
                <td>${Math.round((stats.passed / stats.count) * 100)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${Object.keys(statistics.specialtyStats).length > 0 ? `
      <div class="section">
        <div class="section-title">Статистика по спеціальностях</div>
        <table class="table">
          <thead>
            <tr>
              <th>Спеціальність</th>
              <th>Кількість</th>
              <th>Середній бал</th>
              <th>Успішність</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(statistics.specialtyStats).map(([specialty, stats]) => `
              <tr>
                <td>${specialty}</td>
                <td>${stats.count}</td>
                <td>${Math.round((stats.totalScore / stats.count) * 100) / 100}%</td>
                <td>${Math.round((stats.passed / stats.count) * 100)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${Object.keys(statistics.groupStats).length > 0 ? `
      <div class="section">
        <div class="section-title">Статистика по групах</div>
        <table class="table">
          <thead>
            <tr>
              <th>Група</th>
              <th>Кількість</th>
              <th>Середній бал</th>
              <th>Успішність</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(statistics.groupStats).map(([group, stats]) => `
              <tr>
                <td>${group}</td>
                <td>${stats.count}</td>
                <td>${Math.round((stats.totalScore / stats.count) * 100) / 100}%</td>
                <td>${Math.round((stats.passed / stats.count) * 100)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Звіт згенеровано автоматично системою StuData</p>
        <p>Дата генерації: ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `;
};

const generateCSVData = (statistics, results) => {
  const csvRows = [];
  
  csvRows.push('Звіт по результатах тестування');
  csvRows.push(`Згенеровано: ${new Date().toLocaleDateString('uk-UA')}`);
  csvRows.push('');
  
  csvRows.push('Загальна статистика');
  csvRows.push(`Всього результатів,${statistics.totalResults}`);
  csvRows.push(`Середній бал (%),${statistics.averageScore}`);
  csvRows.push(`Середній час (хв),${statistics.averageTime}`);
  csvRows.push(`Відсоток успішності (%),${statistics.passRate}`);
  csvRows.push('');
  
  csvRows.push('Розподіл балів');
  csvRows.push('Діапазон,Кількість студентів');
  Object.entries(statistics.scoreDistribution).forEach(([range, count]) => {
    csvRows.push(`${range}%,${count}`);
  });
  csvRows.push('');
  
  if (results.length > 0) {
    csvRows.push('Детальні результати');
    csvRows.push('Email студента,Факультет,Спеціальність,Група,Бал (%),Час (хв),Дата завершення');
    
    results.forEach(result => {
      const completedDate = result.completedAt ? 
        new Date(result.completedAt.seconds * 1000).toLocaleDateString('uk-UA') : 
        'Невідомо';
      
      csvRows.push([
        result.userEmail || 'Невідомо',
        result.userFacultyName || 'Невідомо',
        result.userSpecialtyName || 'Невідомо',
        result.userGroupName || 'Невідомо',
        result.score || 0,
        Math.round((result.timeSpent || 0) / 60),
        completedDate
      ].join(','));
    });
  }
  
  return csvRows.join('\n');
};

export const generatePDFReport = async (filters = {}, testInfo = null) => {
  try {
    const statistics = await getDetailedStatistics(filters);
    const results = await getTestResultsForReport(filters);
    
    const htmlContent = generateReportHTML(testInfo, statistics, results);
    
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });
    
    return {
      success: true,
      filePath: uri,
      fileName: `test_report_${Date.now()}.pdf`
    };
  } catch (error) {
    console.error('Помилка генерації PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateExcelReport = async (filters = {}, testInfo = null) => {
  try {
    const statistics = await getDetailedStatistics(filters);
    const results = await getTestResultsForReport(filters);
    
    const csvContent = generateCSVData(statistics, results);
    
    const fileName = `test_report_${Date.now()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return {
      success: true,
      filePath: fileUri,
      fileName: fileName
    };
  } catch (error) {
    console.error('Помилка генерації CSV:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const shareReport = async (filePath, fileName) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Функція поділитися недоступна на цьому пристрої');
    }
    
    await Sharing.shareAsync(filePath, {
      mimeType: filePath.endsWith('.pdf') ? 'application/pdf' : 'text/csv',
      dialogTitle: 'Поділитися звітом',
      UTI: filePath.endsWith('.pdf') ? 'com.adobe.pdf' : 'public.comma-separated-values-text'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Помилка поділитися звітом:', error);
    return { success: false, error: error.message };
  }
};

export const cleanupReportFiles = async () => {
  try {
    const documentDir = FileSystem.documentDirectory;
    const files = await FileSystem.readDirectoryAsync(documentDir);
    
    const reportFiles = files.filter(file => 
      file.includes('test_report_') && 
      (file.endsWith('.pdf') || file.endsWith('.csv'))
    );
    
    for (const file of reportFiles) {
      await FileSystem.deleteAsync(documentDir + file);
    }
    
    return { success: true, deletedCount: reportFiles.length };
  } catch (error) {
    console.error('Помилка очищення файлів:', error);
    return { success: false, error: error.message };
  }
}; 