import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Компонент поля введення з різними варіантами стилів
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.label - Мітка поля
 * @param {string} props.value - Значення поля
 * @param {Function} props.onChangeText - Функція, яка викликається при зміні тексту
 * @param {string} props.placeholder - Плейсхолдер
 * @param {boolean} props.secureTextEntry - Чи приховувати введений текст (для паролів)
 * @param {string} props.error - Текст помилки
 * @param {Object} props.style - Додаткові стилі для контейнера
 * @param {Object} props.inputStyle - Додаткові стилі для поля введення
 * @param {Object} props.labelStyle - Додаткові стилі для мітки
 * @param {string} props.leftIcon - Назва іконки зліва (Ionicons)
 * @param {string} props.rightIcon - Назва іконки справа (Ionicons)
 * @param {Function} props.onRightIconPress - Функція, яка викликається при натисканні на праву іконку
 * @param {string} props.keyboardType - Тип клавіатури
 * @param {boolean} props.multiline - Чи дозволяти введення кількох рядків
 * @param {number} props.numberOfLines - Кількість рядків для багаторядкового поля
 * @param {boolean} props.disabled - Чи вимкнене поле
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  style,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  keyboardType,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Функція для перемикання видимості пароля
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <View style={[
        styles.inputContainer, 
        error ? styles.inputError : {},
        disabled ? styles.inputDisabled : {}
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color="#5F6368" 
            style={styles.leftIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : {},
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : {},
            multiline ? styles.multilineInput : {},
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA0A6"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#5F6368" 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color="#5F6368" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#202124',
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  inputError: {
    borderColor: '#EA4335', // Google Red
  },
  inputDisabled: {
    backgroundColor: '#F1F3F4',
    opacity: 0.7,
  },
  errorText: {
    color: '#EA4335', // Google Red
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;

 