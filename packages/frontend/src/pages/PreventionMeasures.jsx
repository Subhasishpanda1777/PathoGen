import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Shield, MapPin, AlertCircle, CheckCircle, Bell, BellOff } from 'lucide-react'
import { dashboardAPI, authAPI } from '../utils/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations'
import '../styles/prevention-measures.css'

gsap.registerPlugin(ScrollTrigger)

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

// Mock prevention measures data
const mockPreventionMeasures = {
  "Dengue": [
    {
      id: "dengue-1",
      title: "Mosquito Control and Environmental Management",
      description: "Comprehensive mosquito control strategies to prevent dengue transmission by eliminating breeding sites",
      measures: [
        "Remove standing water from containers, flower pots, buckets, and gutters weekly",
        "Cover water storage containers with tight-fitting lids",
        "Clean and scrub containers to remove mosquito eggs before refilling",
        "Dispose of unused containers, tires, and items that can collect water",
        "Use larvicides (temephos) in water storage containers that cannot be emptied",
        "Organize community cleanup drives to remove potential mosquito breeding sites",
        "Ensure proper drainage systems to prevent water accumulation",
        "Keep swimming pools clean and chlorinated"
      ],
      category: "Environmental",
      priority: "high",
      source: "WHO"
    },
    {
      id: "dengue-2",
      title: "Personal Protection Measures",
      description: "Individual protection strategies to prevent mosquito bites",
      measures: [
        "Apply DEET-based (20-30%) or picaridin-based insect repellents on exposed skin",
        "Reapply repellent every 4-6 hours or as directed",
        "Wear light-colored, long-sleeved shirts and long pants",
        "Use permethrin-treated clothing for additional protection",
        "Sleep under insecticide-treated bed nets, especially during daytime",
        "Install window and door screens to prevent mosquito entry",
        "Use air conditioning when available to keep mosquitoes away",
        "Avoid outdoor activities during peak mosquito hours (early morning and late afternoon)"
      ],
      category: "Hygiene",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Malaria": [
    {
      id: "malaria-1",
      title: "Vector Control and Environmental Management",
      description: "Comprehensive mosquito control strategies to prevent malaria transmission",
      measures: [
        "Sleep under insecticide-treated bed nets (ITNs) every night",
        "Ensure bed nets are properly installed and not torn",
        "Re-treat bed nets with insecticide every 6-12 months",
        "Support indoor residual spraying (IRS) programs in your community",
        "Eliminate all mosquito breeding sites (stagnant water, puddles)",
        "Drain and fill water-logged areas around your home",
        "Use larvicides in water bodies that cannot be drained",
        "Install window and door screens",
        "Use mosquito coils or vaporizers in living areas"
      ],
      category: "Environmental",
      priority: "high",
      source: "WHO"
    },
    {
      id: "malaria-2",
      title: "Chemoprevention and Medication",
      description: "Medication-based prevention for high-risk individuals and travelers",
      measures: [
        "Take antimalarial prophylaxis if traveling to or living in endemic areas",
        "Start prophylaxis 1-2 weeks before travel and continue 4 weeks after return",
        "Complete full course of preventive medication as prescribed by doctor",
        "Consult healthcare provider before taking antimalarial drugs",
        "Inform doctor about any existing medical conditions or medications",
        "Monitor for side effects and report immediately if any occur",
        "Pregnant women in endemic areas should take preventive medication as recommended"
      ],
      category: "Medical",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Tuberculosis": [
    {
      id: "tb-1",
      title: "BCG Vaccination",
      description: "Get vaccinated with BCG vaccine, especially for children and high-risk individuals",
      measures: [
        "Ensure BCG vaccination is given to newborns within first year",
        "Complete BCG vaccination schedule as recommended by healthcare provider",
        "High-risk individuals should consult doctor about BCG vaccination",
        "Keep vaccination records updated",
        "Follow up with healthcare provider for vaccination status"
      ],
      category: "Vaccination",
      priority: "high",
      source: "MoHFW"
    },
    {
      id: "tb-2",
      title: "Infection Control and Hygiene",
      description: "Prevent TB transmission through proper hygiene and infection control measures",
      measures: [
        "Cover mouth and nose with tissue or elbow when coughing or sneezing",
        "Dispose of used tissues immediately in a sealed bag",
        "Wash hands frequently with soap and water, especially after coughing",
        "Avoid spitting in public places",
        "Use separate utensils and personal items if living with TB patient",
        "Ensure good ventilation in living spaces",
        "Open windows regularly to allow fresh air circulation"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    },
    {
      id: "tb-3",
      title: "Early Detection and Treatment",
      description: "Early diagnosis and complete treatment to prevent spread and complications",
      measures: [
        "Get tested if you have persistent cough for more than 2 weeks",
        "Complete full course of TB treatment as prescribed (6-9 months)",
        "Do not stop medication even if symptoms improve",
        "Take medication at the same time every day",
        "Attend all follow-up appointments with healthcare provider",
        "Inform close contacts to get tested if you are diagnosed with TB",
        "Support TB patients to complete their treatment"
      ],
      category: "Medical",
      priority: "high",
      source: "ICMR"
    },
    {
      id: "tb-4",
      title: "Nutrition and Immune Support",
      description: "Maintain good nutrition and immune health to prevent TB infection",
      measures: [
        "Eat a balanced diet rich in proteins, vitamins, and minerals",
        "Include foods high in vitamin D (fish, eggs, fortified foods)",
        "Maintain healthy body weight",
        "Avoid excessive alcohol consumption",
        "Quit smoking as it increases TB risk",
        "Manage diabetes and other chronic conditions properly",
        "Get adequate sleep and rest"
      ],
      category: "Lifestyle",
      priority: "medium",
      source: "ICMR"
    }
  ],
  "Chikungunya": [
    {
      id: "chikungunya-1",
      title: "Mosquito Control and Prevention",
      description: "Comprehensive measures to prevent Aedes mosquito bites and breeding",
      measures: [
        "Eliminate all mosquito breeding sites (containers, flower pots, tires)",
        "Remove standing water from around your home weekly",
        "Cover water storage containers with tight lids",
        "Use mosquito repellents containing DEET (20-30%) or picaridin on exposed skin",
        "Wear light-colored, long-sleeved shirts and long pants",
        "Use mosquito nets while sleeping, especially during daytime",
        "Install window and door screens to prevent mosquito entry",
        "Use mosquito coils or vaporizers in living areas",
        "Avoid outdoor activities during peak mosquito hours (early morning and late afternoon)",
        "Support community-wide mosquito control programs"
      ],
      category: "Environmental",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Typhoid": [
    {
      id: "typhoid-1",
      title: "Food and Water Safety",
      description: "Comprehensive food and water hygiene practices to prevent typhoid",
      measures: [
        "Drink only boiled, filtered, or treated water",
        "Avoid ice cubes made from untreated water",
        "Wash hands thoroughly with soap before eating and after using toilet",
        "Eat only well-cooked, hot food",
        "Avoid raw fruits and vegetables unless properly washed and peeled",
        "Avoid street food and unhygienic food vendors",
        "Choose restaurants with good hygiene practices",
        "Avoid raw or undercooked seafood",
        "Use bottled water for drinking and brushing teeth when traveling",
        "Practice safe food handling and storage at home"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    },
    {
      id: "typhoid-2",
      title: "Vaccination",
      description: "Get vaccinated against typhoid for protection",
      measures: [
        "Get typhoid vaccine before traveling to endemic areas",
        "Two types available: injectable (Vi polysaccharide) and oral (live attenuated)",
        "Complete full vaccination schedule as recommended",
        "Get booster shots every 2-3 years for injectable vaccine",
        "Oral vaccine requires 4 doses taken every other day",
        "Consult healthcare provider to determine best vaccine type for you",
        "Vaccination is especially important for travelers to South Asia"
      ],
      category: "Vaccination",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Hepatitis A": [
    {
      id: "hepatitis-1",
      title: "Hygiene and Sanitation",
      description: "Comprehensive hygiene practices to prevent Hepatitis A transmission",
      measures: [
        "Wash hands thoroughly with soap and water for at least 20 seconds",
        "Wash hands before preparing food, eating, and after using toilet",
        "Avoid contaminated food and water, especially in areas with poor sanitation",
        "Drink only treated or bottled water when traveling",
        "Practice safe food handling and preparation",
        "Cook food thoroughly and avoid raw or undercooked shellfish",
        "Avoid sharing personal items like towels, razors, or eating utensils",
        "Maintain clean living environment and proper waste disposal",
        "Use proper sanitation facilities"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    },
    {
      id: "hepatitis-2",
      title: "Vaccination",
      description: "Get vaccinated against Hepatitis A for long-term protection",
      measures: [
        "Get Hepatitis A vaccine (two-dose series recommended)",
        "First dose provides protection, second dose (6-12 months later) provides long-term immunity",
        "Vaccination is especially recommended for travelers to endemic areas",
        "Children should receive vaccine as part of routine immunization",
        "High-risk groups (healthcare workers, food handlers) should prioritize vaccination",
        "Consult healthcare provider for vaccination schedule"
      ],
      category: "Vaccination",
      priority: "high",
      source: "WHO"
    }
  ],
  "Influenza": [
    {
      id: "influenza-1",
      title: "Annual Vaccination",
      description: "Get annual flu vaccine to prevent influenza",
      measures: [
        "Get flu vaccine every year before flu season",
        "Vaccination is especially important for high-risk groups",
        "Children, elderly, and pregnant women should prioritize vaccination",
        "Vaccine effectiveness varies each year but still provides protection"
      ],
      category: "Vaccination",
      priority: "high",
      source: "WHO"
    },
    {
      id: "influenza-2",
      title: "Preventive Practices",
      description: "Daily practices to reduce flu transmission",
      measures: [
        "Wash hands frequently with soap and water",
        "Avoid close contact with sick people",
        "Stay home when you are sick",
        "Cover your mouth and nose when coughing or sneezing",
        "Clean and disinfect frequently touched surfaces"
      ],
      category: "Hygiene",
      priority: "medium",
      source: "WHO"
    }
  ],
  "Diarrhea": [
    {
      id: "diarrhea-1",
      title: "Water, Sanitation, and Hygiene (WASH)",
      description: "Comprehensive WASH practices to prevent diarrheal diseases",
      measures: [
        "Drink only safe, treated, or boiled water",
        "Use proper sanitation facilities and maintain cleanliness",
        "Wash hands with soap and water for at least 20 seconds",
        "Wash hands after using toilet, before eating, and before preparing food",
        "Practice safe food handling, preparation, and storage",
        "Cook food thoroughly and eat while still hot",
        "Avoid raw or undercooked foods, especially meat and seafood",
        "Wash fruits and vegetables thoroughly before eating",
        "Use clean utensils and serving dishes",
        "Maintain clean kitchen and food preparation areas",
        "Dispose of waste properly and maintain clean environment"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    },
    {
      id: "diarrhea-2",
      title: "Oral Rehydration and Treatment",
      description: "Proper management to prevent dehydration and complications",
      measures: [
        "Drink oral rehydration solution (ORS) at first sign of diarrhea",
        "Continue breastfeeding for infants (do not stop during diarrhea)",
        "Eat small, frequent, light meals (banana, rice, toast)",
        "Avoid sugary drinks, caffeine, and alcohol which can worsen diarrhea",
        "Stay hydrated with clean water and ORS",
        "Seek medical attention if diarrhea persists more than 2-3 days",
        "Watch for signs of dehydration (dry mouth, decreased urination, dizziness)",
        "Children and elderly are at higher risk - monitor closely",
        "Do not self-medicate with antibiotics without doctor's prescription"
      ],
      category: "Medical",
      priority: "high",
      source: "WHO"
    }
  ],
  "Cholera": [
    {
      id: "cholera-1",
      title: "Safe Water and Sanitation",
      description: "Critical measures to prevent cholera transmission through contaminated water",
      measures: [
        "Drink only boiled, filtered, or chlorinated water",
        "Use bottled water from trusted sources when available",
        "Avoid ice cubes made from untreated water",
        "Use safe water for cooking, washing dishes, and brushing teeth",
        "Store water in clean, covered containers",
        "Use proper sanitation facilities and maintain cleanliness",
        "Avoid swimming or bathing in potentially contaminated water",
        "Dispose of human waste properly"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    },
    {
      id: "cholera-2",
      title: "Food Safety",
      description: "Safe food handling to prevent cholera infection",
      measures: [
        "Eat only well-cooked, hot food",
        "Avoid raw or undercooked seafood",
        "Wash fruits and vegetables thoroughly with safe water",
        "Avoid street food in areas with poor sanitation",
        "Practice safe food handling and storage",
        "Avoid raw vegetables and salads in high-risk areas",
        "Choose restaurants with good hygiene practices"
      ],
      category: "Hygiene",
      priority: "high",
      source: "WHO"
    }
  ],
  "Japanese Encephalitis": [
    {
      id: "je-1",
      title: "Vaccination",
      description: "Get vaccinated against Japanese Encephalitis",
      measures: [
        "Get JE vaccine before traveling to endemic areas",
        "Two-dose schedule: Day 0 and Day 28",
        "Booster dose may be required after 1-2 years",
        "Vaccination is especially important for children in endemic areas",
        "Complete full vaccination schedule as recommended",
        "Consult healthcare provider for vaccination requirements",
        "Vaccination provides long-term protection"
      ],
      category: "Vaccination",
      priority: "high",
      source: "ICMR"
    },
    {
      id: "je-2",
      title: "Mosquito Control",
      description: "Prevent mosquito bites that transmit Japanese Encephalitis",
      measures: [
        "Use insect repellents containing DEET (20-30%) or picaridin",
        "Wear light-colored, long-sleeved shirts and long pants",
        "Use mosquito nets while sleeping",
        "Install window and door screens",
        "Eliminate mosquito breeding sites (stagnant water)",
        "Use mosquito coils or vaporizers in living areas",
        "Avoid outdoor activities during peak mosquito hours (dusk and dawn)",
        "Support community-wide mosquito control programs"
      ],
      category: "Environmental",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Leptospirosis": [
    {
      id: "lepto-1",
      title: "Avoid Contaminated Water",
      description: "Prevent exposure to water contaminated with animal urine",
      measures: [
        "Avoid swimming or wading in floodwater, ponds, or stagnant water",
        "Wear protective footwear (boots, waders) when working in water",
        "Avoid contact with water that may be contaminated with animal urine",
        "Do not drink water from potentially contaminated sources",
        "Cover cuts and wounds with waterproof bandages before water contact",
        "Shower immediately after exposure to potentially contaminated water",
        "Avoid recreational activities in flood-affected areas"
      ],
      category: "Environmental",
      priority: "high",
      source: "ICMR"
    },
    {
      id: "lepto-2",
      title: "Animal Contact Prevention",
      description: "Reduce risk from contact with infected animals",
      measures: [
        "Avoid contact with rodents and their urine",
        "Keep food and garbage in sealed containers to prevent rodent access",
        "Control rodent populations around homes and workplaces",
        "Wear gloves when handling animals or animal waste",
        "Wash hands thoroughly after handling animals",
        "Avoid contact with stray or wild animals",
        "Keep pets vaccinated and healthy"
      ],
      category: "Hygiene",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Scrub Typhus": [
    {
      id: "scrub-1",
      title: "Avoid Mite-Infested Areas",
      description: "Prevent exposure to mites that transmit scrub typhus",
      measures: [
        "Avoid areas with tall grass, bushes, and forest undergrowth",
        "Wear protective clothing (long sleeves, long pants, boots) in rural areas",
        "Tuck pants into socks or boots to prevent mites from crawling up",
        "Use insect repellents containing DEET on exposed skin and clothing",
        "Avoid sitting or lying directly on grass or ground",
        "Use ground sheets or blankets when camping or picnicking",
        "Shower and change clothes immediately after outdoor activities"
      ],
      category: "Environmental",
      priority: "high",
      source: "ICMR"
    },
    {
      id: "scrub-2",
      title: "Personal Protection",
      description: "Individual protection measures against mite bites",
      measures: [
        "Apply permethrin-treated clothing for additional protection",
        "Inspect body for mites after outdoor activities",
        "Remove attached mites carefully with tweezers",
        "Wash clothes in hot water after outdoor exposure",
        "Keep living areas clean and free of rodents (which carry mites)",
        "Use insect repellents on exposed skin",
        "Avoid walking barefoot in rural or forested areas"
      ],
      category: "Hygiene",
      priority: "high",
      source: "ICMR"
    }
  ],
  "Rabies": [
    {
      id: "rabies-1",
      title: "Avoid Animal Bites",
      description: "Prevent contact with potentially rabid animals",
      measures: [
        "Avoid contact with stray dogs, cats, and wild animals",
        "Do not approach or try to pet unfamiliar animals",
        "Keep distance from animals showing unusual behavior (aggressive, disoriented)",
        "Do not disturb animals while they are eating, sleeping, or caring for young",
        "Supervise children around animals",
        "Report stray animals to local authorities",
        "Keep pets on leash in public areas"
      ],
      category: "Lifestyle",
      priority: "high",
      source: "MoHFW"
    },
    {
      id: "rabies-2",
      title: "Pet Vaccination",
      description: "Vaccinate pets to prevent rabies transmission",
      measures: [
        "Vaccinate dogs and cats against rabies annually",
        "Keep pet vaccination records up to date",
        "Vaccinate pets starting at 3-4 months of age",
        "Follow up with booster shots as recommended by veterinarian",
        "Do not allow unvaccinated pets to roam freely",
        "Report any animal bites from pets to healthcare provider",
        "Support community-wide pet vaccination programs"
      ],
      category: "Vaccination",
      priority: "high",
      source: "MoHFW"
    },
    {
      id: "rabies-3",
      title: "Post-Exposure Prophylaxis",
      description: "Immediate action after animal bite or scratch",
      measures: [
        "Wash wound immediately with soap and running water for at least 15 minutes",
        "Apply antiseptic or alcohol to the wound",
        "Seek medical attention immediately, even for minor bites",
        "Get rabies vaccination (post-exposure prophylaxis) as soon as possible",
        "Complete full course of rabies vaccine (4-5 doses over 2-4 weeks)",
        "Get rabies immunoglobulin (RIG) if recommended by doctor",
        "Do not delay treatment - rabies is almost always fatal once symptoms appear",
        "Report the incident to local health authorities"
      ],
      category: "Medical",
      priority: "high",
      source: "WHO"
    }
  ]
}

export default function PreventionMeasures() {
  const { language } = useLanguage()
  const containerRef = useRef(null)
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [districts, setDistricts] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [preventionMeasures, setPreventionMeasures] = useState({})
  const [trendingDiseases, setTrendingDiseases] = useState([])
  const [loading, setLoading] = useState(false)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [loadingNotificationToggle, setLoadingNotificationToggle] = useState(false)

  // Load user profile and email notification preference
  useEffect(() => {
    loadUserProfile()
  }, [])

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      loadDistricts(selectedState)
    } else {
      setDistricts([])
      setSelectedDistrict('')
      setPreventionMeasures({})
    }
  }, [selectedState])

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      const user = response.data.user || response.data
      if (user) {
        setEmailNotificationsEnabled(user.emailNotificationsEnabled ?? true)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const handleToggleEmailNotifications = async () => {
    setLoadingNotificationToggle(true)
    try {
      const newValue = !emailNotificationsEnabled
      await authAPI.updateEmailNotifications(newValue)
      setEmailNotificationsEnabled(newValue)
      // Show success message
      const message = newValue 
        ? t('dailyEmailAlertsEnabled', language)
        : t('dailyEmailAlertsDisabled', language)
      alert(message)
    } catch (error) {
      console.error('Failed to update email notifications:', error)
      alert(t('failedToUpdateNotifications', language))
    } finally {
      setLoadingNotificationToggle(false)
    }
  }

  // Load prevention measures when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      loadPreventionMeasures(selectedState, selectedDistrict)
    } else {
      setPreventionMeasures({})
      setTrendingDiseases([])
    }
  }, [selectedState, selectedDistrict])

  // Debug: Log when preventionMeasures changes
  useEffect(() => {
    console.log('🔄 preventionMeasures state changed:', {
      count: Object.keys(preventionMeasures).length,
      keys: Object.keys(preventionMeasures),
      hasData: Object.keys(preventionMeasures).length > 0
    })
  }, [preventionMeasures])

  // GSAP Animations
  useEffect(() => {
    if (containerRef.current && Object.keys(preventionMeasures).length > 0) {
      // Wait a bit for DOM to update
      setTimeout(() => {
        const cards = containerRef.current.querySelectorAll('.prevention-card')
        
        // Only animate if cards exist
        if (cards && cards.length > 0) {
          // Kill any existing animations on these elements
          gsap.killTweensOf(cards)
          
          // Set initial state
          gsap.set(cards, { y: 30, opacity: 0 })
          
          // Animate in
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })
        } else {
          console.warn('⚠️ No .prevention-card elements found in DOM')
        }
      }, 100)
    }
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        const cards = containerRef.current.querySelectorAll('.prevention-card')
        if (cards && cards.length > 0) {
          gsap.killTweensOf(cards)
        }
      }
    }
  }, [preventionMeasures])

  const loadDistricts = async (state) => {
    setLoadingDistricts(true)
    try {
      const response = await dashboardAPI.getDistricts(state)
      const districtsList = response.data?.districts || []
      setDistricts(districtsList)
    } catch (err) {
      console.error('Failed to load districts:', err)
      setDistricts([])
    } finally {
      setLoadingDistricts(false)
    }
  }

  const loadPreventionMeasures = async (state, district) => {
    setLoading(true)
    try {
      console.log('Loading prevention measures for:', state, district)
      
      // First, fetch trending diseases for this district
      const trendingResponse = await dashboardAPI.getTrendingDiseases({
        state,
        district,
        dateRange: '30d',
        limit: 20
      })
      
      const trending = trendingResponse.data?.trendingDiseases || []
      const trendingDiseaseNames = trending.map(item => item.disease?.name).filter(Boolean)
      
      console.log('Trending diseases response:', trending)
      console.log('Trending disease names extracted:', trendingDiseaseNames)
      console.log('Available mock diseases:', Object.keys(mockPreventionMeasures))
      
      setTrendingDiseases(trendingDiseaseNames)
      
      // If no trending diseases found, show empty state
      if (trendingDiseaseNames.length === 0) {
        console.log('No trending diseases found for', district, state)
        setPreventionMeasures({})
        setLoading(false)
        return
      }
      
      // Try to fetch prevention measures from API
      let apiMeasures = {}
      try {
        const response = await dashboardAPI.getPreventionMeasures(state, district)
        const rawApiMeasures = response.data?.preventionMeasures || {}
        
        // Only use API measures if they have actual data (non-empty arrays)
        // Filter out empty arrays to prevent overwriting mock data
        Object.entries(rawApiMeasures).forEach(([diseaseName, measures]) => {
          if (Array.isArray(measures) && measures.length > 0) {
            apiMeasures[diseaseName] = measures
          }
        })
        
        console.log('API prevention measures (with data):', Object.keys(apiMeasures))
        console.log('API prevention measures (all keys, including empty):', Object.keys(rawApiMeasures))
      } catch (apiErr) {
        console.log('API prevention measures not available, using mock data:', apiErr.message)
      }
      
      // Use mock data as base, then merge API data only if it has content
      // This ensures we always have data from mock, and API data only replaces if it exists
      const allMeasures = { ...mockPreventionMeasures }
      
      // Only merge API measures that have actual data
      Object.entries(apiMeasures).forEach(([diseaseName, measures]) => {
        if (Array.isArray(measures) && measures.length > 0) {
          allMeasures[diseaseName] = measures
        }
      })
      
      console.log('📦 Final allMeasures keys:', Object.keys(allMeasures))
      console.log('📦 Sample measure count for Malaria:', Array.isArray(allMeasures['Malaria']) ? allMeasures['Malaria'].length : 'not an array')
      
      // Filter to only show prevention measures for trending diseases
      // Use case-insensitive matching to handle any name variations
      // IMPORTANT: Track matched diseases separately to ensure accuracy
      // Use Set with lowercase keys to avoid duplicates (case-insensitive)
      const filteredMeasures = {}
      const allDiseaseKeys = Object.keys(allMeasures)
      const matchedDiseaseKeysLower = new Set() // Track lowercase keys to avoid duplicates
      const successfullyMatchedDiseases = [] // Track actual disease names (preserve original case)
      
      console.log('🔍 Filtering prevention measures...')
      console.log('📋 Trending diseases to match (unique):', [...new Set(trendingDiseaseNames)])
      console.log('📋 Trending diseases count (with duplicates):', trendingDiseaseNames.length)
      console.log('📋 Available prevention measures:', allDiseaseKeys)
      
      // Only add diseases that are in the trending list AND have prevention measures available
      // IMPORTANT: Only add each disease once, even if it appears multiple times in trending list
      trendingDiseaseNames.forEach(trendingName => {
        const trendingNameLower = trendingName.toLowerCase()
        
        // Skip if we've already matched this disease (case-insensitive check)
        if (matchedDiseaseKeysLower.has(trendingNameLower)) {
          return
        }
        
        // Try exact match first
        if (allMeasures[trendingName]) {
          filteredMeasures[trendingName] = allMeasures[trendingName]
          matchedDiseaseKeysLower.add(trendingNameLower)
          successfullyMatchedDiseases.push(trendingName)
          console.log('✅ Matched:', trendingName, 'exact match')
        } else {
          // Try case-insensitive match
          const matchedKey = allDiseaseKeys.find(key => 
            key.toLowerCase() === trendingNameLower
          )
          if (matchedKey) {
            // Check if we've already added this disease (by its matched key)
            const matchedKeyLower = matchedKey.toLowerCase()
            if (!matchedDiseaseKeysLower.has(matchedKeyLower)) {
              // Use the original trending name as key to maintain consistency
              filteredMeasures[trendingName] = allMeasures[matchedKey]
              matchedDiseaseKeysLower.add(trendingNameLower)
              matchedDiseaseKeysLower.add(matchedKeyLower) // Also track the matched key
              successfullyMatchedDiseases.push(trendingName)
              console.log('✅ Matched:', trendingName, 'with', matchedKey, '(case-insensitive)')
            } else {
              console.log('⏭️ Skipped:', trendingName, '(already matched as', matchedKey, ')')
            }
          } else {
            console.log('❌ No match found for:', trendingName)
          }
        }
      })
      
      const matchCount = successfullyMatchedDiseases.length
      
      console.log('🔍 After filtering, filteredMeasures has:', Object.keys(filteredMeasures).length, 'diseases')
      console.log('🔍 Match count:', matchCount)
      console.log('🔍 Successfully matched diseases:', successfullyMatchedDiseases)
      console.log('🔍 Filtered diseases keys:', Object.keys(filteredMeasures))
      
      // Always rebuild from successfullyMatchedDiseases to ensure accuracy
      // This is the source of truth - only diseases that were actually matched
      const finalMeasures = {}
      successfullyMatchedDiseases.forEach(name => {
        if (allMeasures[name]) {
          finalMeasures[name] = allMeasures[name]
        } else {
          // Try case-insensitive match
          const matchedKey = allDiseaseKeys.find(key => 
            key.toLowerCase() === name.toLowerCase()
          )
          if (matchedKey && allMeasures[matchedKey]) {
            finalMeasures[name] = allMeasures[matchedKey]
          }
        }
      })
      
      console.log('📊 Final prevention measures count:', Object.keys(finalMeasures).length)
      console.log('📊 Final prevention measures keys:', Object.keys(finalMeasures))
      console.log('📊 Successfully matched diseases (unique):', successfullyMatchedDiseases)
      
      // Verify each disease has measures
      Object.entries(finalMeasures).forEach(([name, measures]) => {
        if (!Array.isArray(measures) || measures.length === 0) {
          console.warn(`⚠️ Disease ${name} has no measures or invalid format:`, measures)
        } else {
          console.log(`✅ ${name} has ${measures.length} prevention measures`)
        }
      })
      
      // Always set the final measures built from successfully matched diseases
      console.log('🎯 Setting preventionMeasures state with', Object.keys(finalMeasures).length, 'diseases')
      setPreventionMeasures(finalMeasures)
      
    } catch (err) {
      console.error('Failed to load prevention measures:', err)
      console.error('Error details:', err.response?.data || err.message)
      setPreventionMeasures({})
      setTrendingDiseases([])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ef4444'
      case 'medium':
        return '#f59e0b'
      case 'low':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="prevention-measures-page" ref={containerRef}>
      <main className="prevention-main">
        <div className="container">
          {/* Header */}
          <div className="prevention-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div className="prevention-header-icon">
                <Shield size={48} />
              </div>
              <div style={{ flex: 1 }}>
                <h1>{t('preventionMeasures', language)}</h1>
                <p>{t('preventionMeasuresDescription', language)}</p>
              </div>
            </div>
            {/* Email Notification Toggle - Top Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500
              }}>
                {emailNotificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                <span>{t('dailyEmailAlerts', language)}</span>
              </label>
              <button
                onClick={handleToggleEmailNotifications}
                disabled={loadingNotificationToggle}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: emailNotificationsEnabled ? '#1B7BFF' : '#D1D5DB',
                  cursor: loadingNotificationToggle ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                  outline: 'none'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: emailNotificationsEnabled ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="prevention-filters-card">
            <h3>{t('selectLocation', language)}</h3>
            <div className="prevention-filters-grid">
              <div className="filter-group">
                <label>{t('state', language)}</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setSelectedDistrict('')
                  }}
                  className="input"
                >
                  <option value="">{t('selectState', language)}</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>{t('district', language)}</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="input"
                  disabled={!selectedState || loadingDistricts}
                >
                  <option value="">
                    {!selectedState
                      ? t('selectStateFirst', language)
                      : loadingDistricts
                        ? t('loadingDistricts', language)
                        : districts.length === 0
                          ? t('noDistrictsFound', language)
                          : t('selectDistrict', language)}
                  </option>
                  {!loadingDistricts && districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Prevention Measures */}
          {!selectedState || !selectedDistrict ? (
            <div className="prevention-empty-state">
              <AlertCircle size={48} />
              <h3>{t('selectStateAndDistrict', language)}</h3>
              <p>{t('selectStateAndDistrictDesc', language)}</p>
            </div>
          ) : loading ? (
            <div className="prevention-loading">
              <div className="loading-spinner"></div>
              <p>{t('loadingPreventionMeasures', language)}</p>
            </div>
          ) : Object.keys(preventionMeasures).length === 0 ? (
            <div className="prevention-empty-state">
              <AlertCircle size={48} />
              <h3>{t('noPreventionMeasuresAvailable', language)}</h3>
              <p>
                {trendingDiseases.length === 0
                  ? t('noTrendingDiseasesForPrevention', language).replace('{district}', selectedDistrict).replace('{state}', selectedState)
                  : t('noPreventionMeasuresDesc', language).replace('{district}', selectedDistrict).replace('{state}', selectedState)}
              </p>
            </div>
          ) : (
            <div className="prevention-measures-container">
              {(() => {
                console.log('🎨 Rendering prevention measures. Count:', Object.keys(preventionMeasures).length)
                console.log('🎨 Prevention measures keys:', Object.keys(preventionMeasures))
                return Object.entries(preventionMeasures).map(([diseaseName, measures]) => {
                  // Debug: Log each disease being rendered
                  console.log(`🎨 Rendering disease: ${diseaseName}, measures type:`, typeof measures, 'isArray:', Array.isArray(measures))
                  
                  // Ensure measures is an array
                  const measuresArray = Array.isArray(measures) ? measures : []
                  
                  if (measuresArray.length === 0) {
                    console.warn(`⚠️ No measures found for ${diseaseName}. Measures value:`, measures)
                    return null
                  }
                  
                  return (
                    <div key={diseaseName} className="prevention-card">
                      <div className="prevention-card-header">
                        <h2 className="prevention-disease-name">{diseaseName}</h2>
                        <div className="prevention-disease-badge">
                          <MapPin size={16} />
                          <span>{selectedDistrict}</span>
                        </div>
                      </div>
                      
                      <div className="prevention-measures-list">
                        {measuresArray.map((measure) => (
                          <div key={measure.id} className="prevention-measure-item">
                            <div className="prevention-measure-header">
                              <h3 className="prevention-measure-title">{measure.title}</h3>
                              <div className="prevention-measure-badges">
                                {measure.category && (
                                  <span className="prevention-category">{measure.category}</span>
                                )}
                                {measure.priority && (
                                  <span
                                    className="prevention-priority"
                                    style={{ backgroundColor: getPriorityColor(measure.priority) }}
                                  >
                                    {measure.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {measure.description && (
                              <p className="prevention-description">{measure.description}</p>
                            )}
                            
                            {measure.measures && Array.isArray(measure.measures) && measure.measures.length > 0 && (
                              <ul className="prevention-measures-list-items">
                                {measure.measures.map((item, idx) => (
                                  <li key={idx}>
                                    <CheckCircle size={16} className="check-icon" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {measure.source && (
                              <div className="prevention-source">
                                <span>{t('source', language)}: <strong>{measure.source}</strong></span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

