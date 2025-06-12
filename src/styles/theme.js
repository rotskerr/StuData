/**
 * Тема для застосунку
 */

// Кольори
export const colors = {
  // Основні кольори
  primary: '#4285F4',     // Google Blue
  secondary: '#5F6368',   // Google Grey
  success: '#34A853',     // Google Green
  danger: '#EA4335',      // Google Red
  warning: '#FBBC05',     // Google Yellow
  
  // Відтінки сірого
  background: '#F8F9FA',
  surface: '#FFFFFF',
  divider: '#E8EAED',
  
  // Текстові кольори
  textPrimary: '#202124',
  textSecondary: '#5F6368',
  textHint: '#9AA0A6',
  textDisabled: '#DADCE0',
  
  // Інші кольори
  link: '#1A73E8',
  overlay: 'rgba(32, 33, 36, 0.6)',
};

// Розміри тексту
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// Відступи
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Радіуси заокруглення
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Тіні
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Анімації
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Загальні стилі для компонентів
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.md,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.surface,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
};

export default {
  colors,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  animations,
  commonStyles,
}; 