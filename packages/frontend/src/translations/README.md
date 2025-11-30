# Translation System Guide

## Overview

This project supports **7 languages** (English + 6 Indian languages):
- English (en)
- Hindi (hi) - हिंदी
- Bengali (bn) - বাংলা
- Telugu (te) - తెలుగు
- Marathi (mr) - मराठी
- Tamil (ta) - தமிழ்
- Gujarati (gu) - ગુજરાતી

## File Structure

Each language has its own separate file for easy editing:

```
translations/
├── index.js      # Main file that imports all languages
├── en.js         # English translations
├── hi.js         # Hindi translations (हिंदी)
├── bn.js         # Bengali translations (বাংলা)
├── te.js         # Telugu translations (తెలుగు)
├── mr.js         # Marathi translations (मराठी)
├── ta.js         # Tamil translations (தமிழ்)
└── gu.js         # Gujarati translations (ગુજરાતી)
```

## How to Edit Translations

### Step 1: Open the Language File

To edit translations for a specific language, open the corresponding file:
- `en.js` for English
- `hi.js` for Hindi
- `bn.js` for Bengali
- `te.js` for Telugu
- `mr.js` for Marathi
- `ta.js` for Tamil
- `gu.js` for Gujarati

### Step 2: Find the Translation Key

Each translation file contains an object with key-value pairs. For example:

```javascript
export default {
  dashboard: 'Dashboard',
  medicines: 'Medicines',
  login: 'Login',
  // ... more translations
}
```

### Step 3: Edit the Value

Simply change the value (the text after the colon) to your desired translation:

```javascript
// Before
dashboard: 'Dashboard',

// After (Hindi example)
dashboard: 'डैशबोर्ड',
```

### Step 4: Save the File

Save the file and the changes will be reflected immediately in the application when you switch to that language.

## Example: Adding a New Translation

1. **Add to English file first** (`en.js`):
```javascript
export default {
  // ... existing translations
  myNewKey: 'My New Text',
}
```

2. **Add to all other language files** with appropriate translations:
```javascript
// hi.js (Hindi)
myNewKey: 'मेरा नया पाठ',

// bn.js (Bengali)
myNewKey: 'আমার নতুন পাঠ্য',

// ... and so on for all languages
```

3. **Use in your component**:
```javascript
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'

function MyComponent() {
  const { language } = useLanguage()
  return <div>{t('myNewKey', language)}</div>
}
```

## Translation Keys Reference

All translation keys are organized by category:

- **Navigation**: `dashboard`, `medicines`, `myCart`, `aboutUs`, `profile`, `logout`, `login`, `register`, `home`
- **Common Actions**: `save`, `cancel`, `delete`, `edit`, `search`, `loading`, `error`, `success`, `close`, `reset`
- **Medicines**: `findAffordableMedicines`, `searchByMedicineName`, `price`, `strength`, `manufacturer`, etc.
- **Reports**: `submitReport`, `selectYourSymptoms`, `duration`, `severity`, `location`, etc.
- **Dashboard**: `activeOutbreaks`, `recentReports`, `trendingDiseases`, `infectionIndex`, etc.
- **Profile**: `myProfile`, `editProfile`, `name`, `email`, `phone`, `address`, etc.
- **Home Page**: `getStarted`, `trackOutbreaks`, `findMedicinesTitle`, `saveLives`, etc.
- **Footer**: `quickLinks`, `legal`, `privacyPolicy`, `termsOfService`, `contact`, etc.

## Best Practices

1. **Always update English first**: English (`en.js`) is the base language. Add new keys here first.

2. **Keep keys consistent**: Use the same key name across all language files.

3. **Use descriptive keys**: Key names should clearly indicate what they represent (e.g., `submitReport` not `submit`).

4. **Maintain formatting**: Keep the same structure and formatting across all language files.

5. **Test after changes**: After editing translations, test the application to ensure everything displays correctly.

## Language Switching

Users can switch languages using the language selector in the navbar. The selected language is saved in localStorage and persists across page reloads.

## Technical Details

- Translations are loaded dynamically from separate files
- The `t()` function handles missing translations gracefully (falls back to English)
- Language preference is stored in localStorage
- All components use the `useLanguage()` hook to access current language

## Need Help?

If you need to add a new translation key:
1. Add it to `en.js` first
2. Add it to all other language files
3. Use `t('yourKey', language)` in your component

For questions or issues, refer to the main project documentation.

