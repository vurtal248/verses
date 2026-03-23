const referenceElement = document.getElementById("verse-reference");
const contentElement = document.getElementById("verse-content");

const fallbackVerse = {
  reference: "Matthew 11:28",
  content:
    "Come to me, all you who are weary and burdened, and I will give you rest.",
};

const skyThemes = [
  {
    bgTop: "#182b49",
    bgMid: "#6ca3cf",
    bgAccent: "#f1c084",
    bgBottom: "#ffe6b8",
    horizonGlow: "rgba(255, 227, 166, 0.88)",
    horizonHaze: "rgba(255, 244, 204, 0.5)",
    sunCore: "#fff7d6",
    sunMid: "rgba(255, 247, 214, 0.96)",
    sunFade: "rgba(255, 216, 153, 0.56)",
    glowCore: "rgba(255, 241, 190, 0.34)",
    glowFade: "rgba(255, 210, 133, 0.18)",
    overlayTop: "rgba(255, 255, 255, 0.12)",
    overlayLeft: "rgba(255, 250, 226, 0.18)",
    overlayRight: "rgba(255, 224, 169, 0.14)",
    textMain: "#fffaf0",
    textSoft: "rgba(255, 250, 240, 0.84)",
    cardBorder: "rgba(255, 250, 240, 0.2)",
    cardBgTop: "rgba(34, 52, 83, 0.26)",
    cardBgBottom: "rgba(26, 38, 61, 0.18)",
    shadow: "0 24px 80px rgba(17, 24, 39, 0.28)",
    focus: "#fff1b8",
  },
  {
    bgTop: "#21111f",
    bgMid: "#5f2940",
    bgAccent: "#a84f4a",
    bgBottom: "#f08c4e",
    horizonGlow: "rgba(255, 147, 83, 0.82)",
    horizonHaze: "rgba(255, 205, 142, 0.32)",
    sunCore: "#ffd08a",
    sunMid: "rgba(255, 209, 138, 0.95)",
    sunFade: "rgba(255, 164, 104, 0.62)",
    glowCore: "rgba(255, 207, 142, 0.45)",
    glowFade: "rgba(255, 170, 103, 0.24)",
    overlayTop: "rgba(255, 255, 255, 0.03)",
    overlayLeft: "rgba(255, 244, 231, 0.08)",
    overlayRight: "rgba(255, 196, 138, 0.1)",
    textMain: "#fff6ea",
    textSoft: "rgba(255, 246, 234, 0.8)",
    cardBorder: "rgba(255, 244, 229, 0.14)",
    cardBgTop: "rgba(47, 18, 35, 0.34)",
    cardBgBottom: "rgba(29, 12, 27, 0.22)",
    shadow: "0 24px 80px rgba(20, 6, 19, 0.45)",
    focus: "#ffe1a8",
  },
  {
    bgTop: "#171b36",
    bgMid: "#4d426d",
    bgAccent: "#b26967",
    bgBottom: "#f6a16d",
    horizonGlow: "rgba(255, 170, 117, 0.74)",
    horizonHaze: "rgba(244, 203, 166, 0.3)",
    sunCore: "#ffe0b2",
    sunMid: "rgba(255, 224, 178, 0.92)",
    sunFade: "rgba(255, 182, 129, 0.48)",
    glowCore: "rgba(255, 206, 155, 0.34)",
    glowFade: "rgba(233, 160, 113, 0.18)",
    overlayTop: "rgba(255, 255, 255, 0.04)",
    overlayLeft: "rgba(255, 229, 214, 0.08)",
    overlayRight: "rgba(208, 189, 255, 0.08)",
    textMain: "#fff5ec",
    textSoft: "rgba(255, 245, 236, 0.8)",
    cardBorder: "rgba(255, 241, 233, 0.16)",
    cardBgTop: "rgba(28, 24, 50, 0.34)",
    cardBgBottom: "rgba(18, 16, 35, 0.2)",
    shadow: "0 24px 80px rgba(11, 11, 27, 0.45)",
    focus: "#ffe0b0",
  },
  {
    bgTop: "#071423",
    bgMid: "#15304d",
    bgAccent: "#3b5a78",
    bgBottom: "#d18a62",
    horizonGlow: "rgba(255, 164, 113, 0.44)",
    horizonHaze: "rgba(162, 193, 226, 0.18)",
    sunCore: "#ffd3a3",
    sunMid: "rgba(255, 211, 163, 0.6)",
    sunFade: "rgba(255, 160, 104, 0.26)",
    glowCore: "rgba(155, 193, 255, 0.18)",
    glowFade: "rgba(255, 165, 115, 0.11)",
    overlayTop: "rgba(210, 231, 255, 0.05)",
    overlayLeft: "rgba(143, 180, 226, 0.09)",
    overlayRight: "rgba(255, 209, 171, 0.06)",
    textMain: "#f7f2e8",
    textSoft: "rgba(247, 242, 232, 0.76)",
    cardBorder: "rgba(234, 241, 250, 0.14)",
    cardBgTop: "rgba(9, 21, 38, 0.42)",
    cardBgBottom: "rgba(7, 14, 29, 0.28)",
    shadow: "0 24px 80px rgba(2, 9, 18, 0.55)",
    focus: "#ffd6a0",
  },
  {
    bgTop: "#030711",
    bgMid: "#0d1630",
    bgAccent: "#18274d",
    bgBottom: "#3b3356",
    horizonGlow: "rgba(141, 121, 205, 0.22)",
    horizonHaze: "rgba(121, 154, 210, 0.12)",
    sunCore: "#dfe8ff",
    sunMid: "rgba(183, 205, 255, 0.3)",
    sunFade: "rgba(123, 139, 205, 0.12)",
    glowCore: "rgba(150, 172, 255, 0.16)",
    glowFade: "rgba(119, 92, 195, 0.09)",
    overlayTop: "rgba(220, 230, 255, 0.04)",
    overlayLeft: "rgba(121, 160, 255, 0.06)",
    overlayRight: "rgba(203, 214, 255, 0.05)",
    textMain: "#f6f3ee",
    textSoft: "rgba(246, 243, 238, 0.74)",
    cardBorder: "rgba(234, 238, 248, 0.12)",
    cardBgTop: "rgba(7, 12, 25, 0.52)",
    cardBgBottom: "rgba(4, 8, 17, 0.34)",
    shadow: "0 24px 80px rgba(0, 0, 0, 0.62)",
    focus: "#d8e3ff",
  },
];

function applyRandomTheme() {
  const theme = skyThemes[Math.floor(Math.random() * skyThemes.length)];
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    const cssVariable = `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    root.style.setProperty(cssVariable, value);
  });
}

async function loadRandomVerse() {
  referenceElement.textContent = "Loading scripture...";
  contentElement.textContent = "Gathering a fresh passage for reflection.";

  try {
    const response = await fetch("https://bible-api.com/data/web/random");
    if (!response.ok) {
      throw new Error("Failed to fetch verse");
    }

    const data = await response.json();
    const verseReference = `${data.random_verse.book} ${data.random_verse.chapter}:${data.random_verse.verse}`;
    const verseText = data.random_verse.text.trim();

    referenceElement.textContent = verseReference;
    contentElement.textContent = verseText;
  } catch (error) {
    referenceElement.textContent = fallbackVerse.reference;
    contentElement.textContent = fallbackVerse.content;
  }
}

applyRandomTheme();
loadRandomVerse();
