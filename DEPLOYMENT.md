# 🚀 Інструкції з розгортання StuData

## 📋 Передумови

Перед початком переконайтеся, що у вас встановлено:

- **Node.js** (версія 16 або вище)
- **npm** або **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**
- Обліковий запис **Firebase**
- Обліковий запис **Expo** (для публікації)

## 🔧 Налаштування Firebase

### 1. Створення проєкту Firebase

1. Перейдіть на [Firebase Console](https://console.firebase.google.com/)
2. Натисніть "Create a project" або "Додати проєкт"
3. Введіть назву проєкту (наприклад, "StuData")
4. Увімкніть Google Analytics (опціонально)
5. Створіть проєкт

### 2. Налаштування Authentication

1. У Firebase Console перейдіть до **Authentication**
2. Натисніть "Get started"
3. Перейдіть на вкладку **Sign-in method**
4. Увімкніть **Email/Password** провайдер
5. Збережіть налаштування

### 3. Налаштування Firestore Database

1. Перейдіть до **Firestore Database**
2. Натисніть "Create database"
3. Виберіть **Start in test mode** (пізніше налаштуємо правила)
4. Виберіть локацію (найближчу до ваших користувачів)
5. Створіть базу даних

### 4. Налаштування правил безпеки

Скопіюйте правила з файлу `firestore.rules` у ваш Firebase проєкт:

1. У Firestore перейдіть до **Rules**
2. Замініть існуючі правила на вміст файлу `firestore.rules`
3. Опублікуйте правила

### 5. Отримання конфігурації

1. Перейдіть до **Project Settings** (іконка шестерні)
2. Прокрутіть до розділу **Your apps**
3. Натисніть на іконку **Web** (`</>`)
4. Зареєструйте додаток з назвою "StuData"
5. Скопіюйте конфігурацію Firebase

## 📱 Налаштування проєкту

### 1. Клонування репозиторію

```bash
git clone [URL_РЕПОЗИТОРІЮ]
cd StuData
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Конфігурація Firebase

Відредагуйте файл `src/config/firebase.js` та вставте вашу конфігурацію Firebase:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🏃‍♂️ Запуск у режимі розробки

### Локальний запуск

```bash
npx expo start
```

Це відкриє Expo Dev Tools у браузері. Ви можете:

- Сканувати QR-код за допомогою Expo Go на телефоні
- Натиснути `i` для запуску в iOS симуляторі
- Натиснути `a` для запуску в Android емуляторі
- Натиснути `w` для запуску у веб-браузері

### Тестування на пристрої

1. Встановіть **Expo Go** на ваш телефон:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Відскануйте QR-код з Expo Dev Tools

## 📦 Збірка для продакшену

### Android (APK)

```bash
# Збірка APK
npx eas build --platform android --profile preview

# Збірка AAB для Google Play
npx eas build --platform android --profile production
```

### iOS (IPA)

```bash
# Збірка для тестування
npx eas build --platform ios --profile preview

# Збірка для App Store
npx eas build --platform ios --profile production
```

### Веб-версія

```bash
npx expo export:web
```

## 🚀 Публікація

### Expo Updates

```bash
# Публікація оновлення
npx expo publish
```

### App Stores

1. **Google Play Store:**
   - Завантажте AAB файл у Google Play Console
   - Заповніть метадані додатку
   - Пройдіть процес ревізії

2. **Apple App Store:**
   - Завантажте IPA файл через Xcode або Application Loader
   - Заповніть метадані в App Store Connect
   - Подайте на ревізію

## 🔒 Безпека

### Змінні середовища

Для продакшену створіть файл `.env` з чутливими даними:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### Правила Firestore

Переконайтеся, що правила Firestore налаштовані правильно для продакшену.

## 🐛 Налагодження

### Поширені проблеми

1. **Firebase не підключається:**
   - Перевірте конфігурацію в `firebase.js`
   - Переконайтеся, що проєкт активний у Firebase Console

2. **Помилки збірки:**
   - Очистіть кеш: `npx expo r -c`
   - Перевстановіть залежності: `rm -rf node_modules && npm install`

3. **Проблеми з авторизацією:**
   - Перевірте налаштування Authentication у Firebase
   - Переконайтеся, що Email/Password увімкнено

### Логи

Для перегляду логів:

```bash
# Expo логи
npx expo logs

# Firebase логи
firebase functions:log
```

## 📊 Моніторинг

### Firebase Analytics

1. Увімкніть Google Analytics у Firebase Console
2. Додайте аналітику у код (опціонально)

### Crashlytics

1. Увімкніть Crashlytics у Firebase Console
2. Інтегруйте SDK для відстеження помилок

## 🔄 CI/CD

### GitHub Actions

Створіть файл `.github/workflows/build.yml` для автоматичної збірки:

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npx expo build:android
```

## 📞 Підтримка

Якщо виникають проблеми:

1. Перевірте [Expo документацію](https://docs.expo.dev/)
2. Перевірте [Firebase документацію](https://firebase.google.com/docs)
3. Створіть issue у репозиторії проєкту

---

**Успішного розгортання! 🚀** 