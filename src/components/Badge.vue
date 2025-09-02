<template>
  <div class="badge">
    <span class="badge-icon">{{ icon }}</span>
    <span class="badge-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  text: string;
}

defineProps<Props>();
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--fs-berries-300);
  color: var(--fs-berries-500);
  background: var(--fs-white);
  transition: all 0.2s ease;
  cursor: default;
  user-select: none;
}

.badge-icon {
  font-size: 0.8rem;
}

.badge-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .badge-icon {
    font-size: 0.75rem;
  }

  .badge-text {
    font-size: 0.65rem;
  }
}
</style>
