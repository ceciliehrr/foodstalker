<template>
  <div class="map-header">
    <h1>Foodstalker</h1>
    <h2>i {{ selectedCity }}</h2>
    <div class="map-emojis">
      <p>🍴 = Restaurant</p>
      <p>🍟 = Casual/Lunsj/Brunch</p>
      <p>🥂 = Drinks</p>
    </div>

    <hr />
    <!-- Loop through cities and create radio buttons -->
    <div class="map-cities">
      <label v-for="city in uniqueCities" :key="city">
        <input
          type="radio"
          v-model="selectedCity"
          :value="city"
          @change="setTown(selectedCity)"
        />
        {{ city }}
      </label>
    </div>
  </div>

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
        :marker="layers.CartoDB_Voyager.marker"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker
        v-for="marker in markers"
        :key="marker.id"
        :lat-lng.sync="marker.position"
        @click="onMarkerClick(marker)"
      >
        <l-icon
          :icon-size="iconSize"
          :icon-anchor="iconAnchor"
          :icon-url="categorizedMarkers(marker.category)"
        />
      </l-marker>
    </l-map>
  </div>
  <FoodMapDescription
    id="foodmap-card"
    :title="title"
    :imageUrl="imageUrl"
    :description="description"
    :webPage="webPage"
    :dateVisited="dateVisited"
  ></FoodMapDescription>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
import FoodMapDescription from "../components/FoodMapDescription.vue";
import foodmapMarkers from "../data/food_map.json";
export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    FoodMapDescription,
  },
  data() {
    // Cities
    const oslo = [59.907657562789446, 10.772765099423395];
    const stockholm = [59.3293, 18.0686];
    const stavanger = [58.96956842492558, 5.735700010074111];

    // Marker icons
    const CasualIcon = "https://foodstalker.b-cdn.net/CasualMarker.svg";
    const RestaurantIcon = "https://foodstalker.b-cdn.net/restaurantMarker.svg";
    const DrinksIcon = "https://foodstalker.b-cdn.net/DrinkMarker.svg";
    const LogoMarker = "https://foodstalker.b-cdn.net/logoMarker.svg";
    // Default zoom
    const defaultZoom = 13;

    return {
      center: oslo,
      zoom: defaultZoom,
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
      markers: foodmapMarkers,
      drinkIconUrl: DrinksIcon,
      restaurantIconUrl: RestaurantIcon,
      casualIconUrl: CasualIcon,
      logoMarkerUrl: LogoMarker,
      iconSize: [50, 52],
      iconAnchor: [16, 37],
      title: "The Foodstalkers",
      imageUrl: "https://foodstalker.b-cdn.net/restauranter/IMG_8334.jpg",
      description: "Hjemmelaget er alltid best. Mest kjent for taco!",
      webPage: "https://www.foodstalker.no",
      dateVisited: "2023-01-01",
      selectedCity: "Oslo", // Initial city
      defaultCity: "Oslo", // Default city when no city is selected
      oslo: oslo,
      stockholm: stockholm,
      stavanger: stavanger,
    };
  },
  methods: {
    setTown(city) {
      if (city === "Oslo") {
        this.center = this.oslo;
        this.$nextTick(() => {
          this.zoom = this.defaultZoom;
        });
      } else if (city === "Stockholm") {
        this.center = this.stockholm;
        this.$nextTick(() => {
          this.zoom = this.defaultZoom;
        });
      } else if (city === "Stavanger") {
        this.center = this.stavanger;
        this.$nextTick(() => {
          this.zoom = this.defaultZoom;
        });
      }
    },

    onMarkerClick(marker) {
      this.title = marker.title;
      this.imageUrl = marker.imageUrl;
      this.description = marker.description;
      this.webPage = marker.webPage;
      this.dateVisited = marker.dateVisited;
      this.center = marker.position;
      this.scrollToDescription();
    },
    categorizedMarkers(category) {
      if (category === "Restaurant") {
        return this.restaurantIconUrl;
      } else if (category === "Casual") {
        return this.casualIconUrl;
      } else if (category === "Drinks") {
        return this.drinkIconUrl;
      }
      return this.logoMarkerUrl;
    },
    scrollToDescription() {
      // Find the target element by its id
      const targetElement = document.getElementById("foodmap-card");

      if (targetElement) {
        // Calculate the offset based on the height you want
        //const offset = 10; // Change this value to your desired offset

        // Scroll to the target element with the offset
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start", // You can also use 'end' if you want to scroll to the bottom of the element
          inline: "nearest",
          // offsetTop: offset, // Add the offset here
        });
      }
    },
  },
  computed: {
    uniqueCities() {
      // Extract unique cities from markerdata with capitalized first letters
      const cities = new Set();
      for (const marker of foodmapMarkers) {
        const cityName =
          marker.city.charAt(0).toUpperCase() +
          marker.city.slice(1).toLowerCase();
        cities.add(cityName);
      }
      return Array.from(cities);
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
  margin-bottom: 1rem;
  h2 {
    margin-bottom: 0.5rem;
  }
}
.map-emojis {
  margin-bottom: 1rem;
}
.map-cities {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  margin-top: 1rem;
  label {
    margin-bottom: 1rem;
  }
}
.foodstalker-map {
  height: 450px;
  width: 100%;

  @include bp("tablet-big-up") {
    height: 550px;
  }
}
.leaflet-container {
  border-radius: 0.75rem;
  border: 2px solid var(--fs-gray-300);
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  background-color: white;
}

label:hover {
  cursor: pointer;
}
input[type="radio"] {
  appearance: none;
}

input[type="radio"]:after {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  position: relative;
  background-color: var(--fs-pink-100);
  content: "";
  display: inline-block;
  border: 1px solid var(--fs-pink-500);
}

input[type="radio"]:checked:after {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  position: relative;
  background-color: var(--fs-pink-500);
  content: "";
  display: inline-block;
  border: 1px solid var(--fs-pink-500);
}
</style>
