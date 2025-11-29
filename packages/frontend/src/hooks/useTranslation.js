import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'

/**
 * Custom hook for translations
 * Makes it easier to use translations in components
 */
export function useTranslation() {
  const { language } = useLanguage()
  
  return (key) => t(key, language)
}

