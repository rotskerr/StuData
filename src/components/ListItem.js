import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Компонент елемента списку
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.title - Заголовок елемента
 * @param {string} props.subtitle - Підзаголовок елемента
 * @param {Function} props.onPress - Функція, яка викликається при натисканні
 * @param {Object} props.style - Додаткові стилі для контейнера
 * @param {string} props.leftIcon - Назва іконки зліва (Ionicons)
 * @param {string} props.leftIconColor - Колір іконки зліва
 * @param {string} props.rightIcon - Назва іконки справа (Ionicons)
 * @param {Function} props.onRightIconPress - Функція, яка викликається при натисканні на праву іконку
 * @param {string} props.imageSrc - URL зображення для відображення зліва
 * @param {boolean} props.showChevron - Чи показувати стрілку справа
 * @param {React.ReactNode} props.rightComponent - Компонент для відображення справа
 * @param {boolean} props.divider - Чи показувати роздільник знизу
 */
const ListItem = ({
  title,
  subtitle,
  onPress,
  style,
  leftIcon,
  leftIconColor = '#5F6368',
  rightIcon,
  onRightIconPress,
  imageSrc,
  showChevron = false,
  rightComponent,
  divider = true,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        divider && styles.divider,
        style
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Ліва частина (іконка або зображення) */}
      {leftIcon && !imageSrc && (
        <View style={styles.leftIconContainer}>
          <Ionicons name={leftIcon} size={24} color={leftIconColor} />
        </View>
      )}
      
      {imageSrc && (
        <Image source={{ uri: imageSrc }} style={styles.image} />
      )}
      
      {/* Центральна частина (заголовок і підзаголовок) */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        )}
      </View>
      
      {/* Права частина (іконка, стрілка або компонент) */}
      {rightComponent && (
        <View style={styles.rightComponentContainer}>
          {rightComponent}
        </View>
      )}
      
      {rightIcon && !rightComponent && (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress || onPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name={rightIcon} size={24} color="#5F6368" />
        </TouchableOpacity>
      )}
      
      {showChevron && !rightIcon && !rightComponent && (
        <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  leftIconContainer: {
    marginRight: 16,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
  },
  subtitle: {
    fontSize: 14,
    color: '#5F6368',
    marginTop: 2,
  },
  rightIconContainer: {
    padding: 4,
  },
  rightComponentContainer: {
    marginLeft: 8,
  },
});

export default ListItem; 