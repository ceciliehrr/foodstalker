<template>
  <header :class="['navbar', { hidden: isHidden && !showMobileMenu }]">
    <div class="navbar-container">
      <a href="/" class="logo" aria-label="Til startsiden">
        <img
          src="https://foodstalker.b-cdn.net/logo/lime-96x96.png"
          alt="Logo"
          height="40"
          width="40"
          aria-hidden="true"
        />
      </a>
      <nav class="nav-links">
        <ul>
          <li>
            <a href="/oppskrift/hverdag"><span>🥦</span> Hverdag</a>
          </li>
          <li>
            <a href="/oppskrift/helg"><span>&#127790;</span> Helg</a>
          </li>
          <li>
            <a href="/oppskrift/søtt"><span>&#127849;</span> Søtt</a>
          </li>
          <li>
            <a href="/oppskrift/tilbehør"><span>&#127805;</span> Tilbehør</a>
          </li>
          <li>
            <a href="/oppskrift/turmat"><span>&#128293;</span> Turmat</a>
          </li>
          <li>
            <a href="/oppskrift/drikke"><span>🍹</span> Drikke</a>
          </li>
          <li>
            <a href="/spise-hvor"><span>🍝</span> Hvor vil du spise?</a>
          </li>
          <li>
            <div class="dropdown" ref="dropdown" @click.stop="toggleDropdown">
              <button class="dropbtn">
                &#128526; Bonus <i class="arrow down arrow--margin-left"></i>
              </button>
              <div class="dropdown-content" :class="{ open: isDropdownOpen }">
                <!-- Add your dropdown content here -->
                <ul>
                  <li>
                    <a href="/om-oss">Om oss</a>
                  </li>
                  <li><a href="/themenu">Menyer</a></li>
                </ul>
                <!-- Add more dropdown items if needed -->
              </div>
            </div>
          </li>
        </ul>
      </nav>
      <button
        role="button"
        aria-label="menu-button"
        class="hamburger-btn"
        @click.stop="toggleMobileMenu"
      >
        <div class="hamburger" v-if="!showMobileMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
        <span v-else><span class="close"></span></span>
      </button>
    </div>
    <nav class="mobile-menu" v-show="showMobileMenu">
      <ul>
        <li>
          <a href="/oppskrift/hverdag"><span>🥦</span> Hverdag</a>
        </li>
        <li>
          <a href="/oppskrift/helg"><span>&#127790;</span> Helg</a>
        </li>
        <li>
          <a href="/oppskrift/søtt"><span>&#127849;</span> Søtt</a>
        </li>
        <li>
          <a href="/oppskrift/tilbehør"><span>&#127805;</span> Tilbehør</a>
        </li>
        <li>
          <a href="/oppskrift/turmat"><span>&#128293;</span> Turmat</a>
        </li>
        <li>
          <a href="/oppskrift/drikke"><span>🍹</span> Drikke</a>
        </li>
        <li>
          <a href="/spise-hvor"><span>🍝</span> Hvor vil du spise?</a>
        </li>
        <li>
          <div
            class="dropdown dropdown__mobile"
            ref="dropdownMobile"
            @click.stop="toggleDropdown"
          >
            <button class="dropbtn">
              &#128526; Bonus <i class="arrow down arrow--margin-left"></i>
            </button>
            <div class="dropdown-content" :class="{ open: isDropdownOpen }">
              <!-- Add your dropdown content here -->
              <ul>
                <li>
                  <a href="/om-oss"
                    ><i class="arrow right arrow--margin-right"></i>Om oss</a
                  >
                </li>

                <li>
                  <a href="/themenu"
                    ><i class="arrow right arrow--margin-right"></i>Menyer</a
                  >
                </li>
              </ul>
              <!-- Add more dropdown items if needed -->
            </div>
          </div>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showMobileMenu: false,
      closeIcon: "×",
      isDropdownOpen: false,
      isHidden: false,
      lastScrollPosition: 0,
      isInteracting: false,
    };
  },
  methods: {
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
      this.closeIcon = this.showMobileMenu ? "close" : "hamburger";
      this.isInteracting = true;
      setTimeout(() => (this.isInteracting = false), 300);

      // Close dropdown when mobile menu closes
      if (!this.showMobileMenu) {
        this.isDropdownOpen = false;
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdownOnClickOutside(event) {
      // Don't close if clicking on the hamburger button
      const hamburgerBtn = this.$el.querySelector(".hamburger-btn");
      if (hamburgerBtn && hamburgerBtn.contains(event.target)) {
        return;
      }

      // If dropdown is open, handle the click
      if (this.isDropdownOpen) {
        // Check if click is outside the dropdown specifically (both desktop and mobile)
        const desktopDropdown = this.$refs.dropdown;
        const mobileDropdown = this.$refs.dropdownMobile;

        const clickedInsideDesktop =
          desktopDropdown && desktopDropdown.contains(event.target);
        const clickedInsideMobile =
          mobileDropdown && mobileDropdown.contains(event.target);

        // Close if click is outside both dropdowns
        if (!clickedInsideDesktop && !clickedInsideMobile) {
          this.isDropdownOpen = false;
        }
      } else if (this.showMobileMenu) {
        // If mobile menu is open but dropdown is closed, close mobile menu
        this.showMobileMenu = false;
        this.closeIcon = "hamburger";
      }
    },
    closeDropdownOnMobileMenuClick(event) {
      // Close dropdown when clicking anywhere in mobile menu (except the dropdown itself)
      if (this.isDropdownOpen) {
        const mobileDropdown = this.$refs.dropdownMobile;
        if (mobileDropdown && !mobileDropdown.contains(event.target)) {
          this.isDropdownOpen = false;
        }
      }
    },
    closeDropdownOnTouch(event) {
      // Handle touch events specifically for mobile
      if (this.isDropdownOpen) {
        const mobileDropdown = this.$refs.dropdownMobile;
        if (mobileDropdown && !mobileDropdown.contains(event.target)) {
          this.isDropdownOpen = false;
        }
      }
    },
    addMobileMenuClickListeners() {
      // Add direct event listeners to mobile menu links
      const mobileMenu = this.$el.querySelector(".mobile-menu");
      if (mobileMenu) {
        const menuLinks = mobileMenu.querySelectorAll("a");
        menuLinks.forEach((link) => {
          link.addEventListener("click", (event) => {
            if (this.isDropdownOpen) {
              const mobileDropdown = this.$refs.dropdownMobile;
              if (mobileDropdown && !mobileDropdown.contains(event.target)) {
                this.isDropdownOpen = false;
              }
            }
          });
        });
      }
    },
    handleScroll() {
      if (this.isInteracting) return;

      const currentScrollPosition = window.scrollY;
      const navbarHeight = 100; // Høyden på navbaren (kan justeres)

      // Hvis mobilmenyen er åpen, skal navbaren ikke skjules
      if (this.showMobileMenu) {
        this.isHidden = false;
      } else if (currentScrollPosition <= navbarHeight) {
        this.isHidden = false; // Vis navbaren når man er på toppen av siden (eller nesten)
      } else {
        this.isHidden = currentScrollPosition > this.lastScrollPosition;
      }

      this.lastScrollPosition = currentScrollPosition;
    },
  },
  mounted() {
    // Add multiple event listeners for better compatibility with Astro
    document.addEventListener("click", this.closeDropdownOnClickOutside);
    document.addEventListener("touchstart", this.closeDropdownOnTouch);
    document.addEventListener("touchend", this.closeDropdownOnTouch);
    window.addEventListener("scroll", this.handleScroll);

    // Add direct event listeners to mobile menu items after component is mounted
    this.$nextTick(() => {
      this.addMobileMenuClickListeners();
    });
  },
  beforeDestroy() {
    document.removeEventListener("click", this.closeDropdownOnClickOutside);
    document.removeEventListener("touchstart", this.closeDropdownOnTouch);
    document.removeEventListener("touchend", this.closeDropdownOnTouch);
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style lang="scss">
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;

.navbar {
  background-color: var(--fs-vanilla);
  padding: 1rem 1rem 0rem 1rem;
  position: sticky;
  top: 0; /* Fester navbar til toppen */
  z-index: 1000;
  transform: translateY(0);
  transition: transform 0.3s ease-in-out;
}

.navbar.hidden {
  transform: translateY(-100%);
}
.navbar-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--fs-black);
  padding-bottom: 1rem;
  position: relative;
}

.logo img {
  height: 2.5rem;
  margin: 0.5rem;
}

.nav-links ul {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 2rem;
}

.nav-links a {
  color: var(--fs-brokkoli);
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
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--fs-brokkoli);
  margin: 5px auto;
}

.mobile-menu {
  display: none;
}

@media (max-width: 1113px) {
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
    color: var(--fs-brokkoli);
    font-size: 1rem;
    font-weight: 400;
    text-decoration: none;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }

  .mobile-menu a:hover {
    color: var(--fs-berries-500);
  }

  .close {
    display: block;
    position: absolute;
    right: 50%;
    top: 50%;
    transform: translate(50%, -50%);
    width: 25px;
    height: 25px;
  }
  .close:hover {
    color: var(--fs-berries-500);
  }
  .close:before,
  .close:after {
    position: absolute;
    left: 15px;
    content: " ";
    height: 25px;
    width: 2px;
    background-color: var(--fs-brokkoli);
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }
}

.dropdown ul {
  position: relative;
  display: inline-block;

  @include bp("tablet-up") {
  }
}

/* Style the dropdown button */
.dropbtn {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--fs-brokkoli);
  text-decoration: none;
  font-weight: 300;
  padding: 0.5rem;

  @include bp("tablet-up") {
    margin-left: 1rem;
  }
}

/* Style the dropdown content */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--fs-vanilla);
  min-width: 160px;
  z-index: 1;

  @include bp("tablet-up") {
    margin-left: 1rem;
    background-color: white;
    border: 1px solid black;
  }
}

/* Style the dropdown links */
.dropdown-content a {
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  color: #333;
  margin-left: 1.5rem;
  margin-bottom: 0;

  @include bp("tablet-up") {
    border-bottom: 1px solid black;
    margin-left: 0;
  }
}

/* Change the color of dropdown links when hovered */
.dropdown-content a:hover {
  background-color: var(--fs-gray-100);
}

.open {
  position: relative;
  display: block;

  @include bp("tablet-up") {
    position: absolute;
  }
}

.open + .content-below {
  margin-top: 1rem;
}
</style>
