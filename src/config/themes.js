// Theme configuration for seasonal easter egg pages
// The key is the URL path (e.g., "jul" creates /jul/ route)
// The value contains all theme-specific settings

import partyPopperEmoji from "../assets/tema/party-popper-noto.svg";
import juletreEmoji from "../assets/tema/juletre.svg";
import sitronEmoji from "../assets/tema/lemon.svg";

export const themes = {
  jul: {
    keyword: "jul",
    title: "Juleoppskrifter",
    description:
      "Opplev den beste julematen med våre utvalgte juleoppskrifter. Fra tradisjonell ribbe til julebakst – alt du trenger for en perfekt jul.",
    emoji: juletreEmoji,
    dividerText: "God jul!",
    introText: "",
  },
  senior: {
    keyword: "senior",
    title: "Senior Oppskrifter",
    description:
      "Oppdag deilige og enkle oppskrifter for seniorer. Perfekte for alle som ønsker å lage sunne og smakfulle måltider.",
    emoji: partyPopperEmoji,
    dividerText: "Gratulerer med 40 år, Petter",
    introText:
      "Velkommen til oppskrifter for eldre – for deg som vet at mat smaker best når man har levd lenge nok til å ha smakt det meste. Her finner du retter som er snille med tennene, gode for sjelen, passe krydret og litt gamle i stilen (men aldri på dato). Vi har samlet våre beste oppskrifter som tar hensyn til både fordøyelsen og nostalgien. Velbekomme!",
  },
  sitron: {
    keyword: "sitron",
    title: "Sitron oppskrifter",
    description:
      "Amalfisitroner er i sesong og kan kjøpes i butikken i januar og februar, lag noe godt med sitroner",
    emoji: sitronEmoji,
    dividerText: "Sitron Oppskrifter",
    introText:
      "Amalfisitroner er i sesong og kan kjøpes i butikken i januar og februar, lag noe godt med sitroner",
  },
};

// Helper function to get theme by slug or return null if not found
export function getTheme(slug) {
  return themes[slug] || null;
}

// Helper function to get all theme slugs for getStaticPaths
export function getAllThemeSlugs() {
  return Object.keys(themes);
}
