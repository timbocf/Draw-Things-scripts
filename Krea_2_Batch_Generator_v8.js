//@api-1.0
const genderPresets = ["woman", "man"];
const nationalityPresets = ["Caucasian", "Black", "Mixed-race adult with a natural blend of African and European facial features", "Mexican with prominent Indigenous Mesoamerican facial features", "Indian", "Thai", "Japanese", "Korean", "Filipina", "Brazilian", "Italian"];
const celebrityPresets = [
    { label: "Anne Hathaway", value: "Anne Hathaway with straight black hair and a tall slim build with shadowy eyes and heavy mascara" },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs" },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair" },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls" }
];
const agePresets = ["18 years old", "20 years old", "25 years old", "30 years old", "35 years old", "40 years old", "45 years old", "50 years old", "55 years old", "60 years old", "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"];
const skinTonePresets = ["porcelain skin", "pale skin", "fair skin", "tanned skin", "cream skin", "olive skin", "caramel skin", "warm brown skin", "dark skin", "dark glossy skin"];

const overallBuildPresets = [
    { label: "Slim build", value: "slim build" },
    { label: "Athletic build", value: "athletic build with a fit, naturally toned physique" },
    { label: "Average build", value: "average build" },
    { label: "Petite build", value: "petite build with a small overall frame, flat chest, narrow hips, short stature, narrow shoulders, thin legs, and flat belly" },
    { label: "Curvy build", value: "curvy build with naturally pronounced feminine curves" },
    { label: "Muscular build", value: "muscular build with clearly developed musculature" },
    { label: "Chubby build", value: "chubby build with a softer, fuller physique" }
];

const heightPresets = [
    { label: "Short", value: "short stature with natural body proportions" },
    { label: "Average", value: "average height and proportions" },
    { label: "Tall", value: "tall stature, long legs, elongated proportions" }
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
    { label: "Petite", value: "small petite juvenile frame, with narrow shoulders, narrow hips, and a small flat boyish chest" },
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
        presets: ["wet hair", "ponytail", "messy ponytail", "French braid", "loose braids", "cornrows", "box braids", "micro braids", "dreadlocks", "messy bun", "messy double buns", "with bangs"]
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

const accessoryGroups = [
    {
        title: "Jewelry",
        description: "Select any jewelry accessories to add",
        presets: ["stud earrings", "hoop earrings", "large hoop earrings", "drop earrings", "necklace", "layered necklaces", "choker", "pendant necklace", "bracelet", "stacked bracelets", "watch", "rings", "multiple rings"]
    },
    {
        title: "Eyewear",
        description: "Select eyewear accessories",
        presets: ["sunglasses", "aviator sunglasses", "round sunglasses", "cat-eye sunglasses", "reading glasses", "clear-frame glasses", "dark sunglasses"]
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

function getPresetLabel(preset) { return typeof preset === "object" && preset !== null ? preset.label : preset }
function getPresetValue(preset) { return typeof preset === "object" && preset !== null ? preset.value : preset }
function presetLabels(presets) { return presets.map(preset => getPresetLabel(preset)) }
function menuWithPlaceholder(placeholder, presets) { return [placeholder, ...presetLabels(presets)] }
function presetSwitches(presets) { return presets.map(preset => this.switch(false, `✡︎  ${getPresetLabel(preset)}`)) }
function selectedPresetValue(index, presets, placeholder = true) {
    if (placeholder && index <= 0) return "";
    const actualIndex = placeholder ? index - 1 : index;
    if (actualIndex < 0 || actualIndex >= presets.length) return "";
    return getPresetValue(presets[actualIndex]) || "";
}
function selectedSwitchValues(data, presets) {
    const values = [];
    for (let i = 0; i < presets.length; i++)if (data[i] === true) values.push(getPresetValue(presets[i]));
    return values;
}
function joinParts(parts) { return parts.filter(part => part !== undefined && part !== null && part !== "").join(", ") }

const clothingGroups = [
    {
        title: "Tops",
        description: "Upper-body styling",
        presets: ["a loose fitting T-shirt", "a fitted T-shirt", "a tank top", "a crop top", { label: "a short crop top", value: "a crop-top t-shirt showing significant underboob" }, "a blouse", "an unbuttoned mens dress shirt", "a hoodie"]
    },
    {
        title: "Dresses",
        description: "Dress and one-piece styles",
        presets: ["a short babydoll dress", "a summer dress", "one-piece swimsuit"]
    },
    {
        title: "Bottoms",
        description: "Skirts, shorts, and bottoms",
        presets: ["jeans", "shorts", "cutoff jean shorts", "mini-skirt", "pleated mini-skirt", "spandex leggings"]
    },
    {
        title: "Lingerie",
        description: "Lingerie and underlayers",
        presets: ["nude", "bikini-style panties", "thong", "string bikini", "garter belt", "lace bustier", "silk lingerie set", "black lace lingerie set", "red satin lingerie set", "sheer lace teddy", "transparent lace bra and panties", "lace-up corset", "satin chemise", "sheer bodystocking", "balconette bra and matching panties", "lace garter set", "leather lingerie set", "silk robe and lingerie set", "fishnet bodysuit", "push-up bra and thong set", "lace-up thigh-highs", "strapless corset set", "sheer robe with matching panties", "satin slip dress", "lace-up bustier set", "transparent vinyl lingerie", "corset over sheer stockings"]
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
        presets: ["barefoot", "white tube socks", "knee-high Hello Kitty socks", "knee-high Pokemon socks", "black fishnet stockings", "sheer lace stockings", "strappy heels", "lace-up knee boots", "platform boots", "stiletto heels", "cowboy boots", "thigh-high stockings", "thigh-high leather boots"]
    }
];

const clothingPresets = clothingGroups.flatMap(group => group.presets);

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

const actionGroups = [
    {
        title: "Position",
        description: "Pose setup choices",
        presets: ["standing", "sitting", "laying", "on a bed", "on a thick carpeted floor", "on {possessive} side", "facedown", "{possessive} face in the foreground", "on {possessive} back", "{possessive} butt at the edge of the bed", "standing in a doorway", "crawling toward the camera", "on {possessive} hands and knees"]
    },
    {
        title: "Legs",
        description: "Leg and body alignment",
        presets: ["legs straight", "elevated into the air", "knees locked", "bending at waist only", "leaning forward", "one knee bent", "knees bent", "one foot on the wall", "feet spread wide", "feet together", "feet crossed", "one leg raised", "1 foot against door frame", "{possessive} ass high in the air", "back arched", "chest puffed out", "knees together", "shoulders back"]
    },
    {
        title: "Arms and Hands",
        description: "Arm and hand positioning",
        presets: ["arms overhead", "hands on {possessive} hips", "hands on {possessive} knees", "hands behind {possessive} head", "hands in {possessive} hair", "one hand on {possessive} hip", "one hand touching {possessive} face", "hands resting on {possessive} thighs", "arms stretched out in front of {objectPronoun}"]
    },
    {
        title: "Head and Gaze",
        description: "Head position and facial direction",
        presets: ["looking at the camera", "looking away from the camera", "looking over {possessive} shoulder", "head tilted slightly", "looking down", "looking up", "eyes closed", "smiling at the camera", "surprised expression", "relaxed expression"]
    },
    {
        title: "Body Orientation",
        description: "Torso and body direction",
        presets: ["facing the camera", "facing away from the camera", "turned three-quarters toward the camera", "profile view", "back to the camera", "torso twisted toward the camera", "leaning toward the camera"]
    },
    {
        title: "Movement",
        description: "Motion and dynamic positioning",
        presets: ["mid-step", "walking toward the camera", "walking away from the camera", "running", "jumping", "spinning", "mid-stretch"]
    }
];

const cameraPerspectivePresets = [
    { label: "Eye level", value: "eye-level camera" },
    { label: "Low angle", value: "low-angle camera looking upward" },
    { label: "High angle", value: "high-angle camera looking downward" },
    { label: "Worm's-eye view", value: "worm's-eye view from near ground level" },
    { label: "Bird's-eye view", value: "bird's-eye view from directly above" },
    { label: "Dutch angle", value: "Dutch-angle camera" },
    { label: "Over-the-shoulder", value: "over-the-shoulder camera angle" },
    { label: "Close-up", value: "close-up camera framing" },
    { label: "Medium shot", value: "medium-shot camera framing" },
    { label: "Full-body", value: "full-body camera framing" }
];

const cameraOptionsPresets = [...cameraPerspectivePresets];

const timeOfDayPresets = [
    "sunrise",
    "early morning",
    "midday",
    "golden hour",
    "sunset",
    "blue hour",
    "night"
];

const lightingGroups = [
    {
        title: "Natural Lighting",
        description: "Natural and realistic lighting",
        presets: ["soft natural light", "bright daylight", "diffused window light", "overcast daylight", "warm sunlight", "dramatic sunlight"]
    },
    {
        title: "Cinematic Lighting",
        description: "Film-style lighting",
        presets: ["cinematic lighting", "three-point lighting", "rim lighting", "backlighting", "soft key light", "hard key light", "dramatic side lighting"]
    },
    {
        title: "Dark / Tenebrism",
        description: "Dark, high-contrast lighting",
        presets: ["tenebrism", "chiaroscuro lighting", "deep shadows", "high contrast lighting", "single-source dramatic lighting"]
    }
];

const artStylePresets = [
    "photorealistic",
    "cinematic photography",
    "editorial photography",
    "fashion photography",
    "professional studio photography",
    "natural candid photography",
    "documentary photography",
    "film still",
    "35mm film photography",
    "vintage photography"
];

function selectedGroupedSwitchValues(data, groups, startIndex = 0) {
    const values = [];
    let index = startIndex;
    for (const group of groups) {
        const groupData = data[index++] || [];
        values.push(...selectedSwitchValues(groupData, group.presets));
    }
    return values;
}

function getGenderForm(gender) {
    if (/\b(man|male|boy)\b/i.test(gender)) return "masculine";
    if (/\b(woman|female|girl)\b/i.test(gender)) return "feminine";
    return "neutral";
}

function applyGenderTerms(text, genderForm) {
    const terms = {
        masculine: {
            subjectPronoun: "he",
            objectPronoun: "him",
            possessive: "his",
            reflexive: "himself",
            personNoun: "man",
            genderNoun: "male"
        },
        feminine: {
            subjectPronoun: "she",
            objectPronoun: "her",
            possessive: "her",
            reflexive: "herself",
            personNoun: "woman",
            genderNoun: "female"
        },
        neutral: {
            subjectPronoun: "they",
            objectPronoun: "them",
            possessive: "their",
            reflexive: "themselves",
            personNoun: "person",
            genderNoun: ""
        }
    };

    const selected = terms[genderForm] || terms.neutral;
    let result = text;

    for (const key in selected) {
        result = result.replace(new RegExp(`\\{${key}\\}`, "gi"), selected[key]);
    }

    result = result.replace(/\b(man|woman|male|female|boy|girl)\b/gi, match => {
        const lower = match.toLowerCase();
        if (lower === "man" || lower === "boy") return selected.personNoun;
        if (lower === "woman" || lower === "girl") return selected.personNoun;
        if (lower === "male" || lower === "female") return selected.genderNoun;
        return match;
    });

    result = result.replace(/\bher\b/gi, match => {
        if (genderForm !== "feminine") return match;
        return "her";
    });

    return result;
}

function assertInputArray(name, value) {
    if (!Array.isArray(value)) throw new Error(`Input parsing sanity check failed: ${name} was not returned as an array.`);
}

function nextInputArray(name) {
    const value = inputs[sectionIdx++];
    assertInputArray(name, value);
    return value;
}

let sectionIdx = 0;

const subjectCount = 5;
const outfitCount = 5;
const actionCount = 5;
const cameraCount = 3;
const artStyleCount = 3;

const subjects = [];
const subjectLeadTexts = [];
const subjectDetailTexts = [];
const subjectGenderForms = [];

function subjectSection(title, description, presets, placeholder) {
    return this.section(title, description, menuWithPlaceholder(placeholder, presets));
}

for (let i = 0; i < subjectCount; i++) {
    const subjectParts = [];
    const subjectLeadParts = [];
    const subjectDetailsParts = [];

    const subjectData = nextInputArray(`Subject ${i + 1} — Identity`);

    const celebrity = selectedPresetValue(subjectData[0], celebrityPresets);
    const nationality = selectedPresetValue(subjectData[1], nationalityPresets);
    const gender = selectedPresetValue(subjectData[2], genderPresets);
    const age = selectedPresetValue(subjectData[3], agePresets);
    const skinTone = selectedPresetValue(subjectData[4], skinTonePresets);

    const genderForm = getGenderForm(gender);

    if (celebrity) subjectLeadParts.push(celebrity);
    if (nationality) subjectLeadParts.push(nationality);
    if (gender) subjectLeadParts.push(gender);
    if (age) subjectDetailsParts.push(age);
    if (skinTone) subjectDetailsParts.push(skinTone);

    const bodyData = nextInputArray(`Subject ${i + 1} — Body / Physique`);

    const overallBuild = selectedPresetValue(bodyData[0], overallBuildPresets);
    const height = selectedPresetValue(bodyData[1], heightPresets);
    const chest = selectedPresetValue(bodyData[2], chestPresets);
    const hips = selectedPresetValue(bodyData[3], hipPresets);
    const bodyShape = selectedPresetValue(bodyData[4], bodyShapePresets);
    const legs = selectedPresetValue(bodyData[5], legPresets);
    const assSize = selectedPresetValue(bodyData[6], assSizePresets);
    const bellySize = selectedPresetValue(bodyData[7], bellySizePresets);
    const specificBody = selectedPresetValue(bodyData[8], specificBodyPresets);

    subjectDetailsParts.push(...[overallBuild, height, chest, hips, bodyShape, legs, assSize, bellySize, specificBody].filter(Boolean));

    const appearanceData = nextInputArray(`Subject ${i + 1} — Appearance`);
    subjectDetailsParts.push(...selectedGroupedSwitchValues(appearanceData, appearanceSwitchGroups));

    const hairData = nextInputArray(`Subject ${i + 1} — Hair`);

    const hairColor = selectedPresetValue(hairData[0], hairColorPresets);
    const hairLength = selectedPresetValue(hairData[1], hairLengthPresets);
    const hairType = selectedPresetValue(hairData[2], hairTypePresets);

    let hairIdx = 3;
    const hairstyleParts = [];

    for (const group of hairstyleGroups) {
        const groupData = hairData[hairIdx++] || [];
        hairstyleParts.push(...selectedSwitchValues(groupData, group.presets));
    }

    const hairstyle = joinParts([...hairstyleParts]);

    const hairColorText = hairColor ? /\bhair\b/i.test(hairColor) ? hairColor : hairColor + " hair" : "";
    const hairDescription = joinParts([hairLength, hairType, hairstyle, hairColorText]);

    if (hairDescription) subjectDetailsParts.push(hairDescription);

    const additionalDetails = hairData[hairIdx++];
    if (additionalDetails) subjectDetailsParts.push(additionalDetails);

    const accessoryData = nextInputArray(`Subject ${i + 1} — Accessories`);
    subjectDetailsParts.push(...selectedGroupedSwitchValues(accessoryData, accessoryGroups));

    const subjectPartsFinal = [...subjectLeadParts, ...subjectDetailsParts];

    subjects.push(subjectPartsFinal.join(", "));
    subjectLeadTexts.push(subjectLeadParts.join(", "));
    subjectDetailTexts.push(subjectDetailsParts.join(", "));
    subjectGenderForms.push(genderForm);
}

const outfits = [];

for (let i = 0; i < outfitCount; i++) {
    const outfitParts = [];
    const outfitData = nextInputArray(`Outfit ${i + 1}`);

    const selectedOutfit = selectedPresetValue(outfitData[0], clothingPresets);
    if (selectedOutfit) outfitParts.push(selectedOutfit);

    const customOutfit = outfitData[1] || "";
    if (customOutfit) outfitParts.push(customOutfit);

    outfitParts.push(...selectedGroupedSwitchValues(outfitData, clothingGroups, 2));
    outfits.push(joinParts(outfitParts));
}

const actions = [];

for (let i = 0; i < actionCount; i++) {
    const actionParts = [];
    const actionData = nextInputArray(`Action / Pose ${i + 1}`);

    const selectedAction = selectedPresetValue(actionData[0], complexActionPresets);
    if (selectedAction) actionParts.push(selectedAction);

    const customAction = actionData[1] || "";
    if (customAction) actionParts.push(customAction);

    actionParts.push(...selectedGroupedSwitchValues(actionData, actionGroups, 2));
    actions.push(joinParts(actionParts));
}

const cameraData = nextInputArray("Camera");

const cameraChoices = Array.from(
    { length: cameraCount },
    (_, index) => selectedPresetValue(cameraData[index], cameraOptionsPresets)
).filter(Boolean);

if (cameraChoices.length === 0) cameraChoices.push("");

const lightingData = nextInputArray("Lighting");

const timeOfDay = selectedPresetValue(lightingData[0], timeOfDayPresets);

const lighting = joinParts(
    selectedGroupedSwitchValues(lightingData, lightingGroups, 1)
);

const templateData = nextInputArray("Prompt Template");

const artStyles = Array.from(
    { length: artStyleCount },
    (_, index) => selectedPresetValue(templateData[index], artStylePresets)
).filter(Boolean);

const promptTemplate = templateData[artStyleCount] || "";

let width = 1024;
let height = 1024;

const aspectDimensions = [
    [1024, 1024],
    [768, 1024],
    [1024, 768],
    [1024, 576]
];

if (aspectDimensions[aspectIndex]) {
    width = aspectDimensions[aspectIndex][0];
    height = aspectDimensions[aspectIndex][1];
}

function fillTemplate(template, values) {
    let result = template;
    for (const key in values) {
        result = result.replace(
            new RegExp(`\\{${key}\\}`, "gi"),
            values[key] || ""
        );
    }
    return result;
}

function cleanPrompt(prompt) {
    return prompt
        .replace(/(?:,\s*){2,}/g, ", ")
        .replace(/^\s*,\s*/g, "")
        .replace(/\s*,\s*$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

const finalPrompts = [];

const artStyleChoices = artStyles.length > 0 ? artStyles : [""];

for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
    const subject = subjects[subjectIndex] || "";
    const subjectLead = subjectLeadTexts[subjectIndex] || "";
    const subjectDetails = subjectDetailTexts[subjectIndex] || "";
    const genderForm = subjectGenderForms[subjectIndex] || "neutral";

    for (const outfit of outfits) {
        for (const action of actions) {
            for (const camera of cameraChoices) {
                for (const artStyle of artStyleChoices) {

                    const templateValues = {
                        artStyle: artStyle,
                        camera: camera,
                        subject: subject,
                        subjectLead: subjectLead,
                        subjectDetails: subjectDetails,
                        clothing: outfit,
                        action: action,
                        timeOfDay: timeOfDay,
                        lighting: lighting
                    };

                    let constructedPrompt = fillTemplate(promptTemplate, templateValues);

                    constructedPrompt = applyGenderTerms(
                        constructedPrompt,
                        genderForm
                    );

                    constructedPrompt = cleanPrompt(
                        constructedPrompt
                    );

                    finalPrompts.push(
                        constructedPrompt
                    );

                }
            }
        }
    }
}

async function generateBatch() {

    if (finalPrompts.length === 0) {
        throw new Error(
            "No prompts were generated. Check your subject, outfit, action, camera, and art-style selections."
        );
    }

    const config = JSON.parse(
        JSON.stringify(
            pipeline.configuration
        )
    );

    config.model = "krea_2_turbo_i8x.ckpt";
    config.width = width;
    config.height = height;
    config.batchCount = 1;
    config.batchSize = 1;
    config.seed = -1;

    canvas.clear();

    for (const prompt of finalPrompts) {

        console.log(
            "Generating Prompt:",
            prompt
        );

        await pipeline.run({
            configuration: config,
            prompt: prompt
        });

    }
}

generateBatch();