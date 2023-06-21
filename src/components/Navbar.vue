<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <header>
    <Popover class="">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 fixed top-0 left-0 right-0 bg-vanilla z-10"
      >
        <div
          class="flex justify-between items-center border-b-2 border-black py-6 md:justify-start md:space-x-10"
        >
          <div class="flex center">
            <a class="focus:outline-pink-300" href="/">
              <span class="sr-only">Go home</span>
              <img
                class="h-8 w-auto sm:h-10"
                src="https://foodstalker.b-cdn.net/lime.png"
                alt=""
                role="presentation"
              />
            </a>
          </div>
          <div class="-mr-2 -my-2 md:hidden">
            <PopoverButton
              class="bg-vanilla border rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-200"
            >
              <span class="sr-only">Open menu</span>
              <MenuIcon class="h-6 w-6" aria-hidden="true" />
            </PopoverButton>
          </div>
          <div as="nav" class="hidden md:flex md:space-x-5 lg:space-x-10">
            <a
              href="/oppskrift/hverdag/"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>🥦</span> Hverdag
            </a>
            <a
              href="/oppskrift/helg/"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>&#127790;</span> Helg
            </a>
            <a
              href="/oppskrift/søtt/"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>&#127849;</span> Søtt
            </a>
            <a
              href="/oppskrift/tilbehør/"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>&#127805;</span> Tilbehør
            </a>
            <a
              href="/oppskrift/turmat/"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>&#128293;</span> Turmat
            </a>
            <a
              href="#"
              class="text-base font-medium text-black hover:text-pink-300 focus:outline-pink-300"
            >
              <span>&#128526;</span> Bonus
            </a>
          </div>
        </div>
      </div>

      <transition
        enter-active-class="duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <PopoverPanel
          focus
          class="fixed z-10 left-0 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
        >
          <div
            class="bg-vanilla rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y-2 divide-gray-50"
          >
            <div class="pt-5 pb-6 px-5">
              <div class="flex items-center justify-between">
                <div>
                  <img
                    class="h-8 w-auto"
                    src="https://foodstalker.b-cdn.net/lime.png"
                    alt=""
                    role="presentation"
                  />
                </div>
                <div class="-mr-2">
                  <PopoverButton
                    class="bg-vanilla rounded-md p-2 inline-flex items-center justify-center text-black hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset focus:ring-pink-200"
                  >
                    <span class="sr-only">Close menu</span>
                    <XIcon class="h-6 w-6" aria-hidden="true" />
                  </PopoverButton>
                </div>
              </div>
              <div class="mt-6">
                <nav class="grid gap-y-8">
                  <a
                    href="/oppskrift/hverdag/"
                    class="text-base font-medium text-gray-500"
                  >
                    <span>🥦</span> Hverdag
                  </a>
                  <a
                    href="/oppskrift/helg/"
                    class="text-base font-medium text-gray-500"
                  >
                    <span>&#127790;</span> Helg
                  </a>
                  <a
                    href="/oppskrift/søtt/"
                    class="text-base font-medium text-gray-500"
                  >
                    <span>&#127849;</span> Søtt
                  </a>
                  <a
                    href="/oppskrift/tilbehør/"
                    class="text-base font-medium text-gray-500"
                  >
                    <span>&#127805;</span> Tilbehør
                  </a>
                  <a
                    href="/oppskrift/turmat/"
                    class="text-base font-medium text-gray-500"
                  >
                    <span>&#128293;</span> Turmat
                  </a>
                  <a
                    href="/oppskrift/bonus/"
                    class="text-base font-medium text-gray-500 hover:text-gray-900"
                  >
                    <span>&#128526;</span> Bonus
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </header>
</template>

<script lang="ts" setup>
import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/vue";
import { MenuIcon, XIcon } from "@heroicons/vue/outline/index.js";
</script>
