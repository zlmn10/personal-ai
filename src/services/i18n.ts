import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ml' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English (US)',
    region: 'International',
    flag: '🇺🇸',
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    region: 'Kerala, India',
    flag: '🇮🇳',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    region: 'India',
    flag: '🇮🇳',
  },
];

const TRANSLATIONS = {
  en: {
    // Navigation & Sidebar
    newChat: 'New chat',
    searchChat: 'Search chat',
    library: 'Library',
    aiImages: 'AI images',
    aiVideos: 'AI videos',
    aiCode: 'AI code',
    folders: 'Folders',
    cybersecurity: 'Cybersecurity',
    cloudPen: 'Cloud & Penetration',
    settings: 'Settings',
    language: 'Language',
    personalization: 'Personalization',
    getHelp: 'Get help',
    logOut: 'Log out',
    proPlan: 'Pro Plan',

    // Header & Status
    online: 'Online',
    offline: 'Offline',
    selectModel: 'Select model',
    pullModel: 'Pull Model',
    newChatShortcut: 'New Chat',
    clearChat: 'Clear chat',
    exportChat: 'Export chat',
    settingsTitle: 'Settings',

    // Welcome Screen
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    howCanIHelp: 'How can I help you today?',
    greetingSubtitle: 'Autonomous cybersecurity intelligence platform powered by Google Gemini API.',
    startPrompt: 'Ask a question, explore cybersecurity vulnerabilities, or review code.',

    // Composer
    askAnything: 'Ask anything...',
    systemPersona: 'System Persona',
    stopGeneration: 'Stop Generation',
    send: 'Send',
    generating: 'Generating response...',

    // Settings Navigation Tabs
    tabGeneral: 'General',
    tabAppearance: 'Appearance & Themes',
    tabLanguage: 'Language',
    tabPersonalization: 'Personalization',
    tabAI: 'AI Provider (Gemini)',
    tabParameters: 'AI Parameters',
    tabData: 'Data & Storage',
    tabAbout: 'About Pentester AI',

    // Settings General
    generalDesc: 'Profile, user display name, and chat preferences',
    userNameLabel: 'User Display Name',
    userNameDesc: 'Your name recognized in greetings and Pentester AI conversations.',
    autoScrollLabel: 'Auto-scroll during generation',
    autoScrollDesc: 'Automatically keep the latest tokens in view as they stream.',
    sendOnEnterLabel: 'Send message on Enter key',
    sendOnEnterDesc: 'Press Enter to submit, Shift + Enter for a new line.',

    // Appearance & Themes
    appearanceDesc: 'Customize visual theme, glass frosted surfaces, accent colors, and typography',
    themeMode: 'Theme mode',
    modeLight: 'Light',
    modeDark: 'Dark',
    modeSystem: 'System',
    presetsTitle: 'Theme Presets',
    customColorsTitle: 'Custom Palette & Colors',
    accentColorLabel: 'Interface Accent Color',
    glassControlsTitle: 'Glassmorphism Controls',
    glassTransparency: 'Glass Transparency',
    blurIntensity: 'Blur Intensity',
    borderOpacity: 'Border Opacity',
    shadowIntensity: 'Shadow Intensity',
    cornerRadius: 'Corner Radius',
    typographyTitle: 'Typography & Layout',
    fontFamilyLabel: 'Font Family',
    fontSizeLabel: 'Font Size',
    densityLabel: 'Interface Density',
    livePreviewTitle: 'Live Theme Preview',

    // Language Tab
    languageDesc: 'Choose your preferred language for the interface',
    selectLanguage: 'Select Application Language',
    languageChangedToast: 'Language updated successfully',

    // Personalization Tab
    personalizationDesc: 'Configure AI speaking personality, name, and instructions',
    assistantNameLabel: 'Assistant Display Name',
    personaPresetsLabel: 'Personality Presets',
    systemPromptLabel: 'System Instructions (Persona Prompt)',
    strictPersonaNote: 'Active immediately across current and new conversations.',

    // AI Provider Tab
    aiDesc: 'Manage Google Gemini API connection, AES-256 encrypted keys, and model parameters',
    aiUrlLabel: 'Gemini API Status',
    enableProxyLabel: 'Enable Local Security Proxy',
    proxyDesc: 'Eliminates browser CORS restrictions and enables network socket scanning.',
    testConnection: 'Test Connection',
    installedModelsTitle: 'Supported Gemini Models',

    // AI Parameters
    parametersDesc: 'Fine-tune context window, temperature, and hardware execution',
    contextLengthTitle: 'Context length',
    contextLengthDesc: 'Context length determines how much of your conversation local LLMs can remember and use to generate responses.',
    temperatureTitle: 'Temperature',
    topPTitle: 'Top-P (Nucleus Sampling)',
    forceCpuTitle: 'Force CPU Mode (num_gpu: 0)',
    forceCpuDesc: 'Prevents CUDA VRAM crashes on large 12GB+ models on laptops with 4-8GB GPUs.',

    // Data & Storage
    dataDesc: 'MongoDB synchronization, conversation history, backup and restore',
    mongoStatusTitle: 'MongoDB Local Database',
    syncToMongo: 'Sync Local to MongoDB',
    exportJson: 'Export all conversations (JSON backup)',
    exportMd: 'Export current chat (Markdown)',
    importBackup: 'Import conversation backup',
    clearAllChats: 'Clear all conversation history',

    // About
    aboutDesc: 'Application build details, local architecture, and privacy guarantee',

    // Actions & Buttons
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    resetDefault: 'Reset to Default',
    close: 'Close',
  },

  ml: {
    // Navigation & Sidebar
    newChat: 'പുതിയ ചാറ്റ്',
    searchChat: 'ചാറ്റുകൾ തിരയുക',
    library: 'ലൈബ്രറി',
    aiImages: 'AI ചിത്രങ്ങൾ',
    aiVideos: 'AI വീഡിയോകൾ',
    aiCode: 'AI കോഡ്',
    folders: 'ഫോൾഡറുകൾ',
    cybersecurity: 'സൈബർ സുരക്ഷ',
    cloudPen: 'ക്ലൗഡ് & പെനട്രേഷൻ',
    settings: 'ക്രമീകരണങ്ങൾ',
    language: 'ഭാഷ',
    personalization: 'വ്യക്തിഗതമാക്കൽ',
    getHelp: 'സഹായം നേടുക',
    logOut: 'ലോഗ് ഔട്ട്',
    proPlan: 'പ്രോ പ്ലാൻ',

    // Header & Status
    online: 'ഓൺലൈൻ',
    offline: 'ഓഫ്‌ലൈൻ',
    selectModel: 'മോഡൽ തിരഞ്ഞെടുക്കുക',
    pullModel: 'മോഡൽ ഡൗൺലോഡ് ചെയ്യുക',
    newChatShortcut: 'പുതിയ ചാറ്റ്',
    clearChat: 'ചാറ്റ് മായ്‌ക്കുക',
    exportChat: 'എക്‌സ്‌പോർട്ട് ചെയ്യുക',
    settingsTitle: 'ക്രമീകരണങ്ങൾ',

    // Welcome Screen
    goodMorning: 'ശുഭോദയം',
    goodAfternoon: 'ശുഭദിനം',
    goodEvening: 'ശുഭ സായാഹ്നം',
    howCanIHelp: 'ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
    greetingSubtitle: 'ലോക്കൽ ഒലാമ പവർ ചെയ്യുന്ന നിങ്ങളുടെ സ്വകാര്യ സുരക്ഷിത AI വർക്ക്‌സ്‌പേസ്.',
    startPrompt: 'ചോദ്യങ്ങൾ ചോദിക്കുക, സൈബർ സുരക്ഷാ പിഴവുകൾ പരിശോധിക്കുക, അല്ലെങ്കിൽ കോഡ് വിശകലനം ചെയ്യുക.',

    // Composer
    askAnything: 'എന്തും ചോദിക്കൂ...',
    systemPersona: 'സിസ്റ്റം വ്യക്തിത്വം',
    stopGeneration: 'നിർത്തുക',
    send: 'അയക്കുക',
    generating: 'മറുപടി തയ്യാറാക്കുന്നു...',

    // Settings Navigation Tabs
    tabGeneral: 'പൊതുവായവ',
    tabAppearance: 'തീമുകളും രൂപവും',
    tabLanguage: 'ഭാഷ',
    tabPersonalization: 'വ്യക്തിഗതമാക്കൽ',
    tabAI: 'AI പ്രൊവൈഡർ (Gemini)',
    tabParameters: 'AI പാരാമീറ്ററുകൾ',
    tabData: 'ഡാറ്റ & സ്റ്റോറേജ്',
    tabAbout: 'ആപ്പിനെക്കുറിച്ച്',

    // Settings General
    generalDesc: 'പ്രൊഫൈൽ, ഉപയോക്തൃ നാമം, ചാറ്റ് മുൻഗണനകൾ',
    userNameLabel: 'ഉപയോക്തൃ നാമം',
    userNameDesc: 'അഭിവാദനങ്ങളിലും ചാറ്റുകളിലും ഉപയോഗിക്കുന്ന നിങ്ങളുടെ പേര്.',
    autoScrollLabel: 'ഓട്ടോ-സ്ക്രോൾ ഓണാക്കുക',
    autoScrollDesc: 'മറുപടി ലഭിക്കുമ്പോൾ താഴേക്ക് സ്വയമേവ സ്ക്രോൾ ചെയ്യുക.',
    sendOnEnterLabel: 'Enter അമർത്തുമ്പോൾ സന്ദേശം അയക്കുക',
    sendOnEnterDesc: 'Enter വഴി അയക്കാം, പുതിയ വരിക്ക് Shift + Enter.',

    // Appearance & Themes
    appearanceDesc: 'തീമുകൾ, ഗ്ലാസ് ഇഫക്റ്റുകൾ, നിറങ്ങൾ, ഫോണ്ടുകൾ എന്നിവ മാറ്റുക',
    themeMode: 'തീം മോഡ്',
    modeLight: 'ലൈറ്റ്',
    modeDark: 'ഡാർക്ക്',
    modeSystem: 'സിസ്റ്റം',
    presetsTitle: 'റെഡിമെയ്ഡ് തീമുകൾ',
    customColorsTitle: 'കസ്റ്റം നിറങ്ങൾ',
    accentColorLabel: 'പ്രധാന ആക്സന്റ് നിറം',
    glassControlsTitle: 'ഗ്ലാസ് ക്രമീകരണങ്ങൾ',
    glassTransparency: 'ഗ്ലാസ് സുതാര്യത',
    blurIntensity: 'ബ്ലർ തീവ്രത',
    borderOpacity: 'ബോർഡർ തെളിച്ചം',
    shadowIntensity: 'ഷാഡോ തീവ്രത',
    cornerRadius: 'മൂലകളുടെ വളവ്',
    typographyTitle: 'ഫോണ്ടുകളും ശൈലിയും',
    fontFamilyLabel: 'ഫോണ്ട് കുടുംബം',
    fontSizeLabel: 'ഫോണ്ട് വലിപ്പം',
    densityLabel: 'ഇന്റർഫേസ് വലുപ്പം',
    livePreviewTitle: 'തത്സമയ പ്രിവ്യൂ',

    // Language Tab
    languageDesc: 'ആപ്ലിക്കേഷന്റെ പ്രധാന ഭാഷ തിരഞ്ഞെടുക്കുക',
    selectLanguage: 'ആപ്പ് ഭാഷ തിരഞ്ഞെടുക്കുക',
    languageChangedToast: 'ഭാഷ വിജയകരമായി മാറ്റി',

    // Personalization Tab
    personalizationDesc: 'AI യുടെ സംസാരിക്കുന്ന രീതിയും നിർദ്ദേശങ്ങളും ക്രമീകരിക്കുക',
    assistantNameLabel: 'AI അസിസ്റ്റന്റ് പേര്',
    personaPresetsLabel: 'പ്രീസെറ്റ് വ്യക്തിത്വങ്ങൾ',
    systemPromptLabel: 'സിസ്റ്റം നിർദ്ദേശങ്ങൾ (പ്രോംപ്റ്റ്)',
    strictPersonaNote: 'പുതിയതും നിലവിലുള്ളതുമായ എല്ലാ ചാറ്റുകളിലും ഉടൻ പ്രാബല്യത്തിൽ വരും.',

    // AI Provider Tab
    aiDesc: 'Google Gemini API കണക്ഷനും മോഡലുകളും ക്രമീകരിക്കുക',
    aiUrlLabel: 'Gemini API സ്റ്റാറ്റസ്',
    enableProxyLabel: 'ലോക്കൽ സെക്യൂരിറ്റി പ്രോക്സി ഉപയോഗിക്കുക',
    proxyDesc: 'ബ്രൗസർ തടസ്സങ്ങൾ ഒഴിവാക്കാനും നെറ്റ്വർക്ക് സ്കാനിംഗിനും സഹായിക്കുന്നു.',
    testConnection: 'കണക്ഷൻ പരിശോധിക്കുക',
    installedModelsTitle: 'പിന്തുണയ്ക്കുന്ന Gemini മോഡലുകൾ',

    // AI Parameters
    parametersDesc: 'കോൺടെക്സ്റ്റ് ലെങ്ത്, താപനില, ഹാർഡ്‌വെയർ മോഡ് എന്നിവ ക്രമീകരിക്കുക',
    contextLengthTitle: 'കോൺടെക്സ്റ്റ് ലെങ്ത്',
    contextLengthDesc: 'സംഭാഷണത്തിലെ എത്ര മുൻ വിവരങ്ങൾ ഓർത്തു വെക്കണമെന്ന് ഇത് തീരുമാനിക്കുന്നു.',
    temperatureTitle: 'താപനില (Temperature)',
    topPTitle: 'Top-P സാമ്പിളിംഗ്',
    forceCpuTitle: 'ഫോഴ്സ് CPU മോഡ് (num_gpu: 0)',
    forceCpuDesc: 'വലിയ മോഡലുകൾ റൺ ചെയ്യുമ്പോൾ GPU ക്രാഷ് ഒഴിവാക്കാൻ സഹായിക്കുന്നു.',

    // Data & Storage
    dataDesc: 'മോംഗോഡിബി സിൻക്രൊണൈസേഷൻ, ബാക്കപ്പ്, സംഭാഷണ ചരിത്രം',
    mongoStatusTitle: 'MongoDB ലോക്കൽ ഡാറ്റാബേസ്',
    syncToMongo: 'ലോക്കൽ ചാറ്റുകൾ മോംഗോയിലേക്ക് സിങ്ക് ചെയ്യുക',
    exportJson: 'എല്ലാ ചാറ്റുകളും എക്‌സ്‌പോർട്ട് ചെയ്യുക (JSON)',
    exportMd: 'നിലവിലെ ചാറ്റ് എക്‌സ്‌പോർട്ട് ചെയ്യുക (Markdown)',
    importBackup: 'ബാക്കപ്പ് ഫയൽ ഇമ്പോർട്ട് ചെയ്യുക',
    clearAllChats: 'എല്ലാ ചാറ്റുകളും മായ്‌ക്കുക',

    // About
    aboutDesc: 'ആപ്ലിക്കേഷൻ പതിപ്പ്, ആർക്കിടെക്ചർ, സ്വകാര്യതാ ഉറപ്പ്',

    // Actions & Buttons
    saveChanges: 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക',
    cancel: 'റദ്ദാക്കുക',
    resetDefault: 'ഡിഫോൾട്ടിലേക്ക് മാറ്റുക',
    close: 'അടയ്ക്കുക',
  },

  hi: {
    // Navigation & Sidebar
    newChat: 'नया चैट',
    searchChat: 'चैट खोजें',
    library: 'लाइब्रेरी',
    aiImages: 'AI तस्वीरें',
    aiVideos: 'AI वीडियो',
    aiCode: 'AI कोड',
    folders: 'फ़ोल्डर',
    cybersecurity: 'साइबर सुरक्षा',
    cloudPen: 'क्लाउड और पेनेट्रेशन',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    personalization: 'वैयक्तिकरण',
    getHelp: 'सहायता प्राप्त करें',
    logOut: 'लॉग आउट',
    proPlan: 'प्रो प्लान',

    // Header & Status
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन',
    selectModel: 'मॉडल चुनें',
    pullModel: 'मॉडल डाउनलोड करें',
    newChatShortcut: 'नया चैट',
    clearChat: 'चैट साफ़ करें',
    exportChat: 'निर्यात करें',
    settingsTitle: 'सेटिंग्स',

    // Welcome Screen
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    howCanIHelp: 'आज मैं आपकी क्या मदद कर सकता हूँ?',
    greetingSubtitle: 'लोकल ओलामा द्वारा संचालित आपका निजी और सुरक्षित AI वर्कस्पेस।',
    startPrompt: 'प्रश्न पूछें, साइबर सुरक्षा जांचें, या कोड का विश्लेषण करें।',

    // Composer
    askAnything: 'कुछ भी पूछें...',
    systemPersona: 'सिस्टम व्यक्तित्व',
    stopGeneration: 'रोकें',
    send: 'भेजें',
    generating: 'उत्तर तैयार किया जा रहा है...',

    // Settings Navigation Tabs
    tabGeneral: 'सामान्य',
    tabAppearance: 'थीम और दिखावट',
    tabLanguage: 'भाषा',
    tabPersonalization: 'वैयक्तिकरण',
    tabAI: 'AI प्रदाता (Gemini)',
    tabParameters: 'AI पैरामीटर',
    tabData: 'डेटा और स्टोरेज',
    tabAbout: 'ऐप के बारे में',

    // Settings General
    generalDesc: 'प्रोफ़ाइल, उपयोगकर्ता नाम और चैट प्राथमिकताएं',
    userNameLabel: 'उपयोगकर्ता का नाम',
    userNameDesc: 'अभिवादन और चैट में प्रदर्शित होने वाला आपका नाम।',
    autoScrollLabel: 'ऑटो-स्क्रॉल चालू रखें',
    autoScrollDesc: 'उत्तर आते समय स्वचालित रूप से नीचे स्क्रॉल करें।',
    sendOnEnterLabel: 'Enter दबाने पर संदेश भेजें',
    sendOnEnterDesc: 'संदेश भेजने के लिए Enter, नई पंक्ति के लिए Shift + Enter.',

    // Appearance & Themes
    appearanceDesc: 'थीम, ग्लास इफेक्ट्स, रंग और फ़ॉन्ट को अनुकूलित करें',
    themeMode: 'थीम मोड',
    modeLight: 'लाइट',
    modeDark: 'डार्क',
    modeSystem: 'सिस्टम',
    presetsTitle: 'तैयार थीम',
    customColorsTitle: 'कस्टम रंग पैलेट',
    accentColorLabel: 'इंटरफ़ेस मुख्य रंग',
    glassControlsTitle: 'ग्लास सेटिंग्स',
    glassTransparency: 'ग्लास पारदर्शिता',
    blurIntensity: 'धुंधलापन (Blur)',
    borderOpacity: 'बॉर्डर चमक',
    shadowIntensity: 'छाया (Shadow) तीव्रता',
    cornerRadius: 'कोने की गोलाई (Radius)',
    typographyTitle: 'फ़ॉन्ट और लेआउट',
    fontFamilyLabel: 'फ़ॉन्ट परिवार',
    fontSizeLabel: 'फ़ॉन्ट का आकार',
    densityLabel: 'इंटरफ़ेस घनत्व',
    livePreviewTitle: 'लाइव पूर्वावलोकन',

    // Language Tab
    languageDesc: 'एप्लिकेशन के लिए अपनी पसंदीदा भाषा चुनें',
    selectLanguage: 'एप्लिकेशन भाषा चुनें',
    languageChangedToast: 'भाषा सफलतापूर्वक बदली गई',

    // Personalization Tab
    personalizationDesc: 'AI के बोलने का तरीका, नाम और निर्देश सेट करें',
    assistantNameLabel: 'AI सहायक का नाम',
    personaPresetsLabel: 'व्यक्तित्व प्रीसेट',
    systemPromptLabel: 'सिस्टम निर्देश (प्रॉम्प्ट)',
    strictPersonaNote: 'वर्तमान और नए सभी चैट में तुरंत प्रभावी होगा।',

    // AI Provider Tab
    aiDesc: 'Google Gemini API कनेक्शन और मॉडल प्रबंधित करें',
    aiUrlLabel: 'Gemini API स्थिति',
    enableProxyLabel: 'लोकल सुरक्षा प्रॉक्सी सक्षम करें',
    proxyDesc: 'ब्राउज़र प्रतिबंधों को समाप्त करता है और सॉकेट पोर्ट स्कैनिंग सक्षम करता है।',
    testConnection: 'कनेक्शन जांचें',
    installedModelsTitle: 'समर्थित Gemini मॉडल',

    // AI Parameters
    parametersDesc: 'संदर्भ लंबाई (Context length), तापमान और हार्डवेयर मोड सेट करें',
    contextLengthTitle: 'संदर्भ लंबाई (Context length)',
    contextLengthDesc: 'यह निर्धारित करता है कि स्थानीय मॉडल आपकी बातचीत का कितना हिस्सा याद रख सकते हैं।',
    temperatureTitle: 'तापमान (Temperature)',
    topPTitle: 'Top-P सैंपलिंग',
    forceCpuTitle: 'फ़ोर्स CPU मोड (num_gpu: 0)',
    forceCpuDesc: 'कम VRAM वाले लैपटॉप पर बड़े मॉडलों के क्रैश होने से बचाता है।',

    // Data & Storage
    dataDesc: 'MongoDB सिंक, बातचीत का इतिहास, बैकअप और रीस्टोर',
    mongoStatusTitle: 'MongoDB लोकल डेटाबेस',
    syncToMongo: 'लोकल चैट को मोंगो से सिंक करें',
    exportJson: 'सभी बातचीत निर्यात करें (JSON)',
    exportMd: 'वर्तमान चैट निर्यात करें (Markdown)',
    importBackup: 'बैकअप फ़ाइल आयात करें',
    clearAllChats: 'सभी चैट इतिहास साफ़ करें',

    // About
    aboutDesc: 'एप्लिकेशन संस्करण, संरचना और गोपनीयता गारंटी',

    // Actions & Buttons
    saveChanges: 'परिवर्तन सहेजें',
    cancel: 'रद्द करें',
    resetDefault: 'डिफ़ॉल्ट पर रीसेट करें',
    close: 'बंद करें',
  },
};

const LANG_STORAGE_KEY = 'personal_ai_language';

type TranslationKey = keyof typeof TRANSLATIONS.en;

class I18nManager {
  private currentLanguage: LanguageCode = 'en';
  private listeners: Set<(lang: LanguageCode) => void> = new Set();

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode | null;
      if (saved && (saved === 'en' || saved === 'ml' || saved === 'hi')) {
        this.currentLanguage = saved;
      }
    }
  }

  public getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  public setLanguage(lang: LanguageCode): void {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language to localStorage:', e);
    }
    for (const listener of this.listeners) {
      listener(lang);
    }
  }

  public translate(key: TranslationKey, fallback?: string): string {
    const dict = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || fallback || key;
  }

  public subscribe(listener: (lang: LanguageCode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const i18n = new I18nManager();

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => i18n.getLanguage());

  useEffect(() => {
    return i18n.subscribe((lang) => setCurrentLang(lang));
  }, []);

  const t = (key: TranslationKey, fallback?: string): string => {
    return i18n.translate(key, fallback);
  };

  return {
    t,
    currentLang,
    setLanguage: (lang: LanguageCode) => i18n.setLanguage(lang),
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
