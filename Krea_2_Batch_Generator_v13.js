//@api-1.0
// version 13
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// Version 13 — adds Randomization Mode
// =========================================

// =========================================
// CONSTANTS
// =========================================

const NONE_SELECTED = 0;

// How many constructed prompts to show verbatim on the review screen.
const PREVIEW_SAMPLE_SIZE = 8;

const ASPECT_OPTIONS = [
    { label: "1:1", width: 1024, height: 1024 },
    { label: "3:4 Portrait", width: 768, height: 1024 },
    { label: "4:3 Landscape", width: 1024, height: 768 },
    { label: "16:9", width: 1024, height: 576 }
];

const ASPECT_DIMENSIONS = ASPECT_OPTIONS.map(({ width, height }) => [width, height]);

// =========================================
// RANDOM HELPERS
// =========================================

function randomInt(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
}

function randomElement(array) {
    return array[randomInt(array.length)];
}

// Returns the value of a random preset, skipping presets whose value is
// an empty string (e.g. "No specific shape" sentinels).
function randomPresetValue(presets) {
    const candidates = presets.filter(p => {
        const value = getPresetValue(p);
        return value !== undefined && value !== null && value !== "";
    });
    return candidates.length > 0 ? getPresetValue(randomElement(candidates)) : "";
}

// Picks `count` random switch values from a preset list (no duplicates).
function randomSwitchValues(presets, count) {
    const indices = presets.map((_, i) => i);
    // Fisher-Yates shuffle.
    for (let i = indices.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, Math.min(count, indices.length)).map(i => getPresetValue(presets[i]));
}

const DEFAULT_PROMPT_FALLBACKS = {
    subject: "a woman",
    outfit: "t-shirt and jeans",
    action: "smiling",
    // No default camera perspective — when none is selected, the prompt
    // simply omits any perspective clause instead of forcing eye-level.
    camera: "candid",
    timeOfDay: "natural daytime illumination",
    lighting: "soft directional light, balanced exposure, and ambient fill",
    artStyle: "photo",
    genericPrompt: "a portrait of the subject"
};

// Models offered on the setup screen. Selecting both generates one image
// per model for every constructed prompt.
// NOTE: "file" must exactly match the model's filename in Draw Things.
// "loras" lists the LoRAs attached for that model, each with its file
// (exact Draw Things filename) and strength ("weight").
const MODEL_OPTIONS = [
    {
        label: "Flux.2 Klein",
        file: "flux_2_klein_9b_i8x.ckpt",
        loras: [
            { file: "klein_snofs_v1_4_fixed_lora_lora_f16.ckpt", weight: 1.4 }
        ]
    },
    {
        label: "Krea 2",
        file: "krea_2_turbo_i8x.ckpt",
        loras: [
            { file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt", weight: 1.0 },
            { file: "mysticxxx_krea2_v3_lora_f16.ckpt", weight: 0.6 }
        ]
    }
];

// ---- PROMPT ENHANCER ----
// Local language model used to refine each constructed prompt before
// generation (same "Image Interpreter" mechanism as the standalone
// Prompt Enhancer script). Must be downloaded in Draw Things.
const ENHANCER_MODEL = "qwen_3.5_4b_i8x.ckpt";

// Instruction given to the language model. It must preserve every
// concrete choice made by the batch generator and only improve wording.
const KREA2_REFINEMENT_TEMPLATE = `You are a Krea 2 image-generation prompt refinement specialist.

Your job is to refine an already-constructed prompt for Krea 2.

PRESERVE EXACTLY:
- subject identity and gender
- age
- ethnicity
- body physique
- hair characteristics
- clothing
- action
- pose
- environment
- camera position
- camera angle
- requested composition
- lighting direction/style
- any explicitly specified objects
- any explicitly specified relationships between objects

DO NOT:
- change the subject
- change gender
- change age
- add clothing
- remove clothing
- change the action
- change the pose
- invent additional people
- replace selected preset choices
- contradict camera instructions
- introduce a different artistic style unless explicitly requested

REFINE:
- natural language flow
- visual specificity
- spatial relationships
- anatomical coherence
- scene coherence
- camera/composition clarity
- lighting consistency
- material and environmental detail
- reduction of redundant wording
- removal of contradictory descriptions

Prioritize the user's original prompt over your own assumptions.

Return ONLY the final Krea 2 prompt.
No explanation.
No headings.
No markdown.`;

// =========================================
// PRESETS
// =========================================

// --- GENDER ---
const genderPresets = ["woman", "man"];

// --- NATIONALITY / ETHNICITY ---
const nationalityPresets = [
    { label: "Caucasian", value: "Caucasian with Western European facial features" },
    { label: "Black", value: "Black with rich deep skin tone and classic African facial features" },
    { label: "Mixed-Race", value: "Mixed-race with a natural blend of African and European facial features, deep golden-bronze skin, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick dark brown hair with thick wavy curls, a curvy hourglass figure, and a round ass" },
    { label: "Mexican", value: "Mexican with prominent Indigenous Mesoamerican facial features, warm olive-tan skin, dark brown eyes, thick dark eyebrows, thick dark wavy hair, plump lips, and a curvy hourglass figure" },
    { label: "Indian", value: "Indian with warm brown skin, dark eyes, and South Asian facial features" },
    { label: "Thai", value: "Thai with golden-tan skin and Southeast Asian facial features" },
    { label: "Japanese", value: "Japanese with fair skin and East Asian facial features" },
    { label: "Korean", value: "Korean with fair porcelain skin and East Asian facial features" },
    { label: "Filipina", value: "Filipina with warm tan skin and Southeast Asian facial features" },
    { label: "Brazilian", value: "Brazilian with sun-kissed olive skin and a blend of European, African, and Indigenous features" },
    { label: "Italian", value: "Italian with olive skin and Mediterranean facial features" },
    { label: "Scandinavian", value: "Scandinavian with fair skin, light hair, and Nordic facial features" },
    { label: "Russian/Eastern European", value: "Russian/Eastern European with fair skin and Slavic facial features" },
    { label: "Chinese", value: "Chinese with fair skin and East Asian facial features" },
    { label: "Vietnamese", value: "Vietnamese with warm tan skin and Southeast Asian facial features" },
    { label: "Middle Eastern", value: "Middle Eastern with olive skin, dark hair, and Middle Eastern facial features" },
    { label: "French", value: "French with fair skin and classic Western European features" },
    { label: "German", value: "German with fair skin and Central European facial features" },
    { label: "Irish", value: "Irish with fair skin, freckles, and Celtic facial features" },
    { label: "Native American", value: "Native American with warm bronze skin and Indigenous American facial features" },
    { label: "Polynesian/Pacific Islander", value: "Polynesian/Pacific Islander with warm brown skin and Polynesian facial features" },
    { label: "Ethiopian/East African", value: "Ethiopian/East African with deep brown skin and East African facial features" }
];

const celebrityPresets = [
    { label: "My Baby", value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes" },
    { label: "Anne Hathaway", value: "Anne Hathaway with a tall slim build with smokey eyes and heavy mascara" },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs" },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair" },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls" },
    { label: "Lisbeth Salander", value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings" },
    { label: "Curvy Black Woman with Box Braids", value: "a curvy black woman with warm brown skin, long black box braids, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings" },
    { label: "Curvy Mexican woman", value: "a curvy Mexican woman with prominent Indigenous Mesoamerican features, olive skin, plump lips, medium-length straight black hair, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings" },
    { label: "Mixed race", value: "mixed race with Afro European features, a deep golden-bronze complexion, softly flared nostrils, and a straight natural nose bridge, thick dark brown hair with thick wavy curls, and a round ass." },
    { label: "Petite Korean", value: "small petite Korean woman with short stature, and short straight black hair" },
    { label: "Slim Blonde with Pixie Cut", value: "a slim-build woman with porcelain skin, short blonde hair in a textured pixie cut style" },
    { label: "Oversized head/eyes, small nose", value: "with an unnaturally large head with large eyes and a tiny button nose" },
    { label: "Michelle Obama", value: "Michelle Obama" },
    { label: "Betty Boop", value: "Betty Boop" }
];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];

// --- SKIN TONE ---
const skinTonePresets = [
    "porcelain skin", "pale skin", "fair skin", { label: "tanned skin", value: "tanned sun-kissed skin" }, "cream skin",
    "olive skin", "caramel skin", "golden-bronze skin", "warm brown skin", "dark skin", "dark glossy skin", "dark black nubian skin with a glossy sheen"
];

// --- EYE COLOR ---
const eyeColorPresets = [
    { label: "Blue", value: "blue eyes" },
    { label: "Green", value: "green eyes" },
    { label: "Hazel", value: "hazel eyes" },
    { label: "Brown", value: "brown eyes" },
    { label: "Dark brown", value: "dark brown eyes" },
    { label: "Amber", value: "amber eyes" },
    { label: "Gray", value: "gray eyes" },
    { label: "Violet", value: "violet eyes" },
    { label: "Heterochromia (blue/brown)", value: "eyes that have heterochromia, one eye blue, the other eye brown" }
];

// =========================================
// BODY / PHYSIQUE
// =========================================

const overallBuildPresets = [
    { label: "Slim build", value: "slim build" },
    { label: "Soft Fit Frame", value: "toned athletic frame softened by naturally feminine curves, visible but subtle muscle definition" },
    { label: "Average build", value: "average build" },
    { label: "Petite build", value: "petite build with a small overall frame, narrow hips, short stature, narrow shoulders, thin legs, and flat belly" },
    { label: "Curvy build", value: "curvy build with naturally pronounced feminine curves" },
    { label: "Muscular build", value: "muscular build with clearly developed musculature" },
    { label: "Chubby build", value: "chubby build with a softer, fuller physique" },
    { label: "Large frame", value: "large frame with broad shoulders, thick limbs, and a tall, imposing build" }
];

const heightPresets = [
    { label: "Short", value: "short stature with naturally proportioned overall body proportions" },
    { label: "Average", value: "average height and proportions" },
    { label: "Tall", value: "tall stature, noticeably above-average height, long legs and naturally elongated overall proportions" }
];

const chestPresets = [
    { label: "Flat chest", value: "flat chest" },
    { label: "Small chest", value: "small chest" },
    { label: "Average chest", value: "average chest" },
    { label: "Full chest", value: "full chest" },
    { label: "Large breasts", value: "large breasts" }
];

const hipPresets = [
    { label: "Narrow hips", value: "narrow hips" },
    { label: "Average hips", value: "average-width hips" },
    { label: "Wide hips", value: "wide hips with proportionally fuller hips and upper thighs" }
];

const lipsPresets = [
    { label: "Thin lips", value: "thin lips" },
    { label: "Average lips", value: "average lips" },
    { label: "Full lips", value: "full lips" },
    { label: "Plump lips", value: "plump lips" }
];

const eyelashPresets = [
    { label: "Thin eyelashes", value: "thin eyelashes" },
    { label: "Average eyelashes", value: "average eyelashes" },
    { label: "Long eyelashes", value: "long eyelashes" }
];

const bodyShapePresets = [
    { label: "No specific shape", value: "" },
    { label: "Petite frame", value: "petite frame with narrow shoulders, narrow hips, and a small chest" },
    { label: "Hourglass", value: "hourglass body shape with balanced bust and hips and a clearly defined waist" },
    { label: "Pear-shaped", value: "pear-shaped body with narrower shoulders and upper body and proportionally wider hips and thighs" },
    { label: "Rectangle", value: "rectangle body shape with relatively similar shoulder, waist and hip widths" },
    { label: "Inverted triangle", value: "inverted-triangle body shape with broader shoulders and proportionally narrower hips" },
    { label: "Apple-shaped", value: "apple-shaped body with a fuller midsection and relatively slimmer legs" }
];

const legPresets = [
    { label: "Slim legs", value: "slim legs" },
    { label: "Average legs", value: "average legs" },
    { label: "Thick legs", value: "thick legs with fuller thighs" },
    { label: "Toned legs", value: "toned legs with defined but natural musculature" }
];

const assSizePresets = [
    { label: "Small", value: "small, relatively subtle buttocks" },
    { label: "Average", value: "average-sized buttocks with natural proportions" },
    { label: "Large", value: "large, prominently rounded buttocks" },
    { label: "Very large", value: "very large, dramatically rounded buttocks with pronounced volume" }
];

const bellySizePresets = [
    { label: "Flat", value: "flat, relatively lean abdomen" },
    { label: "Average", value: "average abdomen with natural proportions" },
    { label: "Soft", value: "soft, gently rounded abdomen" },
    { label: "Large", value: "prominent, rounded abdomen" },
    { label: "Very large", value: "very large, prominently rounded abdomen" }
];

const specificBodyPresets = [
    { label: "No specific characteristic", value: "" },
    { label: "Adult with achondroplasia", value: "adult with achondroplasia, characteristic short stature and naturally proportioned body" },
    { label: "Pregnant", value: "pregnant adult with a visibly rounded pregnant belly" },
    { label: "Heavily pregnant", value: "heavily pregnant adult with a large, prominently rounded late-stage pregnancy belly" }
];

// =========================================
// APPEARANCE
// =========================================

const makeupPresets = [
    "light makeup", "heavy makeup", "red lipstick", "smokey eyes", "heavy mascara",
    { label: "Lined lips (Chola/Chicana style)", value: "lips lined with a dark brown lip liner a shade darker than the lipstick, filled in with lighter lipstick" }
];
const makeupOdditiesPresets = [
    "full clown makeup", "edgy sexy clown makeup with streams of blood from {possessive} mouth and dark eyes",
    "porcelain doll makeup with rosy cheeks and a painted-on smile", "geisha-style white face makeup with red lips",
    "sugar skull Dia de los Muertos face paint", "zombie/horror makeup with pale skin and dark sunken eyes",
    "mime makeup with white face and black accents", "glitter rave face paint", "tribal face paint"
];
const facialHairPresets = ["short beard", "thick beard"];
const tattooPresets = ["arm tattoo", "back tattoo", "neck tattoos", "sleeve tattoos", "red & green rose tattoos that cover both arms"];
const bodyHairPresets = [
    "light body hair", "thick body hair", "light pubic hair", "thick pubic hair", "a full bush of thick pubic hair",
    "freckles", "dimples", "wrinkles", "sun-kissed tan lines", "sweaty skin",
    "prosthetic small horns", "pointed elf ears", "vampire fangs", "fake stitched scars",
    "metallic/chrome body paint", "bioluminescent-style glowing paint accents",
    "subtle natural stretch marks", "cellulite texture", "visible veins", "beauty mark"
];

const nailPresets = [
    "French tip manicure", "red nail polish", "black nail polish", "nude nail polish",
    "glossy chrome nails", "long stiletto acrylics"
];

const hairDetailPresets = [
    { label: "Shaved on one side", value: "one side of the head shaved" },
    { label: "Shaved on both sides", value: "both sides of the head shaved" }
];

const nosePresets = [
    "straight bridge", "aquiline nose", "button nose", "upturned nose", "hooked nose",
    "flared nostrils", "narrow nostrils", "wide nose", "small nose", "prominent nose"
];

const appearanceSwitchGroups = [
    { title: "Makeup", description: "Makeup and cosmetic styling", presets: makeupPresets },
    { title: "Makeup Oddities", description: "Unconventional and costume-style makeup looks", presets: makeupOdditiesPresets },
    { title: "Facial Hair", description: "Facial hair characteristics", presets: facialHairPresets },
    { title: "Nose", description: "Nose bridge, tip, and nostril characteristics (multiple can combine)", presets: nosePresets },
    { title: "Tattoos", description: "Visible tattoo characteristics", presets: tattooPresets },
    { title: "Body / Skin Details", description: "Body hair and skin details", presets: bodyHairPresets },
    { title: "Nails", description: "Manicure and nail styling", presets: nailPresets },
    { title: "Hair Details", description: "Additional hair-shaving and hair-structure details", presets: hairDetailPresets }
];

const hairColorPresets = [
    "blonde", "brunette", "black", "red", "auburn", "salt & pepper", "brown salt & pepper", "silver",
    "platinum blonde", "copper/ginger", "chestnut brown", "ombre", "balayage", "pastel pink", "pastel blue/purple"
];
const hairLengthPresets = ["short", "medium-length", "long", "very long"];
const hairTypePresets = ["straight", "wavy", "curly", "kinky", "afro-textured", "frizzy"];

const hairstyleGroups = [
    {
        title: "Updos and braided styles",
        description: "Classic updos and braided hair styling choices",
        presets: [
            "wet hair", "ponytail", "messy ponytail", "French braid", "loose braids",
            "cornrows", "box braids", "micro braids", "dreadlocks", "messy bun",
            "messy double buns", "with bangs"
        ]
    },
    {
        title: "Voluminous and retro styling",
        description: "Big-volume and retro-inspired hair silhouettes",
        presets: [
            { label: "blown-out", value: "high-volume, heavily sprayed, lacquered hairstyle" },
            { label: "soft feathered 70s blowout", value: "soft feathered 1970s blowout hairstyle with airy volume, gentle waves, and naturally lifted layers" },
            { label: "60s bouffant curls", value: "1960s bouffant hairstyle with large rounded curls, high volume, and polished lift" }
        ]
    },
    {
        title: "Edgy and stylized cuts",
        description: "More fashion-forward and stylized hair cuts",
        presets: [
            "Faux Hawk",
            { label: "Pixie Cut", value: "in a textured pixie cut style" },
            "spiked punk hairstyle"
        ]
    },
    {
        title: "Iconic curl styles",
        description: "Signature curl and wave-inspired styling choices",
        presets: ["Hollywood curls", "Victory curls"]
    }
];

// =========================================
// ACCESSORIES
// =========================================

const accessoryGroups = [
    {
        title: "Jewelry",
        description: "Select any jewelry accessories to add",
        presets: [
            "stud earrings", "hoop earrings", "large hoop earrings", "drop earrings",
            "necklace", "layered necklaces", "choker", "pendant necklace", "pearl necklace",
            "bracelet", "stacked bracelets", "watch", "rings", "multiple rings", "diamond-studded silver anklet"
        ]
    },
    {
        title: "Eyewear",
        description: "Select eyewear accessories",
        presets: [
            "sunglasses", "aviator sunglasses", "round sunglasses", "cat-eye sunglasses",
            "reading glasses", "clear-frame glasses", "dark sunglasses"
        ]
    },
    {
        title: "Body Piercings",
        description: "Select visible body piercing details",
        presets: ["nose piercing", "septum piercing", "eyebrow piercing", "lip piercing", "multiple ear piercings", "nipple piercings", "navel piercing"]
    },
    {
        title: "Headwear",
        description: "Select headwear accessories",
        presets: ["baseball cap", "beanie", "wide-brim hat", "fedora", "cowboy hat", "sun hat", "beret"]
    },
    {
        title: "Hair Accessories",
        description: "Select accessories worn in or around the hair",
        presets: ["hair clips", "decorative hair pins", "hair ribbon", "headband", "scrunchie", "hair bow", "flower in the hair"]
    }
];

// =========================================
// GENERIC PRESET HELPERS
// =========================================

function unwrapPreset(preset, key) {
    return (typeof preset === "object" && preset !== null) ? preset[key] : preset;
}

function getPresetLabel(preset) {
    return unwrapPreset(preset, "label");
}

function getPresetValue(preset) {
    return unwrapPreset(preset, "value") ?? preset;
}

function presetLabels(presets) {
    return presets.map(getPresetLabel);
}

function menuWithPlaceholder(placeholder, presets) {
    return [placeholder, ...presetLabels(presets)];
}

function findPresetMenuIndex(presets, targetValue) {
    const idx = presets.findIndex(p => getPresetValue(p) === targetValue || getPresetLabel(p) === targetValue);
    return idx >= 0 ? idx + 1 : NONE_SELECTED;
}

function presetSwitches(presets) {
    return presets.map(preset => this.switch(false, `✡︎  ${getPresetLabel(preset)}`));
}

// Reads a menu selection. When `hasPlaceholder` is true, index 0 means
// "nothing selected" and real options start at index 1.
function selectedValueWithPlaceholder(index, presets) {
    if (index <= 0) return "";
    const actualIndex = index - 1;
    if (actualIndex < 0 || actualIndex >= presets.length) return "";
    return getPresetValue(presets[actualIndex]) || "";
}

// Reads a menu selection where every index maps directly to a preset
// (no leading placeholder option).
function selectedValueNoPlaceholder(index, presets) {
    if (index < 0 || index >= presets.length) return "";
    return getPresetValue(presets[index]) || "";
}

function selectedSwitchValues(data, presets) {
    const values = [];
    for (let i = 0; i < presets.length; i++) {
        if (data[i] === true) values.push(getPresetValue(presets[i]));
    }
    return values;
}

function joinParts(parts) {
    return parts.filter(part => part !== undefined && part !== null && part !== "").join(", ");
}

// =========================================
// CLOTHING
// =========================================

const clothingColorPresets = [
    "black", "white", "red", "crimson", "burgundy", "emerald green", "forest green",
    "olive green", "navy blue", "royal blue", "baby blue", "pastel pink", "hot pink",
    "lavender", "purple", "yellow", "orange", "beige", "champagne", "brown", "gold", "silver"
];

function applyClothingColor(item, color) {
    if (!color || !item) return item;
    // Handle article prefixes gracefully: "a loose fitting T-shirt" -> "a black loose fitting T-shirt"
    if (/^a\s+/i.test(item)) {
        return item.replace(/^a\s+/i, `a ${color} `);
    }
    if (/^an\s+/i.test(item)) {
        return item.replace(/^an\s+/i, `a ${color} `);
    }
    return `${color} ${item}`;
}

const clothingGroups = [
    {
        title: "Tops",
        description: "Upper-body styling and color",
        hasColorMenu: true,
        presets: [
            "a loose fitting T-shirt",
            "a fitted T-shirt",
            "a tank top",
            { label: "a short crop top", value: "a crop-top t-shirt showing significant underboob" },
            "a blouse",
            "a halter top",
            "off-shoulder top",
            "an unbuttoned mens dress shirt",
            "a hoodie"
        ]
    },
    {
        title: "Bottoms",
        description: "Skirts, shorts, bottoms, and color",
        hasColorMenu: true,
        presets: [
            "jeans",
            "shorts",
            "cutoff jean shorts",
            "spandex leggings",
            "mini-skirt",
            "pleated mini-skirt",
            "wrap-around skirt"
        ]
    },
    {
        title: "Dresses",
        description: "Dress and one-piece styles and color",
        hasColorMenu: true,
        presets: [
            "a short babydoll dress", "a summer dress", "a multicolored sari",
            "a burqa", "a nun's habit", "a traditional wedding dress",
            "an edgy racy wedding dress", "a full-length evening gown",
            "a lowcut full-length sheer dress with side pockets", "cut-out dress with a side slit from her waist down"
        ]
    },
    {
        title: "Lingerie",
        description: "Lingerie, underlayers, and color",
        hasColorMenu: true,
        presets: [
            "nude", "bikini-style panties", "thong", "high-waisted thong bottoms", "garter belt",
            "lace bustier", "silk lingerie set", "black lace lingerie set", "red satin lingerie set",
            "sheer lace teddy", "transparent lace bra and panties", "lace-up corset", "satin chemise",
            "balconette bra and matching panties", "lace garter set",
            "leather lingerie set", "silk robe", "silk robe and lingerie set", "fishnet bodysuit",
            "push-up bra and thong set", "strapless corset set",
            "sheer robe with matching panties", "satin slip dress", "lace-up bustier set",
            "corset over stockings"
        ]
    },
    {
        title: "Swimwear",
        presets: [
            "one-piece swimsuit", "two-piece bikini", "micro bikini", "string bikini"
        ]
    },
    {
        title: "Robes / Loungewear",
        description: "Robes and casual lounging outfits",
        presets: ["kimono robe", "silk cami and shorts set"]
    },
    {
        title: "Sets",
        description: "Specialty outfit presets",
        presets: [
            { label: "Champagne Silk Pajama Set", value: "champagne-colored silk pajama set with shorts that show ample thigh" },
            { label: "a lace bustier, garter belt and thigh-high stockings", value: "a lace bustier, garter belt and thigh-high stockings" }
        ]
    },
    {
        title: "Uniforms",
        description: "Uniform-style outfit presets",
        presets: [
            { label: "French Maid Uniform", value: "black French maid uniform with short pleated skirt and white collar" },
            { label: "Hooters Uniform", value: "Hooters uniform (tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts)" },
            { label: "Schoolgirl Uniform", value: "a schoolgirl uniform with a short pleated skirt and thigh-high white socks. {possessive} shirt is unbuttoned down to {possessive} navel, revealing deep cleavage." },
            { label: "Sexy Nurse", value: "a sexy nurse's uniform, showing ample cleavage, and a nurse's cap" }
        ]
    },
    {
        title: "Costume Oddities",
        description: "Unconventional and surreal costume presets",
        presets: [
            "a gimp mask",
            "a latex catsuit",
            { label: "mascot-style animal onesie, unzipped", value: "a mascot-style animal onesie, unzipped" },
            { label: "marionette/puppet aesthetic", value: "a marionette/puppet aesthetic with visible joint seams and strings" }
        ]
    },
    {
        title: "Period Fashion",
        description: "1940s WWII-era and 1960s mid-century styling",
        presets: [
            { label: "1940s WWII Women's Ensemble", value: "1940s WWII-era women's ensemble: A-line tea dress with a fitted waist, padded shoulders, and Victory Roll hairstyle" },
            { label: "1940s WWII Flight Jacket", value: "1940s WWII-style leather flight jacket worn over a white dress" },
            { label: "1940s Sailor Uniform", value: "1940s-style navy sailor uniform with a white collar and navy tie" },
            { label: "1960s Mod Shift Dress", value: "1960s Mod shift dress with a geometric pattern, bold graphic print, and knee-length hem" },
            { label: "1960s Cocktail Dress", value: "1960s cocktail dress with a fitted bodice, flared A-line skirt, and elbow-length gloves" },
            { label: "1960s Turtleneck & Slacks", value: "1960s beatnik turtleneck paired with high-waisted slacks" },
            { label: "1960s Go-Go Outfit", value: "1960s go-go dress with white go-go boots" },
            { label: "1960s Pillbox Ensemble", value: "1960s pillbox hat and tailored suit ensemble with a boxy jacket and pencil skirt" }
        ]
    },
    {
        title: "Footwear",
        description: "Shoes, socks, legwear, and color",
        hasColorMenu: true,
        presets: [
            "barefoot", "tube socks", "knee-high Hello Kitty socks", "knee-high Pokemon socks",
            "black fishnet stockings", "sheer lace stockings", "strappy heels", "lace-up knee boots",
            "platform boots", "stiletto heels", "cowboy boots", "thigh-high stockings", "thigh-high leather boots",
            "lace-up thigh-highs"
        ]
    }
];

const clothingPresets = [
    {
        label: "Bustier/Garter/Stockings",
        value: "a lace bustier, a garter belt, and thigh-high stockings"
    },
    {
        label: "Leather Punk Lingerie",
        value: "leather lingerie, a fishnet bodysuit, and thigh-high leather boots"
    },
    {
        label: "French Maid Uniform",
        value: "black French maid uniform with short pleated skirt and white collar"
    },
    {
        label: "Hooters Uniform",
        value: "Hooters uniform (tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts)"
    }
];

// =========================================
// COMPOSITE POSES
// =========================================

const complexActionPresets = [
    { label: "Wall Pose — back against wall, arms raised, one knee bent", value: "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms raised high above head and hands clasped, lips parted." },
    { label: "Wall Pose — back against wall, arms down, one knee bent", value: "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms at {possessive} sides, pressed against the wall, lips parted." },
    { label: "Bed Lean (on elbows) — elbows on bed, ass toward camera", value: "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing {possessive} ass toward the camera" },
    { label: "Bed Lean (face-down) — cheek on mattress, looking sideways", value: "standing at the edge of a bed, leaning forward, feet on floor, one cheek touching the bed, looking to the side at the camera, pushing {possessive} ass toward the camera" },
    { label: "Ass-Up Lean (on bed or floor) — on knees, face forward, back arched", value: "on {possessive} knees, leaning forward, {possessive} face in the foreground, back arched, ass high in the air, arms stretched out in front of {objectPronoun}" },
    { label: "Deep Squat, Viewed From Below — knees wide, toes pointed, hands on knees", value: "worms-eye view, squatting with {possessive} knees spread wide and on the tips of {possessive} toes, hands resting on {possessive} knees" },
    { label: "Cross-Legged Floor Sit — seated, leaning back, relaxed smile", value: "sitting cross-legged on the floor, leaning back slightly on {possessive} hands, looking directly into the camera with a relaxed smile" },
    { label: "Spread Eagle (Lying Back) — lying back, legs spread wide, hands holding legs", value: "laying on {possessive} back with {possessive} legs raised and spread wide, feet wide apart, holding {possessive} legs in the air with {possessive} hands, looking through {possessive} open legs at the camera" },
    { label: "Back-on-Bed (Legs Straight Up) — legs straight and elevated, knees locked", value: "laying on a bed on {possessive} back with {possessive} butt at the edge of the bed, {possessive} legs straight and elevated into the air, knees locked, bending at waist only" },
    { label: "Deep Waist Bend — legs straight, hands on shelf, surprise look", value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with {possessive} hand covering {possessive} mouth and wide-eyed open-mouthed look of surprise" },
    { label: "Shower View (From Below) — camera below, looking up through water", value: "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below {objectPronoun} looking up" },
    { label: "Shower View (From Above)", value: "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly above {objectPronoun} looking down" },
    { label: "Shower View (With a Man)", value: "standing and rubbing soapy lather all over a man's nude body in the shower with a soapy loofah, water streaming out of the showerhead onto their nude bodies" },
    { label: "Doorway Pose — foot on frame, knee near face", value: "standing in a bedroom doorway. {possessive} back is against one side of the door frame, and one of {possessive} feet is elevated to eye-level and the sole of {possessive} shoe is pressing against the opposite door frame, putting {possessive} knee close to {possessive} face." },
    { label: "Doorway Pose (Just Standing)", value: "standing in a bedroom doorway." },
    { label: "Forward Lean (hands on knees) - facing back, ass toward camera", value: "standing, facing away from the camera, leaning forward, {possessive} ass toward the camera, hands on {possessive} knees, looking back at the camera, legs straight, knees locked" },
    { label: "Reclining back - resting on elbow, other hand touching crotch", value: "lying on {possessive} side, with the top leg bent high, hand lightly between {possessive} thighs" },
    { label: "Morning Stretch", value: "standing, mid-stretch reaching both arms overhead while rising up on {possessive} toes, hands in {possessive} hair, back arched, chest pressed forward, shoulders pulled back." },
    { label: "Lying in a Windowsill", value: "lying on {possessive} stomach on a sunlit windowsill, chin resting on {possessive} hands, legs bent at the knees and crossed at the ankles in the air" },
    { label: "Lying on a Couch (Foot on Backrest)", value: "lying on {possessive} back on a sofa, one leg hooked over the backrest, other foot on the floor" },
    { label: "Lying on a Couch (Foot on Armrest)", value: "lying on {possessive} back on a sofa, one leg resting on opposite armrest, other foot on the floor" },
    { label: "On Knees, Ass Spread", value: "{subjectPronoun} is on {possessive} knees facing away, looking back over {possessive} shoulder while reaching back to spread {possessive} ass cheeks apart" },
    { label: "Kneeling in Front of a Fireplace - wearing pearls and heels", value: "kneeling on a soft rug in front of a fireplace, hands on {possessive} thighs, chest pushed forward, wearing a long pearl necklace and high heels" },
    { label: "On All Fours", value: "on all fours, head turned to the side, back arched hard, ass toward the camera" },
    { label: "Crawling Toward Camera", value: "crawling toward the camera on all fours" },
    { label: "Leaning over Counter in Kitchen - in an Apron", value: "standing, leaning over a kitchen counter, resting on elbows, ass pushed out, looking back at camera, wearing only a tiny apron." },
    { label: "Bathroom Mirror Selfie", value: "taking a selfie in a bathroom mirror" },
    { label: "Full-Length Mirror Reflection (standing)", value: "standing in front of a full-length mirror while pulling {possessive} hair up" },
    { label: "Full-Length Mirror Reflection (sitting)", value: "sitting in front of a full-length mirror looking at {possessive} reflection" },
    { label: "Applying Lipstick in a Bathroom", value: "standing in a bathroom, leaning over the counter, close to the mirror, applying deep red lipstick. Facing away from the camera." },
    { label: "Shy, in a Doorway", value: "standing in a bedroom doorway, {subjectPronoun} is touching {possessive} index finger to {possessive} bottom lip with a shy embarrassed smile and biting {possessive} bottom lip. {possessive} legs are crossed and {possessive} free hand is above {possessive} head touching the door frame." },
    { label: "Leaning against Glass Door on a Balcony", value: "leaning against a glass door on the balcony of a third-floor Manhattan apartment. {possessive} legs are crossed and {subjectPronoun} is smoking a cigarette, blowing the smoke up into the air." }
];

// =========================================
// MODULAR POSE SWITCHES
// =========================================

const actionGroups = [
    {
        title: "Position",
        description: "Pose setup choices",
        presets: [
            "standing",
            "standing in a doorway",
            "sitting",
            "laying",
            "on {possessive} back",
            "on {possessive} side",
            "facedown",
            "on a bed",
            "on a thick carpeted floor",
            "on {possessive} hands and knees",
            "crawling toward the camera",
            "{possessive} butt at the edge of the bed",
            "{possessive} face in the foreground"
        ]
    },
    {
        title: "Sexual Positions",
        description: "Sexual positions",
        type: "menu",
        placeholder: "No signature pose selected",
        presets: [
            {
                label: "Cowgirl (leaning back)",
                value: "straddling a nude man, riding him in cowgirl position, leaning back, his penis is deep inside {possessive}"
            },
            {
                label: "Cowgirl (leaning forward)",
                value: "straddling a nude man, riding him in cowgirl position, leaning forward with her arms in front of her, his penis is deep inside {possessive}"
            },
            {
                label: "Blowjob",
                value: "between a nude man's legs, giving him a passionate blowjob, his penis deep inside {possessive} mouth, sucking the penis, sunken cheeks"
            },
            {
                label: "Missionary (POV)",
                value: "POV, hovering on top of a nude woman in missionary position, looking down at {objectPronoun} as {subjectPronoun} lies on {possessive} back beneath the camera with {possessive} legs spread, his penis deep inside {possessive}"
            },
            {
                label: "Missionary (Landscape)",
                value: "a man is hovering on top of a nude woman in missionary position, looking down at {objectPronoun} as {subjectPronoun} lies on {possessive} back beneath him with {possessive} legs spread, his penis deep inside {possessive}"
            },
            {
                label: "Doggystyle",
                value: "of the {personNoun} on all fours and a man is behind {possessive}. His penis is deep inside {possessive}."
            },
            {
                label: "Intimate Embrace",
                value: "looking at a man and {personNoun}, both nude, locked in a passionate embrace with their arms and legs intertwined, exploring each other's bodies."
            },
            {
                label: "Reverse Cowgirl (Portrait)",
                value: "of a nude {personNoun} straddling a man in reverse cowgirl position, facing away from him with {possessive} back to the camera, riding him, his penis deep inside {possessive}"
            },
            {
                label: "Spooning (Portrait)",
                value: "lying on {possessive} side with a man pressed behind {objectPronoun} in spooning position, his penis deep inside {possessive} from behind"
            },
            {
                label: "Standing, Face-to-Face (Portrait)",
                value: "a nude {personNoun} stands face-to-face with a man, one leg lifted and wrapped around his waist, pressed against him, his penis deep inside {possessive}"
            },
            {
                label: "69",
                value: "a nude {personNoun} and a man lying in opposite directions, feet to head, together in a 69 position, each pleasuring the other orally at the same time. His head is between {possessive} legs."
            },
            {
                label: "Cunnilingus (From Above, Portrait)",
                value: "High-angle. She's laying on her back with her legs spread wide. A man is kneeling between her spread legs, looking up at her while performing oral sex on her, her head tilted back in pleasure"
            },
            {
                label: "Legs-on-Shoulders Missionary",
                value: "lying on her back with her legs raised high and resting on the shoulders of a man on his hands and knees hovering over {possessive}. The man is looking down at {possessive} as his penis is deep inside {possessive}"
            },
            {
                label: "Against the Wall",
                value: "a man presses a nude {personNoun} against a wall, both of {possessive} legs lifted around his waist, suspended in air as he holds {possessive} aloft. His penis is deep inside {possessive}"
            },
            {
                label: "Bent Over Counter/Table (Landscape)",
                value: "a nude {personNoun} bent over a counter with a man standing behind {objectPronoun}, hands braced on the surface, his penis deep inside {possessive} from behind"
            },
            {
                label: "Standing Doggystyle",
                value: "of a man standing behind a nude {personNoun} who is bent forward at the waist, hands braced on {possessive} knees, his penis deep inside {possessive} from behind"
            }
        ]
    },
    {
        title: "Legs",
        description: "Leg and body alignment",
        presets: [
            "legs straight",
            "legs elevated into the air",
            "feet elevated into the air",
            "knees locked",
            "knees bent",
            "one knee bent",
            "one leg raised",
            "one foot on the wall",
            "feet spread wide",
            "feet together",
            "feet crossed",
            "1 foot against door frame",
            "{possessive} ass high in the air",
            "back arched",
            "chest puffed out",
            "knees together",
            "shoulders back",
            "leaning forward",
            "bending at waist only"
        ]
    },
    {
        title: "Arms",
        description: "Hand and arm placement",
        presets: [
            "arms raised high above {possessive} head",
            "arms stretched out in front of {objectPronoun}",
            "hands clasped together",
            "on {possessive} elbows",
            "elbows resting on bed",
            "hands on hips",
            "hands on waist",
            "hands on breasts",
            "hands in hair",
            "hands on knees",
            "hands lightly touching upper chest area",
            "hands on ass",
            "hands spreading ass cheeks"
        ]
    },
    {
        title: "Gaze",
        description: "Looking and facing choices",
        presets: [
            "looking at camera",
            "looking away from camera",
            "looking off to the side",
            "looking down",
            "looking up",
            "looking over {possessive} shoulder",
            "head tilted to the side",
            "head turned to the side",
            "facing camera",
            "facing away from camera",
            "ass toward the camera",
            "eyes closed",
            "squinting"
        ]
    },
    {
        title: "Expression",
        description: "Face and expression",
        presets: ["lips parted", "smiling", "chin tilted up", "head tilted up", "head tilted down"]
    },
    {
        title: "Setting",
        description: "Scene and environment",
        presets: [
            { label: "in the shower", value: "in a walk-in shower, with wet hair and wet body, water cascading down {possessive} wet body" },
            "in a bedroom",
            "in a kitchen",
            "in the backseat of a car",
            "in a surgical theatre",
            "in a crowded city street",
            "in a glade",
            "on an office desk",
            "at a poolside",
            "on a beach at sunset",
            "in a nightclub",
            "in a hotel room",
            "on a rooftop at night",
            "in an elevator",
            "in a library",
            "in a locker room"
        ]
    }
];

// =========================================
// ART STYLE
// =========================================

const artStylePresets = [
    "photo",
    { label: "1940s Pinup", value: "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas" },
    { label: "Disney/Pixar Animation", value: "Disney-Pixar style animation with exaggerated features and expressions: large expressive eyes, small noses" },
    { label: "Claymation", value: "Claymation style, sculpted polymer clay figure, soft tactile texture, fingerprint details, handcrafted stop-motion aesthetic, tilt-shift depth of field" },
    { label: "Pop Art/Comic Book", value: "1960s Pop Art style, Roy Lichtenstein aesthetic, bold black ink outlines, sharp Ben-Day dots, vibrant primary colors, graphic retro comic illustration" },
    { label: "Modern Vector/Flat Illustration", value: "Sleek vector illustration, clean lines, minimalist shading, bold flat color palette, mid-century graphic poster art style" },
    { label: "Cyberpunk Anime/Cell-Shaded", value: "90s hand-drawn anime style, classic cell-shading, vibrant neon rim lighting, retro sci-fi aesthetic, detailed line art" },
    { label: "Vintage Pulp Fiction Cover", value: "1950s pulp magazine cover illustration, dramatic dramatic chiaroscuro lighting, painted gouache texture, vibrant retro paperback aesthetic" },
    { label: "Oil Painting/Impressionism", value: "Impressionist oil painting, thick impasto brushstrokes, textured canvas, dramatic lighting, rich paint texture in the style of John Singer Sargent" },
    { label: "Watercolors", value: "Soft watercolor painting, fluid ink wash, gentle color bleeding, painterly splatters, delicate lines on textured watercolor paper" },
    { label: "Papercraft/Layered Paper", value: "Layered papercraft illustration, laser-cut paper art, soft drop shadows, clean geometric depth, tactile paper texture" },
    { label: "3D Stylized Game Character", value: "Overwatch/Arcane stylized 3D render, smooth painted textures, dramatic cinematic lighting, semi-realistic proportions, clean character art" },
    { label: "Chibi/Kawaii 3D", value: "Chibi 3D figurine, oversized head, expressive shiny eyes, smooth vinyl toy finish, soft studio lighting" }
];

// =========================================
// CAMERA
// Perspective, framing, composition, and depth of field are all
// offered together in the "Camera" section so none of these lists
// go unused.
// =========================================

const cameraFramingPresets = [
    { label: "Head and shoulders", value: "head-and-shoulders framing" },
    { label: "Close-up", value: "close-up framing focused tightly on the subject" },
    { label: "Extreme close-up", value: "extreme close-up framing focused very tightly on specific facial or bodily details" },
    { label: "Chest-up", value: "chest-up framing" },
    { label: "Waist-up", value: "waist-up framing" },
    { label: "3/4 body", value: "three-quarter body framing" },
    { label: "Full body", value: "full-body framing with the entire subject visible" },
    { label: "Wide shot", value: "wide shot showing the subject and surrounding environment" },
    { label: "Environmental", value: "environmental portrait framing with the subject integrated into the surrounding scene" }
];

const cameraPerspectivePresets = [
    { label: "Candid", value: "candid" },
    { label: "Eye level", value: "natural eye-level perspective" },
    { label: "POV", value: "POV" },
    { label: "Low angle", value: "low-angle perspective looking upward toward the subject" },
    { label: "High angle", value: "high-angle perspective looking downward toward the subject" },
    { label: "Worm's-eye", value: "extreme low-angle worm's-eye perspective" },
    { label: "Bird's-eye", value: "high bird's-eye perspective looking down from above" },
    { label: "Side view", value: "side-view camera perspective" },
    { label: "3/4 view", value: "three-quarter camera perspective showing the subject from an oblique angle" },
    { label: "Wide-angle perspective", value: "pronounced wide-angle perspective with natural spatial exaggeration" },
    { label: "Compressed perspective", value: "compressed telephoto-style perspective with reduced apparent depth" },
    { label: "Over-the-Shoulder", value: "over-the-shoulder" },
    { label: "Dutch angle", value: "tilted dutch-angle perspective" },
    { label: "Drone/aerial shot", value: "aerial drone shot looking down from a significant height" },
    { label: "Overhead flat-lay", value: "directly overhead flat-lay perspective" }
];

const depthOfFieldPresets = [
    { label: "Deep focus", value: "deep depth of field with the subject and environment clearly in focus" },
    { label: "Moderate", value: "moderate depth of field with gentle background separation" },
    { label: "Shallow", value: "shallow depth of field with the subject sharply focused against a softly blurred background" },
    { label: "Very shallow", value: "very shallow depth of field with strong background blur and pronounced subject isolation" }
];

const cameraCompositionPresets = [
    { label: "Centered", value: "centered composition" },
    { label: "Rule of thirds", value: "rule-of-thirds composition" },
    { label: "Symmetrical", value: "symmetrical composition with balanced visual elements" },
    { label: "Off-center", value: "off-center composition with intentional visual balance" },
    { label: "Negative space", value: "composition using deliberate negative space around the subject" },
    { label: "Leading lines", value: "composition using leading lines to draw attention toward the subject" },
    { label: "Foreground framing", value: "composition using foreground elements to naturally frame the subject" },
    { label: "Dynamic diagonal", value: "dynamic diagonal composition creating a sense of movement and visual energy" },
    { label: "Motion blur", value: "dynamic motion blur conveying movement and energy" }
];

// All camera-related pick lists combined into one flat menu of options,
// since the UI only exposes a single "Camera" picker per slot.
const cameraOptionsPresets = [
    ...cameraPerspectivePresets,
    ...cameraFramingPresets,
    ...cameraCompositionPresets,
    ...depthOfFieldPresets
];

// =========================================
// LIGHTING
// =========================================

const timeOfDayPresets = [
    { label: "Daytime", value: "natural daytime illumination" },
    { label: "Midday", value: "bright midday sunlight with a high sun" },
    { label: "Late afternoon", value: "warm late-afternoon sunlight with moderately long shadows" },
    { label: "Early evening", value: "early-evening light transitioning from daylight toward dusk" },
    { label: "Golden hour", value: "warm golden-hour sunlight, low-angle sun and long soft shadows" },
    { label: "Blue hour", value: "cool blue-hour ambient light shortly after sunset" },
    { label: "Nighttime", value: "nighttime illumination with dark ambient surroundings" },
    { label: "Overcast day", value: "soft overcast daylight with broad, diffused illumination" },
    { label: "Dawn", value: "soft early-morning dawn light" },
    { label: "Dusk", value: "soft dusk light with fading daylight and cool ambient tones" }
];

const naturalLightingPresets = [
    { label: "Direct sunlight", value: "direct harsh sunlight with hard shadows" },
    { label: "Overcast/soft daylight", value: "diffused daylight with soft ambient light" },
    { label: "Window daylight", value: "soft window light with indoor natural lighting" },
    { label: "Curtains/sheers", value: "sunlight filtered through sheer curtains, creating soft diffused window light" },
    { label: "Golden hour rays", value: "warm sunbeams, golden hour light, and subtle volumetric glow" },
    { label: "Moonlight/night", value: "cool moonlight with deep night ambience" },
    { label: "Urban night (street/neon)", value: "neon glow, street lamp lighting, and urban night atmosphere" },
    { label: "Warm flame (candle/fire)", value: "warm candlelight glow and fireplace ambient light" },
    { label: "Practical lamps (indoor lamps)", value: "warm practical lamp lighting and interior ambient lights" }
];

const lightingDirectionPresets = [
    { label: "Soft light", value: "soft flattering illumination with gentle shadows" },
    { label: "Hard light", value: "hard directional illumination with crisp defined shadows" },
    { label: "Front lighting", value: "frontal lighting illuminating the subject evenly" },
    { label: "Side lighting", value: "directional side lighting emphasizing form and dimensionality" },
    { label: "Backlighting", value: "strong backlighting with the main light positioned behind the subject" },
    { label: "Rim lighting", value: "bright rim lighting outlining the edges of the subject and separating the subject from the background" },
    { label: "Overhead lighting", value: "directional overhead lighting from above the subject" },
    { label: "Underlighting", value: "dramatic low-angle lighting from below the subject" }
];

const lightingStylePresets = [
    { label: "Neutral and Natural (soft directional light, balanced exposure, and ambient fill)", value: "soft directional light, balanced exposure, and ambient fill" },
    { label: "Dramatic Contrast (low-key lighting, chiaroscuro, and deep shadows)", value: "low-key lighting, chiaroscuro, and deep shadows" },
    { label: "Atmospheric Rays (volumetric light, god rays, and hazy atmosphere)", value: "volumetric light, god rays, and hazy atmosphere" },
    { label: "Cinematic Blockbuster (cinematic lighting, teal-and-orange color grade, and rim lighting)", value: "cinematic lighting, teal-and-orange color grade, and rim lighting" },
    { label: "Sun Dappled (dappled sunlight, soft shadows, and warm natural light)", value: "dappled sunlight, soft shadows, and warm natural light" }
];

const colorTreatmentPresets = [
    { label: "Black & white", value: "black-and-white monochrome treatment" },
    { label: "Sepia", value: "sepia-toned treatment" },
    { label: "High-contrast noir", value: "high-contrast noir-style treatment" },
    { label: "Soft monochrome", value: "soft monochrome treatment" },
    { label: "1970s Polaroid", value: "1970s Polaroid film aesthetic with warm tones, soft contrast, and instant-photo color drift" },
    { label: "1940s Kodachrome", value: "1940s Kodachrome-inspired color treatment with rich saturated tones, gentle contrast, and nostalgic vintage color rendering" },
    { label: "1960s slide film", value: "1960s slide film aesthetic with vibrant saturated colors, slightly warm highlights, and crisp vintage transparency look" },
    { label: "1950s magazine print", value: "1950s magazine-print color treatment with polished glossy tones, soft bloom, and clean mid-century editorial color balance" },
    { label: "1980s VHS", value: "1980s VHS aesthetic with slightly washed-out color, magnetic noise, analog softness, and retro cassette-era warmth" },
    { label: "1930s Agfacolor", value: "1930s Agfacolor-inspired treatment with slightly muted early color film tones and classic pre-war photographic softness" },
    { label: "1970s Technicolor", value: "1970s Technicolor-inspired treatment with saturated cinematic color, rich contrast, and glossy studio-film look" },
    { label: "2000s disposable camera", value: "2000s disposable-camera aesthetic with soft focus, slight color cast, and nostalgic point-and-shoot film imperfections" },
    { label: "1990s Fuji film", value: "1990s Fuji film-inspired treatment with smooth color transitions, slightly warm highlights, and clean nostalgic analog tone" },
    { label: "1960s Eastmancolor", value: "1960s Eastmancolor-inspired treatment with rich yet soft color, gentle contrast, and mid-century studio warmth" },
    { label: "1980s neon synthwave film", value: "1980s neon synthwave film treatment with vivid synthetic colors, glossy contrast, and retro-futurist glow" },
    { label: "1950s Anscochrome", value: "1950s Anscochrome-inspired treatment with soft pastel tones, slightly hazy color, and warm editorial sweetness" }
];

// =========================================
// UI HELPERS
// =========================================

function sectionTitle(prefix, ...parts) {
    return [prefix, ...parts].join(" • ");
}

function addPresetSwitchSection(fields, title, description, presets, colorMenu = false) {
    const controls = [];
    if (colorMenu) {
        controls.push(this.menu(NONE_SELECTED, menuWithPlaceholder("Choose color (optional)", clothingColorPresets)));
        controls.push(this.textField("", "Custom color / fabric (optional)", false, 30));
    }
    controls.push(...presetSwitches.call(this, presets));
    fields.push(this.section(title, description, controls));
}

function addPresetMenuSection(fields, title, description, presets, placeholder) {
    fields.push(this.section(
        title,
        description,
        [this.menu(NONE_SELECTED, menuWithPlaceholder(placeholder, presets))]
    ));
}

// Adds one section per group in `groups`, each named
// "<titlePrefix> • <group.title>".
function addGroupedSections(fields, titlePrefix, groups) {
    for (const group of groups) {
        if (group.type === "menu") {
            addPresetMenuSection.call(
                this,
                fields,
                sectionTitle(titlePrefix, group.title),
                group.description,
                group.presets,
                group.placeholder || "No option selected"
            );
            continue;
        }

        addPresetSwitchSection.call(
            this,
            fields,
            sectionTitle(titlePrefix, group.title),
            group.description,
            group.presets,
            Boolean(group.hasColorMenu)
        );
    }
}

// =========================================
// STEP 1 — BATCH SETUP
// =========================================

const setup = requestFromUser("Batch Setup", "Continue", function () {
    const countOptions = (unitSingular, unitPlural) =>
        [1, 2, 3, 4, 5].map(n => `${n} ${n === 1 ? unitSingular : unitPlural}`);

    return [
        this.section(
            "❖  Model Selection",
            "Choose which model(s) to generate with. Selecting both generates one image per model for each prompt.",
            MODEL_OPTIONS.map(option => this.switch(option.label === "Krea 2", option.label))
        ),
        this.section(
            "❖  Randomization Mode",
            "When enabled, every category is randomized from all available selections. Any option you manually select on the next screen is kept — everything left unselected is picked at random. Each image is one random combination.",
            [
                this.switch(false, "🎲  Enable Randomization Mode"),
                this.menu(2, ["1 image", "2 images", "3 images", "4 images", "5 images", "10 images", "15 images", "20 images", "25 images", "50 images"])
            ]
        ),
        this.section(
            "❖  Prompt Enhancement",
            "Refine each constructed prompt with a local language model before the review screen. The enhancer preserves your subject, clothing, pose, camera, and lighting choices while improving flow and visual specificity. The review screen will show the enhanced prompts.",
            [this.switch(true, "Enhance prompts for Krea 2 (Qwen 3.5 4B)")]
        ),
        this.section(
            "❖  Batch Configurations",
            "Define how many variants to generate per batch (ignored in Randomization Mode — one random slot of each is used instead)",
            [
                this.menu(NONE_SELECTED, countOptions("Subject", "Subjects")),
                this.menu(NONE_SELECTED, countOptions("Outfit", "Outfits")),
                this.menu(NONE_SELECTED, countOptions("Action", "Actions")),
                this.menu(NONE_SELECTED, countOptions("Camera Angle", "Camera Angles")),
                this.menu(NONE_SELECTED, countOptions("Art Style", "Art Styles")),
                ...ASPECT_OPTIONS.map((option) => this.switch(false, option.label)),
                this.textField(
                    "Select one or more aspect ratios. Each checked ratio will generate a separate image set.",
                    "Aspect ratios",
                    true,
                    100
                )
            ]
        )
    ];
});

const modelSelections = setup[0];
const randomizationData = setup[1];
const randomizeEnabled = randomizationData[0] === true;
const RANDOM_IMAGE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50];
const randomImageCount = RANDOM_IMAGE_COUNT_OPTIONS[Math.max(0, randomizationData[1])] || 3;
const enhancementEnabled = setup[2] && setup[2][0] === true;
const setupData = setup[3];

// If neither model is selected, fall back to Krea 2 so the batch still runs.
const modelsToRun = MODEL_OPTIONS.filter((_, index) => modelSelections[index] === true);
if (modelsToRun.length === 0) {
    modelsToRun.push(MODEL_OPTIONS[1]);
}

const subjectCount = randomizeEnabled ? 1 : setupData[0] + 1;
const outfitCount = randomizeEnabled ? 1 : setupData[1] + 1;
const actionCount = randomizeEnabled ? 1 : setupData[2] + 1;
const cameraCount = randomizeEnabled ? 1 : setupData[3] + 1;
const artStyleCount = randomizeEnabled ? 1 : setupData[4] + 1;
const aspectSelections = setupData.slice(5, 5 + ASPECT_OPTIONS.length);

function getSelectedAspectOptions(selections) {
    const rawSelections = Array.isArray(selections)
        ? selections
        : ASPECT_OPTIONS.map((_, index) => index === Number(selections));

    const selectedOptions = ASPECT_OPTIONS.filter((_, index) => rawSelections[index] === true);

    return selectedOptions.length > 0 ? selectedOptions : [ASPECT_OPTIONS[0]];
}

// =========================================
// STEP 2 — INPUT SCREEN
// =========================================

const inputs = requestFromUser("Batch Prompts", "Generate", function () {
    const fields = [];

    // -----------------------------------------
    // SUBJECTS
    // -----------------------------------------
    for (let i = 0; i < subjectCount; i++) {
        const subjectPrefix = `❖  SUBJECT ${i + 1}`;

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Celebrity/Character Presets"),
            "Optional celebrity-inspired and character presets",
            [this.menu(NONE_SELECTED, menuWithPlaceholder("No celebrity/character preset selected", celebrityPresets))]
        ));

        if (i === 0) {
            // -----------------------------------------
            // PROMPT OPTIONS / TEMPLATE
            // -----------------------------------------
            fields.push(this.section(
                "❖  Prompt Options & Template",
                randomizeEnabled
                    ? "Pick an art style manually, or leave unselected to randomize. Customize the template with tags."
                    : "Choose up to 5 art styles and customize the template with tags",
                [
                    ...Array.from({ length: artStyleCount }, (_, idx) =>
                        this.menu(
                            (!randomizeEnabled && idx === 0) ? findPresetMenuIndex(artStylePresets, DEFAULT_PROMPT_FALLBACKS.artStyle) : NONE_SELECTED,
                            menuWithPlaceholder(randomizeEnabled ? "🎲 Random art style (or pick one)" : "No art style selected", artStylePresets)
                        )
                    ),
                    this.textField(
                        "A {descriptor} {artStyle} of {gender}, {nationality}, {action}, {description}. {subjectPronoun} is wearing {clothing}. {timeOfDay}, {lighting}. Natural anatomy",
                        "Prompt Template — tags: {descriptor}, {artStyle}, {gender}, {nationality}, {description}, {action}, {clothing}, {timeOfDay}, {lighting}, {colorTreatment}, {subjectPronoun}, {objectPronoun}, {possessive}, {reflexive}, {personNoun}.",
                        false,
                        80
                    )
                ]
            ));

            // -----------------------------------------
            // CAMERA
            // -----------------------------------------
            fields.push(this.section(
                "❖  CAMERA • Options",
                randomizeEnabled
                    ? "Pick a camera angle/framing/composition manually, or leave unselected to randomize"
                    : `Choose up to ${cameraCount} camera angles, framings, compositions, or depth-of-field looks`,
                Array.from({ length: cameraCount }, () =>
                    this.menu(
                        NONE_SELECTED,
                        menuWithPlaceholder(randomizeEnabled ? "🎲 Random camera option (or pick one)" : "No camera option selected", cameraOptionsPresets)
                    )
                )
            ));

            // -----------------------------------------
            // MOOD / AESTHETIC / HISTORICAL MEDIA
            // -----------------------------------------
            fields.push(this.section(
                "❖  Mood / Aesthetic / Historical Media",
                randomizeEnabled
                    ? "Pick a treatment manually, or leave unselected for none (not randomized — often overpowering)"
                    : "Optional monochrome, film, or stylized aesthetic treatment controls",
                [this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "None (or pick one)" : "No mood/aesthetic/historical media selected", colorTreatmentPresets))]
            ));
        }

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Identity"),
            randomizeEnabled
                ? "Manually pin any trait, or leave unselected to randomize it"
                : "Gender, ethnicity, age, skin tone, and eye color",
            [
                this.menu(
                    randomizeEnabled ? NONE_SELECTED : findPresetMenuIndex(genderPresets, "woman"),
                    menuWithPlaceholder(randomizeEnabled ? "🎲 Random gender (or pick one)" : "Choose gender", genderPresets)
                ),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random nationality (or pick one)" : "Choose nationality / ethnicity", nationalityPresets)),
                randomizeEnabled
                    ? this.menu(NONE_SELECTED, menuWithPlaceholder("🎲 Random age (or pick one)", agePresets))
                    : this.menu(agePresets.indexOf("30 years old"), agePresets),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random skin tone (or pick one)" : "Choose skin tone", skinTonePresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random eye color (or pick one)" : "Choose eye color", eyeColorPresets))
            ]
        ));

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Body / Physique"),
            randomizeEnabled
                ? "Manually pin any characteristic, or leave unselected to randomize it"
                : "Choose independent characteristics to control the subject's overall proportions and silhouette",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random build (or pick one)" : "No overall build selected", overallBuildPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random height (or pick one)" : "No height selected", heightPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random chest (or pick one)" : "No chest description", chestPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random hips (or pick one)" : "No hip description", hipPresets)),
                this.menu(NONE_SELECTED, presetLabels(bodyShapePresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random legs (or pick one)" : "No leg description", legPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random ass size (or pick one)" : "No ass size selected", assSizePresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random belly size (or pick one)" : "No belly size selected", bellySizePresets)),
                this.menu(NONE_SELECTED, presetLabels(specificBodyPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random lips (or pick one)" : "No lips description", lipsPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random eyelashes (or pick one)" : "No eyelashes description", eyelashPresets)),
                this.textField("", "Custom body details (always included)", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Appearance"), appearanceSwitchGroups);

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Hair", "Hair Type"),
            randomizeEnabled ? "Pick a hair texture manually, or leave unselected to randomize" : "Hair texture choices",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random hair type (or pick one)" : "No hair type", hairTypePresets)),
                this.textField("", "Custom hair type (always included)", false, 40)
            ]
        ));

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Hair"),
            randomizeEnabled
                ? "Pick hair color/length manually, or leave unselected to randomize. Custom text is always included."
                : "Hair color, length, hairstyle, and additional subject details",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random hair color (or pick one)" : "No hair color", hairColorPresets)),
                this.textField("", "Custom hair color (always included)", false, 40),
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random hair length (or pick one)" : "No hair length", hairLengthPresets)),
                this.textField("", "Custom hair length (always included)", false, 40),
                this.textField("", "Custom hairstyle (always included)", false, 40),
                this.textField("", "Additional subject details (always included)", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Hair"), hairstyleGroups);
        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Accessories"), accessoryGroups);
    }

    // -----------------------------------------
    // OUTFITS
    // -----------------------------------------
    for (let i = 0; i < outfitCount; i++) {
        const outfitPrefix = `❖  OUTFIT ${i + 1}`;

        fields.push(this.section(
            sectionTitle(outfitPrefix, "Preset"),
            randomizeEnabled
                ? "Pick a preset or enter custom text, or leave both empty to randomize clothing from all categories"
                : "Choose a preset or add custom outfit text",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random outfit (or pick one)" : "No clothing selected", clothingPresets)),
                this.textField("", "Custom outfit description (always included)", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, outfitPrefix, clothingGroups);
    }

    // -----------------------------------------
    // ACTIONS / POSES
    // -----------------------------------------
    for (let i = 0; i < actionCount; i++) {
        const actionPrefix = `❖  ACTION / POSE ${i + 1}`;

        fields.push(this.section(
            sectionTitle(actionPrefix, "Preset"),
            randomizeEnabled
                ? "Pick a pose preset or enter custom text, or leave both empty to randomize the pose from all categories"
                : "Choose a preset or add custom pose text",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random pose preset (or pick one)" : "No pose preset selected", complexActionPresets)),
                this.textField("", "Custom action / pose modifier (always included)", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, actionPrefix, actionGroups);
    }

    // -----------------------------------------
    // LIGHTING
    // -----------------------------------------
    fields.push(this.section(
        "❖  LIGHTING • Time of Day",
        randomizeEnabled
            ? "Pick a time of day manually, or leave unselected to randomize"
            : "Choose the environmental time and quality of ambient light",
        [this.menu(
            randomizeEnabled ? NONE_SELECTED : findPresetMenuIndex(timeOfDayPresets, DEFAULT_PROMPT_FALLBACKS.timeOfDay),
            menuWithPlaceholder(randomizeEnabled ? "🎲 Random time of day (or pick one)" : "No time of day selected", timeOfDayPresets)
        )]
    ));

    fields.push(this.section(
        "❖  LIGHTING • Natural / Environmental",
        randomizeEnabled
            ? "Pick a light source manually, or leave unselected to randomize"
            : "Select a natural or environmental light source",
        [this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random light source (or pick one)" : "No natural/environmental lighting selected", naturalLightingPresets))]
    ));
    fields.push(this.section(
        "❖  LIGHTING • Direction",
        randomizeEnabled
            ? "Pick a direction manually, or leave unselected to randomize"
            : "Choose the main quality and direction of the light",
        [this.menu(NONE_SELECTED, menuWithPlaceholder(randomizeEnabled ? "🎲 Random direction (or pick one)" : "No lighting direction selected", lightingDirectionPresets))]
    ));
    fields.push(this.section(
        "❖  LIGHTING • Style / Balance",
        randomizeEnabled
            ? "Pick a style manually, or leave unselected to randomize"
            : "Choose a lighting style that combines color and balance for the scene",
        [this.menu(
            randomizeEnabled ? NONE_SELECTED : findPresetMenuIndex(lightingStylePresets, DEFAULT_PROMPT_FALLBACKS.lighting),
            menuWithPlaceholder(randomizeEnabled ? "🎲 Random lighting style (or pick one)" : "No lighting style selected", lightingStylePresets)
        )]
    ));

    return fields;
});

// =========================================
// STEP 3 — PARSE INPUTS
// =========================================

let sectionIdx = 0;

function nextSection() {
    const value = inputs[sectionIdx++];
    if (!Array.isArray(value)) {
        throw new Error(`Input parsing sanity check failed: section ${sectionIdx - 1} was not returned as an array.`);
    }
    return value;
}

// Reads the next N sections, each a group of switches, and returns
// every selected preset value flattened into one array. Used for the
// appearance / hairstyle / accessory / clothing / action switch groups,
// which all share this exact shape.
function parseGroupedSwitches(groups) {
    const values = [];
    for (const group of groups) {
        const data = nextSection();

        if (group.type === "menu") {
            const value = selectedValueWithPlaceholder(data[0], group.presets);
            if (value) values.push(value);
            continue;
        }

        if (group.hasColorMenu) {
            const selectedColor = selectedValueWithPlaceholder(data[0], clothingColorPresets);
            const customColor = typeof data[1] === "string" ? data[1].trim() : "";
            const activeColor = customColor || selectedColor;

            const switchData = data.slice(2);
            const selectedItems = selectedSwitchValues(switchData, group.presets);

            for (const item of selectedItems) {
                values.push(applyClothingColor(item, activeColor));
            }
            continue;
        }

        values.push(...selectedSwitchValues(data, group.presets));
    }
    return values;
}

// =========================================
// GENDER SYSTEM
// =========================================

const GENDER_TERMS = {
    masculine: { subject: "he", object: "him", possessive: "his", reflexive: "himself", noun: "man" },
    feminine: { subject: "she", object: "her", possessive: "her", reflexive: "herself", noun: "woman" },
    neutral: { subject: "they", object: "them", possessive: "their", reflexive: "themselves", noun: "person" }
};

function getGenderForm(gender) {
    if (/\b(man|male)\b/i.test(gender)) return "masculine";
    if (/\b(woman|female)\b/i.test(gender)) return "feminine";
    return "neutral";
}

function replaceToken(text, token, replacement) {
    return text.replace(new RegExp(`\\{${token}\\}`, "gi"), replacement);
}

// Fills the explicit gender/pronoun tags ({subjectPronoun}, {possessive},
// etc.) used throughout the pose and action presets. This only touches
// the named template tags — it deliberately does NOT do blind word-level
// substitution of "he"/"she"/"{possessive}"/etc. across the whole prompt, since
// that risked mangling custom free-text fields and preset wording that
// happened to contain those words for unrelated reasons.
function applyGenderTerms(prompt, genderForm) {
    const forms = GENDER_TERMS[genderForm] || GENDER_TERMS.neutral;

    const tokenValues = {
        subjectPronoun: forms.subject,
        objectPronoun: forms.object,
        possessive: forms.possessive,
        reflexive: forms.reflexive,
        personNoun: forms.noun
    };

    let result = prompt;
    for (const token in tokenValues) {
        result = replaceToken(result, token, tokenValues[token]);
    }
    return result;
}

// =========================================
// SUBJECT PARSING
// =========================================

const subjects = [];
const subjectLeadTexts = [];
const subjectDetailTexts = [];
const subjectGenderTexts = [];
const subjectNationalityTexts = [];
const subjectGenderForms = [];

let cameraChoices = [];
let colorTreatmentText = "";
let artStyles = [];
let promptTemplate = "";

// Randomization Mode: captured user picks (empty = randomize per image).
// The subject's concrete traits are resolved per-image in the
// randomization engine instead of being flattened here.
let randomSubjectConfig = null;

for (let i = 0; i < subjectCount; i++) {
    const subjectParts = [];

    // --- Identity ---
    const celebrityData = nextSection();
    const celebrity = selectedValueWithPlaceholder(celebrityData[0], celebrityPresets);

    if (i === 0) {
        // --- Prompt Options & Template ---
        const templateData = nextSection();
        artStyles = Array.from({ length: artStyleCount }, (_, index) =>
            selectedValueWithPlaceholder(templateData[index], artStylePresets)
        ).filter(Boolean);
        promptTemplate = templateData[artStyleCount] || "";

        // --- Camera Options ---
        const cameraData = nextSection();
        cameraChoices = Array.from({ length: cameraCount }, (_, index) =>
            selectedValueWithPlaceholder(cameraData[index], cameraOptionsPresets)
        ).filter(Boolean);

        // --- Mood / Aesthetic / Historical Media ---
        const colorTreatmentData = nextSection();
        colorTreatmentText = selectedValueWithPlaceholder(colorTreatmentData[0], colorTreatmentPresets);
    }

    const identityData = nextSection();
    const gender = selectedValueWithPlaceholder(identityData[0], genderPresets);
    const nationality = selectedValueWithPlaceholder(identityData[1], nationalityPresets);
    // In random mode the age menu has a placeholder (index 0 = randomize);
    // in manual mode every index maps directly to a preset.
    const age = randomizeEnabled
        ? selectedValueWithPlaceholder(identityData[2], agePresets)
        : selectedValueNoPlaceholder(identityData[2], agePresets);
    const skin = selectedValueWithPlaceholder(identityData[3], skinTonePresets);
    const eyeColor = selectedValueWithPlaceholder(identityData[4], eyeColorPresets);

    // --- Body / Physique ---
    const bodyData = nextSection();

    const pinnedBuild = selectedValueWithPlaceholder(bodyData[0], overallBuildPresets);
    const pinnedHeight = selectedValueWithPlaceholder(bodyData[1], heightPresets);
    const pinnedChest = selectedValueWithPlaceholder(bodyData[2], chestPresets);
    const pinnedHips = selectedValueWithPlaceholder(bodyData[3], hipPresets);
    const pinnedBodyShape = selectedValueNoPlaceholder(bodyData[4], bodyShapePresets);
    const pinnedLegs = selectedValueWithPlaceholder(bodyData[5], legPresets);
    const pinnedAssSize = selectedValueWithPlaceholder(bodyData[6], assSizePresets);
    const pinnedBellySize = selectedValueWithPlaceholder(bodyData[7], bellySizePresets);
    const pinnedSpecificBody = selectedValueNoPlaceholder(bodyData[8], specificBodyPresets);
    const pinnedLips = selectedValueWithPlaceholder(bodyData[9], lipsPresets);
    const pinnedEyelashes = selectedValueWithPlaceholder(bodyData[10], eyelashPresets);
    const customBodyDetails = typeof bodyData[11] === "string" ? bodyData[11].trim() : "";

    // --- Appearance switch groups ---
    const appearanceValues = parseGroupedSwitches(appearanceSwitchGroups);

    // --- Hair Type ---
    const hairTypeData = nextSection();
    const pinnedHairType = selectedValueWithPlaceholder(hairTypeData[0], hairTypePresets);
    const customHairType = typeof hairTypeData[1] === "string" ? hairTypeData[1].trim() : "";

    // --- Hair ---
    const hairData = nextSection();
    let hairIdx = 0;
    const hairColorIndex = hairData[hairIdx++];
    const customHairColor = typeof hairData[hairIdx++] === "string" ? hairData[hairIdx - 1].trim() : "";
    const pinnedHairColor = selectedValueWithPlaceholder(hairColorIndex, hairColorPresets);

    const hairLengthIndex = hairData[hairIdx++];
    const customHairLength = typeof hairData[hairIdx++] === "string" ? hairData[hairIdx - 1].trim() : "";
    const pinnedHairLength = selectedValueWithPlaceholder(hairLengthIndex, hairLengthPresets);

    const customHairstyle = typeof hairData[hairIdx++] === "string" ? hairData[hairIdx - 1].trim() : "";
    const hairstyleValues = parseGroupedSwitches(hairstyleGroups);

    const additionalDetails = typeof hairData[hairIdx++] === "string" ? hairData[hairIdx - 1].trim() : "";

    // --- Accessories ---
    const accessoryValues = parseGroupedSwitches(accessoryGroups);

    if (randomizeEnabled) {
        randomSubjectConfig = {
            celebrity, gender, nationality, age, skin, eyeColor,
            pinnedBuild, pinnedHeight, pinnedChest, pinnedHips, pinnedBodyShape,
            pinnedLegs, pinnedAssSize, pinnedBellySize, pinnedSpecificBody,
            pinnedLips, pinnedEyelashes, customBodyDetails,
            appearanceValues,
            pinnedHairType, customHairType,
            pinnedHairColor, customHairColor,
            pinnedHairLength, customHairLength,
            customHairstyle, hairstyleValues,
            additionalDetails, accessoryValues
        };
        break;
    }

    // -----------------------------------------
    // Manual mode: flatten everything now.
    // -----------------------------------------
    const genderForm = getGenderForm(gender);

    if (nationality) subjectParts.push(nationality);
    if (gender) subjectParts.push(gender);
    if (age) subjectParts.push(age);
    if (skin) subjectParts.push("with " + skin);
    if (eyeColor) subjectParts.push(eyeColor);
    if (celebrity) subjectParts.push(celebrity);

    const bodySelections = [
        [bodyData[0], overallBuildPresets],
        [bodyData[1], heightPresets],
        [bodyData[2], chestPresets],
        [bodyData[3], hipPresets],
        [bodyData[5], legPresets],
        [bodyData[6], assSizePresets],
        [bodyData[7], bellySizePresets],
        [bodyData[9], lipsPresets],
        [bodyData[10], eyelashPresets]
    ];

    for (const [index, presets] of bodySelections) {
        const value = selectedValueWithPlaceholder(index, presets);
        if (value) subjectParts.push(value);
    }

    if (pinnedBodyShape) subjectParts.push(pinnedBodyShape);
    if (pinnedSpecificBody) subjectParts.push(pinnedSpecificBody);
    if (customBodyDetails) subjectParts.push(customBodyDetails);

    subjectParts.push(...appearanceValues);

    const hairType = customHairType !== "" ? customHairType : pinnedHairType;
    const hairColor = customHairColor !== "" ? customHairColor : pinnedHairColor;
    const hairLength = customHairLength !== "" ? customHairLength : pinnedHairLength;
    const hairstyle = joinParts([...hairstyleValues, customHairstyle]);

    const hairColorText = hairColor
        ? (/\bhair\b/i.test(hairColor) ? hairColor : hairColor + " hair")
        : "";

    const hairDescription = joinParts([hairLength, hairType, hairstyle, hairColorText]);
    if (hairDescription) subjectParts.push(hairDescription);

    if (additionalDetails) subjectParts.push(additionalDetails);

    subjectParts.push(...accessoryValues);

    // --- Subject text variants ---
    const subjectLeadParts = [];
    if (nationality) subjectLeadParts.push(nationality);
    if (gender) subjectLeadParts.push(gender);

    const subjectDetailsParts = subjectParts.slice(subjectLeadParts.length);

    subjects.push(subjectParts.join(", "));
    subjectLeadTexts.push(subjectLeadParts.join(", "));
    subjectDetailTexts.push(subjectDetailsParts.join(", "));
    subjectGenderTexts.push(gender || "");
    subjectNationalityTexts.push(nationality || "");
    subjectGenderForms.push(genderForm);
}

// =========================================
// OUTFIT PARSING
// =========================================

const outfits = [];
let randomOutfitConfig = null;

for (let i = 0; i < outfitCount; i++) {
    const outfitMetaData = nextSection();
    const selectedOutfit = selectedValueWithPlaceholder(outfitMetaData[0], clothingPresets);
    const customOutfit = typeof outfitMetaData[1] === "string" ? outfitMetaData[1].trim() : "";
    const clothingGroupValues = parseGroupedSwitches(clothingGroups);

    if (randomizeEnabled) {
        randomOutfitConfig = { selectedOutfit, customOutfit, clothingGroupValues };
        break;
    }

    const outfitParts = [];
    if (selectedOutfit) outfitParts.push(selectedOutfit);
    if (customOutfit) outfitParts.push(customOutfit);
    outfitParts.push(...clothingGroupValues);

    outfits.push(joinParts(outfitParts));
}

// =========================================
// ACTION PARSING
// =========================================

const actions = [];
let randomActionConfig = null;

for (let i = 0; i < actionCount; i++) {
    const actionMetaData = nextSection();
    const selectedAction = selectedValueWithPlaceholder(actionMetaData[0], complexActionPresets);
    const customAction = typeof actionMetaData[1] === "string" ? actionMetaData[1].trim() : "";
    const actionGroupValues = parseGroupedSwitches(actionGroups);

    if (randomizeEnabled) {
        randomActionConfig = { selectedAction, customAction, actionGroupValues };
        break;
    }

    const actionParts = [];
    if (selectedAction) actionParts.push(selectedAction);
    if (customAction) actionParts.push(customAction);
    actionParts.push(...actionGroupValues);

    actions.push(joinParts(actionParts));
}

// =========================================
// LIGHTING PARSING
// =========================================

const timeOfDayData = nextSection();
const timeOfDay = selectedValueWithPlaceholder(timeOfDayData[0], timeOfDayPresets);

const lightingParts = [];

const naturalLightingData = nextSection();
const naturalLighting = selectedValueWithPlaceholder(naturalLightingData[0], naturalLightingPresets);
if (naturalLighting) lightingParts.push(naturalLighting);

const lightingDirectionData = nextSection();
const lightingDirection = selectedValueWithPlaceholder(lightingDirectionData[0], lightingDirectionPresets);
if (lightingDirection) lightingParts.push(lightingDirection);

const lightingStyleData = nextSection();
const lightingStyle = selectedValueWithPlaceholder(lightingStyleData[0], lightingStylePresets);
if (lightingStyle) lightingParts.push(lightingStyle);

const lighting = joinParts(lightingParts);

// =========================================
// CALCULATE DIMENSIONS
// =========================================

const selectedAspectOptions = getSelectedAspectOptions(aspectSelections);

// =========================================
// PROMPT HELPERS
// =========================================

function fillTemplate(template, values) {
    let result = template;
    for (const key in values) {
        result = result.replace(new RegExp(`\\{${key}\\}`, "gi"), values[key] || "");
    }
    return result;
}

function cleanPrompt(prompt) {
    return prompt
        .replace(/,\s*,/g, ",")
        .replace(/^\s*,\s*/g, "")
        .replace(/\s*,\s*$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function ensureTextContent(value, fallback) {
    const cleaned = typeof value === "string" ? cleanPrompt(value) : "";
    return cleaned || fallback;
}

const effectiveCameraChoices = cameraChoices.length > 0 ? cameraChoices : [DEFAULT_PROMPT_FALLBACKS.camera];

// =========================================
// RANDOMIZATION ENGINE
// =========================================
// Builds one random combination per image. Anything the user manually
// pinned on the input screen is kept; everything else is picked at
// random from the full preset lists.

// Returns a random index with `probability`, else -1.
function chance(probability) {
    return Math.random() < probability ? 0 : -1;
}

// Picks a random subset (0 to maxItems) of switch values from a group.
function randomGroupSwitchValues(presets, probability, maxItems) {
    if (chance(probability) < 0) return [];
    const count = 1 + randomInt(Math.max(1, maxItems));
    return randomSwitchValues(presets, count).filter(Boolean);
}

function randomColoredClothingValues(group, probability, maxItems) {
    if (chance(probability) < 0) return [];
    const count = 1 + randomInt(Math.max(1, maxItems));
    const items = randomSwitchValues(group.presets, count).filter(Boolean);
    // ~70% chance to apply a random color.
    const color = Math.random() < 0.7 ? randomPresetValue(clothingColorPresets) : "";
    return items.map(item => applyClothingColor(item, color));
}

function randomHairColorText() {
    const color = randomPresetValue(hairColorPresets);
    return /\bhair\b/i.test(color) ? color : color + " hair";
}

// Resolves one randomized subject from the pinned config.
function buildRandomSubject(cfg) {
    const parts = [];

    // --- Identity ---
    const nationality = cfg.nationality || randomPresetValue(nationalityPresets);
    const gender = cfg.celebrity ? "" : (cfg.gender || randomPresetValue(genderPresets));
    const age = cfg.celebrity ? "" : (cfg.age || randomElement(agePresets));
    const skin = cfg.skin || (Math.random() < 0.8 ? randomPresetValue(skinTonePresets) : "");
    const eyeColor = cfg.eyeColor || (Math.random() < 0.8 ? randomPresetValue(eyeColorPresets) : "");
    const genderForm = cfg.celebrity ? "feminine" : getGenderForm(gender);

    if (nationality) parts.push(nationality);
    if (gender) parts.push(gender);
    if (age) parts.push(age);
    if (skin) parts.push("with " + skin);
    if (eyeColor) parts.push(eyeColor);
    if (cfg.celebrity) parts.push(cfg.celebrity);

    // --- Body / Physique ---
    parts.push(cfg.pinnedBuild || randomPresetValue(overallBuildPresets));
    parts.push(cfg.pinnedHeight || (Math.random() < 0.5 ? randomPresetValue(heightPresets) : ""));
    parts.push(cfg.pinnedChest || (genderForm !== "masculine" && Math.random() < 0.8 ? randomPresetValue(chestPresets) : ""));
    parts.push(cfg.pinnedHips || (genderForm !== "masculine" && Math.random() < 0.8 ? randomPresetValue(hipPresets) : ""));
    parts.push(cfg.pinnedBodyShape || (Math.random() < 0.5 ? randomPresetValue(bodyShapePresets) : ""));
    parts.push(cfg.pinnedLegs || (Math.random() < 0.5 ? randomPresetValue(legPresets) : ""));
    parts.push(cfg.pinnedAssSize || (genderForm !== "masculine" && Math.random() < 0.8 ? randomPresetValue(assSizePresets) : ""));
    parts.push(cfg.pinnedBellySize || (Math.random() < 0.5 ? randomPresetValue(bellySizePresets) : ""));
    parts.push(cfg.pinnedSpecificBody || (Math.random() < 0.1 ? randomPresetValue(specificBodyPresets) : ""));
    parts.push(cfg.pinnedLips || (Math.random() < 0.4 ? randomPresetValue(lipsPresets) : ""));
    parts.push(cfg.pinnedEyelashes || (Math.random() < 0.3 ? randomPresetValue(eyelashPresets) : ""));
    if (cfg.customBodyDetails) parts.push(cfg.customBodyDetails);

    // --- Appearance ---
    parts.push(...cfg.appearanceValues);
    parts.push(...randomGroupSwitchValues(makeupPresets, 0.5, 2));
    parts.push(...randomGroupSwitchValues(makeupOdditiesPresets, 0.08, 1));
    parts.push(...randomGroupSwitchValues(facialHairPresets, genderForm === "masculine" ? 0.4 : 0, 1));
    parts.push(...randomGroupSwitchValues(nosePresets, 0.2, 1));
    parts.push(...randomGroupSwitchValues(tattooPresets, 0.3, 1));
    parts.push(...randomGroupSwitchValues(bodyHairPresets, 0.25, 2));
    parts.push(...randomGroupSwitchValues(nailPresets, genderForm === "masculine" ? 0.05 : 0.3, 1));
    parts.push(...randomGroupSwitchValues(hairDetailPresets, 0.05, 1));

    // --- Hair ---
    const hairType = cfg.customHairType || cfg.pinnedHairType || randomPresetValue(hairTypePresets);
    const hairColor = cfg.customHairColor || cfg.pinnedHairColor || randomHairColorText();
    const hairLength = cfg.customHairLength || cfg.pinnedHairLength || randomPresetValue(hairLengthPresets);
    const hairstyleParts = [...cfg.hairstyleValues];
    if (cfg.customHairstyle) hairstyleParts.push(cfg.customHairstyle);
    if (!cfg.customHairstyle && cfg.hairstyleValues.length === 0 && Math.random() < 0.6) {
        const allHairstyles = hairstyleGroups.flatMap(g => g.presets);
        hairstyleParts.push(randomPresetValue(allHairstyles));
    }
    const hairstyle = joinParts(hairstyleParts);

    const hairDescription = joinParts([hairLength, hairType, hairstyle, hairColor]);
    if (hairDescription) parts.push(hairDescription);

    if (cfg.additionalDetails) parts.push(cfg.additionalDetails);

    // --- Accessories ---
    parts.push(...cfg.accessoryValues);
    for (const group of accessoryGroups) {
        parts.push(...randomGroupSwitchValues(group.presets, 0.3, 1));
    }

    // --- Text variants (same shape as manual mode) ---
    const cleaned = parts.filter(p => p !== undefined && p !== null && p !== "");
    const leadParts = [];
    if (nationality) leadParts.push(nationality);
    if (gender) leadParts.push(gender);

    return {
        subject: cleaned.join(", "),
        subjectLead: leadParts.join(", "),
        subjectDetails: cleaned.slice(leadParts.length).join(", "),
        gender,
        nationality,
        genderForm
    };
}

// Resolves one randomized outfit.
function buildRandomOutfit(cfg) {
    const parts = [];

    if (cfg.selectedOutfit) {
        parts.push(cfg.selectedOutfit);
    } else {
        // ~15% chance to use one of the combined clothing presets.
        if (Math.random() < 0.15) {
            parts.push(randomPresetValue(clothingPresets));
        } else {
            for (const group of clothingGroups) {
                if (group.hasColorMenu) {
                    parts.push(...randomColoredClothingValues(group, 0.6, group.title === "Lingerie" ? 2 : 1));
                } else {
                    parts.push(...randomGroupSwitchValues(group.presets, 0.6, 1));
                }
            }
        }
    }

    if (cfg.customOutfit) parts.push(cfg.customOutfit);
    parts.push(...cfg.clothingGroupValues);

    return joinParts(parts);
}

// Resolves one randomized action/pose.
function buildRandomAction(cfg) {
    const parts = [];

    if (cfg.selectedAction) {
        parts.push(cfg.selectedAction);
    } else if (Math.random() < 0.3) {
        parts.push(randomPresetValue(complexActionPresets));
    }

    if (cfg.customAction) parts.push(cfg.customAction);
    parts.push(...cfg.actionGroupValues);

    for (const group of actionGroups) {
        if (group.type === "menu") {
            // Sexual Positions: rare unless explicitly pinned.
            if (chance(0.1) === 0) {
                parts.push(randomPresetValue(group.presets));
            }
            continue;
        }
        parts.push(...randomGroupSwitchValues(group.presets, 0.55, 2));
    }

    return joinParts(parts);
}

// =========================================
// BUILD FINAL PROMPTS
// =========================================

const finalPrompts = [];
const artStyleChoices = artStyles.length > 0 ? artStyles : [DEFAULT_PROMPT_FALLBACKS.artStyle];

if (randomizeEnabled) {
    // -----------------------------------------
    // RANDOM MODE: N random combinations, each
    // rendered at one random aspect ratio.
    // -----------------------------------------
    for (let imageIndex = 0; imageIndex < randomImageCount; imageIndex++) {
        const aspectOption = randomElement(selectedAspectOptions);
        const resolvedSubject = buildRandomSubject(randomSubjectConfig);

        const outfit = buildRandomOutfit(randomOutfitConfig);
        const action = buildRandomAction(randomActionConfig);
        const camera = cameraChoices.length > 0 ? randomElement(cameraChoices) : randomPresetValue(cameraOptionsPresets);
        const artStyle = artStyles.length > 0 ? randomElement(artStyles) : randomPresetValue(artStylePresets);

        const randomTimeOfDay = timeOfDay || randomPresetValue(timeOfDayPresets);
        const randomLighting = joinParts([
            naturalLighting || randomPresetValue(naturalLightingPresets),
            lightingDirection || randomPresetValue(lightingDirectionPresets),
            lightingStyle || randomPresetValue(lightingStylePresets)
        ]);

        const safeSubject = ensureTextContent(resolvedSubject.subject, DEFAULT_PROMPT_FALLBACKS.subject);
        const safeOutfit = ensureTextContent(outfit, DEFAULT_PROMPT_FALLBACKS.outfit);
        const safeAction = ensureTextContent(action, DEFAULT_PROMPT_FALLBACKS.action);
        const safeCamera = ensureTextContent(camera, DEFAULT_PROMPT_FALLBACKS.camera);
        const safeArtStyle = ensureTextContent(artStyle, DEFAULT_PROMPT_FALLBACKS.artStyle);
        const safeTimeOfDay = ensureTextContent(randomTimeOfDay, DEFAULT_PROMPT_FALLBACKS.timeOfDay);
        const safeLighting = ensureTextContent(randomLighting, DEFAULT_PROMPT_FALLBACKS.lighting);
        const safeColorTreatment = ensureTextContent(colorTreatmentText, "");

        const templateValues = {
            descriptor: joinParts([safeColorTreatment, safeCamera]),
            artStyle: safeArtStyle,
            camera: safeCamera,
            subject: safeSubject,
            subjects: safeSubject,
            gender: ensureTextContent(resolvedSubject.gender, ""),
            nationality: ensureTextContent(resolvedSubject.nationality, ""),
            subjectLead: ensureTextContent(resolvedSubject.subjectLead, ""),
            description: ensureTextContent(resolvedSubject.subjectDetails, ""),
            subjectDetails: ensureTextContent(resolvedSubject.subjectDetails, ""),
            clothing: safeOutfit,
            action: safeAction,
            timeOfDay: safeTimeOfDay,
            lighting: safeLighting,
            colorTreatment: safeColorTreatment
        };

        let constructedPrompt = fillTemplate(promptTemplate, templateValues);
        constructedPrompt = applyGenderTerms(constructedPrompt, resolvedSubject.genderForm);
        constructedPrompt = cleanPrompt(constructedPrompt);

        if (!constructedPrompt) {
            constructedPrompt = DEFAULT_PROMPT_FALLBACKS.genericPrompt;
        }

        finalPrompts.push({
            prompt: constructedPrompt,
            width: aspectOption.width,
            height: aspectOption.height,
            aspectLabel: aspectOption.label
        });
    }
} else {
    // -----------------------------------------
    // MANUAL MODE: cartesian product (v12 behavior).
    // -----------------------------------------
    for (const aspectOption of selectedAspectOptions) {
        for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
            const subject = subjects[subjectIndex] || "";
            const subjectLead = subjectLeadTexts[subjectIndex] || "";
            const subjectDetails = subjectDetailTexts[subjectIndex] || "";
            const gender = subjectGenderTexts[subjectIndex] || "";
            const nationality = subjectNationalityTexts[subjectIndex] || "";
            const genderForm = subjectGenderForms[subjectIndex] || "neutral";

            for (const outfit of outfits) {
                for (const action of actions) {
                    for (const camera of effectiveCameraChoices) {
                        for (const artStyle of artStyleChoices) {
                            const safeSubject = ensureTextContent(subject, DEFAULT_PROMPT_FALLBACKS.subject);
                            const safeOutfit = ensureTextContent(outfit, DEFAULT_PROMPT_FALLBACKS.outfit);
                            const safeAction = ensureTextContent(action, DEFAULT_PROMPT_FALLBACKS.action);
                            const safeCamera = ensureTextContent(camera, DEFAULT_PROMPT_FALLBACKS.camera);
                            const safeArtStyle = ensureTextContent(artStyle, DEFAULT_PROMPT_FALLBACKS.artStyle);
                            const safeTimeOfDay = ensureTextContent(timeOfDay, DEFAULT_PROMPT_FALLBACKS.timeOfDay);
                            const safeLighting = ensureTextContent(lighting, DEFAULT_PROMPT_FALLBACKS.lighting);
                            const safeColorTreatment = ensureTextContent(colorTreatmentText, "");

                            const templateValues = {
                                descriptor: joinParts([
                                    safeColorTreatment,
                                    safeCamera
                                ]),
                                artStyle: safeArtStyle,
                                camera: safeCamera,
                                subject: safeSubject,
                                subjects: safeSubject,
                                gender: ensureTextContent(gender, ""),
                                nationality: ensureTextContent(nationality, ""),
                                subjectLead: ensureTextContent(subjectLead, ""),
                                description: ensureTextContent(subjectDetails, ""),
                                subjectDetails: ensureTextContent(subjectDetails, ""),
                                clothing: safeOutfit,
                                action: safeAction,
                                timeOfDay: safeTimeOfDay,
                                lighting: safeLighting,
                                colorTreatment: safeColorTreatment
                            };

                            let constructedPrompt = fillTemplate(promptTemplate, templateValues);

                            // Gender tags are resolved after template expansion so
                            // that tags embedded inside presets get filled too.
                            constructedPrompt = applyGenderTerms(constructedPrompt, genderForm);
                            constructedPrompt = cleanPrompt(constructedPrompt);

                            if (!constructedPrompt) {
                                constructedPrompt = DEFAULT_PROMPT_FALLBACKS.genericPrompt;
                            }

                            finalPrompts.push({
                                prompt: constructedPrompt,
                                width: aspectOption.width,
                                height: aspectOption.height,
                                aspectLabel: aspectOption.label
                            });
                        }
                    }
                }
            }
        }
    }
}

// =========================================
// STEP 4 — PROMPT ENHANCEMENT (OPTIONAL)
// =========================================
// Runs each constructed prompt through a local language model (the same
// canvas.answer "Image Interpreter" mechanism used by the standalone
// Prompt Enhancer script) to refine wording for Krea 2. This runs BEFORE
// the review screen so the preview shows the actual enhanced prompts
// that will be generated. The refinement is model-agnostic, so each
// prompt is enhanced once and reused for every selected model.

function buildEnhancementInstruction(promptText) {
    return `${KREA2_REFINEMENT_TEMPLATE}

[PURE TEXT MODE — IGNORE THE CANVAS]
The canvas image currently loaded is irrelevant to this task. Do not describe, reference, or adapt any visual elements from it. Process only the text prompt below.

Prompt to refine:
"${promptText}"`;
}

function stripCodeFences(text) {
    let result = text.trim();
    const fenceMatch = result.match(/```(?:markdown|json|text)?\s*([\s\S]*?)```/);
    if (fenceMatch) result = fenceMatch[1].trim();
    // Remove wrapping quotes the model sometimes adds.
    if (result.length > 1 && result.startsWith('"') && result.endsWith('"')) {
        result = result.substring(1, result.length - 1).trim();
    }
    return result;
}

async function enhancePrompts(prompts) {
    if (!enhancementEnabled || prompts.length === 0) {
        return prompts;
    }

    // Make sure the language model is available before doing any work.
    if (pipeline.areModelsDownloaded && !pipeline.areModelsDownloaded([ENHANCER_MODEL])) {
        console.log(`Enhancer model not downloaded: ${ENHANCER_MODEL} — downloading…`);
        try {
            pipeline.downloadBuiltins([ENHANCER_MODEL]);
        } catch (downloadError) {
            console.log(`Failed to download enhancer model: ${downloadError.message}. Using raw prompts.`);
            return prompts;
        }
    }

    // Isolate the canvas: load a 1x1 blank placeholder so the language
    // model cannot pick up visual content from whatever is on the canvas.
    const BLANK_CARRIER_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    let originalCanvasSrc = "";
    try {
        originalCanvasSrc = canvas.saveImageSrc(false);
    } catch (saveError) {
        console.log(`Unable to back up canvas (it may be empty): ${saveError.message}`);
    }
    try {
        canvas.clear();
        canvas.loadImageSrc(BLANK_CARRIER_SRC);
    } catch (blankError) {
        console.log(`Unable to load blank placeholder: ${blankError.message}`);
    }

    let failures = 0;

    for (let i = 0; i < prompts.length; i++) {
        const original = prompts[i].prompt;
        try {
            const raw = canvas.answer(ENHANCER_MODEL, buildEnhancementInstruction(original));
            const refined = raw ? stripCodeFences(String(raw)) : "";
            if (refined) {
                prompts[i].prompt = refined;
                console.log(`[${i + 1}/${prompts.length}] Enhanced prompt.`);
            } else {
                failures++;
                console.log(`[${i + 1}/${prompts.length}] Enhancer returned empty output — keeping original prompt.`);
            }
        } catch (enhanceError) {
            failures++;
            console.log(`[${i + 1}/${prompts.length}] Enhancement failed (${enhanceError.message}) — keeping original prompt.`);
        }
    }

    // Restore whatever was on the canvas before enhancement.
    try {
        canvas.clear();
        if (originalCanvasSrc) canvas.loadImageSrc(originalCanvasSrc);
    } catch (restoreError) {
        console.log(`Unable to restore original canvas: ${restoreError.message}`);
    }

    console.log(`Prompt enhancement complete: ${prompts.length - failures}/${prompts.length} enhanced, ${failures} kept as-is.`);
    return prompts;
}

// =========================================
// STEP 5 — REVIEW / PREVIEW SCREEN
// =========================================
// Shows the total prompt count and a sample of the final prompt strings
// (enhanced when the enhancer is enabled) before anything is generated,
// so template mistakes or unexpected combinations are visible up front
// instead of only showing up in the console log after generation has
// already started.

function buildPreviewText(prompts) {
    const sample = prompts.slice(0, PREVIEW_SAMPLE_SIZE);
    const numbered = sample.map((promptData, index) => `${index + 1}. [${promptData.aspectLabel}] ${promptData.prompt}`);

    if (prompts.length > sample.length) {
        numbered.push(`… and ${prompts.length - sample.length} more prompt(s) not shown here.`);
    }

    return numbered.join("\n\n");
}

async function runBatch() {
    // Enhance prompts before showing the review screen, so the preview
    // reflects the actual text that will be sent to the models. Failures
    // inside enhancePrompts fall back to the original prompt text.
    await enhancePrompts(finalPrompts);

    const review = requestFromUser("Review Prompts", "Generate", function () {
        const aspectSummary = randomizeEnabled
            ? "random aspect ratios"
            : selectedAspectOptions.map(option => option.label).join(", ");
        const modelSummary = modelsToRun.map(option => option.label).join(" and ");
        const totalImages = finalPrompts.length * modelsToRun.length;
        const modeSummary = randomizeEnabled
            ? `${finalPrompts.length} randomized prompt(s), each one a random combination of categories you left unselected (manual picks are kept).`
            : `This batch will generate ${totalImages} image(s) using ${aspectSummary} on ${modelSummary}.`;

        return [
            this.section(
                "❖  Batch Summary",
                `${modeSummary} Rendering on ${modelSummary}${randomizeEnabled ? ` at ${aspectSummary}` : ""}.${enhancementEnabled ? " Prompts have been enhanced for Krea 2." : ""}`,
                [this.switch(true, `Confirm and generate all ${totalImages} image(s)`)]
            ),

            this.section(
                "❖  Sample Prompts",
                finalPrompts.length > PREVIEW_SAMPLE_SIZE
                    ? `Showing the first ${PREVIEW_SAMPLE_SIZE} of ${finalPrompts.length} constructed prompts`
                    : "The full set of constructed prompts",
                [this.textField(buildPreviewText(finalPrompts), "Constructed prompt preview (read-only)", true, 4000)]
            )
        ];
    });

    const confirmed = review[0][0] === true;

    if (!confirmed) {
        console.log("Batch generation cancelled by user on the review screen.");
        return;
    }

    const baseConfig = JSON.parse(JSON.stringify(pipeline.configuration));

    baseConfig.batchCount = 1;
    baseConfig.batchSize = 1;
    baseConfig.seed = -1;

    canvas.clear();

    for (const modelOption of modelsToRun) {
        for (const promptData of finalPrompts) {
            const config = JSON.parse(JSON.stringify(baseConfig));

            config.model = modelOption.file;
            config.loras = modelOption.loras.map(lora => ({ ...lora }));
            config.width = promptData.width;
            config.height = promptData.height;

            canvas.clear();

            console.log(`Generating ${promptData.aspectLabel} prompt with ${modelOption.label}:`, promptData.prompt);
            await pipeline.run({ configuration: config, prompt: promptData.prompt });
        }
    }
}

runBatch();
