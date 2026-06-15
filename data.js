/**
 * South American Deforestation Dashboard - Data Module
 * Dynamically loads and parses statistical tables from data.csv.
 * Sources: FAO FRA 2025, Global Forest Watch.
 */

const DEFORESTATION_DATA = {
  startYear: 2000,
  endYear: 2025,

  // Dynamically populated from data.csv
  countries: {},

  /**
   * Helper mapping for region descriptions
   */
  getCountryDescription: function(country) {
    const descriptions = {
      "South America": "Aggregated continental statistics showing the steady depletion of South America's forest cover, driven by cumulative regional land clearance.",
      "Brazil": "Hosts the majority of the Amazon basin. Data reflects peak clearing in 2004, enforcement drop off to 2012, a rise to 2021, and recent declines.",
      "Bolivia": "Characterized by rapid, late-timeline agricultural colonization and soy expansions in the Santa Cruz region.",
      "Paraguay": "Highly focused clearing in the semi-arid Gran Chaco dry forest biome for export beef cattle ranching.",
      "Peru": "Features dispersed micro-clearing patterns, small-scale farming, and illegal alluvial gold mining in Madre de Dios.",
      "Colombia": "Concentrated on the Amazonian borders. Deforestation spiked after the 2016 peace treaty due to cattle ranching colonization."
    };
    return descriptions[country] || "Environmental data statistics for regional forest cover changes.";
  },

  /**
   * Fetches data.csv and parses it into the countries data structure
   */
  loadCSVData: async function() {
    try {
      const response = await fetch('data.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');

      this.countries = {}; // Reset

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length < 4) continue;

        const country = parts[0].trim();
        const year = parseInt(parts[1]);
        const forestCover = parseFloat(parts[2]);
        const lossRate = parseFloat(parts[3]);

        if (!this.countries[country]) {
          this.countries[country] = {
            name: country === "South America" ? "South America (Continental)" : country,
            description: this.getCountryDescription(country),
            stats: {}
          };
        }

        // stats[year] = [ForestCover, LossRate]
        this.countries[country].stats[year] = [forestCover, lossRate];
      }
      console.log("data.csv parsed successfully:", this.countries);
    } catch (error) {
      console.error("Failed to load and parse data.csv:", error);
    }
  },

  /**
   * Generates coordinate grid simulating South American forest cover
   */
  generateGeospatialGrid: function() {
    const grid = [];
    const seed = 42; 
    function random(min, max) {
      let x = Math.sin(seed + grid.length) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    }

    const biomes = [
      {
        centerLat: -3.0,
        centerLng: -65.0,
        radiusLat: 7.0,
        radiusLng: 10.0,
        clearingChance: 0.12,
        startYearRange: [2012, 2025]
      },
      {
        centerLat: -10.5,
        centerLng: -58.0,
        radiusLat: 3.5,
        radiusLng: 8.0,
        clearingChance: 0.88, 
        startYearRange: [2000, 2012]
      },
      {
        centerLat: -5.5,
        centerLng: -50.0,
        radiusLat: 4.5,
        radiusLng: 4.5,
        clearingChance: 0.82,
        startYearRange: [2004, 2020]
      },
      {
        centerLat: -21.0,
        centerLng: -61.0,
        radiusLat: 5.0,
        radiusLng: 4.0,
        clearingChance: 0.85,
        startYearRange: [2005, 2024]
      },
      {
        centerLat: -16.5,
        centerLng: -63.0,
        radiusLat: 2.5,
        radiusLng: 2.5,
        clearingChance: 0.80,
        startYearRange: [2010, 2025]
      },
      {
        centerLat: -4.0,
        centerLng: -75.0,
        radiusLat: 6.0,
        radiusLng: 2.5,
        clearingChance: 0.55, 
        startYearRange: [2005, 2025]
      },
      {
        centerLat: -21.0,
        centerLng: -44.0,
        radiusLat: 5.0,
        radiusLng: 3.0,
        clearingChance: 0.70,
        startYearRange: [2000, 2015]
      }
    ];

    biomes.forEach(biome => {
      const pointsCount = Math.floor(biome.radiusLat * biome.radiusLng * 35);
      
      for (let i = 0; i < pointsCount; i++) {
        const theta = random(0, 2 * Math.PI);
        const r = Math.sqrt(random(0, 1));
        
        const lat = biome.centerLat + r * biome.radiusLat * Math.sin(theta);
        const lng = biome.centerLng + r * biome.radiusLng * Math.cos(theta);

        if (lng < -81.0 || (lat > 5.0 && lng < -77.0) || (lat < -5.0 && lng < -81.0 && lat > -15.0)) {
          continue; 
        }

        let clearedYear = null;
        if (random(0, 1) < biome.clearingChance) {
          const yearFrac = random(0, 1);
          const startYear = biome.startYearRange[0];
          const endYear = biome.startYearRange[1];
          clearedYear = Math.floor(startYear + yearFrac * (endYear - startYear + 1));
          
          if (clearedYear > 2025) clearedYear = null;
        }

        grid.push({
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          clearedYear: clearedYear
        });
      }
    });

    return grid;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFORESTATION_DATA;
}
