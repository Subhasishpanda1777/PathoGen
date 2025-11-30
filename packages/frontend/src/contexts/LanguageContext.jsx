import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

// 7 Indian languages + English
export const languages = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिंदी' },
  bn: { name: 'Bengali', native: 'বাংলা' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  mr: { name: 'Marathi', native: 'मराठी' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી' },
  or: { name: 'Odia', native: 'ଓଡ଼ିଆ' },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language')
    return savedLang || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.setAttribute('lang', language)
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

