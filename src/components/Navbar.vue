<template>
  <header class="navbar">
    <div class="navbar-container">
      <a href="/" class="logo">
        <img src="/src/assets/logo/lime-96x96.png" alt="Logo" />
      </a>
      <nav class="nav-links">
        <a href="/oppskrift/hverdag"> <span>🥦</span> Hverdag</a>
        <a href="/oppskrift/helg"> <span>&#127790;</span> Helg</a>
        <a href="/oppskrift/søtt"><span>&#127849;</span> Søtt</a>
        <a href="/oppskrift/tilbehør"><span>&#127805;</span> Tilbehør</a>
        <a href="/oppskrift/turmat"><span>&#128293;</span> Turmat</a>
        <a href="/om-oss"><span>&#128526;</span> Bonus</a>
      </nav>
      <button class="hamburger-btn" @click="toggleMobileMenu">
        <div class="hamburger" v-if="!showMobileMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
        <span v-else><span class="close"></span></span>
      </button>
    </div>
    <nav class="mobile-menu" v-show="showMobileMenu">
      <a href="/oppskrift/hverdag"><span>🥦</span> Hverdag</a>
      <a href="/oppskrift/helg"><span>&#127790;</span> Helg</a>
      <a href="/oppskrift/søtt"><span>&#127849;</span> Søtt</a>
      <a href="/oppskrift/tilbehør"><span>&#127805;</span> Tilbehør</a>
      <a href="/oppskrift/turmat"><span>&#128293;</span> Turmat</a>
      <a href="/om-oss"><span>&#128526;</span> Bonus</a>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showMobileMenu: false,
      closeIcon: "×",
    };
  },
  methods: {
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
      this.closeIcon = this.showMobileMenu ? "close" : "hamburger";
    },
  },
};
</script>

<style lang="scss">
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;

.navbar {
  background-color: var(--color-vanilla);
  padding: 1rem;
}
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--fs-black);
  padding-bottom: 1rem;

  @include bp("tablet-up") {
    justify-content: flex-start;
  }
}

.logo img {
  height: 2.5rem;
  margin: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-links a {
  color: var(--fs-green-300);
  font-size: 1rem;
  margin-left: 1rem;
  text-decoration: none;
  padding: 0.5rem;
  font-weight: 400;
}

.hamburger-btn {
  display: none;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0.5rem;
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--fs-green-300);
  margin: 5px auto;
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .hamburger-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
    padding-top: 1rem;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.25);
  }

  .mobile-menu a {
    display: block;
    color: var(--fs-green-300);
    font-size: 1rem;
    text-decoration: none;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }

  .mobile-menu a:hover {
    color: var(--fs-pink-500);
  }

  .close {
    display: block;
    position: absolute;
    right: 24px;
    top: 24px;
    width: 25px;
    height: 25px;
  }
  .close:hover {
    color: var(--fs-pink-500);
  }
  .close:before,
  .close:after {
    position: absolute;
    left: 15px;
    content: " ";
    height: 25px;
    width: 2px;
    background-color: var(--fs-green-300);
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }
}
</style>
