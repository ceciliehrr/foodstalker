<template>
  <div class="map-header">
    <h1>Foodstalker</h1>
    <h2>i {{ selectedCity }}</h2>
    <div class="map-emojis">
      <p>🍴 = Restaurant</p>
      <p>🍟 = Casual/Lunsj/Brunch</p>
      <p>🥂 = Drinks</p>
      <p>🍦 = Sweets</p>
    </div>

    <hr />
    <h3>Vis oppskrifter fra:</h3>
    <div class="map-cities">
      <select
        v-model="selectedCity"
        @change="setTown(selectedCity.toLowerCase())"
        class="city-select"
      >
        <option v-for="city in uniqueCities" :key="city" :value="city">
          {{ city }}
        </option>
      </select>
    </div>
  </div>

  <p>{{ toggleName }}</p>
  <ToggleButton @setIsActive="toggleTheMap" />

  <!-- Map View -->
  <div :class="{ hidden: isActive }">
    <div class="foodstalker-map">
      <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
      >
        <l-tile-layer
          :url="layers.CartoDB_Voyager.url"
          :attribution="layers.CartoDB_Voyager.attribution"
          :options="layers.CartoDB_Voyager.options"
          layer-type="base"
          name="OpenStreetMap"
        />
        <l-marker
          v-for="marker in markers"
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
      id="foodmap-card"
      :title="selectedMarker.title"
      :imageUrl="selectedMarker.imageUrl"
      :description="selectedMarker.description"
      :webPage="selectedMarker.webPage"
      :dateVisited="selectedMarker.dateVisited"
    />
  </div>

  <!-- List View -->
  <div :class="{ hidden: !isActive }">
    <div v-for="restaurant in filteredMarkers" :key="restaurant.id">
      <FoodMapDescription
        :title="restaurant.title"
        :description="restaurant.description"
        :imageUrl="restaurant.imageUrl"
        :webPage="restaurant.webPage"
        :dateVisited="restaurant.dateVisited"
      />
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
import FoodMapDescription from "./FoodMapDescription.vue";
import dataService from "../services/dataService.js";
import ToggleButton from "./ToggleButton.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    FoodMapDescription,
    ToggleButton,
  },
  data() {
    const cities = {
      oslo: [59.907657562789446, 10.772765099423395],
      stavanger: [58.96956842492558, 5.735700010074111],
      bergen: [60.3913, 5.3221],
      firenze: [43.7696, 11.2558],
      venezia: [45.4408, 12.3155],
    };

    const icons = {
      CasualIcon: "https://foodstalker.b-cdn.net/CasualMarker.svg",
      RestaurantIcon: "https://foodstalker.b-cdn.net/restaurantMarker.svg",
      DrinksIcon: "https://foodstalker.b-cdn.net/DrinkMarker.svg",
      LogoMarker: "https://foodstalker.b-cdn.net/logoMarker.svg",
      SweetIcon: "https://foodstalker.b-cdn.net/SweetIcon.svg",
    };

    return {
      center: cities.oslo,
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
      cities,
      isActive: false,
    };
  },
  methods: {
    toggleTheMap(isActive) {
      this.isActive = isActive;
      if (!isActive) {
        this.setTown(this.selectedCity.toLowerCase());
      }
    },

    setTown(city) {
      if (this.cities[city]) {
        this.center = this.cities[city];
        this.$nextTick(() => {
          this.zoom = 13;
        });
      }
    },

    onMarkerClick(marker) {
      this.selectedMarker = {
        title: marker.title,
        imageUrl: marker.imageUrl,
        description: marker.description,
        webPage: marker.webPage,
        dateVisited: marker.dateVisited,
      };
      this.center = marker.position;
      this.scrollToDescription();
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
      const targetElement = document.getElementById("foodmap-card");
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    },

    loadRestaurants() {
      try {
        this.markers = dataService.getRestaurants();
        const dataInfo = dataService.getDataSourceInfo();
        console.log(
          `Loaded ${this.markers.length} restaurants from ${dataInfo.source} (${dataInfo.lastUpdated})`
        );
      } catch (error) {
        console.error("Failed to load restaurants:", error);
        // Fallback to empty array or show error message
        this.markers = [];
      }
    },
  },
  mounted() {
    this.loadRestaurants();
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
      const filtered = this.markers.filter(
        (marker) => marker.city === this.selectedCity
      );
      return filtered.sort((a, b) => a.city.localeCompare(b.city));
    },
    toggleName() {
      return this.isActive ? "Vis som kart" : "Vis som liste";
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;
@use "../styles/mixins/" as *;

.map-header {
  margin-bottom: map.get($spacing, "size-16");

  h1 {
    @include get-text("fs-h3");
    margin-bottom: map.get($spacing, "size-8");
  }

  h2 {
    @include get-text("fs-h4");
    margin-bottom: map.get($spacing, "size-8");
    color: var(--fs-berries-500);
  }

  h3 {
    @include get-text("fs-h6");
    margin-top: map.get($spacing, "size-12");
    font-weight: 500;
    margin-bottom: map.get($spacing, "size-8");
  }
}

.map-emojis {
  margin-bottom: map.get($spacing, "size-16");

  p {
    @include get-text("fs-body2");
    margin-bottom: map.get($spacing, "size-4");
    color: var(--fs-gray-600);
  }
}

.map-cities {
  margin-bottom: map.get($spacing, "size-16");
  margin-top: map.get($spacing, "size-16");
}

.city-select {
  @include get-text("fs-body1");
  width: 100%;
  max-width: 200px;
  padding: map.get($spacing, "size-8") map.get($spacing, "size-12");
  border: 2px solid var(--fs-gray-300);
  border-radius: 0.5rem;
  background-color: var(--fs-white);
  color: var(--fs-black);
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b04c6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right map.get($spacing, "size-8") center;
  background-size: 16px;
  padding-right: map.get($spacing, "size-32");

  &:hover {
    border-color: var(--fs-berries-400);
  }

  &:focus {
    outline: none;
    border-color: var(--fs-berries-500);
    box-shadow: 0 0 0 3px rgba(176, 76, 106, 0.1);
  }

  option {
    padding: map.get($spacing, "size-8");
    color: var(--fs-black);
  }
}

.foodstalker-map {
  height: 450px;
  width: 100%;
  border-radius: 0.75rem;
  border: 2px solid var(--fs-gray-300);
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: white;

  @include bp("tablet-big-up") {
    height: 550px;
  }
}

.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0.75rem;
}

.hidden {
  display: none;
}

.visible {
  display: block;
}
</style>
