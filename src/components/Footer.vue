<template>
    <footer class="footer bg-vanilla text-center mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="border-t-2 mt-10 border-black py-6 grid grid-cols-1 place-items-center">
                <img class="object-center w-12 h-12" src="https://foodstalker.b-cdn.net/logo-pink.png" aria-hidden="true"
                    alt="circle logo with lime">
                <p class="text-s font-semibold">Made with <span>💖</span> from Pete&Cecilie </p>
                <p class="text-xs"> Copyright © 2020-2023 All Rights Reserved Cecilie Hansen Rørås.</p>

                <p class="text-xs text-gray-500 mt-10 lg:w-3/6"> Vi stalker kokker, ikke deg! Dette er en GDPR-vennlig nettside, vi lagrer ingenting og selger ingenting som kan identifisere deg som person. Les mer om vårt verktøy for besøksstatistikk <a href="">Plausible her!</a></p>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
export default {

}
</script>

<style lang="scss" scoped>
.footer {
    img {
        display: inline;
        margin-bottom: 4px;
    }
}
</style>
