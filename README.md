# Education Center Management System - Admin Panel

Ta'lim markazi boshqaruv tizimining admin paneli. FastAPI backend bilan ishlash uchun mo'ljallangan.

## Xususiyatlari

### Foydalanuvchilar boshqaruvi
- **O'quvchilar**: Yaratish, tahrirlash, ota-ona tayinlash, guruh o'zgartirish
- **O'qituvchilar**: Yaratish, tahrirlash, tayinlangan guruhlarni ko'rish
- **Ota-onalar**: Yaratish, tahrirlash, bolalarni ko'rish

### Ta'lim boshqaruvi
- **Guruhlar**: Yaratish, o'qituvchilarni fanlarga tayinlash
- **Fanlar**: Yaratish va boshqarish
- **Dars jadvali**: Haftalik jadval tuzish

### Boshqa funksiyalar
- **To'lovlar**: To'lovlarni yozib olish va kuzatish
- **Yangiliklar**: E'lonlar yaratish va nashr etish
- **Hisobotlar**: Tizim statistikasi va guruh natijalari
- **Parol boshqaruvi**: Admin barcha foydalanuvchilar parolini o'zgartira oladi

## O'rnatish

### 1. Loyihani klonlash
```bash
git clone <repository-url>
cd education-center-admin
```

### 2. Paketlarni o'rnatish
```bash
npm install
```

### 3. Environment o'rnatish
`.env` faylini yarating va backend URL ni qo'shing:
```
REACT_APP_API_URL=https://islomjonovabdulazim-toshmi-backend-ac2b.twc1.net
```

### 4. Loyihani ishga tushirish
```bash
npm start
```

Brauzerda `http://localhost:3000` ochiladi.

## Test ma'lumotlar

Backend texnik hujjatida ko'rsatilgan test ma'lumotlar:
- **Admin**: telefon=990330919, parol=admin123
- **O'qituvchi**: telefon=998901111111, parol=teacher123  
- **O'quvchi**: telefon=998902222222, parol=student123
- **Ota-ona**: telefon=998903333333, parol=parent123

## Loyiha tuzilishi

```
src/
├── components/          # Qayta ishlatiladigan komponentlar
│   ├── Layout/         # Asosiy tartib (Header, Sidebar)
│   ├── Common/         # Umumiy komponentlar (Button, Input, Modal)
│   └── Forms/          # Form komponentlari
├── pages/              # Sahifalar
│   ├── Users/          # Foydalanuvchilar sahifalari
│   ├── Academic/       # Ta'lim boshqaruvi sahifalari
│   └── ...            # Boshqa sahifalar
├── hooks/              # React hooks
├── services/           # API xizmatlari
├── utils/              # Yordamchi funksiyalar
└── styles/             # CSS fayllar
```

## Texnologiyalar

- **React 18** - Frontend framework
- **React Router** - Marshrutlash
- **React Context** - State boshqaruvi (Auth)
- **Fetch API** - Backend bilan aloqa
- **CSS** - Styling (minimal, clean design)

## API Integration

Backend bilan barcha aloqa `src/services/api.js` orqali amalga oshiriladi. JWT token authentication ishlatiladi.

## Production Build

```bash
npm run build
```

Build fayllar `build/` papkada paydo bo'ladi.