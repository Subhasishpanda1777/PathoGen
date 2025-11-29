import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage, languages } from '../contexts/LanguageContext'
import '../styles/language-selector.css'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current && 
        dropdownRef.current && 
        !buttonRef.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('scroll', handleClickOutside, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleClickOutside, true)
    }
  }, [isOpen])

  const currentLang = languages[language] || languages.en

  // Calculate dropdown position relative to button
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const dropdown = dropdownRef.current
      
      // Position dropdown below button, aligned to right
      dropdown.style.top = `${buttonRect.bottom + 8}px`
      dropdown.style.right = `${window.innerWidth - buttonRect.right}px`
    }
  }, [isOpen])

  return (
    <>
      <div className="language-selector" ref={buttonRef}>
        <button
          className="language-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title="Select Language"
          aria-label="Select Language"
        >
          <Globe size={18} />
          <span className="language-code">{currentLang.native}</span>
          <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
        </button>
      </div>

      {isOpen && createPortal(
        <div className="language-dropdown-fixed" ref={dropdownRef}>
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              className={`language-option ${language === code ? 'active' : ''}`}
              onClick={() => {
                setLanguage(code)
                setIsOpen(false)
              }}
            >
              <span className="language-native">{lang.native}</span>
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

