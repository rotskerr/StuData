import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const AdminStatsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {
      total: 120,
      active: 98,
      blocked: 5,
      inactive: 17,
      newThisWeek: 12,
      newThisMonth: 28
    },
    tests: {
      total: 15,
      active: 8,
      draft: 4,
      archived: 3,
      averageScore: 78.5,
      averageCompletion: 85.2
    },
    completions: {
      total: 432,
      thisWeek: 87,
      thisMonth: 210,
      byFaculty: [
        { name: 'Інформаційних технологій', count: 156 },
        { name: 'Економіки', count: 98 },
        { name: 'Права', count: 75 },
        { name: 'Медицини', count: 65 },
        { name: 'Інші', count: 38 }
      ]
    }
  });

  // Симуляція завантаження даних
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setIsLoading(true);
    
    // Симулюємо завантаження даних з сервера
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    
    // Симулюємо оновлення даних
    setTimeout(() => {
      // Оновлюємо дані з невеликими змінами для демонстрації
      setStats(prevStats => ({
        ...prevStats,
        users: {
          ...prevStats.users,
          total: prevStats.users.total + Math.floor(Math.random() * 5),
          active: prevStats.users.active + Math.floor(Math.random() * 3),
          newThisWeek: Math.floor(Math.random() * 5) + 10
        },
        completions: {
          ...prevStats.completions,
          thisWeek: Math.floor(Math.random() * 20) + 80
        }
      }));
      setRefreshing(false);
    }, 1000);
  };

  const renderStatCard = (title, value, icon, color, subtitle = null) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderProgressBar = (title, value, total, color) => {
    const percentage = (value / total) * 100;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{title}</Text>
          <Text style={styles.progressValue}>{value} з {total} ({percentage.toFixed(1)}%)</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderFacultyStats = () => {
    const maxCount = Math.max(...stats.completions.byFaculty.map(f => f.count));
    
    return stats.completions.byFaculty.map((faculty, index) => {
      const percentage = (faculty.count / stats.completions.total) * 100;
      const barWidth = (faculty.count / maxCount) * 100;
      
      return (
        <View key={index} style={styles.facultyItem}>
          <View style={styles.facultyHeader}>
            <Text style={styles.facultyName}>{faculty.name}</Text>
            <Text style={styles.facultyCount}>{faculty.count}</Text>
          </View>
          <View style={styles.facultyBarContainer}>
            <View 
              style={[
                styles.facultyBar, 
                { width: `${barWidth}%`, backgroundColor: getColorForIndex(index) }
              ]} 
            />
          </View>
          <Text style={styles.facultyPercentage}>{percentage.toFixed(1)}%</Text>
        </View>
      );
    });
  };

  const getColorForIndex = (index) => {
    const colors = ['#4285F4', '#0F9D58', '#F4B400', '#DB4437', '#673AB7'];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження статистики...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Статистика</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchStats}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Загальна статистика</Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Користувачів', 
              stats.users.total, 
              'people', 
              '#4285F4', 
              `+${stats.users.newThisWeek} за тиждень`
            )}
            
            {renderStatCard(
              'Тестів', 
              stats.tests.total, 
              'document-text', 
              '#0F9D58', 
              `${stats.tests.active} активних`
            )}
            
            {renderStatCard(
              'Проходжень', 
              stats.completions.total, 
              'checkmark-circle', 
              '#F4B400', 
              `${stats.completions.thisWeek} за тиждень`
            )}
            
            {renderStatCard(
              'Сер. бал', 
              `${stats.tests.averageScore}%`, 
              'analytics', 
              '#DB4437'
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активність користувачів</Text>
          
          {renderProgressBar(
            'Активні користувачі', 
            stats.users.active, 
            stats.users.total, 
            '#4285F4'
          )}
          
          {renderProgressBar(
            'Заблоковані користувачі', 
            stats.users.blocked, 
            stats.users.total, 
            '#DB4437'
          )}
          
          {renderProgressBar(
            'Неактивні користувачі', 
            stats.users.inactive, 
            stats.users.total, 
            '#F4B400'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Проходження за факультетами</Text>
          
          <View style={styles.facultyContainer}>
            {renderFacultyStats()}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика тестів</Text>
          
          <View style={styles.testStatsContainer}>
            <View style={styles.testStatItem}>
              <View style={styles.testStatCircle}>
                <Text style={styles.testStatCircleValue}>{stats.tests.active}</Text>
              </View>
              <Text style={styles.testStatLabel}>Активних</Text>
            </View>
            
            <View style={styles.testStatItem}>
              <View style={[styles.testStatCircle, { backgroundColor: '#F4B400' }]}>
                <Text style={styles.testStatCircleValue}>{stats.tests.draft}</Text>
              </View>
              <Text style={styles.testStatLabel}>Чернеток</Text>
            </View>
            
            <View style={styles.testStatItem}>
              <View style={[styles.testStatCircle, { backgroundColor: '#DB4437' }]}>
                <Text style={styles.testStatCircleValue}>{stats.tests.archived}</Text>
              </View>
              <Text style={styles.testStatLabel}>Архівних</Text>
            </View>
          </View>
          
          <View style={styles.testCompletionContainer}>
            <Text style={styles.testCompletionTitle}>
              Середній відсоток завершення тестів
            </Text>
            <View style={styles.testCompletionBar}>
              <View 
                style={[
                  styles.testCompletionProgress, 
                  { width: `${stats.tests.averageCompletion}%` }
                ]} 
              />
            </View>
            <Text style={styles.testCompletionValue}>
              {stats.tests.averageCompletion}%
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
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
  refreshButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  facultyContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  facultyItem: {
    marginBottom: 15,
  },
  facultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  facultyName: {
    fontSize: 14,
    color: '#333',
  },
  facultyCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  facultyBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  facultyBar: {
    height: '100%',
    borderRadius: 4,
  },
  facultyPercentage: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  testStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  testStatItem: {
    alignItems: 'center',
  },
  testStatCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  testStatCircleValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  testStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  testCompletionContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  testCompletionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  testCompletionBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 5,
  },
  testCompletionProgress: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 6,
  },
  testCompletionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
});

export default AdminStatsScreen; 