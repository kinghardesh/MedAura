"use strict";

(function(){
  // Helper functions
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Translation helper
  const i18n = {
    lang: 'en',
    messages: {
      en: {
        appName: 'MedAura',
        chooseProfile: 'Choose Your Profile',
        subtitle: 'Personalized health guidance for everyone'
      }
    },
    t: function(key) {
      return this.messages[this.lang][key] || key;
    }
  };

  // Define main categories
  const MAIN_CATEGORIES = [
    {
      slug: 'men',
      key: 'Male',
      icon: '👨',
      directSlug: null
    },
    {
      slug: 'women',
      key: 'Female',
      icon: '👩',
      directSlug: null
    },
    {
      slug: 'elders',
      key: 'Elders',
      icon: '👴',
      directSlug: 'older-adults'
    }
  ];

  // Define subcategories
  const SUB_CATEGORIES = {
    'men': [
      { slug: 'young-men', key: 'Young Men', icon: '👦' },
      { slug: 'adult-men', key: 'Adult Men', icon: '👨' }
    ],
    'women': [
      { slug: 'young-women', key: 'Young Women', icon: '👧' },
      { slug: 'adult-women', key: 'Adult Women', icon: '👩' }
    ]
  };

  // Define routes and views
  const routes = {
    '/': renderLanding,
    '/profile/men': renderMenSubcategories,
    '/profile/women': renderWomenSubcategories,
    '/profile/elders': renderEldersDashboard,
    '/profile/men/young-men': () => renderDashboard('Young Men'),
    '/profile/men/adult-men': () => renderDashboard('Adult Men'),
    '/profile/women/young-women': () => renderDashboard('Young Women'),
    '/profile/women/adult-women': () => renderDashboard('Adult Women'),
    '/emergency': renderEmergencyPage
  };

  // Navigation function
  function navigate(path) {
    window.location.hash = path;
  }

  // Function to render landing page with smooth transitions
  function renderLanding() {
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'page-transition';
    
    // Create header
    const header = document.createElement('header');
    header.className = 'section-header';
    header.innerHTML = `
      <h1 class="persona-title">${i18n.t('chooseProfile')}</h1>
      <p class="persona-sub">${i18n.t('subtitle')}</p>
    `;
    
    main.appendChild(header);
    
    // Create grid of profiles
    const grid = document.createElement('div');
    grid.className = 'profile-grid';
    grid.setAttribute('role', 'list');
    
    // Create a card for each category
    MAIN_CATEGORIES.forEach(category => {
      const card = document.createElement('article');
      card.className = 'card persona-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'listitem');
      
      card.innerHTML = `
        <div class="persona-top">
          <span class="persona-icon">${category.icon}</span>
        </div>
        <div class="persona-title">${category.key}</div>
        <div class="persona-sub">${category.key === 'Elders' ? 'Simple care, big buttons, instant help.' : `${category.key} health profiles and resources.`}</div>
        <div class="actions">
          <button class="btn btn-primary">Continue</button>
        </div>
      `;
      
      const profilePath = `/profile/${category.slug}`;
      
      // Add click handler to button
      card.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(profilePath);
      });
      
      // Make the entire card clickable
      card.addEventListener('click', () => {
        navigate(profilePath);
      });
      
      // Add keyboard accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(profilePath);
          e.preventDefault();
        }
      });
      
      grid.appendChild(card);
    });
    
    main.appendChild(grid);
    
    // Trigger animation
    setTimeout(() => {
      main.classList.add('active');
    }, 10);
  }
  
  // Function to render subcategories for Men
  function renderMenSubcategories() {
    renderSubcategories('men', 'Male');
  }
  
  // Function to render subcategories for Women
  function renderWomenSubcategories() {
    renderSubcategories('women', 'Female');
  }
  
  // Generic function to render subcategories
  function renderSubcategories(categorySlug, categoryName) {
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'page-transition';
    
    // Create header
    const header = document.createElement('header');
    header.className = 'section-header';
    header.innerHTML = `
      <h1 class="persona-title">${categoryName} Health Profiles</h1>
      <p class="persona-sub">Select your specific profile</p>
    `;
    
    main.appendChild(header);
    
    // Create grid of subcategories
    const grid = document.createElement('div');
    grid.className = 'profile-grid';
    grid.setAttribute('role', 'list');
    
    // Create a card for each subcategory
    SUB_CATEGORIES[categorySlug].forEach(subcategory => {
      const card = document.createElement('article');
      card.className = 'card persona-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'listitem');
      
      card.innerHTML = `
        <div class="persona-top">
          <span class="persona-icon">${subcategory.icon}</span>
        </div>
        <div class="persona-title">${subcategory.key}</div>
        <div class="persona-sub">Health resources tailored for ${subcategory.key}</div>
        <div class="actions">
          <button class="btn btn-primary">Continue</button>
        </div>
      `;
      
      const profilePath = `/profile/${categorySlug}/${subcategory.slug}`;
      
      // Add click handler to button
      card.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(profilePath);
      });
      
      // Make the entire card clickable
      card.addEventListener('click', () => {
        navigate(profilePath);
      });
      
      // Add keyboard accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(profilePath);
          e.preventDefault();
        }
      });
      
      grid.appendChild(card);
    });
    
    main.appendChild(grid);
    
    // Add back button
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.innerHTML = `<a href="#/" class="link">← Back to Profiles</a>`;
    main.appendChild(backButton);
    
    // Trigger animation
    setTimeout(() => {
      main.classList.add('active');
    }, 10);
  }

  // Dashboard menu items
  const DASHBOARD_MENU = [
    { id: 'ai-chat', label: 'AI Health Chat', icon: '💬' },
    { id: 'book-doctor', label: 'Book Doctor', icon: '👨‍⚕️' },
    { id: 'medicine', label: 'Medicine Reminders', icon: '💊' },
    { id: 'routine', label: 'Daily Routine', icon: '📅' },
    { id: 'family', label: 'Family Dashboard', icon: '👪' },
    { id: 'reports', label: 'Health Reports', icon: '📊' },
    { id: 'emergency', label: 'Emergency SOS', icon: '🚨' },
    { id: 'prescription', label: 'Prescription Scanner', icon: '📷' },
    { id: 'diet', label: 'Diet', icon: '🥗' },
    { id: 'workout', label: 'Workout', icon: '💪' },
    { id: 'bmi', label: 'BMI Calculator', icon: '📏' }
  ];

  // Function to render the main dashboard
  function renderDashboard(profileType) {
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'page-transition dashboard-layout';
    
    // Create dashboard container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';
    
    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    
    // Add sidebar menu items
    DASHBOARD_MENU.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'sidebar-item';
      menuItem.innerHTML = `
        <span class="sidebar-icon">${item.icon}</span>
        <span class="sidebar-label">${item.label}</span>
      `;
      
      menuItem.addEventListener('click', () => {
        if (item.id === 'emergency') {
          navigate('/emergency');
        } else {
          // Highlight active menu item
          $$('.sidebar-item').forEach(el => el.classList.remove('active'));
          menuItem.classList.add('active');
          
          // Update main content area
          renderFeatureContent(item.id, profileType);
        }
      });
      
      sidebar.appendChild(menuItem);
    });
    
    // Create main content area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    contentArea.id = 'content-area';
    
    // Add welcome message and quick cards
    contentArea.innerHTML = `
      <div class="welcome-section">
        <h1>Welcome to your ${profileType} Dashboard</h1>
        <p>Your personalized health companion</p>
      </div>
      
      <div class="quick-cards">
        <div class="quick-card">
          <div class="quick-card-icon">👨‍⚕️</div>
          <div class="quick-card-title">Book a Doctor</div>
          <div class="quick-card-desc">Find and schedule appointments</div>
        </div>
        
        <div class="quick-card">
          <div class="quick-card-icon">💊</div>
          <div class="quick-card-title">Medication Reminder</div>
          <div class="quick-card-desc">Never miss your medications</div>
        </div>
        
        <div class="quick-card">
          <div class="quick-card-icon">📊</div>
          <div class="quick-card-title">Health Metrics</div>
          <div class="quick-card-desc">Track your vital statistics</div>
        </div>
      </div>
    `;
    
    // Add back navigation
    const backNav = document.createElement('div');
    backNav.className = 'back-nav';
    backNav.innerHTML = `<a href="#/" class="link">← Back to Profiles</a>`;
    
    // Assemble dashboard
    dashboardContainer.appendChild(sidebar);
    dashboardContainer.appendChild(contentArea);
    main.appendChild(dashboardContainer);
    main.appendChild(backNav);
    
    // Add SOS button for all dashboards
    const sosButton = document.createElement('div');
    sosButton.className = 'sos-button';
    sosButton.innerHTML = `<button class="btn btn-sos">SOS</button>`;
    sosButton.addEventListener('click', () => navigate('/emergency'));
    main.appendChild(sosButton);
    
    // Trigger animation
    setTimeout(() => {
      main.classList.add('active');
    }, 10);
  }
  
  // Function to render feature content in the main area
  function renderFeatureContent(featureId, profileType) {
    const contentArea = $('#content-area');
    if (!contentArea) return;
    
    // Fade out effect
    contentArea.classList.add('fade-out');
    
    setTimeout(() => {
      // Update content based on feature
      switch(featureId) {
        case 'ai-chat':
          contentArea.innerHTML = `
            <h2>AI Health Chat</h2>
            <div class="chat-container">
              <div class="chat-messages">
                <div class="chat-message system">Hello! How can I help with your health today?</div>
              </div>
              <div class="chat-input">
                <input type="text" placeholder="Type your health question..." />
                <button class="btn">Send</button>
              </div>
            </div>
          `;
          break;
          
        case 'book-doctor':
          contentArea.innerHTML = `
            <h2>Book a Doctor</h2>
            <div class="doctor-search">
              <input type="text" placeholder="Search by specialty, name, or location" />
              <button class="btn">Search</button>
            </div>
            <div class="doctor-list">
              <div class="doctor-card">
                <div class="doctor-image">👨‍⚕️</div>
                <div class="doctor-info">
                  <h3>Dr. John Smith</h3>
                  <p>Cardiologist • 4.9 ★</p>
                  <p>Available tomorrow</p>
                </div>
                <button class="btn">Book</button>
              </div>
              <div class="doctor-card">
                <div class="doctor-image">👩‍⚕️</div>
                <div class="doctor-info">
                  <h3>Dr. Sarah Johnson</h3>
                  <p>General Physician • 4.8 ★</p>
                  <p>Available today</p>
                </div>
                <button class="btn">Book</button>
              </div>
            </div>
          `;
          break;
          
        case 'prescription':
          contentArea.innerHTML = `
            <h2>Prescription Scanner</h2>
            <div class="scanner-container">
              <div class="scanner-preview">
                <div class="scanner-placeholder">📷 Camera Preview</div>
              </div>
              <button class="btn btn-primary">Scan Prescription</button>
              <p>Or upload an image</p>
              <button class="btn">Upload Image</button>
            </div>
          `;
          break;
          
        default:
          contentArea.innerHTML = `
            <h2>${DASHBOARD_MENU.find(item => item.id === featureId)?.label || 'Feature'}</h2>
            <div class="feature-placeholder">
              <p>This feature is coming soon!</p>
            </div>
          `;
      }
      
      // Fade in effect
      contentArea.classList.remove('fade-out');
    }, 300);
  }
  
  // Function to render Elders dashboard with special UI
  function renderEldersDashboard() {
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'page-transition dashboard-layout elders-dashboard';
    
    // Create dashboard container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';
    
    // Create sidebar with larger buttons for elders
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar elders-sidebar';
    
    // Add sidebar menu items with larger text and buttons
    const elderMenu = [
      { id: 'medicine', label: 'Medicine Reminders', icon: '💊' },
      { id: 'emergency', label: 'Emergency Help', icon: '🚨' },
      { id: 'doctor', label: 'Call Doctor', icon: '👨‍⚕️' },
      { id: 'family', label: 'Family Contacts', icon: '👪' },
      { id: 'prescription', label: 'Scan Prescription', icon: '📷' }
    ];
    
    elderMenu.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'sidebar-item elder-item';
      menuItem.innerHTML = `
        <span class="sidebar-icon">${item.icon}</span>
        <span class="sidebar-label">${item.label}</span>
      `;
      
      menuItem.addEventListener('click', () => {
        if (item.id === 'emergency') {
          navigate('/emergency');
        } else {
          // Highlight active menu item
          $$('.sidebar-item').forEach(el => el.classList.remove('active'));
          menuItem.classList.add('active');
          
          // Update main content area with elder-friendly UI
          renderElderFeatureContent(item.id);
        }
      });
      
      sidebar.appendChild(menuItem);
    });
    
    // Create main content area with larger text
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area elders-content';
    contentArea.id = 'content-area';
    
    // Add welcome message and quick cards with larger text
    contentArea.innerHTML = `
      <div class="welcome-section">
        <h1>Welcome to your Elders Dashboard</h1>
        <p>Simple health management made for you</p>
      </div>
      
      <div class="quick-cards elders-cards">
        <div class="quick-card elder-card">
          <div class="quick-card-icon">📷</div>
          <div class="quick-card-title">Scan Prescription</div>
          <div class="quick-card-desc">Take a photo of your prescription</div>
          <button class="btn btn-large">Scan Now</button>
        </div>
        
        <div class="quick-card elder-card">
          <div class="quick-card-icon">🚨</div>
          <div class="quick-card-title">Emergency Help</div>
          <div class="quick-card-desc">Get immediate assistance</div>
          <button class="btn btn-large btn-sos">SOS</button>
        </div>
      </div>
    `;
    
    // Add back navigation with larger text
    const backNav = document.createElement('div');
    backNav.className = 'back-nav elders-back';
    backNav.innerHTML = `<a href="#/" class="link">← Back to Profiles</a>`;
    
    // Assemble dashboard
    dashboardContainer.appendChild(sidebar);
    dashboardContainer.appendChild(contentArea);
    main.appendChild(dashboardContainer);
    main.appendChild(backNav);
    
    // Add persistent SOS button
    const sosButton = document.createElement('div');
    sosButton.className = 'sos-button sos-persistent';
    sosButton.innerHTML = `<button class="btn btn-sos btn-large">SOS</button>`;
    sosButton.addEventListener('click', () => navigate('/emergency'));
    main.appendChild(sosButton);
    
    // Trigger animation
    setTimeout(() => {
      main.classList.add('active');
    }, 10);
    
    // Add click handlers for quick cards
    setTimeout(() => {
      const scanButton = contentArea.querySelector('.elder-card:first-child .btn');
      if (scanButton) {
        scanButton.addEventListener('click', () => {
          $$('.sidebar-item').forEach(el => el.classList.remove('active'));
          sidebar.querySelector('.sidebar-item:nth-child(5)').classList.add('active');
          renderElderFeatureContent('prescription');
        });
      }
      
      const sosQuickButton = contentArea.querySelector('.elder-card:nth-child(2) .btn');
      if (sosQuickButton) {
        sosQuickButton.addEventListener('click', () => navigate('/emergency'));
      }
    }, 100);
  }
  
  // Function to render elder-friendly feature content
  function renderElderFeatureContent(featureId) {
    const contentArea = $('#content-area');
    if (!contentArea) return;
    
    // Fade out effect
    contentArea.classList.add('fade-out');
    
    setTimeout(() => {
      // Update content based on feature with elder-friendly UI
      switch(featureId) {
        case 'medicine':
          contentArea.innerHTML = `
            <h2>Medicine Reminders</h2>
            <div class="elder-reminders">
              <div class="elder-reminder-card">
                <div class="reminder-time">8:00 AM</div>
                <div class="reminder-med">Blood Pressure Pill</div>
                <div class="reminder-dose">1 tablet with water</div>
                <button class="btn btn-large">Mark as Taken</button>
              </div>
              
              <div class="elder-reminder-card">
                <div class="reminder-time">2:00 PM</div>
                <div class="reminder-med">Vitamin D</div>
                <div class="reminder-dose">1 tablet after lunch</div>
                <button class="btn btn-large">Mark as Taken</button>
              </div>
              
              <div class="elder-reminder-card">
                <div class="reminder-time">8:00 PM</div>
                <div class="reminder-med">Cholesterol Medicine</div>
                <div class="reminder-dose">1 tablet after dinner</div>
                <button class="btn btn-large">Mark as Taken</button>
              </div>
            </div>
          `;
          break;
          
        case 'prescription':
          contentArea.innerHTML = `
            <h2>Scan Your Prescription</h2>
            <div class="elder-scanner">
              <div class="scanner-preview">
                <div class="scanner-placeholder">📷 Camera Preview</div>
              </div>
              <button class="btn btn-primary btn-large">Take Photo</button>
              <p>Or ask someone to help you upload</p>
              <button class="btn btn-large">Upload Image</button>
            </div>
          `;
          break;
          
        case 'doctor':
          contentArea.innerHTML = `
            <h2>Call Your Doctor</h2>
            <div class="elder-contacts">
              <div class="elder-contact-card">
                <div class="contact-image">👨‍⚕️</div>
                <div class="contact-name">Dr. Robert Williams</div>
                <div class="contact-specialty">Family Doctor</div>
                <button class="btn btn-large">Call Now</button>
              </div>
              
              <div class="elder-contact-card">
                <div class="contact-image">👩‍⚕️</div>
                <div class="contact-name">Dr. Mary Johnson</div>
                <div class="contact-specialty">Cardiologist</div>
                <button class="btn btn-large">Call Now</button>
              </div>
            </div>
          `;
          break;
          
        case 'family':
          contentArea.innerHTML = `
            <h2>Family Contacts</h2>
            <div class="elder-contacts">
              <div class="elder-contact-card">
                <div class="contact-image">👨</div>
                <div class="contact-name">John (Son)</div>
                <div class="contact-specialty">Emergency Contact</div>
                <button class="btn btn-large">Call Now</button>
              </div>
              
              <div class="elder-contact-card">
                <div class="contact-image">👩</div>
                <div class="contact-name">Sarah (Daughter)</div>
                <div class="contact-specialty">Emergency Contact</div>
                <button class="btn btn-large">Call Now</button>
              </div>
            </div>
          `;
          break;
          
        default:
          contentArea.innerHTML = `
            <h2>Feature Coming Soon</h2>
            <div class="elder-placeholder">
              <p>This feature will be available soon!</p>
              <button class="btn btn-large">Go Back</button>
            </div>
          `;
      }
      
      // Fade in effect
      contentArea.classList.remove('fade-out');
    }, 300);
  }
  
  // Function to render emergency page
  function renderEmergencyPage() {
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'page-transition emergency-page';
    
    // Create emergency container
    const emergencyContainer = document.createElement('div');
    emergencyContainer.className = 'emergency-container';
    
    // Add emergency title
    const title = document.createElement('h1');
    title.className = 'emergency-title';
    title.textContent = 'Emergency Assistance';
    emergencyContainer.appendChild(title);
    
    // Create emergency options
    const options = document.createElement('div');
    options.className = 'emergency-options';
    
    // Medical SOS option
    const sosOption = document.createElement('div');
    sosOption.className = 'emergency-option';
    sosOption.innerHTML = `
      <button class="btn btn-danger btn-large">Medical SOS</button>
      <p>Call emergency services immediately</p>
    `;
    options.appendChild(sosOption);
    
    // Unsafe mode option
    const unsafeOption = document.createElement('div');
    unsafeOption.className = 'emergency-option';
    unsafeOption.innerHTML = `
      <button class="btn btn-unsafe btn-large">Unsafe Mode</button>
      <p>Alert when you feel unsafe</p>
    `;
    options.appendChild(unsafeOption);
    
    // CCTV option
    const cctvOption = document.createElement('div');
    cctvOption.className = 'emergency-option';
    cctvOption.innerHTML = `
      <button class="btn btn-large">Connect CCTV</button>
      <p>View security cameras</p>
    `;
    options.appendChild(cctvOption);
    
    emergencyContainer.appendChild(options);
    
    // Create toggle options
    const toggles = document.createElement('div');
    toggles.className = 'emergency-toggles';
    
    // Neighbor alert toggle
    const neighborToggle = document.createElement('div');
    neighborToggle.className = 'toggle-option';
    neighborToggle.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox">
        <span class="toggle-slider"></span>
      </label>
      <span>Alert Neighbors</span>
    `;
    toggles.appendChild(neighborToggle);
    
    // Family alert toggle
    const familyToggle = document.createElement('div');
    familyToggle.className = 'toggle-option';
    familyToggle.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox">
        <span class="toggle-slider"></span>
      </label>
      <span>Alert Family</span>
    `;
    toggles.appendChild(familyToggle);
    
    // Fall detection toggle
    const fallToggle = document.createElement('div');
    fallToggle.className = 'toggle-option';
    fallToggle.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox">
        <span class="toggle-slider"></span>
      </label>
      <span>Fall Detection</span>
    `;
    toggles.appendChild(fallToggle);
    
    emergencyContainer.appendChild(toggles);
    
    // Add fall detection demo button
    const demoSection = document.createElement('div');
    demoSection.className = 'emergency-demo';
    demoSection.innerHTML = `
      <button class="btn">Test Fall Detection</button>
    `;
    emergencyContainer.appendChild(demoSection);
    
    // Add back navigation
    const backNav = document.createElement('div');
    backNav.className = 'back-nav';
    backNav.innerHTML = `<a href="#/" class="link">← Back to Dashboard</a>`;
    
    main.appendChild(emergencyContainer);
    main.appendChild(backNav);
    
    // Trigger animation
    setTimeout(() => {
      main.classList.add('active');
    }, 10);
    
    // Add event listeners
    setTimeout(() => {
      const sosButton = sosOption.querySelector('button');
      if (sosButton) {
        sosButton.addEventListener('click', () => {
          alert('Emergency services contacted!');
        });
      }
      
      const unsafeButton = unsafeOption.querySelector('button');
      if (unsafeButton) {
        unsafeButton.addEventListener('click', () => {
          alert('Unsafe mode activated. Contacts notified.');
        });
      }
      
      const cctvButton = cctvOption.querySelector('button');
      if (cctvButton) {
        cctvButton.addEventListener('click', () => {
          alert('Connecting to home security cameras...');
        });
      }
      
      const fallButton = demoSection.querySelector('button');
      if (fallButton) {
        fallButton.addEventListener('click', () => {
          alert('Fall detected! Sending alert to emergency contacts.');
        });
      }
    }, 100);
  }

  // Handle hash changes for navigation
  window.addEventListener('hashchange', () => {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];
    
    if (route) {
      route();
    } else {
      // 404 - Route not found
      const main = $('#main');
      main.innerHTML = '<div class="error-container"><h1>Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="#/" class="btn">Go Home</a></div>';
    }
  });

  // Initialize the app
  function init() {
    // Set brand text
    const brandText = $('#brandText');
    if (brandText) {
      brandText.textContent = i18n.t('appName');
    }
    
    // Navigate to initial route
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];
    
    if (route) {
      route();
    } else {
      navigate('/');
    }
  }

  // Start the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
})();