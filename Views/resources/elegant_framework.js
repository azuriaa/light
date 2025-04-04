// Elegant CSS Framework - Complete Implementation
(function () {
  // =============================================
  // 1. STYLE INJECTION
  // =============================================

  // Create style element
  const style = document.createElement('style');
  style.id = 'elegant-css-framework';

  // CSS content
  const cssContent = `
  :root {
    /* Color System */
    --blue: #3498db;
    --gray: #5d5c61;
    --beige: #b1a296;
    --white: #f5f5f5;
    --black: #333333;
    --green: #2ecc71;
    --yellow: #f39c12;
    --red: #e74c3c;
    --light-blue: #3498db;
    
    /* Typography */
    --font-main: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
    --font-secondary: 'Playfair Display', Georgia, serif;
    
    /* Spacing & Effects */
    --border-radius: 4px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
  }

  /* Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-main);
    line-height: 1.6;
    color: var(--black);
    background-color: var(--white);
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-secondary);
    font-weight: 600;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.75rem; }
  h4 { font-size: 1.5rem; }
  h5 { font-size: 1.25rem; }
  h6 { font-size: 1rem; }

  p { margin-bottom: 1rem; }

  a {
    color: var(--blue);
    text-decoration: none;
    transition: var(--transition);
  }

  a:hover { color: var(--black); }

  /* Layout */
  .container {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  @media (min-width: 576px) { .container { max-width: 540px; } }
  @media (min-width: 768px) { .container { max-width: 720px; } }
  @media (min-width: 992px) { .container { max-width: 960px; } }
  @media (min-width: 1200px) { .container { max-width: 1140px; } }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }

  .col {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
  }

  /* Buttons */
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-family: var(--font-main);
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .btn-blue {
    background-color: var(--blue);
    color: white;
  }

  .btn-blue:hover {
    background-color: #2980b9;
    box-shadow: var(--box-shadow);
  }

  .btn-green {
    background-color: var(--green);
    color: white;
  }

  .btn-yellow {
    background-color: var(--yellow);
    color: var(--black);
  }

  .btn-red {
    background-color: var(--red);
    color: white;
  }

  .btn-outline {
    background-color: transparent;
    border: 1px solid var(--blue);
    color: var(--blue);
  }

  .btn-outline:hover {
    background-color: var(--blue);
    color: white;
  }

  /* Cards */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: white;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: var(--transition);
  }

  .card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .card-body {
    flex: 1 1 auto;
    padding: 1.5rem;
  }

  .card-title {
    margin-bottom: 0.75rem;
    font-family: var(--font-secondary);
  }

  /* Forms */
  .form-control {
    display: block;
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--black);
    background-color: white;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .form-control:focus {
    border-color: var(--beige);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(177, 162, 150, 0.25);
  }

  /* Navigation */
  .navbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    font-weight: 500;
  }

  /* Dropdown */
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-toggle {
    padding: 0.75rem 1.5rem;
    background-color: white;
    border: 1px solid var(--gray);
    border-radius: var(--border-radius);
    color: var(--black);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dropdown-toggle:hover {
    border-color: var(--beige);
  }

  .dropdown-toggle::after {
    content: "";
    display: inline-block;
    margin-left: 0.5rem;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--gray);
    transition: var(--transition);
  }

  .dropdown-toggle.show::after {
    transform: rotate(180deg);
    border-top-color: var(--beige);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    min-width: 200px;
    padding: 0.5rem 0;
    margin: 0.125rem 0 0;
    font-size: 1rem;
    color: var(--black);
    text-align: left;
    list-style: none;
    background-color: white;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .dropdown-menu.show {
    display: block;
    opacity: 1;
    transform: translateY(0);
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1.5rem;
    clear: both;
    font-weight: 400;
    color: var(--black);
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    cursor: pointer;
    transition: var(--transition);
  }

  .dropdown-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--blue);
  }

  /* Dialog (formerly Modal) */
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dialog-backdrop.show {
    display: block;
    opacity: 1;
  }

  .dialog {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
    display: none;
  }

  .dialog.show {
    display: block;
  }

  .dialog-box {
    position: relative;
    width: auto;
    margin: 1.75rem auto;
    max-width: 600px;
    pointer-events: none;
    transition: transform 0.3s ease-out;
    transform: translateY(-50px);
  }

  .dialog.show .dialog-box {
    transform: translateY(0);
  }

  .dialog-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    background-color: white;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: var(--border-radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    outline: 0;
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .dialog-title {
    margin-bottom: 0;
    font-family: var(--font-secondary);
    font-size: 1.5rem;
    font-weight: 600;
  }

  .dialog-close {
    padding: 0.5rem;
    background: transparent;
    border: 0;
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
    color: var(--gray);
    cursor: pointer;
    transition: var(--transition);
  }

  .dialog-close:hover {
    color: var(--black);
    transform: rotate(90deg);
  }

  .dialog-body {
    position: relative;
    flex: 1 1 auto;
    padding: 1.5rem;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid #e9ecef;
  }

  .dialog-footer > * {
    margin-left: 0.5rem;
  }

  /* Dialog Sizes */
  .dialog-sm .dialog-box { max-width: 400px; }
  .dialog-lg .dialog-box { max-width: 800px; }
  .dialog-xl .dialog-box { max-width: 1140px; }

  /* Snackbar */
  .snackbar-container {
    position: fixed;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .snackbar-top-center {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .snackbar-top-right {
    top: 1rem;
    right: 1rem;
  }

  .snackbar-bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .snackbar-bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  .snackbar-bottom-left {
    bottom: 1rem;
    left: 1rem;
  }

  .snackbar-top-left {
    top: 1rem;
    left: 1rem;
  }

  .snackbar {
    display: flex;
    align-items: center;
    min-width: 250px;
    max-width: 350px;
    padding: 0.75rem 1rem;
    background-color: var(--black);
    color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .snackbar.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .snackbar-message {
    flex: 1;
    padding: 0 0.5rem;
  }

  .snackbar-close {
    margin-left: 0.5rem;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: var(--transition);
  }

  .snackbar-close:hover { opacity: 1; }

  /* Snackbar Types */
  .snackbar-green { background-color: var(--green); }
  .snackbar-red { background-color: var(--red); }
  .snackbar-yellow {
    background-color: var(--yellow);
    color: var(--black);
  }
  .snackbar-blue { background-color: var(--blue); }

  /* Circular Progress */
  .circular-progress {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
  }

  .circular-progress-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .circular-progress-track {
    fill: none;
    stroke: #f0f0f0;
    stroke-width: 6;
  }

  .circular-progress-indicator {
    fill: none;
    stroke: var(--blue);
    stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;
  }

  .circular-progress-text {
    position: absolute;
    font-size: 1rem;
    font-weight: 600;
    color: var(--black);
  }

  /* Size Variants */
  .circular-progress-sm {
    width: 40px;
    height: 40px;
  }
  .circular-progress-sm .circular-progress-text {
    font-size: 0.7rem;
  }
  .circular-progress-sm .circular-progress-track,
  .circular-progress-sm .circular-progress-indicator {
    stroke-width: 4;
  }

  .circular-progress-lg {
    width: 96px;
    height: 96px;
  }
  .circular-progress-lg .circular-progress-text {
    font-size: 1.5rem;
  }
  .circular-progress-lg .circular-progress-track,
  .circular-progress-lg .circular-progress-indicator {
    stroke-width: 8;
  }

  /* Color Variants */
  .circular-progress-blue .circular-progress-indicator {
    stroke: var(--blue);
  }
  .circular-progress-green .circular-progress-indicator {
    stroke: var(--green);
  }
  .circular-progress-yellow .circular-progress-indicator {
    stroke: var(--yellow);
  }
  .circular-progress-red .circular-progress-indicator {
    stroke: var(--red);
  }
  .circular-progress-beige .circular-progress-indicator {
    stroke: var(--beige);
  }

  /* Utility Classes */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 3rem; }

  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 3rem; }

  /* Animations */
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .rotate {
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  `;

  // Add CSS to style element
  style.textContent = cssContent;

  // Add font link to head
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@600&display=swap';
  fontLink.rel = 'stylesheet';

  // Add elements to head
  document.head.appendChild(fontLink);
  document.head.appendChild(style);

  // =============================================
  // 2. COMPONENT INITIALIZATION
  // =============================================

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
  } else {
    initializeComponents();
  }

  function initializeComponents() {
    // Initialize Dialogs
    document.querySelectorAll('[data-toggle="dialog"]').forEach(button => {
      button.addEventListener('click', function () {
        const target = this.getAttribute('data-target');
        document.querySelector(target).classList.add('show');
        document.querySelector(target + '-backdrop').classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    document.querySelectorAll('.dialog-close, .dialog-backdrop').forEach(el => {
      el.addEventListener('click', function () {
        const dialogId = this.closest('.dialog') ?
          this.closest('.dialog').id :
          this.id.replace('-backdrop', '');

        if (dialogId) {
          document.getElementById(dialogId).classList.remove('show');
          document.getElementById(dialogId + '-backdrop').classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.dialog.show').forEach(dialog => {
          dialog.classList.remove('show');
          document.getElementById(dialog.id + '-backdrop').classList.remove('show');
          document.body.style.overflow = '';
        });
      }
    });

    // Initialize Dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const dropdown = this.closest('.dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');

        document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
          if (openMenu !== menu) {
            openMenu.classList.remove('show');
            openMenu.previousElementSibling.classList.remove('show');
          }
        });

        menu.classList.toggle('show');
        this.classList.toggle('show');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
          menu.previousElementSibling.classList.remove('show');
        });
      }
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', function () {
        const menu = this.closest('.dropdown-menu');
        if (menu) {
          menu.classList.remove('show');
          menu.previousElementSibling.classList.remove('show');
        }
      });
    });

    // Initialize Snackbar
    window.ElegantSnackbar = new Snackbar();

    // Initialize Circular Progress
    document.querySelectorAll('[data-circular-progress]').forEach(el => {
      const value = parseFloat(el.getAttribute('data-value')) || 0;
      const max = parseFloat(el.getAttribute('data-max')) || 100;
      const indeterminate = el.hasAttribute('data-indeterminate');
      const size = el.getAttribute('data-size') || 'medium';
      const color = el.getAttribute('data-color') || 'blue';

      new CircularProgress(el, { value, max, indeterminate, size, color });
    });
  }

  // =============================================
  // 3. COMPONENT CLASSES
  // =============================================

  /** Snackbar/Toast Notification System */
  class Snackbar {
    constructor() {
      this.container = document.createElement('div');
      this.container.className = 'snackbar-container snackbar-bottom-right';
      document.body.appendChild(this.container);
    }

    show(options) {
      const snackbar = document.createElement('div');
      snackbar.className = `snackbar ${options.type || ''}`;

      // Message
      const message = document.createElement('div');
      message.className = 'snackbar-message';
      message.textContent = options.message;
      snackbar.appendChild(message);

      // Action Button
      if (options.actionText) {
        const action = document.createElement('button');
        action.className = 'snackbar-action';
        action.textContent = options.actionText;
        action.addEventListener('click', () => {
          options.action?.();
          this.dismiss(snackbar);
        });
        snackbar.appendChild(action);
      }

      // Close Button
      const close = document.createElement('button');
      close.className = 'snackbar-close';
      close.innerHTML = '&times;';
      close.addEventListener('click', () => this.dismiss(snackbar));
      snackbar.appendChild(close);

      // Progress Bar
      if (options.autoDismiss !== false) {
        const progress = document.createElement('div');
        progress.className = 'snackbar-progress';
        const progressBar = document.createElement('div');
        progressBar.className = 'snackbar-progress-bar';
        progress.appendChild(progressBar);
        snackbar.appendChild(progress);
      }

      this.container.appendChild(snackbar);

      // Show animation
      setTimeout(() => snackbar.classList.add('show'), 10);

      // Auto dismiss
      if (options.autoDismiss !== false) {
        const duration = typeof options.autoDismiss === 'number' ?
          options.autoDismiss : 5000;

        setTimeout(() => this.dismiss(snackbar), duration);
      }

      return snackbar;
    }

    dismiss(snackbar) {
      if (snackbar?.parentNode) {
        snackbar.classList.remove('show');
        setTimeout(() => {
          snackbar.parentNode.removeChild(snackbar);
        }, 300);
      }
    }

    setPosition(position) {
      const positions = [
        'top-center', 'top-right', 'top-left',
        'bottom-center', 'bottom-right', 'bottom-left'
      ];

      if (positions.includes(position)) {
        this.container.className = `snackbar-container snackbar-${position}`;
      }
    }
  }

  /** Circular Progress Component */
  class CircularProgress {
    constructor(element, options = {}) {
      this.element = element;
      this.value = options.value || 0;
      this.max = options.max || 100;
      this.indeterminate = options.indeterminate || false;
      this.size = options.size || 'medium';
      this.color = options.color || 'blue';

      this.init();
    }

    init() {
      // Create SVG
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.classList.add('circular-progress-svg');
      svg.setAttribute('viewBox', '0 0 36 36');

      // Create track (background circle)
      const track = document.createElementNS(svgNS, 'circle');
      track.classList.add('circular-progress-track');
      track.setAttribute('cx', '18');
      track.setAttribute('cy', '18');
      track.setAttribute('r', '15');
      svg.appendChild(track);

      // Create indicator (progress circle)
      const indicator = document.createElementNS(svgNS, 'circle');
      indicator.classList.add('circular-progress-indicator');
      indicator.setAttribute('cx', '18');
      indicator.setAttribute('cy', '18');
      indicator.setAttribute('r', '15');
      svg.appendChild(indicator);

      // Create text
      const text = document.createElement('div');
      text.classList.add('circular-progress-text');

      // Add size class
      if (this.size === 'small') {
        this.element.classList.add('circular-progress-sm');
      } else if (this.size === 'large') {
        this.element.classList.add('circular-progress-lg');
      }

      // Add color class
      this.element.classList.add(`circular-progress-${this.color}`);

      // Set indeterminate state
      if (this.indeterminate) {
        this.element.classList.add('circular-progress-indeterminate');
        text.textContent = '';
      } else {
        this.update(this.value);
      }

      // Append elements
      this.element.appendChild(svg);
      this.element.appendChild(text);
    }

    update(value) {
      if (this.indeterminate) return;

      this.value = Math.min(Math.max(value, 0), this.max);
      const percentage = (this.value / this.max) * 100;
      const circumference = 2 * Math.PI * 15;
      const offset = circumference - (percentage / 100) * circumference;

      const indicator = this.element.querySelector('.circular-progress-indicator');
      const text = this.element.querySelector('.circular-progress-text');

      if (indicator) {
        indicator.style.strokeDasharray = `${circumference} ${circumference}`;
        indicator.style.strokeDashoffset = offset;
      }

      if (text) {
        text.textContent = `${Math.round(percentage)}%`;
      }
    }

    setIndeterminate(state) {
      this.indeterminate = state;
      if (state) {
        this.element.classList.add('circular-progress-indeterminate');
        const text = this.element.querySelector('.circular-progress-text');
        if (text) text.textContent = '';
      } else {
        this.element.classList.remove('circular-progress-indeterminate');
        this.update(this.value);
      }
    }
  }
})();