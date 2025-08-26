'use strict';

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const i18n = {
    lang: 'en', // Always use English
    messages: {
      en: {
        appName: 'MedAura',
        choosePersona: 'Choose Your Persona',
        subtitle: 'Personalized health guidance for everyone',
        continue: 'Continue',
        backToPersonas: 'Back to Profile',
        heroTitle: 'Welcome to MedAura',
        quickActions: 'Top 3 Quick Actions',
        recommended: 'Recommended for You',
        aiHealthChat: 'AI Health Chat',
        bookDoctor: 'Book a Doctor',
        medReminders: 'Medicine Reminders',
        youngMen: 'Young Men',
        adultMen: 'Adult Men',
        youngWomen: 'Young Women',
        adultWomen: 'Adult Women',
        olderAdults: 'Older Adults',
        ymSub: 'Active routines, study & sport wellness.',
        amSub: 'Health checkups, reminders, less stress.',
        ywSub: 'Cycles, nutrition, balance & support.',
        awSub: 'Preventive care, routines, family health.',
        oaSub: 'Simple care, big buttons, instant help.',
        ymTag: 'Build strong habits for body and mind.',
        amTag: 'Stay on top of health—without the hassle.',
        ywTag: 'Gentle guidance for everyday wellbeing.',
        awTag: 'Your partner for preventive care.',
        oaTag: 'Care that’s clear, calm, and close.'
      },
      hi: {
        appName: 'MedAura',
        choosePersona: 'अपनी पहचान चुनें',
        subtitle: 'हर किसी के लिए व्यक्तिगत स्वास्थ्य मार्गदर्शन',
        continue: 'जारी रखें',
        backToPersonas: 'वापस जाएँ',
        heroTitle: 'MedAura में आपका स्वागत है',
        quickActions: 'शीर्ष 3 त्वरित क्रियाएँ',
        recommended: 'आपके लिए सुझाव',
        sos: 'आपातकाल SOS',
        cancel: 'रद्द करें',
        sendNow: 'अभी भेजें',
        sendingIn: 'अलर्ट भेजा जाएगा',
        aiHealthChat: 'एआई हेल्थ चैट',
        bookDoctor: 'डॉक्टर से अपॉइंटमेंट',
        medReminders: 'दवा याद दिलाना',
        youngMen: 'Young Men',
        adultMen: 'Adult Men',
        youngWomen: 'Young Women',
        adultWomen: 'Adult Women',
        olderAdults: 'Older Adults',
        ymSub: 'सक्रिय दिनचर्या, पढ़ाई व खेल स्वास्थ्य।',
        amSub: 'हेल्थ चेकअप, रिमाइंडर, कम तनाव।',
        ywSub: 'चक्र, पोषण, संतुलन व सहयोग।',
        awSub: 'रोकथाम देखभाल, दिनचर्या, परिवार स्वास्थ्य।',
        oaSub: 'सरल देखभाल, बड़े बटन, त्वरित मदद।',
        ymTag: 'शरीर और मन के लिए मजबूत आदतें।',
        amTag: 'झंझट के बिना स्वास्थ्य का ध्यान रखें।',
        ywTag: 'दैनिक कल्याण के लिए हल्का मार्गदर्शन।',
        awTag: 'रोकथाम देखभाल में आपका साथी।',
        oaTag: 'स्पष्ट, शांत और पास देखभाल।'
      }
    },
    t(key){
      return this.messages[this.lang][key] || key;
    }
  };

  // Original detailed profiles
  const DETAILED_PROFILES = [
    { slug: 'young-men', key: 'youngMen', sub: 'ymSub', tag: 'ymTag', icon: '🏃' },
    { slug: 'adult-men', key: 'adultMen', sub: 'amSub', tag: 'amTag', icon: '🧑‍⚕️' },
    { slug: 'young-women', key: 'youngWomen', sub: 'ywSub', tag: 'ywTag', icon: '🌸' },
    { slug: 'adult-women', key: 'adultWomen', sub: 'awSub', tag: 'awTag', icon: '👩‍⚕️' },
    { slug: 'older-adults', key: 'olderAdults', sub: 'oaSub', tag: 'oaTag', icon: '🧓' }
  ];
  
  // Main category profiles for landing page
  const MAIN_CATEGORIES = [
    { slug: 'men', key: 'Men', icon: '👨', subCategories: ['young-men', 'adult-men'] },
    { slug: 'women', key: 'Women', icon: '👩', subCategories: ['young-women', 'adult-women'] },
    { slug: 'elderly', key: 'Elderly', icon: '🧓', directSlug: 'older-adults' }
  ];

  const routes = {
    '/': renderLanding,
    '/category/men': () => renderSubCategories('men'),
    '/category/women': () => renderSubCategories('women'),
    '/persona/young-men': () => renderPersona('young-men'),
    '/persona/adult-men': () => renderPersona('adult-men'),
    '/persona/young-women': () => renderPersona('young-women'),
    '/persona/adult-women': () => renderPersona('adult-women'),
    '/persona/older-adults': () => renderPersona('older-adults'),
    '/chat': () => alert('AI Health Chat (demo)'),
    '/appointments/new': () => alert('Book a Doctor (demo)'),
    '/reminders': () => alert('Medicine Reminders (demo)'),
    '/young-men/diet': () => renderDietPage(),
    '/young-men/bmi-calculator': () => renderBMICalculator(),
    '/young-men/workout': () => renderWorkoutPage()
  };
  
  // Function to render sub-categories for Men and Women
  function renderSubCategories(categorySlug) {
    const category = MAIN_CATEGORIES.find(c => c.slug === categorySlug);
    if (!category) return renderLanding();
    
    const main = $('#main');
    main.innerHTML = '';
    
    main.appendChild(h('section', {class:'hero'}, [
      h('h1', {class:'persona-title'}, `Choose ${category.key} Profile`),
      h('p', {class:'persona-sub'}, `Select the profile that best matches your needs`),
      h('a', {class:'link back-link', href:'#/', style:'display:block;margin-top:1rem;'}, 'Back to Main Categories')
    ]));
    
    const grid = h('div', {class:'grid grid-profiles', role:'list'});
    
    // Get the sub-categories from DETAILED_PROFILES based on the category's subCategories array
    const subProfiles = DETAILED_PROFILES.filter(p => category.subCategories.includes(p.slug));
    
    subProfiles.forEach(p => {
      const card = h('article', {class:'card persona-card', tabindex:'0', role:'listitem', 'aria-label': i18n.t(p.key)}, [
        h('div', {class:'persona-top'}, [
          h('span', {class:'persona-icon', 'aria-hidden':'true'}, p.icon),
          h('div', {}, [
            h('div', {class:'persona-title'}, i18n.t(p.key)),
            h('div', {class:'persona-sub'}, i18n.t(p.sub))
          ])
        ]),
        h('div', {class:'actions'}, [
          h('button', {class:'btn btn-primary', 'aria-label': `${i18n.t('continue')} – ${i18n.t(p.key)}`, onClick: ()=> navigate(`/persona/${p.slug}`)}, i18n.t('continue'))
        ])
      ]);
      
      card.addEventListener('click', () => navigate(`/persona/${p.slug}`));
      card.addEventListener('keyup', (e) => { 
        if (e.key === 'Enter' || e.key === ' ') navigate(`/persona/${p.slug}`);
      });
      
      grid.appendChild(card);
    });
    
    main.appendChild(grid);
  }

  function h(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach(c => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }

  function navigate(path){
    location.hash = `#${path}`;
  }

  function renderLanding(){
    const main = $('#main');
    main.innerHTML = '';
    main.appendChild(h('section', {class:'hero'}, [
      h('h1', {class:'persona-title'}, i18n.t('choosePersona')),
      h('p', {class:'persona-sub'}, i18n.t('subtitle'))
    ]));

    const grid = h('div', {class:'grid grid-profiles', role:'list'});
    MAIN_CATEGORIES.forEach(category => {
      const card = h('article', {class:'card persona-card', tabindex:'0', role:'listitem', 'aria-label': category.key}, [
        h('div', {class:'persona-top'}, [
          h('span', {class:'persona-icon', 'aria-hidden':'true'}, category.icon),
          h('div', {}, [
            h('div', {class:'persona-title'}, category.key),
            h('div', {class:'persona-sub'}, category.directSlug ? 
              `Direct access to ${category.key} dashboard` : 
              `Choose between different ${category.key} profiles`)
          ])
        ]),
        h('div', {class:'actions'}, [
          h('button', {class:'btn btn-primary', 'aria-label': `${i18n.t('continue')} – ${category.key}`, 
            onClick: ()=> {
              if (category.directSlug) {
                // For Elderly, navigate directly to the dashboard
                navigate(`/persona/${category.directSlug}`);
              } else {
                // For Men and Women, navigate to sub-category selection
                navigate(`/category/${category.slug}`);
              }
            }}, 
            i18n.t('continue'))
        ])
      ]);
      
      card.addEventListener('click', () => {
        if (category.directSlug) {
          navigate(`/persona/${category.directSlug}`);
        } else {
          navigate(`/category/${category.slug}`);
        }
      });
      
      card.addEventListener('keyup', (e) => { 
        if (e.key === 'Enter' || e.key === ' ') {
          if (category.directSlug) {
            navigate(`/persona/${category.directSlug}`);
          } else {
            navigate(`/category/${category.slug}`);
          }
        }
      });
      
      grid.appendChild(card);
    });
    main.appendChild(grid);
  }

  function quickActions(){
    const btn = (text, to) => h('button', {class:'btn btn-primary', onClick:()=>navigate(to)}, text);
    return h('div', {class:'actions'}, [
      btn(i18n.t('aiHealthChat'), '/chat'),
      btn(i18n.t('bookDoctor'), '/appointments/new'),
      btn(i18n.t('medReminders'), '/reminders')
    ]);
  }

  function personaRecommendations(slug){
    const items = {
      'young-men': ['Study & sport wellness', 'Injury prevention basics', 'Sleep routine tips'],
      'adult-men': ['BP/Diabetes screening', 'Stress management', 'Fitness basics'],
      'young-women': ['Cycle tracker (mock)', 'Anemia awareness', 'Mental wellness'],
      'adult-women': ['Preventive screenings', 'Family-care shortcuts', 'Thyroid basics'],
      'older-adults': ['One-Tap SOS', 'Prescription scanner', 'Video call family', 'Fall-safety tips']
    }[slug];
    const grid = h('div', {class:'tile-grid'});
    items.forEach(t => grid.appendChild(h('div', {class:'tile'}, [h('strong', {}, t), h('span', {class:'persona-sub'}, '—')])));
    return grid;
  }

  function renderPersona(slug){
    const meta = DETAILED_PROFILES.find(p=>p.slug===slug);
    const main = $('#main');
    main.innerHTML = '';
    
    // Create navigation panel for the left side
    const navPanelItems = [
      h('div', {class:'badge nav-badge'}, [meta.icon, i18n.t(meta.key)])
    ];
    
    // For Young Men, use 'Features' as the section title
    if (slug === 'young-men') {
      navPanelItems.push(h('h2', {}, 'Features'));
      
      // Use buttons for all features to maintain consistent styling
      const btn = (text, to) => h('button', {class:'btn btn-primary', onClick:()=>navigate(to)}, text);
      
      // Add all features as buttons with consistent styling
      navPanelItems.push(h('div', {class:'actions'}, [
        btn(i18n.t('aiHealthChat'), '/chat'),
        btn(i18n.t('bookDoctor'), '/appointments/new'),
        btn(i18n.t('medReminders'), '/reminders'),
        btn('Diet', '/young-men/diet'),
        btn('BMI Calculator', '/young-men/bmi-calculator'),
        btn('Workout', '/young-men/workout')
      ]));
    } else {
      // For other personas, use 'Quick Actions' as the section title
      navPanelItems.push(h('h2', {}, i18n.t('quickActions')));
      navPanelItems.push(quickActions());
    }
    
    // Back to Personas link
    navPanelItems.push(h('a', {class:'link back-link', href:'#/'}, i18n.t('backToPersonas')));
    
    const navPanel = h('nav', {class:'sidebar nav-panel', role:'navigation'}, navPanelItems);
    
    // Create main content area
    const contentArea = h('div', {class:'content-area'}, [
      h('section', {class:'hero'}, [
        h('h1', {}, i18n.t('heroTitle')),
        h('p', {class:'persona-sub'}, i18n.t(meta.tag))
      ]),
      h('section', {class:'section'}, [
        h('h2', {}, i18n.t('recommended')),
        personaRecommendations(slug)
      ])
    ]);
    
    // Create layout with navigation panel on the left and content on the right
    const layout = h('div', {class:'persona-layout'}, [navPanel, contentArea]);
    main.appendChild(layout);
  }

  // Diet page with placeholder content
  function renderDietPage() {
    const main = $('#main');
    main.innerHTML = '';
    
    main.appendChild(h('section', {class:'hero'}, [
      h('h1', {}, 'Diet'),
      h('p', {class:'persona-sub'}, 'Nutrition tips and meal plans coming soon.')
    ]));
  }
  
  // BMI Calculator page
  function renderBMICalculator() {
    const main = $('#main');
    main.innerHTML = '';
    
    main.appendChild(h('section', {class:'hero'}, [
      h('h1', {}, 'BMI Calculator'),
      h('p', {class:'persona-sub'}, 'Calculate your Body Mass Index')
    ]));
    
    const calculatorForm = h('form', {class:'bmi-form', onsubmit: (e) => {
      e.preventDefault();
      calculateBMI();
    }}, [
      h('div', {class:'form-group'}, [
        h('label', {for:'weight'}, 'Weight (kg):'),
        h('input', {type:'number', id:'weight', min:'30', max:'300', required:true, placeholder:'Enter weight in kg'})
      ]),
      h('div', {class:'form-group'}, [
        h('label', {for:'height'}, 'Height (cm):'),
        h('input', {type:'number', id:'height', min:'100', max:'250', required:true, placeholder:'Enter height in cm'})
      ]),
      h('button', {type:'submit', class:'btn btn-primary'}, 'Calculate')
    ]);
    
    const resultDiv = h('div', {id:'bmi-result', class:'bmi-result'});
    
    const container = h('div', {class:'bmi-container'}, [
      calculatorForm,
      resultDiv
    ]);
    
    main.appendChild(container);
    
    // Function to calculate BMI
    function calculateBMI() {
      const weight = parseFloat($('#weight').value);
      const height = parseFloat($('#height').value) / 100; // Convert cm to meters
      
      if (isNaN(weight) || isNaN(height) || height <= 0 || weight <= 0) {
        resultDiv.innerHTML = '<p class="error">Please enter valid values</p>';
        return;
      }
      
      const bmi = weight / (height * height);
      let category = '';
      
      if (bmi < 18.5) {
        category = 'Underweight';
      } else if (bmi < 25) {
        category = 'Normal';
      } else if (bmi < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }
      
      resultDiv.innerHTML = `
        <h3>Your BMI Result</h3>
        <p><strong>BMI:</strong> ${bmi.toFixed(2)}</p>
        <p><strong>Category:</strong> ${category}</p>
      `;
    }
  }
  
  // Workout page with motivational heading
  function renderWorkoutPage() {
    const main = $('#main');
    main.innerHTML = '';
    
    main.appendChild(h('section', {class:'hero'}, [
      h('h1', {}, 'Workouts to Keep You Fit'),
      h('p', {class:'persona-sub'}, 'Bodyweight workout videos and their benefits coming soon.')
    ]));
  }
  
  function route(){
    const hash = location.hash.replace(/^#/, '') || '/';
    const match = routes[hash];
    if (match) match(); else renderLanding();
    $('#brandText').textContent = i18n.t('appName');
    $('#year').textContent = new Date().getFullYear();
  }

  // SOS modal functionality removed

  // events
  window.addEventListener('hashchange', route);

  // initial
  function render(){ route(); }
  render();
})();
