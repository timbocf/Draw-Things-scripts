//@api-1.0
// version 10
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// V10 — ADDS LIVE PROMPT PREVIEW BEFORE GENERATION
//
// Changes from v9:
// - After prompts are constructed, a "Review Prompts" screen shows
//   the total image count and a sample of the actual constructed
//   prompt strings before generation starts, so template mistakes
//   or unexpected combinations are caught up front instead of only
//   showing up in the console log mid-run.
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
// PRESETS
// =========================================

// --- GENDER ---
const genderPresets = ["woman", "man"];

// --- NATIONALITY / ETHNICITY ---
const nationalityPresets = [
    "Caucasian",
    "Black",
    "Mixed-race adult with a natural blend of African and European facial features",
    "Mexican with prominent Indigenous Mesoamerican facial features",
    "Indian",
    "Thai",
    "Japanese",
    "Korean",
    "Filipina",
    "Brazilian",
    "Italian"
];

const celebrityPresets = [
    { label: "Anne Hathaway", value: "Anne Hathaway with a tall slim build with shadowy eyes and heavy mascara" },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs" },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair" },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls" }
];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];

// --- SKIN TONE ---
const skinTonePresets = [
    "porcelain skin", "pale skin", "fair skin", "tanned skin", "cream skin",
    "olive skin", "caramel skin", "warm brown skin", "dark skin", "dark glossy skin"
];

// =========================================
// BODY / PHYSIQUE
// =========================================

const overallBuildPresets = [
    { label: "Slim build", value: "slim build" },
    { label: "Athletic build", value: "athletic build with a fit, naturally toned physique" },
    { label: "Average build", value: "average build" },
    { label: "Petite build", value: "petite build with a small overall frame, narrow hips, short stature, narrow shoulders, thin legs, and flat belly" },
    { label: "Curvy build", value: "curvy build with naturally pronounced feminine curves" },
    { label: "Muscular build", value: "muscular build with clearly developed musculature" },
    { label: "Chubby build", value: "chubby build with a softer, fuller physique" }
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

const makeupPresets = ["light makeup", "heavy makeup", "red lipstick", "smokey eyes", "heavy mascara"];
const facialHairPresets = ["short beard", "thick beard"];
const tattooPresets = ["arm tattoo", "back tattoo", "neck tattoos", "sleeve tattoos", "red & green rose tattoos that cover both arms"];
const bodyHairPresets = ["light body hair", "thick body hair", "freckles"];

const hairDetailPresets = [
    { label: "Shaved on one side", value: "one side of the head shaved" },
    { label: "Shaved on both sides", value: "both sides of the head shaved" }
];

const appearanceSwitchGroups = [
    { title: "Makeup", description: "Makeup and cosmetic styling", presets: makeupPresets },
    { title: "Facial Hair", description: "Facial hair characteristics", presets: facialHairPresets },
    { title: "Tattoos", description: "Visible tattoo characteristics", presets: tattooPresets },
    { title: "Body / Skin Details", description: "Body hair and skin details", presets: bodyHairPresets },
    { title: "Hair Details", description: "Additional hair-shaving and hair-structure details", presets: hairDetailPresets }
];

const hairColorPresets = ["blonde", "brunette", "black", "red", "auburn", "salt & pepper", "silver"];
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
        presets: ["faux hawk", "short boyish hairstyle", "spiked punk hairstyle"]
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
            "necklace", "layered necklaces", "choker", "pendant necklace",
            "bracelet", "stacked bracelets", "watch", "rings", "multiple rings"
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
        presets: ["nose piercing", "septum piercing", "eyebrow piercing", "lip piercing", "multiple ear piercings", "navel piercing"]
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

const clothingGroups = [
    {
        title: "Tops",
        description: "Upper-body styling",
        presets: [
            "a loose fitting T-shirt",
            "a fitted T-shirt",
            "a tank top",
            { label: "a short crop top", value: "a crop-top t-shirt showing significant underboob" },
            "a blouse",
            "an unbuttoned mens dress shirt",
            "a hoodie"
        ]
    },
    {
        title: "Bottoms",
        description: "Skirts, shorts, and bottoms",
        presets: [
            "jeans",
            "shorts",
            "cutoff jean shorts",
            "spandex leggings",
            "mini-skirt",
            "pleated mini-skirt"
        ]
    },
    {
        title: "Dresses",
        description: "Dress and one-piece styles",
        presets: ["a short babydoll dress", "a summer dress", "one-piece swimsuit"]
    },
    {
        title: "Lingerie",
        description: "Lingerie and underlayers",
        presets: [
            "nude", "bikini-style panties", "thong", "string bikini", "garter belt",
            "lace bustier", "silk lingerie set", "black lace lingerie set", "red satin lingerie set",
            "sheer lace teddy", "transparent lace bra and panties", "lace-up corset", "satin chemise",
            "sheer bodystocking", "balconette bra and matching panties", "lace garter set",
            "leather lingerie set", "silk robe and lingerie set", "fishnet bodysuit",
            "push-up bra and thong set", "lace-up thigh-highs", "strapless corset set",
            "sheer robe with matching panties", "satin slip dress", "lace-up bustier set",
            "transparent vinyl lingerie", "corset over sheer stockings"
        ]
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
            { label: "Hooters Uniform", value: "Hooters uniform (tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts)" }
        ]
    },
    {
        title: "Footwear",
        description: "Shoes, socks, and legwear",
        presets: [
            "barefoot", "white tube socks", "knee-high Hello Kitty socks", "knee-high Pokemon socks",
            "black fishnet stockings", "sheer lace stockings", "strappy heels", "lace-up knee boots",
            "platform boots", "stiletto heels", "cowboy boots", "thigh-high stockings", "thigh-high leather boots"
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
    { label: "Wall Pose — back against wall, one knee bent", value: "leaning back against a wall, with one knee bent and one foot on the wall" },
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
    { label: "Full-Length Mirror Reflection (sitting)", value: "sitting in front of a full-length mirror looking at {possessive} reflection" }
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
        title: "Signature Poses",
        description: "POV sexual positions and notable scene presets",
        type: "menu",
        placeholder: "No signature pose selected",
        presets: [
            {
                label: "POV/Cowgirl",
                value: "pov, straddling a nude man, riding him in cowgirl position, his penis is deep inside {subjectPronoun}"
            },
            {
                label: "POV/Blowjob",
                value: "pov, between a nude man's legs, giving him a passionate blowjob, his penis deep inside {possessive} mouth, sucking the penis, sunken cheeks"
            },
            {
                label: "POV/Missionary",
                value: "{subjectPronoun} is laying on {possessive} back looking up at the camera"
            },
            {
                label: "Bathroom Mirror Selfie",
                value: "taking a selfie in a bathroom mirror"
            },
            {
                label: "Full-Length Mirror Reflection (standing)",
                value: "standing in front of a full-length mirror while pulling {possessive} hair up"
            },
            {
                label: "Full-Length Mirror Reflection (sitting)",
                value: "sitting in front of a full-length mirror looking at {possessive} reflection"
            },
            {
                label: "Morning Stretch",
                value: "standing, mid-stretch reaching both arms overhead while rising up on {possessive} toes, hands in {possessive} hair, back arched, chest pressed forward, shoulders pulled back."
            }
        ]
    },
    {
        title: "Legs",
        description: "Leg and body alignment",
        presets: [
            "legs straight",
            "elevated into the air",
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
            "on an office desk"
        ]
    }
];

// =========================================
// ART STYLE
// =========================================

const artStylePresets = [
    "photo",
    "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas",
    "Disney-Pixar style animation with exaggerated features and expressions: large expressive eyes, small noses",
    "bathroom mirror selfie"
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
    { label: "Eye level", value: "natural eye-level perspective" },
    { label: "Low angle", value: "low-angle perspective looking upward toward the subject" },
    { label: "High angle", value: "high-angle perspective looking downward toward the subject" },
    { label: "Worm's-eye", value: "extreme low-angle worm's-eye perspective" },
    { label: "Bird's-eye", value: "high bird's-eye perspective looking down from above" },
    { label: "Side view", value: "side-view camera perspective" },
    { label: "3/4 view", value: "three-quarter camera perspective showing the subject from an oblique angle" },
    { label: "Wide-angle perspective", value: "pronounced wide-angle perspective with natural spatial exaggeration" },
    { label: "Compressed perspective", value: "compressed telephoto-style perspective with reduced apparent depth" },
    { label: "Over-the-Shoulder", value: "over-the-shoulder" }
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
    { label: "Dynamic diagonal", value: "dynamic diagonal composition creating a sense of movement and visual energy" }
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
    { label: "Neutral and natural", value: "soft directional light, balanced exposure, and ambient fill" },
    { label: "Dramatic contrast", value: "low-key lighting, chiaroscuro, and deep shadows" },
    { label: "Atmospheric raise", value: "volumetric light, god rays, and hazy atmosphere" },
    { label: "Cinematic blockbuster", value: "cinematic lighting, teal-and-orange color grade, and rim lighting" },
    { label: "Sun Dappled", value: "dappled sunlight, soft shadows, and warm natural light" }
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

function addPresetSwitchSection(fields, title, description, presets) {
    fields.push(this.section(title, description, presetSwitches.call(this, presets)));
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
            group.presets
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
            "❖  Batch Configurations",
            "Define how many variants to generate per batch",
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

const setupData = setup[0];

const subjectCount = setupData[0] + 1;
const outfitCount = setupData[1] + 1;
const actionCount = setupData[2] + 1;
const cameraCount = setupData[3] + 1;
const artStyleCount = setupData[4] + 1;
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
            sectionTitle(subjectPrefix, "Celebrity/Reference Face"),
            "Optional celebrity-inspired identity presets",
            [this.menu(NONE_SELECTED, menuWithPlaceholder("No celebrity preset selected", celebrityPresets))]
        ));

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Identity"),
            "Gender, ethnicity, age, and skin tone",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("Choose gender", genderPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("Choose nationality / ethnicity", nationalityPresets)),
                this.menu(NONE_SELECTED, agePresets),
                this.menu(NONE_SELECTED, menuWithPlaceholder("Choose skin tone", skinTonePresets))
            ]
        ));

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Body / Physique"),
            "Choose independent characteristics to control the subject's overall proportions and silhouette",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("No overall build selected", overallBuildPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No height selected", heightPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No chest description", chestPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No hip description", hipPresets)),
                this.menu(NONE_SELECTED, presetLabels(bodyShapePresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No leg description", legPresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No ass size selected", assSizePresets)),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No belly size selected", bellySizePresets)),
                this.menu(NONE_SELECTED, presetLabels(specificBodyPresets)),
                this.textField("", "Custom body details", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Mood / Aesthetic / Historical Media"), appearanceSwitchGroups);

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Mood / Aesthetic / Historical Media", "Hair Type"),
            "Hair texture choices",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("No hair type", hairTypePresets)),
                this.textField("", "Custom hair type", false, 40)
            ]
        ));

        fields.push(this.section(
            sectionTitle(subjectPrefix, "Mood / Aesthetic / Historical Media", "Hair"),
            "Hair color, length, hairstyle, and additional subject details",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("No hair color", hairColorPresets)),
                this.textField("", "Custom hair color", false, 40),
                this.menu(NONE_SELECTED, menuWithPlaceholder("No hair length", hairLengthPresets)),
                this.textField("", "Custom hair length", false, 40),
                this.textField("", "Custom hairstyle", false, 40),
                this.textField("", "Additional subject details", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Mood / Aesthetic / Historical Media", "Hair"), hairstyleGroups);
        addGroupedSections.call(this, fields, sectionTitle(subjectPrefix, "Accessories"), accessoryGroups);
    }

    // -----------------------------------------
    // OUTFITS
    // -----------------------------------------
    for (let i = 0; i < outfitCount; i++) {
        const outfitPrefix = `❖  OUTFIT ${i + 1}`;

        fields.push(this.section(
            sectionTitle(outfitPrefix, "Preset"),
            "Choose a preset or add custom outfit text",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("No clothing selected", clothingPresets)),
                this.textField("", "Custom outfit description", false, 60)
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
            "Choose a preset or add custom pose text",
            [
                this.menu(NONE_SELECTED, menuWithPlaceholder("No pose preset selected", complexActionPresets)),
                this.textField("", "Custom action / pose modifier", false, 60)
            ]
        ));

        addGroupedSections.call(this, fields, actionPrefix, actionGroups);
    }

    // -----------------------------------------
    // CAMERA
    // -----------------------------------------
    fields.push(this.section(
        "❖  CAMERA • Options",
        `Choose up to ${cameraCount} camera angles, framings, compositions, or depth-of-field looks`,
        Array.from({ length: cameraCount }, () =>
            this.menu(NONE_SELECTED, menuWithPlaceholder("No camera option selected", cameraOptionsPresets))
        )
    ));

    // -----------------------------------------
    // LIGHTING
    // -----------------------------------------
    fields.push(this.section(
        "❖  LIGHTING • Time of Day",
        "Choose the environmental time and quality of ambient light",
        [this.menu(NONE_SELECTED, menuWithPlaceholder("No time of day selected", timeOfDayPresets))]
    ));

    fields.push(this.section(
        "❖  LIGHTING • Natural / Environmental",
        "Select a natural or environmental light source",
        [this.menu(NONE_SELECTED, menuWithPlaceholder("No natural/environmental lighting selected", naturalLightingPresets))]
    ));
    fields.push(this.section(
        "❖  LIGHTING • Direction",
        "Choose the main quality and direction of the light",
        [this.menu(NONE_SELECTED, menuWithPlaceholder("No lighting direction selected", lightingDirectionPresets))]
    ));
    fields.push(this.section(
        "❖  LIGHTING • Style / Balance",
        "Choose a lighting style that combines color and balance for the scene",
        [this.menu(NONE_SELECTED, menuWithPlaceholder("No lighting style selected", lightingStylePresets))]
    ));
    fields.push(this.section(
        "❖  COLOR TREATMENTS",
        "Optional monochrome or stylized color treatment controls",
        [this.menu(NONE_SELECTED, menuWithPlaceholder("No color treatment selected", colorTreatmentPresets))]
    ));

    // -----------------------------------------
    // PROMPT OPTIONS / TEMPLATE
    // -----------------------------------------
    fields.push(this.section(
        "❖  Prompt Options & Template",
        "Choose up to 5 art styles and customize the template with tags",
        [
            ...Array.from({ length: artStyleCount }, () =>
                this.menu(NONE_SELECTED, menuWithPlaceholder("No art style selected", artStylePresets))
            ),
            this.textField(
                "A {artStyle} of {subject}, {action}, wearing {clothing}, {camera}, {timeOfDay}, {lighting}, {colorTreatment}, Natural anatomy",
                "Prompt Template — tags: {artStyle}, {subject}, {action}, {clothing}, {camera}, {timeOfDay}, {lighting}, {colorTreatment}, {subjectPronoun}, {objectPronoun}, {possessive}, {reflexive}, {personNoun}.",
                false,
                80
            )
        ]
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
const subjectGenderForms = [];

for (let i = 0; i < subjectCount; i++) {
    const subjectParts = [];

    // --- Identity ---
    const celebrityData = nextSection();
    const celebrity = selectedValueWithPlaceholder(celebrityData[0], celebrityPresets);

    const identityData = nextSection();
    const gender = selectedValueWithPlaceholder(identityData[0], genderPresets);
    const nationality = selectedValueWithPlaceholder(identityData[1], nationalityPresets);
    const age = selectedValueNoPlaceholder(identityData[2], agePresets);
    const skin = selectedValueWithPlaceholder(identityData[3], skinTonePresets);
    const genderForm = getGenderForm(gender);

    if (nationality) subjectParts.push(nationality);
    if (gender) subjectParts.push(gender);
    if (age) subjectParts.push(age);
    if (skin) subjectParts.push("with " + skin);
    if (celebrity) subjectParts.push(celebrity);

    // --- Body / Physique ---
    const bodyData = nextSection();

    const bodySelections = [
        [bodyData[0], overallBuildPresets],
        [bodyData[1], heightPresets],
        [bodyData[2], chestPresets],
        [bodyData[3], hipPresets],
        [bodyData[5], legPresets],
        [bodyData[6], assSizePresets],
        [bodyData[7], bellySizePresets]
    ];

    for (const [index, presets] of bodySelections) {
        const value = selectedValueWithPlaceholder(index, presets);
        if (value) subjectParts.push(value);
    }

    const bodyShape = selectedValueNoPlaceholder(bodyData[4], bodyShapePresets);
    if (bodyShape) subjectParts.push(bodyShape);

    const specificBody = selectedValueNoPlaceholder(bodyData[8], specificBodyPresets);
    if (specificBody) subjectParts.push(specificBody);

    if (bodyData[9]) subjectParts.push(bodyData[9]);

    // --- Appearance switch groups ---
    subjectParts.push(...parseGroupedSwitches(appearanceSwitchGroups));

    // --- Hair Type ---
    const hairTypeData = nextSection();
    const hairType = hairTypeData[1] !== "" ? hairTypeData[1] : selectedValueWithPlaceholder(hairTypeData[0], hairTypePresets);

    // --- Hair ---
    const hairData = nextSection();
    let hairIdx = 0;
    const hairColorIndex = hairData[hairIdx++];
    const customHairColor = hairData[hairIdx++];
    const hairColor = customHairColor !== "" ? customHairColor : selectedValueWithPlaceholder(hairColorIndex, hairColorPresets);

    const hairLengthIndex = hairData[hairIdx++];
    const customHairLength = hairData[hairIdx++];
    const hairLength = customHairLength !== "" ? customHairLength : selectedValueWithPlaceholder(hairLengthIndex, hairLengthPresets);

    const customHairstyle = hairData[hairIdx++];
    const hairstyleParts = parseGroupedSwitches(hairstyleGroups);
    const hairstyle = joinParts([...hairstyleParts, customHairstyle]);

    const hairColorText = hairColor
        ? (/\bhair\b/i.test(hairColor) ? hairColor : hairColor + " hair")
        : "";

    const hairDescription = joinParts([hairLength, hairType, hairstyle, hairColorText]);
    if (hairDescription) subjectParts.push(hairDescription);

    const additionalDetails = hairData[hairIdx++];
    if (additionalDetails) subjectParts.push(additionalDetails);

    // --- Accessories ---
    subjectParts.push(...parseGroupedSwitches(accessoryGroups));

    // --- Subject text variants ---
    const subjectLeadParts = [];
    if (nationality) subjectLeadParts.push(nationality);
    if (gender) subjectLeadParts.push(gender);

    const subjectDetailsParts = subjectParts.slice(subjectLeadParts.length);

    subjects.push(subjectParts.join(", "));
    subjectLeadTexts.push(subjectLeadParts.join(", "));
    subjectDetailTexts.push(subjectDetailsParts.join(", "));
    subjectGenderForms.push(genderForm);
}

// =========================================
// OUTFIT PARSING
// =========================================

const outfits = [];

for (let i = 0; i < outfitCount; i++) {
    const outfitParts = [];

    const outfitMetaData = nextSection();
    const selectedOutfit = selectedValueWithPlaceholder(outfitMetaData[0], clothingPresets);
    if (selectedOutfit) outfitParts.push(selectedOutfit);

    const customOutfit = outfitMetaData[1] || "";
    if (customOutfit) outfitParts.push(customOutfit);

    outfitParts.push(...parseGroupedSwitches(clothingGroups));

    outfits.push(joinParts(outfitParts));
}

// =========================================
// ACTION PARSING
// =========================================

const actions = [];

for (let i = 0; i < actionCount; i++) {
    const actionParts = [];

    const actionMetaData = nextSection();
    const selectedAction = selectedValueWithPlaceholder(actionMetaData[0], complexActionPresets);
    if (selectedAction) actionParts.push(selectedAction);

    const customAction = actionMetaData[1] || "";
    if (customAction) actionParts.push(customAction);

    actionParts.push(...parseGroupedSwitches(actionGroups));

    actions.push(joinParts(actionParts));
}

// =========================================
// CAMERA PARSING
// =========================================

const cameraData = nextSection();

const cameraChoices = Array.from({ length: cameraCount }, (_, index) =>
    selectedValueWithPlaceholder(cameraData[index], cameraOptionsPresets)
).filter(Boolean);

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
// COLOR TREATMENT PARSING
// =========================================

const colorTreatmentData = nextSection();
const colorTreatmentText = selectedValueWithPlaceholder(colorTreatmentData[0], colorTreatmentPresets);

// =========================================
// PROMPT TEMPLATE
// =========================================

const templateData = nextSection();

const artStyles = Array.from({ length: artStyleCount }, (_, index) =>
    selectedValueWithPlaceholder(templateData[index], artStylePresets)
).filter(Boolean);

const promptTemplate = templateData[artStyleCount] || "";

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

const DEFAULT_PROMPT_FALLBACKS = {
    subject: "the subject",
    outfit: "minimal clothing",
    action: "posing naturally",
    camera: "natural eye-level perspective",
    timeOfDay: "natural daytime illumination",
    lighting: "soft directional light, balanced exposure, and ambient fill",
    artStyle: "photo",
    genericPrompt: "a portrait of the subject"
};

function ensureTextContent(value, fallback) {
    const cleaned = typeof value === "string" ? cleanPrompt(value) : "";
    return cleaned || fallback;
}

const effectiveCameraChoices = cameraChoices.length > 0 ? cameraChoices : [DEFAULT_PROMPT_FALLBACKS.camera];

// =========================================
// BUILD FINAL PROMPTS
// =========================================

const finalPrompts = [];
const artStyleChoices = artStyles.length > 0 ? artStyles : [DEFAULT_PROMPT_FALLBACKS.artStyle];

for (const aspectOption of selectedAspectOptions) {
    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
        const subject = subjects[subjectIndex] || "";
        const subjectLead = subjectLeadTexts[subjectIndex] || "";
        const subjectDetails = subjectDetailTexts[subjectIndex] || "";
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
                            artStyle: safeArtStyle,
                            camera: safeCamera,
                            subject: safeSubject,
                            subjects: safeSubject,
                            subjectLead: ensureTextContent(subjectLead, ""),
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

// =========================================
// STEP 4 — REVIEW / PREVIEW SCREEN
// =========================================
// Shows the total prompt count and a sample of the actual constructed
// prompt strings before anything is generated, so template mistakes
// or unexpected combinations are visible up front instead of only
// showing up in the console log after generation has already started.

function buildPreviewText(prompts) {
    const sample = prompts.slice(0, PREVIEW_SAMPLE_SIZE);
    const numbered = sample.map((promptData, index) => `${index + 1}. [${promptData.aspectLabel}] ${promptData.prompt}`);

    if (prompts.length > sample.length) {
        numbered.push(`… and ${prompts.length - sample.length} more prompt(s) not shown here.`);
    }

    return numbered.join("\n\n");
}

const review = requestFromUser("Review Prompts", "Generate", function () {
    const aspectSummary = selectedAspectOptions.map(option => option.label).join(", ");

    return [
        this.section(
            "❖  Batch Summary",
            `This batch will generate ${finalPrompts.length} image(s) using ${aspectSummary}.`,
            [this.switch(true, `Confirm and generate all ${finalPrompts.length} prompt(s)`)]
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

// =========================================
// STEP 5 — GENERATION
// =========================================

async function generateBatch() {
    if (!confirmed) {
        console.log("Batch generation cancelled by user on the review screen.");
        return;
    }

    const baseConfig = JSON.parse(JSON.stringify(pipeline.configuration));

    baseConfig.model = "krea_2_turbo_i8x.ckpt";
    baseConfig.batchCount = 1;
    baseConfig.batchSize = 1;
    baseConfig.seed = -1;

    canvas.clear();

    for (const promptData of finalPrompts) {
        const config = JSON.parse(JSON.stringify(baseConfig));

        config.width = promptData.width;
        config.height = promptData.height;

        canvas.clear();

        console.log(`Generating ${promptData.aspectLabel} prompt:`, promptData.prompt);
        await pipeline.run({ configuration: config, prompt: promptData.prompt });
    }
}

generateBatch();
