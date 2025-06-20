# 🎓 StuData - Система тестування студентів

## 📋 Опис проєкту

**StuData** - це мобільний додаток для проведення тестування студентів університету, розроблений на React Native з використанням Firebase як backend.

### 🎯 Основні можливості:

#### Для студентів:
- 📝 Реєстрація та авторизація
- 👤 Налаштування профілю (факультет, спеціальність, група)
- 📚 Перегляд доступних тестів
- ⏱️ Проходження тестів з таймером
- 📊 Перегляд результатів та статистики
- 🏆 Відстеження прогресу навчання

#### Для адміністраторів:
- 👥 Управління користувачами (блокування, видалення, зміна ролей)
- 🏫 Управління структурою університету (факультети, спеціальності, групи)
- 📝 Створення та редагування тестів
- 📈 Перегляд статистики та звітів
- 📊 Аналіз результатів тестування

## 🛠️ Технології

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Firestore, Authentication)
- **Навігація**: React Navigation
- **Стан**: React Hooks
- **Стилізація**: StyleSheet (React Native)

## 📁 Структура проєкту

```
src/
├── components/          # Перевикористовувані компоненти
│   ├── Alert.js        # Кастомні алерти
│   ├── Button.js       # Кнопки
│   ├── Input.js        # Поля вводу
│   ├── Card.js         # Картки
│   └── ...
├── screens/            # Екрани додатку
│   ├── AuthScreen.js   # Авторизація
│   ├── HomeScreen.js   # Головний екран
│   ├── ProfileScreen.js # Профіль користувача
│   ├── TestsScreen.js  # Список тестів
│   ├── Admin*.js       # Адміністративні екрани
│   └── ...
├── services/           # Бізнес-логіка та API
│   ├── authService.js  # Авторизація
│   ├── testService.js  # Робота з тестами
│   ├── userService.js  # Управління користувачами
│   └── ...
├── navigation/         # Налаштування навігації
├── models/            # Моделі даних
├── utils/             # Допоміжні функції
└── config/            # Конфігурація Firebase
```

## 🚀 Запуск проєкту

### Передумови:
- Node.js (версія 16+)
- npm або yarn
- Expo CLI
- Firebase проєкт

### Кроки запуску:

1. **Клонування репозиторію:**
   ```bash
   git clone https://github.com/rotskerr/StuData.git
   cd StuData
   ```

2. **Встановлення залежностей:**
   ```bash
   npm install
   ```

3. **Налаштування Firebase:**
   - Створіть проєкт у Firebase Console
   - Увімкніть Authentication та Firestore
   - Скопіюйте конфігурацію в `src/config/firebase.js`

4. **Запуск додатку:**
   ```bash
   npx expo start
   ```

## 🔥 Налаштування Firebase

### Колекції Firestore:
- `users` - дані користувачів
- `faculties` - факультети
- `specialties` - спеціальності  
- `groups` - групи
- `tests` - тести
- `results` - результати тестування

### Індекси (створюються автоматично):
- `specialties`: `facultyId` + `name`
- `groups`: `specialtyId` + `name`
- `results`: `userId` + `completedAt`

## 👤 Тестові облікові записи

### Адміністратор:
- **Email**: admin@studata.com
- **Пароль**: admin123

### Студент:
- Створюється через реєстрацію в додатку

## 🎨 Особливості UI/UX

- **Material Design** - сучасний дизайн
- **Адаптивність** - працює на різних розмірах екранів
- **Анімації** - плавні переходи між екранами
- **Доступність** - підтримка screen readers

## 📊 Функціональність тестування

### Типи питань:
- Одиночний вибір (radio)
- Множинний вибір (checkbox)
- Текстова відповідь (input)

### Можливості:
- ⏱️ Таймер для тестів
- 📈 Миттєвий розрахунок результатів
- 📊 Детальна статистика

## 🔐 Безпека

- Firebase Authentication для авторизації
- Правила безпеки Firestore
- Валідація даних на клієнті та сервері
- Захист від несанкціонованого доступу

## 📱 Підтримувані платформи

- **iOS** (через Expo Go або нативна збірка)
- **Android** (через Expo Go або нативна збірка)
- **Web** (обмежена підтримка через Expo Web)

## 🧪 Тестування

Проєкт включає:
- Валідацію форм
- Обробку помилок
- Логування для відлагодження
- Тестові дані для демонстрації

## 📈 Можливості розширення

- Push-нотифікації
- Офлайн режим
- Експорт результатів у PDF/Excel
- Інтеграція з LMS системами
- Відеоконференції для онлайн тестів

## 🤝 Внесок у проєкт

Проєкт розроблений як навчальний і демонструє:
- Архітектуру мобільного додатку
- Інтеграцію з Firebase
- Управління станом у React Native
- Створення адміністративних панелей
- Роботу з формами та валідацією

## 📞 Контакти

**Розробник**: Войчишин Владислав  
**GitHub**: [rotskerr](https://github.com/rotskerr)  
**Репозиторій**: [StuData](https://github.com/rotskerr/StuData)

---

**Примітка для викладача**: Проєкт повністю функціональний і готовий до демонстрації. Всі основні функції реалізовані та протестовані. 