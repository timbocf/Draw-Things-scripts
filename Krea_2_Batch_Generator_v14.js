//@api-1.0
// version 14
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// Version 14 — Randomization Mode + efficiency/UI cleanup
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
    return array.length > 0 ? array[randomInt(array.length)] : undefined;
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
    const limit = Math.min(Math.max(0, count), presets.length);
    if (limit === 0) return [];

    // Partial Fisher-Yates: only shuffle the portion we actually need.
    // This avoids allocating a second array of every index on each random pick.
    const indices = Array.from({ length: presets.length }, (_, i) => i);
    for (let i = 0; i < limit; i++) {
        const j = i + randomInt(indices.length - i);
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, limit).map(i => getPresetValue(presets[i]));
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
// "value" is the full hard-coded description used in manual mode.
// "short" is the lightweight descriptor used in Randomization Mode, where
// "profile" points at a weighted trait table (see TRAIT_PROFILES) that
// picks skin tone, hair color/type, and eye color by real-world likelihood
// for that nationality instead of the hard-coded combination.
const nationalityPresets = [
    { label: "Caucasian", short: "Caucasian", profile: "westEuropean", value: "Caucasian with Western European facial features" },
    { label: "Black", short: "Black", profile: "african", value: "Black with rich deep skin tone and classic African facial features" },
    { label: "Mixed-Race", short: "Mixed-race", profile: "mixed", value: "Mixed-race with a natural blend of African and European facial features, deep golden-bronze skin, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick dark brown hair with thick wavy curls, a curvy hourglass figure, and a round ass" },
    { label: "Mexican", short: "Mexican", profile: "latina", value: "Mexican with prominent Indigenous Mesoamerican facial features, warm olive-tan skin, dark brown eyes, thick dark eyebrows, thick dark wavy hair, plump lips, and a curvy hourglass figure" },
    { label: "Indian", short: "Indian", profile: "southAsian", value: "Indian with warm brown skin, dark eyes, and South Asian facial features" },
    { label: "Thai", short: "Thai", profile: "southeastAsian", value: "Thai with golden-tan skin and Southeast Asian facial features" },
    { label: "Japanese", short: "Japanese", profile: "eastAsian", value: "Japanese with fair skin and East Asian facial features" },
    { label: "Korean", short: "Korean", profile: "eastAsian", value: "Korean with fair porcelain skin and East Asian facial features" },
    { label: "Filipina", short: "Filipina", profile: "southeastAsian", value: "Filipina with warm tan skin and Southeast Asian facial features" },
    { label: "Brazilian", short: "Brazilian", profile: "brazilian", value: "Brazilian with sun-kissed olive skin and a blend of European, African, and Indigenous features" },
    { label: "Italian", short: "Italian", profile: "mediterranean", value: "Italian with olive skin and Mediterranean facial features" },
    { label: "Scandinavian", short: "Scandinavian", profile: "nordic", value: "Scandinavian with fair skin, light hair, and Nordic facial features" },
    { label: "Russian/Eastern European", short: "Russian", profile: "slavic", value: "Russian/Eastern European with fair skin and Slavic facial features" },
    { label: "Chinese", short: "Chinese", profile: "eastAsian", value: "Chinese with fair skin and East Asian facial features" },
    { label: "Vietnamese", short: "Vietnamese", profile: "southeastAsian", value: "Vietnamese with warm tan skin and Southeast Asian facial features" },
    { label: "Middle Eastern", short: "Middle Eastern", profile: "middleEastern", value: "Middle Eastern with olive skin, dark hair, and Middle Eastern facial features" },
    { label: "French", short: "French", profile: "westEuropean", value: "French with fair skin and classic Western European features" },
    { label: "German", short: "German", profile: "westEuropean", value: "German with fair skin and Central European facial features" },
    { label: "Irish", short: "Irish", profile: "celtic", value: "Irish with fair skin, freckles, and Celtic facial features" },
    { label: "Native American", short: "Native American", profile: "nativeAmerican", value: "Native American with warm bronze skin and Indigenous American facial features" },
    { label: "Polynesian/Pacific Islander", short: "Polynesian", profile: "polynesian", value: "Polynesian/Pacific Islander with warm brown skin and Polynesian facial features" },
    { label: "Ethiopian/East African", short: "Ethiopian", profile: "eastAfrican", value: "Ethiopian/East African with deep brown skin and East African facial features" }
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

// --- OVERALL BUILD ---
const overallBuildPresets = [
    "petite build",
    "small build",
    "slim build",
    "slender build",
    "lean build",
    "athletic build",
    "toned athletic build",
    "fit build",
    "average build",
    "medium build",
    "soft build",
    "curvy build",
    "voluptuous build",
    "full-figured build",
    "plus-size build",
    "heavy build",
    "stocky build",
    "large build",
    "very large build",
    "obese build"
];

// --- HEIGHT ---
const heightPresets = [
    "very short stature",
    "short stature",
    "below-average height",
    "average height",
    "above-average height",
    "tall stature",
    "very tall stature"
];

// --- SHOULDERS ---
const shoulderPresets = [
    "very narrow shoulders",
    "narrow shoulders",
    "slightly narrow shoulders",
    "average-width shoulders",
    "slightly broad shoulders",
    "broad shoulders",
    "very broad shoulders"
];

// --- WAIST ---
const waistPresets = [
    "very narrow waist",
    "narrow waist",
    "slightly narrow waist",
    "average waist",
    "slightly wide waist",
    "wide waist",
    "very wide waist"
];

// --- HIPS ---
const hipPresets = [
    "very narrow hips",
    "narrow hips",
    "slightly narrow hips",
    "average-width hips",
    "slightly wide hips",
    "wide hips",
    "very wide hips"
];

// --- BREASTS ---
const breastPresets = [
    "flat chest",
    "small breasts",
    "small perky breasts",
    "medium breasts",
    "medium perky breasts",
    "large breasts",
    "large perky breasts",
    "very large breasts",
    "very large perky breasts"
];

// --- ASS ---
const assPresets = [
    "flat ass",
    "small ass",
    "small round ass",
    "medium ass",
    "medium round ass",
    "large ass",
    "large round ass",
    "very large ass",
    "very large round ass"
];

// --- LEGS ---
const legPresets = [
    "very thin legs",
    "thin legs",
    "slim legs",
    "average legs",
    "toned legs",
    "muscular legs",
    "thick legs",
    "very thick legs"
];

// --- ARMS ---
const armPresets = [
    "very thin arms",
    "thin arms",
    "slim arms",
    "average arms",
    "toned arms",
    "muscular arms",
    "thick arms",
    "very thick arms"
];

// --- SKIN ---
const skinPresets = [
    "porcelain skin",
    "very fair skin",
    "fair skin",
    "light skin",
    "light olive skin",
    "olive skin",
    "warm olive skin",
    "tan skin",
    "golden-tan skin",
    "warm tan skin",
    "bronze skin",
    "warm bronze skin",
    "brown skin",
    "warm brown skin",
    "deep brown skin",
    "dark brown skin",
    "deep dark skin"
];

// --- EYES ---
const eyeColorPresets = [
    "light blue eyes",
    "blue eyes",
    "gray-blue eyes",
    "gray eyes",
    "green eyes",
    "hazel eyes",
    "light brown eyes",
    "brown eyes",
    "dark brown eyes",
    "deep brown eyes",
    "amber eyes"
];

// --- HAIR COLOR ---
const hairColorPresets = [
    "platinum blonde hair",
    "ash blonde hair",
    "golden blonde hair",
    "dark blonde hair",
    "light brown hair",
    "medium brown hair",
    "dark brown hair",
    "auburn hair",
    "red hair",
    "dark red hair",
    "black hair",
    "blue-black hair",
    "silver hair",
    "gray hair",
    "white hair"
];

// --- HAIR LENGTH ---
const hairLengthPresets = [
    "very short hair",
    "short hair",
    "chin-length hair",
    "shoulder-length hair",
    "medium-length hair",
    "long hair",
    "very long hair",
    "waist-length hair"
];

// --- HAIR TEXTURE ---
const hairTexturePresets = [
    "straight hair",
    "slightly wavy hair",
    "wavy hair",
    "thick wavy hair",
    "curly hair",
    "thick curly hair",
    "coily hair",
    "thick coily hair"
];

// --- HAIRSTYLE GROUPS ---
// Each group contains related hairstyle presets. Randomization mode chooses
// among groups, then chooses a specific style from the selected group.
const hairstyleGroups = [
    {
        label: "Straight",
        presets: [
            "straight hair worn loose",
            "straight hair with a center part",
            "straight hair with a side part",
            "sleek straight hair",
            "straight hair tucked behind the ears",
            "straight hair with curtain bangs",
            "straight hair with blunt bangs"
        ]
    },
    {
        label: "Wavy",
        presets: [
            "loose beach waves",
            "soft natural waves",
            "thick wavy hair worn loose",
            "wavy hair with a center part",
            "wavy hair with a side part",
            "long tousled waves",
            "voluminous wavy hair"
        ]
    },
    {
        label: "Curly",
        presets: [
            "loose natural curls",
            "defined curls",
            "thick curly hair worn loose",
            "curly hair with a center part",
            "curly hair with a side part",
            "voluminous curly hair",
            "long cascading curls"
        ]
    },
    {
        label: "Coily",
        presets: [
            "natural coily hair",
            "thick natural coils",
            "dense coily hair",
            "short natural coils",
            "long natural coils",
            "coily hair worn loose",
            "voluminous coily hair"
        ]
    },
    {
        label: "Braids",
        presets: [
            "long box braids",
            "medium-length box braids",
            "knotless box braids",
            "long micro braids",
            "cornrows",
            "feed-in braids",
            "French braids",
            "Dutch braids",
            "two long braids",
            "multiple braids"
        ]
    },
    {
        label: "Ponytails",
        presets: [
            "high ponytail",
            "low ponytail",
            "long sleek ponytail",
            "high voluminous ponytail",
            "messy ponytail",
            "side ponytail"
        ]
    },
    {
        label: "Buns",
        presets: [
            "high bun",
            "low bun",
            "messy bun",
            "sleek bun",
            "double buns",
            "top knot"
        ]
    },
    {
        label: "Short",
        presets: [
            "short pixie cut",
            "textured pixie cut",
            "short bob",
            "chin-length bob",
            "blunt bob",
            "short layered haircut",
            "short spiky haircut",
            "undercut hairstyle"
        ]
    },
    {
        label: "Bang Styles",
        presets: [
            "curtain bangs",
            "blunt bangs",
            "wispy bangs",
            "side-swept bangs",
            "micro bangs",
            "long side bangs"
        ]
    },
    {
        label: "Updos",
        presets: [
            "elegant updo",
            "messy updo",
            "braided updo",
            "French twist",
            "chignon",
            "half-up half-down hairstyle"
        ]
    }
];

const ALL_HAIRSTYLE_PRESETS = hairstyleGroups.flatMap(group => group.presets);
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

// Flattened once so Randomization Mode does not rebuild this array for every image.
const ALL_HAIRSTYLE_PRESETS = hairstyleGroups.flatMap(group => group.presets);

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
            "When enabled, every category is randomized with weighted selection: nationality drives likely skin/hair/eye traits (e.g. Irish favors fair skin and red hair), and gender drives body, clothing, and appearance traits (men never get lingerie or hourglass figures, women never get beards). Any option you manually select on the next screen is kept — everything left unselected is picked at random. Each image is one random combination.",
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
                ...ASPECT_OPTIONS.map((option) => this.switch(false, option.label))
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
