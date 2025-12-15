export const translations = {
  en: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    reports: 'Reports',
    pharmacy: 'Pharmacy',
    symptoms: 'Symptoms',
    diagnosis: 'Diagnosis',
    treatment: 'Treatment',
    doctor: 'Doctor',
    patient: 'Patient',
    submit: 'Submit',
    save: 'Save',
    approve: 'Approve',
    pending: 'Pending',
    completed: 'Completed',
    welcome: 'Welcome',
    aiCouncil: 'AI Council',
    clinicalSupport: 'Clinical Support'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    patients: 'मरीज़',
    reports: 'रिपोर्ट',
    pharmacy: 'फार्मेसी',
    symptoms: 'लक्षण',
    diagnosis: 'निदान',
    treatment: 'इलाज',
    doctor: 'डॉक्टर',
    patient: 'मरीज़',
    submit: 'जमा करें',
    save: 'सेव करें',
    approve: 'मंजूर करें',
    pending: 'लंबित',
    completed: 'पूर्ण',
    welcome: 'स्वागत',
    aiCouncil: 'एआई परिषद',
    clinicalSupport: 'चिकित्सा सहायता'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    patients: 'রোগী',
    reports: 'রিপোর্ট',
    pharmacy: 'ফার্মেসি',
    symptoms: 'লক্ষণ',
    diagnosis: 'নির্ণয়',
    treatment: 'চিকিৎসা',
    doctor: 'ডাক্তার',
    patient: 'রোগী',
    submit: 'জমা দিন',
    save: 'সংরক্ষণ',
    approve: 'অনুমোদন',
    pending: 'অপেক্ষমাণ',
    completed: 'সম্পন্ন',
    welcome: 'স্বাগতম',
    aiCouncil: 'এআই কাউন্সিল',
    clinicalSupport: 'ক্লিনিক্যাল সাপোর্ট'
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    patients: 'ರೋಗಿಗಳು',
    reports: 'ವರದಿಗಳು',
    pharmacy: 'ಔಷಧಾಲಯ',
    symptoms: 'ಲಕ್ಷಣಗಳು',
    diagnosis: 'ರೋಗನಿರ್ಣಯ',
    treatment: 'ಚಿಕಿತ್ಸೆ',
    doctor: 'ವೈದ್ಯ',
    patient: 'ರೋಗಿ',
    submit: 'ಸಲ್ಲಿಸಿ',
    save: 'ಉಳಿಸಿ',
    approve: 'ಅನುಮೋದಿಸಿ',
    pending: 'ಬಾಕಿ',
    completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    welcome: 'ಸ್ವಾಗತ',
    aiCouncil: 'ಎಐ ಕೌನ್ಸಿಲ್',
    clinicalSupport: 'ಕ್ಲಿನಿಕಲ್ ಸಪೋರ್ಟ್'
  },
  gu: {
    dashboard: 'ડેશબોર્ડ',
    patients: 'દર્દીઓ',
    reports: 'રિપોર્ટ્સ',
    pharmacy: 'ફાર્મસી',
    symptoms: 'લક્ષણો',
    diagnosis: 'નિદાન',
    treatment: 'સારવાર',
    doctor: 'ડૉક્ટર',
    patient: 'દર્દી',
    submit: 'સબમિટ કરો',
    save: 'સેવ કરો',
    approve: 'મંજૂર કરો',
    pending: 'બાકી',
    completed: 'પૂર્ણ',
    welcome: 'સ્વાગત',
    aiCouncil: 'એઆઈ કાઉન્સિલ',
    clinicalSupport: 'ક્લિનિકલ સપોર્ટ'
  }
};

class TranslationService {
  private currentLang = 'hi';

  constructor() {
    const saved = localStorage.getItem('language');
    if (saved && saved in translations) {
      this.currentLang = saved;
    }
  }

  setLanguage(lang: keyof typeof translations) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
  }

  t(key: keyof typeof translations.en): string {
    return translations[this.currentLang as keyof typeof translations][key] || translations.en[key];
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

export const i18n = new TranslationService();