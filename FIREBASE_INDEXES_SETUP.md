# 🔥 Налаштування індексів Firebase

## Проблема
При роботі з факультетами, спеціальностями та групами виникають помилки типу:
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Рішення

### Варіант 1: Автоматичне створення (Рекомендовано)

1. **Перейдіть за посиланням з помилки** - Firebase автоматично створить потрібний індекс
2. **Або скористайтеся Firebase CLI:**

```bash
# Встановіть Firebase CLI (якщо ще не встановлено)
npm install -g firebase-tools

# Увійдіть в обліковий запис
firebase login

# Ініціалізуйте проєкт (якщо ще не зроблено)
firebase init firestore

# Розгорніть індекси
firebase deploy --only firestore:indexes
```

### Варіант 2: Ручне створення в консолі

1. Перейдіть до [Firebase Console](https://console.firebase.google.com/)
2. Виберіть ваш проєкт
3. Перейдіть до **Firestore Database** → **Indexes**
4. Натисніть **Create Index**

#### Індекс для спеціальностей:
- **Collection ID**: `specialties`
- **Fields to index**:
  - `facultyId` (Ascending)
  - `name` (Ascending)

#### Індекс для груп:
- **Collection ID**: `groups`  
- **Fields to index**:
  - `specialtyId` (Ascending)
  - `name` (Ascending)

#### Індекс для результатів (за користувачем):
- **Collection ID**: `results`
- **Fields to index**:
  - `userId` (Ascending)
  - `completedAt` (Descending)

#### Індекс для результатів (за тестом):
- **Collection ID**: `results`
- **Fields to index**:
  - `testId` (Ascending)
  - `completedAt` (Descending)

## Перевірка

Після створення індексів:

1. **Зачекайте 5-10 хвилин** - індекси створюються не миттєво
2. **Перезапустіть додаток**
3. **Спробуйте створити нового користувача** та заповнити профіль

## Статус індексів

Ви можете перевірити статус індексів у Firebase Console:
- **Building** - індекс створюється
- **Ready** - індекс готовий до використання
- **Error** - помилка створення індексу

## Альтернативне рішення

Якщо індекси не працюють, ми вже **спростили запити** в коді:
- Видалили `orderBy` з запитів
- Додали сортування на клієнті
- Це повинно працювати без додаткових індексів

## Файли конфігурації

- `firestore.indexes.json` - конфігурація індексів для Firebase CLI
- `firestore.rules` - правила безпеки Firestore

---

**Примітка**: Індекси потрібні тільки для складних запитів з кількома умовами. Прості запити працюють без додаткових індексів. 