const referenceElement = document.getElementById("verse-reference");
const contentElement = document.getElementById("verse-content");

const fallbackVerse = {
  reference: "Matthew 11:28",
  content:
    "Come to me, all you who are weary and burdened, and I will give you rest.",
};

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

loadRandomVerse();
