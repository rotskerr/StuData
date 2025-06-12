import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';

/**
 * Компонент кнопки з різними варіантами стилів
 * 
 * @param {Object} props - Властивості компонента
 * @param {string} props.title - Текст кнопки
 * @param {Function} props.onPress - Функція, яка викликається при натисканні
 * @param {string} props.type - Тип кнопки ('primary', 'secondary', 'danger', 'success', 'outline')
 * @param {boolean} props.loading - Чи відображати індикатор завантаження
 * @param {boolean} props.disabled - Чи вимкнена кнопка
 * @param {Object} props.style - Додаткові стилі для кнопки
 * @param {Object} props.textStyle - Додаткові стилі для тексту
 * @param {string} props.icon - Іконка (компонент)
 * @param {string} props.iconPosition - Позиція іконки ('left', 'right')
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left'
}) => {
  // Визначаємо стилі кнопки залежно від типу
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'success':
        return styles.successButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // Визначаємо стилі тексту залежно від типу
  const getTextStyle = () => {
    switch (type) {
      case 'outline':
        return styles.outlineButtonText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled || loading ? styles.disabledButton : {},
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#4285F4', // Google Blue
  },
  secondaryButton: {
    backgroundColor: '#5F6368', // Google Grey
  },
  dangerButton: {
    backgroundColor: '#EA4335', // Google Red
  },
  successButton: {
    backgroundColor: '#34A853', // Google Green
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button; 