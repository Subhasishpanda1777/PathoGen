# 📋 Phase 2 Requirements - Information Needed

To proceed with Phase 2: Core Disease Analytics Engine, I need the following information from you:

---

## 🔍 Questions for You

### 1. Disease Datasets (ICMR, MoHFW, VRDL)

**Q1.1:** Do you have access to ICMR, MoHFW, or VRDL disease datasets?
- [ ] Yes, I have dataset files
- [ ] Yes, I have API access
- [ ] No, but I have links/documents
- [ ] No, I need guidance on where to get them

**Q1.2:** What format are the datasets in?
- [ ] CSV files
- [ ] Excel files
- [ ] JSON files
- [ ] API endpoints
- [ ] Database
- [ ] Other: __________

**Q1.3:** Do you want me to:
- [ ] Set up the structure now, you'll provide data later
- [ ] Use mock/sample data for testing
- [ ] Help you find public datasets

---

### 2. Social Media Scraping (Data Pipeline)

**Q2.1:** Which platforms do you want to scrape?
- [ ] Google Trends
- [ ] Reddit
- [ ] Twitter/X
- [ ] All of the above
- [ ] Other: __________

**Q2.2:** Do you have API keys/credentials?
- [ ] Google Trends API key
- [ ] Reddit API credentials
- [ ] Twitter/X API credentials
- [ ] No credentials yet

**Q2.3:** What keywords/symptoms should we track?
- [ ] I'll provide a list
- [ ] Use common disease symptoms
- [ ] Extract from our symptom_reports table

---

### 3. AI Models

**Q3.1:** Which AI/ML libraries do you prefer?
- [ ] Python (scikit-learn, pandas, numpy)
- [ ] TensorFlow.js (JavaScript)
- [ ] Both (Python backend service + JS integration)
- [ ] Other: __________

**Q3.2:** Do you have cloud credits for AI services?
- [ ] Yes (OpenAI, Google AI, etc.)
- [ ] No, prefer open-source solutions
- [ ] Not sure

**Q3.3:** For NLP symptom clustering:
- [ ] Use existing library (Natural, Compromise.js)
- [ ] Python-based (spaCy, NLTK)
- [ ] Cloud service (OpenAI, etc.)

---

### 4. Data Storage & Processing

**Q4.1:** How should we store scraped data?
- [ ] Directly in PostgreSQL
- [ ] Separate data warehouse
- [ ] Both (raw in DB, processed separately)

**Q4.2:** Processing frequency:
- [ ] Real-time
- [ ] Hourly batches
- [ ] Daily batches

---

## 📝 What I Can Set Up Now (Without Your Input)

While waiting for your answers, I can:

1. ✅ **Set up data pipeline structure**
   - Create service files for scraping
   - Set up cron/scheduler structure
   - Create data processing utilities

2. ✅ **Create AI model service structure**
   - Set up ML model directory
   - Create interfaces for models
   - Add data preprocessing utilities

3. ✅ **Set up dataset integration framework**
   - Create data import utilities
   - Set up data validation
   - Create data transformation layer

4. ✅ **Add seed data scripts**
   - Sample disease data
   - Sample outbreak data
   - Test data for development

---

## 🎯 Recommended Approach

**Option A: Build Structure First (Recommended)**
- Set up all frameworks and structures
- Use mock data for testing
- You provide real data/credentials later
- ✅ **Allows immediate progress**

**Option B: Wait for Your Input**
- Pause until you provide datasets/credentials
- Then build specific integrations
- ⏸️ **Slower but more targeted**

---

## 📋 What I Need to Know Now

**Please answer:**

1. **Priority**: Which should we do first?
   - [ ] Data integration (datasets)
   - [ ] Data pipeline (scraping)
   - [ ] AI models
   - [ ] All together

2. **Dataset access**: Do you have disease datasets ready?
   - Yes/No, and format if yes

3. **API credentials**: Do you have social media API keys?
   - Which platforms?

4. **Preference**: Should I proceed with structure + mock data?
   - Yes/No

---

**Let me know your preferences and I'll proceed accordingly! 🚀**

