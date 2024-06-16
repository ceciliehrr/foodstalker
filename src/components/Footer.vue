<template>
  <footer class="fs-footer">
    <div class="fs-footer-content">
      <div class="fs-footer-divider">
        <img
          class="fs-footer-logo"
          src="https://foodstalker.b-cdn.net/logo/logo-pink96x96.png"
          aria-hidden="true"
          alt="circle logo with lime"
        />
        <p class="fs-footer-made-with-text">
          Made with <span>💖</span> from Pete&Cecilie
        </p>
        <p class="fs-footer-copyright">
          Copyright © 2020-{{ copyrightYear }} All Rights Reserved Cecilie
          Hansen Rørås.
        </p>

        <p class="fs-footer-gdpr-text">
          Vi stalker kokker, ikke deg! Dette er en GDPR-vennlig nettside, vi
          lagrer ingenting og selger ingenting som kan identifisere deg som
          person. Les mer om vårt verktøy for besøksstatistikk
          <a class="fs-link" href="https://plausible.io/">Plausible her!</a>
        </p>

        <div class="fs-footer-social fs-footer-gdpr-text">
          Vi er på instagram:
          <a
            target="_blank"
            class="instagram"
            href="https://www.instagram.com/foodstalker.no/"
          >
            <img
              src="https://foodstalker.b-cdn.net/Instagram_Glyph_Gradient.png"
          /></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
export default {
  data() {
    return {
      copyrightYear: null,
    };
  },
  mounted() {
    this.getCurrentYear();
  },
  methods: {
    getCurrentYear() {
      const currentYear = new Date().getFullYear();
      this.copyrightYear = currentYear;
    },
  },
};
</script>

<style lang="scss" scoped>
.fs-footer {
  text-align: center;
}

.fs-footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

.fs-footer-divider {
  border-top: 2px solid #000;
  margin-top: 1rem;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr;
  place-items: center;
}

.fs-footer-logo {
  object-fit: contain;
  width: 48px;
  height: 48px;
  display: inline;
  margin-bottom: 4px;
}

.fs-footer-made-with-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.fs-footer-copyright {
  font-size: 0.875rem;
}

.fs-footer-gdpr-text {
  font-size: 0.75rem;
  color: #717171;
  margin-top: 1.5rem;
  line-height: 1.4;
}
.fs-footer-social {
  display: flex;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.mail {
  font-size: 1.5rem;
}

.instagram img {
  height: 1.5rem;
  width: auto;
}
</style>
