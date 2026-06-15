/**
 * South American Deforestation Dashboard - Core App Controller
 * Orchestrates application states, playback loops, and visual syncing.
 */

const App = {
  // App States
  activeYear: 2000,
  activeCountry: "South America",
  isPlaying: false,
  playInterval: null,

  /**
   * Application entrance point - asynchronous loading from CSV
   */
  init: async function() {
    // 1. Await dynamic CSV database parsing
    await DEFORESTATION_DATA.loadCSVData();

    // 2. Initialize Map and Chart Engines
    ForestMap.init();
    ForestCharts.init(this.activeCountry, this.activeYear);
    
    // 3. Load Profiles
    this.updateCountryProfile();
    
    // 4. Bind UI Listeners
    this.bindEvents();

    // 5. Draw Vector icons via Lucide CDN
    lucide.createIcons();

    // Register global reference for map callbacks
    window.App = this;
  },

  /**
   * Core UI Event Handlers
   */
  bindEvents: function() {
    // Year Slider Drag
    const slider = document.getElementById('time-slider');
    slider.addEventListener('input', (e) => {
      this.setYear(parseInt(e.target.value));
      if (this.isPlaying) this.pause();
    });

    // Timeline Tick Clicks
    const ticks = document.querySelectorAll('.tick');
    ticks.forEach(tick => {
      tick.addEventListener('click', (e) => {
        this.setYear(parseInt(e.target.dataset.year));
        if (this.isPlaying) this.pause();
      });
    });

    // Play/Pause Playback Toggle
    document.getElementById('play-pause-btn').addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });

    // Country Dropdown Selection
    document.getElementById('country-select').addEventListener('change', (e) => {
      this.setCountry(e.target.value);
    });
  },

  /**
   * Modifies the primary system year and updates dashboard elements
   */
  setYear: function(year) {
    if (year < 2000 || year > 2025) return;
    this.activeYear = year;
    
    // Sync slider input value
    document.getElementById('time-slider').value = year;

    // Update ticks CSS active state
    const ticks = document.querySelectorAll('.tick');
    ticks.forEach(tick => {
      if (parseInt(tick.dataset.year) === year) {
        tick.classList.add('active');
      } else {
        tick.classList.remove('active');
      }
    });

    // Update map layer cells (Green vs Red)
    ForestMap.updateGrid(year);

    // Update relational chart vertical scrub line
    ForestCharts.update(this.activeCountry, year);
  },

  /**
   * Modifies country focal zoom and recalculates statistics
   */
  setCountry: function(country) {
    this.activeCountry = country;
    
    // Zoom and pan the map view
    ForestMap.zoomToCountry(country);
    
    // Update profile text
    this.updateCountryProfile();
    
    // Redraw charts
    ForestCharts.update(country, this.activeYear);
  },

  /**
   * Core playback ticker logic
   */
  play: function() {
    this.isPlaying = true;
    const playBtn = document.getElementById('play-pause-btn');
    playBtn.innerHTML = '<i data-lucide="pause"></i>';
    lucide.createIcons();

    // Start interval loop (750ms per calendar year)
    this.playInterval = setInterval(() => {
      let nextYear = this.activeYear + 1;
      if (nextYear > 2025) {
        nextYear = 2000; // Loop back
      }
      this.setYear(nextYear);
    }, 750);
  },

  /**
   * Stop automated playbacks
   */
  pause: function() {
    this.isPlaying = false;
    const playBtn = document.getElementById('play-pause-btn');
    playBtn.innerHTML = '<i data-lucide="play"></i>';
    lucide.createIcons();
    clearInterval(this.playInterval);
  },

  /**
   * Updates country text description card
   */
  updateCountryProfile: function() {
    const country = DEFORESTATION_DATA.countries[this.activeCountry];
    document.getElementById('country-title').innerText = country.name;
    document.getElementById('country-desc').innerText = country.description;
  }
};

// Initialize Application once DOM loading settles
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
