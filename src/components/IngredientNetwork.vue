<template>
  <div class="ingredient-network">
    <div class="controls">
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Søk etter en ingrediens (f.eks. 'tomat', 'basilikum')..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
          ✕
        </button>
      </div>

      <div class="fs-btn-group fs-btn-group--centered">
        <button
          @click="showCreativePairings = !showCreativePairings"
          :class="[
            'fs-btn',
            showCreativePairings ? 'fs-btn--primary' : 'fs-btn--outline',
          ]"
        >
          💡 {{ showCreativePairings ? "Skjul" : "Vis" }} kreative kombinasjoner
        </button>
        <button @click="resetView" class="fs-btn fs-btn--secondary">
          🔄 Reset visning
        </button>
      </div>
    </div>

    <!-- Creative pairings panel -->
    <div v-if="showCreativePairings" class="creative-pairings">
      <h3>💡 Oppdag nye kombinasjoner</h3>
      <p class="description">
        Disse ingrediensene brukes sjelden sammen, men deler mange felles
        partnere. Kanskje det er på tide å eksperimentere?
      </p>
      <div class="pairings-grid">
        <div
          v-for="(pairing, index) in creativePairings.slice(0, 12)"
          :key="index"
          class="pairing-card"
          @click="highlightPairing(pairing)"
        >
          <div class="pairing-ingredients">
            <span class="ingredient">{{ pairing.ingredient1 }}</span>
            <span class="plus">+</span>
            <span class="ingredient">{{ pairing.ingredient2 }}</span>
          </div>
          <div class="common-neighbors">
            <small
              >Deler:
              {{ pairing.commonNeighbors.slice(0, 3).join(", ") }}</small
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Selected ingredient info -->
    <div v-if="selectedIngredient" class="ingredient-info">
      <div class="info-header">
        <h3>{{ selectedIngredient }}</h3>
        <button @click="selectedIngredient = null" class="close-btn">✕</button>
      </div>
      <div class="info-content">
        <p>
          <strong>{{ getIngredientOccurrences(selectedIngredient) }}</strong>
          oppskrifter
          <strong>{{ getIngredientConnections(selectedIngredient) }}</strong>
          forbindelser
        </p>
        <div class="recipes-list">
          <h4>Oppskrifter med {{ selectedIngredient }}:</h4>
          <ul>
            <li
              v-for="recipe in getIngredientRecipes(selectedIngredient).slice(
                0,
                10
              )"
              :key="recipe.id"
            >
              {{ recipe.title }}
            </li>
          </ul>
          <p
            v-if="getIngredientRecipes(selectedIngredient).length > 10"
            class="more"
          >
            ... og
            {{ getIngredientRecipes(selectedIngredient).length - 10 }} flere
          </p>
        </div>
      </div>
    </div>

    <!-- Network visualization -->
    <div ref="networkContainer" class="network-container"></div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ metadata.networkIngredients }}</div>
        <div class="stat-label">Ingredienser</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ metadata.networkEdges }}</div>
        <div class="stat-label">Forbindelser</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ metadata.totalRecipes }}</div>
        <div class="stat-label">Oppskrifter</div>
      </div>
    </div>

    <!-- Most connected ingredients -->
    <h2 style="margin: 2rem 0 1rem 0; color: var(--fs-berries-600)">
      🏆 Mest allsidige ingredienser
    </h2>
    <div class="top-ingredients">
      <div class="ingredients-grid">
        <div
          v-for="(item, index) in mostConnected.slice(0, 20)"
          :key="item.ingredient"
          class="ingredient-card"
          @click="focusOnIngredient(item.ingredient)"
        >
          <div class="rank">{{ index + 1 }}</div>
          <div class="ingredient-name">{{ item.ingredient }}</div>
          <div class="ingredient-stats">
            <span>{{ item.connections }} forbindelser</span>
            <span>{{ item.occurrences }} oppskrifter</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Network, DataSet } from "vis-network/standalone";
import networkData from "../data/ingredient_network.json";

const networkContainer = ref(null);
const searchQuery = ref("");
const selectedIngredient = ref(null);
const showCreativePairings = ref(false);

let network = null;
let allNodes = null;
let allEdges = null;

const {
  nodes,
  edges,
  metadata,
  mostConnected,
  creativePairings,
  ingredientRecipes,
} = networkData;

onMounted(() => {
  initNetwork();
});

onBeforeUnmount(() => {
  if (network) {
    network.destroy();
  }
});

function initNetwork() {
  // Prepare data for vis-network
  const nodesDataset = nodes.map((node) => ({
    ...node,
    color: {
      background: "#b04c6a", // fs-berries-500
      border: "#1f1209", // fs-black
      highlight: {
        background: "#9e3d5a", // fs-berries-600
        border: "#1f1209",
      },
    },
    font: {
      size: 14,
      color: "#1f1209", // fs-black
      face: "Fira Code, monospace",
    },
    borderWidth: 2,
    borderWidthSelected: 4,
  }));

  const edgesDataset = edges.map((edge) => ({
    ...edge,
    color: {
      color: "#cbd5e1", // fs-gray-300
      highlight: "#b04c6a", // fs-berries-500
    },
    width: Math.min(edge.value / 2, 5),
    smooth: {
      type: "continuous",
    },
  }));

  allNodes = new DataSet(nodesDataset);
  allEdges = new DataSet(edgesDataset);

  const data = {
    nodes: allNodes,
    edges: allEdges,
  };

  const options = {
    nodes: {
      shape: "dot",
      scaling: {
        min: 10,
        max: 40,
        label: {
          min: 10,
          max: 20,
        },
      },
    },
    edges: {
      smooth: {
        type: "continuous",
      },
      scaling: {
        min: 1,
        max: 5,
      },
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -8000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0.1,
      },
      maxVelocity: 50,
      minVelocity: 0.1,
      solver: "barnesHut",
      stabilization: {
        enabled: true,
        iterations: 1000,
        updateInterval: 25,
      },
    },
    interaction: {
      hover: true,
      tooltipDelay: 100,
      hideEdgesOnDrag: true,
      hideEdgesOnZoom: true,
      navigationButtons: false,
      keyboard: false,
    },
  };

  network = new Network(networkContainer.value, data, options);

  // Event listeners
  network.on("click", (params) => {
    if (params.nodes.length > 0) {
      selectedIngredient.value = params.nodes[0];
      highlightIngredient(params.nodes[0]);
    } else {
      selectedIngredient.value = null;
      resetHighlight();
    }
  });

  network.on("hoverNode", (params) => {
    networkContainer.value.style.cursor = "pointer";
  });

  network.on("blurNode", (params) => {
    networkContainer.value.style.cursor = "default";
  });

  // Stop physics after stabilization for better performance
  network.on("stabilizationIterationsDone", () => {
    network.setOptions({ physics: false });
  });
}

function handleSearch() {
  if (!searchQuery.value) {
    resetHighlight();
    return;
  }

  const query = searchQuery.value.toLowerCase();
  const matchingNodes = nodes.filter((node) =>
    node.id.toLowerCase().includes(query)
  );

  if (matchingNodes.length > 0) {
    const nodeId = matchingNodes[0].id;
    selectedIngredient.value = nodeId;
    focusOnIngredient(nodeId);
  }
}

function clearSearch() {
  searchQuery.value = "";
  selectedIngredient.value = null;
  resetHighlight();
}

function highlightIngredient(ingredientId) {
  if (!network) return;

  // Use Set for faster lookups
  const connectedNodesSet = new Set(network.getConnectedNodes(ingredientId));
  const connectedEdgesSet = new Set(network.getConnectedEdges(ingredientId));

  // Batch update all nodes at once for better performance
  const nodeUpdates = [];
  allNodes.forEach((node) => {
    if (node.id === ingredientId) {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#9e3d5a", // fs-berries-600
          border: "#1f1209", // fs-black
        },
        font: { size: 18, color: "#1f1209" },
      });
    } else if (connectedNodesSet.has(node.id)) {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#fbd3c4", // fs-berries-100
          border: "#b04c6a", // fs-berries-500
        },
      });
    } else {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#f3f4f6", // fs-gray-100
          border: "#cbd5e1", // fs-gray-300
        },
        font: { color: "#9ca3af" }, // fs-gray-400
      });
    }
  });
  allNodes.update(nodeUpdates);

  // Batch update all edges at once for better performance
  const edgeUpdates = [];
  allEdges.forEach((edge) => {
    if (connectedEdgesSet.has(edge.id)) {
      edgeUpdates.push({
        id: edge.id,
        color: { color: "#b04c6a" }, // fs-berries-500
      });
    } else {
      edgeUpdates.push({
        id: edge.id,
        color: { color: "#e5e7eb" }, // fs-gray-200
      });
    }
  });
  allEdges.update(edgeUpdates);
}

function resetHighlight() {
  if (!network) return;

  // Batch update all nodes at once for better performance
  const nodeUpdates = [];
  allNodes.forEach((node) => {
    nodeUpdates.push({
      id: node.id,
      color: {
        background: "#b04c6a", // fs-berries-500
        border: "#1f1209", // fs-black
      },
      font: { size: 14, color: "#1f1209" },
    });
  });
  allNodes.update(nodeUpdates);

  // Batch update all edges at once for better performance
  const edgeUpdates = [];
  allEdges.forEach((edge) => {
    edgeUpdates.push({
      id: edge.id,
      color: { color: "#cbd5e1" }, // fs-gray-300
    });
  });
  allEdges.update(edgeUpdates);
}

function focusOnIngredient(ingredientId) {
  if (!network) return;

  selectedIngredient.value = ingredientId;
  network.focus(ingredientId, {
    scale: 1.5,
    animation: {
      duration: 1000,
      easingFunction: "easeInOutQuad",
    },
  });
  highlightIngredient(ingredientId);
}

function resetView() {
  if (!network) return;

  network.fit({
    animation: {
      duration: 1000,
      easingFunction: "easeInOutQuad",
    },
  });
  resetHighlight();
  selectedIngredient.value = null;
  searchQuery.value = "";
}

function highlightPairing(pairing) {
  if (!network) return;

  const node1 = pairing.ingredient1;
  const node2 = pairing.ingredient2;
  const commonNeighbors = pairing.commonNeighbors;

  // Batch update all nodes at once for better performance
  const nodeUpdates = [];
  allNodes.forEach((node) => {
    if (node.id === node1 || node.id === node2) {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#9e3d5a", // fs-berries-600
          border: "#1f1209", // fs-black
        },
        font: { size: 18, color: "#1f1209" },
      });
    } else if (commonNeighbors.includes(node.id)) {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#bed5ae", // fs-lime
          border: "#40595a", // fs-brokkoli
        },
        font: { color: "#1f1209" },
      });
    } else {
      nodeUpdates.push({
        id: node.id,
        color: {
          background: "#f3f4f6", // fs-gray-100
          border: "#cbd5e1", // fs-gray-300
        },
        font: { color: "#9ca3af" }, // fs-gray-400
      });
    }
  });
  allNodes.update(nodeUpdates);

  // Fit the view to show all relevant nodes
  network.fit({
    nodes: [node1, node2, ...commonNeighbors],
    animation: {
      duration: 1000,
      easingFunction: "easeInOutQuad",
    },
  });
}

function getIngredientOccurrences(ingredient) {
  const node = nodes.find((n) => n.id === ingredient);
  return node ? node.value : 0;
}

function getIngredientConnections(ingredient) {
  return edges.filter((e) => e.from === ingredient || e.to === ingredient)
    .length;
}

function getIngredientRecipes(ingredient) {
  return ingredientRecipes[ingredient] || [];
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;

.ingredient-network {
  margin: 0 auto;
  padding: 0;
}

.controls {
  margin-bottom: 2rem;
}

.search-section {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  font-size: 1rem;
  font-family: "Fira Code", monospace;
  border: 2px solid var(--fs-gray-300);
  border-radius: 0.5rem;
  transition: all 0.2s;
  background: var(--fs-white);

  &:focus {
    outline: none;
    border-color: var(--fs-berries-500);
    box-shadow: 0 0 0 3px rgba(176, 76, 106, 0.1);
  }
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--fs-gray-400);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: var(--fs-berries-500);
  }
}

.creative-pairings {
  background: var(--fs-berries-50);
  padding: 2rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 2px solid var(--fs-berries-200);

  h3 {
    margin-top: 0;
    color: var(--fs-berries-600);
    font-size: 1.5rem;
  }

  .description {
    color: var(--fs-gray-600);
    margin-bottom: 1.5rem;
  }
}

.pairings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.pairing-card {
  background: var(--fs-white);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid var(--fs-berries-200);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(176, 76, 106, 0.2);
    border-color: var(--fs-berries-500);
  }
}

.pairing-ingredients {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--fs-berries-600);

  .plus {
    color: var(--fs-gray-400);
    font-weight: normal;
  }

  .ingredient {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    background: var(--fs-berries-50);
    border-radius: 0.25rem;
  }
}

.common-neighbors {
  color: var(--fs-gray-600);
  font-size: 0.85rem;
}

.ingredient-info {
  background: var(--fs-white);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 2px solid var(--fs-berries-500);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: var(--fs-berries-600);
    font-size: 1.5rem;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--fs-gray-400);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: var(--fs-berries-500);
  }
}

.info-content {
  p {
    margin: 0.5rem 0;
    color: var(--fs-gray-600);
  }
}

.recipes-list {
  margin-top: 1rem;

  h4 {
    color: var(--fs-berries-600);
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 0.5rem;
    border-bottom: 1px solid var(--fs-gray-200);
  }

  .more {
    color: var(--fs-gray-500);
    font-style: italic;
    margin-top: 0.5rem;
  }
}

.network-container {
  width: 100%;
  height: 600px;
  border: 2px solid var(--fs-black);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  background: var(--fs-vanilla);

  @include bp("mobile-only") {
    height: 400px;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--fs-berries-500);
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
  color: var(--fs-white);
  border: 2px solid var(--fs-black);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.top-ingredients {
  background: var(--fs-white);
  padding: 2rem;
  border-radius: 0.5rem;
  border: 2px solid var(--fs-gray-300);
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;

  @include bp("mobile-only") {
    grid-template-columns: 1fr;
  }
}

.ingredient-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--fs-gray-100);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    background: var(--fs-berries-50);
    border-color: var(--fs-berries-500);
    transform: translateX(5px);
  }

  .rank {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--fs-berries-500);
    min-width: 40px;
  }

  .ingredient-name {
    flex: 1;
    font-weight: 600;
    color: var(--fs-black);
  }

  .ingredient-stats {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: var(--fs-gray-600);
  }
}
</style>
