<template>
  <div
    class="badge"
    :class="[`badge--${type}`, { 'badge--clickable': clickable }]"
    :style="{ backgroundColor: backgroundColor }"
    :title="title"
    @click="handleClick"
  >
    <span v-if="icon" class="badge__icon">{{ icon }}</span>
    <span v-if="text" class="badge__text">{{ text }}</span>
    <button
      v-if="closable"
      class="badge__close"
      @click.stop="handleClose"
      type="button"
      aria-label="Remove"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: "difficulty" | "category" | "info" | "ingredient";
  icon?: string;
  text?: string;
  backgroundColor?: string;
  clickable?: boolean;
  title?: string;
  closable?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [];
  close: [];
}>();

const handleClick = () => {
  if (props.clickable) {
    emit("click");
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
.badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--fs-berries-200);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fs-black);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: auto;
  height: auto;
}

.badge--category {
  display: grid;
  place-items: center;
  border-radius: 9999px; /* Circular for category */
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  font-size: 1rem;
}

.badge--info {
  border: 1px solid var(--fs-berries-300);
}

.badge--ingredient {
  background: var(--fs-lime-light);
  border: 1px solid var(--fs-lime);
  color: var(--fs-brokkoli);
}

.badge--clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge--clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.badge__icon {
  font-size: 0.8rem;
}

.badge__text {
  font-size: 0.7rem;
}

.badge--category .badge__icon {
  font-size: 1rem;
  line-height: 1;
}

.badge__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
  margin-left: 0.25rem;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.badge__close:hover {
  opacity: 1;
}

.badge__close:focus {
  outline: 2px solid var(--fs-lime);
  outline-offset: 2px;
  opacity: 1;
}

.badge__close:focus-visible {
  outline: 2px solid var(--fs-berries-500);
  outline-offset: 2px;
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .badge__icon {
    font-size: 0.8rem;
  }

  .badge__text {
    font-size: 0.7rem;
  }
}
</style>
