/**
 * Simon's Portfolio - Configuration File
 * Centralizes all settings, professional details, and application preferences
 */
const CONFIG = {
  // Site Metadata
  site: {
    name: "Simon",
    title: "clinical officer",
    description: "Professional portfolio and resume/CV hosting platform",
    author: "Festus",
    version: "1.0.0",
    baseUrl: window.location.origin
  },

  // Professional Information
  professional: {
    name: "Simon",
    title: "clinical officer",
    email: "simon@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    experience: "5+ Years",
    tagline: "Crafting clean, elegant, and efficient web solutions"
  },

  // Social Links
  social: {
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourusername",
    dribbble: "https://dribbble.com/yourusername",
    instagram: "https://instagram.com/yourusername"
  },

  // Contact Information
  contact: {
    email: "simon@example.com",
    phone: "+1 (555) 123-4567",
    address: "New York, USA",
    formEndpoint: null // Set to API endpoint if using form submission
  },

  // File Upload Settings
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
    allowedExtensions: ['.pdf', '.docx', '.doc']
  },

  // IndexedDB Configuration
  database: {
    name: 'PortfolioDB',
    version: 1,
    stores: ['resume', 'cv']
  },

  // LocalStorage Keys
  storage: {
    resumeMeta: 'portfolio_resume_meta',
    cvMeta: 'portfolio_cv_meta'
  },

  // Feature Flags
  features: {
    enableResume: true,
    enableCV: true,
    enableContactForm: true,
    debugMode: false
  },

  // UI Settings
  ui: {
    theme: 'dark',
    primaryColor: '#00ff88',
    fontFamily: 'Poppins, sans-serif',
    animations: true
  }
};

// Initialize
if (CONFIG.features.debugMode) {
  console.log('[Portfolio Config] Loaded:', CONFIG);
}
