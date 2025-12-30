<template>
  <!-- Hero Section -->
  <div class="restaurant-hero">
    <div class="hero-content">
      <h1 class="hero-title">Hvor vil du spise?</h1>
      <p class="hero-subtitle">
        Foodstalkers anbefalte spisesteder i {{ selectedCity }}
      </p>
    </div>
  </div>

  <!-- Filters and Controls -->
  <div class="restaurant-controls">
    <div class="controls-row">
      <!-- City Filter -->
      <div class="filter-group">
        <label class="filter-label">By</label>
        <select v-model="selectedCity" class="filter-select">
          <option v-for="city in uniqueCities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
      </div>

      <!-- Category Filter -->
      <div class="filter-group">
        <label class="filter-label">Kategori</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">Alle kategorier</option>
          <option value="Restaurant">🍴 Restaurant</option>
          <option value="Casual">🍟 Casual</option>
          <option value="Drinks">🥂 Drinks</option>
          <option value="Søtt">🍦 Dessert</option>
        </select>
      </div>

      <!-- Search -->
      <div class="filter-group search-group">
        <label class="filter-label">Søk</label>
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Søk etter restaurant..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="search-clear-btn"
            type="button"
            aria-label="Tøm søk"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Button Row -->
    <div class="filter-button-row">
      <button @click="toggleFilterVisibility" class="filter-trigger-btn">
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
        <span>Filtrer</span>
        <span v-if="selectedTags.length > 0" class="filter-badge">{{
          selectedTags.length
        }}</span>
      </button>
    </div>

    <!-- Filter Panel -->
    <div v-if="showFilterPanel" class="filter-panel">
      <div class="filter-box">
        <h3 class="filter-box__title">Filtrer restauranter</h3>

        <!-- Tags Filter -->
        <div v-if="availableTags.length > 0" class="filter-box__section">
          <div class="filter-box__checkboxes">
            <label
              v-for="tag in visibleTags"
              :key="tag"
              class="filter-box__checkbox"
            >
              <input
                type="checkbox"
                :value="tag"
                :checked="selectedTags.includes(tag)"
                @change="toggleTag(tag)"
                class="filter-box__checkbox-input"
              />
              <span class="filter-box__checkbox-label">
                {{ tag }}
              </span>
            </label>
          </div>

          <!-- Show More/Less Button -->
          <div v-if="hasMoreTags" class="filter-box__show-more">
            <button
              @click="toggleShowAllTags"
              class="filter-box__show-more-btn"
            >
              {{
                showAllTags ? "Vis færre" : `Vis alle (${availableTags.length})`
              }}
            </button>
          </div>
        </div>

        <!-- Clear All Button -->
        <div v-if="selectedTags.length > 0" class="filter-box__actions">
          <button @click="clearAllTags" class="filter-box__clear-btn">
            Fjern alle filtre
          </button>
        </div>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="view-controls">
      <div class="view-toggle">
        <button
          :class="['view-btn', { active: isActive }]"
          @click="toggleTheMap(true)"
        >
          <span class="view-icon">📋</span>
          Liste
        </button>
        <button
          :class="['view-btn', { active: !isActive }]"
          @click="toggleTheMap(false)"
        >
          <span class="view-icon">🗺️</span>
          Kart
        </button>
      </div>
    </div>
  </div>

  <!-- Results Count -->
  <div class="results-info">
    <p class="results-count">
      {{ filteredMarkers.length }} restaurant{{
        filteredMarkers.length !== 1 ? "er" : ""
      }}
      funnet
    </p>
  </div>

  <!-- Map View -->
  <div :class="{ hidden: isActive }">
    <div class="foodstalker-map">
      <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        :key="`map-${isActive}`"
      >
        <l-tile-layer
          :url="layers.CartoDB_Voyager.url"
          :attribution="layers.CartoDB_Voyager.attribution"
          :options="layers.CartoDB_Voyager.options"
          layer-type="base"
          name="OpenStreetMap"
        />
        <l-marker
          v-for="marker in filteredMarkers"
          :key="marker.id"
          :lat-lng="marker.position"
          @click="onMarkerClick(marker)"
        >
          <l-icon
            :icon-size="iconSize"
            :icon-anchor="iconAnchor"
            :icon-url="getMarkerIcon(marker.category)"
          />
        </l-marker>
      </l-map>
    </div>
    <FoodMapDescription
      v-if="selectedMarker"
      id="foodmap-card"
      :title="selectedMarker.title"
      :imageUrl="selectedMarker.imageUrl"
      :description="selectedMarker.description"
      :webPage="selectedMarker.webPage"
      :dateVisited="selectedMarker.dateVisited"
      @close="clearSelectedMarker"
    />
  </div>

  <!-- List View -->
  <div :class="['restaurant-list', { hidden: !isActive }]">
    <Loader v-if="isLoading" text="Laster restauranter..." />
    <div v-else-if="filteredMarkers.length === 0" class="no-results">
      <div class="no-results-content">
        <h3>Ingen restauranter funnet</h3>
        <p>Prøv å endre søkekriteriene dine</p>
      </div>
    </div>
    <div v-else class="restaurant-grid">
      <div
        v-for="restaurant in filteredMarkers"
        :key="restaurant.id"
        class="restaurant-card"
      >
        <div class="restaurant-card__image">
          <img :src="restaurant.imageUrl" :alt="restaurant.title" />
          <div class="restaurant-card__category">
            <span class="category-badge">{{
              getCategoryEmoji(restaurant.category)
            }}</span>
          </div>
        </div>
        <div class="restaurant-card__content">
          <h3 class="restaurant-card__title">{{ restaurant.title }}</h3>
          <div class="restaurant-card__description">
            <p
              :ref="(el) => setDescriptionRef(restaurant.id, el)"
              :class="[
                'description-text',
                { expanded: expandedCards[restaurant.id] },
              ]"
            >
              {{ restaurant.description }}
            </p>
            <button
              v-if="shouldShowReadMore(restaurant.id, restaurant.description)"
              @click="toggleDescription(restaurant.id)"
              class="read-more-btn"
            >
              {{ expandedCards[restaurant.id] ? "Les mindre" : "Les mer..." }}
            </button>
          </div>
          <div class="restaurant-card__meta">
            <span class="restaurant-card__date" v-if="restaurant.dateVisited">
              {{ formatDate(restaurant.dateVisited) }}
            </span>
            <a
              v-if="restaurant.webPage"
              :href="restaurant.webPage"
              target="_blank"
              rel="noopener noreferrer"
              class="restaurant-card__link"
              @click.stop
            >
              Besøk nettside
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
import FoodMapDescription from "./FoodMapDescription.vue";
import dataService from "../services/dataService.js";
import ToggleButton from "./ToggleButton.vue";
import Loader from "./Loader.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    FoodMapDescription,
    ToggleButton,
    Loader,
  },
  data() {
    // Base cities with known coordinates
    const baseCities = {
      oslo: [59.907657562789446, 10.772765099423395],
      stavanger: [58.96956842492558, 5.735700010074111],
      bergen: [60.3913, 5.3221],
      firenze: [43.7696, 11.2558],
      venezia: [45.4408, 12.3155],
      göteborg: [57.7072326, 11.9670171],
      gothenburg: [57.7072326, 11.9670171],
      stockholm: [59.3293, 18.0686],
      københavn: [55.6761, 12.5683],
      copenhagen: [55.6761, 12.5683],
      amsterdam: [52.3676, 4.9041],
      paris: [48.8566, 2.3522],
      london: [51.5074, -0.1278],
      berlin: [52.52, 13.405],
      madrid: [40.4168, -3.7038],
      roma: [41.9028, 12.4964],
      rome: [41.9028, 12.4964],
      milano: [45.4642, 9.19],
      milan: [45.4642, 9.19],
      barcelona: [41.3851, 2.1734],
      lisboa: [38.7223, -9.1393],
      lisbon: [38.7223, -9.1393],
      helsinki: [60.1695, 24.9354],
      tallinn: [59.437, 24.7536],
      lom: [61.837, 8.568],
      orkanger: [63.305, 9.85],
      mosjøen: [65.837, 13.191],
    };

    const icons = {
      CasualIcon: "https://foodstalker.b-cdn.net/CasualMarker.svg",
      RestaurantIcon: "https://foodstalker.b-cdn.net/restaurantMarker.svg",
      DrinksIcon: "https://foodstalker.b-cdn.net/DrinkMarker.svg",
      LogoMarker: "https://foodstalker.b-cdn.net/logoMarker.svg",
      SweetIcon: "https://foodstalker.b-cdn.net/SweetIcon.svg",
    };

    return {
      center: baseCities.oslo,
      zoom: 13,
      layers: {
        CartoDB_Voyager: {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          options: {
            maxZoom: 20,
          },
        },
      },
      markers: [],
      icons,
      iconSize: [50, 52],
      iconAnchor: [16, 37],
      selectedMarker: {
        title: "The Foodstalkers",
        imageUrl: "https://foodstalker.b-cdn.net/restauranter/IMG_8334.jpg",
        description: "Hjemmelaget er alltid best. Mest kjent for taco!",
        webPage: "https://www.foodstalker.no",
        dateVisited: "2023-01-01",
      },
      selectedCity: "Oslo",
      selectedCategory: "",
      searchQuery: "",
      selectedTags: [],
      cities: { ...baseCities }, // Dynamic cities object
      baseCities, // Keep reference to base cities
      isActive: true,
      expandedCards: {},
      showFilterPanel: false,
      showAllTags: false,
      maxVisibleTags: 6,
      selectedMarker: null,
      isLoading: true,
      descriptionRefs: {},
      truncatedDescriptions: {},
    };
  },
  methods: {
    toggleTheMap(isActive) {
      this.isActive = isActive;
      if (!isActive) {
        this.setTown(this.selectedCity.toLowerCase());
        // Force map to resize when switching to map view
        this.$nextTick(() => {
          if (this.$refs.map && this.$refs.map.leafletObject) {
            this.$refs.map.leafletObject.invalidateSize();
          }
        });
      }
    },

    setTown(city) {
      const cityKey = city.toLowerCase();

      // Check both the exact city name and the lowercase key
      let coordinates = this.cities[city] || this.cities[cityKey];

      if (coordinates) {
        this.center = coordinates;
        this.$nextTick(() => {
          this.zoom = 13;
        });
      } else {
        // Try to get coordinates for this city if we don't have them
        const newCoordinates = this.getCityCoordinates(city);
        if (newCoordinates) {
          // Store under both the original name and lowercase key for flexibility
          this.cities[city] = newCoordinates;
          this.cities[cityKey] = newCoordinates;
          this.center = newCoordinates;
          this.$nextTick(() => {
            this.zoom = 13;
          });
        }
      }
    },

    onMarkerClick(marker) {
      this.selectedMarker = {
        title: marker.title,
        imageUrl: marker.imageUrl,
        description: marker.description,
        webPage: marker.webPage,
        dateVisited: marker.dateVisited,
        category: marker.category,
      };
      this.center = marker.position;
    },

    clearSelectedMarker() {
      this.selectedMarker = null;
    },

    getCityCoordinates(cityName) {
      // For now, use a hardcoded list of common cities
      // This avoids CORS issues and provides reliable coordinates
      const cityMap = {
        göteborg: [57.7072326, 11.9670171],
        gothenburg: [57.7072326, 11.9670171],
        stockholm: [59.3293, 18.0686],
        københavn: [55.6761, 12.5683],
        copenhagen: [55.6761, 12.5683],
        amsterdam: [52.3676, 4.9041],
        paris: [48.8566, 2.3522],
        london: [51.5074, -0.1278],
        berlin: [52.52, 13.405],
        madrid: [40.4168, -3.7038],
        roma: [41.9028, 12.4964],
        rome: [41.9028, 12.4964],
        milano: [45.4642, 9.19],
        milan: [45.4642, 9.19],
        barcelona: [41.3851, 2.1734],
        lisboa: [38.7223, -9.1393],
        lisbon: [38.7223, -9.1393],
        wien: [48.2082, 16.3738],
        vienna: [48.2082, 16.3738],
        prag: [50.0755, 14.4378],
        prague: [50.0755, 14.4378],
        budapest: [47.4979, 19.0402],
        warszawa: [52.2297, 21.0122],
        warsaw: [52.2297, 21.0122],
        moskva: [55.7558, 37.6176],
        moscow: [55.7558, 37.6176],
        istanbul: [41.0082, 28.9784],
        athens: [37.9838, 23.7275],
        athen: [37.9838, 23.7275],
        helsinki: [60.1695, 24.9354],
        tallinn: [59.437, 24.7536],
        lom: [61.837, 8.568],
        orkanger: [63.305, 9.85],
        mosjøen: [65.837, 13.191],
        mosjoen: [65.837, 13.191],
      };

      return cityMap[cityName.toLowerCase()] || null;
    },

    updateCitiesFromData() {
      const uniqueCities = this.uniqueCities;

      for (const city of uniqueCities) {
        const cityKey = city.toLowerCase();

        // Skip if we already have coordinates for this city
        if (this.cities[cityKey]) {
          continue;
        }

        const coordinates = this.getCityCoordinates(city);

        if (coordinates) {
          // Add to cities object under both original name and lowercase key
          this.cities[city] = coordinates;
          this.cities[cityKey] = coordinates;
        }
      }
    },

    getMarkerIcon(category) {
      const categoryIcons = {
        Restaurant: this.icons.RestaurantIcon,
        Casual: this.icons.CasualIcon,
        Drinks: this.icons.DrinksIcon,
        Søtt: this.icons.SweetIcon,
      };
      return categoryIcons[category] || this.icons.LogoMarker;
    },

    scrollToDescription() {
      if (typeof document !== "undefined") {
        const targetElement = document.getElementById("foodmap-card");
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }
    },

    onRestaurantClick(restaurant) {
      this.selectedMarker = {
        title: restaurant.title,
        imageUrl: restaurant.imageUrl,
        description: restaurant.description,
        webPage: restaurant.webPage,
        dateVisited: restaurant.dateVisited,
      };
      this.scrollToDescription();
    },

    getCategoryEmoji(category) {
      const categoryEmojis = {
        Restaurant: "🍴",
        Casual: "🍟",
        Drinks: "🥂",
        Søtt: "🍦",
      };
      return categoryEmojis[category] || "🍽️";
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("nb-NO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    setDescriptionRef(restaurantId, el) {
      if (el) {
        this.descriptionRefs[restaurantId] = el;
        // Check truncation after element is mounted
        this.$nextTick(() => {
          this.checkTruncation(restaurantId);
        });
      }
    },

    checkTruncation(restaurantId) {
      const element = this.descriptionRefs[restaurantId];
      if (element && !this.expandedCards[restaurantId]) {
        // Check if content is truncated (scrollHeight > clientHeight indicates truncation)
        // Add a small buffer (2px) to account for rounding differences
        const isTruncated = element.scrollHeight > element.clientHeight + 2;
        this.truncatedDescriptions[restaurantId] = isTruncated;
      }
    },

    checkAllTruncations() {
      // Check truncation for all restaurant descriptions
      Object.keys(this.descriptionRefs).forEach((restaurantId) => {
        this.checkTruncation(restaurantId);
      });
    },

    shouldShowReadMore(restaurantId, description) {
      if (!description) return false;

      // Check if element is actually truncated by comparing scrollHeight to clientHeight
      const element = this.descriptionRefs[restaurantId];
      if (element && !this.expandedCards[restaurantId]) {
        // Check if content is truncated (scrollHeight > clientHeight indicates truncation)
        // Add a small buffer (2px) to account for rounding differences
        const isTruncated = element.scrollHeight > element.clientHeight + 2;
        if (isTruncated !== this.truncatedDescriptions[restaurantId]) {
          this.truncatedDescriptions[restaurantId] = isTruncated;
        }
        return isTruncated;
      }

      // Fallback: if element not available yet, use character count
      // With 3 lines at line-height 1.5, approximately 90-110 characters fit
      // Use 90 as a safe threshold to catch descriptions that would be truncated
      return description.length > 90;
    },

    toggleDescription(restaurantId) {
      this.expandedCards = {
        ...this.expandedCards,
        [restaurantId]: !this.expandedCards[restaurantId],
      };
    },

    loadRestaurants() {
      this.isLoading = true;
      this.markers = dataService.getRestaurants();
      const dataInfo = dataService.getDataSourceInfo();
      this.isLoading = false;
    },

    clearSearch() {
      this.searchQuery = "";
    },

    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },

    clearAllTags() {
      this.selectedTags = [];
    },

    toggleFilterVisibility() {
      this.showFilterPanel = !this.showFilterPanel;
    },

    toggleShowAllTags() {
      this.showAllTags = !this.showAllTags;
    },
  },
  mounted() {
    this.loadRestaurants();
    // Update cities with coordinates for any new cities found in the data
    this.updateCitiesFromData();
    // Check truncation for all descriptions after mount
    this.$nextTick(() => {
      this.checkAllTruncations();
    });
  },
  updated() {
    // Re-check truncations when data updates
    this.$nextTick(() => {
      this.checkAllTruncations();
    });
  },
  watch: {
    selectedCity(newCity) {
      if (newCity) {
        this.setTown(newCity.toLowerCase());
      }
    },
  },
  computed: {
    uniqueCities() {
      // Extract unique cities from markerdata with capitalized first letters
      const cities = new Set();
      for (const marker of this.markers) {
        const cityName =
          marker.city.charAt(0).toUpperCase() +
          marker.city.slice(1).toLowerCase();
        cities.add(cityName);
      }
      return Array.from(cities);
    },
    filteredMarkers() {
      let filtered = this.markers.filter((marker) => {
        const cityMatch =
          marker.city.toLowerCase() === this.selectedCity.toLowerCase();
        const categoryMatch =
          !this.selectedCategory || marker.category === this.selectedCategory;
        const searchMatch =
          !this.searchQuery ||
          marker.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          marker.description
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const tagMatch =
          this.selectedTags.length === 0 ||
          (marker.tags &&
            marker.tags.some((tag) => this.selectedTags.includes(tag)));

        return cityMatch && categoryMatch && searchMatch && tagMatch;
      });

      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    },
    toggleName() {
      return this.isActive ? "Vis som kart" : "Vis som liste";
    },

    availableTags() {
      const tags = new Set();

      // Get all unique tags from all markers
      this.markers.forEach((marker) => {
        if (marker.tags && marker.tags.length > 0) {
          marker.tags.forEach((tag) => {
            tags.add(tag);
          });
        }
      });

      const result = Array.from(tags).sort();
      return result;
    },

    visibleTags() {
      if (this.showAllTags) {
        return this.availableTags;
      }
      return this.availableTags.slice(0, this.maxVisibleTags);
    },

    hasMoreTags() {
      return this.availableTags.length > this.maxVisibleTags;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;
@use "../styles/mixins/" as *;

// Hero Section
.restaurant-hero {
  background: var(--fs-berries-100);
  color: var(--fs-berries-500);
  padding: map.get($spacing, "size-24") 0;
  margin-bottom: map.get($spacing, "size-16");
  border-radius: 1rem;

  .hero-content {
    text-align: center;
    padding: 0 map.get($spacing, "size-16");
  }

  .hero-title {
    @include get-text("fs-h4");
    margin-bottom: map.get($spacing, "size-8");
    font-weight: 700;
    line-height: 1.2;

    @include bp("mobile-down") {
      @include get-text("fs-h5");
      margin-bottom: map.get($spacing, "size-6");
      line-height: 1.3;
    }
  }

  .hero-subtitle {
    @include get-text("fs-h5");
    opacity: 0.9;
    font-weight: 400;
    line-height: 1.4;

    @include bp("mobile-down") {
      @include get-text("fs-body1");
      opacity: 0.95;
      line-height: 1.5;
    }
  }

  @include bp("mobile-down") {
    padding: map.get($spacing, "size-16") 0;
    margin-bottom: map.get($spacing, "size-12");
    border-radius: 0.75rem;
  }
}

// Controls Section
.restaurant-controls {
  background: var(--fs-white);
  border: 2px solid var(--fs-gray-200);
  border-radius: 1rem;
  padding: map.get($spacing, "size-16");
  margin-bottom: map.get($spacing, "size-16");
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  .controls-row {
    display: flex;
    flex-wrap: wrap;
    gap: map.get($spacing, "size-12");
    margin-bottom: map.get($spacing, "size-12");

    @include bp("tablet-up") {
      flex-wrap: nowrap;
    }
  }

  .filter-group {
    flex: 1;
    min-width: 200px;

    &.search-group {
      flex: 2;
    }
  }

  .filter-button-row {
    display: flex;
    justify-content: flex-start;
    margin-top: map.get($spacing, "size-8");
    margin-bottom: map.get($spacing, "size-8");
  }

  .filter-trigger-btn {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "size-4");
    padding: map.get($spacing, "size-8") map.get($spacing, "size-12");
    background: white;
    border: 2px solid var(--fs-berries-300);
    border-radius: 0.5rem;
    color: var(--fs-berries-600);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    @include get-text("fs-body2");

    &:hover {
      background: var(--fs-berries-50);
      border-color: var(--fs-berries-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &:focus {
      outline: 2px solid var(--fs-berries-500);
      outline-offset: 2px;
    }
  }

  .filter-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: var(--fs-berries-500);
    color: white;
    border-radius: 50%;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  // Filter Panel
  .filter-panel {
    margin-bottom: map.get($spacing, "size-16");
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Filter Box Styles (matching FilterBox.vue)
  .filter-box {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--fs-gray-200);
    min-width: 280px;
    max-width: 320px;
  }

  .filter-box__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--fs-gray-800);
    border-bottom: 2px solid var(--fs-berries-200);
    padding-bottom: 0.5rem;
  }

  .filter-box__section {
    margin-bottom: 1.5rem;
  }

  .filter-box__section:last-of-type {
    margin-bottom: 1rem;
  }

  .filter-box__section-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--fs-gray-700);
  }

  .filter-box__checkboxes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-box__checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 2px solid var(--fs-gray-200);
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--fs-gray-700);

    &:hover {
      border-color: var(--fs-berries-300);
      background-color: var(--fs-berries-50);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .filter-box__checkbox-input {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--fs-berries-500);
    cursor: pointer;
    flex-shrink: 0;
  }

  .filter-box__checkbox-input:checked + .filter-box__checkbox-label {
    color: var(--fs-berries-600);
    font-weight: 600;
  }

  .filter-box__checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .filter-box__actions {
    border-top: 1px solid var(--fs-gray-200);
    padding-top: 1rem;
    margin-top: 1rem;
  }

  .filter-box__clear-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--fs-gray-300);
    border-radius: 0.75rem;
    background: white;
    color: var(--fs-gray-600);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--fs-berries-400);
      background-color: var(--fs-berries-50);
      color: var(--fs-berries-600);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .filter-box__show-more {
    margin-top: 1rem;
    text-align: center;
  }

  .filter-box__show-more-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    background: var(--fs-gray-50);
    color: var(--fs-gray-600);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--fs-berries-400);
      background-color: var(--fs-berries-50);
      color: var(--fs-berries-600);
    }
  }

  // Mobile responsive design
  @include bp("mobile-down") {
    .filter-box {
      min-width: auto;
      max-width: none;
      margin-bottom: 1rem;
      padding: 1rem;
    }

    .filter-box__checkbox {
      padding: 0.625rem 0.875rem;
      font-size: 0.8rem;
    }
  }

  .filter-label {
    @include get-text("fs-body2");
    font-weight: 600;
    color: var(--fs-gray-700);
    margin-bottom: map.get($spacing, "size-4");
    display: block;
  }

  .filter-select,
  .search-input {
    @include get-text("fs-body1");
    width: 100%;
    padding: map.get($spacing, "size-8") map.get($spacing, "size-12");
    border: 2px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    background-color: var(--fs-white);
    color: var(--fs-black);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--fs-berries-400);
    }

    &:focus {
      outline: none;
      border-color: var(--fs-berries-500);
      box-shadow: 0 0 0 3px rgba(176, 76, 106, 0.1);
    }
  }

  .search-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    padding-right: map.get($spacing, "size-32");
  }

  .search-clear-btn {
    position: absolute;
    right: map.get($spacing, "size-8");
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--fs-gray-500);
    cursor: pointer;
    font-size: 1.2em;
    font-weight: bold;
    padding: map.get($spacing, "size-4");
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--fs-gray-100);
      color: var(--fs-gray-700);
    }

    &:focus {
      outline: 2px solid var(--fs-berries-500);
      outline-offset: 2px;
    }
  }

  .filter-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b04c6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right map.get($spacing, "size-8") center;
    background-size: 16px;
    padding-right: map.get($spacing, "size-32");
  }

  .view-controls {
    display: flex;
    justify-content: flex-end;
  }

  .view-toggle {
    display: flex;
    background: var(--fs-gray-100);
    border-radius: 0.5rem;
    padding: 4px;
  }

  .view-btn {
    @include get-text("fs-body2");
    display: flex;
    align-items: center;
    gap: map.get($spacing, "size-4");
    padding: map.get($spacing, "size-8") map.get($spacing, "size-12");
    border: none;
    background: transparent;
    color: var(--fs-gray-600);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;

    &:hover {
      background: var(--fs-white);
      color: var(--fs-gray-800);
    }

    &.active {
      background: var(--fs-white);
      color: var(--fs-berries-500);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .view-icon {
      font-size: 1.2em;
    }
  }
}

// Results Info
.results-info {
  margin-bottom: map.get($spacing, "size-16");

  .results-count {
    @include get-text("fs-body1");
    color: var(--fs-gray-600);
    font-weight: 500;
  }
}

// Map View
.foodstalker-map {
  height: 450px;
  width: 100%;
  border-radius: 1rem;
  border: 2px solid var(--fs-gray-300);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: white;
  margin-bottom: map.get($spacing, "size-16");

  @include bp("tablet-big-up") {
    height: 550px;
  }
}

.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  border-radius: 1rem;
}

// Restaurant List View
.restaurant-list {
  &.hidden {
    display: none;
  }
}

.no-results {
  text-align: center;
  padding: map.get($spacing, "size-24") map.get($spacing, "size-16");
  background: var(--fs-gray-100);
  border-radius: 1rem;
  border: 2px dashed var(--fs-gray-300);

  .no-results-content {
    h3 {
      @include get-text("fs-h4");
      color: var(--fs-gray-600);
      margin-bottom: map.get($spacing, "size-8");
    }

    p {
      @include get-text("fs-body1");
      color: var(--fs-gray-500);
    }
  }
}

.restaurant-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: map.get($spacing, "size-16");

  @include bp("tablet-up") {
    grid-template-columns: repeat(2, 1fr);
  }

  @include bp("desktop-up") {
    grid-template-columns: repeat(3, 1fr);
  }
}

.restaurant-card {
  background: var(--fs-white);
  border: 2px solid var(--fs-gray-200);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: var(--fs-berries-200);
  }

  &__image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  &__category {
    position: absolute;
    top: map.get($spacing, "size-8");
    right: map.get($spacing, "size-8");

    .category-badge {
      background: var(--fs-white);
      border: 2px solid var(--fs-gray-200);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &__content {
    padding: map.get($spacing, "size-16");
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  &__title {
    @include get-text("fs-h5");
    font-weight: 600;
    color: var(--fs-black);
    margin-bottom: map.get($spacing, "size-8");
    line-height: 1.3;
  }

  &__description {
    margin-bottom: map.get($spacing, "size-12");
    flex-grow: 1;

    .description-text {
      @include get-text("fs-body2");
      color: var(--fs-gray-600);
      line-height: 1.5;
      margin-bottom: map.get($spacing, "size-8");
      white-space: pre-line;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: all 0.3s ease;

      &.expanded {
        display: block;
        -webkit-line-clamp: unset;
        line-clamp: unset;
        -webkit-box-orient: unset;
        overflow: visible;
      }
    }

    .read-more-btn {
      @include get-text("fs-body2");
      background: none;
      border: none;
      color: var(--fs-berries-500);
      cursor: pointer;
      font-weight: 600;
      padding: map.get($spacing, "size-4") 0;
      transition: color 0.2s ease;

      &:hover {
        color: var(--fs-berries-600);
      }

      &:focus {
        outline: 2px solid var(--fs-berries-500);
        outline-offset: 2px;
        border-radius: 2px;
      }
    }
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: map.get($spacing, "size-8");
    margin-top: auto;
  }

  &__date {
    @include get-text("fs-body2");
    color: var(--fs-gray-500);
    font-weight: 500;
  }

  &__link {
    @include get-text("fs-body2");
    color: var(--fs-berries-500);
    text-decoration: none;
    font-weight: 600;
    padding: map.get($spacing, "size-4") map.get($spacing, "size-8");
    border: 2px solid var(--fs-berries-500);
    border-radius: 0.375rem;
    transition: all 0.2s ease;

    &:hover {
      background: var(--fs-berries-500);
      color: var(--fs-white);
    }
  }
}

.hidden {
  display: none;
}

.visible {
  display: block;
}
</style>
