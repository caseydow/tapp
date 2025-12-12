// src/constants.js

export const TYPES = ["M", "R", "W", "S"];
export const RARTS = ["2C1", "2C2", "2C3", "2R1", "2R2", "2E1", "1M1"];

export const CLASS_TYPES = {
  "Knight": "W",
  "Archer": "R",
  "Mage": "M",
  "Warlock": "S"
};

export const COLORS = {
  "Knight": "#ffd966",
  "Archer": "#b6d7a8",
  "Mage": "#6fa8dc",
  "Warlock": "#c27ba0"
};

export const COLORS_DARK = {
  "Knight": "#ac881d",
  "Archer": "#649051",
  "Mage": "#2c679c",
  "Warlock": "#882d5d"
};

export const CLASSES = ["Knight", "Archer", "Mage", "Warlock"];

export const CLASS_BUFFS = [
  [0, 0, -1, 2], // Attack
  [2, -1, 0, 0], // Armor
  [0, 20, 0, -10] // Speed
];

export const ABILITIES = [
  [
    "Royal Aura: Ignore true damage dealt\nby Magic Weapons.",
    "Castle Armory: At the start of the game,\nand at each Intermission, gain an Armor Token."
  ],
  [
    "Magical Quiver: Start the game with a\nSpeed Token and a token of your choice.",
    "Nimble Feet: Once per combat, dodge the\ndamage of an attack of your choice."
  ],
  [
    "Hoarding: At the start of the game,\ngain a random Game and Combat Token.",
    "Enchanted Lifeline: Once per combat,\ninstead of dying block all damage until\nyour next turn. Live on 15."
  ],
  [
    "Overconfidence: While at or above 5 Life Points,\ngain +2 attack, and below it, gain +2 armor.",
    "Demonic Essence: When you use a Soul weapon,\nheal for a third of the damage of the weapon."
  ],
  "Empowered Strikes: After you use a card\nfrom your class, your next hit\ndeals +5 damage."
];

export const CARDS = {
  "MC1": "Piercing Wand",
  "MC2": "Mushroom on a Stick",
  "MC3": "Scepter of Wisdom",
  "MR1": "Ethereal Enhancements",
  "MR2": "Conjuring Staff",
  "ME1": "Glass Orb",
  "MM1": "Mindbreaker",
  "RC1": "Shurikens",
  "RC2": "Throwing Spear",
  "RC3": "Compound Crossbow",
  "RR1": "Luminecent Shotter",
  "RR2": "Terrain Bow",
  "RE1": "Blowdarts",
  "RM1": "Stormshot",
  "WC1": "Copper Ward",
  "WC2": "Smithing Hammer",
  "WC3": "Scimitar of Judgement",
  "WR1": "Thick Cleaver",
  "WR2": "Heavy Axe",
  "WE1": "Sentinel's Sword",
  "WM1": "Vulcan's Greatsword",
  "SC1": "Explosive Darkblade",
  "SC2": "Firespit Scythe",
  "SC3": "Soul Barrier",
  "SR1": "Shadow Dagger",
  "SR2": "Demonic Boomerang",
  "SE1": "Dual Scythes",
  "SM1": "Reaper of Souls",
  "JJ1": "Incantation"
};

export const TOKEN_NAMES = ["Attack", "Armor", "Speed", "Health", "Arcane", "Mushroom", "Recycle", "Life"];
export const TOKEN_COLORS = ["#b50000", "#ffa444", "#7fcf7e", "#d64545", "#6dc5d6", "#ff6969", "#6688ff", "#ffdd61"];
export const INCANTATION_NAMES = ["King's Blessing", "Super Speed", "Arcanography", "Ultimate Confrontation"];