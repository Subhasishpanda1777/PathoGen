// Translation files index
// Imports all language translations from separate files

import en from './en.js'
import hi from './hi.js'
import bn from './bn.js'
import te from './te.js'
import mr from './mr.js'
import ta from './ta.js'
import gu from './gu.js'
import or from './or.js'

// Export all translations as an object
export const translations = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  gu,
  or,
}

// Helper function to get translation
export function t(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key
}
