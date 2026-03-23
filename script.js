const verses = [
  ["Psalm 23:1–2", "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters."],
  ["Matthew 11:28", "Come unto me, all ye that labour and are heavy laden, and I will give you rest."],
  ["Lamentations 3:22–23", "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness."]
];

const choice = verses[Math.floor(Math.random() * verses.length)];
document.getElementById("verse-reference").textContent = choice[0];
document.getElementById("verse-content").textContent = choice[1];
