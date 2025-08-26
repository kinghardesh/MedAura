"use strict";

(function(){
  // Helper functions
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Create element helper function
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          el.style[prop] = val;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    });
    
    // Add children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });
    } else if (typeof children === 'string') {
      el.textContent = children;
    } else if (children instanceof Node) {
      el.appendChild(children);
    }
    
    return el;
  }

  // Translation helper
  const i18n = {
    lang: 'en',
    messages: {
      en: {
        appName: 'MedAura',
        chooseProfile: 'Choose Your Profile',
        subtitle: 'Personalized health guidance for everyone',
        continue: 'Continue',
        backToProfiles: 'Back to Profiles',
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
        oaTag: 'Care that's clear, calm, and close.'
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

  // Function to render landing page
  function renderLanding() {
    const main = $('#main');
    main.innerHTML = '';
    
    // Create header
    const header = h('header', {class:'section-header'}, [
      h('h1', {class:'persona-title'}, i18n.t('chooseProfile')),
      h('p', {class:'persona-sub'}, i18n.t('subtitle'))
    ]);
    
    main.appendChild(header);
    
    // Create grid of profiles
    const grid = h('div', {class:'profile-grid', role:'list'});
    
    // Create a card for each category
    MAIN_CATEGORIES.forEach(category => {
      const card = h('article', {class:'card persona-card', tabindex:'0', role:'listitem'}, [
        h('div', {class:'persona-top'}, [
          h('span', {class:'persona-icon'}, category.icon),
        ]),
        h('div', {class:'persona-title'}, category.key),
        h('div', {class:'persona-sub'}, category.key === 'Elders' ? 'Simple care, big buttons, instant help.' : `${category.key} health profiles and resources.`),
        h('div', {class:'actions'}, [
          h('button', {class:'btn btn-primary', onClick: () => alert(`Clicked on ${category.key}`)}, 'Continue')
        ])
      ]);
      
      grid.appendChild(card);
    });
    
    main.appendChild(grid);
  }

  // Initialize the app
  function init() {
    // Set brand text
    $('#brandText').textContent = i18n.t('appName');
    
    // Render landing page
    renderLanding();
  }

  // Start the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
})();