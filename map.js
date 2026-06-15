/**
 * South American Deforestation Dashboard - Map Module
 * Simplified Map configuration displaying binary forest grids (Green vs Red).
 */

const ForestMap = {
  mainMap: null,
  mainGridMarkers: [],

  // Center coordinates of South America (Amazon Basin focus)
  defaultCenter: [-8.0, -60.0],
  defaultZoom: 4,

  // Map Tile configuration (CartoDB Dark Matter)
  tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',

  /**
   * Initializes Leaflet Map instance
   */
  init: function() {
    this.mainMap = L.map('map-container', {
      zoomControl: true,
      maxBounds: [[15.0, -95.0], [-40.0, -30.0]],
      minZoom: 3,
      maxZoom: 9
    }).setView(this.defaultCenter, this.defaultZoom);

    L.tileLayer(this.tileUrl, {
      attribution: this.tileAttribution,
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.mainMap);

    this.setupGridLayer();
  },

  /**
   * Generates raster grids using Leaflet Canvas Renderer
   */
  setupGridLayer: function() {
    const rawGridData = DEFORESTATION_DATA.generateGeospatialGrid();
    const mainRenderer = L.canvas();

    rawGridData.forEach(cell => {
      const marker = L.circleMarker([cell.lat, cell.lng], {
        renderer: mainRenderer,
        radius: 3.5,
        stroke: false,
        fillOpacity: 0.75
      }).addTo(this.mainMap);
      
      this.mainGridMarkers.push({
        marker: marker,
        data: cell
      });
    });

    // Initial render for year 2000
    this.updateGrid(2000);
  },

  /**
   * Binary forest styling: Green if intact, Red if cleared
   */
  getGridCellStyles: function(cellData, targetYear) {
    const clearedYear = cellData.clearedYear;

    if (clearedYear === null || clearedYear > targetYear) {
      // Forest is Green
      return { color: '#10b981', opacity: 0.75, radius: 3.5 };
    } else {
      // Deforested is Red
      return { color: '#ef4444', opacity: 0.75, radius: 3.5 };
    }
  },

  /**
   * Updates all grid layers for the designated year
   */
  updateGrid: function(targetYear) {
    this.mainGridMarkers.forEach(item => {
      const styles = this.getGridCellStyles(item.data, targetYear);
      item.marker.setStyle({
        fillColor: styles.color,
        fillOpacity: styles.opacity,
        radius: styles.radius
      });
    });
  },

  /**
   * Adjusts zoom settings to fit a specific country
   */
  zoomToCountry: function(countryName) {
    const countryCoords = {
      "South America": { center: [-8.0, -60.0], zoom: 4 },
      "Brazil": { center: [-11.0, -53.0], zoom: 5 },
      "Bolivia": { center: [-16.5, -63.5], zoom: 6 },
      "Paraguay": { center: [-22.5, -58.5], zoom: 6 },
      "Peru": { center: [-9.0, -74.0], zoom: 6 },
      "Colombia": { center: [2.5, -73.0], zoom: 6 }
    };

    const target = countryCoords[countryName] || countryCoords["South America"];
    this.mainMap.setView(target.center, target.zoom, { animate: true, duration: 1.2 });
  }
};
