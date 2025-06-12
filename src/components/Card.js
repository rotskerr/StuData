import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Компонент картки для відображення інформації
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.title - Заголовок картки
 * @param {React.ReactNode} props.children - Вміст картки
 * @param {Function} props.onPress - Функція, яка викликається при натисканні (якщо вказана, картка стає натискаємою)
 * @param {Object} props.style - Додаткові стилі для картки
 * @param {Object} props.titleStyle - Додаткові стилі для заголовка
 * @param {React.ReactNode} props.footer - Нижня частина картки
 * @param {React.ReactNode} props.rightComponent - Компонент для відображення справа від заголовка
 */
const Card = ({ 
  title, 
  children, 
  onPress, 
  style, 
  titleStyle,
  footer,
  rightComponent
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {rightComponent && (
            <View style={styles.rightComponent}>
              {rightComponent}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    flex: 1,
  },
  rightComponent: {
    marginLeft: 8,
  },
  content: {
    // Стилі для вмісту картки
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
});

export default Card; 