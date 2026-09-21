//@api-1.0
// version 14
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// Version 14
//
// Metadata-driven generation architecture
// Relationship-aware randomization
// =========================================


// =========================================
// CONSTANTS
// =========================================

const NONE_SELECTED = 0;

const PREVIEW_SAMPLE_SIZE = 8;

const ASPECT_OPTIONS = [
  { id: "aspect.square", label: "1:1", width: 1024, height: 1024 },
  { id: "aspect.portrait", label: "3:4 Portrait", width: 768, height: 1024 },
  { id: "aspect.landscape", label: "4:3 Landscape", width: 1024, height: 768 },
  { id: "aspect.wide", label: "16:9", width: 1024, height: 576 }
];

const ASPECT_DIMENSIONS = ASPECT_OPTIONS.map(({ width, height }) => [width, height]);


// =========================================
// DEFAULT PROMPT FALLBACKS
// =========================================

const DEFAULT_PROMPT_FALLBACKS = {
  subject: "a woman",
  outfit: "t-shirt and jeans",
  action: "smiling",
  camera: "candid",
  timeOfDay: "natural daytime illumination",
  lighting: "soft directional light, balanced exposure, and ambient fill",
  artStyle: "photo",
  genericPrompt: "a portrait of the subject"
};


// =========================================
// MODEL OPTIONS
// =========================================
//
// "file" must exactly match the model filename
// installed in Draw Things.
//
// "loras" contains the LoRAs associated with
// that model and their weights.
//

const MODEL_OPTIONS = [
  {
    id: "model.flux2_klein",
    label: "Flux.2 Klein",
    file: "flux_2_klein_9b_i8x.ckpt",
    loras: [
      {
        id: "lora.klein_snofs",
        file: "klein_snofs_v1_4_fixed_lora_lora_f16.ckpt",
        weight: 1.4
      }
    ]
  },
  {
    id: "model.krea2",
    label: "Krea 2",
    file: "krea_2_turbo_i8x.ckpt",
    loras: [
      {
        id: "lora.pornmaster_krea2",
        file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
        weight: 1.0
      },
      {
        id: "lora.mysticxxx_krea2",
        file: "mysticxxx_krea2_v3_lora_f16.ckpt",
        weight: 0.6
      }
    ]
  }
];


// =========================================
// PROMPT ENHANCER
// =========================================

const ENHANCER_MODEL = "qwen_3.5_4b_i8x.ckpt";

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
// RANDOM HELPERS
// =========================================

function randomInt(maxExclusive) {
  if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * maxExclusive);
}


function randomElement(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }

  return array[randomInt(array.length)];
}


function shuffleArray(array) {
  const result = Array.isArray(array) ? [...array] : [];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


function randomChance(probability) {
  if (!Number.isFinite(probability) || probability <= 0) {
    return false;
  }

  if (probability >= 1) {
    return true;
  }

  return Math.random() < probability;
}


// =========================================
// PRESET METADATA HELPERS
// =========================================
//
// V14 allows presets to be simple strings OR
// metadata objects.
//
// Both remain valid:
//
//     "blue eyes"
//
// or:
//
//     {
//         id: "eyes.blue",
//         label: "Blue",
//         value: "blue eyes"
//     }
//
// This lets us convert the large V13 preset
// library gradually without having to rewrite
// every option into an object.
//

function unwrapPreset(preset, key) {
  if (
    typeof preset === "object" &&
    preset !== null &&
    Object.prototype.hasOwnProperty.call(preset, key)
  ) {
    return preset[key];
  }

  return preset;
}


function getPresetId(preset, fallbackId = "") {
  if (
    typeof preset === "object" &&
    preset !== null &&
    preset.id
  ) {
    return preset.id;
  }

  return fallbackId;
}


function getPresetLabel(preset) {
  if (
    typeof preset === "object" &&
    preset !== null &&
    preset.label !== undefined
  ) {
    return preset.label;
  }

  return preset;
}


function getPresetValue(preset) {
  if (
    typeof preset === "object" &&
    preset !== null &&
    preset.value !== undefined
  ) {
    return preset.value;
  }

  return preset;
}


function getPresetMetadata(preset) {
  if (
    typeof preset === "object" &&
    preset !== null &&
    preset.metadata &&
    typeof preset.metadata === "object"
  ) {
    return preset.metadata;
  }

  return {};
}


function presetLabels(presets) {
  return presets.map(getPresetLabel);
}


function menuWithPlaceholder(placeholder, presets) {
  return [placeholder, ...presetLabels(presets)];
}


function findPresetMenuIndex(presets, targetValue) {
  const index = presets.findIndex(preset =>
    getPresetValue(preset) === targetValue ||
    getPresetLabel(preset) === targetValue
  );

  return index >= 0 ? index + 1 : NONE_SELECTED;
}


function presetSwitches(presets) {
  return presets.map(preset =>
    this.switch(false, `✡︎  ${getPresetLabel(preset)}`)
  );
}


function selectedValueWithPlaceholder(index, presets) {
  if (index <= 0) {
    return "";
  }

  const actualIndex = index - 1;

  if (
    actualIndex < 0 ||
    actualIndex >= presets.length
  ) {
    return "";
  }

  return getPresetValue(presets[actualIndex]) || "";
}


function selectedValueNoPlaceholder(index, presets) {
  if (
    index < 0 ||
    index >= presets.length
  ) {
    return "";
  }

  return getPresetValue(presets[index]) || "";
}


function selectedSwitchValues(data, presets) {
  const values = [];

  if (!Array.isArray(data)) {
    return values;
  }

  for (let i = 0; i < presets.length; i++) {
    if (data[i] === true) {
      values.push(getPresetValue(presets[i]));
    }
  }

  return values;
}


function joinParts(parts) {
  return parts
    .filter(part =>
      part !== undefined &&
      part !== null &&
      part !== ""
    )
    .join(", ");
}


// =========================================
// OPTION ID GENERATION
// =========================================
//
// Existing V13 options don't all have explicit IDs.
//
// V14 supports explicit IDs whenever available,
// while retaining a predictable fallback for the
// existing string-based preset library.
//

function slugifyId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}


function getOptionId(category, preset) {
  const explicitId = getPresetId(preset);

  if (explicitId) {
    return explicitId;
  }

  return `${category}.${slugifyId(getPresetLabel(preset))}`;
}


// =========================================
// GENERATION STATE
// =========================================
//
// This is the central object used by the V14
// relationship engine.
//
// Every time the generator makes a decision,
// the selected value is written into this state.
//
// Later decisions can therefore see earlier
// decisions.
//

function createGenerationState() {
  return {
    gender: "",
    nationality: "",
    nationalityProfile: "",
    age: "",

    skin: "",
    eyes: "",

    overallBuild: "",
    height: "",
    chest: "",
    hips: "",
    lips: "",
    eyelashes: "",
    bodyShape: "",
    legs: "",
    buttocks: "",
    belly: "",
    specificBody: "",

    makeup: [],
    makeupOddities: [],
    facialHair: [],
    tattoos: [],
    bodyDetails: [],
    nails: [],
    hairDetails: [],
    nose: [],

    hairColor: "",
    hairLength: "",
    hairType: "",
    hairstyles: [],

    accessories: [],

    clothing: [],
    clothingGroups: [],

    action: [],
    actionGroups: [],

    camera: "",
    lighting: "",
    timeOfDay: "",
    artStyle: "",

    // Additional arbitrary state values can be
    // stored here without changing the engine.
    custom: {}
  };
}


function setGenerationState(state, category, value) {
  if (!state || !category) {
    return;
  }

  state[category] = value;
}


function getGenerationStateValue(state, category) {
  if (!state || !category) {
    return "";
  }

  return state[category];
}


// =========================================
// RELATIONSHIP TYPES
// =========================================
//
// These are intentionally descriptive.
//
// BLOCKED
//     Option cannot be selected automatically.
//
// REQUIRED
//     Option becomes required when the condition
//     is satisfied.
//
// PREFERRED
//     Option receives increased weight.
//
// DISCOURAGED
//     Option remains possible but receives reduced
//     weight.
//
// NEUTRAL
//     No weighting change.
//
// The important distinction is that V14 does NOT
// need a different randomization function for each
// category.
//

const RELATIONSHIP_TYPES = Object.freeze({
  BLOCKED: "blocked",
  REQUIRED: "required",
  PREFERRED: "preferred",
  NEUTRAL: "neutral",
  DISCOURAGED: "discouraged"
});


// =========================================
// COMPATIBILITY RULES
// =========================================
//
// This starts empty.
//
// As the preset library is converted, rules can
// live here OR directly in preset metadata.
//
// That means the generator can support both:
//
//     metadata on an option
//
// and:
//
//     centralized compatibility definitions
//
// without changing the selection engine.
//

const COMPATIBILITY_RULES = {};


// =========================================
// COMPATIBILITY CONDITIONS
// =========================================
//
// A condition looks like:
//
// {
//     category: "gender",
//     values: ["woman"]
// }
//
// Multiple conditions in the same array are treated
// as OR conditions.
//
// This allows:
//
//     gender = woman OR man
//
// while more advanced AND logic can be represented
// by nested rule groups later.
//

function normalizeCompatibilityValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
}


function compatibilityValueMatches(actualValue, allowedValues) {
  if (!Array.isArray(allowedValues)) {
    return false;
  }

  const actual = normalizeCompatibilityValue(actualValue);

  if (!actual) {
    return false;
  }

  return allowedValues.some(value =>
    normalizeCompatibilityValue(value) === actual
  );
}


function compatibilityConditionMatches(condition, state) {
  if (
    !condition ||
    !condition.category ||
    !state
  ) {
    return false;
  }

  const actualValue = getGenerationStateValue(
    state,
    condition.category
  );

  return compatibilityValueMatches(
    actualValue,
    condition.values
  );
}


function anyCompatibilityConditionMatches(
  conditions,
  state
) {
  if (!Array.isArray(conditions)) {
    return false;
  }

  return conditions.some(condition =>
    compatibilityConditionMatches(condition, state)
  );
}


function allCompatibilityConditionsMatch(
  conditions,
  state
) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return false;
  }

  return conditions.every(condition =>
    compatibilityConditionMatches(condition, state)
  );
}


// =========================================
// RULE LOOKUP
// =========================================

function getCompatibilityRule(category, preset) {
  const optionId = getOptionId(category, preset);

  const metadata = getPresetMetadata(preset);

  if (
    metadata.compatibility &&
    typeof metadata.compatibility === "object"
  ) {
    return metadata.compatibility;
  }

  return COMPATIBILITY_RULES[optionId] || null;
}


// =========================================
// OPTION ALLOWANCE
// =========================================
//
// This answers:
//
//     "Is this option even eligible?"
//
// Weighting is handled separately.
//
// This separation is important because a discouraged
// option is still allowed, while a blocked option is not.
//

function isOptionAllowed(category, preset, state) {
  const rule = getCompatibilityRule(category, preset);

  if (!rule) {
    return true;
  }

  // BLOCKED conditions always win.
  if (
    anyCompatibilityConditionMatches(
      rule.blockedWhen,
      state
    )
  ) {
    return false;
  }

  // An allowedWhen rule means at least one of the
  // listed conditions must be satisfied.
  if (
    Array.isArray(rule.allowedWhen) &&
    rule.allowedWhen.length > 0
  ) {
    if (
      !anyCompatibilityConditionMatches(
        rule.allowedWhen,
        state
      )
    ) {
      return false;
    }
  }

  // allOfBlockedWhen allows a combination of
  // conditions to block an option.
  if (
    Array.isArray(rule.blockedWhenAll) &&
    rule.blockedWhenAll.length > 0
  ) {
    if (
      allCompatibilityConditionsMatch(
        rule.blockedWhenAll,
        state
      )
    ) {
      return false;
    }
  }

  return true;
}


// =========================================
// COMPATIBILITY WEIGHT
// =========================================
//
// This answers:
//
//     "If the option is allowed, how desirable
//      should it be for this particular state?"
//
// Base profile weights and relationship multipliers
// are deliberately kept separate.
//

function getCompatibilityWeight(category, preset, state) {
  const rule = getCompatibilityRule(category, preset);

  if (!rule) {
    return 1;
  }

  if (!isOptionAllowed(category, preset, state)) {
    return 0;
  }

  let multiplier = 1;

  if (
    anyCompatibilityConditionMatches(
      rule.requiredWhen,
      state
    )
  ) {
    multiplier *= 100;
  }

  if (
    anyCompatibilityConditionMatches(
      rule.preferredWhen,
      state
    )
  ) {
    multiplier *= Number.isFinite(rule.preferredMultiplier)
      ? rule.preferredMultiplier
      : 3;
  }

  if (
    anyCompatibilityConditionMatches(
      rule.discouragedWhen,
      state
    )
  ) {
    multiplier *= Number.isFinite(rule.discouragedMultiplier)
      ? rule.discouragedMultiplier
      : 0.25;
  }

  return multiplier;
}


// =========================================
// WEIGHTED SELECTION
// =========================================

function weightedPick(entries) {
  const pool = entries.filter(entry =>
    entry &&
    entry.value !== undefined &&
    entry.value !== null &&
    entry.value !== "" &&
    Number.isFinite(entry.weight) &&
    entry.weight > 0
  );

  if (pool.length === 0) {
    return "";
  }

  const totalWeight = pool.reduce(
    (sum, entry) => sum + entry.weight,
    0
  );

  let roll = Math.random() * totalWeight;

  for (const entry of pool) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.value;
    }
  }

  return pool[pool.length - 1].value;
}


// =========================================
// COMPATIBILITY-AWARE WEIGHTED PRESET
// =========================================
//
// This replaces the idea of:
//
//     weightedPresetValue()
//
// as the primary random-selection mechanism.
//
// The selection process is now:
//
//     1. Look at the base/profile weight.
//     2. Check compatibility.
//     3. Apply relationship multiplier.
//     4. Remove blocked options.
//     5. Perform one weighted selection.
//

function compatibleWeightedPresetValue(
  presets,
  category,
  state,
  weightTable,
  defaultWeight = 0.05
) {
  if (!Array.isArray(presets) || presets.length === 0) {
    return "";
  }

  const entries = presets.map(preset => {
    const label = getPresetLabel(preset);
    const value = getPresetValue(preset);

    const baseWeight =
      weightTable &&
        weightTable[label] !== undefined
        ? weightTable[label]
        : defaultWeight;

    const compatibilityWeight =
      getCompatibilityWeight(
        category,
        preset,
        state
      );

    return {
      value,
      weight: baseWeight * compatibilityWeight
    };
  });

  return weightedPick(entries);
}


// =========================================
// COMPATIBLE OPTION LIST
// =========================================

function getCompatiblePresets(
  presets,
  category,
  state
) {
  if (!Array.isArray(presets)) {
    return [];
  }

  return presets.filter(preset =>
    isOptionAllowed(
      category,
      preset,
      state
    )
  );
}


// =========================================
// COMPATIBLE RANDOM PICK
// =========================================

function randomCompatiblePreset(
  presets,
  category,
  state
) {
  const compatible = getCompatiblePresets(
    presets,
    category,
    state
  );

  if (compatible.length === 0) {
    return "";
  }

  return getPresetValue(
    randomElement(compatible)
  ) || "";
}


// =========================================
// COMPATIBLE SWITCH SELECTION
// =========================================
//
// Used for categories where multiple traits may
// be selected, such as:
//
//     makeup
//     tattoos
//     body details
//     accessories
//     hairstyles
//
// Unlike V13's randomSwitchValues(), this does
// not blindly choose from the entire array.
//

function randomCompatibleSwitchValues(
  presets,
  category,
  state,
  count
) {
  const compatible = getCompatiblePresets(
    presets,
    category,
    state
  );

  if (compatible.length === 0 || count <= 0) {
    return [];
  }

  return shuffleArray(compatible)
    .slice(
      0,
      Math.min(count, compatible.length)
    )
    .map(getPresetValue)
    .filter(value =>
      value !== undefined &&
      value !== null &&
      value !== ""
    );
}


// =========================================
// STATE-AWARE RELATIONSHIP DESCRIPTION
// =========================================
//
// This isn't used to generate prompts.
//
// It exists so later parts of V14 can inspect
// relationships without duplicating logic.
//

function optionHasRelationship(
  category,
  preset,
  relationshipType,
  state
) {
  const rule = getCompatibilityRule(
    category,
    preset
  );

  if (!rule) {
    return false;
  }

  switch (relationshipType) {
    case RELATIONSHIP_TYPES.BLOCKED:
      return anyCompatibilityConditionMatches(
        rule.blockedWhen,
        state
      );

    case RELATIONSHIP_TYPES.REQUIRED:
      return anyCompatibilityConditionMatches(
        rule.requiredWhen,
        state
      );

    case RELATIONSHIP_TYPES.PREFERRED:
      return anyCompatibilityConditionMatches(
        rule.preferredWhen,
        state
      );

    case RELATIONSHIP_TYPES.DISCOURAGED:
      return anyCompatibilityConditionMatches(
        rule.discouragedWhen,
        state
      );

    default:
      return false;
  }
}


// =========================================
// STATE SNAPSHOT
// =========================================
//
// Useful for debugging and for the review screen.
//
// This gives us a clean way to inspect exactly
// what the generator believed it had selected.
//

function cloneGenerationState(state) {
  return JSON.parse(JSON.stringify(state));
}
// =========================================
// IDENTITY / PROFILE PRESETS
// =========================================
//
// V14 separates:
//
//     IDENTITY
//         "Irish"
//
// from:
//
//     APPEARANCE PROFILE
//         "celtic"
//
// The profile supplies relationship/weighting context.
// It does NOT hard-code the final appearance.
//
// This allows:
//     Irish + fair skin + red hair
// but also:
//     Irish + dark hair
//
// without forcing one giant nationality description
// into every generated prompt.
// =========================================

const genderPresets = [
  {
    id: "gender.woman",
    label: "Woman",
    value: "woman"
  },
  {
    id: "gender.man",
    label: "Man",
    value: "man"
  }
];


const nationalityPresets = [
  {
    id: "nationality.caucasian",
    label: "Caucasian",
    short: "Caucasian",
    profile: "westEuropean",
    value: "Caucasian"
  },
  {
    id: "nationality.black",
    label: "Black",
    short: "Black",
    profile: "african",
    value: "Black"
  },
  {
    id: "nationality.mixed_race",
    label: "Mixed-Race",
    short: "Mixed-race",
    profile: "mixed",
    value: "Mixed-race"
  },
  {
    id: "nationality.mexican",
    label: "Mexican",
    short: "Mexican",
    profile: "latina",
    value: "Mexican"
  },
  {
    id: "nationality.indian",
    label: "Indian",
    short: "Indian",
    profile: "southAsian",
    value: "Indian"
  },
  {
    id: "nationality.thai",
    label: "Thai",
    short: "Thai",
    profile: "southeastAsian",
    value: "Thai"
  },
  {
    id: "nationality.japanese",
    label: "Japanese",
    short: "Japanese",
    profile: "eastAsian",
    value: "Japanese"
  },
  {
    id: "nationality.korean",
    label: "Korean",
    short: "Korean",
    profile: "eastAsian",
    value: "Korean"
  },
  {
    id: "nationality.filipina",
    label: "Filipina",
    short: "Filipina",
    profile: "southeastAsian",
    value: "Filipina"
  },
  {
    id: "nationality.brazilian",
    label: "Brazilian",
    short: "Brazilian",
    profile: "brazilian",
    value: "Brazilian"
  },
  {
    id: "nationality.italian",
    label: "Italian",
    short: "Italian",
    profile: "mediterranean",
    value: "Italian"
  },
  {
    id: "nationality.scandinavian",
    label: "Scandinavian",
    short: "Scandinavian",
    profile: "nordic",
    value: "Scandinavian"
  },
  {
    id: "nationality.russian",
    label: "Russian / Eastern European",
    short: "Russian",
    profile: "slavic",
    value: "Russian / Eastern European"
  },
  {
    id: "nationality.chinese",
    label: "Chinese",
    short: "Chinese",
    profile: "eastAsian",
    value: "Chinese"
  },
  {
    id: "nationality.vietnamese",
    label: "Vietnamese",
    short: "Vietnamese",
    profile: "southeastAsian",
    value: "Vietnamese"
  },
  {
    id: "nationality.middle_eastern",
    label: "Middle Eastern",
    short: "Middle Eastern",
    profile: "middleEastern",
    value: "Middle Eastern"
  },
  {
    id: "nationality.french",
    label: "French",
    short: "French",
    profile: "westEuropean",
    value: "French"
  },
  {
    id: "nationality.german",
    label: "German",
    short: "German",
    profile: "westEuropean",
    value: "German"
  },
  {
    id: "nationality.irish",
    label: "Irish",
    short: "Irish",
    profile: "celtic",
    value: "Irish"
  },
  {
    id: "nationality.native_american",
    label: "Native American",
    short: "Native American",
    profile: "nativeAmerican",
    value: "Native American"
  },
  {
    id: "nationality.polynesian",
    label: "Polynesian / Pacific Islander",
    short: "Polynesian",
    profile: "polynesian",
    value: "Polynesian / Pacific Islander"
  },
  {
    id: "nationality.ethiopian",
    label: "Ethiopian / East African",
    short: "Ethiopian",
    profile: "eastAfrican",
    value: "Ethiopian / East African"
  }
];


// =========================================
// AGE PRESETS
// =========================================
//
// Ages remain adults only.
//
// Each preset has metadata so later systems can
// respond to age without having to parse strings.
//

const agePresets = [
  {
    id: "age.18_24",
    label: "18–24",
    value: "18–24 years old",
    min: 18,
    max: 24,
    midpoint: 21
  },
  {
    id: "age.25_34",
    label: "25–34",
    value: "25–34 years old",
    min: 25,
    max: 34,
    midpoint: 29
  },
  {
    id: "age.35_44",
    label: "35–44",
    value: "35–44 years old",
    min: 35,
    max: 44,
    midpoint: 39
  },
  {
    id: "age.45_54",
    label: "45–54",
    value: "45–54 years old",
    min: 45,
    max: 54,
    midpoint: 49
  },
  {
    id: "age.55_64",
    label: "55–64",
    value: "55–64 years old",
    min: 55,
    max: 64,
    midpoint: 59
  },
  {
    id: "age.65_74",
    label: "65–74",
    value: "65–74 years old",
    min: 65,
    max: 74,
    midpoint: 69
  },
  {
    id: "age.75_85",
    label: "75–85",
    value: "75–85 years old",
    min: 75,
    max: 85,
    midpoint: 80
  }
];


// =========================================
// SKIN TONE PRESETS
// =========================================

const skinTonePresets = [
  {
    id: "skin.porcelain",
    label: "Porcelain",
    value: "porcelain skin"
  },
  {
    id: "skin.pale",
    label: "Pale",
    value: "pale skin"
  },
  {
    id: "skin.fair",
    label: "Fair",
    value: "fair skin"
  },
  {
    id: "skin.tanned",
    label: "Tanned",
    value: "tanned sun-kissed skin"
  },
  {
    id: "skin.cream",
    label: "Cream",
    value: "cream skin"
  },
  {
    id: "skin.olive",
    label: "Olive",
    value: "olive skin"
  },
  {
    id: "skin.caramel",
    label: "Caramel",
    value: "caramel skin"
  },
  {
    id: "skin.golden_bronze",
    label: "Golden-Bronze",
    value: "golden-bronze skin"
  },
  {
    id: "skin.warm_brown",
    label: "Warm Brown",
    value: "warm brown skin"
  },
  {
    id: "skin.dark",
    label: "Dark",
    value: "dark skin"
  },
  {
    id: "skin.dark_glossy",
    label: "Dark Glossy",
    value: "dark glossy skin"
  },
  {
    id: "skin.nubian",
    label: "Dark Nubian",
    value: "dark black Nubian skin with a glossy sheen"
  }
];


// =========================================
// EYE COLOR PRESETS
// =========================================

const eyeColorPresets = [
  {
    id: "eyes.blue",
    label: "Blue",
    value: "blue eyes"
  },
  {
    id: "eyes.green",
    label: "Green",
    value: "green eyes"
  },
  {
    id: "eyes.hazel",
    label: "Hazel",
    value: "hazel eyes"
  },
  {
    id: "eyes.brown",
    label: "Brown",
    value: "brown eyes"
  },
  {
    id: "eyes.dark_brown",
    label: "Dark Brown",
    value: "dark brown eyes"
  },
  {
    id: "eyes.amber",
    label: "Amber",
    value: "amber eyes"
  },
  {
    id: "eyes.gray",
    label: "Gray",
    value: "gray eyes"
  },
  {
    id: "eyes.violet",
    label: "Violet",
    value: "violet eyes"
  },
  {
    id: "eyes.heterochromia",
    label: "Heterochromia",
    value: "heterochromatic eyes"
  }
];


// =========================================
// BODY BUILD
// =========================================

const overallBuildPresets = [
  {
    id: "build.slim",
    label: "Slim",
    value: "slim build"
  },
  {
    id: "build.soft_fit",
    label: "Soft Fit Frame",
    value: "soft fit frame"
  },
  {
    id: "build.average",
    label: "Average",
    value: "average build"
  },
  {
    id: "build.petite",
    label: "Petite",
    value: "petite build"
  },
  {
    id: "build.curvy",
    label: "Curvy",
    value: "curvy build"
  },
  {
    id: "build.muscular",
    label: "Muscular",
    value: "muscular build"
  },
  {
    id: "build.chubby",
    label: "Chubby",
    value: "chubby build"
  },
  {
    id: "build.large_frame",
    label: "Large Frame",
    value: "large frame"
  }
];


// =========================================
// HEIGHT
// =========================================

const heightPresets = [
  {
    id: "height.short",
    label: "Short",
    value: "short stature"
  },
  {
    id: "height.average",
    label: "Average",
    value: "average height"
  },
  {
    id: "height.tall",
    label: "Tall",
    value: "tall stature"
  }
];


// =========================================
// CHEST
// =========================================

const chestPresets = [
  {
    id: "chest.flat",
    label: "Flat",
    value: "flat chest"
  },
  {
    id: "chest.small",
    label: "Small",
    value: "small breasts"
  },
  {
    id: "chest.average",
    label: "Average",
    value: "average breasts"
  },
  {
    id: "chest.full",
    label: "Full",
    value: "full breasts"
  },
  {
    id: "chest.large",
    label: "Large",
    value: "large breasts"
  }
];


// =========================================
// HIPS
// =========================================

const hipPresets = [
  {
    id: "hips.narrow",
    label: "Narrow",
    value: "narrow hips"
  },
  {
    id: "hips.average",
    label: "Average",
    value: "average hips"
  },
  {
    id: "hips.wide",
    label: "Wide",
    value: "wide hips"
  }
];


// =========================================
// LIPS
// =========================================

const lipsPresets = [
  {
    id: "lips.thin",
    label: "Thin",
    value: "thin lips"
  },
  {
    id: "lips.natural",
    label: "Natural",
    value: "natural lips"
  },
  {
    id: "lips.full",
    label: "Full",
    value: "full lips"
  },
  {
    id: "lips.plump",
    label: "Plump",
    value: "plump lips"
  }
];


// =========================================
// EYELASHES
// =========================================

const eyelashPresets = [
  {
    id: "lashes.natural",
    label: "Natural",
    value: "natural eyelashes"
  },
  {
    id: "lashes.long",
    label: "Long",
    value: "long eyelashes"
  },
  {
    id: "lashes.thick",
    label: "Thick",
    value: "thick eyelashes"
  },
  {
    id: "lashes.very_thick",
    label: "Very Thick",
    value: "very thick eyelashes"
  }
];


// =========================================
// BODY SHAPE
// =========================================

const bodyShapePresets = [
  {
    id: "body_shape.none",
    label: "No Specific Shape",
    value: ""
  },
  {
    id: "body_shape.petite",
    label: "Petite Frame",
    value: "petite frame"
  },
  {
    id: "body_shape.hourglass",
    label: "Hourglass",
    value: "hourglass body shape"
  },
  {
    id: "body_shape.pear",
    label: "Pear",
    value: "pear-shaped body"
  },
  {
    id: "body_shape.rectangle",
    label: "Rectangle",
    value: "rectangular body shape"
  },
  {
    id: "body_shape.inverted_triangle",
    label: "Inverted Triangle",
    value: "inverted-triangle body shape"
  },
  {
    id: "body_shape.apple",
    label: "Apple",
    value: "apple-shaped body"
  }
];


// =========================================
// LEG SHAPE
// =========================================

const legPresets = [
  {
    id: "legs.slender",
    label: "Slender",
    value: "slender legs"
  },
  {
    id: "legs.athletic",
    label: "Athletic",
    value: "athletic legs"
  },
  {
    id: "legs.toned",
    label: "Toned",
    value: "toned legs"
  },
  {
    id: "legs.muscular",
    label: "Muscular",
    value: "muscular legs"
  },
  {
    id: "legs.thick",
    label: "Thick",
    value: "thick legs"
  },
  {
    id: "legs.full",
    label: "Full",
    value: "full legs"
  }
];


// =========================================
// BUTTOCK SIZE
// =========================================

const assSizePresets = [
  {
    id: "buttocks.small",
    label: "Small",
    value: "small buttocks"
  },
  {
    id: "buttocks.average",
    label: "Average",
    value: "average buttocks"
  },
  {
    id: "buttocks.full",
    label: "Full",
    value: "full buttocks"
  },
  {
    id: "buttocks.large",
    label: "Large",
    value: "large buttocks"
  }
];


// =========================================
// BELLY SIZE
// =========================================

const bellySizePresets = [
  {
    id: "belly.flat",
    label: "Flat",
    value: "flat stomach"
  },
  {
    id: "belly.soft",
    label: "Soft",
    value: "soft stomach"
  },
  {
    id: "belly.average",
    label: "Average",
    value: "average stomach"
  },
  {
    id: "belly.round",
    label: "Round",
    value: "round stomach"
  },
  {
    id: "belly.large",
    label: "Large",
    value: "large stomach"
  }
];


// =========================================
// SPECIFIC BODY CONDITIONS
// =========================================

const specificBodyPresets = [
  {
    id: "specific_body.none",
    label: "No Specific Condition",
    value: ""
  },
  {
    id: "specific_body.achondroplasia",
    label: "Adult with Achondroplasia",
    value: "adult with achondroplasia"
  },
  {
    id: "specific_body.pregnant",
    label: "Pregnant",
    value: "pregnant"
  },
  {
    id: "specific_body.heavily_pregnant",
    label: "Heavily Pregnant",
    value: "heavily pregnant"
  }
];


// =========================================
// CORE PROFILE WEIGHTS
// =========================================
//
// These are generator preferences, NOT claims about
// what every person from a population looks like.
//
// A profile simply makes some visual options more
// likely than others.
//
// Unlisted options remain possible through the
// default compatibility weight.
//

const TRAIT_PROFILES = {

  celtic: {
    skin: {
      "Porcelain": 5,
      "Pale": 5,
      "Fair": 4,
      "Cream": 1.5,
      "Tanned": 0.15
    },

    hairColor: {
      "Red": 4,
      "Copper / Ginger": 3.5,
      "Auburn": 3,
      "Brunette": 3,
      "Blonde": 2,
      "Chestnut Brown": 1.5,
      "Black": 0.4
    },

    hairType: {
      "Straight": 2,
      "Wavy": 3.5,
      "Curly": 2.5,
      "Frizzy": 0.5
    },

    eyes: {
      "Blue": 4.5,
      "Green": 4,
      "Hazel": 2,
      "Gray": 1.5,
      "Brown": 1
    },

    appearance: {
      freckles: 3
    }
  },


  nordic: {
    skin: {
      "Porcelain": 5,
      "Pale": 5,
      "Fair": 4,
      "Cream": 2,
      "Tanned": 0.2
    },

    hairColor: {
      "Blonde": 5,
      "Light Blonde": 4,
      "Brunette": 1.5,
      "Red": 1,
      "Auburn": 0.8,
      "Black": 0.3
    },

    hairType: {
      "Straight": 4,
      "Wavy": 3,
      "Curly": 1
    },

    eyes: {
      "Blue": 5,
      "Gray": 3,
      "Green": 2.5,
      "Hazel": 1,
      "Brown": 0.5
    }
  },


  westEuropean: {
    skin: {
      "Fair": 4,
      "Pale": 2.5,
      "Cream": 2,
      "Olive": 1.5,
      "Tanned": 1
    },

    hairColor: {
      "Brunette": 4,
      "Blonde": 3,
      "Chestnut Brown": 2.5,
      "Black": 1.5,
      "Auburn": 1,
      "Red": 0.8
    },

    hairType: {
      "Straight": 3,
      "Wavy": 3,
      "Curly": 1.5
    },

    eyes: {
      "Brown": 3,
      "Blue": 3,
      "Green": 2,
      "Hazel": 2,
      "Gray": 1
    }
  },


  mediterranean: {
    skin: {
      "Olive": 5,
      "Tanned": 4,
      "Caramel": 2,
      "Fair": 1.5,
      "Cream": 1
    },

    hairColor: {
      "Brunette": 5,
      "Black": 4,
      "Chestnut Brown": 2.5,
      "Auburn": 0.7,
      "Blonde": 0.5
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3,
      "Straight": 2
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 4,
      "Hazel": 2,
      "Green": 1.5,
      "Blue": 0.8
    }
  },


  slavic: {
    skin: {
      "Porcelain": 4,
      "Pale": 4,
      "Fair": 4,
      "Cream": 2,
      "Tanned": 0.8
    },

    hairColor: {
      "Brunette": 4,
      "Blonde": 3,
      "Chestnut Brown": 2.5,
      "Black": 1.5,
      "Auburn": 1
    },

    hairType: {
      "Straight": 4,
      "Wavy": 2.5,
      "Curly": 1
    },

    eyes: {
      "Blue": 3.5,
      "Green": 3,
      "Gray": 2,
      "Hazel": 2,
      "Brown": 1.5
    }
  },


  african: {
    skin: {
      "Dark": 5,
      "Dark Glossy": 4,
      "Nubian": 3,
      "Warm Brown": 2.5,
      "Golden-Bronze": 1.5,
      "Caramel": 1
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 4,
      "Brunette": 2
    },

    hairType: {
      "Curly": 5,
      "Coily": 5,
      "Wavy": 1,
      "Straight": 0.5
    },

    eyes: {
      "Dark Brown": 5,
      "Brown": 4,
      "Amber": 1.5,
      "Hazel": 0.8
    }
  },


  eastAfrican: {
    skin: {
      "Dark": 5,
      "Dark Glossy": 4,
      "Warm Brown": 4,
      "Golden-Bronze": 2
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 4,
      "Brunette": 2
    },

    hairType: {
      "Curly": 4,
      "Coily": 4,
      "Wavy": 1.5,
      "Straight": 0.5
    },

    eyes: {
      "Dark Brown": 5,
      "Brown": 4,
      "Amber": 1.5
    }
  },


  eastAsian: {
    skin: {
      "Porcelain": 3,
      "Fair": 4,
      "Cream": 3,
      "Tanned": 1,
      "Olive": 0.7
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 5,
      "Brunette": 3,
      "Chestnut Brown": 1.5
    },

    hairType: {
      "Straight": 6,
      "Wavy": 2,
      "Curly": 0.7
    },

    eyes: {
      "Dark Brown": 5,
      "Brown": 4,
      "Black": 3,
      "Hazel": 0.8
    }
  },


  southeastAsian: {
    skin: {
      "Warm Brown": 3,
      "Golden-Bronze": 4,
      "Caramel": 3,
      "Tanned": 3,
      "Olive": 1.5,
      "Fair": 1
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 5,
      "Brunette": 3
    },

    hairType: {
      "Straight": 4,
      "Wavy": 3,
      "Curly": 1
    },

    eyes: {
      "Dark Brown": 5,
      "Brown": 4,
      "Hazel": 0.8
    }
  },


  southAsian: {
    skin: {
      "Warm Brown": 4,
      "Caramel": 4,
      "Golden-Bronze": 3,
      "Olive": 2,
      "Tanned": 2,
      "Fair": 1
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 5,
      "Brunette": 3
    },

    hairType: {
      "Wavy": 3,
      "Straight": 3,
      "Curly": 2
    },

    eyes: {
      "Dark Brown": 6,
      "Brown": 4,
      "Hazel": 0.8
    }
  },


  middleEastern: {
    skin: {
      "Olive": 5,
      "Caramel": 3,
      "Tanned": 3,
      "Golden-Bronze": 2,
      "Warm Brown": 1.5,
      "Fair": 1
    },

    hairColor: {
      "Black": 5,
      "Dark Brown": 5,
      "Brunette": 4,
      "Chestnut Brown": 2
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3,
      "Straight": 2
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 5,
      "Hazel": 2,
      "Green": 0.8
    }
  },


  latina: {
    skin: {
      "Olive": 4,
      "Caramel": 4,
      "Golden-Bronze": 3,
      "Tanned": 3,
      "Warm Brown": 2,
      "Fair": 1
    },

    hairColor: {
      "Black": 5,
      "Dark Brown": 5,
      "Brunette": 4,
      "Chestnut Brown": 2
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3,
      "Straight": 2
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 4,
      "Hazel": 2,
      "Green": 0.8
    }
  },


  brazilian: {
    skin: {
      "Olive": 3,
      "Caramel": 3,
      "Golden-Bronze": 4,
      "Tanned": 4,
      "Warm Brown": 2,
      "Fair": 1
    },

    hairColor: {
      "Black": 4,
      "Dark Brown": 4,
      "Brunette": 4,
      "Chestnut Brown": 2,
      "Blonde": 1.5
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3,
      "Straight": 2
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 4,
      "Hazel": 2,
      "Green": 1,
      "Blue": 0.5
    }
  },


  nativeAmerican: {
    skin: {
      "Golden-Bronze": 4,
      "Warm Brown": 4,
      "Caramel": 3,
      "Tanned": 3,
      "Olive": 2,
      "Fair": 0.8
    },

    hairColor: {
      "Black": 5,
      "Dark Brown": 5,
      "Brunette": 3
    },

    hairType: {
      "Straight": 5,
      "Wavy": 3,
      "Curly": 1
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 4,
      "Hazel": 1.5,
      "Amber": 1
    }
  },


  polynesian: {
    skin: {
      "Warm Brown": 5,
      "Golden-Bronze": 5,
      "Caramel": 4,
      "Dark": 2,
      "Tanned": 4
    },

    hairColor: {
      "Black": 6,
      "Dark Brown": 4,
      "Brunette": 2
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3,
      "Straight": 1.5
    },

    eyes: {
      "Brown": 5,
      "Dark Brown": 4,
      "Hazel": 1
    }
  },


  mixed: {
    skin: {
      "Caramel": 4,
      "Golden-Bronze": 4,
      "Warm Brown": 3,
      "Olive": 3,
      "Tanned": 3,
      "Fair": 1.5,
      "Dark": 1.5
    },

    hairColor: {
      "Black": 4,
      "Dark Brown": 4,
      "Brunette": 3,
      "Chestnut Brown": 2,
      "Auburn": 1.5
    },

    hairType: {
      "Wavy": 4,
      "Curly": 3.5,
      "Straight": 2
    },

    eyes: {
      "Brown": 4,
      "Dark Brown": 3,
      "Hazel": 2,
      "Green": 1,
      "Amber": 1
    }
  }
};


// =========================================
// PROFILE LOOKUP
// =========================================

function getTraitProfile(profileName) {
  if (!profileName) {
    return {};
  }

  return TRAIT_PROFILES[profileName] || {};
}


function findNationalityPreset(value) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeCompatibilityValue(value);

  return nationalityPresets.find(preset =>
    normalizeCompatibilityValue(preset.value) === normalized ||
    normalizeCompatibilityValue(preset.label) === normalized ||
    normalizeCompatibilityValue(preset.short) === normalized
  );
}


function getNationalityProfile(value) {
  const preset = findNationalityPreset(value);

  return preset
    ? preset.profile || ""
    : "";
}


// =========================================
// PROFILE WEIGHT LOOKUP
// =========================================
//
// This keeps profile weighting separate from the
// compatibility engine.
//
// If a profile doesn't explicitly mention an option,
// the compatibility system's default weight still
// allows it to occur unless another rule blocks it.
//

function getProfileWeightTable(
  profileName,
  traitCategory
) {
  const profile = getTraitProfile(profileName);

  if (
    !profile ||
    !profile[traitCategory] ||
    typeof profile[traitCategory] !== "object"
  ) {
    return {};
  }

  return profile[traitCategory];
}


function getProfileTraitWeight(
  profileName,
  traitCategory,
  preset,
  defaultWeight = 0.05
) {
  const table = getProfileWeightTable(
    profileName,
    traitCategory
  );

  const label = getPresetLabel(preset);

  if (
    table &&
    table[label] !== undefined
  ) {
    return table[label];
  }

  return defaultWeight;
}


// =========================================
// AGE HELPERS
// =========================================

function getAgePresetMidpoint(agePreset) {
  if (
    agePreset &&
    typeof agePreset === "object" &&
    Number.isFinite(agePreset.midpoint)
  ) {
    return agePreset.midpoint;
  }

  return 30;
}


function getAgeBucket(ageValue) {
  const normalized = normalizeCompatibilityValue(ageValue);

  if (!normalized) {
    return "";
  }

  const preset = agePresets.find(age =>
    normalizeCompatibilityValue(age.value) === normalized ||
    normalizeCompatibilityValue(age.label) === normalized
  );

  return preset ? preset.id : "";
}


// =========================================
// PROFILE-BASED WEIGHT TABLE ADAPTER
// =========================================
//
// The metadata library may use labels such as:
//
//     "Fair"
//
// while older V13 weight tables used:
//
//     "fair skin"
//
// This adapter lets the new metadata objects work
// with either representation while we transition
// the rest of the generator.
//

function buildWeightTableFromProfile(
  profileName,
  traitCategory,
  presets
) {
  const profile = getTraitProfile(profileName);

  if (
    !profile ||
    !profile[traitCategory]
  ) {
    return {};
  }

  const profileTable = profile[traitCategory];
  const result = {};

  for (const preset of presets) {
    const label = getPresetLabel(preset);
    const value = getPresetValue(preset);

    if (profileTable[label] !== undefined) {
      result[label] = profileTable[label];
    }

    if (
      value !== undefined &&
      profileTable[value] !== undefined
    ) {
      result[label] = profileTable[value];
    }
  }

  return result;
}
// =========================================
// APPEARANCE METADATA
// =========================================

const makeupPresets = [
  {
    id: "makeup.light",
    label: "Light Makeup",
    value: "light makeup"
  },
  {
    id: "makeup.heavy",
    label: "Heavy Makeup",
    value: "heavy makeup"
  },
  {
    id: "makeup.red_lipstick",
    label: "Red Lipstick",
    value: "red lipstick"
  },
  {
    id: "makeup.smokey_eyes",
    label: "Smokey Eyes",
    value: "smokey eyes"
  },
  {
    id: "makeup.heavy_mascara",
    label: "Heavy Mascara",
    value: "heavy mascara"
  },
  {
    id: "makeup.lined_lips",
    label: "Lined Lips",
    value: "lips lined with a dark brown lip liner a shade darker than the lipstick, filled in with lighter lipstick"
  }
];


const makeupOdditiesPresets = [
  {
    id: "makeup_oddity.clown",
    label: "Full Clown Makeup",
    value: "full clown makeup"
  },
  {
    id: "makeup_oddity.bloody_clown",
    label: "Edgy Bloody Clown",
    value: "edgy sexy clown makeup with streams of blood from {possessive} mouth and dark eyes"
  },
  {
    id: "makeup_oddity.porcelain_doll",
    label: "Porcelain Doll",
    value: "porcelain doll makeup with rosy cheeks and a painted-on smile"
  },
  {
    id: "makeup_oddity.geisha",
    label: "Geisha Style",
    value: "geisha-style white face makeup with red lips"
  },
  {
    id: "makeup_oddity.sugar_skull",
    label: "Sugar Skull",
    value: "sugar skull Dia de los Muertos face paint"
  },
  {
    id: "makeup_oddity.zombie",
    label: "Zombie / Horror",
    value: "zombie/horror makeup with pale skin and dark sunken eyes"
  },
  {
    id: "makeup_oddity.mime",
    label: "Mime",
    value: "mime makeup with white face and black accents"
  },
  {
    id: "makeup_oddity.glitter_rave",
    label: "Glitter Rave",
    value: "glitter rave face paint"
  },
  {
    id: "makeup_oddity.tribal",
    label: "Tribal Face Paint",
    value: "tribal face paint"
  }
];


const facialHairPresets = [
  {
    id: "facial_hair.short_beard",
    label: "Short Beard",
    value: "short beard"
  },
  {
    id: "facial_hair.thick_beard",
    label: "Thick Beard",
    value: "thick beard"
  }
];


const tattooPresets = [
  {
    id: "tattoo.arm",
    label: "Arm Tattoo",
    value: "arm tattoo"
  },
  {
    id: "tattoo.back",
    label: "Back Tattoo",
    value: "back tattoo"
  },
  {
    id: "tattoo.neck",
    label: "Neck Tattoos",
    value: "neck tattoos"
  },
  {
    id: "tattoo.sleeve",
    label: "Sleeve Tattoos",
    value: "sleeve tattoos"
  },
  {
    id: "tattoo.rose_sleeves",
    label: "Red & Green Rose Tattoos",
    value: "red & green rose tattoos that cover both arms"
  }
];


const bodyDetailPresets = [
  {
    id: "body_detail.light_body_hair",
    label: "Light Body Hair",
    value: "light body hair"
  },
  {
    id: "body_detail.thick_body_hair",
    label: "Thick Body Hair",
    value: "thick body hair"
  },
  {
    id: "body_detail.light_pubic_hair",
    label: "Light Pubic Hair",
    value: "light pubic hair"
  },
  {
    id: "body_detail.thick_pubic_hair",
    label: "Thick Pubic Hair",
    value: "thick pubic hair"
  },
  {
    id: "body_detail.full_pubic_hair",
    label: "Full Pubic Hair",
    value: "a full bush of thick pubic hair"
  },
  {
    id: "body_detail.freckles",
    label: "Freckles",
    value: "freckles"
  },
  {
    id: "body_detail.dimples",
    label: "Dimples",
    value: "dimples"
  },
  {
    id: "body_detail.wrinkles",
    label: "Wrinkles",
    value: "wrinkles"
  },
  {
    id: "body_detail.tan_lines",
    label: "Sun-Kissed Tan Lines",
    value: "sun-kissed tan lines"
  },
  {
    id: "body_detail.sweaty_skin",
    label: "Sweaty Skin",
    value: "sweaty skin"
  },
  {
    id: "body_detail.small_horns",
    label: "Small Horns",
    value: "prosthetic small horns"
  },
  {
    id: "body_detail.elf_ears",
    label: "Pointed Elf Ears",
    value: "pointed elf ears"
  },
  {
    id: "body_detail.vampire_fangs",
    label: "Vampire Fangs",
    value: "vampire fangs"
  },
  {
    id: "body_detail.fake_scars",
    label: "Fake Stitched Scars",
    value: "fake stitched scars"
  },
  {
    id: "body_detail.chrome_paint",
    label: "Metallic / Chrome Body Paint",
    value: "metallic/chrome body paint"
  },
  {
    id: "body_detail.glowing_paint",
    label: "Bioluminescent Paint",
    value: "bioluminescent-style glowing paint accents"
  },
  {
    id: "body_detail.stretch_marks",
    label: "Natural Stretch Marks",
    value: "subtle natural stretch marks"
  },
  {
    id: "body_detail.cellulite",
    label: "Cellulite Texture",
    value: "cellulite texture"
  },
  {
    id: "body_detail.visible_veins",
    label: "Visible Veins",
    value: "visible veins"
  },
  {
    id: "body_detail.beauty_mark",
    label: "Beauty Mark",
    value: "beauty mark"
  }
];


const nailPresets = [
  {
    id: "nails.french_tip",
    label: "French Tip",
    value: "French tip manicure"
  },
  {
    id: "nails.red",
    label: "Red",
    value: "red nail polish"
  },
  {
    id: "nails.black",
    label: "Black",
    value: "black nail polish"
  },
  {
    id: "nails.nude",
    label: "Nude",
    value: "nude nail polish"
  },
  {
    id: "nails.chrome",
    label: "Chrome",
    value: "glossy chrome nails"
  },
  {
    id: "nails.stiletto",
    label: "Long Stiletto Acrylics",
    value: "long stiletto acrylics"
  }
];


const hairDetailPresets = [
  {
    id: "hair_detail.one_side_shaved",
    label: "Shaved on One Side",
    value: "one side of the head shaved"
  },
  {
    id: "hair_detail.both_sides_shaved",
    label: "Shaved on Both Sides",
    value: "both sides of the head shaved"
  }
];


const nosePresets = [
  {
    id: "nose.straight_bridge",
    label: "Straight Bridge",
    value: "straight bridge"
  },
  {
    id: "nose.aquiline",
    label: "Aquiline",
    value: "aquiline nose"
  },
  {
    id: "nose.button",
    label: "Button",
    value: "button nose"
  },
  {
    id: "nose.upturned",
    label: "Upturned",
    value: "upturned nose"
  },
  {
    id: "nose.hooked",
    label: "Hooked",
    value: "hooked nose"
  },
  {
    id: "nose.flared_nostrils",
    label: "Flared Nostrils",
    value: "flared nostrils"
  },
  {
    id: "nose.narrow_nostrils",
    label: "Narrow Nostrils",
    value: "narrow nostrils"
  },
  {
    id: "nose.wide",
    label: "Wide",
    value: "wide nose"
  },
  {
    id: "nose.small",
    label: "Small",
    value: "small nose"
  },
  {
    id: "nose.prominent",
    label: "Prominent",
    value: "prominent nose"
  }
];


// =========================================
// HAIR COLOR
// =========================================
//
// These labels intentionally match the original
// V13 terminology so the profile tables can use
// them consistently.
//

const hairColorPresets = [
  {
    id: "hair_color.blonde",
    label: "Blonde",
    value: "blonde"
  },
  {
    id: "hair_color.brunette",
    label: "Brunette",
    value: "brunette"
  },
  {
    id: "hair_color.black",
    label: "Black",
    value: "black"
  },
  {
    id: "hair_color.red",
    label: "Red",
    value: "red"
  },
  {
    id: "hair_color.auburn",
    label: "Auburn",
    value: "auburn"
  },
  {
    id: "hair_color.salt_pepper",
    label: "Salt & Pepper",
    value: "salt & pepper"
  },
  {
    id: "hair_color.brown_salt_pepper",
    label: "Brown Salt & Pepper",
    value: "brown salt & pepper"
  },
  {
    id: "hair_color.silver",
    label: "Silver",
    value: "silver"
  },
  {
    id: "hair_color.platinum",
    label: "Platinum Blonde",
    value: "platinum blonde"
  },
  {
    id: "hair_color.copper",
    label: "Copper / Ginger",
    value: "copper/ginger"
  },
  {
    id: "hair_color.chestnut",
    label: "Chestnut Brown",
    value: "chestnut brown"
  },
  {
    id: "hair_color.ombre",
    label: "Ombre",
    value: "ombre"
  },
  {
    id: "hair_color.balayage",
    label: "Balayage",
    value: "balayage"
  },
  {
    id: "hair_color.pastel_pink",
    label: "Pastel Pink",
    value: "pastel pink"
  },
  {
    id: "hair_color.pastel_blue_purple",
    label: "Pastel Blue / Purple",
    value: "pastel blue/purple"
  }
];


// =========================================
// HAIR LENGTH
// =========================================

const hairLengthPresets = [
  {
    id: "hair_length.short",
    label: "Short",
    value: "short"
  },
  {
    id: "hair_length.medium",
    label: "Medium-Length",
    value: "medium-length"
  },
  {
    id: "hair_length.long",
    label: "Long",
    value: "long"
  },
  {
    id: "hair_length.very_long",
    label: "Very Long",
    value: "very long"
  }
];


// =========================================
// HAIR TYPE
// =========================================
//
// V13's actual options are retained here.
//
// "Coily" is deliberately not being invented as a
// separate option. Afro-textured hair already exists
// in the original generator.
//

const hairTypePresets = [
  {
    id: "hair_type.straight",
    label: "Straight",
    value: "straight"
  },
  {
    id: "hair_type.wavy",
    label: "Wavy",
    value: "wavy"
  },
  {
    id: "hair_type.curly",
    label: "Curly",
    value: "curly"
  },
  {
    id: "hair_type.kinky",
    label: "Kinky",
    value: "kinky"
  },
  {
    id: "hair_type.afro_textured",
    label: "Afro-Textured",
    value: "afro-textured"
  },
  {
    id: "hair_type.frizzy",
    label: "Frizzy",
    value: "frizzy"
  }
];


// =========================================
// HAIRSTYLE GROUPS
// =========================================

const hairstyleGroups = [
  {
    id: "hairstyle_group.updos_braids",
    title: "Updos and Braided Styles",
    description: "Classic updos and braided hair styling choices",
    presets: [
      {
        id: "hairstyle.wet",
        label: "Wet Hair",
        value: "wet hair"
      },
      {
        id: "hairstyle.ponytail",
        label: "Ponytail",
        value: "ponytail"
      },
      {
        id: "hairstyle.messy_ponytail",
        label: "Messy Ponytail",
        value: "messy ponytail"
      },
      {
        id: "hairstyle.french_braid",
        label: "French Braid",
        value: "French braid"
      },
      {
        id: "hairstyle.loose_braids",
        label: "Loose Braids",
        value: "loose braids"
      },
      {
        id: "hairstyle.cornrows",
        label: "Cornrows",
        value: "cornrows"
      },
      {
        id: "hairstyle.box_braids",
        label: "Box Braids",
        value: "box braids"
      },
      {
        id: "hairstyle.micro_braids",
        label: "Micro Braids",
        value: "micro braids"
      },
      {
        id: "hairstyle.dreadlocks",
        label: "Dreadlocks",
        value: "dreadlocks"
      },
      {
        id: "hairstyle.messy_bun",
        label: "Messy Bun",
        value: "messy bun"
      },
      {
        id: "hairstyle.double_buns",
        label: "Messy Double Buns",
        value: "messy double buns"
      },
      {
        id: "hairstyle.bangs",
        label: "Bangs",
        value: "with bangs"
      }
    ]
  },

  {
    id: "hairstyle_group.volume_retro",
    title: "Voluminous and Retro Styling",
    description: "Big-volume and retro-inspired hair silhouettes",
    presets: [
      {
        id: "hairstyle.blown_out",
        label: "Blown-Out",
        value: "high-volume, heavily sprayed, lacquered hairstyle"
      },
      {
        id: "hairstyle.feathered_70s",
        label: "Soft Feathered 70s Blowout",
        value: "soft feathered 1970s blowout hairstyle with airy volume, gentle waves, and naturally lifted layers"
      },
      {
        id: "hairstyle.60s_bouffant",
        label: "60s Bouffant Curls",
        value: "1960s bouffant hairstyle with large rounded curls, high volume, and polished lift"
      }
    ]
  },

  {
    id: "hairstyle_group.edgy",
    title: "Edgy and Stylized Cuts",
    description: "Fashion-forward and stylized hair cuts",
    presets: [
      {
        id: "hairstyle.faux_hawk",
        label: "Faux Hawk",
        value: "Faux Hawk"
      },
      {
        id: "hairstyle.pixie",
        label: "Pixie Cut",
        value: "in a textured pixie cut style"
      },
      {
        id: "hairstyle.spiked_punk",
        label: "Spiked Punk",
        value: "spiked punk hairstyle"
      }
    ]
  },

  {
    id: "hairstyle_group.iconic_curls",
    title: "Iconic Curl Styles",
    description: "Signature curl and wave-inspired styling choices",
    presets: [
      {
        id: "hairstyle.hollywood_curls",
        label: "Hollywood Curls",
        value: "Hollywood curls"
      },
      {
        id: "hairstyle.victory_curls",
        label: "Victory Curls",
        value: "Victory curls"
      }
    ]
  }
];


// =========================================
// FLATTENED HAIRSTYLE PRESET LIST
// =========================================
//
// The UI can still display hairstyleGroups,
// while the generation engine can work against
// one normalized collection.
//
// This eliminates the need to know that an option
// originally came from group 0, 1, 2, etc.
//

const hairstylePresets = hairstyleGroups.flatMap(group =>
  group.presets
);


// =========================================
// APPEARANCE SWITCH GROUPS
// =========================================

const appearanceSwitchGroups = [
  {
    id: "appearance_group.makeup",
    title: "Makeup",
    description: "Makeup and cosmetic styling",
    category: "makeup",
    presets: makeupPresets
  },
  {
    id: "appearance_group.makeup_oddities",
    title: "Makeup Oddities",
    description: "Unconventional and costume-style makeup looks",
    category: "makeupOddities",
    presets: makeupOdditiesPresets
  },
  {
    id: "appearance_group.facial_hair",
    title: "Facial Hair",
    description: "Facial hair characteristics",
    category: "facialHair",
    presets: facialHairPresets
  },
  {
    id: "appearance_group.nose",
    title: "Nose",
    description: "Nose bridge, tip, and nostril characteristics",
    category: "nose",
    presets: nosePresets
  },
  {
    id: "appearance_group.tattoos",
    title: "Tattoos",
    description: "Visible tattoo characteristics",
    category: "tattoos",
    presets: tattooPresets
  },
  {
    id: "appearance_group.body_details",
    title: "Body / Skin Details",
    description: "Body hair and skin details",
    category: "bodyDetails",
    presets: bodyDetailPresets
  },
  {
    id: "appearance_group.nails",
    title: "Nails",
    description: "Manicure and nail styling",
    category: "nails",
    presets: nailPresets
  },
  {
    id: "appearance_group.hair_details",
    title: "Hair Details",
    description: "Additional hair-shaving and hair-structure details",
    category: "hairDetails",
    presets: hairDetailPresets
  }
];


// =========================================
// ACCESSORIES
// =========================================

const accessoryGroups = [
  {
    id: "accessory_group.jewelry",
    title: "Jewelry",
    description: "Select jewelry accessories",
    category: "jewelry",
    presets: [
      {
        id: "accessory.stud_earrings",
        label: "Stud Earrings",
        value: "stud earrings"
      },
      {
        id: "accessory.hoop_earrings",
        label: "Hoop Earrings",
        value: "hoop earrings"
      },
      {
        id: "accessory.large_hoop_earrings",
        label: "Large Hoop Earrings",
        value: "large hoop earrings"
      },
      {
        id: "accessory.drop_earrings",
        label: "Drop Earrings",
        value: "drop earrings"
      },
      {
        id: "accessory.necklace",
        label: "Necklace",
        value: "necklace"
      },
      {
        id: "accessory.layered_necklaces",
        label: "Layered Necklaces",
        value: "layered necklaces"
      },
      {
        id: "accessory.choker",
        label: "Choker",
        value: "choker"
      },
      {
        id: "accessory.pendant",
        label: "Pendant Necklace",
        value: "pendant necklace"
      },
      {
        id: "accessory.pearl",
        label: "Pearl Necklace",
        value: "pearl necklace"
      },
      {
        id: "accessory.bracelet",
        label: "Bracelet",
        value: "bracelet"
      },
      {
        id: "accessory.stacked_bracelets",
        label: "Stacked Bracelets",
        value: "stacked bracelets"
      },
      {
        id: "accessory.watch",
        label: "Watch",
        value: "watch"
      },
      {
        id: "accessory.rings",
        label: "Rings",
        value: "rings"
      },
      {
        id: "accessory.multiple_rings",
        label: "Multiple Rings",
        value: "multiple rings"
      },
      {
        id: "accessory.diamond_anklet",
        label: "Diamond-Studded Silver Anklet",
        value: "diamond-studded silver anklet"
      }
    ]
  },

  {
    id: "accessory_group.eyewear",
    title: "Eyewear",
    description: "Select eyewear accessories",
    category: "eyewear",
    presets: [
      {
        id: "accessory.sunglasses",
        label: "Sunglasses",
        value: "sunglasses"
      },
      {
        id: "accessory.aviator",
        label: "Aviator Sunglasses",
        value: "aviator sunglasses"
      },
      {
        id: "accessory.round_sunglasses",
        label: "Round Sunglasses",
        value: "round sunglasses"
      },
      {
        id: "accessory.cat_eye",
        label: "Cat-Eye Sunglasses",
        value: "cat-eye sunglasses"
      },
      {
        id: "accessory.reading_glasses",
        label: "Reading Glasses",
        value: "reading glasses"
      },
      {
        id: "accessory.clear_frame",
        label: "Clear-Frame Glasses",
        value: "clear-frame glasses"
      },
      {
        id: "accessory.dark_sunglasses",
        label: "Dark Sunglasses",
        value: "dark sunglasses"
      }
    ]
  },

  {
    id: "accessory_group.piercings",
    title: "Body Piercings",
    description: "Select visible body piercing details",
    category: "piercings",
    presets: [
      {
        id: "piercing.nose",
        label: "Nose Piercing",
        value: "nose piercing"
      },
      {
        id: "piercing.septum",
        label: "Septum Piercing",
        value: "septum piercing"
      },
      {
        id: "piercing.eyebrow",
        label: "Eyebrow Piercing",
        value: "eyebrow piercing"
      },
      {
        id: "piercing.lip",
        label: "Lip Piercing",
        value: "lip piercing"
      },
      {
        id: "piercing.multiple_ears",
        label: "Multiple Ear Piercings",
        value: "multiple ear piercings"
      },
      {
        id: "piercing.nipple",
        label: "Nipple Piercings",
        value: "nipple piercings"
      },
      {
        id: "piercing.navel",
        label: "Navel Piercing",
        value: "navel piercing"
      }
    ]
  },

  {
    id: "accessory_group.headwear",
    title: "Headwear",
    description: "Select headwear accessories",
    category: "headwear",
    presets: [
      {
        id: "headwear.baseball_cap",
        label: "Baseball Cap",
        value: "baseball cap"
      },
      {
        id: "headwear.beanie",
        label: "Beanie",
        value: "beanie"
      },
      {
        id: "headwear.wide_brim",
        label: "Wide-Brim Hat",
        value: "wide-brim hat"
      },
      {
        id: "headwear.fedora",
        label: "Fedora",
        value: "fedora"
      },
      {
        id: "headwear.cowboy",
        label: "Cowboy Hat",
        value: "cowboy hat"
      },
      {
        id: "headwear.sun_hat",
        label: "Sun Hat",
        value: "sun hat"
      },
      {
        id: "headwear.beret",
        label: "Beret",
        value: "beret"
      }
    ]
  },

  {
    id: "accessory_group.hair",
    title: "Hair Accessories",
    description: "Select accessories worn in or around the hair",
    category: "hairAccessories",
    presets: [
      {
        id: "hair_accessory.clips",
        label: "Hair Clips",
        value: "hair clips"
      },
      {
        id: "hair_accessory.decorative_pins",
        label: "Decorative Hair Pins",
        value: "decorative hair pins"
      },
      {
        id: "hair_accessory.ribbon",
        label: "Hair Ribbon",
        value: "hair ribbon"
      },
      {
        id: "hair_accessory.headband",
        label: "Headband",
        value: "headband"
      },
      {
        id: "hair_accessory.scrunchie",
        label: "Scrunchie",
        value: "scrunchie"
      },
      {
        id: "hair_accessory.bow",
        label: "Hair Bow",
        value: "hair bow"
      },
      {
        id: "hair_accessory.flower",
        label: "Flower in the Hair",
        value: "flower in the hair"
      }
    ]
  }
];


// =========================================
// FLATTENED ACCESSORY PRESETS
// =========================================
//
// Again, the UI retains groups, but generation
// doesn't care which UI group an option came from.
//

const accessoryPresets = accessoryGroups.flatMap(group =>
  group.presets
);


// =========================================
// CLOTHING COLOR PRESETS
// =========================================

const clothingColorPresets = [
  {
    id: "color.black",
    label: "Black",
    value: "black"
  },
  {
    id: "color.white",
    label: "White",
    value: "white"
  },
  {
    id: "color.red",
    label: "Red",
    value: "red"
  },
  {
    id: "color.crimson",
    label: "Crimson",
    value: "crimson"
  },
  {
    id: "color.burgundy",
    label: "Burgundy",
    value: "burgundy"
  },
  {
    id: "color.emerald",
    label: "Emerald Green",
    value: "emerald green"
  },
  {
    id: "color.forest",
    label: "Forest Green",
    value: "forest green"
  },
  {
    id: "color.olive",
    label: "Olive Green",
    value: "olive green"
  },
  {
    id: "color.navy",
    label: "Navy Blue",
    value: "navy blue"
  },
  {
    id: "color.royal_blue",
    label: "Royal Blue",
    value: "royal blue"
  },
  {
    id: "color.baby_blue",
    label: "Baby Blue",
    value: "baby blue"
  },
  {
    id: "color.pastel_pink",
    label: "Pastel Pink",
    value: "pastel pink"
  },
  {
    id: "color.hot_pink",
    label: "Hot Pink",
    value: "hot pink"
  },
  {
    id: "color.lavender",
    label: "Lavender",
    value: "lavender"
  },
  {
    id: "color.purple",
    label: "Purple",
    value: "purple"
  },
  {
    id: "color.yellow",
    label: "Yellow",
    value: "yellow"
  },
  {
    id: "color.orange",
    label: "Orange",
    value: "orange"
  },
  {
    id: "color.beige",
    label: "Beige",
    value: "beige"
  },
  {
    id: "color.champagne",
    label: "Champagne",
    value: "champagne"
  },
  {
    id: "color.brown",
    label: "Brown",
    value: "brown"
  },
  {
    id: "color.gold",
    label: "Gold",
    value: "gold"
  },
  {
    id: "color.silver",
    label: "Silver",
    value: "silver"
  }
];


// =========================================
// CLOTHING COLOR HELPER
// =========================================

function applyClothingColor(item, color) {
  if (!item || !color) {
    return item;
  }

  if (/^a\s+/i.test(item)) {
    return item.replace(
      /^a\s+/i,
      `a ${color} `
    );
  }

  if (/^an\s+/i.test(item)) {
    return item.replace(
      /^an\s+/i,
      `an ${color} `
    );
  }

  return `${color} ${item}`;
}


// =========================================
// GENERIC GROUP FLATTENER
// =========================================
//
// Used throughout V14 instead of writing separate
// flattening code for every category.
//

function flattenPresetGroups(groups) {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap(group =>
    Array.isArray(group.presets)
      ? group.presets
      : []
  );
}


function getGroupById(groups, groupId) {
  if (!Array.isArray(groups)) {
    return undefined;
  }

  return groups.find(group =>
    group.id === groupId
  );
}


function getGroupPresets(groups, groupId) {
  const group = getGroupById(
    groups,
    groupId
  );

  return group
    ? group.presets || []
    : [];
}


// =========================================
// PROFILE LABEL ALIASES
// =========================================
//
// These aliases solve the transition between
// V13's human-readable profile terminology and
// V14's normalized metadata.
//
// They also prevent us from having to duplicate
// the same option under several different labels.
//

const PROFILE_LABEL_ALIASES = {
  skin: {
    "porcelain skin": "Porcelain",
    "pale skin": "Pale",
    "fair skin": "Fair",
    "tanned sun-kissed skin": "Tanned",
    "cream skin": "Cream",
    "olive skin": "Olive",
    "caramel skin": "Caramel",
    "golden-bronze skin": "Golden-Bronze",
    "warm brown skin": "Warm Brown",
    "dark skin": "Dark",
    "dark glossy skin": "Dark Glossy",
    "dark black nubian skin with a glossy sheen": "Nubian"
  },

  hairColor: {
    "blonde": "Blonde",
    "brunette": "Brunette",
    "black": "Black",
    "red": "Red",
    "auburn": "Auburn",
    "salt & pepper": "Salt & Pepper",
    "brown salt & pepper": "Brown Salt & Pepper",
    "silver": "Silver",
    "platinum blonde": "Platinum Blonde",
    "copper/ginger": "Copper / Ginger",
    "chestnut brown": "Chestnut Brown",
    "ombre": "Ombre",
    "balayage": "Balayage",
    "pastel pink": "Pastel Pink",
    "pastel blue/purple": "Pastel Blue / Purple"
  },

  hairType: {
    "straight": "Straight",
    "wavy": "Wavy",
    "curly": "Curly",
    "kinky": "Kinky",
    "afro-textured": "Afro-Textured",
    "frizzy": "Frizzy"
  },

  eyes: {
    "blue eyes": "Blue",
    "green eyes": "Green",
    "hazel eyes": "Hazel",
    "brown eyes": "Brown",
    "dark brown eyes": "Dark Brown",
    "amber eyes": "Amber",
    "gray eyes": "Gray",
    "violet eyes": "Violet"
  }
};


// =========================================
// PROFILE TABLE NORMALIZATION
// =========================================
//
// V14 can accept either:
//
//     "Fair"
//
// or an old V13-style key such as:
//
//     "fair skin"
//
// when reading profile weights.
//

function normalizeProfileTable(
  profileName,
  traitCategory
) {
  const profile = getTraitProfile(
    profileName
  );

  const source =
    profile &&
    profile[traitCategory];

  if (
    !source ||
    typeof source !== "object"
  ) {
    return {};
  }

  const aliases =
    PROFILE_LABEL_ALIASES[traitCategory] || {};

  const normalized = {};

  for (const [key, weight] of Object.entries(source)) {
    const normalizedKey =
      aliases[
      normalizeCompatibilityValue(key)
      ] || key;

    normalized[normalizedKey] = weight;
  }

  return normalized;
}


// =========================================
// PROFILE-WEIGHT LOOKUP
// =========================================

function getNormalizedProfileWeight(
  profileName,
  traitCategory,
  preset,
  defaultWeight = 0.05
) {
  const table =
    normalizeProfileTable(
      profileName,
      traitCategory
    );

  const label =
    getPresetLabel(preset);

  if (
    table &&
    table[label] !== undefined
  ) {
    return table[label];
  }

  return defaultWeight;
}


// =========================================
// PROFILE-WEIGHTED SELECTION
// =========================================
//
// This is the bridge between the profile system
// and the generic compatibility system.
//

function profileWeightedPresetValue(
  presets,
  category,
  state,
  profileCategory,
  defaultWeight = 0.05
) {
  if (
    !Array.isArray(presets) ||
    presets.length === 0
  ) {
    return "";
  }

  const profileName =
    state.nationalityProfile || "";

  const entries = presets.map(preset => {
    const baseWeight =
      getNormalizedProfileWeight(
        profileName,
        profileCategory,
        preset,
        defaultWeight
      );

    const compatibilityWeight =
      getCompatibilityWeight(
        category,
        preset,
        state
      );

    return {
      value: getPresetValue(preset),
      weight:
        baseWeight *
        compatibilityWeight
    };
  });

  return weightedPick(entries);
}
// ============================================================
// V14 — COMPATIBILITY / RELATIONSHIP DEFINITIONS
// ============================================================
//
// All cross-trait relationships live here.
//
// Relationship types:
//   required    = the condition must be satisfied
//   preferred   = strongly favors the option
//   neutral     = no adjustment
//   discouraged = makes the option less likely
//   blocked     = option is unavailable under the condition
//
// The randomizer consults these relationships BEFORE choosing.
// Manual selections are not automatically erased by these rules.
// ============================================================


// ------------------------------------------------------------
// RELATIONSHIP HELPERS
// ------------------------------------------------------------

function addCompatibilityRule(optionId, rule) {
  COMPATIBILITY_RULES[optionId] = rule;
}

function addCompatibilityRules(optionIds, rule) {
  optionIds.forEach(optionId => {
    addCompatibilityRule(optionId, rule);
  });
}

function relationshipCondition(category, values) {
  return {
    category: category,
    values: Array.isArray(values) ? values : [values]
  };
}


// ------------------------------------------------------------
// GENDER RELATIONSHIPS
// ------------------------------------------------------------
//
// These are intentionally relationships rather than a giant
// "male/female randomization" branch.
//
// This means the same compatibility system can later handle
// clothing, hair, accessories, actions, etc.
// ------------------------------------------------------------


// Facial hair is strongly associated with the masculine profile.
// It is discouraged rather than absolutely impossible for women,
// because the generator should not prevent deliberate manual
// selections.

addCompatibilityRules(
  [
    "facial_hair.short_beard",
    "facial_hair.thick_beard"
  ],
  {
    preferredWhen: [
      relationshipCondition("gender", "man")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "woman")
    ]
  }
);


// Breasts/chest options are restricted during random generation
// for a masculine subject. "Flat" remains available.

addCompatibilityRules(
  [
    "chest.small",
    "chest.average",
    "chest.full",
    "chest.large"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ],
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ]
  }
);


// Wide hips are strongly associated with feminine body
// proportions in the randomizer.

addCompatibilityRule(
  "hips.wide",
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ],
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ]
  }
);


// Feminine body-shape presets.

addCompatibilityRules(
  [
    "body_shape.hourglass",
    "body_shape.pear"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ],
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ]
  }
);


// Masculine-leaning body shapes.

addCompatibilityRules(
  [
    "body_shape.rectangle",
    "body_shape.inverted_triangle"
  ],
  {
    preferredWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Apple is compatible with either gender, but the old generator
// treated it as somewhat more common for men.

addCompatibilityRule(
  "body_shape.apple",
  {
    preferredWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Petite is not blocked for men. It is simply more strongly
// associated with women.

addCompatibilityRule(
  "body_shape.petite_frame",
  {
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Makeup remains possible for men, but should be uncommon when
// randomizing.

addCompatibilityRules(
  [
    "makeup.light",
    "makeup.heavy",
    "makeup.red_lipstick",
    "makeup.smokey_eyes",
    "makeup.heavy_mascara",
    "makeup.lined_lips"
  ],
  {
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Manicured/nail-polish choices follow the same principle:
// possible, but not randomly selected as often for men.

addCompatibilityRules(
  [
    "nails.french_tip",
    "nails.red",
    "nails.black",
    "nails.nude",
    "nails.chrome",
    "nails.long_stiletto_acrylics"
  ],
  {
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Hair accessories traditionally associated with feminine
// styling are discouraged for men rather than blocked.

addCompatibilityRules(
  [
    "hair_accessory.scrunchie",
    "hair_accessory.bow",
    "hair_accessory.flower"
  ],
  {
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// ------------------------------------------------------------
// PROFILE / IDENTITY RELATIONSHIPS
// ------------------------------------------------------------
//
// Nationality no longer contains a giant appearance paragraph.
//
// Instead, the nationality selects a profile and the profile
// influences compatible appearance traits through the same
// relationship engine.
// ------------------------------------------------------------


// Celtic profile.

addCompatibilityRules(
  [
    "hair_color.red",
    "hair_color.copper_ginger",
    "hair_color.auburn"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "celtic")
    ]
  }
);

addCompatibilityRules(
  [
    "skin.porcelain",
    "skin.pale",
    "skin.fair"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "celtic")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.blue",
    "eyes.green"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "celtic")
    ]
  }
);

addCompatibilityRule(
  "body_detail.freckles",
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "celtic")
    ]
  }
);


// Nordic profile.

addCompatibilityRules(
  [
    "hair_color.blonde",
    "hair_color.platinum_blonde"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "nordic")
    ]
  }
);

addCompatibilityRules(
  [
    "skin.porcelain",
    "skin.pale",
    "skin.fair"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "nordic")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.blue",
    "eyes.gray",
    "eyes.green"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "nordic")
    ]
  }
);


// East Asian profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.straight",
    "hair_type.wavy"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAsian")
    ]
  }
);


// South Asian profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.wavy",
    "hair_type.curly"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southAsian")
    ]
  }
);


// Southeast Asian profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southeastAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.straight",
    "hair_type.wavy"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southeastAsian")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "southeastAsian")
    ]
  }
);


// African profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "african")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.curly",
    "hair_type.kinky",
    "hair_type.afro_textured"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "african")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "african")
    ]
  }
);


// East African profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAfrican")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.curly",
    "hair_type.kinky",
    "hair_type.afro_textured"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAfrican")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "eastAfrican")
    ]
  }
);


// Middle Eastern profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "middleEastern")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.wavy",
    "hair_type.curly"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "middleEastern")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.dark_brown",
    "eyes.hazel"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "middleEastern")
    ]
  }
);


// Latina profile.

addCompatibilityRules(
  [
    "hair_color.brunette",
    "hair_color.black",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "latina")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.wavy",
    "hair_type.curly"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "latina")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.hazel"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "latina")
    ]
  }
);


// Brazilian profile.

addCompatibilityRules(
  [
    "hair_color.brunette",
    "hair_color.black",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "brazilian")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.wavy",
    "hair_type.curly"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "brazilian")
    ]
  }
);


// Slavic profile.

addCompatibilityRules(
  [
    "hair_color.blonde",
    "hair_color.brunnette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "slavic")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.blue",
    "eyes.gray",
    "eyes.green",
    "eyes.hazel"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "slavic")
    ]
  }
);


// Mediterranean profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "mediterranean")
    ]
  }
);

addCompatibilityRules(
  [
    "eyes.brown",
    "eyes.hazel",
    "eyes.green"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "mediterranean")
    ]
  }
);


// Native American profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "nativeAmerican")
    ]
  }
);


// Polynesian profile.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "polynesian")
    ]
  }
);

addCompatibilityRules(
  [
    "hair_type.wavy",
    "hair_type.curly"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "polynesian")
    ]
  }
);


// Mixed profile deliberately has broad compatibility.
// It should not force a narrow appearance.

addCompatibilityRules(
  [
    "hair_color.black",
    "hair_color.brunette",
    "hair_color.blonde",
    "hair_color.red",
    "hair_color.auburn",
    "hair_color.chestnut_brown"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "mixed")
    ]
  }
);


// ------------------------------------------------------------
// SPECIFIC-BODY RELATIONSHIPS
// ------------------------------------------------------------
//
// These are hard compatibility relationships because they
// describe mutually exclusive biological states.
// ------------------------------------------------------------

addCompatibilityRules(
  [
    "specific_body.pregnant",
    "specific_body.heavily_pregnant"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// ------------------------------------------------------------
// PROFILE SKIN RELATIONSHIPS
// ------------------------------------------------------------
//
// These remain soft relationships. They influence probability;
// they do not declare that an appearance is impossible.
// ------------------------------------------------------------

addCompatibilityRules(
  [
    "skin.porcelain",
    "skin.pale",
    "skin.fair",
    "skin.cream"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "celtic"),
      relationshipCondition("nationalityProfile", "nordic"),
      relationshipCondition("nationalityProfile", "slavic")
    ]
  }
);

addCompatibilityRules(
  [
    "skin.warm_brown",
    "skin.dark",
    "skin.dark_glossy",
    "skin.dark_black_nubian_glossy"
  ],
  {
    preferredWhen: [
      relationshipCondition("nationalityProfile", "african"),
      relationshipCondition("nationalityProfile", "eastAfrican")
    ]
  }
);


// ------------------------------------------------------------
// IMPORTANT:
// The relationship system intentionally does NOT contain a
// giant list of "allowed nationality appearances."
//
// Profiles provide probability guidance.
// Hard contradictions use blocked relationships.
// This leaves room for realistic variation.
// ------------------------------------------------------------


// ------------------------------------------------------------
// COMPATIBILITY DIAGNOSTICS
// ------------------------------------------------------------
//
// These helpers will be useful later when the UI needs to show
// why an option was filtered or weighted.
// ------------------------------------------------------------

function getOptionRelationshipSummary(category, preset, state) {
  const rule = getCompatibilityRule(category, preset);

  if (!rule) {
    return {
      optionId: getPresetId(preset),
      relationship: RELATIONSHIP_TYPES.NEUTRAL,
      weight: 1
    };
  }

  if (!isOptionAllowed(category, preset, state)) {
    return {
      optionId: getPresetId(preset),
      relationship: RELATIONSHIP_TYPES.BLOCKED,
      weight: 0
    };
  }

  const weight = getCompatibilityWeight(category, preset, state);

  if (weight > 1) {
    return {
      optionId: getPresetId(preset),
      relationship: RELATIONSHIP_TYPES.PREFERRED,
      weight: weight
    };
  }

  if (weight < 1) {
    return {
      optionId: getPresetId(preset),
      relationship: RELATIONSHIP_TYPES.DISCOURAGED,
      weight: weight
    };
  }

  return {
    optionId: getPresetId(preset),
    relationship: RELATIONSHIP_TYPES.NEUTRAL,
    weight: 1
  };
}


// ------------------------------------------------------------
// PROFILE LABEL NORMALIZATION EXTENSION
// ------------------------------------------------------------
//
// Chunk 2 contains profile terminology that differs slightly
// from some of the original V13 labels.
//
// These aliases prevent those differences from becoming silent
// zero-weight options.
// ------------------------------------------------------------

function normalizeV14ProfileLabel(category, label) {
  if (label === undefined || label === null) {
    return label;
  }

  const key = String(label).trim().toLowerCase();

  const aliases = {
    hairColor: {
      "dark brown": "Brunette"
    },

    hairType: {
      "coily": "Afro-Textured"
    }
  };

  if (
    aliases[category] &&
    aliases[category][key]
  ) {
    return aliases[category][key];
  }

  return label;
}


// Replace the earlier normalizer with the expanded version.

function normalizeProfileTable(category, table) {
  const normalized = {};

  Object.keys(table || {}).forEach(label => {
    const normalizedLabel = normalizeV14ProfileLabel(
      category,
      label
    );

    const canonicalLabel =
      PROFILE_LABEL_ALIASES[category] &&
        PROFILE_LABEL_ALIASES[category][
        String(normalizedLabel).toLowerCase()
        ]
        ? PROFILE_LABEL_ALIASES[category][
        String(normalizedLabel).toLowerCase()
        ]
        : normalizedLabel;

    normalized[canonicalLabel] = table[label];
  });

  return normalized;
}
// ============================================================
// V14 — CLOTHING DATA
// ============================================================
//
// Clothing is represented as data rather than scattered
// special-case logic.
//
// Every clothing item has:
//   id
//   label
//   value
//   group
//   metadata
//
// This allows the same compatibility engine to reason about:
//   gender
//   clothing group
//   other clothing
//   colors
//   actions
//   poses
//   accessories
//
// without hard-coded array positions or slice() assumptions.
// ============================================================


// ------------------------------------------------------------
// CLOTHING ITEM FACTORY
// ------------------------------------------------------------
//
// Using a factory means we don't have to repeatedly write the
// same metadata structure for every item.
// ------------------------------------------------------------

function createClothingPreset(
  id,
  label,
  value,
  group,
  metadata
) {
  return {
    id: id,
    label: label,
    value: value,
    group: group,
    metadata: metadata || {}
  };
}


// ------------------------------------------------------------
// TOPS
// ------------------------------------------------------------

const clothingTopsPresets = [
  createClothingPreset(
    "clothing.tops.tshirt",
    "T-Shirt",
    "t-shirt",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.long_sleeve",
    "Long Sleeve Shirt",
    "long-sleeve shirt",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.button_down",
    "Button-Down Shirt",
    "button-down shirt",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.blouse",
    "Blouse",
    "blouse",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.tank",
    "Tank Top",
    "tank top",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.camisole",
    "Camisole",
    "cami",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.crop_top",
    "Crop Top",
    "crop top",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.halter",
    "Halter Top",
    "halter top",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.off_shoulder",
    "Off-Shoulder Top",
    "off-shoulder top",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.tube_top",
    "Tube Top",
    "tube top",
    "Tops",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.tops.sweater",
    "Sweater",
    "sweater",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.hoodie",
    "Hoodie",
    "hoodie",
    "Tops"
  ),

  createClothingPreset(
    "clothing.tops.turtleneck",
    "Turtleneck",
    "turtleneck",
    "Tops"
  )
];


// ------------------------------------------------------------
// BOTTOMS
// ------------------------------------------------------------

const clothingBottomsPresets = [
  createClothingPreset(
    "clothing.bottoms.jeans",
    "Jeans",
    "jeans",
    "Bottoms"
  ),

  createClothingPreset(
    "clothing.bottoms.trousers",
    "Trousers",
    "trousers",
    "Bottoms"
  ),

  createClothingPreset(
    "clothing.bottoms.dress_pants",
    "Dress Pants",
    "dress pants",
    "Bottoms"
  ),

  createClothingPreset(
    "clothing.bottoms.shorts",
    "Shorts",
    "shorts",
    "Bottoms"
  ),

  createClothingPreset(
    "clothing.bottoms.denim_shorts",
    "Denim Shorts",
    "denim shorts",
    "Bottoms"
  ),

  createClothingPreset(
    "clothing.bottoms.skirt",
    "Skirt",
    "skirt",
    "Bottoms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.bottoms.mini_skirt",
    "Mini Skirt",
    "mini-skirt",
    "Bottoms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.bottoms.pleated_mini_skirt",
    "Pleated Mini Skirt",
    "pleated mini-skirt",
    "Bottoms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.bottoms.wrap_skirt",
    "Wrap-Around Skirt",
    "wrap-around skirt",
    "Bottoms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.bottoms.leggings",
    "Leggings",
    "leggings",
    "Bottoms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.bottoms.spandex_leggings",
    "Spandex Leggings",
    "spandex leggings",
    "Bottoms",
    {
      feminine: true
    }
  )
];


// ------------------------------------------------------------
// DRESSES
// ------------------------------------------------------------

const clothingDressPresets = [
  createClothingPreset(
    "clothing.dresses.casual_dress",
    "Casual Dress",
    "casual dress",
    "Dresses",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.dresses.sundress",
    "Sundress",
    "sundress",
    "Dresses",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.dresses.cocktail",
    "Cocktail Dress",
    "cocktail dress",
    "Dresses",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.dresses.evening",
    "Evening Gown",
    "evening gown",
    "Dresses",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.dresses.bodycon",
    "Bodycon Dress",
    "bodycon dress",
    "Dresses",
    {
      feminine: true
    }
  )
];


// ------------------------------------------------------------
// LINGERIE
// ------------------------------------------------------------

const clothingLingeriePresets = [
  createClothingPreset(
    "clothing.lingerie.bra_panties",
    "Bra and Panties",
    "bra and panties",
    "Lingerie",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.lingerie.lace_bra_panties",
    "Lace Bra and Panties",
    "lace bra and panties",
    "Lingerie",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.lingerie.babydoll",
    "Babydoll",
    "babydoll lingerie",
    "Lingerie",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.lingerie.camisole_shorts",
    "Silk Cami and Shorts",
    "silk cami and shorts set",
    "Lingerie",
    {
      feminine: true
    }
  )
];


// ------------------------------------------------------------
// SWIMWEAR
// ------------------------------------------------------------

const clothingSwimwearPresets = [
  createClothingPreset(
    "clothing.swimwear.one_piece",
    "One-Piece Swimsuit",
    "one-piece swimsuit",
    "Swimwear"
  ),

  createClothingPreset(
    "clothing.swimwear.bikini",
    "Bikini",
    "bikini",
    "Swimwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.swimwear.bikini_top",
    "Bikini Top",
    "bikini top",
    "Swimwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.swimwear.board_shorts",
    "Board Shorts",
    "board shorts",
    "Swimwear"
  )
];


// ------------------------------------------------------------
// ROBES / LOUNGEWEAR
// ------------------------------------------------------------

const clothingRobesPresets = [
  createClothingPreset(
    "clothing.robes.silk_robe",
    "Silk Robe",
    "silk robe",
    "Robes/Loungewear"
  ),

  createClothingPreset(
    "clothing.robes.bathrobe",
    "Bathrobe",
    "bathrobe",
    "Robes/Loungewear"
  ),

  createClothingPreset(
    "clothing.robes.pajamas",
    "Pajamas",
    "pajamas",
    "Robes/Loungewear"
  ),

  createClothingPreset(
    "clothing.robes.lingerie_robe",
    "Lingerie Robe",
    "lingerie robe",
    "Robes/Loungewear",
    {
      feminine: true
    }
  )
];


// ------------------------------------------------------------
// SETS
// ------------------------------------------------------------

const clothingSetsPresets = [
  createClothingPreset(
    "clothing.sets.skirt_blouse",
    "Skirt and Blouse",
    "skirt and blouse set",
    "Sets",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.sets.cami_shorts",
    "Cami and Shorts Set",
    "cami and shorts set",
    "Sets",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.sets.pantsuit",
    "Pantsuit",
    "pantsuit",
    "Sets"
  ),

  createClothingPreset(
    "clothing.sets.sweatsuit",
    "Sweatsuit",
    "sweatsuit",
    "Sets"
  )
];


// ------------------------------------------------------------
// UNIFORMS
// ------------------------------------------------------------

const clothingUniformsPresets = [
  createClothingPreset(
    "clothing.uniforms.schoolgirl",
    "Schoolgirl Uniform",
    "schoolgirl uniform",
    "Uniforms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.uniforms.business",
    "Business Uniform",
    "business uniform",
    "Uniforms"
  ),

  createClothingPreset(
    "clothing.uniforms.nurse",
    "Nurse Uniform",
    "nurse uniform",
    "Uniforms",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.uniforms.military",
    "Military Uniform",
    "military uniform",
    "Uniforms"
  )
];


// ------------------------------------------------------------
// COSTUME / ODDITIES
// ------------------------------------------------------------

const clothingCostumePresets = [
  createClothingPreset(
    "clothing.costume.fishnet_stockings",
    "Black Fishnet Stockings",
    "black fishnet stockings",
    "Costume Oddities",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.costume.lace_stockings",
    "Sheer Lace Stockings",
    "sheer lace stockings",
    "Costume Oddities",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.costume.hello_kitty_socks",
    "Knee-High Hello Kitty Socks",
    "knee-high Hello Kitty socks",
    "Costume Oddities"
  ),

  createClothingPreset(
    "clothing.costume.pokemon_socks",
    "Pokemon Socks",
    "Pokemon socks",
    "Costume Oddities"
  )
];


// ------------------------------------------------------------
// PERIOD FASHION
// ------------------------------------------------------------

const clothingPeriodPresets = [
  createClothingPreset(
    "clothing.period.victorian_dress",
    "Victorian Dress",
    "Victorian dress",
    "Period Fashion",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.period.victorian_suit",
    "Victorian Suit",
    "Victorian suit",
    "Period Fashion"
  ),

  createClothingPreset(
    "clothing.period.flapper",
    "1920s Flapper Dress",
    "1920s flapper dress",
    "Period Fashion",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.period.1950s_dress",
    "1950s Dress",
    "1950s dress",
    "Period Fashion",
    {
      feminine: true
    }
  )
];


// ------------------------------------------------------------
// FOOTWEAR
// ------------------------------------------------------------

const clothingFootwearPresets = [
  createClothingPreset(
    "clothing.footwear.sneakers",
    "Sneakers",
    "sneakers",
    "Footwear"
  ),

  createClothingPreset(
    "clothing.footwear.boots",
    "Boots",
    "boots",
    "Footwear"
  ),

  createClothingPreset(
    "clothing.footwear.ankle_boots",
    "Ankle Boots",
    "ankle boots",
    "Footwear"
  ),

  createClothingPreset(
    "clothing.footwear.heels",
    "Heels",
    "heels",
    "Footwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.footwear.stiletto_heels",
    "Stiletto Heels",
    "stiletto heels",
    "Footwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.footwear.thigh_high_boots",
    "Thigh-High Leather Boots",
    "thigh-high leather boots",
    "Footwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.footwear.lace_up_thigh_highs",
    "Lace-Up Thigh-Highs",
    "lace-up thigh-highs",
    "Footwear",
    {
      feminine: true
    }
  ),

  createClothingPreset(
    "clothing.footwear.sandals",
    "Sandals",
    "sandals",
    "Footwear"
  )
];


// ------------------------------------------------------------
// CLOTHING GROUP REGISTRY
// ------------------------------------------------------------
//
// This is the important part.
//
// We no longer depend on:
//   slice(0, 5)
//   array indexes
//   "everything after index 7"
//   separate masculine arrays
//
// Groups are explicitly named and registered.
// ------------------------------------------------------------

const clothingGroups = [
  {
    id: "clothing_group.tops",
    label: "Tops",
    presets: clothingTopsPresets
  },

  {
    id: "clothing_group.bottoms",
    label: "Bottoms",
    presets: clothingBottomsPresets
  },

  {
    id: "clothing_group.dresses",
    label: "Dresses",
    presets: clothingDressPresets
  },

  {
    id: "clothing_group.lingerie",
    label: "Lingerie",
    presets: clothingLingeriePresets
  },

  {
    id: "clothing_group.swimwear",
    label: "Swimwear",
    presets: clothingSwimwearPresets
  },

  {
    id: "clothing_group.robes",
    label: "Robes/Loungewear",
    presets: clothingRobesPresets
  },

  {
    id: "clothing_group.sets",
    label: "Sets",
    presets: clothingSetsPresets
  },

  {
    id: "clothing_group.uniforms",
    label: "Uniforms",
    presets: clothingUniformsPresets
  },

  {
    id: "clothing_group.costume",
    label: "Costume Oddities",
    presets: clothingCostumePresets
  },

  {
    id: "clothing_group.period",
    label: "Period Fashion",
    presets: clothingPeriodPresets
  },

  {
    id: "clothing_group.footwear",
    label: "Footwear",
    presets: clothingFootwearPresets
  }
];


// ------------------------------------------------------------
// FLATTEN CLOTHING REGISTRY
// ------------------------------------------------------------

const clothingPresets = clothingGroups.reduce(
  (all, group) => all.concat(group.presets),
  []
);


// ------------------------------------------------------------
// CLOTHING LOOKUPS
// ------------------------------------------------------------

function getClothingGroupById(groupId) {
  return clothingGroups.find(
    group => group.id === groupId
  );
}

function getClothingGroupByLabel(label) {
  return clothingGroups.find(
    group => group.label === label
  );
}

function getClothingPresetById(id) {
  return clothingPresets.find(
    preset => preset.id === id
  );
}

function getClothingPresetsForGroup(groupId) {
  const group = getClothingGroupById(groupId);

  return group
    ? group.presets.slice()
    : [];
}


// ------------------------------------------------------------
// CLOTHING METADATA HELPERS
// ------------------------------------------------------------

function clothingIsFeminine(preset) {
  return !!(
    preset &&
    preset.metadata &&
    preset.metadata.feminine === true
  );
}

function clothingIsMasculine(preset) {
  return !!(
    preset &&
    preset.metadata &&
    preset.metadata.masculine === true
  );
}

function clothingGroupId(preset) {
  return preset && preset.group
    ? "clothing_group." +
    slugifyId(preset.group)
    : "";
}


// ------------------------------------------------------------
// CLOTHING COLOR APPLICATION
// ------------------------------------------------------------
//
// Colors remain separate from clothing items.
// That means adding a new color never changes clothing indexes.
// ------------------------------------------------------------

function applyClothingColor(clothingValue, colorValue) {
  if (!clothingValue) {
    return "";
  }

  if (!colorValue) {
    return clothingValue;
  }

  return colorValue + " " + clothingValue;
}


// ------------------------------------------------------------
// CLOTHING RELATIONSHIP RULES
// ------------------------------------------------------------
//
// These replace the old MASCULINE_CLOTHING_EXCLUSIONS array.
//
// Notice that the relationship is attached to the item itself.
// We are not asking:
//
//   "Is this item at index 14?"
//
// We are asking:
//
//   "What is the ID of this item and what does its metadata say?"
// ------------------------------------------------------------


// Feminine clothing is discouraged for men by default.
//
// It is NOT blocked. This is important because the generator
// should still be capable of deliberately generating unusual
// combinations when the user requests them.

addCompatibilityRules(
  clothingPresets
    .filter(clothingIsFeminine)
    .map(preset => preset.id),
  {
    preferredWhen: [
      relationshipCondition("gender", "woman")
    ],
    discouragedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Dresses and lingerie were effectively unavailable to men in
// the old randomizer. They are therefore stronger than a simple
// feminine preference.

addCompatibilityRules(
  [
    "clothing.dresses.casual_dress",
    "clothing.dresses.sundress",
    "clothing.dresses.cocktail",
    "clothing.dresses.evening",
    "clothing.dresses.bodycon",

    "clothing.lingerie.bra_panties",
    "clothing.lingerie.lace_bra_panties",
    "clothing.lingerie.babydoll",
    "clothing.lingerie.camisole_shorts"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Certain specifically feminine bottoms are also blocked from
// the masculine random pool, matching the behavior of V13.

addCompatibilityRules(
  [
    "clothing.bottoms.mini_skirt",
    "clothing.bottoms.pleated_mini_skirt",
    "clothing.bottoms.wrap_skirt",
    "clothing.bottoms.spandex_leggings"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Feminine footwear that V13 excluded from the masculine pool.

addCompatibilityRules(
  [
    "clothing.footwear.stiletto_heels",
    "clothing.footwear.thigh_high_boots",
    "clothing.footwear.lace_up_thigh_highs"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// Costume items that were specifically excluded from the
// masculine randomizer.

addCompatibilityRules(
  [
    "clothing.costume.fishnet_stockings",
    "clothing.costume.lace_stockings"
  ],
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// ------------------------------------------------------------
// CLOTHING GROUP COMPATIBILITY
// ------------------------------------------------------------
//
// Group-level compatibility controls which categories are
// eligible before an individual item is selected.
// ------------------------------------------------------------

addCompatibilityRule(
  "clothing_group.dresses",
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);

addCompatibilityRule(
  "clothing_group.lingerie",
  {
    blockedWhen: [
      relationshipCondition("gender", "man")
    ]
  }
);


// These groups remain technically available to both genders,
// but feminine items inside them are still filtered/weighted
// individually.

// ============================================================
// V14 — ACTION DATA
// ============================================================
//
// Actions are data-driven just like clothing.
//
// An action can describe:
//   - the action itself
//   - the pose
//   - the environment implied by the action
//   - clothing/accessory relationships
//   - gender relationships
//
// The randomizer will later use the same compatibility engine
// for actions that it uses for appearance and clothing.
// ============================================================


// ------------------------------------------------------------
// ACTION FACTORY
// ------------------------------------------------------------

function createActionPreset(
  id,
  label,
  value,
  metadata
) {
  return {
    id: id,
    label: label,
    value: value,
    metadata: metadata || {}
  };
}


// ------------------------------------------------------------
// BASIC ACTIONS
// ------------------------------------------------------------

const actionPresets = [

  createActionPreset(
    "action.smiling",
    "Smiling",
    "smiling"
  ),

  createActionPreset(
    "action.standing",
    "Standing",
    "standing"
  ),

  createActionPreset(
    "action.sitting",
    "Sitting",
    "sitting"
  ),

  createActionPreset(
    "action.walking",
    "Walking",
    "walking"
  ),

  createActionPreset(
    "action.looking_at_camera",
    "Looking at Camera",
    "looking directly at the camera"
  ),

  createActionPreset(
    "action.looking_away",
    "Looking Away",
    "looking away from the camera"
  ),

  createActionPreset(
    "action.laughing",
    "Laughing",
    "laughing naturally"
  ),

  createActionPreset(
    "action.reading",
    "Reading",
    "reading a book"
  ),

  createActionPreset(
    "action.drinking",
    "Drinking",
    "drinking from a glass"
  ),

  createActionPreset(
    "action.eating",
    "Eating",
    "eating a meal"
  ),

  createActionPreset(
    "action.cooking",
    "Cooking",
    "cooking in a kitchen"
  ),

  createActionPreset(
    "action.working",
    "Working",
    "working at a desk"
  ),

  createActionPreset(
    "action.using_phone",
    "Using Phone",
    "using a smartphone"
  ),

  createActionPreset(
    "action.listening_music",
    "Listening to Music",
    "listening to music with headphones"
  ),

  createActionPreset(
    "action.exercising",
    "Exercising",
    "exercising"
  ),

  createActionPreset(
    "action.dancing",
    "Dancing",
    "dancing"
  ),

  createActionPreset(
    "action.running",
    "Running",
    "running"
  ),

  createActionPreset(
    "action.stretching",
    "Stretching",
    "stretching"
  ),

  createActionPreset(
    "action.yoga",
    "Yoga",
    "doing yoga"
  )
];


// ------------------------------------------------------------
// CASUAL / PORTRAIT ACTIONS
// ------------------------------------------------------------

const portraitActionPresets = [

  createActionPreset(
    "action.portrait.standing_relaxed",
    "Standing Relaxed",
    "standing in a relaxed natural pose"
  ),

  createActionPreset(
    "action.portrait.hands_on_hips",
    "Hands on Hips",
    "standing with hands resting naturally on the hips"
  ),

  createActionPreset(
    "action.portrait.arms_crossed",
    "Arms Crossed",
    "standing with arms crossed"
  ),

  createActionPreset(
    "action.portrait.hands_in_pockets",
    "Hands in Pockets",
    "standing with hands in pockets"
  ),

  createActionPreset(
    "action.portrait.leaning_wall",
    "Leaning Against Wall",
    "leaning casually against a wall"
  ),

  createActionPreset(
    "action.portrait.sitting_chair",
    "Sitting in Chair",
    "sitting casually in a chair"
  ),

  createActionPreset(
    "action.portrait.sitting_couch",
    "Sitting on Couch",
    "sitting comfortably on a couch"
  ),

  createActionPreset(
    "action.portrait.looking_over_shoulder",
    "Looking Over Shoulder",
    "looking back over the shoulder toward the camera"
  )
];


// ------------------------------------------------------------
// MIRROR / REFLECTION ACTIONS
// ------------------------------------------------------------

const mirrorActionPresets = [

  createActionPreset(
    "action.mirror.mirror_selfie",
    "Mirror Selfie",
    "taking a mirror selfie with a smartphone"
  ),

  createActionPreset(
    "action.mirror.mirror_standing",
    "Standing in Front of Mirror",
    "standing in front of a full-length mirror"
  ),

  createActionPreset(
    "action.mirror.checking_appearance",
    "Checking Appearance",
    "checking their appearance in a mirror"
  ),

  createActionPreset(
    "action.mirror.adjusting_clothing",
    "Adjusting Clothing",
    "adjusting their clothing while looking into a mirror"
  )
];


// ------------------------------------------------------------
// HOME / INTERIOR ACTIONS
// ------------------------------------------------------------

const homeActionPresets = [

  createActionPreset(
    "action.home.sitting_fireplace",
    "Sitting Near Fireplace",
    "sitting comfortably near a fireplace"
  ),

  createActionPreset(
    "action.home.reading_couch",
    "Reading on Couch",
    "reading a book while sitting on a couch"
  ),

  createActionPreset(
    "action.home.making_coffee",
    "Making Coffee",
    "making coffee in a kitchen"
  ),

  createActionPreset(
    "action.home.cooking_meal",
    "Cooking Meal",
    "preparing a meal in a kitchen"
  ),

  createActionPreset(
    "action.home.watering_plants",
    "Watering Plants",
    "watering houseplants"
  ),

  createActionPreset(
    "action.home.cleaning",
    "Cleaning",
    "cleaning the room"
  ),

  createActionPreset(
    "action.home.relaxing",
    "Relaxing",
    "relaxing comfortably at home"
  )
];


// ------------------------------------------------------------
// OUTDOOR ACTIONS
// ------------------------------------------------------------

const outdoorActionPresets = [

  createActionPreset(
    "action.outdoor.walking",
    "Walking Outdoors",
    "walking outdoors"
  ),

  createActionPreset(
    "action.outdoor.sitting_bench",
    "Sitting on Bench",
    "sitting on a park bench"
  ),

  createActionPreset(
    "action.outdoor.looking_scenery",
    "Looking at Scenery",
    "looking out at the surrounding scenery"
  ),

  createActionPreset(
    "action.outdoor.hiking",
    "Hiking",
    "hiking outdoors"
  ),

  createActionPreset(
    "action.outdoor.running",
    "Running Outdoors",
    "running outdoors"
  ),

  createActionPreset(
    "action.outdoor.cycling",
    "Cycling",
    "riding a bicycle"
  )
];


// ------------------------------------------------------------
// SOCIAL ACTIONS
// ------------------------------------------------------------

const socialActionPresets = [

  createActionPreset(
    "action.social.talking",
    "Talking",
    "talking naturally"
  ),

  createActionPreset(
    "action.social.laughing",
    "Laughing With Someone",
    "laughing while talking with someone"
  ),

  createActionPreset(
    "action.social.waving",
    "Waving",
    "waving toward the camera"
  ),

  createActionPreset(
    "action.social.greeting",
    "Greeting",
    "greeting someone"
  )
];


// ------------------------------------------------------------
// ACTION GROUPS
// ------------------------------------------------------------

const actionGroups = [

  {
    id: "action_group.basic",
    label: "Basic Actions",
    presets: actionPresets
  },

  {
    id: "action_group.portrait",
    label: "Portrait Poses",
    presets: portraitActionPresets
  },

  {
    id: "action_group.mirror",
    label: "Mirror / Reflection",
    presets: mirrorActionPresets
  },

  {
    id: "action_group.home",
    label: "Home / Interior",
    presets: homeActionPresets
  },

  {
    id: "action_group.outdoor",
    label: "Outdoor",
    presets: outdoorActionPresets
  },

  {
    id: "action_group.social",
    label: "Social",
    presets: socialActionPresets
  }
];


// ------------------------------------------------------------
// FLATTEN ACTIONS
// ------------------------------------------------------------

const allActionPresets = actionGroups.reduce(
  (all, group) => all.concat(group.presets),
  []
);


// ------------------------------------------------------------
// ACTION LOOKUPS
// ------------------------------------------------------------

function getActionGroupById(groupId) {
  return actionGroups.find(
    group => group.id === groupId
  );
}

function getActionPresetById(id) {
  return allActionPresets.find(
    preset => preset.id === id
  );
}

function getActionPresetsForGroup(groupId) {
  const group = getActionGroupById(groupId);

  return group
    ? group.presets.slice()
    : [];
}


// ------------------------------------------------------------
// ACTION METADATA HELPERS
// ------------------------------------------------------------

function actionHasMetadata(preset, key) {
  return !!(
    preset &&
    preset.metadata &&
    preset.metadata[key]
  );
}


// ------------------------------------------------------------
// ACTION COMPATIBILITY
// ------------------------------------------------------------
//
// These replace the old MASCULINE_POSE_EXCLUSIONS approach.
//
// The actions themselves carry relationships. There is no need
// for a separate "male action blacklist."
// ------------------------------------------------------------


// These actions are not blocked for men or women.
// They remain neutral.


addCompatibilityRule(
  "action.home.sitting_fireplace",
  {
    neutralWhen: [
      relationshipCondition("gender", [
        "woman",
        "man"
      ])
    ]
  }
);


// These are deliberately neutral rather than feminine.
// A man can use them naturally, and a woman can use them
// naturally.


// ------------------------------------------------------------
// ACTION / CLOTHING RELATIONSHIPS
// ------------------------------------------------------------
//
// Some actions strongly imply clothing situations.
//
// These relationships are intentionally soft unless the
// combination is actually contradictory.
// ------------------------------------------------------------


// Mirror selfie works with almost any outfit.


// Adjusting clothing works especially well with fitted,
// formal, or layered clothing, but we don't force any specific
// clothing item here. The prompt builder will simply use the
// selected clothing.


addCompatibilityRule(
  "action.mirror.adjusting_clothing",
  {
    preferredWhen: [
      relationshipCondition("clothingGroups", [
        "Tops",
        "Bottoms",
        "Dresses",
        "Sets",
        "Uniforms"
      ])
    ]
  }
);


// Cooking is slightly discouraged when the randomizer has
// selected an outfit that is obviously impractical.
//
// We use clothing group state rather than item indexes.

addCompatibilityRule(
  "action.home.cooking_meal",
  {
    discouragedWhen: [
      relationshipCondition("clothingGroups", "Lingerie")
    ]
  }
);


// Exercising is discouraged with formal/period clothing.

addCompatibilityRule(
  "action.exercising",
  {
    discouragedWhen: [
      relationshipCondition("clothingGroups", [
        "Period Fashion",
        "Uniforms"
      ])
    ]
  }
);


// Running has the same relationship.

addCompatibilityRule(
  "action.outdoor.running",
  {
    discouragedWhen: [
      relationshipCondition("clothingGroups", [
        "Period Fashion",
        "Dresses",
        "Lingerie"
      ])
    ]
  }
);


// ------------------------------------------------------------
// ACTION GROUP STATE
// ------------------------------------------------------------
//
// These values will be stored in generationState instead of
// being inferred from array positions.
// ------------------------------------------------------------

function getActionGroupLabel(preset) {
  if (!preset) {
    return "";
  }

  const group = actionGroups.find(
    actionGroup =>
      actionGroup.presets.some(
        action => action.id === preset.id
      )
  );

  return group
    ? group.label
    : "";
}


// ------------------------------------------------------------
// ACTION STATE HELPER
// ------------------------------------------------------------

function setActionState(state, actionPreset) {
  if (!state || !actionPreset) {
    return state;
  }

  state.action = {
    id: actionPreset.id,
    label: actionPreset.label,
    value: actionPreset.value
  };

  state.actionGroup = getActionGroupLabel(
    actionPreset
  );

  return state;
}


// ------------------------------------------------------------
// ACTION COMPATIBILITY WRAPPER
// ------------------------------------------------------------
//
// This lets the later randomizer ask:
//
//   "Give me actions compatible with the current state."
//
// without knowing anything about how the actions are stored.
// ------------------------------------------------------------

function getCompatibleActions(state, presets) {
  const source = presets || allActionPresets;

  return getCompatiblePresets(
    "action",
    source,
    state
  );
}

// ============================================================
// V14 — CAMERA / LIGHTING / STYLE DATA
// ============================================================
//
// These categories are deliberately kept separate.
//
// camera      = how the scene is photographed
// lighting    = quality/direction of light
// timeOfDay   = environmental illumination/time
// artStyle    = visual rendering style
//
// They are still stored in generationState so future
// compatibility rules can use them.
// ============================================================


// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const cameraPresets = [

  {
    id: "camera.candid",
    label: "Candid",
    value: "candid photography"
  },

  {
    id: "camera.portrait",
    label: "Portrait",
    value: "portrait photography"
  },

  {
    id: "camera.close_up",
    label: "Close-Up",
    value: "close-up portrait photography"
  },

  {
    id: "camera.medium_shot",
    label: "Medium Shot",
    value: "medium shot"
  },

  {
    id: "camera.full_body",
    label: "Full Body",
    value: "full-body photograph"
  },

  {
    id: "camera.wide_shot",
    label: "Wide Shot",
    value: "wide establishing shot"
  },

  {
    id: "camera.low_angle",
    label: "Low Angle",
    value: "low-angle photography"
  },

  {
    id: "camera.high_angle",
    label: "High Angle",
    value: "high-angle photography"
  },

  {
    id: "camera.eye_level",
    label: "Eye Level",
    value: "eye-level photography"
  },

  {
    id: "camera.over_shoulder",
    label: "Over the Shoulder",
    value: "over-the-shoulder composition"
  },

  {
    id: "camera.profile",
    label: "Profile",
    value: "profile view"
  },

  {
    id: "camera.three_quarter",
    label: "Three-Quarter View",
    value: "three-quarter view"
  },

  {
    id: "camera.mirror",
    label: "Mirror Composition",
    value: "mirror photography composition"
  },

  {
    id: "camera.documentary",
    label: "Documentary",
    value: "documentary-style photography"
  }
];


// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

const lightingPresets = [

  {
    id: "lighting.soft",
    label: "Soft",
    value: "soft directional light, balanced exposure, and ambient fill"
  },

  {
    id: "lighting.natural",
    label: "Natural",
    value: "natural soft light"
  },

  {
    id: "lighting.golden",
    label: "Golden Hour",
    value: "warm golden-hour lighting"
  },

  {
    id: "lighting.sunlight",
    label: "Direct Sunlight",
    value: "bright direct sunlight"
  },

  {
    id: "lighting.overcast",
    label: "Overcast",
    value: "soft overcast daylight"
  },

  {
    id: "lighting.window",
    label: "Window Light",
    value: "soft natural window light"
  },

  {
    id: "lighting.studio",
    label: "Studio",
    value: "professional studio lighting"
  },

  {
    id: "lighting.rim",
    label: "Rim Light",
    value: "dramatic rim lighting"
  },

  {
    id: "lighting.dramatic",
    label: "Dramatic",
    value: "dramatic directional lighting with deep shadows"
  },

  {
    id: "lighting.low_key",
    label: "Low Key",
    value: "low-key cinematic lighting"
  },

  {
    id: "lighting.high_key",
    label: "High Key",
    value: "bright high-key lighting"
  },

  {
    id: "lighting.neon",
    label: "Neon",
    value: "colorful neon lighting"
  }
];


// ------------------------------------------------------------
// TIME OF DAY
// ------------------------------------------------------------

const timeOfDayPresets = [

  {
    id: "time.day",
    label: "Daytime",
    value: "natural daytime illumination"
  },

  {
    id: "time.morning",
    label: "Morning",
    value: "soft morning light"
  },

  {
    id: "time.noon",
    label: "Midday",
    value: "bright midday illumination"
  },

  {
    id: "time.afternoon",
    label: "Afternoon",
    value: "warm afternoon daylight"
  },

  {
    id: "time.golden_hour",
    label: "Golden Hour",
    value: "golden-hour sunlight"
  },

  {
    id: "time.sunset",
    label: "Sunset",
    value: "sunset illumination"
  },

  {
    id: "time.blue_hour",
    label: "Blue Hour",
    value: "cool blue-hour illumination"
  },

  {
    id: "time.night",
    label: "Night",
    value: "nighttime illumination"
  }
];


// ------------------------------------------------------------
// ART STYLE
// ------------------------------------------------------------

const artStylePresets = [

  {
    id: "style.photo",
    label: "Photo",
    value: "photorealistic photography"
  },

  {
    id: "style.editorial",
    label: "Editorial",
    value: "high-end editorial photography"
  },

  {
    id: "style.fashion",
    label: "Fashion",
    value: "fashion photography"
  },

  {
    id: "style.cinematic",
    label: "Cinematic",
    value: "cinematic photography"
  },

  {
    id: "style.documentary",
    label: "Documentary",
    value: "documentary photography"
  },

  {
    id: "style.film",
    label: "Film",
    value: "analog film photography"
  },

  {
    id: "style.polaroid",
    label: "Polaroid",
    value: "vintage Polaroid photography"
  },

  {
    id: "style.black_white",
    label: "Black and White",
    value: "black-and-white photography"
  },

  {
    id: "style.tenebrism",
    label: "Tenebrism",
    value: "dramatic tenebrist photography"
  },

  {
    id: "style.street",
    label: "Street Photography",
    value: "street photography"
  }
];


// ------------------------------------------------------------
// LOOKUP HELPERS
// ------------------------------------------------------------

function getPresetById(presets, id) {
  if (!Array.isArray(presets)) {
    return undefined;
  }

  return presets.find(
    preset => getPresetId(preset) === id
  );
}

function getCameraPresetById(id) {
  return getPresetById(cameraPresets, id);
}

function getLightingPresetById(id) {
  return getPresetById(lightingPresets, id);
}

function getTimeOfDayPresetById(id) {
  return getPresetById(timeOfDayPresets, id);
}

function getArtStylePresetById(id) {
  return getPresetById(artStylePresets, id);
}


// ------------------------------------------------------------
// CAMERA RELATIONSHIPS
// ------------------------------------------------------------
//
// Camera choices are mostly neutral. Only obvious relationships
// are encoded here.
// ------------------------------------------------------------

addCompatibilityRule(
  "camera.full_body",
  {
    preferredWhen: [
      relationshipCondition("action", [
        "walking",
        "running",
        "standing"
      ])
    ]
  }
);

addCompatibilityRule(
  "camera.close_up",
  {
    preferredWhen: [
      relationshipCondition("action", [
        "smiling",
        "laughing",
        "looking directly at the camera"
      ])
    ]
  }
);

addCompatibilityRule(
  "camera.mirror",
  {
    preferredWhen: [
      relationshipCondition("action", [
        "taking a mirror selfie with a smartphone",
        "standing in front of a full-length mirror",
        "checking their appearance in a mirror",
        "adjusting their clothing while looking into a mirror"
      ])
    ]
  }
);


// ------------------------------------------------------------
// LIGHTING RELATIONSHIPS
// ------------------------------------------------------------

addCompatibilityRule(
  "lighting.golden",
  {
    preferredWhen: [
      relationshipCondition("timeOfDay", [
        "golden-hour sunlight",
        "golden-hour"
      ])
    ]
  }
);

addCompatibilityRule(
  "lighting.neon",
  {
    preferredWhen: [
      relationshipCondition("timeOfDay", "nighttime illumination")
    ]
  }
);

addCompatibilityRule(
  "lighting.window",
  {
    preferredWhen: [
      relationshipCondition("action", [
        "reading a book",
        "reading a book while sitting on a couch",
        "relaxing comfortably at home"
      ])
    ]
  }
);


// ------------------------------------------------------------
// ART-STYLE RELATIONSHIPS
// ------------------------------------------------------------

addCompatibilityRule(
  "style.fashion",
  {
    preferredWhen: [
      relationshipCondition("clothingGroups", [
        "Dresses",
        "Sets"
      ])
    ]
  }
);

addCompatibilityRule(
  "style.fashion",
  {
    preferredWhen: [
      relationshipCondition("clothingGroups", [
        "Dresses",
        "Sets"
      ])
    ]
  }
);

addCompatibilityRule(
  "style.tenebrism",
  {
    preferredWhen: [
      relationshipCondition("lighting", [
        "dramatic directional lighting with deep shadows",
        "low-key cinematic lighting"
      ])
    ]
  }
);

addCompatibilityRule(
  "style.documentary",
  {
    preferredWhen: [
      relationshipCondition("camera", [
        "documentary-style photography",
        "street photography"
      ])
    ]
  }
);


// ------------------------------------------------------------
// STATE SETTERS
// ------------------------------------------------------------
//
// These setters store the actual selected value in the
// generation state.
//
// Future choices can therefore inspect what has already been
// selected.
// ------------------------------------------------------------

function setStatePreset(state, category, preset) {
  if (!state || !preset) {
    return state;
  }

  state[category] = {
    id: getPresetId(preset),
    label: getPresetLabel(preset),
    value: getPresetValue(preset)
  };

  return state;
}


function setCameraState(state, preset) {
  return setStatePreset(
    state,
    "camera",
    preset
  );
}


function setLightingState(state, preset) {
  return setStatePreset(
    state,
    "lighting",
    preset
  );
}


function setTimeOfDayState(state, preset) {
  return setStatePreset(
    state,
    "timeOfDay",
    preset
  );
}


function setArtStyleState(state, preset) {
  return setStatePreset(
    state,
    "artStyle",
    preset
  );
}


// ------------------------------------------------------------
// STATE VALUE ACCESS
// ------------------------------------------------------------
//
// Compatibility rules need the actual selected value, not the
// UI object.
//
// These helpers make that conversion consistent.
// ------------------------------------------------------------

function getStateValue(state, category) {
  if (!state || state[category] === undefined) {
    return undefined;
  }

  const entry = state[category];

  if (
    entry &&
    typeof entry === "object" &&
    Object.prototype.hasOwnProperty.call(entry, "value")
  ) {
    return entry.value;
  }

  return entry;
}


function getStateId(state, category) {
  if (!state || state[category] === undefined) {
    return undefined;
  }

  const entry = state[category];

  if (
    entry &&
    typeof entry === "object" &&
    Object.prototype.hasOwnProperty.call(entry, "id")
  ) {
    return entry.id;
  }

  return entry;
}


// ------------------------------------------------------------
// GENERATION STATE SNAPSHOT
// ------------------------------------------------------------
//
// This gives us a clean representation of the choices made so
// far.
//
// It becomes especially important once random generation is
// performed in multiple stages.
// ------------------------------------------------------------

function getGenerationStateSnapshot(state) {
  return JSON.parse(
    JSON.stringify(state || {})
  );
}


// ------------------------------------------------------------
// STATE MERGING
// ------------------------------------------------------------

function mergeGenerationState(target, source) {
  if (!target || !source) {
    return target;
  }

  Object.keys(source).forEach(key => {
    if (
      source[key] !== undefined &&
      source[key] !== null
    ) {
      target[key] = source[key];
    }
  });

  return target;
}


// ------------------------------------------------------------
// CURRENT CONTEXT DESCRIPTION
// ------------------------------------------------------------
//
// Useful later for debugging and prompt generation.
// ------------------------------------------------------------

function describeGenerationState(state) {
  const parts = [];

  const categories = [
    "gender",
    "nationality",
    "age",
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "bodyShape",
    "hairColor",
    "hairLength",
    "hairType",
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  categories.forEach(category => {
    const value = getStateValue(
      state,
      category
    );

    if (value) {
      parts.push(
        category + "=" + value
      );
    }
  });

  return parts.join(", ");
}

// ============================================================
// V14 — STATE-AWARE RANDOMIZATION ENGINE
// ============================================================
//
// This is the central randomization system.
//
// Generation happens progressively:
//
//   1. Identity
//   2. Body
//   3. Appearance
//   4. Hair
//   5. Accessories
//   6. Clothing
//   7. Action
//   8. Camera
//   9. Lighting
//  10. Time of day
//  11. Art style
//
// Every selection is written into generationState.
//
// Every later selection can therefore see what has already
// been selected.
//
// "Random" means unpredictable among compatible choices,
// not completely unrestricted.
// ============================================================


// ------------------------------------------------------------
// RANDOMIZATION MODES
// ------------------------------------------------------------

const RANDOMIZATION_MODES = [
  {
    id: "randomization.compatible",
    label: "Compatible Random",
    value: "compatible"
  },

  {
    id: "randomization.free",
    label: "Free Random",
    value: "free"
  }
];


// ------------------------------------------------------------
// RANDOMIZATION CONFIGURATION
// ------------------------------------------------------------

function createRandomizationConfig() {
  return {
    mode: "compatible",

    useProfileWeights: true,

    preferredMultiplier: 4,
    discouragedMultiplier: 0.2,

    allowManualOverrides: true,

    randomizeIdentity: true,
    randomizeBody: true,
    randomizeAppearance: true,
    randomizeHair: true,
    randomizeAccessories: true,
    randomizeClothing: true,
    randomizeAction: true,
    randomizeCamera: true,
    randomizeLighting: true,
    randomizeTimeOfDay: true,
    randomizeArtStyle: true
  };
}


// ------------------------------------------------------------
// CONFIG HELPERS
// ------------------------------------------------------------

function isCompatibleRandomMode(cfg) {
  return (
    !cfg ||
    cfg.mode === "compatible"
  );
}


function isFreeRandomMode(cfg) {
  return (
    cfg &&
    cfg.mode === "free"
  );
}


// ------------------------------------------------------------
// SAFE RANDOM PRESET SELECTION
// ------------------------------------------------------------
//
// This is the generic entry point.
//
// It does NOT know whether the presets are:
//   hair
//   skin
//   clothing
//   actions
//   cameras
//
// It simply receives a category and a collection of presets.
// ------------------------------------------------------------

function chooseRandomPreset(
  category,
  presets,
  state,
  cfg
) {
  if (!Array.isArray(presets) || presets.length === 0) {
    return undefined;
  }

  const configuration =
    cfg || createRandomizationConfig();


  // ----------------------------------------------------------
  // FREE RANDOM
  // ----------------------------------------------------------
  //
  // This intentionally ignores compatibility relationships.
  // It is useful when the user explicitly wants combinations
  // that would normally be considered unusual.
  // ----------------------------------------------------------

  if (isFreeRandomMode(configuration)) {
    return randomElement(
      presets
    );
  }


  // ----------------------------------------------------------
  // COMPATIBLE RANDOM
  // ----------------------------------------------------------

  const compatible = getCompatiblePresets(
    category,
    presets,
    state
  );


  if (compatible.length === 0) {
    // Never crash simply because a rule combination became
    // restrictive. Fall back to the original collection.
    return randomElement(
      presets
    );
  }


  return weightedChooseCompatiblePreset(
    category,
    compatible,
    state,
    configuration
  );
}


// ------------------------------------------------------------
// WEIGHTED COMPATIBLE CHOICE
// ------------------------------------------------------------

function weightedChooseCompatiblePreset(
  category,
  presets,
  state,
  cfg
) {
  if (!presets || presets.length === 0) {
    return undefined;
  }

  const weightedOptions = [];


  presets.forEach(preset => {

    let weight =
      getCompatibilityWeight(
        category,
        preset,
        state
      );


    // --------------------------------------------------------
    // PROFILE WEIGHT
    // --------------------------------------------------------
    //
    // Profile weighting applies only where the current trait
    // category has a profile table.
    // --------------------------------------------------------

    if (
      cfg.useProfileWeights &&
      state &&
      state.nationalityProfile
    ) {
      const profile =
        getStateValue(
          state,
          "nationalityProfile"
        );

      if (profile) {
        weight *= getProfileTraitWeight(
          profile,
          category,
          preset
        );
      }
    }


    // --------------------------------------------------------
    // SANITY CHECK
    // --------------------------------------------------------

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return;
    }


    weightedOptions.push({
      preset: preset,
      weight: weight
    });
  });


  if (weightedOptions.length === 0) {
    return randomElement(
      presets
    );
  }


  return weightedRandomObject(
    weightedOptions
  ).preset;
}


// ------------------------------------------------------------
// WEIGHTED OBJECT PICKER
// ------------------------------------------------------------

function weightedRandomObject(options) {
  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {
    return undefined;
  }

  let totalWeight = 0;

  options.forEach(option => {
    if (
      option &&
      Number.isFinite(option.weight) &&
      option.weight > 0
    ) {
      totalWeight += option.weight;
    }
  });


  if (totalWeight <= 0) {
    return options[
      randomInt(options.length)
    ];
  }


  let roll =
    Math.random() * totalWeight;


  for (let i = 0; i < options.length; i++) {

    const weight =
      Number.isFinite(options[i].weight)
        ? Math.max(0, options[i].weight)
        : 0;

    roll -= weight;

    if (roll <= 0) {
      return options[i];
    }
  }


  return options[
    options.length - 1
  ];
}


// ------------------------------------------------------------
// PROFILE TRAIT WEIGHT
// ------------------------------------------------------------
//
// This connects the profile system from Chunks 2–3 to the
// generic compatibility system.
//
// The profile is NOT allowed to invent an appearance.
//
// It only changes the probability of existing options.
// ------------------------------------------------------------

function getProfileTraitWeight(
  profile,
  category,
  preset
) {
  if (!profile) {
    return 1;
  }


  const profileData =
    TRAIT_PROFILES[profile];


  if (!profileData) {
    return 1;
  }


  const table =
    profileData[category];


  if (!table) {
    return 1;
  }


  const normalized =
    normalizeProfileTable(
      category,
      table
    );


  const label =
    getPresetLabel(
      preset
    );


  const value =
    getPresetValue(
      preset
    );


  let weight =
    getNormalizedProfileWeight(
      normalized,
      label
    );


  if (
    weight === undefined ||
    weight === null
  ) {
    weight =
      getNormalizedProfileWeight(
        normalized,
        value
      );
  }


  if (
    weight === undefined ||
    weight === null
  ) {
    // Small default rather than zero.
    //
    // This means an unlisted trait is uncommon but still
    // possible, which preserves variation.
    return 0.05;
  }


  return Math.max(
    0,
    Number(weight)
  );
}


// ------------------------------------------------------------
// CATEGORY SELECTION WRAPPER
// ------------------------------------------------------------
//
// Every random selection can go through this one function.
// ------------------------------------------------------------

function chooseAndStoreRandomPreset(
  state,
  category,
  presets,
  cfg
) {
  const preset =
    chooseRandomPreset(
      category,
      presets,
      state,
      cfg
    );


  if (!preset) {
    return undefined;
  }


  setStatePreset(
    state,
    category,
    preset
  );


  return preset;
}


// ------------------------------------------------------------
// RANDOM VALUE WRAPPER
// ------------------------------------------------------------

function chooseAndStoreRandomValue(
  state,
  category,
  presets,
  cfg
) {
  const preset =
    chooseAndStoreRandomPreset(
      state,
      category,
      presets,
      cfg
    );


  return preset
    ? getPresetValue(preset)
    : "";
}


// ------------------------------------------------------------
// IDENTITY GENERATION
// ------------------------------------------------------------
//
// Identity comes first because it establishes the profile that
// later appearance choices can use.
// ------------------------------------------------------------

function randomizeIdentity(
  state,
  cfg
) {
  const gender =
    chooseAndStoreRandomPreset(
      state,
      "gender",
      genderPresets,
      cfg
    );


  if (gender) {
    state.genderForm =
      getPresetValue(gender);
  }


  const nationality =
    chooseAndStoreRandomPreset(
      state,
      "nationality",
      nationalityPresets,
      cfg
    );


  if (nationality) {

    state.nationalityProfile =
    {
      id:
        nationality.profile ||
        "",

      value:
        nationality.profile ||
        ""
    };
  }


  const age =
    chooseAndStoreRandomPreset(
      state,
      "age",
      agePresets,
      cfg
    );


  return {
    gender: gender,
    nationality: nationality,
    age: age
  };
}


// ------------------------------------------------------------
// PROFILE STATE NORMALIZATION
// ------------------------------------------------------------
//
// nationality.profile is stored as the profile ID.
//
// This helper keeps that representation consistent.
// ------------------------------------------------------------

function getCurrentProfile(state) {
  if (
    !state ||
    !state.nationalityProfile
  ) {
    return "";
  }


  return getStateValue(
    state,
    "nationalityProfile"
  ) || "";
}


// ------------------------------------------------------------
// BODY GENERATION
// ------------------------------------------------------------

function randomizeBody(
  state,
  cfg
) {
  const categories = [
    ["skin", skinTonePresets],
    ["eyes", eyeColorPresets],
    ["overallBuild", overallBuildPresets],
    ["height", heightPresets],
    ["chest", chestPresets],
    ["hips", hipsPresets],
    ["lips", lipsPresets],
    ["eyelashes", eyelashesPresets],
    ["bodyShape", bodyShapePresets],
    ["legs", legsPresets],
    ["buttocks", assSizePresets],
    ["belly", bellyPresets],
    ["specificBody", specificBodyPresets]
  ];


  const results = {};


  categories.forEach(entry => {

    const category =
      entry[0];

    const presets =
      entry[1];


    const preset =
      chooseAndStoreRandomPreset(
        state,
        category,
        presets,
        cfg
      );


    results[category] =
      preset;
  });


  return results;
}


// ------------------------------------------------------------
// APPEARANCE GENERATION
// ------------------------------------------------------------

function randomizeAppearance(
  state,
  cfg
) {
  const results = {};


  const categories = [
    ["makeup", makeupPresets],
    ["makeupOddities", makeupOdditiesPresets],
    ["facialHair", facialHairPresets],
    ["tattoos", tattooPresets],
    ["bodyDetails", bodyDetailPresets],
    ["nails", nailPresets],
    ["hairDetails", hairDetailPresets],
    ["nose", nosePresets]
  ];


  categories.forEach(entry => {

    const category =
      entry[0];

    const presets =
      entry[1];


    results[category] =
      chooseAndStoreRandomPreset(
        state,
        category,
        presets,
        cfg
      );
  });


  return results;
}


// ------------------------------------------------------------
// HAIR GENERATION
// ------------------------------------------------------------

function randomizeHair(
  state,
  cfg
) {
  const results = {};


  const categories = [
    ["hairColor", hairColorPresets],
    ["hairLength", hairLengthPresets],
    ["hairType", hairTypePresets]
  ];


  categories.forEach(entry => {

    const category =
      entry[0];

    const presets =
      entry[1];


    results[category] =
      chooseAndStoreRandomPreset(
        state,
        category,
        presets,
        cfg
      );
  });


  // ----------------------------------------------------------
  // HAIRSTYLE
  // ----------------------------------------------------------
  //
  // Hairstyle groups are flattened into one collection.
  // No index ranges are assumed.
  // ----------------------------------------------------------

  const hairstyle =
    chooseAndStoreRandomPreset(
      state,
      "hairstyles",
      hairstylePresets,
      cfg
    );


  results.hairstyles =
    hairstyle;


  // ----------------------------------------------------------
  // HAIR ACCESSORIES
  // ----------------------------------------------------------

  const hairAccessories =
    accessoryPresets.filter(
      preset =>
        preset.category ===
        "Hair Accessories"
    );


  if (hairAccessories.length > 0) {

    results.hairAccessories =
      chooseAndStoreRandomPreset(
        state,
        "accessories",
        hairAccessories,
        cfg
      );
  }


  return results;
}


// ------------------------------------------------------------
// GENERAL ACCESSORY GENERATION
// ------------------------------------------------------------

function randomizeAccessories(
  state,
  cfg
) {
  const results = {};


  accessoryGroups.forEach(group => {

    const shouldAdd =
      randomChance(
        getAccessoryGroupChance(
          group,
          state
        )
      );


    if (!shouldAdd) {
      return;
    }


    const compatible =
      getCompatiblePresets(
        "accessories",
        group.presets,
        state
      );


    if (compatible.length === 0) {
      return;
    }


    const selected =
      chooseRandomPreset(
        "accessories",
        compatible,
        state,
        cfg
      );


    if (!selected) {
      return;
    }


    if (!state.accessories) {
      state.accessories = [];
    }


    state.accessories.push({
      id:
        getPresetId(selected),

      label:
        getPresetLabel(selected),

      value:
        getPresetValue(selected),

      category:
        group.label
    });


    if (!results[group.label]) {
      results[group.label] = [];
    }


    results[group.label].push(
      selected
    );
  });


  return results;
}


// ------------------------------------------------------------
// ACCESSORY GROUP CHANCE
// ------------------------------------------------------------
//
// This replaces hard-coded random blocks with metadata-aware
// defaults.
// ------------------------------------------------------------

function getAccessoryGroupChance(
  group,
  state
) {
  if (!group) {
    return 0;
  }


  const label =
    group.label;


  switch (label) {

    case "Jewelry":
      return 0.30;

    case "Eyewear":
      return 0.18;

    case "Body Piercings":
      return 0.10;

    case "Headwear":
      return 0.12;

    case "Hair Accessories":
      return 0.18;

    default:
      return 0.10;
  }
}


// ------------------------------------------------------------
// CLOTHING GENERATION
// ------------------------------------------------------------
//
// Clothing is generated by group first, then item.
//
// The subject's gender and previous choices are already in
// generationState, so the compatibility engine can use them.
// ------------------------------------------------------------

function randomizeClothing(
  state,
  cfg
) {
  const results = [];


  // ----------------------------------------------------------
  // GROUP SELECTION
  // ----------------------------------------------------------

  const eligibleGroups =
    clothingGroups.filter(
      group =>
        isOptionAllowed(
          "clothingGroups",
          group,
          state
        )
    );


  if (eligibleGroups.length === 0) {
    return results;
  }


  // ----------------------------------------------------------
  // PICK PRIMARY GROUP
  // ----------------------------------------------------------

  const primaryGroup =
    chooseRandomPreset(
      "clothingGroups",
      eligibleGroups,
      state,
      cfg
    );


  if (!primaryGroup) {
    return results;
  }


  const primaryItems =
    primaryGroup.presets.filter(
      preset =>
        isOptionAllowed(
          "clothing",
          preset,
          state
        )
    );


  if (primaryItems.length === 0) {
    return results;
  }


  const primaryItem =
    chooseRandomPreset(
      "clothing",
      primaryItems,
      state,
      cfg
    );


  if (primaryItem) {

    results.push(
      storeClothingSelection(
        state,
        primaryGroup,
        primaryItem
      )
    );
  }


  // ----------------------------------------------------------
  // OPTIONAL SECOND GROUP
  // ----------------------------------------------------------
  //
  // This allows combinations such as:
  //
  //   top + bottoms
  //   dress + footwear
  //   top + bottoms + footwear
  //
  // without relying on fixed indexes.
  // ----------------------------------------------------------

  const secondaryGroups =
    eligibleGroups.filter(
      group =>
        group.id !== primaryGroup.id
    );


  secondaryGroups.forEach(group => {

    if (
      randomChance(
        getClothingGroupChance(
          group,
          state
        )
      )
    ) {

      const items =
        group.presets.filter(
          preset =>
            isOptionAllowed(
              "clothing",
              preset,
              state
            )
        );


      if (items.length === 0) {
        return;
      }


      const selected =
        chooseRandomPreset(
          "clothing",
          items,
          state,
          cfg
        );


      if (selected) {

        results.push(
          storeClothingSelection(
            state,
            group,
            selected
          )
        );
      }
    }
  });


  return results;
}


// ------------------------------------------------------------
// CLOTHING GROUP CHANCE
// ------------------------------------------------------------

function getClothingGroupChance(
  group,
  state
) {
  if (!group) {
    return 0;
  }


  switch (group.label) {

    case "Tops":
      return 0.80;

    case "Bottoms":
      return 0.80;

    case "Dresses":
      return 0.30;

    case "Lingerie":
      return 0.12;

    case "Swimwear":
      return 0.18;

    case "Robes/Loungewear":
      return 0.25;

    case "Sets":
      return 0.18;

    case "Uniforms":
      return 0.12;

    case "Costume Oddities":
      return 0.08;

    case "Period Fashion":
      return 0.08;

    case "Footwear":
      return 0.70;

    default:
      return 0.10;
  }
}


// ------------------------------------------------------------
// STORE CLOTHING
// ------------------------------------------------------------

function storeClothingSelection(
  state,
  group,
  preset
) {
  if (!state.clothing) {
    state.clothing = [];
  }


  const entry = {
    id:
      getPresetId(preset),

    label:
      getPresetLabel(preset),

    value:
      getPresetValue(preset),

    group:
      group.label,

    groupId:
      group.id
  };


  state.clothing.push(
    entry
  );


  if (!state.clothingGroups) {
    state.clothingGroups = [];
  }


  if (
    state.clothingGroups.indexOf(
      group.label
    ) === -1
  ) {
    state.clothingGroups.push(
      group.label
    );
  }


  return entry;
}


// ------------------------------------------------------------
// ACTION GENERATION
// ------------------------------------------------------------

function randomizeAction(
  state,
  cfg
) {
  const action =
    chooseAndStoreRandomPreset(
      state,
      "action",
      allActionPresets,
      cfg
    );


  if (action) {
    setActionState(
      state,
      action
    );
  }


  return action;
}


// ------------------------------------------------------------
// CAMERA GENERATION
// ------------------------------------------------------------

function randomizeCamera(
  state,
  cfg
) {
  return chooseAndStoreRandomPreset(
    state,
    "camera",
    cameraPresets,
    cfg
  );
}


// ------------------------------------------------------------
// LIGHTING GENERATION
// ------------------------------------------------------------

function randomizeLighting(
  state,
  cfg
) {
  return chooseAndStoreRandomPreset(
    state,
    "lighting",
    lightingPresets,
    cfg
  );
}


// ------------------------------------------------------------
// TIME OF DAY GENERATION
// ------------------------------------------------------------

function randomizeTimeOfDay(
  state,
  cfg
) {
  return chooseAndStoreRandomPreset(
    state,
    "timeOfDay",
    timeOfDayPresets,
    cfg
  );
}


// ------------------------------------------------------------
// ART STYLE GENERATION
// ------------------------------------------------------------

function randomizeArtStyle(
  state,
  cfg
) {
  return chooseAndStoreRandomPreset(
    state,
    "artStyle",
    artStylePresets,
    cfg
  );
}


// ------------------------------------------------------------
// COMPLETE RANDOM SUBJECT
// ------------------------------------------------------------
//
// This is the replacement for V13's buildRandomSubject().
//
// Notice there is no:
//   masculine exclusion list
//   feminine exclusion list
//   nationality-specific branch
//   hard-coded trait combination
//
// Everything is progressively written into state.
// ------------------------------------------------------------

function generateRandomSubjectState(
  cfg
) {
  const configuration =
    cfg ||
    createRandomizationConfig();


  const state =
    createGenerationState();


  randomizeIdentity(
    state,
    configuration
  );


  if (
    configuration.randomizeBody
  ) {
    randomizeBody(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeAppearance
  ) {
    randomizeAppearance(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeHair
  ) {
    randomizeHair(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeAccessories
  ) {
    randomizeAccessories(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeClothing
  ) {
    randomizeClothing(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeAction
  ) {
    randomizeAction(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeCamera
  ) {
    randomizeCamera(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeLighting
  ) {
    randomizeLighting(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeTimeOfDay
  ) {
    randomizeTimeOfDay(
      state,
      configuration
    );
  }


  if (
    configuration.randomizeArtStyle
  ) {
    randomizeArtStyle(
      state,
      configuration
    );
  }


  return state;
}


// ------------------------------------------------------------
// RANDOM SUBJECT SNAPSHOT
// ------------------------------------------------------------

function generateRandomSubjectSnapshot(
  cfg
) {
  return getGenerationStateSnapshot(
    generateRandomSubjectState(
      cfg
    )
  );
}


// ------------------------------------------------------------
// MULTIPLE RANDOM SUBJECTS
// ------------------------------------------------------------
//
// Each iteration receives a completely new state.
// No previous subject leaks into the next one.
// ------------------------------------------------------------

function generateRandomSubjectStates(
  count,
  cfg
) {
  const results = [];


  const total =
    Math.max(
      0,
      Number(count) || 0
    );


  for (
    let i = 0;
    i < total;
    i++
  ) {
    results.push(
      generateRandomSubjectState(
        cfg
      )
    );
  }


  return results;
}

// ============================================================
// V14 — RANDOMIZATION ENGINE REFINEMENTS
// Optional traits, relationship strength, and state-aware logic
// ============================================================

// ------------------------------------------------------------
// OPTIONAL / NONE-AWARE RANDOMIZATION
// ------------------------------------------------------------

const OPTIONAL_TRAIT_DEFAULTS = {
  makeup: 0.55,
  makeupOddities: 0.04,
  facialHair: 0.22,
  tattoos: 0.16,
  bodyDetails: 0.18,
  nails: 0.28,
  hairDetails: 0.08,
  specificBody: 0.04,

  jewelry: 0.30,
  eyewear: 0.18,
  bodyPiercings: 0.10,
  headwear: 0.12,
  hairAccessories: 0.18
};

function optionalChance(category, fallback) {
  const value = OPTIONAL_TRAIT_DEFAULTS[category];
  return value !== undefined ? value : fallback;
}

function chooseOptionalPreset(category, presets, state, probability) {
  if (!presets || presets.length === 0) {
    return null;
  }

  if (!randomChance(probability)) {
    return null;
  }

  return chooseRandomPreset(category, presets, state);
}

function storeOptionalPreset(category, presets, state, probability) {
  const selected = chooseOptionalPreset(
    category,
    presets,
    state,
    probability
  );

  if (!selected) {
    state[category] = null;
    return null;
  }

  state[category] = selected;
  return selected;
}


// ------------------------------------------------------------
// REQUIRED RELATIONSHIPS
//
// "required" means that if the condition matches, the option
// becomes eligible/necessary. It is NOT merely a weight boost.
//
// Example:
//   pregnancy requires woman
//
// The selection engine can therefore distinguish:
//
//   blocked       = never select
//   required      = select when required condition is active
//   preferred     = increase probability
//   neutral       = no effect
//   discouraged   = decrease probability
// ------------------------------------------------------------

function getMatchingRelationshipTypes(category, preset, state) {
  const rule = getCompatibilityRule(category, preset);

  if (!rule) {
    return [];
  }

  const matches = [];

  if (
    rule.blockedWhen &&
    anyCompatibilityConditionMatches(rule.blockedWhen, state)
  ) {
    matches.push("blocked");
  }

  if (
    rule.requiredWhen &&
    anyCompatibilityConditionMatches(rule.requiredWhen, state)
  ) {
    matches.push("required");
  }

  if (
    rule.preferredWhen &&
    anyCompatibilityConditionMatches(rule.preferredWhen, state)
  ) {
    matches.push("preferred");
  }

  if (
    rule.neutralWhen &&
    anyCompatibilityConditionMatches(rule.neutralWhen, state)
  ) {
    matches.push("neutral");
  }

  if (
    rule.discouragedWhen &&
    anyCompatibilityConditionMatches(rule.discouragedWhen, state)
  ) {
    matches.push("discouraged");
  }

  return matches;
}

function isOptionRequired(category, preset, state) {
  return getMatchingRelationshipTypes(
    category,
    preset,
    state
  ).indexOf("required") !== -1;
}


// ------------------------------------------------------------
// IMPROVED COMPATIBILITY WEIGHT
// ------------------------------------------------------------

function getStateRandomizationMultiplier(category, preset, state, config) {
  const relationships = getMatchingRelationshipTypes(
    category,
    preset,
    state
  );

  if (relationships.indexOf("blocked") !== -1) {
    return 0;
  }

  let multiplier = 1;

  const preferredMultiplier =
    config && config.preferredMultiplier !== undefined
      ? config.preferredMultiplier
      : 4;

  const discouragedMultiplier =
    config && config.discouragedMultiplier !== undefined
      ? config.discouragedMultiplier
      : 0.2;

  if (relationships.indexOf("preferred") !== -1) {
    multiplier *= preferredMultiplier;
  }

  if (relationships.indexOf("discouraged") !== -1) {
    multiplier *= discouragedMultiplier;
  }

  return multiplier;
}


// ------------------------------------------------------------
// COMPATIBLE CANDIDATE FILTERING
// ------------------------------------------------------------

function getRequiredCandidates(category, presets, state) {
  const required = presets.filter(function (preset) {
    return isOptionRequired(category, preset, state);
  });

  return required;
}

function getAllowedCandidates(category, presets, state) {
  return presets.filter(function (preset) {
    return isOptionAllowed(category, preset, state);
  });
}

function getSelectionCandidates(category, presets, state) {
  if (!presets || presets.length === 0) {
    return [];
  }

  const allowed = getAllowedCandidates(
    category,
    presets,
    state
  );

  if (allowed.length === 0) {
    return [];
  }

  const required = getRequiredCandidates(
    category,
    allowed,
    state
  );

  // Required options do not automatically mean "always select
  // this option." They mean that when the state requires one,
  // incompatible alternatives are removed from consideration.
  //
  // This keeps "required" useful for relationships such as:
  // pregnancy -> woman
  // while avoiding accidental selection of every required trait.

  if (required.length > 0) {
    return required;
  }

  return allowed;
}


// ------------------------------------------------------------
// CONFIG-AWARE COMPATIBILITY PICK
// ------------------------------------------------------------

function weightedChooseCompatiblePresetWithConfig(
  category,
  presets,
  state,
  config
) {
  const candidates = getSelectionCandidates(
    category,
    presets,
    state
  );

  if (candidates.length === 0) {
    return null;
  }

  if (
    config &&
    config.mode === "free"
  ) {
    return randomElement(candidates);
  }

  const weightedCandidates = candidates.map(function (preset) {
    let weight = 1;

    weight *= getStateRandomizationMultiplier(
      category,
      preset,
      state,
      config
    );

    if (
      config &&
      config.profileWeights &&
      state.nationalityProfile
    ) {
      weight *= getProfileTraitWeight(
        category,
        preset,
        state
      );
    }

    return {
      preset: preset,
      weight: Math.max(weight, 0)
    };
  });

  const usable = weightedCandidates.filter(function (item) {
    return item.weight > 0;
  });

  if (usable.length === 0) {
    return randomElement(candidates);
  }

  return weightedRandomObject(usable);
}


// ------------------------------------------------------------
// REPLACE THE GENERIC COMPATIBLE PICKER WITH THE IMPROVED ONE
// ------------------------------------------------------------

function chooseRandomPreset(category, presets, state) {
  const config =
    state && state.randomizationConfig
      ? state.randomizationConfig
      : createRandomizationConfig();

  return weightedChooseCompatiblePresetWithConfig(
    category,
    presets,
    state,
    config
  );
}


// ------------------------------------------------------------
// OPTIONAL SELECTION WITH COMPATIBILITY
// ------------------------------------------------------------

function chooseOptionalCompatiblePreset(
  category,
  presets,
  state,
  probability
) {
  if (!randomChance(probability)) {
    return null;
  }

  return chooseRandomPreset(
    category,
    presets,
    state
  );
}


// ------------------------------------------------------------
// GENDER-AWARE OPTIONAL TRAITS
// ------------------------------------------------------------

function randomizeOptionalAppearance(state) {
  const config = state.randomizationConfig;

  state.makeup = chooseOptionalCompatiblePreset(
    "makeup",
    makeupPresets,
    state,
    optionalChance("makeup", 0.5)
  );

  state.makeupOddities = chooseOptionalCompatiblePreset(
    "makeupOddities",
    makeupOdditiesPresets,
    state,
    optionalChance("makeupOddities", 0.04)
  );

  state.facialHair = chooseOptionalCompatiblePreset(
    "facialHair",
    facialHairPresets,
    state,
    optionalChance("facialHair", 0.22)
  );

  state.tattoos = chooseOptionalCompatiblePreset(
    "tattoos",
    tattooPresets,
    state,
    optionalChance("tattoos", 0.16)
  );

  state.bodyDetails = chooseOptionalCompatiblePreset(
    "bodyDetails",
    bodyDetailPresets,
    state,
    optionalChance("bodyDetails", 0.18)
  );

  state.nails = chooseOptionalCompatiblePreset(
    "nails",
    nailPresets,
    state,
    optionalChance("nails", 0.28)
  );

  state.hairDetails = chooseOptionalCompatiblePreset(
    "hairDetails",
    hairDetailPresets,
    state,
    optionalChance("hairDetails", 0.08)
  );

  state.specificBody = chooseOptionalCompatiblePreset(
    "specificBody",
    specificBodyPresets,
    state,
    optionalChance("specificBody", 0.04)
  );

  return state;
}


// ------------------------------------------------------------
// SPECIAL BODY RELATIONSHIPS
// ------------------------------------------------------------

// Pregnancy is a state-changing trait rather than just another
// independent appearance choice.
//
// If pregnancy is selected, later body selections can react to
// it through the same compatibility system.

function stateHasSpecificBody(state, value) {
  if (!state || !state.specificBody) {
    return false;
  }

  return (
    getPresetValue(state.specificBody) === value
  );
}

function applySpecificBodyStateEffects(state) {
  if (!state) {
    return;
  }

  if (
    stateHasSpecificBody(
      state,
      "pregnant"
    ) ||
    stateHasSpecificBody(
      state,
      "heavily pregnant"
    )
  ) {
    state.custom = state.custom || {};
    state.custom.pregnant = true;
  } else {
    if (state.custom) {
      state.custom.pregnant = false;
    }
  }
}


// ------------------------------------------------------------
// PROFILE WEIGHT SAFETY
//
// A profile should influence a trait, not completely eliminate
// every trait that wasn't explicitly described by the profile.
//
// This gives us:
//   explicit profile weight -> strong influence
//   unspecified trait       -> low/background influence
//
// Compatibility is still allowed to override that background
// probability.
// ------------------------------------------------------------

function getSafeProfileTraitWeight(
  category,
  preset,
  state
) {
  const raw = getProfileTraitWeight(
    category,
    preset,
    state
  );

  if (
    raw === undefined ||
    raw === null ||
    !Number.isFinite(raw)
  ) {
    return 0.05;
  }

  return Math.max(raw, 0);
}


// ------------------------------------------------------------
// STATE-AWARE PROFILE PICK
// ------------------------------------------------------------

function chooseProfileAwarePreset(
  category,
  presets,
  state
) {
  const candidates = getSelectionCandidates(
    category,
    presets,
    state
  );

  if (candidates.length === 0) {
    return null;
  }

  const config =
    state.randomizationConfig ||
    createRandomizationConfig();

  const weightedCandidates = candidates.map(function (preset) {
    let weight =
      getStateRandomizationMultiplier(
        category,
        preset,
        state,
        config
      );

    if (
      config.profileWeights &&
      state.nationalityProfile
    ) {
      weight *= getSafeProfileTraitWeight(
        category,
        preset,
        state
      );
    }

    return {
      preset: preset,
      weight: weight
    };
  });

  const usable = weightedCandidates.filter(function (item) {
    return item.weight > 0;
  });

  if (usable.length === 0) {
    return randomElement(candidates);
  }

  return weightedRandomObject(usable);
}


// ------------------------------------------------------------
// STATE-AWARE BODY GENERATION
// ------------------------------------------------------------

function randomizeBody(state) {
  state.skin = chooseProfileAwarePreset(
    "skin",
    skinTonePresets,
    state
  );

  state.eyes = chooseProfileAwarePreset(
    "eyes",
    eyeColorPresets,
    state
  );

  state.overallBuild = chooseProfileAwarePreset(
    "overallBuild",
    overallBuildPresets,
    state
  );

  state.height = chooseProfileAwarePreset(
    "height",
    heightPresets,
    state
  );

  state.chest = chooseProfileAwarePreset(
    "chest",
    chestPresets,
    state
  );

  state.hips = chooseProfileAwarePreset(
    "hips",
    hipPresets,
    state
  );

  state.lips = chooseProfileAwarePreset(
    "lips",
    lipsPresets,
    state
  );

  state.eyelashes = chooseProfileAwarePreset(
    "eyelashes",
    eyelashPresets,
    state
  );

  state.bodyShape = chooseProfileAwarePreset(
    "bodyShape",
    bodyShapePresets,
    state
  );

  state.legs = chooseProfileAwarePreset(
    "legs",
    legPresets,
    state
  );

  state.buttocks = chooseProfileAwarePreset(
    "buttocks",
    buttockPresets,
    state
  );

  state.belly = chooseProfileAwarePreset(
    "belly",
    bellyPresets,
    state
  );

  // Specific body is deliberately optional.
  state.specificBody = chooseOptionalCompatiblePreset(
    "specificBody",
    specificBodyPresets,
    state,
    optionalChance("specificBody", 0.04)
  );

  applySpecificBodyStateEffects(state);

  return state;
}


// ------------------------------------------------------------
// HAIR GENERATION
//
// Hair color/type are profile-aware.
// Length/style remain compatibility-aware.
// ------------------------------------------------------------

function randomizeHair(state) {
  state.hairColor = chooseProfileAwarePreset(
    "hairColor",
    hairColorPresets,
    state
  );

  state.hairLength = chooseProfileAwarePreset(
    "hairLength",
    hairLengthPresets,
    state
  );

  state.hairType = chooseProfileAwarePreset(
    "hairType",
    hairTypePresets,
    state
  );

  state.hairstyles = chooseRandomSwitchValues(
    "hairstyles",
    hairstylePresets,
    state,
    1
  );

  return state;
}


// ------------------------------------------------------------
// APPEARANCE GENERATION
// ------------------------------------------------------------

function randomizeAppearance(state) {
  randomizeOptionalAppearance(state);

  state.nose = chooseProfileAwarePreset(
    "nose",
    nosePresets,
    state
  );

  return state;
}


// ------------------------------------------------------------
// CLEAN ACCESSORY GENERATION
//
// Hair accessories are handled here only. They are not selected
// twice by both randomizeHair() and randomizeAccessories().
// ------------------------------------------------------------

function randomizeAccessories(state) {
  state.accessories = [];

  const groups = accessoryGroups || [];

  groups.forEach(function (group) {
    const category = group.id;

    if (!randomChance(getAccessoryGroupChance(category))) {
      return;
    }

    const presets = group.presets || [];

    if (presets.length === 0) {
      return;
    }

    const selected = chooseRandomPreset(
      category,
      presets,
      state
    );

    if (selected) {
      state.accessories.push(selected);
    }
  });

  return state;
}


// ------------------------------------------------------------
// CLOTHING GROUP COMPOSITION
//
// Clothing groups are not independent "yes/no" traits.
//
// We choose a primary group first, then determine whether
// additional groups make sense.
//
// This prevents combinations such as:
//   evening gown + jeans + bikini + school uniform
//
// The relationship engine still controls compatibility inside
// each group.
// ------------------------------------------------------------

const CLOTHING_GROUP_ROLES = {
  Tops: "upper",
  Bottoms: "lower",
  Dresses: "one_piece",
  Lingerie: "base",
  Swimwear: "swim",
  "Robes/Loungewear": "lounge",
  Sets: "outfit",
  Uniforms: "outfit",
  "Costume Oddities": "accessory",
  "Period Fashion": "outfit",
  Footwear: "footwear"
};

const CLOTHING_PRIMARY_GROUPS = [
  "Tops",
  "Dresses",
  "Swimwear",
  "Sets",
  "Uniforms",
  "Period Fashion",
  "Robes/Loungewear"
];

function getClothingRole(group) {
  return CLOTHING_GROUP_ROLES[group] || "other";
}

function getClothingGroupByLabel(label) {
  return clothingGroups.find(function (group) {
    return group.label === label;
  }) || null;
}

function clothingGroupCanCombine(
  selectedGroups,
  candidateGroup
) {
  const candidateRole =
    getClothingRole(candidateGroup.label);

  if (candidateRole === "one_piece") {
    return false;
  }

  if (candidateRole === "swim") {
    return false;
  }

  if (candidateRole === "outfit") {
    return false;
  }

  for (let i = 0; i < selectedGroups.length; i++) {
    const existingRole =
      getClothingRole(
        selectedGroups[i].label
      );

    if (
      existingRole === "one_piece" ||
      existingRole === "swim" ||
      existingRole === "outfit"
    ) {
      return false;
    }

    if (
      existingRole === candidateRole &&
      (
        candidateRole === "upper" ||
        candidateRole === "lower"
      )
    ) {
      return false;
    }
  }

  return true;
}


// ------------------------------------------------------------
// STATE SNAPSHOT AFTER EACH MAJOR DECISION
// ------------------------------------------------------------

function recordGenerationDecision(
  state,
  category,
  value
) {
  if (!state.custom) {
    state.custom = {};
  }

  if (!state.custom.decisions) {
    state.custom.decisions = [];
  }

  state.custom.decisions.push({
    category: category,
    id: value
      ? getPresetId(value)
      : null,
    value: value
      ? getPresetValue(value)
      : null
  });
}


// ------------------------------------------------------------
// FINAL RANDOM STATE BUILDER
// ------------------------------------------------------------

function generateRandomSubjectState(config) {
  const state =
    createGenerationState();

  state.randomizationConfig =
    config ||
    createRandomizationConfig();

  // 1. Identity establishes the context.
  randomizeIdentity(state);

  // 2. Body uses identity/profile/gender.
  randomizeBody(state);

  // 3. Hair uses identity/profile/gender.
  randomizeHair(state);

  // 4. Optional appearance uses everything already selected.
  randomizeAppearance(state);

  // 5. Accessories see the completed appearance.
  randomizeAccessories(state);

  // 6. Clothing sees gender, body, appearance, and accessories.
  randomizeClothing(state);

  // 7. Action sees clothing and subject.
  randomizeAction(state);

  // 8. Camera sees action.
  randomizeCamera(state);

  // 9. Lighting sees camera/action/time relationships.
  randomizeLighting(state);

  // 10. Time of day.
  randomizeTimeOfDay(state);

  // 11. Style sees the completed scene.
  randomizeArtStyle(state);

  return state;
}

// ============================================================
// V14 — CLOTHING COMPOSITION + ACTION COMPATIBILITY
// ============================================================

// ------------------------------------------------------------
// CLOTHING COMPOSITION RULES
//
// The important distinction here is:
//
//   clothing group selection
//          ↓
//   clothing item selection
//          ↓
//   outfit composition
//
// A dress is not merely another clothing item. It occupies the
// "one-piece" role, so it changes what other groups can coexist.
// ------------------------------------------------------------

const CLOTHING_ROLE_RULES = {
  upper: {
    max: 1,
    conflicts: ["upper", "one_piece", "outfit", "swim"]
  },

  lower: {
    max: 1,
    conflicts: ["lower", "one_piece", "outfit", "swim"]
  },

  one_piece: {
    max: 1,
    conflicts: [
      "upper",
      "lower",
      "one_piece",
      "outfit",
      "swim"
    ]
  },

  base: {
    max: 1,
    conflicts: ["one_piece", "outfit", "swim"]
  },

  swim: {
    max: 1,
    conflicts: [
      "upper",
      "lower",
      "one_piece",
      "outfit",
      "base",
      "lounge"
    ]
  },

  lounge: {
    max: 1,
    conflicts: ["one_piece", "outfit", "swim"]
  },

  outfit: {
    max: 1,
    conflicts: [
      "upper",
      "lower",
      "one_piece",
      "outfit",
      "swim"
    ]
  },

  accessory: {
    max: 2,
    conflicts: []
  },

  footwear: {
    max: 1,
    conflicts: ["footwear"]
  }
};


// ------------------------------------------------------------
// GROUP ROLE
// ------------------------------------------------------------

function getClothingGroupRole(group) {
  if (!group) {
    return "other";
  }

  const label =
    group.label ||
    group.id ||
    "";

  return CLOTHING_GROUP_ROLES[label] || "other";
}


// ------------------------------------------------------------
// CHECK WHETHER A GROUP CAN BE ADDED
// ------------------------------------------------------------

function canAddClothingGroup(
  selectedGroups,
  candidateGroup
) {
  if (!candidateGroup) {
    return false;
  }

  const candidateRole =
    getClothingGroupRole(candidateGroup);

  const roleRule =
    CLOTHING_ROLE_RULES[candidateRole];

  if (!roleRule) {
    return true;
  }

  let sameRoleCount = 0;

  for (let i = 0; i < selectedGroups.length; i++) {
    const existingRole =
      getClothingGroupRole(
        selectedGroups[i]
      );

    if (existingRole === candidateRole) {
      sameRoleCount++;
    }

    if (
      roleRule.conflicts.indexOf(
        existingRole
      ) !== -1
    ) {
      return false;
    }
  }

  if (
    sameRoleCount >= roleRule.max
  ) {
    return false;
  }

  return true;
}


// ------------------------------------------------------------
// FIND GROUP BY ID
// ------------------------------------------------------------

function findClothingGroup(id) {
  return clothingGroups.find(function (group) {
    return group.id === id;
  }) || null;
}


// ------------------------------------------------------------
// GET ELIGIBLE CLOTHING GROUPS
// ------------------------------------------------------------

function getEligibleClothingGroups(state) {
  return clothingGroups.filter(function (group) {
    if (
      !isOptionAllowed(
        "clothingGroups",
        group,
        state
      )
    ) {
      return false;
    }

    return true;
  });
}


// ------------------------------------------------------------
// PRIMARY OUTFIT GROUPS
// ------------------------------------------------------------

function getPrimaryClothingGroups(state) {
  return getEligibleClothingGroups(state)
    .filter(function (group) {
      return (
        CLOTHING_PRIMARY_GROUPS.indexOf(
          group.label
        ) !== -1
      );
    });
}


// ------------------------------------------------------------
// SECONDARY CLOTHING GROUPS
// ------------------------------------------------------------

function getSecondaryClothingGroups(
  state,
  selectedGroups
) {
  return getEligibleClothingGroups(state)
    .filter(function (group) {
      if (
        CLOTHING_PRIMARY_GROUPS.indexOf(
          group.label
        ) !== -1
      ) {
        return false;
      }

      return canAddClothingGroup(
        selectedGroups,
        group
      );
    });
}


// ------------------------------------------------------------
// CLOTHING GROUP WEIGHT
//
// These are composition preferences, not hard exclusions.
//
// The compatibility engine still has the final say.
// ------------------------------------------------------------

const CLOTHING_PRIMARY_WEIGHTS = {
  Tops: 5,
  Dresses: 2.5,
  Swimwear: 1.2,
  Sets: 1.4,
  Uniforms: 0.7,
  "Period Fashion": 0.5,
  "Robes/Loungewear": 1
};

function getPrimaryClothingWeight(group) {
  if (!group) {
    return 1;
  }

  const weight =
    CLOTHING_PRIMARY_WEIGHTS[
    group.label
    ];

  return weight !== undefined
    ? weight
    : 1;
}


// ------------------------------------------------------------
// WEIGHTED PRIMARY GROUP SELECTION
// ------------------------------------------------------------

function choosePrimaryClothingGroup(
  state
) {
  const candidates =
    getPrimaryClothingGroups(state);

  if (candidates.length === 0) {
    return null;
  }

  const weighted = candidates.map(
    function (group) {
      return {
        preset: group,
        weight:
          getPrimaryClothingWeight(group) *
          getStateRandomizationMultiplier(
            "clothingGroups",
            group,
            state,
            state.randomizationConfig
          )
      };
    }
  );

  const usable =
    weighted.filter(function (item) {
      return item.weight > 0;
    });

  if (usable.length === 0) {
    return randomElement(candidates);
  }

  return weightedRandomObject(usable);
}


// ------------------------------------------------------------
// CHOOSE CLOTHING ITEM
// ------------------------------------------------------------

function chooseClothingItem(
  group,
  state
) {
  if (
    !group ||
    !group.presets ||
    group.presets.length === 0
  ) {
    return null;
  }

  return chooseRandomPreset(
    "clothing",
    group.presets,
    state
  );
}


// ------------------------------------------------------------
// STORE GROUP + ITEM
// ------------------------------------------------------------

function storeClothingGroupSelection(
  state,
  group,
  item
) {
  if (!state.clothingGroups) {
    state.clothingGroups = [];
  }

  if (!state.clothing) {
    state.clothing = [];
  }

  if (group) {
    state.clothingGroups.push(group);
  }

  if (item) {
    state.clothing.push(item);
  }

  recordGenerationDecision(
    state,
    "clothing",
    item
  );
}


// ------------------------------------------------------------
// SECONDARY GROUP CHANCE
// ------------------------------------------------------------

function getSecondaryClothingChance(
  group,
  state
) {
  if (!group) {
    return 0;
  }

  const label = group.label;

  const chances = {
    Tops: 0.80,
    Bottoms: 0.80,
    Lingerie: 0.10,
    "Costume Oddities": 0.08,
    Footwear: 0.70
  };

  if (
    chances[label] !== undefined
  ) {
    return chances[label];
  }

  return 0.15;
}


// ------------------------------------------------------------
// COMPLETE CLOTHING RANDOMIZER
// ------------------------------------------------------------

function randomizeClothing(state) {
  state.clothing = [];
  state.clothingGroups = [];

  // ----------------------------------------------------------
  // PRIMARY GROUP
  // ----------------------------------------------------------

  const primary =
    choosePrimaryClothingGroup(state);

  if (!primary) {
    return state;
  }

  const primaryItem =
    chooseClothingItem(
      primary,
      state
    );

  if (primaryItem) {
    storeClothingGroupSelection(
      state,
      primary,
      primaryItem
    );
  }

  // ----------------------------------------------------------
  // SECONDARY GROUPS
  // ----------------------------------------------------------

  const secondaryCandidates =
    getSecondaryClothingGroups(
      state,
      state.clothingGroups
    );

  for (
    let i = 0;
    i < secondaryCandidates.length;
    i++
  ) {
    const group =
      secondaryCandidates[i];

    if (
      !canAddClothingGroup(
        state.clothingGroups,
        group
      )
    ) {
      continue;
    }

    const chance =
      getSecondaryClothingChance(
        group,
        state
      );

    if (!randomChance(chance)) {
      continue;
    }

    const item =
      chooseClothingItem(
        group,
        state
      );

    if (!item) {
      continue;
    }

    storeClothingGroupSelection(
      state,
      group,
      item
    );
  }

  return state;
}


// ------------------------------------------------------------
// CLOTHING LOOKUP HELPERS
// ------------------------------------------------------------

function stateHasClothingGroup(
  state,
  groupLabel
) {
  if (
    !state ||
    !Array.isArray(
      state.clothingGroups
    )
  ) {
    return false;
  }

  return state.clothingGroups.some(
    function (group) {
      return (
        group.label === groupLabel
      );
    }
  );
}

function stateHasClothing(
  state,
  clothingId
) {
  if (
    !state ||
    !Array.isArray(
      state.clothing
    )
  ) {
    return false;
  }

  return state.clothing.some(
    function (item) {
      return (
        getPresetId(item) === clothingId
      );
    }
  );
}


// ------------------------------------------------------------
// ACTION COMPATIBILITY
// ------------------------------------------------------------

function actionIsCompatible(
  action,
  state
) {
  if (!action) {
    return false;
  }

  return isOptionAllowed(
    "action",
    action,
    state
  );
}


// ------------------------------------------------------------
// GET COMPATIBLE ACTIONS
// ------------------------------------------------------------

function getCompatibleActionPresets(
  state
) {
  return allActionPresets.filter(
    function (action) {
      return actionIsCompatible(
        action,
        state
      );
    }
  );
}


// ------------------------------------------------------------
// ACTION GROUP COMPATIBILITY
// ------------------------------------------------------------

function getCompatibleActionGroups(
  state
) {
  return actionGroups.filter(
    function (group) {
      return isOptionAllowed(
        "actionGroups",
        group,
        state
      );
    }
  );
}


// ------------------------------------------------------------
// ACTION WEIGHT BY SCENE
// ------------------------------------------------------------

const ACTION_SCENE_WEIGHTS = {
  walking: {
    "Outdoor": 3,
    "Basic": 2
  },

  running: {
    "Outdoor": 5,
    "Basic": 2
  },

  hiking: {
    "Outdoor": 6
  },

  cycling: {
    "Outdoor": 5
  },

  yoga: {
    "Basic": 3,
    "Home / Interior": 2
  },

  cooking: {
    "Home / Interior": 5
  },

  "making coffee": {
    "Home / Interior": 5
  },

  reading: {
    "Portrait": 2,
    "Home / Interior": 5
  },

  "mirror selfie": {
    "Mirror / Reflection": 8
  },

  "standing in front of mirror": {
    "Mirror / Reflection": 8
  }
};


// ------------------------------------------------------------
// ACTION SCENE WEIGHT
// ------------------------------------------------------------

function getActionSceneWeight(
  action,
  state
) {
  const value =
    getPresetValue(action);

  const rules =
    ACTION_SCENE_WEIGHTS[value];

  if (!rules) {
    return 1;
  }

  let weight = 1;

  Object.keys(rules).forEach(
    function (groupLabel) {
      const groupWeight =
        rules[groupLabel];

      if (
        state.actionGroups &&
        state.actionGroups.some(
          function (group) {
            return (
              group.label ===
              groupLabel
            );
          }
        )
      ) {
        weight *= groupWeight;
      }
    }
  );

  return weight;
}


// ------------------------------------------------------------
// CHOOSE ACTION
// ------------------------------------------------------------

function chooseCompatibleAction(
  state
) {
  const candidates =
    getCompatibleActionPresets(state);

  if (candidates.length === 0) {
    return null;
  }

  const weighted =
    candidates.map(
      function (action) {
        return {
          preset: action,
          weight:
            getStateRandomizationMultiplier(
              "action",
              action,
              state,
              state.randomizationConfig
            ) *
            getActionSceneWeight(
              action,
              state
            )
        };
      }
    );

  const usable =
    weighted.filter(
      function (item) {
        return item.weight > 0;
      }
    );

  if (usable.length === 0) {
    return randomElement(candidates);
  }

  return weightedRandomObject(
    usable
  );
}


// ------------------------------------------------------------
// ACTION RANDOMIZATION
// ------------------------------------------------------------

function randomizeAction(state) {
  const action =
    chooseCompatibleAction(state);

  state.action = action;

  if (action) {
    recordGenerationDecision(
      state,
      "action",
      action
    );
  }

  return state;
}


// ------------------------------------------------------------
// CAMERA COMPATIBILITY
// ------------------------------------------------------------

function chooseCompatibleCamera(
  state
) {
  const candidates =
    cameraPresets.filter(
      function (camera) {
        return isOptionAllowed(
          "camera",
          camera,
          state
        );
      }
    );

  if (candidates.length === 0) {
    return null;
  }

  return chooseRandomPreset(
    "camera",
    candidates,
    state
  );
}


// ------------------------------------------------------------
// LIGHTING COMPATIBILITY
// ------------------------------------------------------------

function chooseCompatibleLighting(
  state
) {
  const candidates =
    lightingPresets.filter(
      function (lighting) {
        return isOptionAllowed(
          "lighting",
          lighting,
          state
        );
      }
    );

  if (candidates.length === 0) {
    return null;
  }

  return chooseRandomPreset(
    "lighting",
    candidates,
    state
  );
}


// ------------------------------------------------------------
// TIME OF DAY
// ------------------------------------------------------------

function chooseCompatibleTimeOfDay(
  state
) {
  const candidates =
    timeOfDayPresets.filter(
      function (time) {
        return isOptionAllowed(
          "timeOfDay",
          time,
          state
        );
      }
    );

  if (candidates.length === 0) {
    return null;
  }

  return chooseRandomPreset(
    "timeOfDay",
    candidates,
    state
  );
}


// ------------------------------------------------------------
// ART STYLE
// ------------------------------------------------------------

function chooseCompatibleArtStyle(
  state
) {
  const candidates =
    artStylePresets.filter(
      function (style) {
        return isOptionAllowed(
          "artStyle",
          style,
          state
        );
      }
    );

  if (candidates.length === 0) {
    return null;
  }

  return chooseRandomPreset(
    "artStyle",
    candidates,
    state
  );
}


// ------------------------------------------------------------
// SCENE GENERATION
// ------------------------------------------------------------

function randomizeCamera(state) {
  state.camera =
    chooseCompatibleCamera(state);

  recordGenerationDecision(
    state,
    "camera",
    state.camera
  );

  return state;
}

function randomizeLighting(state) {
  state.lighting =
    chooseCompatibleLighting(state);

  recordGenerationDecision(
    state,
    "lighting",
    state.lighting
  );

  return state;
}

function randomizeTimeOfDay(state) {
  state.timeOfDay =
    chooseCompatibleTimeOfDay(state);

  recordGenerationDecision(
    state,
    "timeOfDay",
    state.timeOfDay
  );

  return state;
}

function randomizeArtStyle(state) {
  state.artStyle =
    chooseCompatibleArtStyle(state);

  recordGenerationDecision(
    state,
    "artStyle",
    state.artStyle
  );

  return state;
}


// ------------------------------------------------------------
// FINAL SCENE VALIDATION
//
// This runs after all random choices have been made.
//
// It does NOT randomly regenerate everything. It only checks
// for impossible combinations and repairs them where possible.
// ------------------------------------------------------------

function validateGenerationState(state) {
  const problems = [];

  // ----------------------------------------------------------
  // CLOTHING
  // ----------------------------------------------------------

  if (
    Array.isArray(state.clothingGroups)
  ) {
    for (
      let i = 0;
      i < state.clothingGroups.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < state.clothingGroups.length;
        j++
      ) {
        if (
          !canAddClothingGroup(
            state.clothingGroups.slice(
              0,
              i + 1
            ),
            state.clothingGroups[j]
          )
        ) {
          problems.push({
            category: "clothingGroups",
            first:
              state.clothingGroups[i],
            second:
              state.clothingGroups[j]
          });
        }
      }
    }
  }

  // ----------------------------------------------------------
  // GENERAL COMPATIBILITY
  // ----------------------------------------------------------

  const stateCategories = [
    "gender",
    "nationality",
    "age",
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "lips",
    "eyelashes",
    "bodyShape",
    "legs",
    "buttocks",
    "belly",
    "specificBody",
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails",
    "nose",
    "hairColor",
    "hairLength",
    "hairType",
    "action",
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  stateCategories.forEach(
    function (category) {
      const value = state[category];

      if (!value) {
        return;
      }

      if (
        !isOptionAllowed(
          category,
          value,
          state
        )
      ) {
        problems.push({
          category: category,
          value: value
        });
      }
    }
  );

  return problems;
}


// ------------------------------------------------------------
// REPAIR INVALID STATE
// ------------------------------------------------------------

function repairGenerationState(state) {
  const problems =
    validateGenerationState(state);

  if (problems.length === 0) {
    return state;
  }

  // Clothing is rebuilt as a complete composition rather than
  // attempting to patch individual clothing items.
  const hasClothingProblem =
    problems.some(
      function (problem) {
        return (
          problem.category ===
          "clothingGroups"
        );
      }
    );

  if (hasClothingProblem) {
    randomizeClothing(state);
  }

  // Repair individual traits using the same compatibility
  // system that generated them.
  problems.forEach(
    function (problem) {
      if (
        problem.category ===
        "clothingGroups"
      ) {
        return;
      }

      const category =
        problem.category;

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        !presets ||
        presets.length === 0
      ) {
        return;
      }

      const replacement =
        chooseRandomPreset(
          category,
          presets,
          state
        );

      if (replacement) {
        state[category] =
          replacement;
      }
    }
  );

  return state;
}
//
// ============================================================
// V14 — CATEGORY REGISTRY + SELECTION MANAGEMENT
// ============================================================
// This section gives the generator one central place to find
// the preset collection belonging to each state category.
//
// The important part is that adding an option to an array does
// NOT require changing an index, slice(), or parallel array.
//

const PRESET_COLLECTIONS = {
  gender: genderPresets,
  nationality: nationalityPresets,
  age: agePresets,
  skin: skinTonePresets,
  eyes: eyeColorPresets,

  overallBuild: overallBuildPresets,
  height: heightPresets,
  chest: chestPresets,
  hips: hipPresets,
  lips: lipsPresets,
  eyelashes: eyelashPresets,
  bodyShape: bodyShapePresets,
  legs: legPresets,
  buttocks: buttockPresets,
  belly: bellyPresets,
  specificBody: specificBodyPresets,

  makeup: makeupPresets,
  makeupOddities: makeupOdditiesPresets,
  facialHair: facialHairPresets,
  tattoos: tattooPresets,
  bodyDetails: bodyDetailPresets,
  nails: nailPresets,
  hairDetails: hairDetailPresets,
  nose: nosePresets,

  hairColor: hairColorPresets,
  hairLength: hairLengthPresets,
  hairType: hairTypePresets,
  hairstyles: hairstylePresets,

  clothing: clothingPresets,
  clothingGroups: clothingGroups,

  action: allActionPresets,
  actionGroups: actionGroups,

  camera: cameraPresets,
  lighting: lightingPresets,
  timeOfDay: timeOfDayPresets,
  artStyle: artStylePresets
};


// ------------------------------------------------------------
// CATEGORY DISPLAY NAMES
// ------------------------------------------------------------

const CATEGORY_LABELS = {
  gender: "Gender",
  nationality: "Nationality",
  age: "Age",
  skin: "Skin Tone",
  eyes: "Eye Color",

  overallBuild: "Overall Build",
  height: "Height",
  chest: "Chest",
  hips: "Hips",
  lips: "Lips",
  eyelashes: "Eyelashes",
  bodyShape: "Body Shape",
  legs: "Legs",
  buttocks: "Buttocks",
  belly: "Belly",
  specificBody: "Specific Body",

  makeup: "Makeup",
  makeupOddities: "Makeup Oddity",
  facialHair: "Facial Hair",
  tattoos: "Tattoos",
  bodyDetails: "Body Details",
  nails: "Nails",
  hairDetails: "Hair Details",
  nose: "Nose",

  hairColor: "Hair Color",
  hairLength: "Hair Length",
  hairType: "Hair Type",
  hairstyles: "Hairstyle",

  clothing: "Clothing",
  clothingGroups: "Clothing Group",

  action: "Action",
  actionGroups: "Action Group",

  camera: "Camera",
  lighting: "Lighting",
  timeOfDay: "Time of Day",
  artStyle: "Art Style"
};


// ------------------------------------------------------------
// CATEGORY LOOKUP
// ------------------------------------------------------------

function getPresetCollectionForCategory(
  category
) {
  return PRESET_COLLECTIONS[category] || [];
}

function getCategoryLabel(category) {
  return (
    CATEGORY_LABELS[category] ||
    category
  );
}


// ------------------------------------------------------------
// FIND PRESET BY ID
// ------------------------------------------------------------

function findPresetById(
  category,
  id
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  return presets.find(
    function (preset) {
      return (
        getPresetId(preset) === id
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// FIND PRESET BY VALUE
// ------------------------------------------------------------

function findPresetByValue(
  category,
  value
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  return presets.find(
    function (preset) {
      return (
        getPresetValue(preset) === value
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// FIND PRESET BY LABEL
// ------------------------------------------------------------

function findPresetByLabel(
  category,
  label
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  return presets.find(
    function (preset) {
      return (
        getPresetLabel(preset) === label
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// GENERIC PRESET FINDER
// ------------------------------------------------------------

function findPreset(
  category,
  identifier
) {
  if (
    identifier === undefined ||
    identifier === null
  ) {
    return null;
  }

  const byId =
    findPresetById(
      category,
      identifier
    );

  if (byId) {
    return byId;
  }

  const byValue =
    findPresetByValue(
      category,
      identifier
    );

  if (byValue) {
    return byValue;
  }

  return findPresetByLabel(
    category,
    identifier
  );
}


// ------------------------------------------------------------
// STATE VALUE NORMALIZATION
// ------------------------------------------------------------
// State entries may be:
//
//   preset object
//   string
//   null
//   array of presets
//
// This helper makes the rest of the generator independent of
// how a particular UI control stores its value.
//

function getNormalizedStateValue(
  state,
  category
) {
  if (!state) {
    return null;
  }

  const value =
    state[category];

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(
      function (item) {
        return getPresetValue(item);
      }
    );
  }

  return getPresetValue(value);
}


// ------------------------------------------------------------
// STATE CONTAINS VALUE
// ------------------------------------------------------------

function stateContainsValue(
  state,
  category,
  expectedValue
) {
  const value =
    getNormalizedStateValue(
      state,
      category
    );

  if (Array.isArray(value)) {
    return value.indexOf(
      expectedValue
    ) !== -1;
  }

  return value === expectedValue;
}


// ------------------------------------------------------------
// STATE CONTAINS ID
// ------------------------------------------------------------

function stateContainsId(
  state,
  category,
  expectedId
) {
  if (!state) {
    return false;
  }

  const value =
    state[category];

  if (
    value === undefined ||
    value === null
  ) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(
      function (item) {
        return (
          getPresetId(item) ===
          expectedId
        );
      }
    );
  }

  return (
    getPresetId(value) ===
    expectedId
  );
}


// ------------------------------------------------------------
// STATE CATEGORY EXISTS
// ------------------------------------------------------------

function stateHasCategory(
  state,
  category
) {
  if (!state) {
    return false;
  }

  return (
    state[category] !== undefined &&
    state[category] !== null
  );
}


// ------------------------------------------------------------
// MANUAL OVERRIDES
// ------------------------------------------------------------
// Manual selections are deliberately different from random
// selections.
//
// If the user explicitly selects something, the generator does
// not silently replace it simply because another option has a
// stronger random preference.
//
// Compatibility is used to warn/filter dependent choices.
//

function createManualSelectionState() {
  return {
    gender: null,
    nationality: null,
    age: null,
    skin: null,
    eyes: null,

    overallBuild: null,
    height: null,
    chest: null,
    hips: null,
    lips: null,
    eyelashes: null,
    bodyShape: null,
    legs: null,
    buttocks: null,
    belly: null,
    specificBody: null,

    makeup: null,
    makeupOddities: null,
    facialHair: null,
    tattoos: null,
    bodyDetails: null,
    nails: null,
    hairDetails: null,
    nose: null,

    hairColor: null,
    hairLength: null,
    hairType: null,
    hairstyles: [],
    accessories: [],

    clothing: [],
    clothingGroups: [],

    action: null,
    actionGroups: [],

    camera: null,
    lighting: null,
    timeOfDay: null,
    artStyle: null
  };
}


// ------------------------------------------------------------
// APPLY MANUAL PRESET
// ------------------------------------------------------------

function applyManualPreset(
  state,
  category,
  preset
) {
  if (!state) {
    return;
  }

  if (
    preset === undefined ||
    preset === null
  ) {
    state[category] = null;
    return;
  }

  state[category] = preset;

  if (
    state.manualSelections
  ) {
    state.manualSelections[
      category
    ] = preset;
  }

  recordGenerationDecision(
    state,
    category,
    preset
  );
}


// ------------------------------------------------------------
// APPLY MANUAL ID
// ------------------------------------------------------------

function applyManualPresetId(
  state,
  category,
  id
) {
  const preset =
    findPresetById(
      category,
      id
    );

  if (!preset) {
    return null;
  }

  applyManualPreset(
    state,
    category,
    preset
  );

  return preset;
}


// ------------------------------------------------------------
// CLEAR MANUAL PRESET
// ------------------------------------------------------------

function clearManualPreset(
  state,
  category
) {
  if (!state) {
    return;
  }

  state[category] = null;

  if (
    state.manualSelections
  ) {
    state.manualSelections[
      category
    ] = null;
  }
}


// ------------------------------------------------------------
// CHECK WHETHER CATEGORY IS MANUAL
// ------------------------------------------------------------

function isCategoryManual(
  state,
  category
) {
  if (
    !state ||
    !state.manualSelections
  ) {
    return false;
  }

  return (
    state.manualSelections[
    category
    ] !== null &&
    state.manualSelections[
    category
    ] !== undefined
  );
}


// ------------------------------------------------------------
// RANDOMIZE ONLY IF NOT MANUAL
// ------------------------------------------------------------

function randomizeIfNotManual(
  state,
  category,
  generatorFunction
) {
  if (
    isCategoryManual(
      state,
      category
    )
  ) {
    return state[category];
  }

  return generatorFunction(
    state
  );
}


// ------------------------------------------------------------
// MANUAL SELECTION COMPATIBILITY
// ------------------------------------------------------------

function getManualSelectionProblems(
  state
) {
  const problems = [];

  if (
    !state ||
    !state.manualSelections
  ) {
    return problems;
  }

  Object.keys(
    state.manualSelections
  ).forEach(
    function (category) {
      const value =
        state.manualSelections[
        category
        ];

      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      if (
        !isOptionAllowed(
          category,
          value,
          state
        )
      ) {
        problems.push({
          category: category,
          value: value,
          label:
            getPresetLabel(value)
        });
      }
    }
  );

  return problems;
}


// ------------------------------------------------------------
// COMPATIBLE OPTIONS FOR A MANUAL CHOICE
// ------------------------------------------------------------
// This is what allows the UI to eventually show:
//
//   ✓ compatible
//   ⚠ discouraged
//   ✕ blocked
//
// without changing the actual preset data.
//

function getOptionRelationship(
  category,
  preset,
  state
) {
  const rule =
    getCompatibilityRule(
      category,
      preset
    );

  if (!rule) {
    return "neutral";
  }

  if (
    rule.blockedWhen &&
    anyCompatibilityConditionMatches(
      rule.blockedWhen,
      state
    )
  ) {
    return "blocked";
  }

  if (
    rule.requiredWhen &&
    anyCompatibilityConditionMatches(
      rule.requiredWhen,
      state
    )
  ) {
    return "required";
  }

  if (
    rule.preferredWhen &&
    anyCompatibilityConditionMatches(
      rule.preferredWhen,
      state
    )
  ) {
    return "preferred";
  }

  if (
    rule.discouragedWhen &&
    anyCompatibilityConditionMatches(
      rule.discouragedWhen,
      state
    )
  ) {
    return "discouraged";
  }

  if (
    rule.neutralWhen &&
    anyCompatibilityConditionMatches(
      rule.neutralWhen,
      state
    )
  ) {
    return "neutral";
  }

  return "neutral";
}


// ------------------------------------------------------------
// RELATIONSHIP SUMMARY
// ------------------------------------------------------------

function describeOptionRelationship(
  category,
  preset,
  state
) {
  return {
    id: getPresetId(preset),
    label: getPresetLabel(preset),
    relationship:
      getOptionRelationship(
        category,
        preset,
        state
      ),
    allowed:
      isOptionAllowed(
        category,
        preset,
        state
      ),
    weight:
      getCompatibilityWeight(
        category,
        preset,
        state
      )
  };
}


// ------------------------------------------------------------
// RANDOMIZATION MODE
// ------------------------------------------------------------

const RANDOMIZATION_MODE_LABELS = {
  compatible:
    "Compatible Random",
  free:
    "Free Random"
};

function getRandomizationModeLabel(
  mode
) {
  return (
    RANDOMIZATION_MODE_LABELS[
    mode
    ] ||
    RANDOMIZATION_MODE_LABELS.compatible
  );
}


// ------------------------------------------------------------
// CREATE STATE FOR GENERATION
// ------------------------------------------------------------

function createConfiguredGenerationState(
  config
) {
  const state =
    createGenerationState();

  state.randomizationConfig =
    config ||
    createRandomizationConfig();

  state.manualSelections =
    createManualSelectionState();

  state.custom =
    state.custom ||
    {};

  state.custom.decisions = [];

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE STATE WHILE PRESERVING MANUAL CHOICES
// ------------------------------------------------------------

function generateStateRespectingManualSelections(
  config,
  manualSelections
) {
  const state =
    createConfiguredGenerationState(
      config
    );

  if (manualSelections) {
    Object.keys(
      manualSelections
    ).forEach(
      function (category) {
        const selection =
          manualSelections[
          category
          ];

        if (
          selection !== null &&
          selection !== undefined
        ) {
          state.manualSelections[
            category
          ] = selection;

          state[category] =
            selection;
        }
      }
    );
  }

  // Identity first.
  if (
    !isCategoryManual(
      state,
      "gender"
    )
  ) {
    randomizeIdentity(state);
  }

  // Nationality may establish the profile.
  if (
    isCategoryManual(
      state,
      "nationality"
    )
  ) {
    state.nationalityProfile =
      state.nationality &&
        state.nationality.profile
        ? state.nationality.profile
        : null;
  }

  // Generate everything else in dependency order.
  if (
    !isCategoryManual(
      state,
      "bodyShape"
    )
  ) {
    randomizeBody(state);
  }

  if (
    !isCategoryManual(
      state,
      "hairColor"
    )
  ) {
    randomizeHair(state);
  }

  if (
    !isCategoryManual(
      state,
      "makeup"
    )
  ) {
    randomizeAppearance(state);
  }

  if (
    !isCategoryManual(
      state,
      "accessories"
    )
  ) {
    randomizeAccessories(state);
  }

  if (
    !isCategoryManual(
      state,
      "clothing"
    )
  ) {
    randomizeClothing(state);
  }

  if (
    !isCategoryManual(
      state,
      "action"
    )
  ) {
    randomizeAction(state);
  }

  if (
    !isCategoryManual(
      state,
      "camera"
    )
  ) {
    randomizeCamera(state);
  }

  if (
    !isCategoryManual(
      state,
      "lighting"
    )
  ) {
    randomizeLighting(state);
  }

  if (
    !isCategoryManual(
      state,
      "timeOfDay"
    )
  ) {
    randomizeTimeOfDay(state);
  }

  if (
    !isCategoryManual(
      state,
      "artStyle"
    )
  ) {
    randomizeArtStyle(state);
  }

  repairGenerationState(state);

  return state;
}


// ------------------------------------------------------------
// GENERATION SUMMARY
// ------------------------------------------------------------

function summarizeGenerationState(
  state
) {
  return {
    gender:
      getNormalizedStateValue(
        state,
        "gender"
      ),

    nationality:
      getNormalizedStateValue(
        state,
        "nationality"
      ),

    age:
      getNormalizedStateValue(
        state,
        "age"
      ),

    skin:
      getNormalizedStateValue(
        state,
        "skin"
      ),

    eyes:
      getNormalizedStateValue(
        state,
        "eyes"
      ),

    overallBuild:
      getNormalizedStateValue(
        state,
        "overallBuild"
      ),

    bodyShape:
      getNormalizedStateValue(
        state,
        "bodyShape"
      ),

    hairColor:
      getNormalizedStateValue(
        state,
        "hairColor"
      ),

    hairType:
      getNormalizedStateValue(
        state,
        "hairType"
      ),

    clothing:
      Array.isArray(
        state.clothing
      )
        ? state.clothing.map(
          function (item) {
            return getPresetValue(item);
          }
        )
        : [],

    action:
      getNormalizedStateValue(
        state,
        "action"
      ),

    camera:
      getNormalizedStateValue(
        state,
        "camera"
      ),

    lighting:
      getNormalizedStateValue(
        state,
        "lighting"
      ),

    timeOfDay:
      getNormalizedStateValue(
        state,
        "timeOfDay"
      ),

    artStyle:
      getNormalizedStateValue(
        state,
        "artStyle"
      )
  };
}
// ============================================================
// V14 — SUBJECT + PROMPT ASSEMBLY
// ============================================================


// ------------------------------------------------------------
// PROMPT TEXT HELPERS
// ------------------------------------------------------------

function promptValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return getPresetValue(value) || "";
}


function promptLabel(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return getPresetLabel(value) || "";
}


function cleanPromptParts(parts) {
  return parts
    .filter(function (part) {
      return (
        part !== undefined &&
        part !== null &&
        String(part).trim() !== ""
      );
    })
    .map(function (part) {
      return String(part).trim();
    });
}


function joinPromptParts(parts) {
  return cleanPromptParts(parts).join(", ");
}


// ------------------------------------------------------------
// ARRAY → PROMPT TEXT
// ------------------------------------------------------------

function promptArray(values) {
  if (
    !Array.isArray(values)
  ) {
    return "";
  }

  return values
    .map(function (value) {
      return promptValue(value);
    })
    .filter(function (value) {
      return value !== "";
    })
    .join(", ");
}


// ------------------------------------------------------------
// SUBJECT IDENTITY
// ------------------------------------------------------------

function buildSubjectIdentity(state) {
  const parts = [];

  const age =
    promptValue(state.age);

  const gender =
    promptValue(state.gender);

  const nationality =
    promptValue(state.nationality);

  if (age) {
    parts.push(age);
  }

  if (nationality) {
    parts.push(nationality);
  }

  if (gender) {
    parts.push(gender);
  }

  if (parts.length === 0) {
    return DEFAULT_PROMPT_FALLBACKS.subject;
  }

  return joinPromptParts(parts);
}


// ------------------------------------------------------------
// BODY DESCRIPTION
// ------------------------------------------------------------

function buildBodyDescription(state) {
  const parts = [];

  const bodyCategories = [
    "overallBuild",
    "height",
    "chest",
    "hips",
    "lips",
    "eyelashes",
    "bodyShape",
    "legs",
    "buttocks",
    "belly",
    "specificBody"
  ];

  bodyCategories.forEach(
    function (category) {
      const value =
        state[category];

      if (!value) {
        return;
      }

      const text =
        promptValue(value);

      if (text) {
        parts.push(text);
      }
    }
  );

  return joinPromptParts(parts);
}


// ------------------------------------------------------------
// SKIN + EYES
// ------------------------------------------------------------

function buildSkinAndEyeDescription(
  state
) {
  return joinPromptParts([
    promptValue(state.skin),
    promptValue(state.eyes)
  ]);
}


// ------------------------------------------------------------
// FACIAL FEATURES
// ------------------------------------------------------------

function buildFacialDescription(
  state
) {
  return joinPromptParts([
    promptValue(state.lips),
    promptValue(state.eyelashes),
    promptValue(state.nose)
  ]);
}


// ------------------------------------------------------------
// HAIR DESCRIPTION
// ------------------------------------------------------------

function buildHairDescription(state) {
  const parts = [
    promptValue(state.hairColor),
    promptValue(state.hairLength),
    promptValue(state.hairType)
  ];

  const hairstyles =
    promptArray(
      state.hairstyles
    );

  if (hairstyles) {
    parts.push(
      hairstyles
    );
  }

  const hairDetails =
    promptValue(
      state.hairDetails
    );

  if (hairDetails) {
    parts.push(
      hairDetails
    );
  }

  return joinPromptParts(parts);
}


// ------------------------------------------------------------
// MAKEUP + APPEARANCE
// ------------------------------------------------------------

function buildAppearanceDescription(
  state
) {
  const parts = [];

  [
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails"
  ].forEach(
    function (category) {
      const value =
        promptValue(
          state[category]
        );

      if (value) {
        parts.push(value);
      }
    }
  );

  return joinPromptParts(parts);
}


// ------------------------------------------------------------
// ACCESSORIES
// ------------------------------------------------------------

function buildAccessoryDescription(
  state
) {
  return promptArray(
    state.accessories
  );
}


// ------------------------------------------------------------
// CLOTHING
// ------------------------------------------------------------

function buildClothingDescription(
  state
) {
  if (
    !state ||
    !Array.isArray(
      state.clothing
    )
  ) {
    return "";
  }

  const parts =
    state.clothing
      .map(function (item) {
        return promptValue(item);
      })
      .filter(function (value) {
        return value !== "";
      });

  return joinPromptParts(parts);
}


// ------------------------------------------------------------
// ACTION
// ------------------------------------------------------------

function buildActionDescription(
  state
) {
  return promptValue(
    state.action
  );
}


// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function buildCameraDescription(
  state
) {
  return promptValue(
    state.camera
  );
}


// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

function buildLightingDescription(
  state
) {
  return promptValue(
    state.lighting
  );
}


// ------------------------------------------------------------
// TIME OF DAY
// ------------------------------------------------------------

function buildTimeOfDayDescription(
  state
) {
  return promptValue(
    state.timeOfDay
  );
}


// ------------------------------------------------------------
// ART STYLE
// ------------------------------------------------------------

function buildArtStyleDescription(
  state
) {
  return promptValue(
    state.artStyle
  );
}


// ------------------------------------------------------------
// SUBJECT DESCRIPTION
// ------------------------------------------------------------

function buildSubjectDescription(
  state
) {
  const sections = [];

  const identity =
    buildSubjectIdentity(state);

  if (identity) {
    sections.push(identity);
  }

  const skinEyes =
    buildSkinAndEyeDescription(
      state
    );

  if (skinEyes) {
    sections.push(skinEyes);
  }

  const body =
    buildBodyDescription(state);

  if (body) {
    sections.push(body);
  }

  const face =
    buildFacialDescription(state);

  if (face) {
    sections.push(face);
  }

  const hair =
    buildHairDescription(state);

  if (hair) {
    sections.push(hair);
  }

  const appearance =
    buildAppearanceDescription(
      state
    );

  if (appearance) {
    sections.push(appearance);
  }

  const accessories =
    buildAccessoryDescription(
      state
    );

  if (accessories) {
    sections.push(accessories);
  }

  return joinPromptParts(
    sections
  );
}


// ------------------------------------------------------------
// FULL PROMPT
// ------------------------------------------------------------

function buildPromptFromState(state) {
  if (!state) {
    return (
      DEFAULT_PROMPT_FALLBACKS
        .genericPrompt
    );
  }

  const subject =
    buildSubjectDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.subject;

  const clothing =
    buildClothingDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.outfit;

  const action =
    buildActionDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.action;

  const camera =
    buildCameraDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.camera;

  const timeOfDay =
    buildTimeOfDayDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.timeOfDay;

  const lighting =
    buildLightingDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.lighting;

  const artStyle =
    buildArtStyleDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.artStyle;

  return joinPromptParts([
    "A photo of",
    subject,
    "wearing",
    clothing,
    action,
    camera,
    timeOfDay,
    lighting,
    artStyle
  ]);
}


// ------------------------------------------------------------
// SUBJECT LEAD
// ------------------------------------------------------------

function buildSubjectLead(
  state
) {
  return buildSubjectIdentity(
    state
  );
}


// ------------------------------------------------------------
// SUBJECT DETAILS
// ------------------------------------------------------------

function buildSubjectDetails(
  state
) {
  return joinPromptParts([
    buildSkinAndEyeDescription(
      state
    ),

    buildBodyDescription(
      state
    ),

    buildFacialDescription(
      state
    ),

    buildHairDescription(
      state
    ),

    buildAppearanceDescription(
      state
    ),

    buildAccessoryDescription(
      state
    )
  ]);
}


// ------------------------------------------------------------
// OUTFIT STATE
// ------------------------------------------------------------

function buildOutfitDescription(
  state
) {
  return (
    buildClothingDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.outfit
  );
}


// ------------------------------------------------------------
// ACTION STATE
// ------------------------------------------------------------

function buildActionPrompt(
  state
) {
  return (
    buildActionDescription(
      state
    ) ||
    DEFAULT_PROMPT_FALLBACKS.action
  );
}


// ------------------------------------------------------------
// CAMERA / SCENE PROMPT
// ------------------------------------------------------------

function buildSceneDescription(
  state
) {
  return joinPromptParts([
    buildActionDescription(
      state
    ),

    buildCameraDescription(
      state
    ),

    buildTimeOfDayDescription(
      state
    ),

    buildLightingDescription(
      state
    ),

    buildArtStyleDescription(
      state
    )
  ]);
}


// ------------------------------------------------------------
// RANDOM PROMPT GENERATION
// ------------------------------------------------------------

function generateRandomPrompt(
  config
) {
  const state =
    generateRandomSubjectState(
      config
    );

  repairGenerationState(
    state
  );

  const prompt =
    buildPromptFromState(
      state
    );

  state.prompt =
    prompt;

  state.subjectLead =
    buildSubjectLead(
      state
    );

  state.subjectDetails =
    buildSubjectDetails(
      state
    );

  state.outfit =
    buildOutfitDescription(
      state
    );

  state.actionPrompt =
    buildActionPrompt(
      state
    );

  state.scene =
    buildSceneDescription(
      state
    );

  return state;
}


// ------------------------------------------------------------
// MULTIPLE RANDOM PROMPTS
// ------------------------------------------------------------

function generateRandomPrompts(
  count,
  config
) {
  const results = [];

  const amount =
    Math.max(
      1,
      Number(count) || 1
    );

  for (
    let i = 0;
    i < amount;
    i++
  ) {
    results.push(
      generateRandomPrompt(
        config
      )
    );
  }

  return results;
}


// ------------------------------------------------------------
// PROMPT DEDUPLICATION
// ------------------------------------------------------------

function deduplicatePromptResults(
  results
) {
  const seen =
    new Set();

  return results.filter(
    function (result) {
      if (
        !result ||
        !result.prompt
      ) {
        return false;
      }

      const key =
        result.prompt
          .trim()
          .toLowerCase();

      if (
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}


// ------------------------------------------------------------
// GENERATE UNIQUE PROMPTS
// ------------------------------------------------------------

function generateUniquePrompts(
  count,
  config,
  maxAttempts
) {
  const target =
    Math.max(
      1,
      Number(count) || 1
    );

  const attempts =
    Math.max(
      target,
      Number(maxAttempts) ||
      target * 5
    );

  const results = [];

  let tries = 0;

  while (
    results.length < target &&
    tries < attempts
  ) {
    tries++;

    const result =
      generateRandomPrompt(
        config
      );

    const duplicate =
      results.some(
        function (existing) {
          return (
            existing.prompt
              .trim()
              .toLowerCase() ===
            result.prompt
              .trim()
              .toLowerCase()
          );
        }
      );

    if (!duplicate) {
      results.push(result);
    }
  }

  return results;
}


// ------------------------------------------------------------
// PROMPT PREVIEW
// ------------------------------------------------------------

function buildPromptPreview(
  state
) {
  if (!state) {
    return "";
  }

  return (
    state.prompt ||
    buildPromptFromState(
      state
    )
  );
}


// ------------------------------------------------------------
// DEBUG DESCRIPTION
// ------------------------------------------------------------

function describeGenerationState(
  state
) {
  if (!state) {
    return {};
  }

  return {
    mode:
      state.randomizationConfig
        ? state.randomizationConfig.mode
        : "compatible",

    profile:
      state.nationalityProfile || null,

    subject:
      buildSubjectDescription(
        state
      ),

    clothing:
      buildClothingDescription(
        state
      ),

    action:
      buildActionDescription(
        state
      ),

    camera:
      buildCameraDescription(
        state
      ),

    lighting:
      buildLightingDescription(
        state
      ),

    timeOfDay:
      buildTimeOfDayDescription(
        state
      ),

    artStyle:
      buildArtStyleDescription(
        state
      ),

    prompt:
      buildPromptFromState(
        state
      ),

    problems:
      validateGenerationState(
        state
      )
  };
}
// ============================================================
// V14 — UI FOUNDATION
// Draw Things controls, model selection, aspect ratio,
// generation count, and randomization controls.
// ============================================================


// ------------------------------------------------------------
// UI STATE
// ------------------------------------------------------------

const UI_DEFAULTS = {
  model: "model.krea2",

  aspectRatio: "1:1",

  randomizationMode: "compatible",

  batchCount: 1,

  uniquePrompts: true,

  profileWeights: true,

  preferredMultiplier: 4,

  discouragedMultiplier: 0.2,

  refineWithQwen: false,

  useManualSelections: false
};


// ------------------------------------------------------------
// UI CONFIGURATION
// ------------------------------------------------------------

function createUIState() {
  return {
    model:
      UI_DEFAULTS.model,

    aspectRatio:
      UI_DEFAULTS.aspectRatio,

    randomizationMode:
      UI_DEFAULTS.randomizationMode,

    batchCount:
      UI_DEFAULTS.batchCount,

    uniquePrompts:
      UI_DEFAULTS.uniquePrompts,

    profileWeights:
      UI_DEFAULTS.profileWeights,

    preferredMultiplier:
      UI_DEFAULTS.preferredMultiplier,

    discouragedMultiplier:
      UI_DEFAULTS.discouragedMultiplier,

    refineWithQwen:
      UI_DEFAULTS.refineWithQwen,

    useManualSelections:
      UI_DEFAULTS.useManualSelections
  };
}


// ------------------------------------------------------------
// MODEL OPTIONS FOR UI
// ------------------------------------------------------------

function getModelMenuOptions() {
  return MODEL_OPTIONS.map(
    function (model) {
      return model.label;
    }
  );
}


function findModelById(id) {
  return (
    MODEL_OPTIONS.find(
      function (model) {
        return model.id === id;
      }
    ) || null
  );
}


function getSelectedModel(uiState) {
  return (
    findModelById(
      uiState.model
    ) ||
    MODEL_OPTIONS[0]
  );
}


// ------------------------------------------------------------
// ASPECT OPTIONS
// ------------------------------------------------------------

function getAspectMenuOptions() {
  return ASPECT_OPTIONS.map(
    function (option) {
      return option.label;
    }
  );
}


function findAspectById(id) {
  return (
    ASPECT_OPTIONS.find(
      function (option) {
        return option.id === id;
      }
    ) ||
    ASPECT_OPTIONS[0]
  );
}


function findAspectByLabel(label) {
  return (
    ASPECT_OPTIONS.find(
      function (option) {
        return option.label === label;
      }
    ) ||
    ASPECT_OPTIONS[0]
  );
}


function getSelectedAspect(uiState) {
  return findAspectById(
    uiState.aspectRatio
  );
}


// ------------------------------------------------------------
// ASPECT DIMENSIONS
// ------------------------------------------------------------

function getAspectDimensions(
  aspectId
) {
  const option =
    findAspectById(
      aspectId
    );

  if (!option) {
    return {
      width: 1024,
      height: 1024
    };
  }

  return {
    width: option.width,
    height: option.height
  };
}


// ------------------------------------------------------------
// RANDOMIZATION MENU
// ------------------------------------------------------------

function getRandomizationModeOptions() {
  return [
    {
      id: "compatible",
      label:
        "Compatible Random"
    },

    {
      id: "free",
      label:
        "Free Random"
    }
  ];
}


function findRandomizationMode(
  value
) {
  const options =
    getRandomizationModeOptions();

  return (
    options.find(
      function (option) {
        return (
          option.id === value ||
          option.label === value
        );
      }
    ) ||
    options[0]
  );
}


// ------------------------------------------------------------
// CREATE RANDOMIZATION CONFIG FROM UI
// ------------------------------------------------------------

function buildRandomizationConfig(
  uiState
) {
  return {
    mode:
      findRandomizationMode(
        uiState.randomizationMode
      ).id,

    profileWeights:
      uiState.profileWeights !== false,

    preferredMultiplier:
      Number(
        uiState.preferredMultiplier
      ) || 4,

    discouragedMultiplier:
      Number(
        uiState.discouragedMultiplier
      ) || 0.2,

    manualOverrides:
      true
  };
}


// ------------------------------------------------------------
// DRAW THINGS UI HELPERS
// ------------------------------------------------------------

function createMenu(
  title,
  options,
  defaultIndex
) {
  return {
    type: "menu",
    title: title,
    options: options,
    defaultIndex:
      defaultIndex !== undefined
        ? defaultIndex
        : 0
  };
}


function createSwitch(
  title,
  defaultValue
) {
  return {
    type: "switch",
    title: title,
    defaultValue:
      defaultValue === true
  };
}


function createSection(
  title,
  children
) {
  return {
    type: "section",
    title: title,
    children: children
  };
}


// ------------------------------------------------------------
// MODEL UI
// ------------------------------------------------------------

function createModelControls() {
  return [
    createMenu(
      "Model",
      getModelMenuOptions(),
      1
    )
  ];
}


// ------------------------------------------------------------
// ASPECT UI
// ------------------------------------------------------------

function createAspectControls() {
  return [
    createMenu(
      "Aspect Ratio",
      getAspectMenuOptions(),
      0
    )
  ];
}


// ------------------------------------------------------------
// RANDOMIZATION UI
// ------------------------------------------------------------

function createRandomizationControls() {
  return [
    createMenu(
      "Randomization",
      [
        "Compatible Random",
        "Free Random"
      ],
      0
    ),

    createMenu(
      "Batch Count",
      [
        "1",
        "2",
        "4",
        "8",
        "16"
      ],
      0
    ),

    createSwitch(
      "Unique Prompts",
      true
    ),

    createSwitch(
      "Use Profile Weights",
      true
    ),

    createSwitch(
      "Qwen Prompt Refinement",
      false
    )
  ];
}


// ------------------------------------------------------------
// MANUAL / RANDOM CONTROL
// ------------------------------------------------------------

function createGenerationModeControls() {
  return [
    createSwitch(
      "Use Manual Selections",
      false
    )
  ];
}


// ------------------------------------------------------------
// COMPLETE UI DESCRIPTION
// ------------------------------------------------------------

function createUIControls() {
  return [
    createSection(
      "Generation",
      createModelControls()
        .concat(
          createAspectControls()
        )
    ),

    createSection(
      "Randomization",
      createRandomizationControls()
    ),

    createSection(
      "Selection Mode",
      createGenerationModeControls()
    )
  ];
}


// ------------------------------------------------------------
// UI VALUE NORMALIZATION
// ------------------------------------------------------------

function normalizeBatchCount(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      16,
      Math.floor(number)
    )
  );
}


function normalizeAspectValue(
  value
) {
  const option =
    findAspectByLabel(
      value
    );

  return option.id;
}


function normalizeModelValue(
  value
) {
  const model =
    MODEL_OPTIONS.find(
      function (option) {
        return (
          option.label === value ||
          option.id === value
        );
      }
    );

  return model
    ? model.id
    : MODEL_OPTIONS[0].id;
}


// ------------------------------------------------------------
// BUILD UI STATE FROM DRAW THINGS VALUES
// ------------------------------------------------------------

function readUIState(values) {
  const state =
    createUIState();

  if (!values) {
    return state;
  }

  if (
    values.model !== undefined
  ) {
    state.model =
      normalizeModelValue(
        values.model
      );
  }

  if (
    values.aspectRatio !== undefined
  ) {
    state.aspectRatio =
      normalizeAspectValue(
        values.aspectRatio
      );
  }

  if (
    values.randomizationMode !== undefined
  ) {
    state.randomizationMode =
      findRandomizationMode(
        values.randomizationMode
      ).id;
  }

  if (
    values.batchCount !== undefined
  ) {
    state.batchCount =
      normalizeBatchCount(
        values.batchCount
      );
  }

  if (
    values.uniquePrompts !== undefined
  ) {
    state.uniquePrompts =
      values.uniquePrompts === true;
  }

  if (
    values.profileWeights !== undefined
  ) {
    state.profileWeights =
      values.profileWeights === true;
  }

  if (
    values.refineWithQwen !== undefined
  ) {
    state.refineWithQwen =
      values.refineWithQwen === true;
  }

  if (
    values.useManualSelections !== undefined
  ) {
    state.useManualSelections =
      values.useManualSelections === true;
  }

  return state;
}


// ------------------------------------------------------------
// BUILD DRAW THINGS GENERATION SETTINGS
// ------------------------------------------------------------

function buildGenerationSettings(
  uiState
) {
  const model =
    getSelectedModel(
      uiState
    );

  const aspect =
    getSelectedAspect(
      uiState
    );

  return {
    model: model,

    width: aspect.width,

    height: aspect.height,

    aspectRatio:
      aspect.id,

    randomization:
      buildRandomizationConfig(
        uiState
      ),

    refineWithQwen:
      uiState.refineWithQwen === true
  };
}


// ------------------------------------------------------------
// MODEL / LORA DESCRIPTION
// ------------------------------------------------------------

function describeSelectedModel(
  uiState
) {
  const model =
    getSelectedModel(
      uiState
    );

  if (!model) {
    return null;
  }

  return {
    id: model.id,
    label: model.label,
    checkpoint:
      model.checkpoint,
    lora:
      model.lora,
    loraWeight:
      model.loraWeight
  };
}


// ------------------------------------------------------------
// ASPECT DESCRIPTION
// ------------------------------------------------------------

function describeSelectedAspect(
  uiState
) {
  const aspect =
    getSelectedAspect(
      uiState
    );

  return {
    id: aspect.id,
    label: aspect.label,
    width: aspect.width,
    height: aspect.height
  };
}


// ------------------------------------------------------------
// GENERATION PLAN
// ------------------------------------------------------------

function buildGenerationPlan(
  uiState
) {
  const settings =
    buildGenerationSettings(
      uiState
    );

  const config =
    settings.randomization;

  let results;

  if (
    uiState.uniquePrompts
  ) {
    results =
      generateUniquePrompts(
        uiState.batchCount,
        config,
        uiState.batchCount * 8
      );
  } else {
    results =
      generateRandomPrompts(
        uiState.batchCount,
        config
      );
  }

  return {
    settings: settings,

    model:
      describeSelectedModel(
        uiState
      ),

    aspect:
      describeSelectedAspect(
        uiState
      ),

    results: results
  };
}


// ------------------------------------------------------------
// PREVIEW GENERATION
// ------------------------------------------------------------

function generatePreviewState(
  uiState
) {
  const config =
    buildRandomizationConfig(
      uiState
    );

  const preview =
    generateUniquePrompts(
      PREVIEW_SAMPLE_SIZE,
      config,
      PREVIEW_SAMPLE_SIZE * 6
    );

  return preview;
}


// ------------------------------------------------------------
// PREVIEW TEXT
// ------------------------------------------------------------

function buildPreviewText(
  results
) {
  if (
    !results ||
    results.length === 0
  ) {
    return "";
  }

  return results
    .map(function (result, index) {
      return (
        String(index + 1) +
        ". " +
        result.prompt
      );
    })
    .join("\n\n");
}


// ------------------------------------------------------------
// DEBUG INFORMATION
// ------------------------------------------------------------

function buildGenerationDebugInfo(
  plan
) {
  if (!plan) {
    return "";
  }

  const lines = [];

  lines.push(
    "Model: " +
    plan.model.label
  );

  lines.push(
    "Aspect: " +
    plan.aspect.label +
    " (" +
    plan.aspect.width +
    "x" +
    plan.aspect.height +
    ")"
  );

  lines.push(
    "Randomization: " +
    getRandomizationModeLabel(
      plan.settings
        .randomization
        .mode
    )
  );

  lines.push(
    "Prompts: " +
    plan.results.length
  );

  return lines.join("\n");
}


// ============================================================
// V14 — MANUAL PRESET CONTROL SYSTEM
// ============================================================
// This section creates the metadata needed to expose the same
// generator categories through the Draw Things UI.
//
// There are deliberately no hard-coded array positions here.
// Every control identifies its category and resolves the
// selected preset by ID/value/label.
// ============================================================


// ------------------------------------------------------------
// MANUAL CONTROL DEFINITIONS
// ------------------------------------------------------------

const MANUAL_CONTROL_DEFINITIONS = [
  {
    category: "gender",
    title: "Gender",
    type: "menu"
  },

  {
    category: "nationality",
    title: "Nationality",
    type: "menu"
  },

  {
    category: "age",
    title: "Age",
    type: "menu"
  },

  {
    category: "skin",
    title: "Skin Tone",
    type: "menu"
  },

  {
    category: "eyes",
    title: "Eye Color",
    type: "menu"
  },

  {
    category: "overallBuild",
    title: "Overall Build",
    type: "menu"
  },

  {
    category: "height",
    title: "Height",
    type: "menu"
  },

  {
    category: "chest",
    title: "Chest",
    type: "menu"
  },

  {
    category: "hips",
    title: "Hips",
    type: "menu"
  },

  {
    category: "lips",
    title: "Lips",
    type: "menu"
  },

  {
    category: "eyelashes",
    title: "Eyelashes",
    type: "menu"
  },

  {
    category: "bodyShape",
    title: "Body Shape",
    type: "menu"
  },

  {
    category: "legs",
    title: "Legs",
    type: "menu"
  },

  {
    category: "buttocks",
    title: "Buttocks",
    type: "menu"
  },

  {
    category: "belly",
    title: "Belly",
    type: "menu"
  },

  {
    category: "specificBody",
    title: "Specific Body",
    type: "menu"
  }
];


// ------------------------------------------------------------
// APPEARANCE CONTROLS
// ------------------------------------------------------------

const APPEARANCE_CONTROL_DEFINITIONS = [
  {
    category: "makeup",
    title: "Makeup",
    type: "menu"
  },

  {
    category: "makeupOddities",
    title: "Makeup Oddities",
    type: "menu"
  },

  {
    category: "facialHair",
    title: "Facial Hair",
    type: "menu"
  },

  {
    category: "tattoos",
    title: "Tattoos",
    type: "menu"
  },

  {
    category: "bodyDetails",
    title: "Body Details",
    type: "menu"
  },

  {
    category: "nails",
    title: "Nails",
    type: "menu"
  },

  {
    category: "hairDetails",
    title: "Hair Details",
    type: "menu"
  },

  {
    category: "nose",
    title: "Nose",
    type: "menu"
  },

  {
    category: "hairColor",
    title: "Hair Color",
    type: "menu"
  },

  {
    category: "hairLength",
    title: "Hair Length",
    type: "menu"
  },

  {
    category: "hairType",
    title: "Hair Type",
    type: "menu"
  }
];


// ------------------------------------------------------------
// SCENE CONTROLS
// ------------------------------------------------------------

const SCENE_CONTROL_DEFINITIONS = [
  {
    category: "action",
    title: "Action",
    type: "menu"
  },

  {
    category: "camera",
    title: "Camera",
    type: "menu"
  },

  {
    category: "lighting",
    title: "Lighting",
    type: "menu"
  },

  {
    category: "timeOfDay",
    title: "Time of Day",
    type: "menu"
  },

  {
    category: "artStyle",
    title: "Art Style",
    type: "menu"
  }
];


// ------------------------------------------------------------
// CLOTHING CONTROL DEFINITIONS
// ------------------------------------------------------------

const CLOTHING_CONTROL_DEFINITIONS = [
  {
    category: "clothing",
    title: "Clothing",
    type: "menu"
  }
];


// ------------------------------------------------------------
// BUILD COMPLETE CONTROL REGISTRY
// ------------------------------------------------------------

function getAllManualControlDefinitions() {
  return []
    .concat(
      MANUAL_CONTROL_DEFINITIONS
    )
    .concat(
      APPEARANCE_CONTROL_DEFINITIONS
    )
    .concat(
      CLOTHING_CONTROL_DEFINITIONS
    )
    .concat(
      SCENE_CONTROL_DEFINITIONS
    );
}


// ------------------------------------------------------------
// GET OPTIONS FOR A CONTROL
// ------------------------------------------------------------

function getControlPresets(
  definition
) {
  if (!definition) {
    return [];
  }

  return getPresetCollectionForCategory(
    definition.category
  );
}


// ------------------------------------------------------------
// CONTROL LABELS
// ------------------------------------------------------------

function getControlLabels(
  definition
) {
  return getControlPresets(
    definition
  ).map(function (preset) {
    return getPresetLabel(
      preset
    );
  });
}


// ------------------------------------------------------------
// CONTROL VALUES
// ------------------------------------------------------------

function getControlValues(
  definition
) {
  return getControlPresets(
    definition
  ).map(function (preset) {
    return getPresetValue(
      preset
    );
  });
}


// ------------------------------------------------------------
// CONTROL IDS
// ------------------------------------------------------------

function getControlIds(
  definition
) {
  return getControlPresets(
    definition
  ).map(function (preset) {
    return getPresetId(
      preset
    );
  });
}


// ------------------------------------------------------------
// CREATE A MANUAL CONTROL
// ------------------------------------------------------------

function createManualControl(
  definition
) {
  const presets =
    getControlPresets(
      definition
    );

  const labels =
    presets.map(
      function (preset) {
        return getPresetLabel(
          preset
        );
      }
    );

  return {
    category:
      definition.category,

    title:
      definition.title,

    type:
      definition.type,

    options:
      labels,

    ids:
      presets.map(
        function (preset) {
          return getPresetId(
            preset
          );
        }
      )
  };
}


// ------------------------------------------------------------
// CREATE ALL MANUAL CONTROLS
// ------------------------------------------------------------

function createManualControls() {
  return getAllManualControlDefinitions()
    .map(function (definition) {
      return createManualControl(
        definition
      );
    });
}


// ------------------------------------------------------------
// FIND CONTROL DEFINITION
// ------------------------------------------------------------

function findManualControl(
  category
) {
  return getAllManualControlDefinitions()
    .find(
      function (definition) {
        return (
          definition.category ===
          category
        );
      }
    ) || null;
}


// ------------------------------------------------------------
// GET SELECTED PRESET FROM UI INDEX
// ------------------------------------------------------------
// Draw Things menus work with an index, but V14 never uses
// that index as an identity.
//
// The index only tells us which visible option the user picked.
// The actual preset is resolved immediately and stored by its
// stable ID/object.
//

function getPresetFromControlIndex(
  category,
  index
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  if (
    !presets ||
    presets.length === 0
  ) {
    return null;
  }

  const numericIndex =
    Number(index);

  if (
    !Number.isInteger(
      numericIndex
    ) ||
    numericIndex < 0 ||
    numericIndex >= presets.length
  ) {
    return null;
  }

  return presets[
    numericIndex
  ];
}


// ------------------------------------------------------------
// APPLY UI INDEX TO STATE
// ------------------------------------------------------------

function applyControlIndex(
  state,
  category,
  index
) {
  const preset =
    getPresetFromControlIndex(
      category,
      index
    );

  if (!preset) {
    clearManualPreset(
      state,
      category
    );

    return null;
  }

  applyManualPreset(
    state,
    category,
    preset
  );

  return preset;
}


// ------------------------------------------------------------
// APPLY UI VALUE TO STATE
// ------------------------------------------------------------

function applyControlValue(
  state,
  category,
  value
) {
  const preset =
    findPreset(
      category,
      value
    );

  if (!preset) {
    return null;
  }

  applyManualPreset(
    state,
    category,
    preset
  );

  return preset;
}


// ------------------------------------------------------------
// GET COMPATIBLE CONTROL OPTIONS
// ------------------------------------------------------------

function getCompatibleControlOptions(
  category,
  state
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  return presets.filter(
    function (preset) {
      return isOptionAllowed(
        category,
        preset,
        state
      );
    }
  );
}


// ------------------------------------------------------------
// GET CONTROL RELATIONSHIPS
// ------------------------------------------------------------

function getControlOptionDetails(
  category,
  state
) {
  const presets =
    getPresetCollectionForCategory(
      category
    );

  return presets.map(
    function (preset) {
      return describeOptionRelationship(
        category,
        preset,
        state
      );
    }
  );
}


// ------------------------------------------------------------
// MANUAL CONTROL SUMMARY
// ------------------------------------------------------------

function summarizeManualSelections(
  state
) {
  if (
    !state ||
    !state.manualSelections
  ) {
    return {};
  }

  const summary = {};

  Object.keys(
    state.manualSelections
  ).forEach(
    function (category) {
      const value =
        state.manualSelections[
        category
        ];

      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      if (
        Array.isArray(value)
      ) {
        summary[category] =
          value.map(
            function (item) {
              return {
                id:
                  getPresetId(item),

                label:
                  getPresetLabel(item),

                value:
                  getPresetValue(item)
              };
            }
          );

        return;
      }

      summary[category] = {
        id:
          getPresetId(value),

        label:
          getPresetLabel(value),

        value:
          getPresetValue(value)
      };
    }
  );

  return summary;
}


// ------------------------------------------------------------
// MANUAL SELECTION VALIDATION
// ------------------------------------------------------------

function validateManualSelections(
  state
) {
  const problems =
    getManualSelectionProblems(
      state
    );

  return {
    valid:
      problems.length === 0,

    problems:
      problems
  };
}


// ------------------------------------------------------------
// AUTOMATIC DEPENDENCY INFORMATION
// ------------------------------------------------------------
// This gives the UI enough information to eventually display
// which choices are affected when the user changes a preset.
//

function getAffectedCategories(
  category
) {
  const affected = [];

  Object.keys(
    PRESET_COLLECTIONS
  ).forEach(
    function (otherCategory) {
      if (
        otherCategory ===
        category
      ) {
        return;
      }

      const presets =
        PRESET_COLLECTIONS[
        otherCategory
        ];

      const affectedByCategory =
        presets.some(
          function (preset) {
            const rule =
              getCompatibilityRule(
                otherCategory,
                preset
              );

            if (!rule) {
              return false;
            }

            const allConditions = []
              .concat(
                rule.blockedWhen || []
              )
              .concat(
                rule.requiredWhen || []
              )
              .concat(
                rule.preferredWhen || []
              )
              .concat(
                rule.discouragedWhen || []
              )
              .concat(
                rule.neutralWhen || []
              );

            return allConditions.some(
              function (condition) {
                if (
                  !condition ||
                  typeof condition !==
                  "object"
                ) {
                  return false;
                }

                return (
                  condition.category ===
                  category
                );
              }
            );
          }
        );

      if (
        affectedByCategory
      ) {
        affected.push(
          otherCategory
        );
      }
    }
  );

  return affected;
}


// ------------------------------------------------------------
// CONTROL CHANGE HANDLER
// ------------------------------------------------------------

function handleManualControlChange(
  state,
  category,
  value
) {
  const preset =
    applyControlValue(
      state,
      category,
      value
    );

  if (!preset) {
    return {
      state: state,
      selected: null,
      affectedCategories: []
    };
  }

  // Nationality establishes the profile context.
  if (
    category ===
    "nationality"
  ) {
    state.nationalityProfile =
      preset.profile ||
      preset.metadata &&
      preset.metadata.profile ||
      null;
  }

  // Gender is stored separately because compatibility rules use
  // the state category directly.
  if (
    category === "gender"
  ) {
    state.genderForm =
      getPresetValue(
        preset
      );
  }

  return {
    state: state,

    selected: preset,

    affectedCategories:
      getAffectedCategories(
        category
      ),

    validation:
      validateManualSelections(
        state
      )
  };
}


// ------------------------------------------------------------
// RESET MANUAL SELECTIONS
// ------------------------------------------------------------

function resetManualSelections(
  state
) {
  state.manualSelections =
    createManualSelectionState();

  const categories =
    Object.keys(
      state.manualSelections
    );

  categories.forEach(
    function (category) {
      if (
        Array.isArray(
          state[category]
        )
      ) {
        state[category] = [];
      } else {
        state[category] = null;
      }
    }
  );

  return state;
}


// ------------------------------------------------------------
// COPY MANUAL SELECTIONS
// ------------------------------------------------------------

function cloneManualSelections(
  state
) {
  const result =
    createManualSelectionState();

  if (
    !state ||
    !state.manualSelections
  ) {
    return result;
  }

  Object.keys(
    state.manualSelections
  ).forEach(
    function (category) {
      const value =
        state.manualSelections[
        category
        ];

      if (
        Array.isArray(value)
      ) {
        result[category] =
          value.slice();

        return;
      }

      result[category] =
        value;
    }
  );

  return result;
}


// ------------------------------------------------------------
// BUILD MANUAL STATE FOR PREVIEW
// ------------------------------------------------------------

function buildManualPreviewState(
  state
) {
  const preview =
    cloneGenerationState(
      state
    );

  preview.manualSelections =
    cloneManualSelections(
      state
    );

  preview.prompt =
    buildPromptFromState(
      preview
    );

  return preview;
}


// ------------------------------------------------------------
// COMPLETE CONTROL REGISTRY
// ------------------------------------------------------------

const V14_CONTROL_REGISTRY = {
  identity:
    MANUAL_CONTROL_DEFINITIONS,

  appearance:
    APPEARANCE_CONTROL_DEFINITIONS,

  clothing:
    CLOTHING_CONTROL_DEFINITIONS,

  scene:
    SCENE_CONTROL_DEFINITIONS
};


// ============================================================
// V14 — MANUAL-SELECTION-SAFE RANDOMIZATION
// ============================================================


// ------------------------------------------------------------
// TEST WHETHER A CATEGORY WAS MANUALLY SELECTED
// ------------------------------------------------------------

function isCategoryManuallySelected(
  state,
  category
) {
  if (
    !state ||
    !state.manualSelections
  ) {
    return false;
  }

  const selection =
    state.manualSelections[
    category
    ];

  if (
    selection === null ||
    selection === undefined
  ) {
    return false;
  }

  if (
    Array.isArray(selection)
  ) {
    return selection.length > 0;
  }

  return true;
}


// ------------------------------------------------------------
// GET MANUAL PRESET
// ------------------------------------------------------------

function getManualPreset(
  state,
  category
) {
  if (
    !isCategoryManuallySelected(
      state,
      category
    )
  ) {
    return null;
  }

  const selection =
    state.manualSelections[
    category
    ];

  if (
    Array.isArray(selection)
  ) {
    return selection.length > 0
      ? selection[0]
      : null;
  }

  return selection;
}


// ------------------------------------------------------------
// GET MANUAL VALUES
// ------------------------------------------------------------

function getManualValues(
  state,
  category
) {
  if (
    !isCategoryManuallySelected(
      state,
      category
    )
  ) {
    return [];
  }

  const selection =
    state.manualSelections[
    category
    ];

  if (
    Array.isArray(selection)
  ) {
    return selection.map(
      function (item) {
        return getPresetValue(
          item
        );
      }
    );
  }

  return [
    getPresetValue(
      selection
    )
  ];
}


// ------------------------------------------------------------
// RESTORE MANUAL SELECTION
// ------------------------------------------------------------

function restoreManualSelection(
  state,
  category
) {
  const selection =
    state.manualSelections &&
    state.manualSelections[
    category
    ];

  if (
    selection === null ||
    selection === undefined
  ) {
    return false;
  }

  if (
    Array.isArray(selection)
  ) {
    state[category] =
      selection.slice();

    return true;
  }

  state[category] =
    selection;

  return true;
}


// ------------------------------------------------------------
// RESTORE ALL MANUAL SELECTIONS
// ------------------------------------------------------------

function restoreAllManualSelections(
  state
) {
  if (
    !state ||
    !state.manualSelections
  ) {
    return state;
  }

  Object.keys(
    state.manualSelections
  ).forEach(
    function (category) {
      restoreManualSelection(
        state,
        category
      );
    }
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE ONE CATEGORY ONLY IF IT IS NOT MANUAL
// ------------------------------------------------------------

function randomizeCategoryIfNeeded(
  state,
  category,
  randomizer
) {
  if (
    isCategoryManuallySelected(
      state,
      category
    )
  ) {
    restoreManualSelection(
      state,
      category
    );

    return state[
      category
    ];
  }

  if (
    typeof randomizer ===
    "function"
  ) {
    randomizer(
      state
    );
  }

  return state[
    category
  ];
}


// ------------------------------------------------------------
// RANDOMIZE IDENTITY SAFELY
// ------------------------------------------------------------

function randomizeIdentitySafe(
  state,
  cfg
) {
  if (
    !isCategoryManuallySelected(
      state,
      "gender"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "gender",
      genderPresets,
      cfg
    );
  } else {
    restoreManualSelection(
      state,
      "gender"
    );
  }

  if (
    !isCategoryManuallySelected(
      state,
      "nationality"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "nationality",
      nationalityPresets,
      cfg
    );
  } else {
    restoreManualSelection(
      state,
      "nationality"
    );
  }

  if (
    !isCategoryManuallySelected(
      state,
      "age"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "age",
      agePresets,
      cfg
    );
  } else {
    restoreManualSelection(
      state,
      "age"
    );
  }

  const gender =
    getStateValue(
      state,
      "gender"
    );

  const nationality =
    getManualPreset(
      state,
      "nationality"
    ) ||
    state.nationality;

  state.genderForm =
    gender || "";

  state.nationalityProfile =
    nationality &&
      (
        nationality.profile ||
        nationality.metadata &&
        nationality.metadata.profile
      )
      ? (
        nationality.profile ||
        nationality.metadata.profile
      )
      : (
        state.nationalityProfile ||
        null
      );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE BODY SAFELY
// ------------------------------------------------------------

function randomizeBodySafe(
  state,
  cfg
) {
  const categories = [
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "lips",
    "eyelashes",
    "bodyShape",
    "legs",
    "buttocks",
    "belly",
    "specificBody"
  ];

  categories.forEach(
    function (category) {
      if (
        isCategoryManuallySelected(
          state,
          category
        )
      ) {
        restoreManualSelection(
          state,
          category
        );

        return;
      }

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        presets &&
        presets.length > 0
      ) {
        chooseAndStoreRandomPreset(
          state,
          category,
          presets,
          cfg
        );
      }
    }
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE APPEARANCE SAFELY
// ------------------------------------------------------------

function randomizeAppearanceSafe(
  state,
  cfg
) {
  const categories = [
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails",
    "nose"
  ];

  categories.forEach(
    function (category) {
      if (
        isCategoryManuallySelected(
          state,
          category
        )
      ) {
        restoreManualSelection(
          state,
          category
        );

        return;
      }

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        !presets ||
        presets.length === 0
      ) {
        return;
      }

      chooseOptionalRandomPreset(
        state,
        category,
        presets,
        cfg
      );
    }
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE HAIR SAFELY
// ------------------------------------------------------------

function randomizeHairSafe(
  state,
  cfg
) {
  const categories = [
    "hairColor",
    "hairLength",
    "hairType",
    "hairstyles"
  ];

  categories.forEach(
    function (category) {
      if (
        isCategoryManuallySelected(
          state,
          category
        )
      ) {
        restoreManualSelection(
          state,
          category
        );

        return;
      }

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        !presets ||
        presets.length === 0
      ) {
        return;
      }

      if (
        category ===
        "hairstyles"
      ) {
        const selected =
          randomCompatiblePreset(
            category,
            presets,
            state
          );

        if (selected) {
          state.hairstyles =
            selected;
        }

        return;
      }

      chooseAndStoreRandomPreset(
        state,
        category,
        presets,
        cfg
      );
    }
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE ACCESSORIES SAFELY
// ------------------------------------------------------------

function randomizeAccessoriesSafe(
  state,
  cfg
) {
  if (
    isCategoryManuallySelected(
      state,
      "accessories"
    )
  ) {
    restoreManualSelection(
      state,
      "accessories"
    );

    return state;
  }

  state.accessories = [];

  if (
    typeof accessoryGroups ===
    "undefined"
  ) {
    return state;
  }

  accessoryGroups.forEach(
    function (group) {
      const groupId =
        getPresetId(
          group
        );

      const chanceValue =
        getAccessoryGroupChance(
          groupId
        );

      if (
        !randomChance(
          chanceValue
        )
      ) {
        return;
      }

      const presets =
        group.presets || [];

      if (
        presets.length === 0
      ) {
        return;
      }

      const selected =
        randomCompatiblePreset(
          "accessories",
          presets,
          state
        );

      if (!selected) {
        return;
      }

      state.accessories.push(
        selected
      );
    }
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE CLOTHING SAFELY
// ------------------------------------------------------------

function randomizeClothingSafe(
  state,
  cfg
) {
  if (
    isCategoryManuallySelected(
      state,
      "clothing"
    )
  ) {
    restoreManualSelection(
      state,
      "clothing"
    );

    if (
      !state.clothingGroups ||
      state.clothingGroups.length === 0
    ) {
      const manualClothing =
        state.clothing;

      if (
        manualClothing
      ) {
        const group =
          findClothingGroupForPreset(
            manualClothing
          );

        if (group) {
          state.clothingGroups = [
            group
          ];
        }
      }
    }

    return state;
  }

  randomizeClothing(
    state,
    cfg
  );

  return state;
}


// ------------------------------------------------------------
// FIND GROUP FOR A CLOTHING ITEM
// ------------------------------------------------------------

function findClothingGroupForPreset(
  preset
) {
  if (!preset) {
    return null;
  }

  const presetId =
    getPresetId(
      preset
    );

  const presetValue =
    getPresetValue(
      preset
    );

  if (
    typeof clothingGroups ===
    "undefined"
  ) {
    return null;
  }

  for (
    let i = 0;
    i < clothingGroups.length;
    i++
  ) {
    const group =
      clothingGroups[i];

    const presets =
      group.presets || [];

    const found =
      presets.find(
        function (item) {
          return (
            getPresetId(item) ===
            presetId ||
            getPresetValue(item) ===
            presetValue
          );
        }
      );

    if (found) {
      return group;
    }
  }

  return null;
}


// ------------------------------------------------------------
// RANDOMIZE ACTION SAFELY
// ------------------------------------------------------------

function randomizeActionSafe(
  state,
  cfg
) {
  if (
    isCategoryManuallySelected(
      state,
      "action"
    )
  ) {
    restoreManualSelection(
      state,
      "action"
    );

    return state;
  }

  randomizeAction(
    state,
    cfg
  );

  return state;
}


// ------------------------------------------------------------
// RANDOMIZE SCENE SAFELY
// ------------------------------------------------------------

function randomizeSceneSafe(
  state,
  cfg
) {
  const categories = [
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  categories.forEach(
    function (category) {
      if (
        isCategoryManuallySelected(
          state,
          category
        )
      ) {
        restoreManualSelection(
          state,
          category
        );

        return;
      }

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        presets &&
        presets.length > 0
      ) {
        chooseAndStoreRandomPreset(
          state,
          category,
          presets,
          cfg
        );
      }
    }
  );

  return state;
}


// ------------------------------------------------------------
// MANUAL-SELECTION-SAFE FULL GENERATOR
// ------------------------------------------------------------

function generateStateRespectingManualSelectionsSafe(
  cfg,
  existingState
) {
  const state =
    existingState
      ? cloneGenerationState(
        existingState
      )
      : createConfiguredGenerationState(
        cfg
      );

  // Preserve the user's manual selections before anything
  // starts changing state.
  const manualSelections =
    cloneManualSelections(
      state
    );

  state.manualSelections =
    manualSelections;

  // Identity must be generated first because nationality/profile
  // and gender influence everything downstream.
  randomizeIdentitySafe(
    state,
    cfg
  );

  // Body depends on identity.
  randomizeBodySafe(
    state,
    cfg
  );

  // Appearance depends on gender/body/profile.
  randomizeAppearanceSafe(
    state,
    cfg
  );

  // Hair depends on identity/profile and sometimes gender.
  randomizeHairSafe(
    state,
    cfg
  );

  randomizeAccessoriesSafe(
    state,
    cfg
  );

  // Clothing depends on the completed identity/body state.
  randomizeClothingSafe(
    state,
    cfg
  );

  // Action depends on clothing and identity.
  randomizeActionSafe(
    state,
    cfg
  );

  // Scene depends on action and clothing.
  randomizeSceneSafe(
    state,
    cfg
  );

  // Put every manual selection back one final time.
  //
  // This is intentional. It gives us a hard guarantee that a
  // manual choice wins over a random choice.
  state.manualSelections =
    manualSelections;

  restoreAllManualSelections(
    state
  );

  // Recalculate derived state after restoring manual values.
  state.genderForm =
    getStateValue(
      state,
      "gender"
    ) || "";

  const nationality =
    state.nationality;

  if (nationality) {
    state.nationalityProfile =
      nationality.profile ||
      (
        nationality.metadata &&
        nationality.metadata.profile
      ) ||
      state.nationalityProfile ||
      null;
  }

  return state;
}


// ------------------------------------------------------------
// SAFE GENERATION WRAPPER
// ------------------------------------------------------------

function generateConfiguredState(
  cfg,
  existingState
) {
  const state =
    generateStateRespectingManualSelectionsSafe(
      cfg,
      existingState
    );

  const validation =
    validateGenerationState(
      state
    );

  if (
    validation.valid
  ) {
    return state;
  }

  // Only attempt repair for categories that are NOT manually
  // controlled. Manual selections are never automatically
  // replaced by the repair system.
  return repairGenerationStateSafe(
    state,
    cfg,
    validation
  );
}


// ------------------------------------------------------------
// SAFE REPAIR
// ------------------------------------------------------------

function repairGenerationStateSafe(
  state,
  cfg,
  validation
) {
  if (
    !validation ||
    !validation.problems
  ) {
    return state;
  }

  validation.problems.forEach(
    function (problem) {
      if (
        !problem ||
        !problem.category
      ) {
        return;
      }

      const category =
        problem.category;

      if (
        isCategoryManuallySelected(
          state,
          category
        )
      ) {
        // Deliberate user choice wins.
        return;
      }

      const presets =
        getPresetCollectionForCategory(
          category
        );

      if (
        !presets ||
        presets.length === 0
      ) {
        return;
      }

      const selected =
        randomCompatiblePreset(
          category,
          presets,
          state
        );

      if (!selected) {
        return;
      }

      state[category] =
        selected;
    }
  );

  // Restore manual values after repair.
  restoreAllManualSelections(
    state
  );

  return state;
}


// ------------------------------------------------------------
// SAFE GENERATION WITH MULTIPLE PROMPTS
// ------------------------------------------------------------

function generateConfiguredStates(
  cfg,
  count,
  existingState
) {
  const amount =
    Math.max(
      1,
      Number(count) || 1
    );

  const states = [];

  for (
    let i = 0;
    i < amount;
    i++
  ) {
    const baseState =
      existingState
        ? cloneGenerationState(
          existingState
        )
        : null;

    states.push(
      generateConfiguredState(
        cfg,
        baseState
      )
    );
  }

  return states;
}


// ------------------------------------------------------------
// FINAL MANUAL-SAFE PROMPT GENERATOR
// ------------------------------------------------------------

function generateConfiguredPrompts(
  cfg,
  count,
  existingState
) {
  const states =
    generateConfiguredStates(
      cfg,
      count,
      existingState
    );

  return states.map(
    function (state) {
      return {
        state: state,

        prompt:
          buildPromptFromState(
            state
          ),

        summary:
          summarizeGenerationState(
            state
          )
      };
    }
  );
}


// ============================================================
// V14 — CLOTHING COLOR + OUTFIT ASSEMBLY
// ============================================================


// ------------------------------------------------------------
// COLOR LOOKUP
// ------------------------------------------------------------

function findClothingColorPreset(
  value
) {
  if (
    typeof clothingColorPresets ===
    "undefined"
  ) {
    return null;
  }

  const target =
    String(
      value || ""
    ).toLowerCase();

  return clothingColorPresets.find(
    function (preset) {
      return (
        String(
          getPresetValue(preset) || ""
        ).toLowerCase() === target ||
        String(
          getPresetLabel(preset) || ""
        ).toLowerCase() === target ||
        String(
          getPresetId(preset) || ""
        ).toLowerCase() === target
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// RANDOM CLOTHING COLOR
// ------------------------------------------------------------

function randomClothingColor() {
  if (
    typeof clothingColorPresets ===
    "undefined" ||
    clothingColorPresets.length === 0
  ) {
    return null;
  }

  return randomElement(
    clothingColorPresets
  );
}


// ------------------------------------------------------------
// APPLY A RANDOM COLOR TO ONE ITEM
// ------------------------------------------------------------

function applyRandomClothingColor(
  preset
) {
  if (!preset) {
    return preset;
  }

  const color =
    randomClothingColor();

  if (!color) {
    return preset;
  }

  return applyClothingColor(
    preset,
    getPresetValue(color)
  );
}


// ------------------------------------------------------------
// COLOR ALL CLOTHING ITEMS
// ------------------------------------------------------------

function colorClothingItems(
  items
) {
  if (
    !Array.isArray(items)
  ) {
    return [];
  }

  return items.map(
    function (item) {
      return applyRandomClothingColor(
        item
      );
    }
  );
}


// ------------------------------------------------------------
// GET CLOTHING ITEM ID
// ------------------------------------------------------------

function getClothingItemId(
  item
) {
  return getPresetId(
    item
  );
}


// ------------------------------------------------------------
// GET CLOTHING GROUP FROM ITEM
// ------------------------------------------------------------

function getClothingGroupForItem(
  item
) {
  return findClothingGroupForPreset(
    item
  );
}


// ------------------------------------------------------------
// GET CLOTHING ITEM VALUE
// ------------------------------------------------------------

function getClothingItemValue(
  item
) {
  return getPresetValue(
    item
  );
}


// ------------------------------------------------------------
// GET ALL CURRENT CLOTHING
// ------------------------------------------------------------

function getCurrentClothingItems(
  state
) {
  if (
    !state
  ) {
    return [];
  }

  if (
    Array.isArray(
      state.clothing
    )
  ) {
    return state.clothing;
  }

  if (
    state.clothing
  ) {
    return [
      state.clothing
    ];
  }

  return [];
}


// ------------------------------------------------------------
// SET CLOTHING ITEMS
// ------------------------------------------------------------

function setClothingItems(
  state,
  items
) {
  const normalized =
    Array.isArray(items)
      ? items.filter(
        function (item) {
          return !!item;
        }
      )
      : [];

  state.clothing =
    normalized;

  return state;
}


// ------------------------------------------------------------
// ADD CLOTHING ITEM
// ------------------------------------------------------------

function addClothingItem(
  state,
  item
) {
  if (!item) {
    return state;
  }

  if (
    !Array.isArray(
      state.clothing
    )
  ) {
    state.clothing = [];
  }

  state.clothing.push(
    item
  );

  return state;
}


// ------------------------------------------------------------
// REMOVE CLOTHING ITEM
// ------------------------------------------------------------

function removeClothingItem(
  state,
  item
) {
  if (
    !Array.isArray(
      state.clothing
    )
  ) {
    return state;
  }

  const targetId =
    getPresetId(
      item
    );

  state.clothing =
    state.clothing.filter(
      function (existing) {
        return (
          getPresetId(existing) !==
          targetId
        );
      }
    );

  return state;
}


// ------------------------------------------------------------
// GET GROUPS REPRESENTED BY CURRENT OUTFIT
// ------------------------------------------------------------

function getCurrentClothingGroups(
  state
) {
  if (
    !state
  ) {
    return [];
  }

  if (
    Array.isArray(
      state.clothingGroups
    ) &&
    state.clothingGroups.length > 0
  ) {
    return state.clothingGroups;
  }

  const items =
    getCurrentClothingItems(
      state
    );

  const groups = [];

  items.forEach(
    function (item) {
      const group =
        getClothingGroupForItem(
          item
        );

      if (!group) {
        return;
      }

      const id =
        getPresetId(
          group
        );

      const alreadyAdded =
        groups.some(
          function (existing) {
            return (
              getPresetId(existing) ===
              id
            );
          }
        );

      if (!alreadyAdded) {
        groups.push(
          group
        );
      }
    }
  );

  return groups;
}


// ------------------------------------------------------------
// SYNCHRONIZE CLOTHING GROUP STATE
// ------------------------------------------------------------

function synchronizeClothingGroups(
  state
) {
  state.clothingGroups =
    getCurrentClothingGroups(
      state
    );

  return state;
}


// ------------------------------------------------------------
// GET A CLOTHING ROLE
// ------------------------------------------------------------

function getClothingRoleFromItem(
  item
) {
  const group =
    getClothingGroupForItem(
      item
    );

  if (!group) {
    return null;
  }

  return getClothingGroupRole(
    group
  );
}


// ------------------------------------------------------------
// DETERMINE WHETHER ITEM CAN BE ADDED
// ------------------------------------------------------------

function canAddClothingItem(
  state,
  item
) {
  if (!item) {
    return false;
  }

  const group =
    getClothingGroupForItem(
      item
    );

  if (!group) {
    return false;
  }

  const groups =
    getCurrentClothingGroups(
      state
    );

  return canAddClothingGroup(
    groups,
    group
  );
}


// ------------------------------------------------------------
// BUILD A SINGLE OUTFIT
// ------------------------------------------------------------

function buildOutfitFromState(
  state
) {
  const items =
    getCurrentClothingItems(
      state
    );

  if (
    items.length === 0
  ) {
    return "";
  }

  const values =
    items.map(
      function (item) {
        return getClothingItemValue(
          item
        );
      }
    ).filter(
      function (value) {
        return !!value;
      }
    );

  return values.join(
    ", "
  );
}


// ------------------------------------------------------------
// BUILD COLORED OUTFIT
// ------------------------------------------------------------

function buildColoredOutfit(
  state
) {
  const items =
    getCurrentClothingItems(
      state
    );

  if (
    items.length === 0
  ) {
    return "";
  }

  return items.map(
    function (item) {
      const value =
        getPresetValue(
          item
        );

      if (!value) {
        return "";
      }

      return value;
    }
  ).filter(
    function (value) {
      return !!value;
    }
  ).join(
    ", "
  );
}


// ------------------------------------------------------------
// APPLY COLORS TO RANDOM OUTFIT
// ------------------------------------------------------------

function applyRandomOutfitColors(
  state
) {
  if (
    isCategoryManuallySelected(
      state,
      "clothing"
    )
  ) {
    // Manual clothing remains exactly what the user chose.
    return state;
  }

  const items =
    getCurrentClothingItems(
      state
    );

  if (
    items.length === 0
  ) {
    return state;
  }

  state.clothing =
    colorClothingItems(
      items
    );

  synchronizeClothingGroups(
    state
  );

  return state;
}


// ------------------------------------------------------------
// COLOR MANUAL CLOTHING
// ------------------------------------------------------------
// This function exists separately so the UI can eventually
// offer "Random Color" without replacing the clothing choice.
//

function randomizeManualClothingColors(
  state
) {
  const items =
    getCurrentClothingItems(
      state
    );

  if (
    items.length === 0
  ) {
    return state;
  }

  state.clothing =
    colorClothingItems(
      items
    );

  synchronizeClothingGroups(
    state
  );

  return state;
}


// ------------------------------------------------------------
// OUTFIT DESCRIPTION
// ------------------------------------------------------------

function buildOutfitDescription(
  state
) {
  const outfit =
    buildOutfitFromState(
      state
    );

  if (
    outfit
  ) {
    return outfit;
  }

  return (
    DEFAULT_PROMPT_FALLBACKS
      .outfit
  );
}


// ------------------------------------------------------------
// OUTFIT SUMMARY
// ------------------------------------------------------------

function summarizeOutfit(
  state
) {
  const items =
    getCurrentClothingItems(
      state
    );

  return {
    itemCount:
      items.length,

    items:
      items.map(
        function (item) {
          return {
            id:
              getPresetId(item),

            label:
              getPresetLabel(item),

            value:
              getPresetValue(item),

            group:
              getClothingGroupForItem(
                item
              )
                ? getPresetLabel(
                  getClothingGroupForItem(
                    item
                  )
                )
                : ""
          };
        }
      ),

    groups:
      getCurrentClothingGroups(
        state
      ).map(
        function (group) {
          return {
            id:
              getPresetId(group),

            label:
              getPresetLabel(group),

            role:
              getClothingGroupRole(
                group
              )
          };
        }
      )
  };
}


// ------------------------------------------------------------
// OUTFIT VALIDATION
// ------------------------------------------------------------

function validateOutfit(
  state
) {
  const groups =
    getCurrentClothingGroups(
      state
    );

  const problems = [];

  for (
    let i = 0;
    i < groups.length;
    i++
  ) {
    const current =
      groups[i];

    for (
      let j = i + 1;
      j < groups.length;
      j++
    ) {
      const other =
        groups[j];

      if (
        !canAddClothingGroup(
          groups.filter(
            function (group) {
              return (
                group !==
                current
              );
            }
          ),
          other
        )
      ) {
        problems.push({
          type:
            "clothing_group_conflict",

          first:
            getPresetId(
              current
            ),

          second:
            getPresetId(
              other
            )
        });
      }
    }
  }

  return {
    valid:
      problems.length === 0,

    problems:
      problems
  };
}


// ------------------------------------------------------------
// REPAIR ONLY RANDOM OUTFITS
// ------------------------------------------------------------

function repairOutfit(
  state,
  cfg
) {
  if (
    isCategoryManuallySelected(
      state,
      "clothing"
    )
  ) {
    return state;
  }

  const validation =
    validateOutfit(
      state
    );

  if (
    validation.valid
  ) {
    return state;
  }

  // Rebuild the random outfit from scratch rather than trying
  // to surgically remove an item and potentially creating a
  // second contradiction.
  randomizeClothing(
    state,
    cfg
  );

  return state;
}


// ------------------------------------------------------------
// FINAL OUTFIT PREPARATION
// ------------------------------------------------------------

function prepareOutfit(
  state,
  cfg
) {
  synchronizeClothingGroups(
    state
  );

  repairOutfit(
    state,
    cfg
  );

  synchronizeClothingGroups(
    state
  );

  if (
    !isCategoryManuallySelected(
      state,
      "clothing"
    )
  ) {
    applyRandomOutfitColors(
      state
    );
  }

  return state;
}


// ------------------------------------------------------------
// CLOTHING PROMPT VALUE
// ------------------------------------------------------------

function getClothingPromptValue(
  state
) {
  const outfit =
    buildOutfitDescription(
      state
    );

  return outfit;
}


// ------------------------------------------------------------
// OUTFIT STATE SNAPSHOT
// ------------------------------------------------------------

function createOutfitSnapshot(
  state
) {
  return {
    clothing:
      getCurrentClothingItems(
        state
      ).slice(),

    clothingGroups:
      getCurrentClothingGroups(
        state
      ).slice()
  };
}


// ------------------------------------------------------------
// RESTORE OUTFIT SNAPSHOT
// ------------------------------------------------------------

function restoreOutfitSnapshot(
  state,
  snapshot
) {
  if (!snapshot) {
    return state;
  }

  state.clothing =
    Array.isArray(
      snapshot.clothing
    )
      ? snapshot.clothing.slice()
      : [];

  state.clothingGroups =
    Array.isArray(
      snapshot.clothingGroups
    )
      ? snapshot.clothingGroups.slice()
      : [];

  return state;
}


// ------------------------------------------------------------
// COMPLETE CLOTHING GENERATION
// ------------------------------------------------------------
// This replaces the older direct clothing call as the final
// stage. It gives the outfit a chance to synchronize, validate,
// repair, and color itself before prompt construction.
//

function generatePreparedOutfit(
  state,
  cfg
) {
  randomizeClothingSafe(
    state,
    cfg
  );

  prepareOutfit(
    state,
    cfg
  );

  return state;
}


// ============================================================
// V14 — FINAL GENERATION PIPELINE
// ============================================================


// ------------------------------------------------------------
// GENERATION STAGE ORDER
// ------------------------------------------------------------

const GENERATION_STAGES = [
  "identity",
  "body",
  "appearance",
  "hair",
  "accessories",
  "clothing",
  "action",
  "camera",
  "lighting",
  "timeOfDay",
  "artStyle"
];


// ------------------------------------------------------------
// STAGE LABELS
// ------------------------------------------------------------

const GENERATION_STAGE_LABELS = {
  identity: "Identity",
  body: "Body",
  appearance: "Appearance",
  hair: "Hair",
  accessories: "Accessories",
  clothing: "Clothing",
  action: "Action",
  camera: "Camera",
  lighting: "Lighting",
  timeOfDay: "Time of Day",
  artStyle: "Art Style"
};


// ------------------------------------------------------------
// CREATE EMPTY GENERATION REPORT
// ------------------------------------------------------------

function createGenerationReport() {
  return {
    completedStages: [],
    skippedStages: [],
    repairedStages: [],
    warnings: [],
    errors: []
  };
}


// ------------------------------------------------------------
// RECORD COMPLETED STAGE
// ------------------------------------------------------------

function recordCompletedStage(
  report,
  stage
) {
  if (
    !report ||
    !stage
  ) {
    return;
  }

  if (
    report.completedStages.indexOf(
      stage
    ) === -1
  ) {
    report.completedStages.push(
      stage
    );
  }
}


// ------------------------------------------------------------
// RECORD SKIPPED STAGE
// ------------------------------------------------------------

function recordSkippedStage(
  report,
  stage
) {
  if (
    !report ||
    !stage
  ) {
    return;
  }

  if (
    report.skippedStages.indexOf(
      stage
    ) === -1
  ) {
    report.skippedStages.push(
      stage
    );
  }
}


// ------------------------------------------------------------
// RUN ONE GENERATION STAGE
// ------------------------------------------------------------

function runGenerationStage(
  state,
  stage,
  cfg,
  report
) {
  switch (
  stage
  ) {
    case "identity":
      randomizeIdentitySafe(
        state,
        cfg
      );
      break;

    case "body":
      randomizeBodySafe(
        state,
        cfg
      );
      break;

    case "appearance":
      randomizeAppearanceSafe(
        state,
        cfg
      );
      break;

    case "hair":
      randomizeHairSafe(
        state,
        cfg
      );
      break;

    case "accessories":
      randomizeAccessoriesSafe(
        state,
        cfg
      );
      break;

    case "clothing":
      generatePreparedOutfit(
        state,
        cfg
      );
      break;

    case "action":
      randomizeActionSafe(
        state,
        cfg
      );
      break;

    case "camera":
      if (
        !isCategoryManuallySelected(
          state,
          "camera"
        )
      ) {
        randomizeCamera(
          state,
          cfg
        );
      } else {
        restoreManualSelection(
          state,
          "camera"
        );
      }
      break;

    case "lighting":
      if (
        !isCategoryManuallySelected(
          state,
          "lighting"
        )
      ) {
        randomizeLighting(
          state,
          cfg
        );
      } else {
        restoreManualSelection(
          state,
          "lighting"
        );
      }
      break;

    case "timeOfDay":
      if (
        !isCategoryManuallySelected(
          state,
          "timeOfDay"
        )
      ) {
        randomizeTimeOfDay(
          state,
          cfg
        );
      } else {
        restoreManualSelection(
          state,
          "timeOfDay"
        );
      }
      break;

    case "artStyle":
      if (
        !isCategoryManuallySelected(
          state,
          "artStyle"
        )
      ) {
        randomizeArtStyle(
          state,
          cfg
        );
      } else {
        restoreManualSelection(
          state,
          "artStyle"
        );
      }
      break;

    default:
      report.warnings.push(
        "Unknown generation stage: " +
        stage
      );

      return false;
  }

  recordCompletedStage(
    report,
    stage
  );

  return true;
}


// ------------------------------------------------------------
// RUN COMPLETE GENERATION PIPELINE
// ------------------------------------------------------------

function runGenerationPipeline(
  state,
  cfg
) {
  const report =
    createGenerationReport();

  GENERATION_STAGES.forEach(
    function (stage) {
      try {
        runGenerationStage(
          state,
          stage,
          cfg,
          report
        );
      } catch (error) {
        report.errors.push({
          stage: stage,

          message:
            String(
              error &&
                error.message
                ? error.message
                : error
            )
        });
      }
    }
  );

  return report;
}


// ------------------------------------------------------------
// REBUILD DERIVED STATE
// ------------------------------------------------------------

function rebuildDerivedState(
  state
) {
  if (!state) {
    return state;
  }

  // Identity-derived values.
  state.genderForm =
    getStateValue(
      state,
      "gender"
    ) || "";

  const nationality =
    state.nationality;

  if (nationality) {
    state.nationalityProfile =
      nationality.profile ||
      (
        nationality.metadata &&
        nationality.metadata.profile
      ) ||
      state.nationalityProfile ||
      null;
  }

  // Clothing-derived values.
  synchronizeClothingGroups(
    state
  );

  // Keep the outfit representation usable whether it contains
  // one item or several.
  if (
    state.clothing &&
    !Array.isArray(
      state.clothing
    )
  ) {
    state.clothing = [
      state.clothing
    ];
  }

  return state;
}


// ------------------------------------------------------------
// VALIDATE AND REPAIR COMPLETE STATE
// ------------------------------------------------------------

function finalizeGenerationState(
  state,
  cfg,
  report
) {
  rebuildDerivedState(
    state
  );

  const validation =
    validateGenerationState(
      state
    );

  if (
    validation.valid
  ) {
    return state;
  }

  validation.problems.forEach(
    function (problem) {
      if (
        problem &&
        problem.category
      ) {
        if (
          report &&
          report.repairedStages
        ) {
          report.repairedStages.push(
            problem.category
          );
        }
      }
    }
  );

  repairGenerationStateSafe(
    state,
    cfg,
    validation
  );

  rebuildDerivedState(
    state
  );

  return state;
}


// ------------------------------------------------------------
// GENERATE ONE COMPLETE STATE
// ------------------------------------------------------------

function generateCompleteState(
  cfg,
  existingState
) {
  const state =
    existingState
      ? cloneGenerationState(
        existingState
      )
      : createConfiguredGenerationState(
        cfg
      );

  // Preserve manual choices before generation.
  if (
    !state.manualSelections
  ) {
    state.manualSelections =
      createManualSelectionState();
  }

  const report =
    runGenerationPipeline(
      state,
      cfg
    );

  restoreAllManualSelections(
    state
  );

  finalizeGenerationState(
    state,
    cfg,
    report
  );

  restoreAllManualSelections(
    state
  );

  rebuildDerivedState(
    state
  );

  return {
    state: state,
    report: report
  };
}


// ------------------------------------------------------------
// PROMPT NORMALIZATION
// ------------------------------------------------------------

function normalizeGeneratedPrompt(
  prompt
) {
  if (
    prompt === null ||
    prompt === undefined
  ) {
    return "";
  }

  let result =
    String(prompt);

  result =
    result.replace(
      /\s+/g,
      " "
    );

  result =
    result.replace(
      /\s+,/g,
      ","
    );

  result =
    result.replace(
      /,\s*,+/g,
      ", "
    );

  result =
    result.replace(
      /\s+\./g,
      "."
    );

  result =
    result.trim();

  return result;
}


// ------------------------------------------------------------
// BUILD FINAL PROMPT
// ------------------------------------------------------------

function buildFinalPrompt(
  state
) {
  const prompt =
    buildPromptFromState(
      state
    );

  return normalizeGeneratedPrompt(
    prompt
  );
}


// ------------------------------------------------------------
// GENERATE ONE PROMPT
// ------------------------------------------------------------

function generateCompletePrompt(
  cfg,
  existingState
) {
  const result =
    generateCompleteState(
      cfg,
      existingState
    );

  const prompt =
    buildFinalPrompt(
      result.state
    );

  return {
    prompt: prompt,

    state:
      result.state,

    report:
      result.report
  };
}


// ------------------------------------------------------------
// GENERATE UNIQUE PROMPTS
// ------------------------------------------------------------

function generateUniquePrompts(
  cfg,
  count,
  existingState
) {
  const amount =
    Math.max(
      1,
      Number(count) || 1
    );

  const results = [];
  const seen = {};

  let attempts = 0;

  const maximumAttempts =
    Math.max(
      amount * 8,
      16
    );

  while (
    results.length < amount &&
    attempts < maximumAttempts
  ) {
    attempts++;

    const result =
      generateCompletePrompt(
        cfg,
        existingState
      );

    const key =
      result.prompt;

    if (
      !seen[key]
    ) {
      seen[key] = true;
      results.push(
        result
      );
    }
  }

  // If the requested number of prompts cannot be made unique
  // under the selected constraints, return the available set
  // rather than manufacturing artificial differences.
  return results;
}


// ------------------------------------------------------------
// BATCH RESULT
// ------------------------------------------------------------

function createBatchResult(
  cfg,
  count,
  existingState
) {
  const results =
    generateUniquePrompts(
      cfg,
      count,
      existingState
    );

  return {
    count:
      results.length,

    requested:
      Math.max(
        1,
        Number(count) || 1
      ),

    results:
      results,

    prompts:
      results.map(
        function (result) {
          return result.prompt;
        }
      )
  };
}


// ------------------------------------------------------------
// PROMPT PREVIEW
// ------------------------------------------------------------

function createPromptPreview(
  cfg,
  existingState
) {
  const result =
    generateCompletePrompt(
      cfg,
      existingState
    );

  return {
    prompt:
      result.prompt,

    summary:
      summarizeGenerationState(
        result.state
      ),

    report:
      result.report
  };
}


// ------------------------------------------------------------
// STATE DEBUG DESCRIPTION
// ------------------------------------------------------------

function describeGeneratedState(
  state
) {
  if (!state) {
    return "";
  }

  const subject =
    buildSubjectDescription(
      state
    );

  const outfit =
    buildOutfitDescription(
      state
    );

  const action =
    buildActionDescription(
      state
    );

  const camera =
    getStateValue(
      state,
      "camera"
    ) || "";

  const lighting =
    getStateValue(
      state,
      "lighting"
    ) || "";

  const timeOfDay =
    getStateValue(
      state,
      "timeOfDay"
    ) || "";

  const artStyle =
    getStateValue(
      state,
      "artStyle"
    ) || "";

  return [
    "SUBJECT: " + subject,
    "OUTFIT: " + outfit,
    "ACTION: " + action,
    "CAMERA: " + camera,
    "LIGHTING: " + lighting,
    "TIME: " + timeOfDay,
    "STYLE: " + artStyle
  ].join(
    "\n"
  );
}


// ------------------------------------------------------------
// GENERATION HISTORY
// ------------------------------------------------------------

function createGenerationHistory() {
  return [];
}


function addGenerationHistoryEntry(
  history,
  result
) {
  if (
    !Array.isArray(history) ||
    !result
  ) {
    return history;
  }

  history.push({
    prompt:
      result.prompt,

    state:
      cloneGenerationState(
        result.state
      ),

    timestamp:
      Date.now()
  });

  return history;
}


// ------------------------------------------------------------
// KEEP HISTORY AT A REASONABLE SIZE
// ------------------------------------------------------------

function trimGenerationHistory(
  history,
  maximum
) {
  if (
    !Array.isArray(history)
  ) {
    return [];
  }

  const limit =
    Math.max(
      1,
      Number(maximum) || 50
    );

  while (
    history.length > limit
  ) {
    history.shift();
  }

  return history;
}


// ------------------------------------------------------------
// COMPLETE GENERATION SESSION
// ------------------------------------------------------------

function createGenerationSession(
  cfg
) {
  return {
    config:
      cfg,

    state:
      createConfiguredGenerationState(
        cfg
      ),

    history:
      createGenerationHistory(),

    lastResult:
      null
  };
}


// ------------------------------------------------------------
// GENERATE INTO SESSION
// ------------------------------------------------------------

function generateSessionPrompt(
  session
) {
  if (!session) {
    return null;
  }

  const result =
    generateCompletePrompt(
      session.config,
      session.state
    );

  session.state =
    result.state;

  session.lastResult =
    result;

  addGenerationHistoryEntry(
    session.history,
    result
  );

  trimGenerationHistory(
    session.history,
    50
  );

  return result;
}


// ------------------------------------------------------------
// GENERATE BATCH INTO SESSION
// ------------------------------------------------------------

function generateSessionBatch(
  session,
  count
) {
  if (!session) {
    return [];
  }

  const results =
    generateUniquePrompts(
      session.config,
      count,
      session.state
    );

  results.forEach(
    function (result) {
      addGenerationHistoryEntry(
        session.history,
        result
      );

      session.state =
        result.state;

      session.lastResult =
        result;
    }
  );

  trimGenerationHistory(
    session.history,
    50
  );

  return results;
}


// ------------------------------------------------------------
// EXPORTABLE V14 GENERATOR API
// ------------------------------------------------------------
// Keeping the generator behind a small API makes it easier to
// connect the actual Draw Things UI later without allowing UI
// code to manipulate the generation engine directly.
//

const V14_GENERATOR = {
  createState:
    function (cfg) {
      return createConfiguredGenerationState(
        cfg
      );
    },

  generate:
    function (
      cfg,
      state
    ) {
      return generateCompletePrompt(
        cfg,
        state
      );
    },

  generateBatch:
    function (
      cfg,
      count,
      state
    ) {
      return createBatchResult(
        cfg,
        count,
        state
      );
    },

  preview:
    function (
      cfg,
      state
    ) {
      return createPromptPreview(
        cfg,
        state
      );
    },

  describe:
    function (state) {
      return describeGeneratedState(
        state
      );
    }
};


// ============================================================
// V14 — DRAW THINGS UI CONFIGURATION
// ============================================================


// ------------------------------------------------------------
// UI DEFAULTS
// ------------------------------------------------------------

const V14_UI_DEFAULTS = {
  model:
    "krea2",

  aspect:
    "1:1",

  randomizationMode:
    "compatible",

  batchCount:
    1,

  randomizeIdentity:
    true,

  randomizeBody:
    true,

  randomizeAppearance:
    true,

  randomizeHair:
    true,

  randomizeAccessories:
    true,

  randomizeClothing:
    true,

  randomizeAction:
    true,

  randomizeCamera:
    true,

  randomizeLighting:
    true,

  randomizeTimeOfDay:
    true,

  randomizeArtStyle:
    true,

  useProfileWeights:
    true,

  preferredMultiplier:
    4,

  discouragedMultiplier:
    0.2,

  applyRandomClothingColors:
    true,

  useQwenRefinement:
    false
};


// ------------------------------------------------------------
// UI OPTION LISTS
// ------------------------------------------------------------

const V14_RANDOMIZATION_OPTIONS = [
  {
    id: "compatible",
    label: "Compatible Random"
  },

  {
    id: "free",
    label: "Free Random"
  }
];


const V14_BATCH_OPTIONS = [
  {
    id: "1",
    label: "1"
  },

  {
    id: "2",
    label: "2"
  },

  {
    id: "4",
    label: "4"
  },

  {
    id: "8",
    label: "8"
  },

  {
    id: "16",
    label: "16"
  }
];


// ------------------------------------------------------------
// MODEL MENU
// ------------------------------------------------------------

function getModelMenuLabels() {
  return MODEL_OPTIONS.map(
    function (model) {
      return model.label;
    }
  );
}


function getModelMenuIds() {
  return MODEL_OPTIONS.map(
    function (model) {
      return model.id;
    }
  );
}


// ------------------------------------------------------------
// ASPECT MENU
// ------------------------------------------------------------

function getAspectMenuLabels() {
  return ASPECT_OPTIONS.map(
    function (aspect) {
      return aspect.label;
    }
  );
}


function getAspectMenuIds() {
  return ASPECT_OPTIONS.map(
    function (aspect) {
      return aspect.id;
    }
  );
}


// ------------------------------------------------------------
// RANDOMIZATION MENU
// ------------------------------------------------------------

function getRandomizationMenuLabels() {
  return V14_RANDOMIZATION_OPTIONS.map(
    function (option) {
      return option.label;
    }
  );
}


// ------------------------------------------------------------
// BATCH MENU
// ------------------------------------------------------------

function getBatchMenuLabels() {
  return V14_BATCH_OPTIONS.map(
    function (option) {
      return option.label;
    }
  );
}


// ------------------------------------------------------------
// FIND OPTION INDEX
// ------------------------------------------------------------

function findOptionIndex(
  options,
  id
) {
  if (
    !Array.isArray(options)
  ) {
    return 0;
  }

  const index =
    options.findIndex(
      function (option) {
        return (
          option.id ===
          id
        );
      }
    );

  return index >= 0
    ? index
    : 0;
}


// ------------------------------------------------------------
// MODEL INDEX
// ------------------------------------------------------------

function getDefaultModelIndex() {
  return findOptionIndex(
    MODEL_OPTIONS,
    V14_UI_DEFAULTS.model
  );
}


// ------------------------------------------------------------
// ASPECT INDEX
// ------------------------------------------------------------

function getDefaultAspectIndex() {
  return findOptionIndex(
    ASPECT_OPTIONS,
    V14_UI_DEFAULTS.aspect
  );
}


// ------------------------------------------------------------
// RANDOMIZATION INDEX
// ------------------------------------------------------------

function getDefaultRandomizationIndex() {
  return findOptionIndex(
    V14_RANDOMIZATION_OPTIONS,
    V14_UI_DEFAULTS.randomizationMode
  );
}


// ------------------------------------------------------------
// BATCH INDEX
// ------------------------------------------------------------

function getDefaultBatchIndex() {
  return findOptionIndex(
    V14_BATCH_OPTIONS,
    String(
      V14_UI_DEFAULTS.batchCount
    )
  );
}


// ------------------------------------------------------------
// GET MODEL BY INDEX
// ------------------------------------------------------------

function getModelByIndex(
  index
) {
  if (
    !Array.isArray(
      MODEL_OPTIONS
    )
  ) {
    return null;
  }

  return (
    MODEL_OPTIONS[
    Number(index)
    ] ||
    MODEL_OPTIONS[0] ||
    null
  );
}


// ------------------------------------------------------------
// GET ASPECT BY INDEX
// ------------------------------------------------------------

function getAspectByIndex(
  index
) {
  if (
    !Array.isArray(
      ASPECT_OPTIONS
    )
  ) {
    return null;
  }

  return (
    ASPECT_OPTIONS[
    Number(index)
    ] ||
    ASPECT_OPTIONS[0] ||
    null
  );
}


// ------------------------------------------------------------
// GET RANDOMIZATION MODE BY INDEX
// ------------------------------------------------------------

function getRandomizationModeByIndex(
  index
) {
  return (
    V14_RANDOMIZATION_OPTIONS[
    Number(index)
    ] ||
    V14_RANDOMIZATION_OPTIONS[0]
  );
}


// ------------------------------------------------------------
// GET BATCH COUNT BY INDEX
// ------------------------------------------------------------

function getBatchCountByIndex(
  index
) {
  const option =
    V14_BATCH_OPTIONS[
    Number(index)
    ] ||
    V14_BATCH_OPTIONS[0];

  return Math.max(
    1,
    Number(
      option.id
    ) || 1
  );
}


// ------------------------------------------------------------
// MODEL CONFIGURATION
// ------------------------------------------------------------

function buildModelConfiguration(
  modelIndex
) {
  const model =
    getModelByIndex(
      modelIndex
    );

  if (!model) {
    return {
      model: null,
      checkpoint: "",
      loras: []
    };
  }

  return {
    model: model,

    checkpoint:
      model.file ||
      "",

    loras:
      Array.isArray(
        model.loras
      )
        ? model.loras.slice()
        : []
  };
}


// ------------------------------------------------------------
// ASPECT CONFIGURATION
// ------------------------------------------------------------

function buildAspectConfiguration(
  aspectIndex
) {
  const aspect =
    getAspectByIndex(
      aspectIndex
    );

  if (!aspect) {
    return {
      aspect: null,

      width:
        ASPECT_DIMENSIONS["1:1"].width,

      height:
        ASPECT_DIMENSIONS["1:1"].height
    };
  }

  return {
    aspect: aspect,

    width:
      aspect.width,

    height:
      aspect.height
  };
}


// ------------------------------------------------------------
// RANDOMIZATION CONFIGURATION
// ------------------------------------------------------------

function buildV14RandomizationConfig(
  randomizationIndex
) {
  const mode =
    getRandomizationModeByIndex(
      randomizationIndex
    );

  return createRandomizationConfig({
    mode:
      mode.id,

    useProfileWeights:
      V14_UI_DEFAULTS.useProfileWeights,

    preferredMultiplier:
      V14_UI_DEFAULTS.preferredMultiplier,

    discouragedMultiplier:
      V14_UI_DEFAULTS.discouragedMultiplier,

    randomizeIdentity:
      V14_UI_DEFAULTS.randomizeIdentity,

    randomizeBody:
      V14_UI_DEFAULTS.randomizeBody,

    randomizeAppearance:
      V14_UI_DEFAULTS.randomizeAppearance,

    randomizeHair:
      V14_UI_DEFAULTS.randomizeHair,

    randomizeAccessories:
      V14_UI_DEFAULTS.randomizeAccessories,

    randomizeClothing:
      V14_UI_DEFAULTS.randomizeClothing,

    randomizeAction:
      V14_UI_DEFAULTS.randomizeAction,

    randomizeCamera:
      V14_UI_DEFAULTS.randomizeCamera,

    randomizeLighting:
      V14_UI_DEFAULTS.randomizeLighting,

    randomizeTimeOfDay:
      V14_UI_DEFAULTS.randomizeTimeOfDay,

    randomizeArtStyle:
      V14_UI_DEFAULTS.randomizeArtStyle
  });
}


// ------------------------------------------------------------
// COMPLETE UI CONFIGURATION
// ------------------------------------------------------------

function createV14UIConfiguration(
  modelIndex,
  aspectIndex,
  randomizationIndex,
  batchIndex
) {
  const model =
    buildModelConfiguration(
      modelIndex
    );

  const aspect =
    buildAspectConfiguration(
      aspectIndex
    );

  const randomization =
    buildV14RandomizationConfig(
      randomizationIndex
    );

  const batchCount =
    getBatchCountByIndex(
      batchIndex
    );

  return {
    model:
      model,

    aspect:
      aspect,

    randomization:
      randomization,

    batchCount:
      batchCount,

    useQwenRefinement:
      V14_UI_DEFAULTS.useQwenRefinement,

    applyRandomClothingColors:
      V14_UI_DEFAULTS.applyRandomClothingColors
  };
}


// ------------------------------------------------------------
// MODEL DESCRIPTION
// ------------------------------------------------------------

function describeModelConfiguration(
  configuration
) {
  if (
    !configuration ||
    !configuration.model
  ) {
    return "";
  }

  const model =
    configuration.model;

  const parts = [
    model.label
  ];

  if (
    model.file
  ) {
    parts.push(
      model.file
    );
  }

  if (
    Array.isArray(
      model.loras
    ) &&
    model.loras.length > 0
  ) {
    model.loras.forEach(
      function (lora) {
        if (!lora) {
          return;
        }

        if (
          typeof lora ===
          "string"
        ) {
          parts.push(
            lora
          );

          return;
        }

        if (
          lora.file
        ) {
          parts.push(
            lora.file
          );
        }
      }
    );
  }

  return parts.join(
    " | "
  );
}


// ------------------------------------------------------------
// ASPECT DESCRIPTION
// ------------------------------------------------------------

function describeAspectConfiguration(
  configuration
) {
  if (
    !configuration ||
    !configuration.aspect
  ) {
    return "";
  }

  return (
    configuration.aspect.label +
    " (" +
    configuration.width +
    "×" +
    configuration.height +
    ")"
  );
}


// ------------------------------------------------------------
// RANDOMIZATION DESCRIPTION
// ------------------------------------------------------------

function describeRandomizationConfiguration(
  configuration
) {
  if (
    !configuration
  ) {
    return "";
  }

  return (
    configuration.mode ===
      "free"
      ? "Free Random"
      : "Compatible Random"
  );
}


// ------------------------------------------------------------
// GENERATION CONFIGURATION SUMMARY
// ------------------------------------------------------------

function describeV14UIConfiguration(
  configuration
) {
  if (
    !configuration
  ) {
    return "";
  }

  return [
    "Model: " +
    describeModelConfiguration(
      configuration.model
    ),

    "Aspect: " +
    describeAspectConfiguration(
      configuration.aspect
    ),

    "Randomization: " +
    describeRandomizationConfiguration(
      configuration.randomization
    ),

    "Batch: " +
    configuration.batchCount
  ].join(
    "\n"
  );
}


// ------------------------------------------------------------
// CONVERT UI CONFIG TO GENERATOR CONFIG
// ------------------------------------------------------------

function buildGeneratorConfigFromUI(
  configuration
) {
  const randomization =
    configuration &&
      configuration.randomization
      ? configuration.randomization
      : createRandomizationConfig();

  return {
    mode:
      randomization.mode ||
      "compatible",

    useProfileWeights:
      randomization.useProfileWeights !==
      false,

    preferredMultiplier:
      randomization.preferredMultiplier ||
      4,

    discouragedMultiplier:
      randomization.discouragedMultiplier ||
      0.2,

    randomizeIdentity:
      randomization.randomizeIdentity !==
      false,

    randomizeBody:
      randomization.randomizeBody !==
      false,

    randomizeAppearance:
      randomization.randomizeAppearance !==
      false,

    randomizeHair:
      randomization.randomizeHair !==
      false,

    randomizeAccessories:
      randomization.randomizeAccessories !==
      false,

    randomizeClothing:
      randomization.randomizeClothing !==
      false,

    randomizeAction:
      randomization.randomizeAction !==
      false,

    randomizeCamera:
      randomization.randomizeCamera !==
      false,

    randomizeLighting:
      randomization.randomizeLighting !==
      false,

    randomizeTimeOfDay:
      randomization.randomizeTimeOfDay !==
      false,

    randomizeArtStyle:
      randomization.randomizeArtStyle !==
      false,

    applyRandomClothingColors:
      configuration
        ? configuration.applyRandomClothingColors !==
        false
        : true,

    useQwenRefinement:
      configuration
        ? configuration.useQwenRefinement ===
        true
        : false
  };
}


// ------------------------------------------------------------
// CREATE SESSION FROM UI
// ------------------------------------------------------------

function createV14SessionFromUI(
  configuration
) {
  const generatorConfig =
    buildGeneratorConfigFromUI(
      configuration
    );

  return createGenerationSession(
    generatorConfig
  );
}


// ------------------------------------------------------------
// GENERATE FROM UI CONFIGURATION
// ------------------------------------------------------------

function generateV14FromUI(
  configuration,
  existingState
) {
  const generatorConfig =
    buildGeneratorConfigFromUI(
      configuration
    );

  return createBatchResult(
    generatorConfig,
    configuration.batchCount,
    existingState
  );
}


// ============================================================
// V14 — ACTUAL DRAW THINGS REQUEST-FROM-USER UI
// ============================================================


// ------------------------------------------------------------
// BUILD THE MAIN V14 CONFIGURATION DIALOG
// ------------------------------------------------------------

function requestV14Configuration() {
  const result =
    requestFromUser(
      "KREA 2 MODULAR BATCH GENERATOR V14",
      "Generate",
      function () {

        return [

          // ==================================================
          // MODEL
          // ==================================================

          this.section(
            "Model",
            "Choose the image-generation model and output aspect ratio.",
            [

              this.menu(
                getDefaultModelIndex(),
                getModelMenuLabels()
              ),

              this.menu(
                getDefaultAspectIndex(),
                getAspectMenuLabels()
              )

            ]
          ),


          // ==================================================
          // RANDOMIZATION
          // ==================================================

          this.section(
            "Randomization",
            "Compatible Random respects gender, profile, clothing, action, camera, and other relationships. Free Random intentionally ignores those compatibility rules.",
            [

              this.segmented(
                getDefaultRandomizationIndex(),
                getRandomizationMenuLabels()
              ),

              this.menu(
                getDefaultBatchIndex(),
                getBatchMenuLabels()
              ),

              this.switch(
                V14_UI_DEFAULTS.useProfileWeights,
                "Use identity/profile weighting"
              ),

              this.switch(
                V14_UI_DEFAULTS.applyRandomClothingColors,
                "Randomize clothing colors"
              )

            ]
          ),


          // ==================================================
          // IDENTITY
          // ==================================================

          this.section(
            "Identity",
            "Randomize the subject's identity and basic demographic attributes.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeIdentity,
                "Randomize identity"
              )

            ]
          ),


          // ==================================================
          // BODY
          // ==================================================

          this.section(
            "Body",
            "Randomize body proportions and physical characteristics.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeBody,
                "Randomize body"
              )

            ]
          ),


          // ==================================================
          // APPEARANCE
          // ==================================================

          this.section(
            "Appearance",
            "Randomize makeup, facial details, tattoos, body details, nails, and related traits.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeAppearance,
                "Randomize appearance"
              )

            ]
          ),


          // ==================================================
          // HAIR
          // ==================================================

          this.section(
            "Hair",
            "Randomize hair color, length, texture, and hairstyle.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeHair,
                "Randomize hair"
              )

            ]
          ),


          // ==================================================
          // ACCESSORIES
          // ==================================================

          this.section(
            "Accessories",
            "Randomly add compatible jewelry, eyewear, piercings, headwear, or hair accessories.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeAccessories,
                "Randomize accessories"
              )

            ]
          ),


          // ==================================================
          // CLOTHING
          // ==================================================

          this.section(
            "Clothing",
            "Build a compatible outfit instead of independently choosing unrelated clothing items.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeClothing,
                "Randomize clothing"
              )

            ]
          ),


          // ==================================================
          // ACTION
          // ==================================================

          this.section(
            "Action",
            "Choose an action that remains compatible with the generated subject and outfit.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeAction,
                "Randomize action"
              )

            ]
          ),


          // ==================================================
          // CAMERA
          // ==================================================

          this.section(
            "Camera",
            "Choose camera framing and viewpoint using action-aware compatibility.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeCamera,
                "Randomize camera"
              )

            ]
          ),


          // ==================================================
          // LIGHTING
          // ==================================================

          this.section(
            "Lighting",
            "Choose lighting that can interact with time of day and art style.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeLighting,
                "Randomize lighting"
              )

            ]
          ),


          // ==================================================
          // TIME OF DAY
          // ==================================================

          this.section(
            "Time of Day",
            "Choose the environmental time while respecting lighting relationships.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeTimeOfDay,
                "Randomize time of day"
              )

            ]
          ),


          // ==================================================
          // ART STYLE
          // ==================================================

          this.section(
            "Art Style",
            "Choose photographic or artistic treatment.",
            [

              this.switch(
                V14_UI_DEFAULTS.randomizeArtStyle,
                "Randomize art style"
              )

            ]
          ),


          // ==================================================
          // QWEN REFINEMENT
          // ==================================================

          this.section(
            "Prompt Refinement",
            "Optionally pass the generated prompt through the Qwen refinement model after the prompt has been assembled.",
            [

              this.switch(
                V14_UI_DEFAULTS.useQwenRefinement,
                "Use Qwen prompt refinement"
              )

            ]
          )

        ];
      }
    );

  return result;
}


// ------------------------------------------------------------
// EXTRACT VALUES FROM requestFromUser()
// ------------------------------------------------------------
//
// The UI returns the controls in the same order that they were
// supplied above.
//
// IMPORTANT:
// These positions belong ONLY to the UI dialog.
//
// They are NOT used anywhere by the generation engine to
// identify presets.
//
// That distinction is what prevents the old slice()/index
// architecture from becoming fragile.
//

function parseV14Configuration(
  values
) {
  if (
    !Array.isArray(values)
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // CONTROL POSITIONS
  // ----------------------------------------------------------

  const modelIndex =
    Number(values[0]) || 0;

  const aspectIndex =
    Number(values[1]) || 0;

  const randomizationIndex =
    Number(values[2]) || 0;

  const batchIndex =
    Number(values[3]) || 0;

  const useProfileWeights =
    Boolean(values[4]);

  const randomizeClothingColors =
    Boolean(values[5]);

  const randomizeIdentity =
    Boolean(values[6]);

  const randomizeBody =
    Boolean(values[7]);

  const randomizeAppearance =
    Boolean(values[8]);

  const randomizeHair =
    Boolean(values[9]);

  const randomizeAccessories =
    Boolean(values[10]);

  const randomizeClothing =
    Boolean(values[11]);

  const randomizeAction =
    Boolean(values[12]);

  const randomizeCamera =
    Boolean(values[13]);

  const randomizeLighting =
    Boolean(values[14]);

  const randomizeTimeOfDay =
    Boolean(values[15]);

  const randomizeArtStyle =
    Boolean(values[16]);

  const useQwenRefinement =
    Boolean(values[17]);


  // ----------------------------------------------------------
  // BUILD BASE CONFIGURATION
  // ----------------------------------------------------------

  const configuration =
    createV14UIConfiguration(
      modelIndex,
      aspectIndex,
      randomizationIndex,
      batchIndex
    );


  // ----------------------------------------------------------
  // APPLY SWITCH VALUES
  // ----------------------------------------------------------

  configuration.randomization
    .useProfileWeights =
    useProfileWeights;

  configuration.randomization
    .randomizeIdentity =
    randomizeIdentity;

  configuration.randomization
    .randomizeBody =
    randomizeBody;

  configuration.randomization
    .randomizeAppearance =
    randomizeAppearance;

  configuration.randomization
    .randomizeHair =
    randomizeHair;

  configuration.randomization
    .randomizeAccessories =
    randomizeAccessories;

  configuration.randomization
    .randomizeClothing =
    randomizeClothing;

  configuration.randomization
    .randomizeAction =
    randomizeAction;

  configuration.randomization
    .randomizeCamera =
    randomizeCamera;

  configuration.randomization
    .randomizeLighting =
    randomizeLighting;

  configuration.randomization
    .randomizeTimeOfDay =
    randomizeTimeOfDay;

  configuration.randomization
    .randomizeArtStyle =
    randomizeArtStyle;

  configuration.applyRandomClothingColors =
    randomizeClothingColors;

  configuration.useQwenRefinement =
    useQwenRefinement;


  return configuration;
}


// ------------------------------------------------------------
// GET CONFIGURATION DIRECTLY FROM DRAW THINGS
// ------------------------------------------------------------

function getV14ConfigurationFromUser() {
  const values =
    requestV14Configuration();

  if (
    !values
  ) {
    return null;
  }

  return parseV14Configuration(
    values
  );
}


// ------------------------------------------------------------
// BUILD GENERATOR CONFIGURATION
// ------------------------------------------------------------

function getV14GeneratorConfiguration() {
  const uiConfiguration =
    getV14ConfigurationFromUser();

  if (
    !uiConfiguration
  ) {
    return null;
  }

  return {
    ui:
      uiConfiguration,

    generator:
      buildGeneratorConfigFromUI(
        uiConfiguration
      ),

    model:
      uiConfiguration.model,

    aspect:
      uiConfiguration.aspect,

    batchCount:
      uiConfiguration.batchCount
  };
}


// ------------------------------------------------------------
// DEBUG UI CONFIGURATION
// ------------------------------------------------------------

function describeV14Configuration(
  configuration
) {
  if (
    !configuration
  ) {
    return "No configuration.";
  }

  const ui =
    configuration.ui ||
    configuration;

  const generator =
    configuration.generator ||
    buildGeneratorConfigFromUI(
      ui
    );

  return [
    describeV14UIConfiguration(
      ui
    ),

    "",

    "Generator mode: " +
    (
      generator.mode ===
        "free"
        ? "Free Random"
        : "Compatible Random"
    ),

    "Profile weighting: " +
    (
      generator.useProfileWeights
        ? "ON"
        : "OFF"
    ),

    "Clothing colors: " +
    (
      generator.applyRandomClothingColors
        ? "ON"
        : "OFF"
    ),

    "Qwen refinement: " +
    (
      generator.useQwenRefinement
        ? "ON"
        : "OFF"
    )
  ].join(
    "\n"
  );
}


// =========================================
// V14 — CHUNK 20
// MANUAL CONTROL UI + STABLE-ID PARSER
// =========================================
//
// The Draw Things dialog itself still returns numeric menu/switch
// positions. Those positions exist ONLY at the UI boundary.
//
// Immediately after reading the UI, this chunk converts selections
// into stable preset IDs and stores them in GenerationState.
//
// Generation logic never relies on:
//   - array positions
//   - slice()
//   - hard-coded numeric indices
//   - the order of UI controls
//
// =========================================


// =========================================
// MANUAL UI GROUP HELPERS
// =========================================

function v14PresetMenuItems(presets, placeholder) {
  return menuWithPlaceholder(
    placeholder || "No selection",
    presets
  );
}


function v14ManualMenu(defaultIndex, presets, placeholder) {
  return this.menu(
    defaultIndex === undefined ? NONE_SELECTED : defaultIndex,
    v14PresetMenuItems.call(this, presets, placeholder)
  );
}


function v14ManualSection(fields, title, description, controls) {
  fields.push(
    this.section(
      title,
      description,
      controls
    )
  );
}


function v14ManualPresetSection(
  fields,
  title,
  description,
  category,
  placeholder
) {
  const presets = PRESET_COLLECTIONS[category] || [];

  v14ManualSection(
    fields,
    title,
    description,
    [
      v14ManualMenu(
        NONE_SELECTED,
        presets,
        placeholder || "No selection"
      )
    ]
  );
}


function v14ManualSwitchGroupSection(
  fields,
  title,
  description,
  group
) {
  if (!group) return;

  if (group.type === "menu") {
    v14ManualPresetSection(
      fields,
      title,
      description,
      group.category || "",
      group.placeholder || "No selection"
    );
    return;
  }

  const presets = group.presets || [];

  v14ManualSection(
    fields,
    title,
    description,
    [
      ...presetSwitches.call(this, presets)
    ]
  );
}


// =========================================
// MANUAL CONTROL CATEGORY LOOKUP
// =========================================

function getManualControlDefinition(category) {
  return V14_CONTROL_REGISTRY
    .find(control => control.category === category) || null;
}


function getManualControlPresets(category) {
  const definition = getManualControlDefinition(category);

  if (definition && Array.isArray(definition.presets)) {
    return definition.presets;
  }

  return PRESET_COLLECTIONS[category] || [];
}


function getManualControlPlaceholder(category) {
  const definition = getManualControlDefinition(category);

  return definition && definition.placeholder
    ? definition.placeholder
    : "No selection";
}


// =========================================
// MANUAL UI DEFINITION
// =========================================
//
// These definitions describe the actual Draw Things controls.
//
// "category" is the stable generation category.
// "label" is only UI text.
// "presets" points to the actual metadata collection.
//
// Nothing here becomes part of the generation identity.


const V14_MANUAL_IDENTITY_CONTROLS = [
  {
    category: "gender",
    label: "Gender",
    placeholder: "Random / no gender selected"
  },
  {
    category: "nationality",
    label: "Nationality / ethnicity",
    placeholder: "Random / no nationality selected"
  },
  {
    category: "age",
    label: "Age",
    placeholder: "Random / no age selected"
  },
  {
    category: "skin",
    label: "Skin tone",
    placeholder: "Random / no skin tone selected"
  },
  {
    category: "eyes",
    label: "Eye color",
    placeholder: "Random / no eye color selected"
  }
];


const V14_MANUAL_BODY_CONTROLS = [
  {
    category: "overallBuild",
    label: "Overall build",
    placeholder: "Random / no build selected"
  },
  {
    category: "height",
    label: "Height",
    placeholder: "Random / no height selected"
  },
  {
    category: "chest",
    label: "Chest",
    placeholder: "Random / no chest description"
  },
  {
    category: "hips",
    label: "Hips",
    placeholder: "Random / no hip description"
  },
  {
    category: "bodyShape",
    label: "Body shape",
    placeholder: "Random / no body shape selected"
  },
  {
    category: "legs",
    label: "Legs",
    placeholder: "Random / no leg description"
  },
  {
    category: "buttocks",
    label: "Buttocks",
    placeholder: "Random / no buttocks selected"
  },
  {
    category: "belly",
    label: "Belly",
    placeholder: "Random / no belly selected"
  },
  {
    category: "specificBody",
    label: "Specific body",
    placeholder: "No specific body condition"
  },
  {
    category: "lips",
    label: "Lips",
    placeholder: "Random / no lip description"
  },
  {
    category: "eyelashes",
    label: "Eyelashes",
    placeholder: "Random / no eyelash description"
  }
];


const V14_MANUAL_HAIR_CONTROLS = [
  {
    category: "hairType",
    label: "Hair texture",
    placeholder: "Random / no hair texture selected"
  },
  {
    category: "hairColor",
    label: "Hair color",
    placeholder: "Random / no hair color selected"
  },
  {
    category: "hairLength",
    label: "Hair length",
    placeholder: "Random / no hair length selected"
  }
];


const V14_MANUAL_SCENE_CONTROLS = [
  {
    category: "action",
    label: "Action / pose",
    placeholder: "Random / no action selected"
  },
  {
    category: "camera",
    label: "Camera",
    placeholder: "Random / no camera selected"
  },
  {
    category: "lighting",
    label: "Lighting",
    placeholder: "Random / no lighting selected"
  },
  {
    category: "timeOfDay",
    label: "Time of day",
    placeholder: "Random / no time selected"
  },
  {
    category: "artStyle",
    label: "Art style",
    placeholder: "Random / no style selected"
  }
];


// =========================================
// BUILD ONE MANUAL CONTROL
// =========================================

function buildV14ManualControl(control) {
  const presets = getManualControlPresets(control.category);

  return this.menu(
    NONE_SELECTED,
    menuWithPlaceholder(
      control.placeholder || "No selection",
      presets
    )
  );
}


// =========================================
// BUILD MANUAL IDENTITY SECTION
// =========================================

function buildV14ManualIdentitySection(fields) {
  const controls = V14_MANUAL_IDENTITY_CONTROLS.map(
    control => buildV14ManualControl.call(this, control)
  );

  v14ManualSection(
    fields,
    "❖  Identity",
    "Pin any identity trait. Anything left unselected remains available to the compatibility engine.",
    controls
  );
}


// =========================================
// BUILD MANUAL BODY SECTION
// =========================================

function buildV14ManualBodySection(fields) {
  const controls = V14_MANUAL_BODY_CONTROLS.map(
    control => buildV14ManualControl.call(this, control)
  );

  controls.push(
    this.textField(
      "",
      "Custom body details",
      false,
      60
    )
  );

  v14ManualSection(
    fields,
    "❖  Body / Physique",
    "Pin any physical characteristic independently. Unselected characteristics are generated from the current state.",
    controls
  );
}


// =========================================
// BUILD MANUAL APPEARANCE SECTIONS
// =========================================

function buildV14ManualAppearanceSections(fields) {
  for (const group of appearanceSwitchGroups) {
    const title = `❖  Appearance • ${group.title}`;

    if (group.type === "menu") {
      v14ManualSwitchGroupSection.call(
        this,
        fields,
        title,
        group.description || "",
        group
      );
      continue;
    }

    v14ManualSwitchGroupSection.call(
      this,
      fields,
      title,
      group.description || "Optional appearance traits.",
      group
    );
  }
}


// =========================================
// BUILD MANUAL HAIR SECTION
// =========================================

function buildV14ManualHairSections(fields) {
  const hairControls = V14_MANUAL_HAIR_CONTROLS.map(
    control => buildV14ManualControl.call(this, control)
  );

  hairControls.push(
    this.textField(
      "",
      "Custom hair type",
      false,
      40
    ),
    this.textField(
      "",
      "Custom hair color",
      false,
      40
    ),
    this.textField(
      "",
      "Custom hair length",
      false,
      40
    ),
    this.textField(
      "",
      "Custom hairstyle",
      false,
      40
    ),
    this.textField(
      "",
      "Additional hair details",
      false,
      60
    )
  );

  v14ManualSection(
    fields,
    "❖  Hair",
    "Pin basic hair traits or add custom text. Hairstyle groups remain available below.",
    hairControls
  );

  for (const group of hairstyleGroups) {
    v14ManualSwitchGroupSection.call(
      this,
      fields,
      `❖  Hair • ${group.title}`,
      group.description || "Optional hairstyle selection.",
      group
    );
  }
}


// =========================================
// BUILD MANUAL ACCESSORY SECTIONS
// =========================================

function buildV14ManualAccessorySections(fields) {
  for (const group of accessoryGroups) {
    v14ManualSwitchGroupSection.call(
      this,
      fields,
      `❖  Accessories • ${group.title}`,
      group.description || "Optional accessory selection.",
      group
    );
  }
}


// =========================================
// BUILD MANUAL CLOTHING SECTIONS
// =========================================

function buildV14ManualClothingSections(fields) {
  v14ManualSection(
    fields,
    "❖  Clothing • Preset",
    "Choose one clothing preset, or leave it unselected and let the clothing compatibility engine construct the outfit.",
    [
      this.menu(
        NONE_SELECTED,
        menuWithPlaceholder(
          "Random / no clothing preset selected",
          clothingPresets
        )
      ),
      this.textField(
        "",
        "Custom outfit description",
        false,
        60
      )
    ]
  );

  for (const group of clothingGroups) {
    v14ManualSwitchGroupSection.call(
      this,
      fields,
      `❖  Clothing • ${group.title}`,
      group.description || "Optional clothing selection.",
      group
    );
  }

  v14ManualSection(
    fields,
    "❖  Clothing • Color",
    "Optional clothing color. The selected color is applied to compatible clothing selections.",
    [
      this.menu(
        NONE_SELECTED,
        menuWithPlaceholder(
          "No clothing color selected",
          clothingColorPresets
        )
      ),
      this.textField(
        "",
        "Custom clothing color / fabric",
        false,
        40
      )
    ]
  );
}


// =========================================
// BUILD MANUAL ACTION SECTIONS
// =========================================

function buildV14ManualActionSections(fields) {
  v14ManualSection(
    fields,
    "❖  Action / Pose • Preset",
    "Pin one primary action, or leave it unselected for compatibility-based randomization.",
    [
      this.menu(
        NONE_SELECTED,
        menuWithPlaceholder(
          "Random / no primary action selected",
          allActionPresets
        )
      ),
      this.textField(
        "",
        "Custom action / pose modifier",
        false,
        60
      )
    ]
  );

  for (const group of actionGroups) {
    v14ManualSwitchGroupSection.call(
      this,
      fields,
      `❖  Action / Pose • ${group.title}`,
      group.description || "Optional action or pose modifier.",
      group
    );
  }
}


// =========================================
// BUILD MANUAL SCENE SECTIONS
// =========================================

function buildV14ManualSceneSections(fields) {
  for (const control of V14_MANUAL_SCENE_CONTROLS) {
    const presets = getManualControlPresets(control.category);

    v14ManualSection(
      fields,
      `❖  Scene • ${control.label}`,
      `Pin ${control.label.toLowerCase()} or leave it unselected for compatible randomization.`,
      [
        this.menu(
          NONE_SELECTED,
          menuWithPlaceholder(
            control.placeholder,
            presets
          )
        )
      ]
    );
  }
}


// =========================================
// COMPLETE MANUAL CONTROL SCREEN
// =========================================

function requestV14ManualControls(randomizationEnabled) {
  return requestFromUser(
    "V14 Subject & Scene Controls",
    "Continue",
    function () {
      const fields = [];

      buildV14ManualIdentitySection.call(this, fields);

      buildV14ManualBodySection.call(this, fields);

      buildV14ManualAppearanceSections.call(this, fields);

      buildV14ManualHairSections.call(this, fields);

      buildV14ManualAccessorySections.call(this, fields);

      buildV14ManualClothingSections.call(this, fields);

      buildV14ManualActionSections.call(this, fields);

      buildV14ManualSceneSections.call(this, fields);

      fields.push(
        this.textField(
          "",
          "Custom prompt additions",
          false,
          100
        )
      );

      return fields;
    }
  );
}


// =========================================
// UI RESULT → PRESET OBJECT
// =========================================
//
// This is the critical boundary.
//
// The Draw Things UI gives us an integer.
// We immediately resolve that integer to the actual preset object.
//
// After this function runs, the generation system no longer cares
// what numerical position the item occupied in the menu.


function resolveV14MenuSelection(index, presets) {
  if (!Array.isArray(presets)) return null;

  const numericIndex = Number(index);

  if (!Number.isInteger(numericIndex)) {
    return null;
  }

  if (numericIndex <= NONE_SELECTED) {
    return null;
  }

  const preset = presets[numericIndex - 1];

  if (!preset) {
    return null;
  }

  return preset;
}


// =========================================
// PRESET → STABLE STATE ENTRY
// =========================================

function makeManualStateEntry(category, preset) {
  if (!preset) return null;

  return {
    category: category,
    id: getPresetId(preset),
    label: getPresetLabel(preset),
    value: getPresetValue(preset),
    manual: true
  };
}


function storeManualSelection(state, category, preset) {
  if (!state || !category || !preset) {
    return;
  }

  state[category] = makeManualStateEntry(
    category,
    preset
  );

  if (!state.manual) {
    state.manual = {};
  }

  state.manual[category] = true;
}


// =========================================
// PARSE ONE MENU INTO STATE
// =========================================

function parseV14ManualMenuSelection(
  state,
  category,
  rawIndex,
  presets
) {
  const preset = resolveV14MenuSelection(
    rawIndex,
    presets
  );

  if (!preset) {
    return null;
  }

  storeManualSelection(
    state,
    category,
    preset
  );

  return preset;
}


// =========================================
// PARSE GROUP SWITCHES
// =========================================
//
// Unlike the old V13 parser, this stores stable IDs as well as values.
//
// Multiple switches can legitimately be selected in the same group.


function parseV14ManualSwitchValues(
  state,
  category,
  rawValues,
  presets
) {
  if (!Array.isArray(rawValues)) {
    return [];
  }

  const selected = [];

  for (let i = 0; i < rawValues.length; i++) {
    if (rawValues[i] !== true) {
      continue;
    }

    const preset = presets[i];

    if (!preset) {
      continue;
    }

    selected.push(
      makeManualStateEntry(
        category,
        preset
      )
    );
  }

  if (selected.length > 0) {
    state[category] = selected;

    if (!state.manual) {
      state.manual = {};
    }

    state.manual[category] = true;
  }

  return selected;
}


// =========================================
// PARSE GROUPED V14 CONTROL
// =========================================

function parseV14ManualGroup(
  state,
  group,
  rawData
) {
  if (!group || !Array.isArray(rawData)) {
    return [];
  }

  if (group.type === "menu") {
    const category = group.category;

    const presets =
      group.presets ||
      PRESET_COLLECTIONS[category] ||
      [];

    const preset = resolveV14MenuSelection(
      rawData[0],
      presets
    );

    if (!preset) {
      return [];
    }

    storeManualSelection(
      state,
      category,
      preset
    );

    return [
      makeManualStateEntry(
        category,
        preset
      )
    ];
  }

  const presets = group.presets || [];

  return parseV14ManualSwitchValues(
    state,
    group.category || group.id || "custom",
    rawData,
    presets
  );
}


// =========================================
// MANUAL STATE METADATA
// =========================================

function markManualCategory(
  state,
  category
) {
  if (!state.manual) {
    state.manual = {};
  }

  state.manual[category] = true;
}


function isManualCategory(state, category) {
  return Boolean(
    state &&
    state.manual &&
    state.manual[category]
  );
}


function clearManualCategory(
  state,
  category
) {
  if (!state || !state.manual) {
    return;
  }

  delete state.manual[category];
}


// =========================================
// SAFE MANUAL VALUE ACCESS
// =========================================

function getManualStateValue(state, category) {
  if (!state || !state[category]) {
    return "";
  }

  const entry = state[category];

  if (Array.isArray(entry)) {
    return entry
      .map(item => getPresetValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return getPresetValue(entry);
}


function getManualStateId(state, category) {
  if (!state || !state[category]) {
    return "";
  }

  const entry = state[category];

  if (Array.isArray(entry)) {
    return entry
      .map(item => getPresetId(item))
      .filter(Boolean);
  }

  return getPresetId(entry);
}


// =========================================
// APPLY MANUAL SELECTIONS TO GENERATION STATE
// =========================================
//
// This function intentionally does NOT randomize anything.
//
// It only establishes the starting state.
//
// The later compatibility engine sees these selections and uses
// them as constraints for everything generated afterward.


function applyV14ManualSelections(
  state,
  selections
) {
  if (!state || !selections) {
    return state;
  }

  for (const category of Object.keys(selections)) {
    const selection = selections[category];

    if (
      selection === null ||
      selection === undefined ||
      selection === ""
    ) {
      continue;
    }

    if (Array.isArray(selection)) {
      if (selection.length === 0) {
        continue;
      }

      state[category] = selection;

      markManualCategory(
        state,
        category
      );

      continue;
    }

    state[category] = selection;

    markManualCategory(
      state,
      category
    );
  }

  return state;
}


// =========================================
// PARSE MANUAL SCREEN
// =========================================
//
// The parser uses the control definitions rather than relying on
// arbitrary array positions wherever possible.
//
// The ONLY positional knowledge here is the order of controls
// actually constructed by requestV14ManualControls().
//
// Once parsed, all generation decisions use stable IDs.


function parseV14ManualControlScreen(
  rawSections,
  randomizationEnabled
) {
  const state = createGenerationState();

  if (!Array.isArray(rawSections)) {
    return state;
  }

  let cursor = 0;

  function nextSectionSafe() {
    if (cursor >= rawSections.length) {
      return [];
    }

    const value = rawSections[cursor];
    cursor++;

    return Array.isArray(value)
      ? value
      : [];
  }

  // -----------------------------------------
  // IDENTITY
  // -----------------------------------------

  const identityData = nextSectionSafe();

  for (
    let i = 0;
    i < V14_MANUAL_IDENTITY_CONTROLS.length;
    i++
  ) {
    const control =
      V14_MANUAL_IDENTITY_CONTROLS[i];

    const presets =
      getManualControlPresets(
        control.category
      );

    parseV14ManualMenuSelection(
      state,
      control.category,
      identityData[i],
      presets
    );
  }


  // -----------------------------------------
  // BODY
  // -----------------------------------------

  const bodyData = nextSectionSafe();

  for (
    let i = 0;
    i < V14_MANUAL_BODY_CONTROLS.length;
    i++
  ) {
    const control =
      V14_MANUAL_BODY_CONTROLS[i];

    const presets =
      getManualControlPresets(
        control.category
      );

    parseV14ManualMenuSelection(
      state,
      control.category,
      bodyData[i],
      presets
    );
  }

  const customBodyDetails =
    typeof bodyData[V14_MANUAL_BODY_CONTROLS.length] === "string"
      ? bodyData[V14_MANUAL_BODY_CONTROLS.length].trim()
      : "";

  if (customBodyDetails) {
    state.custom.bodyDetails =
      customBodyDetails;
  }


  // -----------------------------------------
  // APPEARANCE GROUPS
  // -----------------------------------------

  for (const group of appearanceSwitchGroups) {
    const rawGroup = nextSectionSafe();

    parseV14ManualGroup(
      state,
      group,
      rawGroup
    );
  }


  // -----------------------------------------
  // HAIR BASIC CONTROLS
  // -----------------------------------------

  const hairData = nextSectionSafe();

  let hairCursor = 0;

  for (
    const control of V14_MANUAL_HAIR_CONTROLS
  ) {
    const presets =
      getManualControlPresets(
        control.category
      );

    parseV14ManualMenuSelection(
      state,
      control.category,
      hairData[hairCursor],
      presets
    );

    hairCursor++;
  }

  const customHairType =
    typeof hairData[hairCursor] === "string"
      ? hairData[hairCursor].trim()
      : "";

  hairCursor++;

  const customHairColor =
    typeof hairData[hairCursor] === "string"
      ? hairData[hairCursor].trim()
      : "";

  hairCursor++;

  const customHairLength =
    typeof hairData[hairCursor] === "string"
      ? hairData[hairCursor].trim()
      : "";

  hairCursor++;

  const customHairstyle =
    typeof hairData[hairCursor] === "string"
      ? hairData[hairCursor].trim()
      : "";

  hairCursor++;

  const additionalHairDetails =
    typeof hairData[hairCursor] === "string"
      ? hairData[hairCursor].trim()
      : "";

  if (
    customHairType ||
    customHairColor ||
    customHairLength ||
    customHairstyle ||
    additionalHairDetails
  ) {
    state.custom.hair = {
      type: customHairType,
      color: customHairColor,
      length: customHairLength,
      hairstyle: customHairstyle,
      details: additionalHairDetails
    };
  }


  // -----------------------------------------
  // HAIRSTYLE GROUPS
  // -----------------------------------------

  for (const group of hairstyleGroups) {
    const rawGroup = nextSectionSafe();

    parseV14ManualGroup(
      state,
      group,
      rawGroup
    );
  }


  // -----------------------------------------
  // ACCESSORIES
  // -----------------------------------------

  for (const group of accessoryGroups) {
    const rawGroup = nextSectionSafe();

    parseV14ManualGroup(
      state,
      group,
      rawGroup
    );
  }


  // -----------------------------------------
  // CLOTHING PRESET
  // -----------------------------------------

  const clothingPresetData =
    nextSectionSafe();

  const clothingPreset =
    resolveV14MenuSelection(
      clothingPresetData[0],
      clothingPresets
    );

  if (clothingPreset) {
    storeManualSelection(
      state,
      "clothing",
      clothingPreset
    );
  }

  const customOutfit =
    typeof clothingPresetData[1] === "string"
      ? clothingPresetData[1].trim()
      : "";

  if (customOutfit) {
    state.custom.clothing =
      customOutfit;
  }


  // -----------------------------------------
  // CLOTHING GROUPS
  // -----------------------------------------

  for (const group of clothingGroups) {
    const rawGroup = nextSectionSafe();

    parseV14ManualGroup(
      state,
      group,
      rawGroup
    );
  }


  // -----------------------------------------
  // CLOTHING COLOR
  // -----------------------------------------

  const clothingColorData =
    nextSectionSafe();

  const selectedColor =
    resolveV14MenuSelection(
      clothingColorData[0],
      clothingColorPresets
    );

  const customColor =
    typeof clothingColorData[1] === "string"
      ? clothingColorData[1].trim()
      : "";

  if (selectedColor || customColor) {
    state.custom.clothingColor =
      customColor ||
      getPresetValue(selectedColor);
  }


  // -----------------------------------------
  // PRIMARY ACTION
  // -----------------------------------------

  const actionData =
    nextSectionSafe();

  const actionPreset =
    resolveV14MenuSelection(
      actionData[0],
      allActionPresets
    );

  if (actionPreset) {
    storeManualSelection(
      state,
      "action",
      actionPreset
    );
  }

  const customAction =
    typeof actionData[1] === "string"
      ? actionData[1].trim()
      : "";

  if (customAction) {
    state.custom.action =
      customAction;
  }


  // -----------------------------------------
  // ACTION GROUPS
  // -----------------------------------------

  for (const group of actionGroups) {
    const rawGroup = nextSectionSafe();

    parseV14ManualGroup(
      state,
      group,
      rawGroup
    );
  }


  // -----------------------------------------
  // SCENE
  // -----------------------------------------

  for (
    const control of V14_MANUAL_SCENE_CONTROLS
  ) {
    const rawData =
      nextSectionSafe();

    const presets =
      getManualControlPresets(
        control.category
      );

    parseV14ManualMenuSelection(
      state,
      control.category,
      rawData[0],
      presets
    );
  }


  // -----------------------------------------
  // CUSTOM PROMPT
  // -----------------------------------------

  const customData =
    nextSectionSafe();

  const customPrompt =
    typeof customData[0] === "string"
      ? customData[0].trim()
      : "";

  if (customPrompt) {
    state.custom.prompt =
      customPrompt;
  }


  // -----------------------------------------
  // DERIVED IDENTITY STATE
  // -----------------------------------------

  if (state.gender) {
    const genderValue =
      getManualStateValue(
        state,
        "gender"
      );

    state.genderForm =
      getGenderForm(
        genderValue
      );
  }

  if (state.nationality) {
    const nationalityPreset =
      getPresetById(
        "nationality",
        getManualStateId(
          state,
          "nationality"
        )
      );

    if (nationalityPreset) {
      state.nationalityProfile = {
        id:
          nationalityPreset.profile ||
          "",
        value:
          nationalityPreset.profile ||
          ""
      };
    }
  }


  // -----------------------------------------
  // FINALIZE MANUAL FLAGS
  // -----------------------------------------

  state.manualRandomization =
    Boolean(randomizationEnabled);

  return state;
}


// =========================================
// MANUAL STATE SUMMARY
// =========================================

function summarizeV14ManualSelections(state) {
  const lines = [];

  if (!state || !state.manual) {
    return lines;
  }

  for (const category of Object.keys(state.manual)) {
    if (!state.manual[category]) {
      continue;
    }

    const id =
      getManualStateId(
        state,
        category
      );

    const value =
      getManualStateValue(
        state,
        category
      );

    lines.push(
      `${category}: ${id || value}`
    );
  }

  return lines;
}


// =========================================
// MANUAL COMPATIBILITY CHECK
// =========================================
//
// Manual choices are NOT automatically changed.
//
// If the user explicitly selected something that conflicts with
// another manual selection, we report the conflict.
//
// The later repair engine may resolve only genuinely impossible
// combinations when necessary, but it must never silently treat
// a manual choice as random.


function getV14ManualCompatibilityProblems(state) {
  const problems = [];

  if (!state) {
    return problems;
  }

  for (const category of Object.keys(state.manual || {})) {
    if (!state.manual[category]) {
      continue;
    }

    const entry = state[category];

    if (Array.isArray(entry)) {
      for (const item of entry) {
        const result =
          describeOptionRelationship(
            category,
            item,
            state
          );

        if (
          result &&
          result.blocked
        ) {
          problems.push({
            category,
            id: getPresetId(item),
            message:
              result.message ||
              `${category} selection is incompatible with the current state.`
          });
        }
      }

      continue;
    }

    if (!entry) {
      continue;
    }

    const result =
      describeOptionRelationship(
        category,
        entry,
        state
      );

    if (
      result &&
      result.blocked
    ) {
      problems.push({
        category,
        id: getPresetId(entry),
        message:
          result.message ||
          `${category} selection is incompatible with the current state.`
      });
    }
  }

  return problems;
}


// =========================================
// MANUAL STATE DEBUG
// =========================================

function describeV14ManualState(state) {
  return {
    manualCategories:
      Object.keys(state.manual || {})
        .filter(
          category =>
            state.manual[category]
        ),

    selections:
      summarizeV14ManualSelections(
        state
      ),

    compatibilityProblems:
      getV14ManualCompatibilityProblems(
        state
      ),

    custom:
      state.custom
        ? JSON.parse(
          JSON.stringify(
            state.custom
          )
        )
        : {}
  };
}
// =========================================
// V14 — CHUNK 21
// MANUAL-SAFE GENERATION PIPELINE
// =========================================
//
// This chunk is the bridge between:
//
//     MANUAL UI
//          ↓
//     GENERATION STATE
//          ↓
//     COMPATIBILITY ENGINE
//          ↓
//     RANDOMIZATION
//
// The fundamental rule:
//
//     MANUAL > COMPATIBILITY > RANDOMNESS
//
// A manual selection is a constraint.
//
// The randomizer must work around it rather than replace it.
// =========================================


// =========================================
// CATEGORY RANDOMIZATION FLAGS
// =========================================
//
// These are the categories that can be independently randomized.
//
// If a category is disabled:
//     - a manual selection remains untouched
//     - no random value is generated for that category
//
// If a category is enabled:
//     - an existing manual selection is preserved
//     - otherwise a compatible random value may be selected


const V14_RANDOMIZATION_CATEGORIES = [
  "gender",
  "nationality",
  "age",

  "skin",
  "eyes",

  "overallBuild",
  "height",
  "chest",
  "hips",
  "lips",
  "eyelashes",
  "bodyShape",
  "legs",
  "buttocks",
  "belly",
  "specificBody",

  "makeup",
  "makeupOddities",
  "facialHair",
  "tattoos",
  "bodyDetails",
  "nails",
  "hairDetails",
  "nose",

  "hairColor",
  "hairLength",
  "hairType",
  "hairstyles",

  "accessories",

  "clothing",
  "clothingGroups",

  "action",
  "actionGroups",

  "camera",
  "lighting",
  "timeOfDay",
  "artStyle"
];


// =========================================
// GENERATION FLAG LOOKUP
// =========================================

function isRandomizationCategoryEnabled(
  config,
  category
) {
  if (!config) {
    return true;
  }

  // Explicit category map takes priority.
  if (
    config.randomizeCategories &&
    Object.prototype.hasOwnProperty.call(
      config.randomizeCategories,
      category
    )
  ) {
    return Boolean(
      config.randomizeCategories[category]
    );
  }

  // Support the individual V14 config flags.
  if (
    Object.prototype.hasOwnProperty.call(
      config,
      `randomize${category}`
    )
  ) {
    return Boolean(
      config[`randomize${category}`]
    );
  }

  // Identity group.
  if (
    [
      "gender",
      "nationality",
      "age"
    ].includes(category) &&
    config.randomizeIdentity !== undefined
  ) {
    return Boolean(
      config.randomizeIdentity
    );
  }

  // Body group.
  if (
    [
      "skin",
      "eyes",
      "overallBuild",
      "height",
      "chest",
      "hips",
      "lips",
      "eyelashes",
      "bodyShape",
      "legs",
      "buttocks",
      "belly",
      "specificBody"
    ].includes(category) &&
    config.randomizeBody !== undefined
  ) {
    return Boolean(
      config.randomizeBody
    );
  }

  // Appearance group.
  if (
    [
      "makeup",
      "makeupOddities",
      "facialHair",
      "tattoos",
      "bodyDetails",
      "nails",
      "hairDetails",
      "nose"
    ].includes(category) &&
    config.randomizeAppearance !== undefined
  ) {
    return Boolean(
      config.randomizeAppearance
    );
  }

  // Hair group.
  if (
    [
      "hairColor",
      "hairLength",
      "hairType",
      "hairstyles"
    ].includes(category) &&
    config.randomizeHair !== undefined
  ) {
    return Boolean(
      config.randomizeHair
    );
  }

  // Accessories.
  if (
    category === "accessories" &&
    config.randomizeAccessories !== undefined
  ) {
    return Boolean(
      config.randomizeAccessories
    );
  }

  // Clothing.
  if (
    [
      "clothing",
      "clothingGroups"
    ].includes(category) &&
    config.randomizeClothing !== undefined
  ) {
    return Boolean(
      config.randomizeClothing
    );
  }

  // Action.
  if (
    [
      "action",
      "actionGroups"
    ].includes(category) &&
    config.randomizeAction !== undefined
  ) {
    return Boolean(
      config.randomizeAction
    );
  }

  // Scene.
  if (
    [
      "camera",
      "lighting",
      "timeOfDay",
      "artStyle"
    ].includes(category) &&
    config.randomizeScene !== undefined
  ) {
    return Boolean(
      config.randomizeScene
    );
  }

  return true;
}


// =========================================
// MANUAL SELECTION TEST
// =========================================

function hasManualSelection(
  state,
  category
) {
  return Boolean(
    state &&
    state.manual &&
    state.manual[category]
  );
}


// =========================================
// SHOULD RANDOMIZE ONE CATEGORY?
// =========================================
//
// Manual selections always short-circuit randomness.
//
// This is deliberately centralized so individual randomizers don't
// each invent their own interpretation of "manual."


function shouldRandomizeCategory(
  state,
  config,
  category
) {
  if (
    hasManualSelection(
      state,
      category
    )
  ) {
    return false;
  }

  return isRandomizationCategoryEnabled(
    config,
    category
  );
}


// =========================================
// PRESERVE MANUAL STATE
// =========================================

function preserveManualState(
  targetState,
  sourceState
) {
  if (!targetState || !sourceState) {
    return targetState;
  }

  if (!sourceState.manual) {
    return targetState;
  }

  for (
    const category of Object.keys(
      sourceState.manual
    )
  ) {
    if (
      !sourceState.manual[category]
    ) {
      continue;
    }

    if (
      sourceState[category] === undefined
    ) {
      continue;
    }

    targetState[category] =
      sourceState[category];

    if (!targetState.manual) {
      targetState.manual = {};
    }

    targetState.manual[category] = true;
  }

  return targetState;
}


// =========================================
// IDENTITY — MANUAL SAFE
// =========================================

function randomizeIdentityManualSafe(
  state,
  config
) {
  // -----------------------------
  // Gender
  // -----------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "gender"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "gender",
      genderPresets,
      config
    );
  }

  // -----------------------------
  // Nationality
  // -----------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "nationality"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "nationality",
      nationalityPresets,
      config
    );
  }

  // -----------------------------
  // Age
  // -----------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "age"
    )
  ) {
    chooseAndStoreRandomPreset(
      state,
      "age",
      agePresets,
      config
    );
  }

  // -----------------------------------------
  // Derived gender state
  // -----------------------------------------

  if (state.gender) {
    state.genderForm =
      getGenderForm(
        getStateValue(
          state,
          "gender"
        )
      );
  }

  // -----------------------------------------
  // Derived nationality profile
  // -----------------------------------------

  if (state.nationality) {
    const nationality =
      getPresetById(
        "nationality",
        getStateId(
          state,
          "nationality"
        )
      );

    if (nationality) {
      state.nationalityProfile = {
        id:
          nationality.profile || "",
        value:
          nationality.profile || ""
      };
    }
  }

  return state;
}


// =========================================
// BODY — MANUAL SAFE
// =========================================

function randomizeBodyManualSafe(
  state,
  config
) {
  const bodyCollections = [
    ["skin", skinTonePresets],
    ["eyes", eyeColorPresets],
    ["overallBuild", overallBuildPresets],
    ["height", heightPresets],
    ["chest", chestPresets],
    ["hips", hipsPresets],
    ["lips", lipsPresets],
    ["eyelashes", eyelashPresets],
    ["bodyShape", bodyShapePresets],
    ["legs", legPresets],
    ["buttocks", buttockPresets],
    ["belly", bellyPresets],
    ["specificBody", specificBodyPresets]
  ];

  for (
    const [category, presets]
    of bodyCollections
  ) {
    if (
      !shouldRandomizeCategory(
        state,
        config,
        category
      )
    ) {
      continue;
    }

    chooseAndStoreRandomPreset(
      state,
      category,
      presets,
      config
    );
  }

  return state;
}


// =========================================
// APPEARANCE — MANUAL SAFE
// =========================================

function randomizeAppearanceManualSafe(
  state,
  config
) {
  const appearanceCollections = [
    ["makeup", makeupPresets],
    ["makeupOddities", makeupOdditiesPresets],
    ["facialHair", facialHairPresets],
    ["tattoos", tattooPresets],
    ["bodyDetails", bodyDetailPresets],
    ["nails", nailPresets],
    ["hairDetails", hairDetailPresets],
    ["nose", nosePresets]
  ];

  for (
    const [category, presets]
    of appearanceCollections
  ) {
    if (
      !shouldRandomizeCategory(
        state,
        config,
        category
      )
    ) {
      continue;
    }

    chooseAndStoreRandomPreset(
      state,
      category,
      presets,
      config
    );
  }

  return state;
}


// =========================================
// HAIR — MANUAL SAFE
// =========================================

function randomizeHairManualSafe(
  state,
  config
) {
  const hairCollections = [
    ["hairColor", hairColorPresets],
    ["hairLength", hairLengthPresets],
    ["hairType", hairTypePresets]
  ];

  for (
    const [category, presets]
    of hairCollections
  ) {
    if (
      !shouldRandomizeCategory(
        state,
        config,
        category
      )
    ) {
      continue;
    }

    chooseAndStoreRandomPreset(
      state,
      category,
      presets,
      config
    );
  }

  // -----------------------------------------
  // Hairstyle
  // -----------------------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "hairstyles"
    )
  ) {
    const hairstyleChance =
      state.genderForm === "feminine"
        ? 0.60
        : 0.60;

    if (
      randomChance(
        hairstyleChance
      )
    ) {
      const hairstyle =
        chooseRandomPreset(
          "hairstyles",
          hairstylePresets,
          state,
          config
        );

      if (hairstyle) {
        state.hairstyles =
          makeStatePreset(
            hairstyle
          );
      }
    }
  }

  return state;
}


// =========================================
// STATE PRESET CONVERTER
// =========================================
//
// Some older helper functions expect plain preset objects.
// The state itself needs the metadata wrapper.


function makeStatePreset(preset) {
  if (!preset) {
    return null;
  }

  return {
    id: getPresetId(preset),
    label: getPresetLabel(preset),
    value: getPresetValue(preset)
  };
}


// =========================================
// ACCESSORIES — MANUAL SAFE
// =========================================

function randomizeAccessoriesManualSafe(
  state,
  config
) {
  if (
    !shouldRandomizeCategory(
      state,
      config,
      "accessories"
    )
  ) {
    return state;
  }

  // Never retain an old generated accessory set
  // when beginning a fresh randomized state.
  //
  // Manual accessories, however, are preserved.
  if (!hasManualSelection(
    state,
    "accessories"
  )) {
    state.accessories = [];
  }

  for (
    const group of accessoryGroups
  ) {
    const groupChance =
      getAccessoryGroupChance(
        group
      );

    if (
      !randomChance(
        groupChance
      )
    ) {
      continue;
    }

    const presets =
      group.presets || [];

    if (
      presets.length === 0
    ) {
      continue;
    }

    const selected =
      chooseRandomPreset(
        group.category ||
        group.id,
        presets,
        state,
        config
      );

    if (!selected) {
      continue;
    }

    // Avoid duplicate accessory IDs.
    const selectedId =
      getPresetId(selected);

    const alreadySelected =
      (state.accessories || [])
        .some(
          accessory =>
            getPresetId(
              accessory
            ) === selectedId
        );

    if (alreadySelected) {
      continue;
    }

    state.accessories.push(
      makeStatePreset(
        selected
      )
    );
  }

  return state;
}


// =========================================
// FIND MANUAL CLOTHING
// =========================================

function getManualClothingSelection(
  state
) {
  if (
    !hasManualSelection(
      state,
      "clothing"
    )
  ) {
    return null;
  }

  const clothing =
    state.clothing;

  if (!clothing) {
    return null;
  }

  if (Array.isArray(clothing)) {
    return clothing.length > 0
      ? clothing
      : null;
  }

  return clothing;
}


// =========================================
// CLOTHING — MANUAL SAFE
// =========================================
//
// There are two different manual clothing cases:
//
// 1. A specific clothing item was selected.
//    → Keep it.
//
// 2. Clothing group switches were manually selected.
//    → Build the outfit only from those groups.
//
// If neither is manually selected:
//    → normal compatibility-driven outfit generation.


function randomizeClothingManualSafe(
  state,
  config
) {
  const manualClothing =
    getManualClothingSelection(
      state
    );

  const manualGroups =
    hasManualSelection(
      state,
      "clothingGroups"
    );

  // -----------------------------------------
  // Specific clothing item manually selected
  // -----------------------------------------

  if (manualClothing) {
    if (
      Array.isArray(
        manualClothing
      )
    ) {
      state.clothing =
        manualClothing;
    } else {
      state.clothing = [
        manualClothing
      ];
    }

    syncClothingGroupsFromItems(
      state
    );

    return state;
  }

  // -----------------------------------------
  // Specific clothing group(s) manually selected
  // -----------------------------------------

  if (manualGroups) {
    const selectedGroups =
      Array.isArray(
        state.clothingGroups
      )
        ? state.clothingGroups
        : [];

    const generatedItems = [];

    for (
      const groupEntry
      of selectedGroups
    ) {
      const group =
        findClothingGroup(
          getPresetId(
            groupEntry
          )
        );

      if (!group) {
        continue;
      }

      const presets =
        group.presets || [];

      if (
        presets.length === 0
      ) {
        continue;
      }

      const item =
        chooseRandomPreset(
          "clothing",
          presets,
          state,
          config
        );

      if (item) {
        generatedItems.push(
          makeStatePreset(
            item
          )
        );
      }
    }

    state.clothing =
      generatedItems;

    syncClothingGroupsFromItems(
      state
    );

    return state;
  }

  // -----------------------------------------
  // Clothing randomization disabled
  // -----------------------------------------

  if (
    !isRandomizationCategoryEnabled(
      config,
      "clothing"
    )
  ) {
    return state;
  }

  // -----------------------------------------
  // Normal compatibility-driven outfit
  // -----------------------------------------

  return randomizeClothing(
    state,
    config
  );
}


// =========================================
// ACTION — MANUAL SAFE
// =========================================

function randomizeActionManualSafe(
  state,
  config
) {
  if (
    !shouldRandomizeCategory(
      state,
      config,
      "action"
    )
  ) {
    return state;
  }

  return randomizeAction(
    state,
    config
  );
}


// =========================================
// SCENE — MANUAL SAFE
// =========================================

function randomizeSceneManualSafe(
  state,
  config
) {
  // -----------------------------------------
  // Camera
  // -----------------------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "camera"
    )
  ) {
    randomizeCamera(
      state,
      config
    );
  }

  // -----------------------------------------
  // Lighting
  // -----------------------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "lighting"
    )
  ) {
    randomizeLighting(
      state,
      config
    );
  }

  // -----------------------------------------
  // Time
  // -----------------------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "timeOfDay"
    )
  ) {
    randomizeTimeOfDay(
      state,
      config
    );
  }

  // -----------------------------------------
  // Art style
  // -----------------------------------------

  if (
    shouldRandomizeCategory(
      state,
      config,
      "artStyle"
    )
  ) {
    randomizeArtStyle(
      state,
      config
    );
  }

  return state;
}


// =========================================
// RE-ESTABLISH DERIVED IDENTITY
// =========================================
//
// Derived values must be recalculated AFTER manual selections
// and BEFORE compatibility-dependent randomization.


function refreshV14IdentityState(state) {
  if (!state) {
    return state;
  }

  if (state.gender) {
    state.genderForm =
      getGenderForm(
        getStateValue(
          state,
          "gender"
        )
      );
  }

  if (state.nationality) {
    const nationality =
      getPresetById(
        "nationality",
        getStateId(
          state,
          "nationality"
        )
      );

    if (nationality) {
      state.nationalityProfile = {
        id:
          nationality.profile || "",
        value:
          nationality.profile || ""
      };
    }
  }

  return state;
}


// =========================================
// BUILD RANDOMIZATION CONFIG
// =========================================
//
// Normalize the different config formats that have existed during
// V14 development into one predictable map.


function normalizeV14RandomizationConfig(
  config
) {
  const normalized = {
    ...(config || {})
  };

  if (
    !normalized.randomizeCategories
  ) {
    normalized.randomizeCategories = {};
  }

  // Identity.
  const identityEnabled =
    normalized.randomizeIdentity !== false;

  for (
    const category of [
      "gender",
      "nationality",
      "age"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = identityEnabled;
    }
  }

  // Body.
  const bodyEnabled =
    normalized.randomizeBody !== false;

  for (
    const category of [
      "skin",
      "eyes",
      "overallBuild",
      "height",
      "chest",
      "hips",
      "lips",
      "eyelashes",
      "bodyShape",
      "legs",
      "buttocks",
      "belly",
      "specificBody"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = bodyEnabled;
    }
  }

  // Appearance.
  const appearanceEnabled =
    normalized.randomizeAppearance !== false;

  for (
    const category of [
      "makeup",
      "makeupOddities",
      "facialHair",
      "tattoos",
      "bodyDetails",
      "nails",
      "hairDetails",
      "nose"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = appearanceEnabled;
    }
  }

  // Hair.
  const hairEnabled =
    normalized.randomizeHair !== false;

  for (
    const category of [
      "hairColor",
      "hairLength",
      "hairType",
      "hairstyles"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = hairEnabled;
    }
  }

  // Accessories.
  if (
    normalized.randomizeCategories[
    "accessories"
    ] === undefined
  ) {
    normalized.randomizeCategories[
      "accessories"
    ] =
      normalized.randomizeAccessories !== false;
  }

  // Clothing.
  const clothingEnabled =
    normalized.randomizeClothing !== false;

  for (
    const category of [
      "clothing",
      "clothingGroups"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = clothingEnabled;
    }
  }

  // Action.
  const actionEnabled =
    normalized.randomizeAction !== false;

  for (
    const category of [
      "action",
      "actionGroups"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = actionEnabled;
    }
  }

  // Scene.
  const sceneEnabled =
    normalized.randomizeScene !== false;

  for (
    const category of [
      "camera",
      "lighting",
      "timeOfDay",
      "artStyle"
    ]
  ) {
    if (
      normalized.randomizeCategories[
      category
      ] === undefined
    ) {
      normalized.randomizeCategories[
        category
      ] = sceneEnabled;
    }
  }

  return normalized;
}


// =========================================
// SINGLE STATE GENERATOR
// =========================================

function generateV14StateManualSafe(
  manualState,
  config
) {
  const normalizedConfig =
    normalizeV14RandomizationConfig(
      config
    );

  // Start from a fresh state.
  const state =
    createGenerationState();

  // -----------------------------------------
  // Apply manual selections FIRST.
  // -----------------------------------------

  preserveManualState(
    state,
    manualState
  );

  // Also copy custom fields.
  if (
    manualState &&
    manualState.custom
  ) {
    state.custom =
      JSON.parse(
        JSON.stringify(
          manualState.custom
        )
      );
  }

  // -----------------------------------------
  // Identity MUST happen first.
  // -----------------------------------------
  //
  // Everything after this point can use:
  //
  //     state.gender
  //     state.genderForm
  //     state.nationality
  //     state.nationalityProfile
  //     state.age
  //
  // as compatibility inputs.

  randomizeIdentityManualSafe(
    state,
    normalizedConfig
  );

  refreshV14IdentityState(
    state
  );


  // -----------------------------------------
  // Body
  // -----------------------------------------

  randomizeBodyManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Appearance
  // -----------------------------------------

  randomizeAppearanceManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Hair
  // -----------------------------------------

  randomizeHairManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Accessories
  // -----------------------------------------

  randomizeAccessoriesManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Clothing
  // -----------------------------------------
  //
  // Clothing is deliberately AFTER body and appearance.
  //
  // This allows future clothing metadata to respond to:
  //     gender
  //     body shape
  //     age
  //     specific body
  //     accessories
  //     etc.

  randomizeClothingManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Action
  // -----------------------------------------

  randomizeActionManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Scene
  // -----------------------------------------

  randomizeSceneManualSafe(
    state,
    normalizedConfig
  );


  // -----------------------------------------
  // Derived state
  // -----------------------------------------

  refreshV14IdentityState(
    state
  );

  synchronizeGenerationState(
    state
  );

  return state;
}


// =========================================
// BATCH GENERATION
// =========================================

function generateV14StatesManualSafe(
  manualState,
  config,
  count
) {
  const requestedCount =
    Math.max(
      1,
      Number(count) || 1
    );

  const results = [];

  for (
    let i = 0;
    i < requestedCount;
    i++
  ) {
    results.push(
      generateV14StateManualSafe(
        manualState,
        config
      )
    );
  }

  return results;
}


// =========================================
// UNIQUE BATCH GENERATION
// =========================================
//
// Uniqueness is based on the actual generated state rather than
// array positions.


function getV14StateIdentityKey(state) {
  if (!state) {
    return "";
  }

  const categories = [
    "gender",
    "nationality",
    "age",
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "bodyShape",
    "hairColor",
    "hairLength",
    "hairType",
    "hairstyles",
    "clothing",
    "action",
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  const parts = [];

  for (
    const category of categories
  ) {
    const value =
      state[category];

    if (Array.isArray(value)) {
      parts.push(
        `${category}:${value
          .map(
            item =>
              getPresetId(item) ||
              getPresetValue(item)
          )
          .sort()
          .join("|")}`
      );

      continue;
    }

    parts.push(
      `${category}:${getPresetId(value) || getPresetValue(value)}`
    );
  }

  return parts.join(";");
}


function generateV14UniqueStates(
  manualState,
  config,
  count,
  maxAttempts
) {
  const requestedCount =
    Math.max(
      1,
      Number(count) || 1
    );

  const attemptsLimit =
    Math.max(
      requestedCount * 10,
      Number(maxAttempts) || requestedCount * 20
    );

  const results = [];
  const seen = new Set();

  let attempts = 0;

  while (
    results.length < requestedCount &&
    attempts < attemptsLimit
  ) {
    attempts++;

    const state =
      generateV14StateManualSafe(
        manualState,
        config
      );

    const key =
      getV14StateIdentityKey(
        state
      );

    if (
      !key ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    results.push(state);
  }

  return results;
}


// =========================================
// MANUAL CONFIGURATION OBJECT
// =========================================

function createV14ManualGenerationConfig(
  uiConfig
) {
  const config =
    normalizeV14RandomizationConfig(
      uiConfig || {}
    );

  return {
    ...config,

    randomizationMode:
      config.randomizationMode ||
      "compatible",

    preserveManualSelections: true,

    useProfileWeights:
      config.useProfileWeights !== false,

    preferredMultiplier:
      Number(
        config.preferredMultiplier
      ) || 4,

    discouragedMultiplier:
      Number(
        config.discouragedMultiplier
      ) || 0.2
  };
}


// =========================================
// COMPLETE MANUAL → GENERATION FLOW
// =========================================

function generateV14FromManualConfiguration(
  rawManualSections,
  uiConfig,
  count
) {
  const config =
    createV14ManualGenerationConfig(
      uiConfig
    );

  const manualState =
    parseV14ManualControlScreen(
      rawManualSections,
      config.randomizationMode !== "off"
    );

  const states =
    generateV14UniqueStates(
      manualState,
      config,
      count || 1,
      config.maxAttempts
    );

  return {
    config,
    manualState,
    states,
    manualSummary:
      describeV14ManualState(
        manualState
      )
  };
}


// =========================================
// DEBUG: SHOW WHAT THE ENGINE WILL DO
// =========================================

function explainV14GenerationDecision(
  state,
  config
) {
  const normalizedConfig =
    normalizeV14RandomizationConfig(
      config
    );

  const decisions = {};

  for (
    const category
    of V14_RANDOMIZATION_CATEGORIES
  ) {
    decisions[category] = {
      manual:
        hasManualSelection(
          state,
          category
        ),

      randomizationEnabled:
        isRandomizationCategoryEnabled(
          normalizedConfig,
          category
        ),

      action:
        hasManualSelection(
          state,
          category
        )
          ? "preserve manual selection"
          : isRandomizationCategoryEnabled(
            normalizedConfig,
            category
          )
            ? "randomize"
            : "leave unchanged"
    };
  }

  return decisions;
}


// =========================================
// V14 MANUAL-SAFE PIPELINE OBJECT
// =========================================

const V14_MANUAL_SAFE_PIPELINE = {
  parse:
    parseV14ManualControlScreen,

  generate:
    generateV14StateManualSafe,

  generateBatch:
    generateV14StatesManualSafe,

  generateUnique:
    generateV14UniqueStates,

  generateFromConfiguration:
    generateV14FromManualConfiguration,

  explain:
    explainV14GenerationDecision
};
// =========================================
// V14 — CHUNK 22
// RELATIONSHIP ENGINE REWRITE
// =========================================
//
// Relationship priority:
//
//     BLOCKED
//     REQUIRED
//     PREFERRED
//     NEUTRAL
//     DISCOURAGED
//
// The engine evaluates ALL applicable metadata.
//
// Rules accumulate.
// They do not overwrite one another.
//
// This allows a preset to have relationships with:
//     gender
//     nationality/profile
//     age
//     body shape
//     other clothing
//     action
//     camera
//     lighting
//     time of day
//     art style
//
// =========================================


// =========================================
// RELATIONSHIP WEIGHTS
// =========================================

const V14_RELATIONSHIP_MULTIPLIERS = {
  blocked: 0,
  required: 100,
  preferred: 4,
  neutral: 1,
  discouraged: 0.2
};


// =========================================
// CONDITION CONTAINERS
// =========================================
//
// A rule can use:
//
//     when
//     requiredWhen
//     preferredWhen
//     neutralWhen
//     discouragedWhen
//     blockedWhen
//
// Each condition may contain one or more categories.
//
// Example:
//
// {
//     when: {
//         gender: "man"
//     }
// }
//
// Or:
//
// {
//     when: {
//         gender: ["woman", "man"],
//         bodyShape: "hourglass"
//     }
// }
//
// =========================================


// =========================================
// NORMALIZE CONDITION VALUE
// =========================================

function v14NormalizeRelationshipValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    if (value.id) {
      return String(
        value.id
      );
    }

    if (value.value) {
      return String(
        value.value
      );
    }

    if (value.label) {
      return String(
        value.label
      );
    }
  }

  return String(value);
}


// =========================================
// EXTRACT STATE VALUES
// =========================================

function v14GetStateCategoryValues(
  state,
  category
) {
  if (!state) {
    return [];
  }

  const value =
    state[category];

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(
        item =>
          v14NormalizeRelationshipValue(
            item
          )
      )
      .filter(Boolean);
  }

  return [
    v14NormalizeRelationshipValue(
      value
    )
  ].filter(Boolean);
}


// =========================================
// VALUE MATCHING
// =========================================

function v14RelationshipValueMatches(
  stateValue,
  conditionValue
) {
  const actual =
    v14NormalizeRelationshipValue(
      stateValue
    );

  if (
    Array.isArray(
      conditionValue
    )
  ) {
    return conditionValue.some(
      value =>
        v14RelationshipValueMatches(
          actual,
          value
        )
    );
  }

  const expected =
    v14NormalizeRelationshipValue(
      conditionValue
    );

  if (!expected) {
    return false;
  }

  // Exact stable ID.
  if (
    actual === expected
  ) {
    return true;
  }

  // Case-insensitive comparison.
  if (
    actual.toLowerCase() ===
    expected.toLowerCase()
  ) {
    return true;
  }

  return false;
}


// =========================================
// CATEGORY CONDITION MATCHING
// =========================================

function v14RelationshipCategoryMatches(
  state,
  category,
  expected
) {
  const actualValues =
    v14GetStateCategoryValues(
      state,
      category
    );

  if (
    actualValues.length === 0
  ) {
    return false;
  }

  return actualValues.some(
    actual =>
      v14RelationshipValueMatches(
        actual,
        expected
      )
  );
}


// =========================================
// OBJECT CONDITION MATCHING
// =========================================
//
// ALL properties in the object must match.
//
// This gives us:
//
//     gender = woman
//     AND
//     bodyShape = hourglass
//
// rather than accidentally treating them as OR.


function v14RelationshipConditionMatches(
  state,
  condition
) {
  if (
    !condition ||
    typeof condition !== "object"
  ) {
    return true;
  }

  for (
    const category of Object.keys(
      condition
    )
  ) {
    if (
      !v14RelationshipCategoryMatches(
        state,
        category,
        condition[category]
      )
    ) {
      return false;
    }
  }

  return true;
}


// =========================================
// MATCH "WHEN ANY"
// =========================================

function v14RelationshipAnyMatches(
  state,
  conditions
) {
  if (
    !Array.isArray(conditions) ||
    conditions.length === 0
  ) {
    return false;
  }

  return conditions.some(
    condition =>
      v14RelationshipConditionMatches(
        state,
        condition
      )
  );
}


// =========================================
// MATCH "WHEN ALL"
// =========================================

function v14RelationshipAllMatches(
  state,
  conditions
) {
  if (
    !Array.isArray(conditions) ||
    conditions.length === 0
  ) {
    return true;
  }

  return conditions.every(
    condition =>
      v14RelationshipConditionMatches(
        state,
        condition
      )
  );
}


// =========================================
// RELATIONSHIP RULE MATCH
// =========================================
//
// A rule may specify either:
//
//     when
//
// or:
//
//     whenAny
//
// or:
//
//     whenAll
//
// If none are specified, the rule applies globally.


function v14RelationshipRuleMatches(
  state,
  rule
) {
  if (!rule) {
    return false;
  }

  if (rule.when) {
    return v14RelationshipConditionMatches(
      state,
      rule.when
    );
  }

  if (rule.whenAny) {
    return v14RelationshipAnyMatches(
      state,
      rule.whenAny
    );
  }

  if (rule.whenAll) {
    return v14RelationshipAllMatches(
      state,
      rule.whenAll
    );
  }

  return true;
}


// =========================================
// RELATIONSHIP RULE STORAGE
// =========================================
//
// This replaces the old:
//
//     COMPATIBILITY_RULES[id] = rule
//
// behavior.
//
// Multiple rules are now stored in an array.


if (
  typeof COMPATIBILITY_RULES !== "object" ||
  COMPATIBILITY_RULES === null
) {
}


// =========================================
// GET RULE KEY
// =========================================

function v14RelationshipRuleKey(
  category,
  preset
) {
  const id =
    getPresetId(preset);

  if (!id) {
    return "";
  }

  return `${category}.${id}`;
}


// =========================================
// APPEND RELATIONSHIP RULE
// =========================================

function appendV14RelationshipRule(
  category,
  preset,
  relationship
) {
  const key =
    v14RelationshipRuleKey(
      category,
      preset
    );

  if (!key) {
    return;
  }

  if (
    !Array.isArray(
      COMPATIBILITY_RULES[key]
    )
  ) {
    COMPATIBILITY_RULES[key] = [];
  }

  COMPATIBILITY_RULES[key].push(
    relationship
  );
}


// =========================================
// REMOVE DUPLICATE RULES
// =========================================

function deduplicateV14RelationshipRules() {
  for (
    const key of Object.keys(
      COMPATIBILITY_RULES
    )
  ) {
    const rules =
      COMPATIBILITY_RULES[key];

    if (
      !Array.isArray(rules)
    ) {
      continue;
    }

    const seen =
      new Set();

    COMPATIBILITY_RULES[key] =
      rules.filter(
        rule => {
          const signature =
            JSON.stringify(
              rule
            );

          if (
            seen.has(
              signature
            )
          ) {
            return false;
          }

          seen.add(
            signature
          );

          return true;
        }
      );
  }
}


// =========================================
// COLLECT RULES FROM PRESET METADATA
// =========================================

function getV14MetadataRelationships(
  preset
) {
  if (!preset) {
    return [];
  }

  const metadata =
    getPresetMetadata(
      preset
    );

  if (!metadata) {
    return [];
  }

  const relationships =
    metadata.relationships ||
    metadata.compatibility ||
    [];

  if (
    !Array.isArray(
      relationships
    )
  ) {
    return [];
  }

  return relationships;
}


// =========================================
// GET ALL RULES FOR OPTION
// =========================================

function getV14AllRelationshipRules(
  category,
  preset
) {
  const rules = [];

  const key =
    v14RelationshipRuleKey(
      category,
      preset
    );

  if (
    key &&
    Array.isArray(
      COMPATIBILITY_RULES[key]
    )
  ) {
    rules.push(
      ...COMPATIBILITY_RULES[key]
    );
  }

  const metadataRules =
    getV14MetadataRelationships(
      preset
    );

  if (
    metadataRules.length > 0
  ) {
    rules.push(
      ...metadataRules
    );
  }

  return rules;
}


// =========================================
// GET MATCHED RELATIONSHIPS
// =========================================

function getV14MatchedRelationships(
  category,
  preset,
  state
) {
  const rules =
    getV14AllRelationshipRules(
      category,
      preset
    );

  return rules.filter(
    rule =>
      v14RelationshipRuleMatches(
        state,
        rule
      )
  );
}


// =========================================
// RELATIONSHIP TYPE NORMALIZATION
// =========================================

function normalizeV14RelationshipType(
  type
) {
  if (!type) {
    return "neutral";
  }

  const normalized =
    String(type)
      .toLowerCase()
      .trim();

  if (
    normalized === "blocked" ||
    normalized === "block"
  ) {
    return "blocked";
  }

  if (
    normalized === "required" ||
    normalized === "require"
  ) {
    return "required";
  }

  if (
    normalized === "preferred" ||
    normalized === "prefer"
  ) {
    return "preferred";
  }

  if (
    normalized === "discouraged" ||
    normalized === "discourage"
  ) {
    return "discouraged";
  }

  return "neutral";
}


// =========================================
// RULE → RELATIONSHIP
// =========================================
//
// Supports both forms:
//
//     { type: "preferred", when: {...} }
//
// and the older shorthand:
//
//     { preferredWhen: {...} }
//
// =========================================

function v14ExtractRelationshipMatches(
  state,
  rule
) {
  const matches = [];

  if (
    rule.blockedWhen &&
    v14RelationshipConditionMatches(
      state,
      rule.blockedWhen
    )
  ) {
    matches.push({
      type: "blocked",
      rule
    });
  }

  if (
    rule.requiredWhen &&
    v14RelationshipConditionMatches(
      state,
      rule.requiredWhen
    )
  ) {
    matches.push({
      type: "required",
      rule
    });
  }

  if (
    rule.preferredWhen &&
    v14RelationshipConditionMatches(
      state,
      rule.preferredWhen
    )
  ) {
    matches.push({
      type: "preferred",
      rule
    });
  }

  if (
    rule.neutralWhen &&
    v14RelationshipConditionMatches(
      state,
      rule.neutralWhen
    )
  ) {
    matches.push({
      type: "neutral",
      rule
    });
  }

  if (
    rule.discouragedWhen &&
    v14RelationshipConditionMatches(
      state,
      rule.discouragedWhen
    )
  ) {
    matches.push({
      type: "discouraged",
      rule
    });
  }

  if (rule.type) {
    if (
      v14RelationshipRuleMatches(
        state,
        rule
      )
    ) {
      matches.push({
        type:
          normalizeV14RelationshipType(
            rule.type
          ),
        rule
      });
    }
  }

  return matches;
}


// =========================================
// GET EFFECTIVE RELATIONSHIPS
// =========================================

function getV14EffectiveRelationships(
  category,
  preset,
  state
) {
  const rules =
    getV14AllRelationshipRules(
      category,
      preset
    );

  const relationships = [];

  for (
    const rule of rules
  ) {
    const matches =
      v14ExtractRelationshipMatches(
        state,
        rule
      );

    relationships.push(
      ...matches
    );
  }

  return relationships;
}


// =========================================
// BLOCKED TEST
// =========================================

function isV14OptionBlocked(
  category,
  preset,
  state
) {
  const relationships =
    getV14EffectiveRelationships(
      category,
      preset,
      state
    );

  return relationships.some(
    relationship =>
      relationship.type ===
      "blocked"
  );
}


// =========================================
// REQUIRED TEST
// =========================================
//
// IMPORTANT:
//
// "required" does NOT mean:
//
//     "this option must be selected"
//
// It means:
//
//     "when this option is being considered,
//      its condition is strongly required."
//
// This prevents the old problem where a single required rule
// accidentally became an exclusive candidate filter.


function isV14OptionRequired(
  category,
  preset,
  state
) {
  const relationships =
    getV14EffectiveRelationships(
      category,
      preset,
      state
    );

  return relationships.some(
    relationship =>
      relationship.type ===
      "required"
  );
}


// =========================================
// CALCULATE MULTIPLIER
// =========================================

function getV14RelationshipMultiplier(
  category,
  preset,
  state
) {
  const relationships =
    getV14EffectiveRelationships(
      category,
      preset,
      state
    );

  if (
    relationships.length === 0
  ) {
    return 1;
  }

  // -----------------------------------------
  // BLOCKED always wins.
  // -----------------------------------------

  if (
    relationships.some(
      relationship =>
        relationship.type ===
        "blocked"
    )
  ) {
    return 0;
  }

  // -----------------------------------------
  // Required relationship.
  // -----------------------------------------
  //
  // Required receives a strong boost but is NOT
  // made mathematically mandatory.
  //
  // This is important when multiple metadata
  // systems disagree.
  //
  // A blocked rule still overrides it.

  let multiplier = 1;

  if (
    relationships.some(
      relationship =>
        relationship.type ===
        "required"
    )
  ) {
    multiplier *=
      V14_RELATIONSHIP_MULTIPLIERS
        .required;
  }

  // -----------------------------------------
  // Preferred.
  // -----------------------------------------

  const preferredCount =
    relationships.filter(
      relationship =>
        relationship.type ===
        "preferred"
    ).length;

  for (
    let i = 0;
    i < preferredCount;
    i++
  ) {
    multiplier *=
      V14_RELATIONSHIP_MULTIPLIERS
        .preferred;
  }

  // -----------------------------------------
  // Discouraged.
  // -----------------------------------------

  const discouragedCount =
    relationships.filter(
      relationship =>
        relationship.type ===
        "discouraged"
    ).length;

  for (
    let i = 0;
    i < discouragedCount;
    i++
  ) {
    multiplier *=
      V14_RELATIONSHIP_MULTIPLIERS
        .discouraged;
  }

  return multiplier;
}


// =========================================
// PROFILE MULTIPLIER
// =========================================

function getV14ProfileMultiplier(
  category,
  preset,
  state,
  config
) {
  if (
    !config ||
    config.useProfileWeights === false
  ) {
    return 1;
  }

  const profile =
    getCurrentProfile(
      state
    );

  if (!profile) {
    return 1;
  }

  const weight =
    getProfileTraitWeight(
      profile,
      category,
      getPresetValue(
        preset
      )
    );

  if (
    weight === undefined ||
    weight === null
  ) {
    return 1;
  }

  const numericWeight =
    Number(weight);

  if (
    !Number.isFinite(
      numericWeight
    )
  ) {
    return 1;
  }

  return Math.max(
    0,
    numericWeight
  );
}


// =========================================
// FINAL OPTION WEIGHT
// =========================================
//
// The final weight is:
//
//     relationship × profile
//
// This means profile information and state relationships are
// separate systems that cooperate rather than being tangled
// together.


function getV14OptionWeight(
  category,
  preset,
  state,
  config
) {
  if (
    isV14OptionBlocked(
      category,
      preset,
      state
    )
  ) {
    return 0;
  }

  const relationshipMultiplier =
    getV14RelationshipMultiplier(
      category,
      preset,
      state
    );

  if (
    relationshipMultiplier <= 0
  ) {
    return 0;
  }

  const profileMultiplier =
    getV14ProfileMultiplier(
      category,
      preset,
      state,
      config
    );

  return (
    relationshipMultiplier *
    profileMultiplier
  );
}


// =========================================
// GET COMPATIBLE OPTIONS
// =========================================

function getV14CompatibleOptions(
  category,
  presets,
  state,
  config
) {
  if (
    !Array.isArray(presets)
  ) {
    return [];
  }

  return presets
    .map(
      preset => ({
        preset,
        weight:
          getV14OptionWeight(
            category,
            preset,
            state,
            config
          )
      })
    )
    .filter(
      candidate =>
        candidate.weight > 0
    );
}


// =========================================
// WEIGHTED PICK
// =========================================

function weightedPickV14(
  candidates
) {
  if (
    !Array.isArray(
      candidates
    ) ||
    candidates.length === 0
  ) {
    return null;
  }

  let totalWeight = 0;

  for (
    const candidate
    of candidates
  ) {
    totalWeight +=
      Math.max(
        0,
        Number(
          candidate.weight
        ) || 0
      );
  }

  if (
    totalWeight <= 0
  ) {
    return null;
  }

  let roll =
    Math.random() *
    totalWeight;

  for (
    const candidate
    of candidates
  ) {
    const weight =
      Math.max(
        0,
        Number(
          candidate.weight
        ) || 0
      );

    roll -= weight;

    if (
      roll <= 0
    ) {
      return candidate.preset;
    }
  }

  return candidates[
    candidates.length - 1
  ].preset;
}


// =========================================
// RANDOM COMPATIBLE OPTION
// =========================================

function randomV14CompatibleOption(
  category,
  presets,
  state,
  config
) {
  if (
    !Array.isArray(presets) ||
    presets.length === 0
  ) {
    return null;
  }

  // -----------------------------------------
  // FREE MODE
  // -----------------------------------------

  if (
    config &&
    config.randomizationMode === "free"
  ) {
    return randomElement(
      presets
    );
  }

  // -----------------------------------------
  // COMPATIBLE MODE
  // -----------------------------------------

  const candidates =
    getV14CompatibleOptions(
      category,
      presets,
      state,
      config
    );

  if (
    candidates.length === 0
  ) {
    return null;
  }

  return weightedPickV14(
    candidates
  );
}


// =========================================
// MULTI-SELECT COMPATIBILITY
// =========================================

function getV14CompatibleSwitchOptions(
  category,
  presets,
  state,
  config,
  count
) {
  if (
    !Array.isArray(presets) ||
    presets.length === 0
  ) {
    return [];
  }

  const available =
    presets.filter(
      preset =>
        getV14OptionWeight(
          category,
          preset,
          state,
          config
        ) > 0
    );

  if (
    available.length === 0
  ) {
    return [];
  }

  const requested =
    Math.max(
      1,
      Number(count) || 1
    );

  const selected = [];

  const pool =
    available.slice();

  while (
    selected.length <
    requested &&
    pool.length > 0
  ) {
    const candidates =
      pool.map(
        preset => ({
          preset,
          weight:
            getV14OptionWeight(
              category,
              preset,
              state,
              config
            )
        })
      );

    const chosen =
      weightedPickV14(
        candidates
      );

    if (!chosen) {
      break;
    }

    selected.push(
      chosen
    );

    const chosenId =
      getPresetId(
        chosen
      );

    for (
      let i = pool.length - 1;
      i >= 0;
      i--
    ) {
      if (
        getPresetId(
          pool[i]
        ) === chosenId
      ) {
        pool.splice(
          i,
          1
        );
      }
    }
  }

  return selected;
}


// =========================================
// COMPATIBILITY REPORT
// =========================================

function getV14CompatibilityReport(
  category,
  preset,
  state,
  config
) {
  const relationships =
    getV14EffectiveRelationships(
      category,
      preset,
      state
    );

  const profile =
    getCurrentProfile(
      state
    );

  const profileWeight =
    getV14ProfileMultiplier(
      category,
      preset,
      state,
      config
    );

  const relationshipMultiplier =
    getV14RelationshipMultiplier(
      category,
      preset,
      state
    );

  const finalWeight =
    getV14OptionWeight(
      category,
      preset,
      state,
      config
    );

  return {
    category,

    id:
      getPresetId(
        preset
      ),

    label:
      getPresetLabel(
        preset
      ),

    value:
      getPresetValue(
        preset
      ),

    profile:
      profile || "",

    relationships:
      relationships.map(
        relationship => ({
          type:
            relationship.type,
          rule:
            relationship.rule
        })
      ),

    blocked:
      finalWeight <= 0,

    relationshipMultiplier,

    profileWeight,

    finalWeight
  };
}


// =========================================
// HUMAN-READABLE EXPLANATION
// =========================================

function explainV14Compatibility(
  category,
  preset,
  state,
  config
) {
  const report =
    getV14CompatibilityReport(
      category,
      preset,
      state,
      config
    );

  const lines = [
    `${report.category}: ${report.label}`,
    `ID: ${report.id}`
  ];

  if (report.profile) {
    lines.push(
      `Profile: ${report.profile}`
    );
  }

  if (
    report.relationships.length === 0
  ) {
    lines.push(
      "Relationships: none"
    );
  } else {
    lines.push(
      "Relationships:"
    );

    for (
      const relationship
      of report.relationships
    ) {
      lines.push(
        `  - ${relationship.type}`
      );
    }
  }

  lines.push(
    `Relationship multiplier: ${report.relationshipMultiplier}`,
    `Profile multiplier: ${report.profileWeight}`,
    `Final weight: ${report.finalWeight}`
  );

  if (report.blocked) {
    lines.push(
      "Result: BLOCKED"
    );
  } else {
    lines.push(
      "Result: AVAILABLE"
    );
  }

  return lines.join("\n");
}


// =========================================
// REPLACE OLD COMPATIBILITY HELPERS
// =========================================
//
// These aliases let the later chunks use the new engine without
// having two competing compatibility implementations.


function getCompatibilityWeightV14(
  category,
  preset,
  state,
  config
) {
  return getV14OptionWeight(
    category,
    preset,
    state,
    config
  );
}


function isOptionAllowedV14(
  category,
  preset,
  state
) {
  return !isV14OptionBlocked(
    category,
    preset,
    state
  );
}


function getCompatiblePresetsV14(
  category,
  presets,
  state,
  config
) {
  return getV14CompatibleOptions(
    category,
    presets,
    state,
    config
  ).map(
    candidate =>
      candidate.preset
  );
}


// =========================================
// REGISTERED ENGINE
// =========================================

const V14_RELATIONSHIP_ENGINE = {
  addRule:
    appendV14RelationshipRule,

  getRules:
    getV14AllRelationshipRules,

  getMatchedRules:
    getV14MatchedRelationships,

  getRelationships:
    getV14EffectiveRelationships,

  isBlocked:
    isV14OptionBlocked,

  isRequired:
    isV14OptionRequired,

  getMultiplier:
    getV14RelationshipMultiplier,

  getWeight:
    getV14OptionWeight,

  getCompatible:
    getV14CompatibleOptions,

  random:
    randomV14CompatibleOption,

  randomMultiple:
    getV14CompatibleSwitchOptions,

  report:
    getV14CompatibilityReport,

  explain:
    explainV14Compatibility,

  deduplicate:
    deduplicateV14RelationshipRules
};


// =========================================
// REBUILD RELATIONSHIP TABLE
// =========================================
//
// Call this after all relationship definitions have been loaded.
//
// This removes duplicate metadata rules while preserving distinct
// relationships.


function rebuildV14RelationshipEngine() {
  deduplicateV14RelationshipRules();

  return COMPATIBILITY_RULES;
}
// =========================================
// V14 — CHUNK 23
// RELATIONSHIP DEFINITIONS
// =========================================
//
// This chunk defines the actual relationships used by the V14
// compatibility engine.
//
// IMPORTANT:
//
// These are preferences and constraints.
//
// They are NOT giant nationality descriptions.
//
// Identity:
//
//     Irish
//
// establishes:
//
//     celtic profile
//
// The celtic profile then influences:
//
//     skin
//     hair color
//     hair texture
//     eye color
//
// without forcing every Irish preset to contain all of those
// physical descriptions.
//
// =========================================


// =========================================
// RESET V14 RELATIONSHIP DEFINITIONS
// =========================================
//
// During development, earlier chunks may have populated
// COMPATIBILITY_RULES.
//
// We intentionally clear it here and rebuild the complete
// relationship table using the new accumulating architecture.


function resetV14RelationshipDefinitions() {
  for (
    const key of Object.keys(
      COMPATIBILITY_RULES
    )
  ) {
    delete COMPATIBILITY_RULES[key];
  }
}


// =========================================
// ADD RELATIONSHIP
// =========================================

function defineV14Relationship(
  category,
  preset,
  type,
  condition,
  note
) {
  if (!preset) {
    return;
  }

  appendV14RelationshipRule(
    category,
    preset,
    {
      type,
      when: condition || {},
      note:
        note || ""
    }
  );
}


// =========================================
// ADD RELATIONSHIPS TO ALL PRESETS
// =========================================

function defineV14RelationshipForValues(
  category,
  presets,
  values,
  type,
  condition,
  note
) {
  if (
    !Array.isArray(presets)
  ) {
    return;
  }

  for (
    const preset of presets
  ) {
    const presetValue =
      String(
        getPresetValue(
          preset
        ) || ""
      ).toLowerCase();

    const presetLabel =
      String(
        getPresetLabel(
          preset
        ) || ""
      ).toLowerCase();

    const matches =
      values.some(
        value => {
          const normalized =
            String(
              value
            ).toLowerCase();

          return (
            presetValue ===
            normalized ||
            presetLabel ===
            normalized
          );
        }
      );

    if (matches) {
      defineV14Relationship(
        category,
        preset,
        type,
        condition,
        note
      );
    }
  }
}


// =========================================
// HELPER: FIND BY VALUE
// =========================================

function findV14PresetsByValues(
  presets,
  values
) {
  if (
    !Array.isArray(
      presets
    )
  ) {
    return [];
  }

  const wanted =
    new Set(
      values.map(
        value =>
          String(
            value
          ).toLowerCase()
      )
    );

  return presets.filter(
    preset => {
      const value =
        String(
          getPresetValue(
            preset
          ) || ""
        ).toLowerCase();

      const label =
        String(
          getPresetLabel(
            preset
          ) || ""
        ).toLowerCase();

      return (
        wanted.has(value) ||
        wanted.has(label)
      );
    }
  );
}


// =========================================
// GENDER RELATIONSHIPS
// =========================================
//
// Gender does not directly dictate every physical trait.
//
// Instead it establishes broad compatibility relationships.


function defineV14GenderRelationships() {

  // -----------------------------------------
  // Facial hair
  // -----------------------------------------

  for (
    const preset
    of facialHairPresets
  ) {
    defineV14Relationship(
      "facialHair",
      preset,
      "preferred",
      {
        gender: "gender.man"
      },
      "Facial hair is more strongly associated with the male profile."
    );

    defineV14Relationship(
      "facialHair",
      preset,
      "discouraged",
      {
        gender: "gender.woman"
      },
      "Facial hair is less likely in the feminine profile."
    );
  }


  // -----------------------------------------
  // Chest
  // -----------------------------------------

  for (
    const preset
    of chestPresets
  ) {
    const value =
      String(
        getPresetValue(
          preset
        ) || ""
      ).toLowerCase();

    if (
      value.includes(
        "flat"
      )
    ) {
      continue;
    }

    defineV14Relationship(
      "chest",
      preset,
      "preferred",
      {
        gender: "gender.woman"
      },
      "Non-flat chest descriptions are more strongly associated with the feminine profile."
    );

    defineV14Relationship(
      "chest",
      preset,
      "discouraged",
      {
        gender: "gender.man"
      },
      "Non-flat chest descriptions are less likely in the masculine profile."
    );
  }


  // -----------------------------------------
  // Hips
  // -----------------------------------------

  for (
    const preset
    of hipsPresets
  ) {
    const value =
      String(
        getPresetValue(
          preset
        ) || ""
      ).toLowerCase();

    if (
      value.includes(
        "narrow"
      )
    ) {
      defineV14Relationship(
        "hips",
        preset,
        "preferred",
        {
          gender: "gender.man"
        }
      );

      continue;
    }

    if (
      value.includes(
        "wide"
      )
    ) {
      defineV14Relationship(
        "hips",
        preset,
        "preferred",
        {
          gender: "gender.woman"
        }
      );

      defineV14Relationship(
        "hips",
        preset,
        "discouraged",
        {
          gender: "gender.man"
        }
      );
    }
  }


  // -----------------------------------------
  // Body shape
  // -----------------------------------------

  const feminineShapes = [
    "body_shape.petite",
    "body_shape.hourglass",
    "body_shape.pear"
  ];

  const masculineShapes = [
    "body_shape.rectangle",
    "body_shape.inverted_triangle"
  ];

  for (
    const preset
    of bodyShapePresets
  ) {
    const id =
      getPresetId(
        preset
      );

    if (
      feminineShapes.includes(
        id
      )
    ) {
      defineV14Relationship(
        "bodyShape",
        preset,
        "preferred",
        {
          gender: "gender.woman"
        }
      );

      defineV14Relationship(
        "bodyShape",
        preset,
        "discouraged",
        {
          gender: "gender.man"
        }
      );
    }

    if (
      masculineShapes.includes(
        id
      )
    ) {
      defineV14Relationship(
        "bodyShape",
        preset,
        "preferred",
        {
          gender: "gender.man"
        }
      );

      defineV14Relationship(
        "bodyShape",
        preset,
        "discouraged",
        {
          gender: "gender.woman"
        }
      );
    }
  }


  // -----------------------------------------
  // Petite overall build
  // -----------------------------------------

  const petiteBuilds =
    findV14PresetsByValues(
      overallBuildPresets,
      [
        "petite build"
      ]
    );

  for (
    const preset
    of petiteBuilds
  ) {
    defineV14Relationship(
      "overallBuild",
      preset,
      "preferred",
      {
        gender: "gender.woman"
      }
    );

    defineV14Relationship(
      "overallBuild",
      preset,
      "discouraged",
      {
        gender: "gender.man"
      }
    );
  }


  // -----------------------------------------
  // Makeup
  // -----------------------------------------

  for (
    const preset
    of makeupPresets
  ) {
    defineV14Relationship(
      "makeup",
      preset,
      "preferred",
      {
        gender: "gender.woman"
      }
    );

    defineV14Relationship(
      "makeup",
      preset,
      "discouraged",
      {
        gender: "gender.man"
      }
    );
  }


  // -----------------------------------------
  // Nails
  // -----------------------------------------

  for (
    const preset
    of nailPresets
  ) {
    defineV14Relationship(
      "nails",
      preset,
      "preferred",
      {
        gender: "gender.woman"
      }
    );

    defineV14Relationship(
      "nails",
      preset,
      "discouraged",
      {
        gender: "gender.man"
      }
    );
  }
}


// =========================================
// PROFILE RELATIONSHIP HELPER
// =========================================
//
// Profiles describe tendencies, not mandatory appearance.
//
// Example:
//
//     celtic
//
// does NOT mean:
//
//     Irish = red hair + pale skin + freckles
//
// It means the celtic profile makes certain available traits
// more probable.
//
// The actual numerical profile weighting remains in TRAIT_PROFILES.


function defineV14ProfilePreference(
  category,
  presetValues,
  profile,
  type,
  note
) {
  const presets =
    PRESET_COLLECTIONS[
    category
    ];

  if (
    !Array.isArray(
      presets
    )
  ) {
    return;
  }

  const matching =
    findV14PresetsByValues(
      presets,
      presetValues
    );

  for (
    const preset
    of matching
  ) {
    defineV14Relationship(
      category,
      preset,
      type,
      {
        nationalityProfile:
          profile
      },
      note
    );
  }
}


// =========================================
// CELTIC
// =========================================

function defineV14CelticRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin",
      "pale skin",
      "fair skin"
    ],
    "celtic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "red",
      "copper/ginger",
      "auburn",
      "brunette"
    ],
    "celtic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "wavy",
      "curly",
      "straight"
    ],
    "celtic",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Blue",
      "Green",
      "Hazel",
      "Gray"
    ],
    "celtic",
    "preferred"
  );

  defineV14ProfilePreference(
    "bodyDetails",
    [
      "freckles"
    ],
    "celtic",
    "preferred"
  );
}


// =========================================
// NORDIC
// =========================================

function defineV14NordicRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin",
      "pale skin",
      "fair skin"
    ],
    "nordic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "blonde",
      "platinum blonde",
      "silver"
    ],
    "nordic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy"
    ],
    "nordic",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Blue",
      "Gray",
      "Green"
    ],
    "nordic",
    "preferred"
  );
}


// =========================================
// WEST EUROPEAN
// =========================================

function defineV14WestEuropeanRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "fair skin",
      "cream skin",
      "pale skin",
      "olive skin"
    ],
    "westEuropean",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "blonde",
      "brunette",
      "brown",
      "auburn",
      "chestnut brown"
    ],
    "westEuropean",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Blue",
      "Green",
      "Hazel",
      "Brown"
    ],
    "westEuropean",
    "preferred"
  );
}


// =========================================
// MEDITERRANEAN
// =========================================

function defineV14MediterraneanRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "olive skin",
      "tanned sun-kissed skin",
      "cream skin"
    ],
    "mediterranean",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "brunette",
      "chestnut brown"
    ],
    "mediterranean",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "wavy",
      "curly",
      "straight"
    ],
    "mediterranean",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel",
      "Amber"
    ],
    "mediterranean",
    "preferred"
  );
}


// =========================================
// SLAVIC
// =========================================

function defineV14SlavicRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin",
      "pale skin",
      "fair skin",
      "cream skin"
    ],
    "slavic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "blonde",
      "brunette",
      "auburn",
      "chestnut brown",
      "silver"
    ],
    "slavic",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy"
    ],
    "slavic",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Blue",
      "Green",
      "Gray",
      "Hazel",
      "Brown"
    ],
    "slavic",
    "preferred"
  );
}


// =========================================
// AFRICAN
// =========================================

function defineV14AfricanRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "warm brown skin",
      "dark skin",
      "dark glossy skin",
      "dark black nubian glossy skin",
      "golden-bronze skin"
    ],
    "african",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown"
    ],
    "african",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "kinky",
      "afro-textured",
      "curly"
    ],
    "african",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Amber"
    ],
    "african",
    "preferred"
  );
}


// =========================================
// EAST AFRICAN
// =========================================

function defineV14EastAfricanRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "warm brown skin",
      "dark skin",
      "dark glossy skin",
      "golden-bronze skin"
    ],
    "eastAfrican",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown"
    ],
    "eastAfrican",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "kinky",
      "afro-textured",
      "curly"
    ],
    "eastAfrican",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown"
    ],
    "eastAfrican",
    "preferred"
  );
}


// =========================================
// EAST ASIAN
// =========================================

function defineV14EastAsianRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin",
      "fair skin",
      "cream skin",
      "olive skin"
    ],
    "eastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown",
      "brunette"
    ],
    "eastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy"
    ],
    "eastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel"
    ],
    "eastAsian",
    "preferred"
  );
}


// =========================================
// SOUTHEAST ASIAN
// =========================================

function defineV14SoutheastAsianRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "cream skin",
      "olive skin",
      "golden-bronze skin",
      "warm brown skin"
    ],
    "southeastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown",
      "brunette"
    ],
    "southeastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy"
    ],
    "southeastAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel"
    ],
    "southeastAsian",
    "preferred"
  );
}


// =========================================
// SOUTH ASIAN
// =========================================

function defineV14SouthAsianRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "cream skin",
      "olive skin",
      "golden-bronze skin",
      "warm brown skin"
    ],
    "southAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown",
      "brunette"
    ],
    "southAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy",
      "curly"
    ],
    "southAsian",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel"
    ],
    "southAsian",
    "preferred"
  );
}


// =========================================
// MIDDLE EASTERN
// =========================================

function defineV14MiddleEasternRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "olive skin",
      "cream skin",
      "golden-bronze skin",
      "warm brown skin"
    ],
    "middleEastern",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "brunette",
      "dark brown"
    ],
    "middleEastern",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "wavy",
      "curly",
      "straight"
    ],
    "middleEastern",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel",
      "Amber",
      "Green"
    ],
    "middleEastern",
    "preferred"
  );
}


// =========================================
// LATINA
// =========================================

function defineV14LatinaRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "cream skin",
      "olive skin",
      "golden-bronze skin",
      "warm brown skin",
      "tanned sun-kissed skin"
    ],
    "latina",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "brunette",
      "chestnut brown",
      "auburn"
    ],
    "latina",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy",
      "curly"
    ],
    "latina",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel",
      "Amber"
    ],
    "latina",
    "preferred"
  );
}


// =========================================
// BRAZILIAN
// =========================================

function defineV14BrazilianRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "cream skin",
      "olive skin",
      "golden-bronze skin",
      "warm brown skin",
      "dark skin"
    ],
    "brazilian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "brunette",
      "chestnut brown",
      "auburn"
    ],
    "brazilian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy",
      "curly",
      "kinky",
      "afro-textured"
    ],
    "brazilian",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel",
      "Green",
      "Amber"
    ],
    "brazilian",
    "preferred"
  );
}


// =========================================
// NATIVE AMERICAN
// =========================================

function defineV14NativeAmericanRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "cream skin",
      "olive skin",
      "golden-bronze skin",
      "warm brown skin"
    ],
    "nativeAmerican",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown",
      "brunette"
    ],
    "nativeAmerican",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy"
    ],
    "nativeAmerican",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel"
    ],
    "nativeAmerican",
    "preferred"
  );
}


// =========================================
// POLYNESIAN
// =========================================

function defineV14PolynesianRelationships() {

  defineV14ProfilePreference(
    "skin",
    [
      "golden-bronze skin",
      "warm brown skin",
      "dark skin"
    ],
    "polynesian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairColor",
    [
      "black",
      "dark brown",
      "brunette"
    ],
    "polynesian",
    "preferred"
  );

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy",
      "curly"
    ],
    "polynesian",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Brown",
      "Dark brown",
      "Hazel"
    ],
    "polynesian",
    "preferred"
  );
}


// =========================================
// MIXED
// =========================================
//
// Mixed profiles intentionally have broader compatibility.
//
// We do NOT give every trait a strong preference.


function defineV14MixedRelationships() {

  defineV14ProfilePreference(
    "hairType",
    [
      "straight",
      "wavy",
      "curly",
      "kinky",
      "afro-textured",
      "frizzy"
    ],
    "mixed",
    "preferred"
  );

  defineV14ProfilePreference(
    "eyes",
    [
      "Blue",
      "Green",
      "Hazel",
      "Brown",
      "Dark brown",
      "Amber",
      "Gray"
    ],
    "mixed",
    "preferred"
  );
}


// =========================================
// SPECIFIC BODY RELATIONSHIPS
// =========================================

function defineV14SpecificBodyRelationships() {

  const pregnancyValues = [
    "pregnant",
    "heavily pregnant"
  ];

  const pregnancyPresets =
    findV14PresetsByValues(
      specificBodyPresets,
      pregnancyValues
    );

  for (
    const preset
    of pregnancyPresets
  ) {
    defineV14Relationship(
      "specificBody",
      preset,
      "blocked",
      {
        gender: "gender.man"
      },
      "Pregnancy presets are incompatible with the male gender profile."
    );

    defineV14Relationship(
      "specificBody",
      preset,
      "preferred",
      {
        gender: "gender.woman"
      }
    );
  }


  // Achondroplasia is independent of gender.
  //
  // It remains available for either profile.
}


// =========================================
// PROFILE RELATIONSHIPS: DISCOURAGED TRAITS
// =========================================
//
// These are intentionally weak.
//
// A discouraged trait is still possible.
//
// This is different from blocked.


function defineV14ProfileDiscouragements() {

  // -----------------------------------------
  // Celtic
  // -----------------------------------------

  defineV14ProfilePreference(
    "skin",
    [
      "dark black nubian glossy skin"
    ],
    "celtic",
    "discouraged"
  );

  // -----------------------------------------
  // Nordic
  // -----------------------------------------

  defineV14ProfilePreference(
    "skin",
    [
      "dark black nubian glossy skin",
      "dark glossy skin"
    ],
    "nordic",
    "discouraged"
  );

  // -----------------------------------------
  // East Asian
  // -----------------------------------------

  defineV14ProfilePreference(
    "skin",
    [
      "dark black nubian glossy skin"
    ],
    "eastAsian",
    "discouraged"
  );

  // -----------------------------------------
  // East African
  // -----------------------------------------

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin"
    ],
    "eastAfrican",
    "discouraged"
  );

  // -----------------------------------------
  // African
  // -----------------------------------------

  defineV14ProfilePreference(
    "skin",
    [
      "porcelain skin",
      "pale skin"
    ],
    "african",
    "discouraged"
  );
}


// =========================================
// ACCESSORY GENDER RELATIONSHIPS
// =========================================

function defineV14AccessoryGenderRelationships() {

  const feminineAccessoryIds = [
    "accessory.hair.scrunchie",
    "accessory.hair.bow",
    "accessory.hair.flower"
  ];

  for (
    const preset
    of accessoryPresets
  ) {
    const id =
      getPresetId(
        preset
      );

    if (
      feminineAccessoryIds.includes(
        id
      )
    ) {
      defineV14Relationship(
        "accessories",
        preset,
        "preferred",
        {
          gender: "gender.woman"
        }
      );

      defineV14Relationship(
        "accessories",
        preset,
        "discouraged",
        {
          gender: "gender.man"
        }
      );
    }
  }
}


// =========================================
// BUILD COMPLETE RULE TABLE
// =========================================

function buildV14RelationshipDefinitions() {

  resetV14RelationshipDefinitions();

  defineV14GenderRelationships();

  defineV14CelticRelationships();
  defineV14NordicRelationships();
  defineV14WestEuropeanRelationships();
  defineV14MediterraneanRelationships();
  defineV14SlavicRelationships();

  defineV14AfricanRelationships();
  defineV14EastAfricanRelationships();

  defineV14EastAsianRelationships();
  defineV14SoutheastAsianRelationships();
  defineV14SouthAsianRelationships();

  defineV14MiddleEasternRelationships();

  defineV14LatinaRelationships();
  defineV14BrazilianRelationships();

  defineV14NativeAmericanRelationships();
  defineV14PolynesianRelationships();

  defineV14MixedRelationships();

  defineV14SpecificBodyRelationships();

  defineV14ProfileDiscouragements();

  defineV14AccessoryGenderRelationships();

  rebuildV14RelationshipEngine();

  return COMPATIBILITY_RULES;
}


// =========================================
// INITIALIZE RELATIONSHIP DEFINITIONS
// =========================================
//
// This runs once when the script is loaded.


buildV14RelationshipDefinitions();


// =========================================
// RELATIONSHIP DEFINITIONS API
// =========================================

const V14_RELATIONSHIP_DEFINITIONS = {
  build:
    buildV14RelationshipDefinitions,

  reset:
    resetV14RelationshipDefinitions,

  define:
    defineV14Relationship,

  defineForValues:
    defineV14RelationshipForValues,

  findByValues:
    findV14PresetsByValues
};
// =========================================
// V14 CLOTHING RELATIONSHIP + OUTFIT ENGINE
// =========================================
//
// Clothing is treated as a collection of related choices:
//
//   clothing group -> clothing item -> outfit role
//
// The relationship engine decides whether a choice is:
//   blocked / required / preferred / neutral / discouraged
//
// Outfit composition then makes sure the selected pieces can coexist.
//
// This deliberately avoids hard-coded array positions and slice() logic.
// =========================================


// -----------------------------------------
// CLOTHING RELATIONSHIP HELPERS
// -----------------------------------------

function defineV14ClothingRelationship(
  clothingId,
  type,
  condition,
  reason
) {
  return defineV14Relationship(
    "clothing",
    clothingId,
    type,
    condition,
    reason
  );
}


function defineV14ClothingGroupRelationship(
  groupId,
  type,
  condition,
  reason
) {
  return defineV14Relationship(
    "clothingGroups",
    groupId,
    type,
    condition,
    reason
  );
}


// -----------------------------------------
// CLOTHING CATEGORY METADATA
// -----------------------------------------

const V14_CLOTHING_ROLES = {
  upper: "upper",
  lower: "lower",
  onePiece: "onePiece",
  underwear: "underwear",
  swim: "swim",
  lounge: "lounge",
  outfit: "outfit",
  footwear: "footwear",
  accessory: "accessory"
};


const V14_CLOTHING_GROUP_ROLES = {
  "clothingGroup.tops": [
    V14_CLOTHING_ROLES.upper
  ],

  "clothingGroup.bottoms": [
    V14_CLOTHING_ROLES.lower
  ],

  "clothingGroup.dresses": [
    V14_CLOTHING_ROLES.onePiece
  ],

  "clothingGroup.lingerie": [
    V14_CLOTHING_ROLES.underwear
  ],

  "clothingGroup.swimwear": [
    V14_CLOTHING_ROLES.swim
  ],

  "clothingGroup.robes": [
    V14_CLOTHING_ROLES.lounge
  ],

  "clothingGroup.sets": [
    V14_CLOTHING_ROLES.outfit
  ],

  "clothingGroup.uniforms": [
    V14_CLOTHING_ROLES.outfit
  ],

  "clothingGroup.costumes": [
    V14_CLOTHING_ROLES.outfit
  ],

  "clothingGroup.period": [
    V14_CLOTHING_ROLES.outfit
  ],

  "clothingGroup.footwear": [
    V14_CLOTHING_ROLES.footwear
  ]
};


// -----------------------------------------
// GENERIC CLOTHING METADATA
// -----------------------------------------

function createV14ClothingMetadata(
  id,
  groupId,
  roles,
  options = {}
) {
  return {
    id,
    groupId,
    roles: Array.isArray(roles) ? roles : [roles],
    maxPerOutfit: options.maxPerOutfit ?? 1,
    conflictsWith: options.conflictsWith || [],
    compatibleWith: options.compatibleWith || [],
    tags: options.tags || []
  };
}


const V14_CLOTHING_METADATA = {};


// -----------------------------------------
// REGISTER GROUP METADATA
// -----------------------------------------

function registerV14ClothingGroupMetadata(
  groupId,
  roles,
  options = {}
) {
  V14_CLOTHING_METADATA[groupId] = createV14ClothingMetadata(
    groupId,
    groupId,
    roles,
    options
  );
}


Object.entries(V14_CLOTHING_GROUP_ROLES).forEach(
  ([groupId, roles]) => {
    registerV14ClothingGroupMetadata(
      groupId,
      roles
    );
  }
);


// -----------------------------------------
// REGISTER INDIVIDUAL CLOTHING METADATA
// -----------------------------------------

function registerV14ClothingPresetMetadata(
  clothingId,
  groupId,
  roles,
  options = {}
) {
  V14_CLOTHING_METADATA[clothingId] =
    createV14ClothingMetadata(
      clothingId,
      groupId,
      roles,
      options
    );
}


// -----------------------------------------
// CLOTHING ID LOOKUP
// -----------------------------------------

function getV14ClothingMetadata(presetOrId) {

  const id =
    typeof presetOrId === "string"
      ? presetOrId
      : getPresetId(presetOrId);

  return V14_CLOTHING_METADATA[id] || null;
}


function getV14ClothingRoles(presetOrId) {

  const metadata =
    getV14ClothingMetadata(presetOrId);

  return metadata
    ? metadata.roles
    : [];
}


function getV14ClothingGroupId(presetOrId) {

  const metadata =
    getV14ClothingMetadata(presetOrId);

  return metadata
    ? metadata.groupId
    : "";
}


// -----------------------------------------
// CLOTHING GROUP LOOKUP
// -----------------------------------------

function getV14ClothingGroupById(groupId) {

  if (!Array.isArray(clothingGroups)) {
    return null;
  }

  return clothingGroups.find(
    group => getPresetId(group) === groupId
  ) || null;
}


function getV14ClothingGroupPresets(groupId) {

  const group =
    getV14ClothingGroupById(groupId);

  return group && Array.isArray(group.presets)
    ? group.presets
    : [];
}


// -----------------------------------------
// DETERMINE GROUP FROM PRESET
// -----------------------------------------

function findV14ClothingGroupForPreset(preset) {

  const presetId =
    getPresetId(preset);

  const directMetadata =
    V14_CLOTHING_METADATA[presetId];

  if (directMetadata) {
    return directMetadata.groupId;
  }

  for (const group of clothingGroups) {

    const found =
      group.presets.some(
        item => getPresetId(item) === presetId
      );

    if (found) {
      return getPresetId(group);
    }
  }

  return "";
}


// -----------------------------------------
// CLOTHING ROLE CONFLICTS
// -----------------------------------------

function v14ClothingRolesConflict(
  existingRoles,
  newRoles
) {
  if (
    !Array.isArray(existingRoles) ||
    !Array.isArray(newRoles)
  ) {
    return false;
  }

  // A one-piece outfit already supplies both
  // upper and lower coverage.
  if (
    existingRoles.includes(V14_CLOTHING_ROLES.onePiece) &&
    (
      newRoles.includes(V14_CLOTHING_ROLES.upper) ||
      newRoles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    return true;
  }

  if (
    newRoles.includes(V14_CLOTHING_ROLES.onePiece) &&
    (
      existingRoles.includes(V14_CLOTHING_ROLES.upper) ||
      existingRoles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    return true;
  }

  // Complete outfits conflict with ordinary
  // upper/lower pieces.
  if (
    existingRoles.includes(V14_CLOTHING_ROLES.outfit) &&
    (
      newRoles.includes(V14_CLOTHING_ROLES.upper) ||
      newRoles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    return true;
  }

  if (
    newRoles.includes(V14_CLOTHING_ROLES.outfit) &&
    (
      existingRoles.includes(V14_CLOTHING_ROLES.upper) ||
      existingRoles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    return true;
  }

  // Swimwear is its own outfit context.
  if (
    existingRoles.includes(V14_CLOTHING_ROLES.swim) &&
    (
      newRoles.includes(V14_CLOTHING_ROLES.upper) ||
      newRoles.includes(V14_CLOTHING_ROLES.lower) ||
      newRoles.includes(V14_CLOTHING_ROLES.onePiece)
    )
  ) {
    return true;
  }

  if (
    newRoles.includes(V14_CLOTHING_ROLES.swim) &&
    (
      existingRoles.includes(V14_CLOTHING_ROLES.upper) ||
      existingRoles.includes(V14_CLOTHING_ROLES.lower) ||
      existingRoles.includes(V14_CLOTHING_ROLES.onePiece)
    )
  ) {
    return true;
  }

  return false;
}


// -----------------------------------------
// OUTFIT STATE NORMALIZATION
// -----------------------------------------

function getV14ClothingItemsFromState(state) {

  if (!state) {
    return [];
  }

  if (Array.isArray(state.clothing)) {
    return state.clothing;
  }

  if (
    state.clothing &&
    Array.isArray(state.clothing.items)
  ) {
    return state.clothing.items;
  }

  if (
    state.clothing &&
    typeof state.clothing === "object"
  ) {
    return [state.clothing];
  }

  return [];
}


function getV14ClothingGroupsFromState(state) {

  const items =
    getV14ClothingItemsFromState(state);

  const groups = [];

  for (const item of items) {

    const groupId =
      getV14ClothingGroupId(item) ||
      findV14ClothingGroupForPreset(item);

    if (
      groupId &&
      !groups.includes(groupId)
    ) {
      groups.push(groupId);
    }
  }

  return groups;
}


function getV14ClothingRolesFromState(state) {

  const items =
    getV14ClothingItemsFromState(state);

  const roles = [];

  for (const item of items) {

    const itemRoles =
      getV14ClothingRoles(item);

    for (const role of itemRoles) {

      if (!roles.includes(role)) {
        roles.push(role);
      }
    }
  }

  return roles;
}


// -----------------------------------------
// CAN THIS ITEM BE ADDED?
// -----------------------------------------

function canAddV14ClothingItem(
  state,
  candidate
) {
  if (!candidate) {
    return false;
  }

  const candidateId =
    getPresetId(candidate);

  const metadata =
    getV14ClothingMetadata(candidateId);

  const candidateRoles =
    metadata
      ? metadata.roles
      : [];

  const existingItems =
    getV14ClothingItemsFromState(state);

  const existingRoles =
    getV14ClothingRolesFromState(state);

  // Never add the same preset twice.
  if (
    existingItems.some(
      item => getPresetId(item) === candidateId
    )
  ) {
    return false;
  }

  // Explicit metadata conflicts.
  if (metadata) {

    for (const conflictId of metadata.conflictsWith) {

      if (
        existingItems.some(
          item =>
            getPresetId(item) === conflictId
        )
      ) {
        return false;
      }
    }
  }

  // Role-level conflicts.
  if (
    v14ClothingRolesConflict(
      existingRoles,
      candidateRoles
    )
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// GROUP COMPATIBILITY
// -----------------------------------------

function canAddV14ClothingGroup(
  state,
  groupId
) {

  const metadata =
    V14_CLOTHING_METADATA[groupId];

  if (!metadata) {
    return true;
  }

  const existingRoles =
    getV14ClothingRolesFromState(state);

  if (
    v14ClothingRolesConflict(
      existingRoles,
      metadata.roles
    )
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// CLOTHING CONTEXT
// -----------------------------------------

function getV14ClothingContext(state) {

  return {
    gender:
      getStateValue(state, "gender"),

    nationality:
      getStateValue(state, "nationality"),

    profile:
      getStateValue(state, "nationalityProfile"),

    action:
      getStateValue(state, "action"),

    actionGroups:
      getStateValue(state, "actionGroups"),

    camera:
      getStateValue(state, "camera"),

    timeOfDay:
      getStateValue(state, "timeOfDay"),

    artStyle:
      getStateValue(state, "artStyle"),

    existingGroups:
      getV14ClothingGroupsFromState(state),

    existingRoles:
      getV14ClothingRolesFromState(state)
  };
}


// -----------------------------------------
// CLOTHING RELATIONSHIP DEFINITIONS
// -----------------------------------------
//
// These are deliberately broad relationships.
// They do not attempt to encode every possible
// social/cultural combination.
//
// The relationship engine handles the weighting.
// -----------------------------------------

function buildV14ClothingRelationshipDefinitions() {

  // ---------------------------------------
  // GROUP-LEVEL GENDER PREFERENCES
  // ---------------------------------------

  defineV14ClothingGroupRelationship(
    "clothingGroup.dresses",
    "preferred",
    {
      category: "gender",
      values: ["woman"]
    },
    "Dress-based clothing is more strongly associated with the feminine profile."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.lingerie",
    "preferred",
    {
      category: "gender",
      values: ["woman"]
    },
    "Lingerie is more strongly associated with the feminine profile."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.uniforms",
    "preferred",
    {
      category: "gender",
      values: ["woman"]
    },
    "Several available uniform presets are feminine-coded."
  );


  // ---------------------------------------
  // CONTEXTUAL CLOTHING PREFERENCES
  // ---------------------------------------

  defineV14ClothingGroupRelationship(
    "clothingGroup.footwear",
    "preferred",
    {
      category: "actionGroups",
      values: ["walking", "outdoor", "running"]
    },
    "Footwear is useful for active/outdoor scenes."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.swimwear",
    "preferred",
    {
      category: "actionGroups",
      values: ["outdoor"]
    },
    "Swimwear fits outdoor/swimming contexts."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.robes",
    "preferred",
    {
      category: "actionGroups",
      values: ["home", "interior"]
    },
    "Loungewear fits relaxed interior scenes."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.period",
    "preferred",
    {
      category: "artStyle",
      values: ["fashion", "editorial", "cinematic"]
    },
    "Period clothing benefits from fashion/editorial/cinematic presentation."
  );


  // ---------------------------------------
  // ACTION / CLOTHING RELATIONSHIPS
  // ---------------------------------------

  defineV14ClothingRelationship(
    "clothing.adjusting-clothing",
    "preferred",
    {
      category: "action",
      values: ["adjusting clothing"]
    },
    "The action explicitly involves clothing."
  );


  // ---------------------------------------
  // PROFILE-STYLE RELATIONSHIPS
  // ---------------------------------------

  defineV14ClothingRelationship(
    "clothing.traditional-sari",
    "preferred",
    {
      category: "nationalityProfile",
      values: ["southAsian"]
    },
    "The preset is culturally associated with South Asian styling."
  );

  defineV14ClothingRelationship(
    "clothing.kimono",
    "preferred",
    {
      category: "nationalityProfile",
      values: ["eastAsian"]
    },
    "The preset is associated with East Asian traditional styling."
  );

  defineV14ClothingRelationship(
    "clothing.burqa",
    "preferred",
    {
      category: "nationalityProfile",
      values: ["middleEastern"]
    },
    "The preset is associated with some Middle Eastern cultural contexts."
  );


  // ---------------------------------------
  // ODDITY / NORMAL CLOTHING RELATIONSHIPS
  // ---------------------------------------

  defineV14ClothingGroupRelationship(
    "clothingGroup.costumes",
    "neutral",
    {
      category: "artStyle",
      values: ["photo", "editorial", "cinematic", "street"]
    },
    "Costume clothing remains possible in ordinary photographic styles."
  );

  defineV14ClothingGroupRelationship(
    "clothingGroup.period",
    "discouraged",
    {
      category: "actionGroups",
      values: ["running", "outdoor"]
    },
    "Some period outfits are less practical for active scenes."
  );
}


// -----------------------------------------
// BUILD THE RELATIONSHIPS
// -----------------------------------------

buildV14ClothingRelationshipDefinitions();


// -----------------------------------------
// OUTFIT PRIMARY GROUP WEIGHTS
// -----------------------------------------
//
// These are not hard exclusions.
//
// They describe what a normal outfit is more
// likely to begin with.
//
// Compatibility rules still have the final say.
// -----------------------------------------

const V14_PRIMARY_CLOTHING_GROUP_WEIGHTS = {

  "clothingGroup.tops": 5,

  "clothingGroup.bottoms": 5,

  "clothingGroup.dresses": 2,

  "clothingGroup.swimwear": 1,

  "clothingGroup.robes": 1,

  "clothingGroup.sets": 1,

  "clothingGroup.uniforms": 0.7,

  "clothingGroup.costumes": 0.3,

  "clothingGroup.period": 0.5
};


// -----------------------------------------
// SECONDARY GROUP WEIGHTS
// -----------------------------------------

const V14_SECONDARY_CLOTHING_GROUP_WEIGHTS = {

  "clothingGroup.footwear": 4,

  "clothingGroup.bottoms": 3,

  "clothingGroup.tops": 3,

  "clothingGroup.robes": 1,

  "clothingGroup.lingerie": 0.5
};


// -----------------------------------------
// SELECT A PRIMARY GROUP
// -----------------------------------------

function chooseV14PrimaryClothingGroup(state) {

  const candidates =
    clothingGroups.filter(group => {

      const groupId =
        getPresetId(group);

      return (
        canAddV14ClothingGroup(
          state,
          groupId
        ) &&
        !isOptionBlockedV14(
          "clothingGroups",
          group,
          state
        )
      );
    });

  if (candidates.length === 0) {
    return null;
  }

  return weightedPickV14(
    candidates,
    candidate => {

      const id =
        getPresetId(candidate);

      return (
        V14_PRIMARY_CLOTHING_GROUP_WEIGHTS[id]
        ?? 1
      );
    },
    state
  );
}


// -----------------------------------------
// SELECT ITEM FROM GROUP
// -----------------------------------------

function chooseV14ClothingItem(
  state,
  group
) {

  if (!group || !Array.isArray(group.presets)) {
    return null;
  }

  const candidates =
    group.presets.filter(item => {

      if (
        !canAddV14ClothingItem(
          state,
          item
        )
      ) {
        return false;
      }

      return !isOptionBlockedV14(
        "clothing",
        item,
        state
      );
    });

  if (candidates.length === 0) {
    return null;
  }

  return weightedPickV14(
    candidates,
    candidate => {

      const relationshipWeight =
        getV14RelationshipMultiplier(
          "clothing",
          candidate,
          state
        );

      return relationshipWeight;
    },
    state
  );
}


// -----------------------------------------
// ADD CLOTHING TO STATE
// -----------------------------------------

function addV14ClothingToState(
  state,
  clothingItem
) {

  if (!clothingItem) {
    return false;
  }

  if (
    !canAddV14ClothingItem(
      state,
      clothingItem
    )
  ) {
    return false;
  }

  if (!Array.isArray(state.clothing)) {
    state.clothing = [];
  }

  state.clothing.push(
    clothingItem
  );

  state.clothingGroups =
    getV14ClothingGroupsFromState(state);

  return true;
}


// -----------------------------------------
// SELECT A SECONDARY GROUP
// -----------------------------------------

function chooseV14SecondaryClothingGroup(state) {

  const candidates =
    clothingGroups.filter(group => {

      const groupId =
        getPresetId(group);

      if (
        !canAddV14ClothingGroup(
          state,
          groupId
        )
      ) {
        return false;
      }

      return !isOptionBlockedV14(
        "clothingGroups",
        group,
        state
      );
    });

  if (candidates.length === 0) {
    return null;
  }

  return weightedPickV14(
    candidates,
    candidate => {

      const id =
        getPresetId(candidate);

      return (
        V14_SECONDARY_CLOTHING_GROUP_WEIGHTS[id]
        ?? 0.25
      );
    },
    state
  );
}


// -----------------------------------------
// BUILD COMPLETE RANDOM OUTFIT
// -----------------------------------------

function randomizeClothingV14(state, config) {

  state.clothing = [];
  state.clothingGroups = [];

  const primaryGroup =
    chooseV14PrimaryClothingGroup(state);

  if (primaryGroup) {

    const primaryItem =
      chooseV14ClothingItem(
        state,
        primaryGroup
      );

    if (primaryItem) {
      addV14ClothingToState(
        state,
        primaryItem
      );
    }
  }


  // Try to add compatible secondary pieces.
  //
  // We deliberately make several small decisions
  // instead of blindly selecting every clothing group.

  const secondaryAttempts = 3;

  for (
    let attempt = 0;
    attempt < secondaryAttempts;
    attempt++
  ) {

    const secondaryGroup =
      chooseV14SecondaryClothingGroup(state);

    if (!secondaryGroup) {
      continue;
    }

    const item =
      chooseV14ClothingItem(
        state,
        secondaryGroup
      );

    if (!item) {
      continue;
    }

    addV14ClothingToState(
      state,
      item
    );
  }


  state.clothingGroups =
    getV14ClothingGroupsFromState(state);

  return state;
}


// -----------------------------------------
// OUTFIT VALIDATION
// -----------------------------------------

function validateV14Outfit(state) {

  const items =
    getV14ClothingItemsFromState(state);

  const problems = [];

  const seenIds = new Set();

  for (const item of items) {

    const id =
      getPresetId(item);

    if (seenIds.has(id)) {
      problems.push({
        type: "duplicate",
        id
      });
    }

    seenIds.add(id);
  }


  const roles =
    getV14ClothingRolesFromState(state);

  if (
    roles.includes(V14_CLOTHING_ROLES.onePiece) &&
    (
      roles.includes(V14_CLOTHING_ROLES.upper) ||
      roles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    problems.push({
      type: "onePieceConflict"
    });
  }


  if (
    roles.includes(V14_CLOTHING_ROLES.outfit) &&
    (
      roles.includes(V14_CLOTHING_ROLES.upper) ||
      roles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    problems.push({
      type: "outfitConflict"
    });
  }


  if (
    roles.includes(V14_CLOTHING_ROLES.swim) &&
    (
      roles.includes(V14_CLOTHING_ROLES.upper) ||
      roles.includes(V14_CLOTHING_ROLES.lower)
    )
  ) {
    problems.push({
      type: "swimConflict"
    });
  }


  return {
    valid: problems.length === 0,
    problems
  };
}


// -----------------------------------------
// REPAIR OUTFIT
// -----------------------------------------

function repairV14Outfit(state) {

  if (!Array.isArray(state.clothing)) {
    state.clothing = [];
  }

  const repaired = [];
  const usedIds = new Set();

  for (const item of state.clothing) {

    const id =
      getPresetId(item);

    if (usedIds.has(id)) {
      continue;
    }

    const testState =
      cloneGenerationState(state);

    testState.clothing =
      repaired.slice();

    if (
      canAddV14ClothingItem(
        testState,
        item
      )
    ) {
      repaired.push(item);
      usedIds.add(id);
    }
  }

  state.clothing =
    repaired;

  state.clothingGroups =
    getV14ClothingGroupsFromState(state);

  return state;
}


// -----------------------------------------
// FINAL OUTFIT PREPARATION
// -----------------------------------------

function prepareV14Outfit(state, config) {

  if (!state) {
    return state;
  }

  repairV14Outfit(state);

  if (
    !Array.isArray(state.clothing) ||
    state.clothing.length === 0
  ) {
    randomizeClothingV14(
      state,
      config
    );
  }

  repairV14Outfit(state);

  return state;
}


// -----------------------------------------
// PUBLIC CLOTHING ENGINE
// -----------------------------------------

const V14_CLOTHING_ENGINE = {

  metadata: V14_CLOTHING_METADATA,

  roles: V14_CLOTHING_ROLES,

  groupRoles: V14_CLOTHING_GROUP_ROLES,

  getMetadata:
    getV14ClothingMetadata,

  getRoles:
    getV14ClothingRoles,

  getGroup:
    getV14ClothingGroupId,

  canAddItem:
    canAddV14ClothingItem,

  canAddGroup:
    canAddV14ClothingGroup,

  choosePrimaryGroup:
    chooseV14PrimaryClothingGroup,

  chooseItem:
    chooseV14ClothingItem,

  randomize:
    randomizeClothingV14,

  validate:
    validateV14Outfit,

  repair:
    repairV14Outfit,

  prepare:
    prepareV14Outfit
};
// =========================================
// V14 EXACT CLOTHING METADATA
// =========================================
//
// Every clothing preset gets stable metadata.
// No array indexes are used.
//
// This is where the generator learns that:
//
//   a T-shirt = upper
//   jeans = lower
//   a dress = one-piece
//   heels = footwear
//
// etc.
//
// The relationship engine remains responsible for
// gender/context compatibility.
// =========================================


// -----------------------------------------
// METADATA REGISTRATION HELPERS
// -----------------------------------------

function registerV14ClothingItems(
  groupId,
  role,
  items,
  options = {}
) {
  if (!Array.isArray(items)) {
    return;
  }

  for (const item of items) {

    const id =
      getPresetId(item);

    if (!id) {
      continue;
    }

    registerV14ClothingPresetMetadata(
      id,
      groupId,
      role,
      options
    );
  }
}


// -----------------------------------------
// REGISTER EVERY EXISTING CLOTHING PRESET
// -----------------------------------------

for (const group of clothingGroups) {

  const groupId =
    getPresetId(group);

  const groupRoles =
    V14_CLOTHING_GROUP_ROLES[groupId] || [];

  for (const item of group.presets || []) {

    const itemId =
      getPresetId(item);

    if (!itemId) {
      continue;
    }

    registerV14ClothingPresetMetadata(
      itemId,
      groupId,
      groupRoles
    );
  }
}


// -----------------------------------------
// SPECIAL ITEM ROLES
// -----------------------------------------
//
// Some items have a more specific role than their
// parent group.
//
// For example:
//
//   Bra and Panties = underwear
//   Bikini = swim
//   Sneakers = footwear
//
// -----------------------------------------

function setV14ClothingItemRoles(
  itemId,
  roles
) {

  const metadata =
    V14_CLOTHING_METADATA[itemId];

  if (!metadata) {
    return;
  }

  metadata.roles =
    Array.isArray(roles)
      ? roles
      : [roles];
}


// -----------------------------------------
// IDENTIFY SPECIAL ITEMS BY LABEL
// -----------------------------------------

function findV14ClothingItemsByLabels(labels) {

  const wanted =
    new Set(
      labels.map(
        label => label.toLowerCase()
      )
    );

  const results = [];

  for (const group of clothingGroups) {

    for (const item of group.presets || []) {

      const label =
        getPresetLabel(item);

      if (
        wanted.has(
          String(label).toLowerCase()
        )
      ) {
        results.push(item);
      }
    }
  }

  return results;
}


function setV14RolesByLabels(
  labels,
  roles
) {

  const items =
    findV14ClothingItemsByLabels(
      labels
    );

  for (const item of items) {

    setV14ClothingItemRoles(
      getPresetId(item),
      roles
    );
  }
}


// -----------------------------------------
// FOOTWEAR
// -----------------------------------------

setV14RolesByLabels(
  [
    "Sneakers",
    "Boots",
    "Ankle Boots",
    "Heels",
    "Stiletto Heels",
    "Thigh-High Leather Boots",
    "Lace-Up Thigh-Highs",
    "Sandals"
  ],
  [
    V14_CLOTHING_ROLES.footwear
  ]
);


// -----------------------------------------
// SWIMWEAR
// -----------------------------------------

setV14RolesByLabels(
  [
    "One-Piece Swimsuit",
    "Bikini",
    "Bikini Top",
    "Board Shorts"
  ],
  [
    V14_CLOTHING_ROLES.swim
  ]
);


// -----------------------------------------
// LINGERIE
// -----------------------------------------

setV14RolesByLabels(
  [
    "Bra and Panties",
    "Lace Bra and Panties",
    "Babydoll",
    "Silk Cami and Shorts"
  ],
  [
    V14_CLOTHING_ROLES.underwear
  ]
);


// -----------------------------------------
// ROBES / LOUNGEWEAR
// -----------------------------------------

setV14RolesByLabels(
  [
    "Silk Robe",
    "Bathrobe",
    "Pajamas",
    "Lingerie Robe"
  ],
  [
    V14_CLOTHING_ROLES.lounge
  ]
);


// -----------------------------------------
// COMPLETE OUTFITS
// -----------------------------------------

setV14RolesByLabels(
  [
    "Pantsuit",
    "Sweatsuit",
    "Schoolgirl Uniform",
    "Business Uniform",
    "Nurse Uniform",
    "Military Uniform",
    "Victorian Suit"
  ],
  [
    V14_CLOTHING_ROLES.outfit
  ]
);


// -----------------------------------------
// ONE-PIECE ITEMS
// -----------------------------------------

setV14RolesByLabels(
  [
    "Casual Dress",
    "Sundress",
    "Cocktail Dress",
    "Evening Gown",
    "Bodycon Dress",
    "Victorian Dress",
    "1920s Flapper Dress",
    "1950s Dress"
  ],
  [
    V14_CLOTHING_ROLES.onePiece
  ]
);


// -----------------------------------------
// SETS
// -----------------------------------------

setV14RolesByLabels(
  [
    "Skirt and Blouse",
    "Cami and Shorts Set"
  ],
  [
    V14_CLOTHING_ROLES.outfit
  ]
);


// -----------------------------------------
// COSTUME OUTFITS
// -----------------------------------------

setV14RolesByLabels(
  [
    "Black Fishnet Stockings",
    "Sheer Lace Stockings",
    "Knee-High Hello Kitty Socks",
    "Pokemon Socks"
  ],
  [
    V14_CLOTHING_ROLES.accessory
  ]
);


// -----------------------------------------
// EXPLICIT CLOTHING TAGS
// -----------------------------------------

function addV14ClothingTags(
  labels,
  tags
) {

  const items =
    findV14ClothingItemsByLabels(
      labels
    );

  for (const item of items) {

    const id =
      getPresetId(item);

    const metadata =
      V14_CLOTHING_METADATA[id];

    if (!metadata) {
      continue;
    }

    for (const tag of tags) {

      if (!metadata.tags.includes(tag)) {
        metadata.tags.push(tag);
      }
    }
  }
}


// Feminine-coded items.
// These are preferences rather than universal exclusions.

addV14ClothingTags(
  [
    "Blouse",
    "Camisole",
    "Crop Top",
    "Halter Top",
    "Off-Shoulder Top",
    "Tube Top",
    "Skirt",
    "Mini Skirt",
    "Pleated Mini Skirt",
    "Wrap-Around Skirt",
    "Casual Dress",
    "Sundress",
    "Cocktail Dress",
    "Evening Gown",
    "Bodycon Dress",
    "Bra and Panties",
    "Lace Bra and Panties",
    "Babydoll",
    "Silk Cami and Shorts",
    "Schoolgirl Uniform",
    "Nurse Uniform",
    "Heels",
    "Stiletto Heels",
    "Thigh-High Leather Boots",
    "Lace-Up Thigh-Highs",
    "Black Fishnet Stockings",
    "Sheer Lace Stockings",
    "Knee-High Hello Kitty Socks",
    "Pokemon Socks"
  ],
  [
    "feminine-coded"
  ]
);


// Masculine-coded items.

addV14ClothingTags(
  [
    "Button-Down Shirt",
    "Dress Pants",
    "Military Uniform",
    "Victorian Suit"
  ],
  [
    "masculine-coded"
  ]
);


// Practical / active clothing.

addV14ClothingTags(
  [
    "T-Shirt",
    "Long Sleeve Shirt",
    "Tank Top",
    "Hoodie",
    "Jeans",
    "Trousers",
    "Shorts",
    "Denim Shorts",
    "Leggings",
    "Spandex Leggings",
    "Sneakers",
    "Boots",
    "Ankle Boots",
    "Sandals"
  ],
  [
    "casual",
    "active"
  ]
);


// -----------------------------------------
// GENDER RELATIONSHIPS
// -----------------------------------------
//
// These replace the old:
//
//   MASCULINE_CLOTHING_EXCLUSIONS
//
// system.
//
// Nothing here says that a person MUST wear or
// cannot wear something merely because of gender,
// except where the original V13 generator had
// explicit exclusions.
//
// Most are therefore discouraged rather than blocked.
// -----------------------------------------

function addV14GenderClothingRelationship(
  labels,
  type,
  gender,
  reason
) {

  const items =
    findV14ClothingItemsByLabels(
      labels
    );

  for (const item of items) {

    defineV14ClothingRelationship(
      getPresetId(item),
      type,
      {
        category: "gender",
        values: [gender]
      },
      reason
    );
  }
}


// Feminine-coded clothing.

addV14GenderClothingRelationship(
  [
    "Blouse",
    "Camisole",
    "Crop Top",
    "Halter Top",
    "Off-Shoulder Top",
    "Tube Top",
    "Skirt",
    "Mini Skirt",
    "Pleated Mini Skirt",
    "Wrap-Around Skirt",
    "Heels",
    "Stiletto Heels",
    "Thigh-High Leather Boots",
    "Lace-Up Thigh-Highs"
  ],
  "preferred",
  "woman",
  "This clothing is feminine-coded in the available preset collection."
);


addV14GenderClothingRelationship(
  [
    "Blouse",
    "Camisole",
    "Crop Top",
    "Halter Top",
    "Off-Shoulder Top",
    "Tube Top",
    "Skirt",
    "Mini Skirt",
    "Pleated Mini Skirt",
    "Wrap-Around Skirt",
    "Heels",
    "Stiletto Heels",
    "Thigh-High Leather Boots",
    "Lace-Up Thigh-Highs"
  ],
  "discouraged",
  "man",
  "This clothing is feminine-coded in the available preset collection."
);


// Explicit V13 exclusions.

addV14GenderClothingRelationship(
  [
    "Crop Top",
    "Blouse",
    "Halter Top",
    "Off-Shoulder Top",
    "Spandex Leggings",
    "Mini Skirt",
    "Pleated Mini Skirt",
    "Wrap-Around Skirt",
    "Silk Cami and Shorts",
    "Knee-High Hello Kitty Socks",
    "Pokemon Socks",
    "Black Fishnet Stockings",
    "Sheer Lace Stockings",
    "Heels",
    "Stiletto Heels",
    "Thigh-High Leather Boots",
    "Lace-Up Thigh-Highs"
  ],
  "blocked",
  "man",
  "Explicit masculine-generation exclusion carried over from V13."
);


// Dresses and lingerie.

addV14GenderClothingRelationship(
  [
    "Casual Dress",
    "Sundress",
    "Cocktail Dress",
    "Evening Gown",
    "Bodycon Dress",
    "Bra and Panties",
    "Lace Bra and Panties",
    "Babydoll",
    "Silk Cami and Shorts"
  ],
  "blocked",
  "man",
  "Dresses and lingerie were excluded from V13 masculine random generation."
);


// Fishnet/lace stockings.

addV14GenderClothingRelationship(
  [
    "Black Fishnet Stockings",
    "Sheer Lace Stockings"
  ],
  "blocked",
  "man",
  "Explicit V13 masculine clothing exclusion."
);


// -----------------------------------------
// MASCULINE CLOTHING PREFERENCES
// -----------------------------------------

addV14GenderClothingRelationship(
  [
    "Button-Down Shirt",
    "Dress Pants",
    "Military Uniform",
    "Victorian Suit"
  ],
  "preferred",
  "man",
  "These presets are masculine-coded in the available clothing collection."
);


// -----------------------------------------
// WOMEN'S CLOTHING SHOULD NOT REQUIRE
// A WOMAN UNLESS THE USER REQUESTS IT.
//
// This is intentional.
//
// "Preferred woman" means more likely.
// "Blocked man" represents only the explicit
// V13 exclusions.
//
// Therefore manual selection remains deliberate.
// -----------------------------------------


// -----------------------------------------
// ACTION / CLOTHING COMPATIBILITY
// -----------------------------------------

function addV14ActionClothingRelationship(
  clothingLabels,
  actionValues,
  type,
  reason
) {

  const items =
    findV14ClothingItemsByLabels(
      clothingLabels
    );

  for (const item of items) {

    defineV14ClothingRelationship(
      getPresetId(item),
      type,
      {
        category: "action",
        values: actionValues
      },
      reason
    );
  }
}


// Active actions favor practical clothing.

addV14ActionClothingRelationship(
  [
    "T-Shirt",
    "Tank Top",
    "Hoodie",
    "Jeans",
    "Shorts",
    "Denim Shorts",
    "Leggings",
    "Spandex Leggings",
    "Sneakers",
    "Boots",
    "Ankle Boots"
  ],
  [
    "exercising",
    "running",
    "cycling",
    "hiking",
    "stretching",
    "yoga"
  ],
  "preferred",
  "Practical/active clothing fits an active action."
);


// Formal clothing is discouraged during hard exercise.

addV14ActionClothingRelationship(
  [
    "Evening Gown",
    "Cocktail Dress",
    "Victorian Dress",
    "1920s Flapper Dress",
    "1950s Dress",
    "Victorian Suit",
    "Business Uniform"
  ],
  [
    "running",
    "cycling",
    "exercising"
  ],
  "discouraged",
  "Formal or period clothing is less typical for vigorous activity."
);


// Lingerie is discouraged during ordinary cooking.

addV14ActionClothingRelationship(
  [
    "Bra and Panties",
    "Lace Bra and Panties",
    "Babydoll",
    "Silk Cami and Shorts",
    "Lingerie Robe"
  ],
  [
    "cooking"
  ],
  "discouraged",
  "Lingerie is less typical for an ordinary cooking scene."
);


// Swimwear fits outdoor scenes.

addV14ActionClothingRelationship(
  [
    "One-Piece Swimsuit",
    "Bikini",
    "Bikini Top",
    "Board Shorts"
  ],
  [
    "sitting outdoors",
    "walking outdoors",
    "looking at scenery"
  ],
  "preferred",
  "Swimwear can fit an outdoor setting."
);


// -----------------------------------------
// CAMERA / CLOTHING RELATIONSHIPS
// -----------------------------------------

addV14ActionClothingRelationship(
  [
    "Casual Dress",
    "Sundress",
    "Cocktail Dress",
    "Evening Gown",
    "Bodycon Dress",
    "Skirt and Blouse",
    "Pantsuit"
  ],
  [
    "looking directly at camera"
  ],
  "preferred",
  "Fashion-oriented clothing works naturally with direct portrait presentation."
);


// -----------------------------------------
// REBUILD RELATIONSHIP ENGINE
// -----------------------------------------
//
// The clothing definitions above were added after
// the original relationship build.
//
// Rebuild now so every definition is accumulated.
// -----------------------------------------

if (
  typeof rebuildV14RelationshipEngine === "function"
) {
  rebuildV14RelationshipEngine();
}


// -----------------------------------------
// CLOTHING RELATIONSHIP REPORT
// -----------------------------------------

function getV14ClothingRelationshipReport(
  state,
  clothingItem
) {

  if (!clothingItem) {
    return {
      label: "",
      id: "",
      relationships: []
    };
  }

  return {
    label:
      getPresetLabel(clothingItem),

    id:
      getPresetId(clothingItem),

    group:
      getV14ClothingGroupId(
        clothingItem
      ),

    roles:
      getV14ClothingRoles(
        clothingItem
      ),

    relationships:
      getV14EffectiveRelationships(
        "clothing",
        clothingItem,
        state
      ),

    blocked:
      isOptionBlockedV14(
        "clothing",
        clothingItem,
        state
      ),

    required:
      isOptionRequiredV14(
        "clothing",
        clothingItem,
        state
      ),

    multiplier:
      getV14RelationshipMultiplier(
        "clothing",
        clothingItem,
        state
      )
  };
}


// -----------------------------------------
// OUTFIT EXPLANATION
// -----------------------------------------

function explainV14Outfit(state) {

  const items =
    getV14ClothingItemsFromState(state);

  return items.map(item => {

    const report =
      getV14ClothingRelationshipReport(
        state,
        item
      );

    return {
      id: report.id,
      label: report.label,
      group: report.group,
      roles: report.roles,
      multiplier: report.multiplier,
      blocked: report.blocked,
      required: report.required
    };

  });
}


// -----------------------------------------
// PUBLIC API
// -----------------------------------------

const V14_CLOTHING_RELATIONSHIP_ENGINE = {

  metadata:
    V14_CLOTHING_METADATA,

  roles:
    V14_CLOTHING_ROLES,

  getContext:
    getV14ClothingContext,

  getMetadata:
    getV14ClothingMetadata,

  getRoles:
    getV14ClothingRoles,

  canAddItem:
    canAddV14ClothingItem,

  canAddGroup:
    canAddV14ClothingGroup,

  validate:
    validateV14Outfit,

  repair:
    repairV14Outfit,

  report:
    getV14ClothingRelationshipReport,

  explain:
    explainV14Outfit

};
// =========================================
// V14 ACTION RELATIONSHIP + SCENE ENGINE
// =========================================
//
// Actions are now selected with awareness of:
//
//   gender
//   clothing
//   clothing groups
//   body/profile state
//   camera
//   lighting
//   time of day
//   art style
//
// The action itself is still a deliberate preset.
// Relationships only influence compatibility/weight.
// =========================================


// -----------------------------------------
// ACTION METADATA
// -----------------------------------------

const V14_ACTION_METADATA = {};


function registerV14ActionMetadata(
  action,
  options = {}
) {

  const id =
    getPresetId(action);

  if (!id) {
    return;
  }

  V14_ACTION_METADATA[id] = {

    id,

    groupId:
      options.groupId ||
      "",

    tags:
      Array.isArray(options.tags)
        ? options.tags
        : [],

    scene:
      options.scene ||
      "general",

    energy:
      options.energy ||
      "neutral",

    requiresClothing:
      options.requiresClothing || [],

    conflictsWithClothing:
      options.conflictsWithClothing || []
  };
}


function getV14ActionMetadata(actionOrId) {

  const id =
    typeof actionOrId === "string"
      ? actionOrId
      : getPresetId(actionOrId);

  return V14_ACTION_METADATA[id] || null;
}


// -----------------------------------------
// REGISTER ALL ACTIONS
// -----------------------------------------

for (const group of actionGroups) {

  const groupId =
    getPresetId(group);

  for (const action of group.presets || []) {

    registerV14ActionMetadata(
      action,
      {
        groupId
      }
    );
  }
}


// -----------------------------------------
// ACTION TAGS
// -----------------------------------------

function addV14ActionTags(
  labels,
  tags,
  options = {}
) {

  const wanted =
    new Set(
      labels.map(
        value =>
          String(value).toLowerCase()
      )
    );

  for (const group of actionGroups) {

    const groupId =
      getPresetId(group);

    for (const action of group.presets || []) {

      const label =
        String(
          getPresetLabel(action)
        ).toLowerCase();

      if (!wanted.has(label)) {
        continue;
      }

      const id =
        getPresetId(action);

      const metadata =
        V14_ACTION_METADATA[id];

      if (!metadata) {
        continue;
      }

      for (const tag of tags) {

        if (!metadata.tags.includes(tag)) {
          metadata.tags.push(tag);
        }
      }

      if (options.scene) {
        metadata.scene =
          options.scene;
      }

      if (options.energy) {
        metadata.energy =
          options.energy;
      }
    }
  }
}


// -----------------------------------------
// ACTION TAG GROUPS
// -----------------------------------------

addV14ActionTags(
  [
    "smiling",
    "laughing",
    "waving",
    "greeting"
  ],
  [
    "social",
    "portrait-friendly"
  ]
);


addV14ActionTags(
  [
    "walking",
    "running",
    "stretching",
    "yoga",
    "exercising",
    "cycling",
    "hiking"
  ],
  [
    "active",
    "outdoor-compatible"
  ],
  {
    scene: "active",
    energy: "high"
  }
);


addV14ActionTags(
  [
    "reading",
    "drinking",
    "eating",
    "cooking",
    "using smartphone",
    "listening to music",
    "relaxing"
  ],
  [
    "casual",
    "interior-compatible"
  ],
  {
    scene: "interior",
    energy: "low"
  }
);


addV14ActionTags(
  [
    "dancing"
  ],
  [
    "active",
    "social"
  ],
  {
    scene: "social",
    energy: "high"
  }
);


addV14ActionTags(
  [
    "mirror selfie",
    "standing in front of mirror",
    "checking appearance",
    "adjusting clothing"
  ],
  [
    "mirror",
    "appearance-focused"
  ],
  {
    scene: "interior",
    energy: "low"
  }
);


addV14ActionTags(
  [
    "sitting near fireplace",
    "reading couch",
    "making coffee",
    "cooking meal",
    "watering plants",
    "cleaning",
    "relaxing"
  ],
  [
    "home",
    "interior-compatible"
  ],
  {
    scene: "home",
    energy: "low"
  }
);


addV14ActionTags(
  [
    "walking outdoors",
    "sitting bench",
    "looking scenery",
    "hiking",
    "running outdoors",
    "cycling"
  ],
  [
    "outdoor",
    "environmental"
  ],
  {
    scene: "outdoor",
    energy: "medium"
  }
);


addV14ActionTags(
  [
    "talking",
    "laughing with someone",
    "waving",
    "greeting"
  ],
  [
    "social",
    "multi-person-compatible"
  ],
  {
    scene: "social",
    energy: "medium"
  }
);


// -----------------------------------------
// ACTION LOOKUP
// -----------------------------------------

function findV14ActionByLabel(label) {

  const target =
    String(label).toLowerCase();

  for (const group of actionGroups) {

    for (const action of group.presets || []) {

      if (
        String(
          getPresetLabel(action)
        ).toLowerCase() === target
      ) {
        return action;
      }
    }
  }

  return null;
}


function getV14ActionGroupId(action) {

  const metadata =
    getV14ActionMetadata(action);

  return metadata
    ? metadata.groupId
    : "";
}


function getV14ActionGroup(action) {

  const groupId =
    getV14ActionGroupId(action);

  if (!groupId) {
    return null;
  }

  return actionGroups.find(
    group =>
      getPresetId(group) === groupId
  ) || null;
}


// -----------------------------------------
// STORE ACTION + GROUP TOGETHER
// -----------------------------------------

function storeV14ActionSelection(
  state,
  action
) {

  if (!state || !action) {
    return;
  }

  state.action =
    action;

  const groupId =
    getV14ActionGroupId(action);

  if (groupId) {

    const group =
      getV14ActionGroup(action);

    state.actionGroups =
      group
        ? [group]
        : [];
  }
  else {
    state.actionGroups = [];
  }
}


// -----------------------------------------
// ACTION GROUP STATE VALUE
// -----------------------------------------

function getV14ActionGroupValues(state) {

  if (!state) {
    return [];
  }

  const values = [];

  const groups =
    Array.isArray(state.actionGroups)
      ? state.actionGroups
      : [];

  for (const group of groups) {

    values.push(
      getPresetValue(group)
    );

    values.push(
      getPresetLabel(group)
    );

    values.push(
      getPresetId(group)
    );
  }

  return values.filter(Boolean);
}


// -----------------------------------------
// ACTION CONTEXT
// -----------------------------------------

function getV14ActionContext(state) {

  const action =
    state
      ? getStateValue(
        state,
        "action"
      )
      : "";

  const actionObject =
    state
      ? (
        state.action &&
          typeof state.action === "object"
          ? state.action
          : findV14ActionByLabel(action)
      )
      : null;

  const metadata =
    getV14ActionMetadata(
      actionObject
    );

  return {

    action,

    actionId:
      actionObject
        ? getPresetId(actionObject)
        : "",

    group:
      metadata
        ? metadata.groupId
        : "",

    tags:
      metadata
        ? metadata.tags.slice()
        : [],

    scene:
      metadata
        ? metadata.scene
        : "general",

    energy:
      metadata
        ? metadata.energy
        : "neutral"
  };
}


// -----------------------------------------
// CLOTHING COMPATIBILITY
// -----------------------------------------

function v14ActionClothingCompatible(
  state,
  action
) {

  if (!action) {
    return false;
  }

  const metadata =
    getV14ActionMetadata(action);

  if (!metadata) {
    return true;
  }

  const items =
    getV14ClothingItemsFromState(
      state
    );

  const itemIds =
    new Set(
      items.map(
        item => getPresetId(item)
      )
    );


  // Explicit clothing requirements.

  if (
    metadata.requiresClothing.length > 0
  ) {

    const hasRequired =
      metadata.requiresClothing.some(
        id =>
          itemIds.has(id)
      );

    if (!hasRequired) {
      return false;
    }
  }


  // Explicit clothing conflicts.

  for (
    const conflictId
    of metadata.conflictsWithClothing
  ) {

    if (
      itemIds.has(conflictId)
    ) {
      return false;
    }
  }


  return true;
}


// -----------------------------------------
// ACTION SCENE WEIGHT
// -----------------------------------------

function getV14ActionSceneWeight(
  action,
  state
) {

  if (!action) {
    return 0;
  }

  if (
    !v14ActionClothingCompatible(
      state,
      action
    )
  ) {
    return 0;
  }

  const metadata =
    getV14ActionMetadata(action);

  if (!metadata) {
    return 1;
  }

  let weight = 1;


  // ---------------------------------------
  // CLOTHING CONTEXT
  // ---------------------------------------

  const clothingGroups =
    getV14ClothingGroupsFromState(
      state
    );


  if (
    clothingGroups.includes(
      "clothingGroup.swimwear"
    )
  ) {

    if (
      metadata.tags.includes("outdoor-compatible")
    ) {
      weight *= 3;
    }
  }


  if (
    clothingGroups.includes(
      "clothingGroup.robes"
    )
  ) {

    if (
      metadata.tags.includes(
        "interior-compatible"
      )
    ) {
      weight *= 3;
    }

    if (
      metadata.tags.includes("active")
    ) {
      weight *= 0.2;
    }
  }


  if (
    clothingGroups.includes(
      "clothingGroup.period"
    )
  ) {

    if (
      metadata.tags.includes("active")
    ) {
      weight *= 0.35;
    }
  }


  // ---------------------------------------
  // CAMERA CONTEXT
  // ---------------------------------------

  const camera =
    getStateValue(
      state,
      "camera"
    );


  if (
    camera === "mirror"
  ) {

    if (
      metadata.tags.includes("mirror")
    ) {
      weight *= 8;
    }
    else {
      weight *= 0.15;
    }
  }


  // ---------------------------------------
  // TIME / LIGHTING CONTEXT
  // ---------------------------------------

  const timeOfDay =
    getStateValue(
      state,
      "timeOfDay"
    );


  if (
    timeOfDay === "night"
  ) {

    if (
      metadata.tags.includes("outdoor-compatible")
    ) {
      weight *= 0.8;
    }
  }


  // ---------------------------------------
  // ART STYLE
  // ---------------------------------------

  const artStyle =
    getStateValue(
      state,
      "artStyle"
    );


  if (
    artStyle === "documentary"
  ) {

    if (
      metadata.tags.includes("social") ||
      metadata.tags.includes("environmental")
    ) {
      weight *= 2;
    }
  }


  if (
    artStyle === "fashion"
  ) {

    if (
      metadata.tags.includes(
        "portrait-friendly"
      )
    ) {
      weight *= 1.5;
    }
  }


  return Math.max(
    0.01,
    weight
  );
}


// -----------------------------------------
// COMPATIBLE ACTION CANDIDATES
// -----------------------------------------

function getV14CompatibleActionCandidates(
  state
) {

  const candidates = [];

  for (const group of actionGroups) {

    for (const action of group.presets || []) {

      if (
        isOptionBlockedV14(
          "action",
          action,
          state
        )
      ) {
        continue;
      }

      if (
        !v14ActionClothingCompatible(
          state,
          action
        )
      ) {
        continue;
      }

      const weight =
        getV14ActionSceneWeight(
          action,
          state
        );

      if (weight <= 0) {
        continue;
      }

      candidates.push({
        preset: action,
        weight
      });
    }
  }

  return candidates;
}


// -----------------------------------------
// CHOOSE ACTION
// -----------------------------------------

function chooseV14ActionForState(
  state
) {

  const candidates =
    getV14CompatibleActionCandidates(
      state
    );

  if (candidates.length === 0) {
    return null;
  }

  const chosen =
    weightedPickV14(
      candidates,
      candidate => {

        const relationshipWeight =
          getV14RelationshipMultiplier(
            "action",
            candidate.preset,
            state
          );

        return (
          candidate.weight *
          relationshipWeight
        );
      },
      state
    );

  return chosen || null;
}


// -----------------------------------------
// RANDOMIZE ACTION
// -----------------------------------------

function randomizeActionV14(
  state,
  config
) {

  const action =
    chooseV14ActionForState(
      state
    );

  if (action) {

    storeV14ActionSelection(
      state,
      action
    );
  }

  return state;
}


// -----------------------------------------
// ACTION RELATIONSHIP DEFINITIONS
// -----------------------------------------

function defineV14ActionRelationshipForLabels(
  labels,
  type,
  condition,
  reason
) {

  for (const label of labels) {

    const action =
      findV14ActionByLabel(label);

    if (!action) {
      continue;
    }

    defineV14Relationship(
      "action",
      getPresetId(action),
      type,
      condition,
      reason
    );
  }
}


// -----------------------------------------
// CLOTHING RELATIONSHIPS
// -----------------------------------------

defineV14ActionRelationshipForLabels(
  [
    "cooking",
    "cooking meal"
  ],
  "preferred",
  {
    category: "clothingGroups",
    values: [
      "clothingGroup.tops",
      "clothingGroup.bottoms",
      "clothingGroup.sets",
      "clothingGroup.uniforms"
    ]
  },
  "Cooking is more compatible with ordinary kitchen clothing."
);


defineV14ActionRelationshipForLabels(
  [
    "reading",
    "reading couch",
    "relaxing",
    "sitting near fireplace"
  ],
  "preferred",
  {
    category: "clothingGroups",
    values: [
      "clothingGroup.robes"
    ]
  },
  "Relaxed indoor actions are compatible with loungewear."
);


defineV14ActionRelationshipForLabels(
  [
    "running",
    "running outdoors",
    "cycling",
    "hiking",
    "exercising",
    "stretching",
    "yoga"
  ],
  "preferred",
  {
    category: "clothingGroups",
    values: [
      "clothingGroup.footwear"
    ]
  },
  "Active scenes benefit from footwear."
);


// -----------------------------------------
// CAMERA RELATIONSHIPS
// -----------------------------------------

defineV14ActionRelationshipForLabels(
  [
    "mirror selfie",
    "standing in front of mirror",
    "checking appearance",
    "adjusting clothing"
  ],
  "required",
  {
    category: "camera",
    values: ["mirror"]
  },
  "Mirror-oriented actions naturally call for a mirror camera."
);


defineV14ActionRelationshipForLabels(
  [
    "smiling",
    "laughing",
    "looking directly at camera",
    "standing relaxed"
  ],
  "preferred",
  {
    category: "camera",
    values: [
      "portrait",
      "close-up",
      "medium shot"
    ]
  },
  "Portrait-oriented actions fit portrait framing."
);


// -----------------------------------------
// TIME / SCENE RELATIONSHIPS
// -----------------------------------------

defineV14ActionRelationshipForLabels(
  [
    "walking outdoors",
    "running outdoors",
    "cycling",
    "hiking",
    "looking scenery"
  ],
  "preferred",
  {
    category: "timeOfDay",
    values: [
      "daytime",
      "morning",
      "midday",
      "afternoon",
      "golden hour"
    ]
  },
  "Outdoor activities are naturally compatible with daytime scenes."
);


// -----------------------------------------
// REBUILD RELATIONSHIPS
// -----------------------------------------

if (
  typeof rebuildV14RelationshipEngine === "function"
) {
  rebuildV14RelationshipEngine();
}


// -----------------------------------------
// PUBLIC ACTION ENGINE
// -----------------------------------------

const V14_ACTION_ENGINE = {

  metadata:
    V14_ACTION_METADATA,

  getMetadata:
    getV14ActionMetadata,

  getContext:
    getV14ActionContext,

  getGroup:
    getV14ActionGroup,

  store:
    storeV14ActionSelection,

  candidates:
    getV14CompatibleActionCandidates,

  choose:
    chooseV14ActionForState,

  randomize:
    randomizeActionV14,

  sceneWeight:
    getV14ActionSceneWeight

};
// =========================================
// V14 STATE-AWARE APPEARANCE ENGINE
// =========================================
//
// Selection order:
//
//   identity
//      ↓
//   body
//      ↓
//   appearance
//      ↓
//   hair
//      ↓
//   accessories
//
// Every later decision can inspect the state that
// already exists.
//
// This is the important part of the architecture:
// the generator remembers what it already decided.
// =========================================


// -----------------------------------------
// APPEARANCE CATEGORY HELPERS
// -----------------------------------------

function getV14AppearancePresetCollection(
  category
) {

  if (
    typeof PRESET_COLLECTIONS !== "undefined" &&
    Array.isArray(
      PRESET_COLLECTIONS[category]
    )
  ) {
    return PRESET_COLLECTIONS[category];
  }

  return [];
}


function chooseV14AppearancePreset(
  category,
  state,
  config
) {

  const presets =
    getV14AppearancePresetCollection(
      category
    );

  if (presets.length === 0) {
    return null;
  }

  const candidates =
    getV14CompatibleOptions(
      category,
      presets,
      state
    );

  if (candidates.length === 0) {
    return null;
  }

  return weightedPickV14(
    candidates,
    preset =>
      getV14OptionWeight(
        category,
        preset,
        state
      ),
    state
  );
}


// -----------------------------------------
// STORE APPEARANCE PRESET
// -----------------------------------------

function storeV14AppearancePreset(
  state,
  category,
  preset
) {

  if (!state || !preset) {
    return;
  }

  state[category] =
    preset;
}


// -----------------------------------------
// OPTIONAL TRAIT CHANCE
// -----------------------------------------
//
// A completely randomized subject does not need
// every possible trait.
//
// These probabilities determine whether an optional
// trait appears at all.
//
// Once selected, the relationship engine chooses
// which specific option fits.
// -----------------------------------------

const V14_APPEARANCE_CHANCES = {

  makeup: 0.55,

  makeupOddities: 0.04,

  facialHair: 0.22,

  tattoos: 0.16,

  bodyDetails: 0.18,

  nails: 0.28,

  hairDetails: 0.08,

  accessories: 0.55

};


function getV14AppearanceChance(
  category,
  state
) {

  let chance =
    V14_APPEARANCE_CHANCES[
    category
    ];

  if (
    chance === undefined
  ) {
    chance = 0.25;
  }


  // ---------------------------------------
  // GENDER CONTEXT
  // ---------------------------------------

  const gender =
    getStateValue(
      state,
      "gender"
    );


  if (
    category === "makeup" &&
    gender === "woman"
  ) {
    chance *= 1.25;
  }


  if (
    category === "makeupOddities"
  ) {

    // Odd makeup remains uncommon.
    chance *= 0.75;
  }


  if (
    category === "facialHair" &&
    gender === "woman"
  ) {
    chance *= 0.15;
  }


  if (
    category === "nails" &&
    gender === "woman"
  ) {
    chance *= 1.15;
  }


  return Math.max(
    0,
    Math.min(
      1,
      chance
    )
  );
}


// -----------------------------------------
// SHOULD OPTIONAL TRAIT APPEAR?
// -----------------------------------------

function shouldV14AddAppearanceTrait(
  category,
  state,
  config
) {

  if (
    config &&
    config.manualOverrides &&
    config.manualOverrides[category]
  ) {
    return true;
  }

  return Math.random() <
    getV14AppearanceChance(
      category,
      state
    );
}


// -----------------------------------------
// RANDOMIZE MAKEUP
// -----------------------------------------

function randomizeV14Makeup(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "makeup",
      state,
      config
    )
  ) {
    state.makeup = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "makeup",
      state,
      config
    );

  if (preset) {
    storeV14AppearancePreset(
      state,
      "makeup",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE ODD MAKEUP
// -----------------------------------------

function randomizeV14MakeupOddities(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "makeupOddities",
      state,
      config
    )
  ) {
    state.makeupOddities = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "makeupOddities",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "makeupOddities",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE FACIAL HAIR
// -----------------------------------------

function randomizeV14FacialHair(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "facialHair",
      state,
      config
    )
  ) {
    state.facialHair = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "facialHair",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "facialHair",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE TATTOOS
// -----------------------------------------

function randomizeV14Tattoos(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "tattoos",
      state,
      config
    )
  ) {
    state.tattoos = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "tattoos",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "tattoos",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE BODY DETAILS
// -----------------------------------------

function randomizeV14BodyDetails(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "bodyDetails",
      state,
      config
    )
  ) {
    state.bodyDetails = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "bodyDetails",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "bodyDetails",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE NAILS
// -----------------------------------------

function randomizeV14Nails(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "nails",
      state,
      config
    )
  ) {
    state.nails = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "nails",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "nails",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE HAIR DETAILS
// -----------------------------------------

function randomizeV14HairDetails(
  state,
  config
) {

  if (
    !shouldV14AddAppearanceTrait(
      "hairDetails",
      state,
      config
    )
  ) {
    state.hairDetails = null;
    return state;
  }

  const preset =
    chooseV14AppearancePreset(
      "hairDetails",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "hairDetails",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE NOSE
// -----------------------------------------
//
// Nose is treated as a normal appearance choice.
// It is not optional because it helps establish
// facial variation without requiring an explicit
// "nose selected" switch.
// -----------------------------------------

function randomizeV14Nose(
  state,
  config
) {

  const preset =
    chooseV14AppearancePreset(
      "nose",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "nose",
      preset
    );
  }

  return state;
}


// =========================================
// HAIR ENGINE
// =========================================


// -----------------------------------------
// HAIR COMPATIBILITY
// -----------------------------------------

function getV14HairContext(state) {

  return {

    gender:
      getStateValue(
        state,
        "gender"
      ),

    profile:
      getStateValue(
        state,
        "nationalityProfile"
      ),

    hairColor:
      getStateValue(
        state,
        "hairColor"
      ),

    hairLength:
      getStateValue(
        state,
        "hairLength"
      ),

    hairType:
      getStateValue(
        state,
        "hairType"
      ),

    bodyShape:
      getStateValue(
        state,
        "bodyShape"
      ),

    clothingGroups:
      getV14ClothingGroupsFromState(
        state
      )
  };
}


// -----------------------------------------
// HAIR COLOR
// -----------------------------------------

function randomizeV14HairColor(
  state,
  config
) {

  const preset =
    chooseV14AppearancePreset(
      "hairColor",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "hairColor",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// HAIR LENGTH
// -----------------------------------------

function randomizeV14HairLength(
  state,
  config
) {

  const preset =
    chooseV14AppearancePreset(
      "hairLength",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "hairLength",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// HAIR TYPE
// -----------------------------------------

function randomizeV14HairType(
  state,
  config
) {

  const preset =
    chooseV14AppearancePreset(
      "hairType",
      state,
      config
    );

  if (preset) {

    storeV14AppearancePreset(
      state,
      "hairType",
      preset
    );
  }

  return state;
}


// -----------------------------------------
// HAIRSTYLE
// -----------------------------------------

function randomizeV14Hairstyle(
  state,
  config
) {

  const presets =
    getV14AppearancePresetCollection(
      "hairstyles"
    );

  if (presets.length === 0) {
    return state;
  }

  const candidates =
    getV14CompatibleOptions(
      "hairstyles",
      presets,
      state
    );

  if (candidates.length === 0) {
    return state;
  }

  const selected =
    weightedPickV14(
      candidates,
      preset =>
        getV14OptionWeight(
          "hairstyles",
          preset,
          state
        ),
      state
    );

  if (selected) {

    storeV14AppearancePreset(
      state,
      "hairstyles",
      selected
    );
  }

  return state;
}


// -----------------------------------------
// COMPLETE HAIR RANDOMIZER
// -----------------------------------------

function randomizeV14Hair(
  state,
  config
) {

  randomizeV14HairColor(
    state,
    config
  );

  randomizeV14HairLength(
    state,
    config
  );

  randomizeV14HairType(
    state,
    config
  );

  randomizeV14Hairstyle(
    state,
    config
  );

  return state;
}


// =========================================
// ACCESSORY ENGINE
// =========================================


// -----------------------------------------
// ACCESSORY GROUP LOOKUP
// -----------------------------------------

function getV14AccessoryGroupById(
  groupId
) {

  if (
    !Array.isArray(accessoryGroups)
  ) {
    return null;
  }

  return accessoryGroups.find(
    group =>
      getPresetId(group) === groupId
  ) || null;
}


// -----------------------------------------
// EXISTING ACCESSORY IDS
// -----------------------------------------

function getV14AccessoryIdsFromState(
  state
) {

  if (
    !state ||
    !Array.isArray(state.accessories)
  ) {
    return [];
  }

  return state.accessories
    .map(
      item => getPresetId(item)
    )
    .filter(Boolean);
}


// -----------------------------------------
// CAN ADD ACCESSORY
// -----------------------------------------

function canAddV14Accessory(
  state,
  accessory
) {

  if (!accessory) {
    return false;
  }

  const id =
    getPresetId(accessory);

  if (
    getV14AccessoryIdsFromState(
      state
    ).includes(id)
  ) {
    return false;
  }

  if (
    isOptionBlockedV14(
      "accessories",
      accessory,
      state
    )
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// ADD ACCESSORY
// -----------------------------------------

function addV14AccessoryToState(
  state,
  accessory
) {

  if (
    !canAddV14Accessory(
      state,
      accessory
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(state.accessories)
  ) {
    state.accessories = [];
  }

  state.accessories.push(
    accessory
  );

  return true;
}


// -----------------------------------------
// ACCESSORY GROUP CHANCE
// -----------------------------------------

const V14_ACCESSORY_GROUP_CHANCES = {

  "accessoryGroup.jewelry": 0.30,

  "accessoryGroup.eyewear": 0.18,

  "accessoryGroup.bodyPiercings": 0.10,

  "accessoryGroup.headwear": 0.12,

  "accessoryGroup.hairAccessories": 0.18

};


function getV14AccessoryGroupChance(
  group,
  state
) {

  const id =
    getPresetId(group);

  let chance =
    V14_ACCESSORY_GROUP_CHANCES[id]
    ?? 0.10;


  const gender =
    getStateValue(
      state,
      "gender"
    );


  if (
    id === "accessoryGroup.hairAccessories" &&
    gender === "woman"
  ) {
    chance *= 1.2;
  }


  return Math.max(
    0,
    Math.min(
      1,
      chance
    )
  );
}


// -----------------------------------------
// CHOOSE ACCESSORY
// -----------------------------------------

function chooseV14Accessory(
  state,
  group
) {

  if (
    !group ||
    !Array.isArray(group.presets)
  ) {
    return null;
  }

  const candidates =
    group.presets.filter(
      accessory =>
        canAddV14Accessory(
          state,
          accessory
        )
    );

  if (candidates.length === 0) {
    return null;
  }

  return weightedPickV14(
    candidates,
    accessory =>
      getV14OptionWeight(
        "accessories",
        accessory,
        state
      ),
    state
  );
}


// -----------------------------------------
// RANDOMIZE ACCESSORIES
// -----------------------------------------

function randomizeV14Accessories(
  state,
  config
) {

  state.accessories = [];

  for (
    const group
    of accessoryGroups
  ) {

    const chance =
      getV14AccessoryGroupChance(
        group,
        state
      );

    if (
      Math.random() >= chance
    ) {
      continue;
    }

    const accessory =
      chooseV14Accessory(
        state,
        group
      );

    if (accessory) {

      addV14AccessoryToState(
        state,
        accessory
      );
    }
  }

  return state;
}


// =========================================
// COMPLETE APPEARANCE PIPELINE
// =========================================

function randomizeV14Appearance(
  state,
  config
) {

  randomizeV14Makeup(
    state,
    config
  );

  randomizeV14MakeupOddities(
    state,
    config
  );

  randomizeV14FacialHair(
    state,
    config
  );

  randomizeV14Tattoos(
    state,
    config
  );

  randomizeV14BodyDetails(
    state,
    config
  );

  randomizeV14Nails(
    state,
    config
  );

  randomizeV14HairDetails(
    state,
    config
  );

  randomizeV14Nose(
    state,
    config
  );

  randomizeV14Hair(
    state,
    config
  );

  randomizeV14Accessories(
    state,
    config
  );

  return state;
}


// =========================================
// APPEARANCE VALIDATION
// =========================================

function validateV14AppearanceState(
  state
) {

  const problems = [];


  // ---------------------------------------
  // FACIAL HAIR
  // ---------------------------------------

  const facialHair =
    state
      ? state.facialHair
      : null;

  if (
    facialHair &&
    isOptionBlockedV14(
      "facialHair",
      facialHair,
      state
    )
  ) {
    problems.push({
      category: "facialHair",
      id: getPresetId(facialHair)
    });
  }


  // ---------------------------------------
  // MAKEUP
  // ---------------------------------------

  const makeup =
    state
      ? state.makeup
      : null;

  if (
    makeup &&
    isOptionBlockedV14(
      "makeup",
      makeup,
      state
    )
  ) {
    problems.push({
      category: "makeup",
      id: getPresetId(makeup)
    });
  }


  // ---------------------------------------
  // ACCESSORIES
  // ---------------------------------------

  const accessories =
    state &&
      Array.isArray(state.accessories)
      ? state.accessories
      : [];

  const seenAccessories =
    new Set();

  for (const accessory of accessories) {

    const id =
      getPresetId(accessory);

    if (
      seenAccessories.has(id)
    ) {
      problems.push({
        category: "accessories",
        type: "duplicate",
        id
      });
    }

    seenAccessories.add(id);
  }


  return {
    valid:
      problems.length === 0,

    problems
  };
}


// -----------------------------------------
// REPAIR APPEARANCE
// -----------------------------------------

function repairV14AppearanceState(
  state
) {

  if (!state) {
    return state;
  }


  const categories = [
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails",
    "nose",
    "hairColor",
    "hairLength",
    "hairType",
    "hairstyles"
  ];


  for (
    const category
    of categories
  ) {

    const preset =
      state[category];

    if (!preset) {
      continue;
    }

    if (
      isOptionBlockedV14(
        category,
        preset,
        state
      )
    ) {
      state[category] =
        null;
    }
  }


  // Remove duplicate accessories.

  if (
    Array.isArray(state.accessories)
  ) {

    const seen =
      new Set();

    state.accessories =
      state.accessories.filter(
        accessory => {

          const id =
            getPresetId(
              accessory
            );

          if (seen.has(id)) {
            return false;
          }

          seen.add(id);

          return true;
        }
      );
  }


  return state;
}


// -----------------------------------------
// PUBLIC APPEARANCE ENGINE
// -----------------------------------------

const V14_APPEARANCE_ENGINE = {

  metadata:
    V14_ACTION_METADATA,

  chances:
    V14_APPEARANCE_CHANCES,

  getChance:
    getV14AppearanceChance,

  randomize:
    randomizeV14Appearance,

  randomizeHair:
    randomizeV14Hair,

  randomizeAccessories:
    randomizeV14Accessories,

  validate:
    validateV14AppearanceState,

  repair:
    repairV14AppearanceState

};
// =========================================
// V14 CORE RANDOMIZER INTEGRATION
// =========================================
//
// This chunk connects the new relationship engine
// to the older helper functions.
//
// After this chunk:
//
//   random selection
//        ↓
//   compatibility check
//        ↓
//   relationship multiplier
//        ↓
//   profile influence
//        ↓
//   weighted choice
//
// There should no longer be competing compatibility
// systems making different decisions.
// =========================================


// -----------------------------------------
// SAFE PROFILE DEFAULT
// -----------------------------------------
//
// A profile should influence an option when it has
// information about that option.
//
// It should NOT make every unlisted option almost
// impossible.
//
// Therefore:
//
//   listed option   -> profile-specific weight
//   unlisted option -> 1
//
// This is much more neutral than the old 0.05 default.
// -----------------------------------------

function getV14ProfileTraitWeightSafe(
  state,
  category,
  preset
) {

  if (
    !state ||
    !preset
  ) {
    return 1;
  }

  const profile =
    getStateValue(
      state,
      "nationalityProfile"
    );

  if (!profile) {
    return 1;
  }

  const table =
    TRAIT_PROFILES[profile];

  if (!table) {
    return 1;
  }

  const value =
    getPresetValue(preset);

  const label =
    getPresetLabel(preset);

  const id =
    getPresetId(preset);


  const candidates = [
    value,
    label,
    id
  ].filter(Boolean);


  const categoryTable =
    table[category] ||
    (
      category === "eyes"
        ? table.eyeColor
        : null
    ) ||
    (
      category === "hairColor"
        ? table.hairColor
        : null
    );


  if (!categoryTable) {
    return 1;
  }


  for (const candidate of candidates) {

    const normalized =
      normalizeV14ProfileLabel(
        candidate
      );

    const weight =
      getNormalizedProfileWeight(
        categoryTable,
        normalized
      );

    if (
      weight !== undefined &&
      weight !== null
    ) {
      return Math.max(
        0.01,
        Number(weight)
      );
    }
  }


  return 1;
}


// -----------------------------------------
// PROFILE MULTIPLIER
// -----------------------------------------

function getV14ProfileMultiplierSafe(
  category,
  preset,
  state
) {

  return getV14ProfileTraitWeightSafe(
    state,
    category,
    preset
  );
}


// -----------------------------------------
// AUTHORITATIVE OPTION WEIGHT
// -----------------------------------------

function getV14AuthoritativeOptionWeight(
  category,
  preset,
  state
) {

  if (!preset) {
    return 0;
  }


  // ---------------------------------------
  // HARD BLOCK
  // ---------------------------------------

  if (
    isOptionBlockedV14(
      category,
      preset,
      state
    )
  ) {
    return 0;
  }


  // ---------------------------------------
  // PROFILE
  // ---------------------------------------

  const profileWeight =
    getV14ProfileMultiplierSafe(
      category,
      preset,
      state
    );


  // ---------------------------------------
  // RELATIONSHIPS
  // ---------------------------------------

  const relationshipWeight =
    getV14RelationshipMultiplier(
      category,
      preset,
      state
    );


  return Math.max(
    0,
    profileWeight *
    relationshipWeight
  );
}


// -----------------------------------------
// AUTHORITATIVE COMPATIBILITY FILTER
// -----------------------------------------

function getV14AuthoritativeCompatibleOptions(
  category,
  presets,
  state
) {

  if (!Array.isArray(presets)) {
    return [];
  }

  return presets.filter(
    preset =>
      !isOptionBlockedV14(
        category,
        preset,
        state
      )
  );
}


// -----------------------------------------
// AUTHORITATIVE WEIGHTED PICK
// -----------------------------------------

function weightedPickV14Authoritative(
  category,
  presets,
  state
) {

  const candidates =
    getV14AuthoritativeCompatibleOptions(
      category,
      presets,
      state
    );

  if (candidates.length === 0) {
    return null;
  }


  const weightedCandidates =
    candidates.map(
      preset => ({
        preset,

        weight:
          getV14AuthoritativeOptionWeight(
            category,
            preset,
            state
          )
      })
    )
      .filter(
        entry =>
          entry.weight > 0
      );


  if (
    weightedCandidates.length === 0
  ) {
    return null;
  }


  return weightedPickV14(
    weightedCandidates,
    entry =>
      entry.weight,
    state
  );
}


// -----------------------------------------
// AUTHORITATIVE RANDOM PRESET
// -----------------------------------------

function randomV14Preset(
  category,
  presets,
  state
) {

  return weightedPickV14Authoritative(
    category,
    presets,
    state
  );
}


// -----------------------------------------
// REPLACE LEGACY COMPATIBILITY HELPERS
// -----------------------------------------
//
// Existing V14 code calls these names.
//
// Redirect them to the authoritative engine.
// -----------------------------------------

function getCompatibilityWeight(
  category,
  preset,
  state
) {

  return getV14AuthoritativeOptionWeight(
    category,
    preset,
    state
  );
}


function isOptionAllowed(
  category,
  preset,
  state
) {

  return !isOptionBlockedV14(
    category,
    preset,
    state
  );
}


function getCompatiblePresets(
  category,
  presets,
  state
) {

  return getV14AuthoritativeCompatibleOptions(
    category,
    presets,
    state
  );
}


function randomCompatiblePreset(
  category,
  presets,
  state
) {

  return randomV14Preset(
    category,
    presets,
    state
  );
}


// -----------------------------------------
// COMPATIBLE SWITCH RANDOMIZATION
// -----------------------------------------

function randomV14SwitchValues(
  category,
  presets,
  count,
  state
) {

  const candidates =
    getV14AuthoritativeCompatibleOptions(
      category,
      presets,
      state
    );

  if (candidates.length === 0) {
    return [];
  }


  const working =
    candidates.slice();

  const selected = [];

  const targetCount =
    Math.min(
      Math.max(
        0,
        count || 0
      ),
      working.length
    );


  while (
    selected.length <
    targetCount
  ) {

    const choice =
      weightedPickV14Authoritative(
        category,
        working,
        state
      );

    if (!choice) {
      break;
    }

    selected.push(
      choice
    );


    const choiceId =
      getPresetId(choice);


    const index =
      working.findIndex(
        preset =>
          getPresetId(preset) ===
          choiceId
      );


    if (index >= 0) {
      working.splice(
        index,
        1
      );
    }
  }


  return selected;
}


// -----------------------------------------
// LEGACY SWITCH ALIAS
// -----------------------------------------

function chooseRandomSwitchValues(
  category,
  presets,
  count,
  state
) {

  return randomV14SwitchValues(
    category,
    presets,
    count,
    state
  );
}


// -----------------------------------------
// GENERIC STATE-AWARE CHOICE
// -----------------------------------------

function chooseV14StateAwarePreset(
  state,
  category,
  collection
) {

  if (
    !Array.isArray(collection) ||
    collection.length === 0
  ) {
    return null;
  }


  return randomV14Preset(
    category,
    collection,
    state
  );
}


// -----------------------------------------
// STATE-AWARE STORE
// -----------------------------------------

function chooseAndStoreV14StateAwarePreset(
  state,
  category,
  collection
) {

  const preset =
    chooseV14StateAwarePreset(
      state,
      category,
      collection
    );

  if (!preset) {
    return null;
  }

  state[category] =
    preset;

  return preset;
}


// -----------------------------------------
// REBUILD DERIVED STATE
// -----------------------------------------

function rebuildV14DerivedState(
  state
) {

  if (!state) {
    return state;
  }


  // ---------------------------------------
  // NATIONALITY PROFILE
  // ---------------------------------------

  if (
    state.nationality
  ) {

    const nationality =
      state.nationality;

    const profile =
      nationality.profile ||
      getPresetMetadata(
        nationality
      ).profile ||
      "";

    if (profile) {

      state.nationalityProfile = {
        id:
          "profile." +
          slugifyId(profile),

        value:
          profile,

        label:
          profile
      };
    }
  }


  // ---------------------------------------
  // CLOTHING GROUPS
  // ---------------------------------------

  if (
    typeof getV14ClothingGroupsFromState ===
    "function"
  ) {

    state.clothingGroups =
      getV14ClothingGroupsFromState(
        state
      );
  }


  // ---------------------------------------
  // ACTION GROUP
  // ---------------------------------------

  if (
    state.action &&
    typeof getV14ActionGroupId ===
    "function"
  ) {

    const groupId =
      getV14ActionGroupId(
        state.action
      );

    if (groupId) {

      const group =
        getV14ActionGroup(
          state.action
        );

      state.actionGroups =
        group
          ? [group]
          : [];
    }
  }


  return state;
}


// -----------------------------------------
// STATE-AWARE GENERIC CATEGORY RANDOMIZER
// -----------------------------------------

function randomizeV14Category(
  state,
  category,
  options = {}
) {

  if (!state) {
    return null;
  }


  const collection =
    options.collection ||
    (
      typeof PRESET_COLLECTIONS !==
        "undefined"
        ? PRESET_COLLECTIONS[
        category
        ]
        : []
    );


  if (
    !Array.isArray(collection) ||
    collection.length === 0
  ) {
    return null;
  }


  const selected =
    randomV14Preset(
      category,
      collection,
      state
    );


  if (selected) {

    state[category] =
      selected;
  }


  return selected;
}


// -----------------------------------------
// REQUIRED-CHOICE HANDLING
// -----------------------------------------
//
// "required" means strongly preferred by the
// relationship engine. It does NOT blindly overwrite
// a deliberate manual selection.
//
// Manual selection always has priority.
// -----------------------------------------

function enforceV14RequiredRelationships(
  state,
  category,
  collection
) {

  if (
    !state ||
    !Array.isArray(collection)
  ) {
    return null;
  }


  if (
    isCategoryManuallySelected &&
    isCategoryManuallySelected(
      state,
      category
    )
  ) {
    return state[category];
  }


  const required =
    collection.filter(
      preset =>
        isV14OptionRequired(
          category,
          preset,
          state
        )
    );


  if (
    required.length === 0
  ) {
    return null;
  }


  const selected =
    weightedPickV14(
      required,
      preset =>
        getV14AuthoritativeOptionWeight(
          category,
          preset,
          state
        ),
      state
    );


  if (selected) {

    state[category] =
      selected;
  }


  return selected;
}


// -----------------------------------------
// COMPATIBILITY DEBUGGER
// -----------------------------------------

function debugV14CategoryChoices(
  category,
  presets,
  state
) {

  if (!Array.isArray(presets)) {
    return [];
  }


  return presets.map(
    preset => {

      const blocked =
        isOptionBlockedV14(
          category,
          preset,
          state
        );

      const required =
        isV14OptionRequired(
          category,
          preset,
          state
        );

      const relationshipMultiplier =
        getV14RelationshipMultiplier(
          category,
          preset,
          state
        );

      const profileMultiplier =
        getV14ProfileMultiplierSafe(
          category,
          preset,
          state
        );

      return {

        id:
          getPresetId(preset),

        label:
          getPresetLabel(preset),

        value:
          getPresetValue(preset),

        blocked,

        required,

        relationshipMultiplier,

        profileMultiplier,

        finalWeight:
          blocked
            ? 0
            : relationshipMultiplier *
            profileMultiplier
      };
    }
  );
}


// -----------------------------------------
// PUBLIC CORE ENGINE
// -----------------------------------------

const V14_CORE_RANDOMIZER = {

  profileWeight:
    getV14ProfileMultiplierSafe,

  optionWeight:
    getV14AuthoritativeOptionWeight,

  compatible:
    getV14AuthoritativeCompatibleOptions,

  pick:
    weightedPickV14Authoritative,

  random:
    randomV14Preset,

  randomSwitches:
    randomV14SwitchValues,

  category:
    randomizeV14Category,

  required:
    enforceV14RequiredRelationships,

  debug:
    debugV14CategoryChoices,

  rebuildState:
    rebuildV14DerivedState

};
// ============================================================
// CHUNK 29 — CONFIGURATION-AWARE GENERATION PIPELINE
// ============================================================
//
// This layer sits above the individual V14 engines.
//
// Its job is to:
//   1. Respect manual selections.
//   2. Respect Randomization Mode.
//   3. Respect per-section randomization switches.
//   4. Preserve generation state between stages.
//   5. Let later stages see earlier decisions.
//   6. Never use array positions as persistent identities.
//   7. Use the authoritative V14 relationship engine.
//
// ============================================================


// ------------------------------------------------------------
// 29.1 — CONFIGURATION DEFAULTS
// ------------------------------------------------------------

const V14_DEFAULT_GENERATION_CONFIG = {
  randomizationMode: "compatible",

  randomizeIdentity: true,
  randomizeBody: true,
  randomizeAppearance: true,
  randomizeHair: true,
  randomizeAccessories: true,
  randomizeClothing: true,
  randomizeAction: true,
  randomizeCamera: true,
  randomizeLighting: true,
  randomizeTimeOfDay: true,
  randomizeArtStyle: true,

  useProfileInfluence: true,
  useRelationshipEngine: true,

  preserveManualSelections: true,
  repairInvalidSelections: true,

  preferredMultiplier: 4,
  discouragedMultiplier: 0.2,

  previewSampleSize: PREVIEW_SAMPLE_SIZE
};


// ------------------------------------------------------------
// 29.2 — CONFIGURATION NORMALIZATION
// ------------------------------------------------------------

function normalizeV14GenerationConfig(config) {
  const source = config || {};
  const result = Object.assign({}, V14_DEFAULT_GENERATION_CONFIG);

  Object.keys(result).forEach(function (key) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  });

  if (
    result.randomizationMode !== "compatible" &&
    result.randomizationMode !== "free"
  ) {
    result.randomizationMode = "compatible";
  }

  result.preferredMultiplier = Number(result.preferredMultiplier);

  if (
    !Number.isFinite(result.preferredMultiplier) ||
    result.preferredMultiplier <= 0
  ) {
    result.preferredMultiplier = 4;
  }

  result.discouragedMultiplier = Number(result.discouragedMultiplier);

  if (
    !Number.isFinite(result.discouragedMultiplier) ||
    result.discouragedMultiplier < 0
  ) {
    result.discouragedMultiplier = 0.2;
  }

  return result;
}


// ------------------------------------------------------------
// 29.3 — RANDOMIZATION MODE HELPERS
// ------------------------------------------------------------

function isV14CompatibleMode(config) {
  return (
    normalizeV14GenerationConfig(config).randomizationMode ===
    "compatible"
  );
}


function isV14FreeMode(config) {
  return (
    normalizeV14GenerationConfig(config).randomizationMode ===
    "free"
  );
}


function shouldV14Randomize(config, key) {
  const cfg = normalizeV14GenerationConfig(config);

  if (cfg[key] === undefined) {
    return true;
  }

  return cfg[key] === true;
}


// ------------------------------------------------------------
// 29.4 — MANUAL SELECTION DETECTION
// ------------------------------------------------------------

function hasV14ManualSelection(state, category) {
  if (!state || !category) {
    return false;
  }

  const value = state[category];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== NONE_SELECTED
  );
}


function getV14ManualSelection(state, category) {
  if (!state || !category) {
    return null;
  }

  if (!hasV14ManualSelection(state, category)) {
    return null;
  }

  return state[category];
}


// ------------------------------------------------------------
// 29.5 — MANUAL SELECTION PRESERVATION
// ------------------------------------------------------------
//
// Manual choices are deliberate choices.
//
// Randomization should not silently replace them.
//
// The important distinction is:
//
//   no manual selection
//       -> randomizer is free to choose.
//
//   manual selection exists
//       -> preserve it.
//
//   manual selection conflicts with another later choice
//       -> repair the later choice when possible.
//
// This means the state is the source of truth rather than
// repeatedly re-reading UI menu indexes.
// ------------------------------------------------------------

function preserveV14ManualSelections(state, manualState) {
  if (!state || !manualState) {
    return state;
  }

  Object.keys(manualState).forEach(function (category) {
    const value = manualState[category];

    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        state[category] = value.slice();
      }
      return;
    }

    if (value !== "" && value !== NONE_SELECTED) {
      state[category] = value;
    }
  });

  return state;
}


// ------------------------------------------------------------
// 29.6 — CATEGORY RANDOMIZATION GATE
// ------------------------------------------------------------

function canV14RandomizeCategory(
  state,
  category,
  config,
  manualState
) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.preserveManualSelections) {
    return shouldV14Randomize(cfg, getV14ConfigKeyForCategory(category));
  }

  if (manualState && hasV14ManualSelection(manualState, category)) {
    return false;
  }

  if (hasV14ManualSelection(state, category)) {
    return false;
  }

  return shouldV14Randomize(
    cfg,
    getV14ConfigKeyForCategory(category)
  );
}


// ------------------------------------------------------------
// 29.7 — CATEGORY → CONFIGURATION KEY
// ------------------------------------------------------------

function getV14ConfigKeyForCategory(category) {
  const map = {
    gender: "randomizeIdentity",
    nationality: "randomizeIdentity",
    nationalityProfile: "randomizeIdentity",
    age: "randomizeIdentity",

    skin: "randomizeBody",
    eyes: "randomizeBody",
    overallBuild: "randomizeBody",
    height: "randomizeBody",
    chest: "randomizeBody",
    hips: "randomizeBody",
    lips: "randomizeBody",
    eyelashes: "randomizeBody",
    bodyShape: "randomizeBody",
    legs: "randomizeBody",
    buttocks: "randomizeBody",
    belly: "randomizeBody",
    specificBody: "randomizeBody",

    makeup: "randomizeAppearance",
    makeupOddities: "randomizeAppearance",
    facialHair: "randomizeAppearance",
    tattoos: "randomizeAppearance",
    bodyDetails: "randomizeAppearance",
    nails: "randomizeAppearance",
    hairDetails: "randomizeAppearance",
    nose: "randomizeAppearance",

    hairColor: "randomizeHair",
    hairLength: "randomizeHair",
    hairType: "randomizeHair",
    hairstyles: "randomizeHair",

    accessories: "randomizeAccessories",

    clothing: "randomizeClothing",
    clothingGroups: "randomizeClothing",

    action: "randomizeAction",
    actionGroups: "randomizeAction",

    camera: "randomizeCamera",
    lighting: "randomizeLighting",
    timeOfDay: "randomizeTimeOfDay",
    artStyle: "randomizeArtStyle"
  };

  return map[category] || null;
}


// ------------------------------------------------------------
// 29.8 — AUTHORITATIVE RANDOM CATEGORY
// ------------------------------------------------------------

function randomizeV14CategoryAuthoritative(
  state,
  category,
  presets,
  config,
  options
) {
  const cfg = normalizeV14GenerationConfig(config);
  const settings = options || {};

  if (!presets || presets.length === 0) {
    return null;
  }

  const manualState = settings.manualState || null;

  if (
    cfg.preserveManualSelections &&
    manualState &&
    hasV14ManualSelection(manualState, category)
  ) {
    return manualState[category];
  }

  if (!shouldV14Randomize(
    cfg,
    getV14ConfigKeyForCategory(category)
  )) {
    return state ? state[category] : null;
  }

  const currentState = state || createGenerationState();

  let candidates = presets;

  if (cfg.useRelationshipEngine && isV14CompatibleMode(cfg)) {
    candidates = getV14CompatibleOptions(
      category,
      presets,
      currentState
    );
  }

  if (!candidates || candidates.length === 0) {
    candidates = presets;
  }

  const selected = weightedPickV14(
    candidates,
    function (preset) {
      if (!cfg.useRelationshipEngine) {
        return 1;
      }

      return getV14AuthoritativeOptionWeight(
        category,
        preset,
        currentState
      );
    }
  );

  if (!selected) {
    return null;
  }

  return getPresetValue(selected);
}


// ------------------------------------------------------------
// 29.9 — STATE-AWARE CATEGORY APPLICATION
// ------------------------------------------------------------

function applyV14RandomCategory(
  state,
  category,
  presets,
  config,
  options
) {
  const cfg = normalizeV14GenerationConfig(config);
  const settings = options || {};

  if (!state) {
    return null;
  }

  const manualState = settings.manualState || null;

  if (
    cfg.preserveManualSelections &&
    manualState &&
    hasV14ManualSelection(manualState, category)
  ) {
    setV14StateValue(
      state,
      category,
      manualState[category]
    );

    return state[category];
  }

  if (!shouldV14Randomize(
    cfg,
    getV14ConfigKeyForCategory(category)
  )) {
    return state[category];
  }

  const selected = randomizeV14CategoryAuthoritative(
    state,
    category,
    presets,
    cfg,
    settings
  );

  if (
    selected !== undefined &&
    selected !== null &&
    selected !== ""
  ) {
    setV14StateValue(
      state,
      category,
      selected
    );
  }

  return state[category];
}


// ------------------------------------------------------------
// 29.10 — IDENTITY STAGE
// ------------------------------------------------------------

function runV14IdentityStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeIdentity) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  applyV14RandomCategory(
    state,
    "gender",
    genderPresets,
    cfg,
    { manualState: manualState }
  );

  applyV14RandomCategory(
    state,
    "nationality",
    nationalityPresets,
    cfg,
    { manualState: manualState }
  );

  // The nationality determines the profile when no explicit
  // profile has been supplied.
  if (!hasV14ManualSelection(manualState, "nationalityProfile")) {
    const nationality = findPresetByValueV14(
      nationalityPresets,
      state.nationality
    );

    if (nationality && nationality.profile) {
      state.nationalityProfile = nationality.profile;
    }
  }

  applyV14RandomCategory(
    state,
    "age",
    agePresets,
    cfg,
    { manualState: manualState }
  );

  return state;
}


// ------------------------------------------------------------
// 29.11 — BODY STAGE
// ------------------------------------------------------------

function runV14BodyStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeBody) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Body(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.12 — APPEARANCE STAGE
// ------------------------------------------------------------

function runV14AppearanceStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeAppearance) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Appearance(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.13 — HAIR STAGE
// ------------------------------------------------------------

function runV14HairStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeHair) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Hair(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.14 — ACCESSORY STAGE
// ------------------------------------------------------------

function runV14AccessoryStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeAccessories) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Accessories(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.15 — CLOTHING STAGE
// ------------------------------------------------------------

function runV14ClothingStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeClothing) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Clothing(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.16 — ACTION STAGE
// ------------------------------------------------------------

function runV14ActionStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.randomizeAction) {
    preserveV14ManualSelections(state, manualState);
    return state;
  }

  randomizeV14Action(state, {
    config: cfg,
    manualState: manualState
  });

  return state;
}


// ------------------------------------------------------------
// 29.17 — CAMERA / LIGHTING / STYLE STAGE
// ------------------------------------------------------------

function runV14SceneStage(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (cfg.randomizeCamera) {
    randomizeV14Camera(state, {
      config: cfg,
      manualState: manualState
    });
  }

  if (cfg.randomizeLighting) {
    randomizeV14Lighting(state, {
      config: cfg,
      manualState: manualState
    });
  }

  if (cfg.randomizeTimeOfDay) {
    randomizeV14TimeOfDay(state, {
      config: cfg,
      manualState: manualState
    });
  }

  if (cfg.randomizeArtStyle) {
    randomizeV14ArtStyle(state, {
      config: cfg,
      manualState: manualState
    });
  }

  preserveV14ManualSelections(state, manualState);

  return state;
}


// ------------------------------------------------------------
// 29.18 — REQUIRED RELATIONSHIP REPAIR
// ------------------------------------------------------------
//
// Required relationships are not allowed to blindly overwrite
// deliberate manual selections.
//
// Instead:
//
//   manual choice exists
//       -> keep it.
//
//   automatic choice conflicts
//       -> try to repair the automatic choice.
//
//   no repair candidate exists
//       -> preserve the user's choice and report the conflict.
//
// This is important because "required" describes a relationship,
// not permission to override the user.
// ------------------------------------------------------------

function repairV14RequiredRelationships(state, config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  if (!cfg.repairInvalidSelections) {
    return {
      state: state,
      repaired: [],
      conflicts: []
    };
  }

  const repaired = [];
  const conflicts = [];

  const categories = [
    "gender",
    "nationality",
    "age",
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "bodyShape",
    "specificBody",
    "makeup",
    "facialHair",
    "hairColor",
    "hairType",
    "hairstyles",
    "accessories",
    "clothing",
    "action",
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  categories.forEach(function (category) {
    const current = state[category];

    if (
      current === undefined ||
      current === null ||
      current === ""
    ) {
      return;
    }

    if (!isV14OptionBlocked(category, current, state)) {
      return;
    }

    if (
      manualState &&
      hasV14ManualSelection(manualState, category)
    ) {
      conflicts.push({
        category: category,
        value: current,
        reason: "manual selection conflicts with another choice"
      });

      return;
    }

    const collection = getV14PresetCollection(category);

    if (!collection || collection.length === 0) {
      conflicts.push({
        category: category,
        value: current,
        reason: "no replacement collection available"
      });

      return;
    }

    const candidates = getV14CompatibleOptions(
      category,
      collection,
      state
    );

    if (!candidates || candidates.length === 0) {
      conflicts.push({
        category: category,
        value: current,
        reason: "no compatible replacement found"
      });

      return;
    }

    const replacement = weightedPickV14(
      candidates,
      function (preset) {
        return getV14AuthoritativeOptionWeight(
          category,
          preset,
          state
        );
      }
    );

    if (!replacement) {
      conflicts.push({
        category: category,
        value: current,
        reason: "replacement selection failed"
      });

      return;
    }

    const replacementValue = getPresetValue(replacement);

    state[category] = replacementValue;

    repaired.push({
      category: category,
      from: current,
      to: replacementValue
    });
  });

  return {
    state: state,
    repaired: repaired,
    conflicts: conflicts
  };
}


// ------------------------------------------------------------
// 29.19 — COMPLETE PIPELINE
// ------------------------------------------------------------

function runV14GenerationPipeline(config, manualState) {
  const cfg = normalizeV14GenerationConfig(config);

  let state = createGenerationState();

  if (manualState) {
    preserveV14ManualSelections(
      state,
      manualState
    );
  }

  // --------------------------------------------------------
  // ORDER MATTERS.
  //
  // Identity comes first because it establishes gender and
  // profile.
  //
  // Body comes next because body relationships depend on
  // gender/profile.
  //
  // Appearance and hair then inherit that context.
  //
  // Clothing sees the finished subject.
  //
  // Action sees the clothing.
  //
  // Camera/style sees the action and clothing.
  // --------------------------------------------------------

  state = runV14IdentityStage(
    state,
    cfg,
    manualState
  );

  state = runV14BodyStage(
    state,
    cfg,
    manualState
  );

  state = runV14AppearanceStage(
    state,
    cfg,
    manualState
  );

  state = runV14HairStage(
    state,
    cfg,
    manualState
  );

  state = runV14AccessoryStage(
    state,
    cfg,
    manualState
  );

  state = runV14ClothingStage(
    state,
    cfg,
    manualState
  );

  state = runV14ActionStage(
    state,
    cfg,
    manualState
  );

  state = runV14SceneStage(
    state,
    cfg,
    manualState
  );

  const repairResult = repairV14RequiredRelationships(
    state,
    cfg,
    manualState
  );

  state = repairResult.state;

  preserveV14ManualSelections(
    state,
    manualState
  );

  return {
    state: state,
    config: cfg,
    repaired: repairResult.repaired,
    conflicts: repairResult.conflicts
  };
}


// ------------------------------------------------------------
// 29.20 — PIPELINE SUMMARY
// ------------------------------------------------------------

function getV14PipelineSummary(result) {
  if (!result) {
    return {
      state: null,
      repaired: [],
      conflicts: []
    };
  }

  return {
    state: result.state || null,
    repaired: result.repaired || [],
    conflicts: result.conflicts || []
  };
}


// ------------------------------------------------------------
// 29.21 — PIPELINE DEBUG REPORT
// ------------------------------------------------------------

function getV14PipelineDebugReport(result) {
  if (!result) {
    return {
      mode: "",
      repaired: [],
      conflicts: [],
      state: null
    };
  }

  const cfg = result.config || {};

  return {
    mode: cfg.randomizationMode || "",
    repaired: result.repaired || [],
    conflicts: result.conflicts || [],
    state: cloneGenerationState(result.state)
  };
}


// ------------------------------------------------------------
// 29.22 — PUBLIC PIPELINE API
// ------------------------------------------------------------

const V14_GENERATION_PIPELINE = {
  normalizeConfig: normalizeV14GenerationConfig,

  isCompatibleMode: isV14CompatibleMode,
  isFreeMode: isV14FreeMode,

  hasManualSelection: hasV14ManualSelection,
  getManualSelection: getV14ManualSelection,
  preserveManualSelections: preserveV14ManualSelections,

  canRandomizeCategory: canV14RandomizeCategory,
  getConfigKeyForCategory: getV14ConfigKeyForCategory,

  randomizeCategory: randomizeV14CategoryAuthoritative,
  applyRandomCategory: applyV14RandomCategory,

  runIdentity: runV14IdentityStage,
  runBody: runV14BodyStage,
  runAppearance: runV14AppearanceStage,
  runHair: runV14HairStage,
  runAccessories: runV14AccessoryStage,
  runClothing: runV14ClothingStage,
  runAction: runV14ActionStage,
  runScene: runV14SceneStage,

  repairRequiredRelationships:
    repairV14RequiredRelationships,

  run: runV14GenerationPipeline,

  summary: getV14PipelineSummary,
  debug: getV14PipelineDebugReport
};
// ============================================================
// CHUNK 30 — MANUAL SELECTION STATE + PRESET COLLECTION REGISTRY
// ============================================================
//
// This layer gives V14 one consistent way to:
//
//   • find any preset by stable ID
//   • find any preset by value
//   • distinguish a manual selection from a random selection
//   • store manual selections separately
//   • apply manual selections to generation state
//   • validate manual selections
//   • expose collections to the UI
//
// IMPORTANT:
//
// UI menu positions are NOT used as persistent identities.
//
// The UI may say:
//
//     item 0
//     item 1
//     item 2
//
// but internally V14 works with:
//
//     gender.woman
//     gender.man
//     hairColor.red
//     clothing.top.tshirt
//
// That means adding, removing, or reordering presets does not
// break the generation logic.
// ============================================================


// ------------------------------------------------------------
// 30.1 — CENTRAL PRESET COLLECTION REGISTRY
// ------------------------------------------------------------

const V14_PRESET_COLLECTIONS = {
  gender: genderPresets,
  nationality: nationalityPresets,
  age: agePresets,

  skin: skinTonePresets,
  eyes: eyeColorPresets,

  overallBuild: overallBuildPresets,
  height: heightPresets,
  chest: chestPresets,
  hips: hipsPresets,
  lips: lipsPresets,
  eyelashes: eyelashesPresets,
  bodyShape: bodyShapePresets,
  legs: legsPresets,
  buttocks: buttocksPresets,
  belly: bellyPresets,
  specificBody: specificBodyPresets,

  makeup: makeupPresets,
  makeupOddities: makeupOdditiesPresets,
  facialHair: facialHairPresets,
  tattoos: tattooPresets,
  bodyDetails: bodyDetailPresets,
  nails: nailPresets,
  hairDetails: hairDetailPresets,
  nose: nosePresets,

  hairColor: hairColorPresets,
  hairLength: hairLengthPresets,
  hairType: hairTypePresets,
  hairstyles: hairstylePresets,

  accessories: accessoryPresets,

  clothing: clothingPresets,

  action: allActionPresets,

  camera: cameraPresets,
  lighting: lightingPresets,
  timeOfDay: timeOfDayPresets,
  artStyle: artStylePresets
};


// ------------------------------------------------------------
// 30.2 — COLLECTION LABELS
// ------------------------------------------------------------

const V14_CATEGORY_LABELS = {
  gender: "Gender",
  nationality: "Nationality",
  age: "Age",

  skin: "Skin Tone",
  eyes: "Eye Color",

  overallBuild: "Overall Build",
  height: "Height",
  chest: "Chest",
  hips: "Hips",
  lips: "Lips",
  eyelashes: "Eyelashes",
  bodyShape: "Body Shape",
  legs: "Legs",
  buttocks: "Buttocks",
  belly: "Belly",
  specificBody: "Specific Body",

  makeup: "Makeup",
  makeupOddities: "Makeup Oddities",
  facialHair: "Facial Hair",
  tattoos: "Tattoos",
  bodyDetails: "Body Details",
  nails: "Nails",
  hairDetails: "Hair Details",
  nose: "Nose",

  hairColor: "Hair Color",
  hairLength: "Hair Length",
  hairType: "Hair Type",
  hairstyles: "Hairstyle",

  accessories: "Accessories",

  clothing: "Clothing",

  action: "Action",

  camera: "Camera",
  lighting: "Lighting",
  timeOfDay: "Time of Day",
  artStyle: "Art Style"
};


// ------------------------------------------------------------
// 30.3 — COLLECTION ACCESS
// ------------------------------------------------------------

function getV14PresetCollection(category) {
  return V14_PRESET_COLLECTIONS[category] || [];
}


function getV14CategoryLabel(category) {
  return (
    V14_CATEGORY_LABELS[category] ||
    category
  );
}


// ------------------------------------------------------------
// 30.4 — PRESET LOOKUP
// ------------------------------------------------------------

function findV14PresetById(category, id) {
  const collection = getV14PresetCollection(category);

  if (!id) {
    return null;
  }

  for (let i = 0; i < collection.length; i++) {
    const preset = collection[i];

    if (getPresetId(preset) === id) {
      return preset;
    }
  }

  return null;
}


function findV14PresetByValue(category, value) {
  const collection = getV14PresetCollection(category);

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const normalizedValue =
    normalizeV14RelationshipValue(value);

  for (let i = 0; i < collection.length; i++) {
    const preset = collection[i];

    if (
      normalizeV14RelationshipValue(
        getPresetValue(preset)
      ) === normalizedValue
    ) {
      return preset;
    }
  }

  return null;
}


function findV14PresetByLabel(category, label) {
  const collection = getV14PresetCollection(category);

  if (!label) {
    return null;
  }

  const normalizedLabel =
    String(label).trim().toLowerCase();

  for (let i = 0; i < collection.length; i++) {
    const preset = collection[i];

    if (
      String(getPresetLabel(preset))
        .trim()
        .toLowerCase() === normalizedLabel
    ) {
      return preset;
    }
  }

  return null;
}


// ------------------------------------------------------------
// 30.5 — GENERIC PRESET RESOLUTION
// ------------------------------------------------------------
//
// Accepts:
//
//   stable ID
//   preset object
//   value
//   label
//
// This makes the rest of V14 much less dependent on how a
// selection entered the system.
// ------------------------------------------------------------

function resolveV14Preset(category, selection) {
  if (
    selection === undefined ||
    selection === null ||
    selection === ""
  ) {
    return null;
  }

  if (
    typeof selection === "object" &&
    getPresetValue(selection) !== undefined
  ) {
    return selection;
  }

  const byId = findV14PresetById(
    category,
    selection
  );

  if (byId) {
    return byId;
  }

  const byValue = findV14PresetByValue(
    category,
    selection
  );

  if (byValue) {
    return byValue;
  }

  return findV14PresetByLabel(
    category,
    selection
  );
}


// ------------------------------------------------------------
// 30.6 — MANUAL SELECTION STATE
// ------------------------------------------------------------

function createV14ManualSelectionState() {
  return {
    gender: null,
    nationality: null,
    nationalityProfile: null,
    age: null,

    skin: null,
    eyes: null,
    overallBuild: null,
    height: null,
    chest: null,
    hips: null,
    lips: null,
    eyelashes: null,
    bodyShape: null,
    legs: null,
    buttocks: null,
    belly: null,
    specificBody: null,

    makeup: null,
    makeupOddities: null,
    facialHair: null,
    tattoos: null,
    bodyDetails: null,
    nails: null,
    hairDetails: null,
    nose: null,

    hairColor: null,
    hairLength: null,
    hairType: null,
    hairstyles: null,

    accessories: [],

    clothing: [],
    clothingGroups: [],

    action: null,
    actionGroups: [],

    camera: null,
    lighting: null,
    timeOfDay: null,
    artStyle: null
  };
}


// ------------------------------------------------------------
// 30.7 — MANUAL VALUE NORMALIZATION
// ------------------------------------------------------------

function normalizeV14ManualSelection(
  category,
  selection
) {
  if (
    selection === undefined ||
    selection === null ||
    selection === ""
  ) {
    return null;
  }

  if (Array.isArray(selection)) {
    const result = [];

    selection.forEach(function (item) {
      const preset = resolveV14Preset(
        category,
        item
      );

      if (preset) {
        result.push(getPresetValue(preset));
      }
    });

    return result;
  }

  const preset = resolveV14Preset(
    category,
    selection
  );

  return preset
    ? getPresetValue(preset)
    : null;
}


// ------------------------------------------------------------
// 30.8 — RECORDING A MANUAL SELECTION
// ------------------------------------------------------------

function setV14ManualSelection(
  manualState,
  category,
  selection
) {
  if (!manualState || !category) {
    return null;
  }

  const normalized =
    normalizeV14ManualSelection(
      category,
      selection
    );

  if (Array.isArray(normalized)) {
    manualState[category] =
      normalized.slice();

    return manualState[category];
  }

  manualState[category] =
    normalized;

  return manualState[category];
}


// ------------------------------------------------------------
// 30.9 — CLEARING A MANUAL SELECTION
// ------------------------------------------------------------

function clearV14ManualSelection(
  manualState,
  category
) {
  if (!manualState || !category) {
    return;
  }

  if (
    Array.isArray(manualState[category])
  ) {
    manualState[category] = [];
  } else {
    manualState[category] = null;
  }
}


function clearAllV14ManualSelections(manualState) {
  if (!manualState) {
    return;
  }

  Object.keys(manualState).forEach(
    function (category) {
      if (
        Array.isArray(
          manualState[category]
        )
      ) {
        manualState[category] = [];
      } else {
        manualState[category] = null;
      }
    }
  );
}


// ------------------------------------------------------------
// 30.10 — TEST WHETHER A MANUAL VALUE EXISTS
// ------------------------------------------------------------

function hasV14ExplicitManualSelection(
  manualState,
  category
) {
  if (!manualState) {
    return false;
  }

  const value =
    manualState[category];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
}


// ------------------------------------------------------------
// 30.11 — APPLY MANUAL STATE TO GENERATION STATE
// ------------------------------------------------------------

function applyV14ManualStateToGenerationState(
  state,
  manualState
) {
  if (!state || !manualState) {
    return state;
  }

  Object.keys(manualState).forEach(
    function (category) {
      const value =
        manualState[category];

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          state[category] =
            value.slice();
        }
        return;
      }

      state[category] = value;
    }
  );

  return state;
}


// ------------------------------------------------------------
// 30.12 — VALIDATE MANUAL SELECTION
// ------------------------------------------------------------

function validateV14ManualSelection(
  category,
  selection,
  state
) {
  const preset =
    resolveV14Preset(
      category,
      selection
    );

  if (!preset) {
    return {
      valid: false,
      category: category,
      selection: selection,
      reason: "preset not found"
    };
  }

  if (
    isV14OptionBlocked(
      category,
      preset,
      state || createGenerationState()
    )
  ) {
    return {
      valid: false,
      category: category,
      selection: selection,
      reason: "selection is blocked by current state"
    };
  }

  return {
    valid: true,
    category: category,
    selection: getPresetValue(preset),
    preset: preset
  };
}


// ------------------------------------------------------------
// 30.13 — VALIDATE ALL MANUAL SELECTIONS
// ------------------------------------------------------------

function validateV14ManualSelections(
  manualState,
  state
) {
  const results = [];
  const currentState =
    state || createGenerationState();

  if (!manualState) {
    return results;
  }

  Object.keys(manualState).forEach(
    function (category) {
      const value =
        manualState[category];

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(
          function (item) {
            results.push(
              validateV14ManualSelection(
                category,
                item,
                currentState
              )
            );
          }
        );

        return;
      }

      results.push(
        validateV14ManualSelection(
          category,
          value,
          currentState
        )
      );
    }
  );

  return results;
}


// ------------------------------------------------------------
// 30.14 — MANUAL SELECTION REPORT
// ------------------------------------------------------------

function getV14ManualSelectionReport(
  manualState
) {
  const report = [];

  if (!manualState) {
    return report;
  }

  Object.keys(manualState).forEach(
    function (category) {
      const value =
        manualState[category];

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return;
        }

        report.push({
          category: category,
          label:
            getV14CategoryLabel(
              category
            ),
          values: value.slice()
        });

        return;
      }

      report.push({
        category: category,
        label:
          getV14CategoryLabel(
            category
          ),
        value: value
      });
    }
  );

  return report;
}


// ------------------------------------------------------------
// 30.15 — GET COMPATIBLE MANUAL OPTIONS
// ------------------------------------------------------------
//
// This is useful for the UI.
//
// If the user manually selects:
//
//     gender = man
//
// then the UI can ask:
//
//     "Which chest options are compatible?"
//
// rather than displaying the entire collection as equally valid.
// ------------------------------------------------------------

function getV14ManualCompatibleOptions(
  category,
  state
) {
  const collection =
    getV14PresetCollection(category);

  if (!collection.length) {
    return [];
  }

  return getV14CompatibleOptions(
    category,
    collection,
    state || createGenerationState()
  );
}


// ------------------------------------------------------------
// 30.16 — HUMAN-READABLE COMPATIBILITY INFORMATION
// ------------------------------------------------------------

function getV14ManualOptionExplanation(
  category,
  selection,
  state
) {
  const preset =
    resolveV14Preset(
      category,
      selection
    );

  if (!preset) {
    return {
      category: category,
      selection: selection,
      relationships: []
    };
  }

  return getV14RelationshipReport(
    category,
    preset,
    state || createGenerationState()
  );
}


// ------------------------------------------------------------
// 30.17 — SNAPSHOT / RESTORE
// ------------------------------------------------------------

function cloneV14ManualSelectionState(
  manualState
) {
  const clone =
    createV14ManualSelectionState();

  if (!manualState) {
    return clone;
  }

  Object.keys(clone).forEach(
    function (category) {
      const value =
        manualState[category];

      if (Array.isArray(value)) {
        clone[category] =
          value.slice();
      } else {
        clone[category] =
          value;
      }
    }
  );

  return clone;
}


function restoreV14ManualSelectionState(
  target,
  snapshot
) {
  if (!target || !snapshot) {
    return target;
  }

  Object.keys(target).forEach(
    function (category) {
      if (
        Array.isArray(
          snapshot[category]
        )
      ) {
        target[category] =
          snapshot[category].slice();
      } else {
        target[category] =
          snapshot[category] !== undefined
            ? snapshot[category]
            : null;
      }
    }
  );

  return target;
}


// ------------------------------------------------------------
// 30.18 — PRESET COLLECTION INFORMATION
// ------------------------------------------------------------

function getV14CollectionInfo(category) {
  const collection =
    getV14PresetCollection(category);

  return {
    category: category,
    label:
      getV14CategoryLabel(category),
    count: collection.length,
    presets: collection.map(
      function (preset) {
        return {
          id: getPresetId(preset),
          label: getPresetLabel(preset),
          value: getPresetValue(preset)
        };
      }
    )
  };
}


// ------------------------------------------------------------
// 30.19 — ALL COLLECTION INFORMATION
// ------------------------------------------------------------

function getV14AllCollectionInfo() {
  const result = {};

  Object.keys(
    V14_PRESET_COLLECTIONS
  ).forEach(
    function (category) {
      result[category] =
        getV14CollectionInfo(
          category
        );
    }
  );

  return result;
}


// ------------------------------------------------------------
// 30.20 — MANUAL STATE → PIPELINE CONFIG
// ------------------------------------------------------------
//
// This function does not randomize anything.
//
// It simply converts the current manual selections into a
// configuration object that the generation pipeline can use.
// ------------------------------------------------------------

function createV14ManualGenerationConfig(
  manualState,
  overrides
) {
  const config =
    normalizeV14GenerationConfig(
      overrides || {}
    );

  config.preserveManualSelections = true;

  config.manualState =
    cloneV14ManualSelectionState(
      manualState
    );

  return config;
}


// ------------------------------------------------------------
// 30.21 — BUILD A STATE WITH MANUAL SELECTIONS
// ------------------------------------------------------------

function createV14StateFromManualSelections(
  manualState
) {
  const state =
    createGenerationState();

  applyV14ManualStateToGenerationState(
    state,
    manualState
  );

  return state;
}


// ------------------------------------------------------------
// 30.22 — PUBLIC MANUAL-SELECTION API
// ------------------------------------------------------------

const V14_MANUAL_SELECTIONS = {
  create:
    createV14ManualSelectionState,

  set:
    setV14ManualSelection,

  clear:
    clearV14ManualSelection,

  clearAll:
    clearAllV14ManualSelections,

  has:
    hasV14ExplicitManualSelection,

  apply:
    applyV14ManualStateToGenerationState,

  validate:
    validateV14ManualSelection,

  validateAll:
    validateV14ManualSelections,

  report:
    getV14ManualSelectionReport,

  compatibleOptions:
    getV14ManualCompatibleOptions,

  explanation:
    getV14ManualOptionExplanation,

  clone:
    cloneV14ManualSelectionState,

  restore:
    restoreV14ManualSelectionState,

  createConfig:
    createV14ManualGenerationConfig,

  createState:
    createV14StateFromManualSelections
};


// ------------------------------------------------------------
// 30.23 — PUBLIC PRESET REGISTRY API
// ------------------------------------------------------------

const V14_PRESET_REGISTRY = {
  collections:
    V14_PRESET_COLLECTIONS,

  labels:
    V14_CATEGORY_LABELS,

  get:
    getV14PresetCollection,

  categoryLabel:
    getV14CategoryLabel,

  findById:
    findV14PresetById,

  findByValue:
    findV14PresetByValue,

  findByLabel:
    findV14PresetByLabel,

  resolve:
    resolveV14Preset,

  collectionInfo:
    getV14CollectionInfo,

  allCollectionInfo:
    getV14AllCollectionInfo
};


// ============================================================
// CHUNK 31 — MANUAL UI STATE → STABLE V14 STATE
// ============================================================
//
// This layer connects the Draw Things controls to the V14
// internal state.
//
// IMPORTANT:
//
// Draw Things menus return positions.
//
// V14 does NOT use those positions as identities.
//
// The conversion happens exactly once:
//
//     UI menu position
//             ↓
//     preset object
//             ↓
//     stable preset value / ID
//             ↓
//     V14 generation state
//
// After that point, the generation engine works with stable
// values and metadata.
//
// ============================================================


// ------------------------------------------------------------
// 31.1 — UI VALUE HELPERS
// ------------------------------------------------------------

function v14GetMenuSelection(
  value,
  presets
) {
  if (
    !presets ||
    presets.length === 0
  ) {
    return null;
  }

  if (
    typeof value === "number" &&
    value >= 0 &&
    value < presets.length
  ) {
    return presets[value];
  }

  return resolveV14Preset(
    null,
    value
  );
}


function v14ResolveMenuSelection(
  category,
  menuValue
) {
  const presets =
    getV14PresetCollection(category);

  if (
    menuValue === undefined ||
    menuValue === null
  ) {
    return null;
  }

  if (
    typeof menuValue === "number"
  ) {
    if (
      menuValue === NONE_SELECTED
    ) {
      return null;
    }

    if (
      menuValue >= 0 &&
      menuValue < presets.length
    ) {
      return presets[menuValue];
    }

    return null;
  }

  return resolveV14Preset(
    category,
    menuValue
  );
}


// ------------------------------------------------------------
// 31.2 — UI MENU POSITION → PRESET VALUE
// ------------------------------------------------------------

function v14MenuValueToPresetValue(
  category,
  menuValue
) {
  const preset =
    v14ResolveMenuSelection(
      category,
      menuValue
    );

  if (!preset) {
    return null;
  }

  return getPresetValue(preset);
}


// ------------------------------------------------------------
// 31.3 — MULTI-SELECTION CONVERSION
// ------------------------------------------------------------

function v14MenuValuesToPresetValues(
  category,
  menuValues
) {
  if (!Array.isArray(menuValues)) {
    return [];
  }

  const result = [];

  menuValues.forEach(
    function (menuValue) {
      const value =
        v14MenuValueToPresetValue(
          category,
          menuValue
        );

      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        result.push(value);
      }
    }
  );

  return result;
}


// ------------------------------------------------------------
// 31.4 — BUILD EMPTY UI STATE
// ------------------------------------------------------------

function createV14UISelectionState() {
  return {
    model: null,
    aspectRatio: null,

    randomizationMode: "compatible",

    randomizeIdentity: false,
    randomizeBody: false,
    randomizeAppearance: false,
    randomizeHair: false,
    randomizeAccessories: false,
    randomizeClothing: false,
    randomizeAction: false,
    randomizeCamera: false,
    randomizeLighting: false,
    randomizeTimeOfDay: false,
    randomizeArtStyle: false,

    gender: NONE_SELECTED,
    nationality: NONE_SELECTED,
    age: NONE_SELECTED,

    skin: NONE_SELECTED,
    eyes: NONE_SELECTED,
    overallBuild: NONE_SELECTED,
    height: NONE_SELECTED,
    chest: NONE_SELECTED,
    hips: NONE_SELECTED,
    lips: NONE_SELECTED,
    eyelashes: NONE_SELECTED,
    bodyShape: NONE_SELECTED,
    legs: NONE_SELECTED,
    buttocks: NONE_SELECTED,
    belly: NONE_SELECTED,
    specificBody: NONE_SELECTED,

    makeup: NONE_SELECTED,
    makeupOddities: NONE_SELECTED,
    facialHair: NONE_SELECTED,
    tattoos: [],
    bodyDetails: [],
    nails: NONE_SELECTED,
    hairDetails: [],
    nose: NONE_SELECTED,

    hairColor: NONE_SELECTED,
    hairLength: NONE_SELECTED,
    hairType: NONE_SELECTED,
    hairstyles: [],

    accessories: [],

    clothing: [],
    clothingGroups: [],

    action: NONE_SELECTED,
    actionGroups: [],

    camera: NONE_SELECTED,
    lighting: NONE_SELECTED,
    timeOfDay: NONE_SELECTED,
    artStyle: NONE_SELECTED,

    customPrompt: "",

    qwenEnabled: false,
    qwenPrompt: ""
  };
}


// ------------------------------------------------------------
// 31.5 — SINGLE UI CATEGORY MAPPING
// ------------------------------------------------------------
//
// Converts one UI selection into an internal value.
//
// Multi-select categories are handled separately.
// ------------------------------------------------------------

const V14_SINGLE_UI_CATEGORIES = [
  "gender",
  "nationality",
  "age",

  "skin",
  "eyes",
  "overallBuild",
  "height",
  "chest",
  "hips",
  "lips",
  "eyelashes",
  "bodyShape",
  "legs",
  "buttocks",
  "belly",
  "specificBody",

  "makeup",
  "makeupOddities",
  "facialHair",
  "nails",
  "nose",

  "hairColor",
  "hairLength",
  "hairType",

  "action",
  "camera",
  "lighting",
  "timeOfDay",
  "artStyle"
];


// ------------------------------------------------------------
// 31.6 — MULTI UI CATEGORY MAPPING
// ------------------------------------------------------------

const V14_MULTI_UI_CATEGORIES = [
  "tattoos",
  "bodyDetails",
  "hairDetails",
  "hairstyles",
  "accessories",
  "clothing",
  "clothingGroups",
  "actionGroups"
];


// ------------------------------------------------------------
// 31.7 — CONVERT UI STATE TO MANUAL STATE
// ------------------------------------------------------------

function convertV14UIStateToManualState(
  uiState
) {
  const manualState =
    createV14ManualSelectionState();

  if (!uiState) {
    return manualState;
  }

  // --------------------------------------------------------
  // Single-value categories
  // --------------------------------------------------------

  V14_SINGLE_UI_CATEGORIES.forEach(
    function (category) {
      const menuValue =
        uiState[category];

      if (
        menuValue === undefined ||
        menuValue === null ||
        menuValue === NONE_SELECTED
      ) {
        return;
      }

      const value =
        v14MenuValueToPresetValue(
          category,
          menuValue
        );

      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        manualState[category] =
          value;
      }
    }
  );


  // --------------------------------------------------------
  // Multi-value categories
  // --------------------------------------------------------

  V14_MULTI_UI_CATEGORIES.forEach(
    function (category) {
      const menuValues =
        uiState[category];

      if (
        !Array.isArray(menuValues)
      ) {
        return;
      }

      manualState[category] =
        v14MenuValuesToPresetValues(
          category,
          menuValues
        );
    }
  );


  return manualState;
}


// ------------------------------------------------------------
// 31.8 — RANDOMIZATION SWITCH STATE
// ------------------------------------------------------------

function getV14RandomizationConfigFromUI(
  uiState
) {
  const config =
    normalizeV14GenerationConfig({});

  if (!uiState) {
    return config;
  }

  if (
    uiState.randomizationMode ===
    "free"
  ) {
    config.randomizationMode = "free";
  } else {
    config.randomizationMode =
      "compatible";
  }

  config.randomizeIdentity =
    uiState.randomizeIdentity === true;

  config.randomizeBody =
    uiState.randomizeBody === true;

  config.randomizeAppearance =
    uiState.randomizeAppearance === true;

  config.randomizeHair =
    uiState.randomizeHair === true;

  config.randomizeAccessories =
    uiState.randomizeAccessories === true;

  config.randomizeClothing =
    uiState.randomizeClothing === true;

  config.randomizeAction =
    uiState.randomizeAction === true;

  config.randomizeCamera =
    uiState.randomizeCamera === true;

  config.randomizeLighting =
    uiState.randomizeLighting === true;

  config.randomizeTimeOfDay =
    uiState.randomizeTimeOfDay === true;

  config.randomizeArtStyle =
    uiState.randomizeArtStyle === true;

  config.preserveManualSelections =
    true;

  config.repairInvalidSelections =
    true;

  return config;
}


// ------------------------------------------------------------
// 31.9 — BUILD COMPLETE V14 GENERATION INPUT
// ------------------------------------------------------------

function createV14GenerationInput(
  uiState
) {
  const manualState =
    convertV14UIStateToManualState(
      uiState
    );

  const config =
    getV14RandomizationConfigFromUI(
      uiState
    );

  return {
    uiState: uiState,
    manualState: manualState,
    config: config
  };
}


// ------------------------------------------------------------
// 31.10 — APPLY UI INPUT TO A NEW STATE
// ------------------------------------------------------------

function createV14GenerationStateFromUI(
  uiState
) {
  const input =
    createV14GenerationInput(
      uiState
    );

  const state =
    createGenerationState();

  applyV14ManualStateToGenerationState(
    state,
    input.manualState
  );

  return {
    state: state,
    manualState: input.manualState,
    config: input.config
  };
}


// ------------------------------------------------------------
// 31.11 — MODEL RESOLUTION
// ------------------------------------------------------------

function resolveV14ModelSelection(
  selection
) {
  if (
    selection === undefined ||
    selection === null ||
    selection === ""
  ) {
    return MODEL_OPTIONS[0];
  }

  if (
    typeof selection === "number"
  ) {
    return MODEL_OPTIONS[
      selection
    ] || MODEL_OPTIONS[0];
  }

  for (
    let i = 0;
    i < MODEL_OPTIONS.length;
    i++
  ) {
    const model =
      MODEL_OPTIONS[i];

    if (
      model.id === selection ||
      model.label === selection ||
      model.file === selection
    ) {
      return model;
    }
  }

  return MODEL_OPTIONS[0];
}


// ------------------------------------------------------------
// 31.12 — ASPECT RATIO RESOLUTION
// ------------------------------------------------------------

function resolveV14AspectSelection(
  selection
) {
  if (
    selection === undefined ||
    selection === null ||
    selection === ""
  ) {
    return ASPECT_OPTIONS[0];
  }

  if (
    typeof selection === "number"
  ) {
    return (
      ASPECT_OPTIONS[
      selection
      ] ||
      ASPECT_OPTIONS[0]
    );
  }

  for (
    let i = 0;
    i < ASPECT_OPTIONS.length;
    i++
  ) {
    const aspect =
      ASPECT_OPTIONS[i];

    if (
      aspect.id === selection ||
      aspect.label === selection ||
      aspect.width + "x" +
      aspect.height === selection
    ) {
      return aspect;
    }
  }

  return ASPECT_OPTIONS[0];
}


// ------------------------------------------------------------
// 31.13 — QWEN SETTINGS
// ------------------------------------------------------------

function getV14QwenSettings(uiState) {
  if (!uiState) {
    return {
      enabled: false,
      prompt: ""
    };
  }

  return {
    enabled:
      uiState.qwenEnabled === true,

    prompt:
      typeof uiState.qwenPrompt ===
        "string"
        ? uiState.qwenPrompt.trim()
        : ""
  };
}


// ------------------------------------------------------------
// 31.14 — CUSTOM PROMPT
// ------------------------------------------------------------

function getV14CustomPrompt(uiState) {
  if (
    !uiState ||
    typeof uiState.customPrompt !==
    "string"
  ) {
    return "";
  }

  return uiState.customPrompt.trim();
}


// ------------------------------------------------------------
// 31.15 — COMPLETE INPUT RESOLUTION
// ------------------------------------------------------------

function resolveV14GenerationInput(
  uiState
) {
  const input =
    createV14GenerationInput(
      uiState
    );

  return {
    manualState:
      input.manualState,

    config:
      input.config,

    model:
      resolveV14ModelSelection(
        uiState
          ? uiState.model
          : null
      ),

    aspectRatio:
      resolveV14AspectSelection(
        uiState
          ? uiState.aspectRatio
          : null
      ),

    qwen:
      getV14QwenSettings(
        uiState
      ),

    customPrompt:
      getV14CustomPrompt(
        uiState
      )
  };
}


// ------------------------------------------------------------
// 31.16 — VALIDATE COMPLETE INPUT
// ------------------------------------------------------------

function validateV14GenerationInput(
  input
) {
  const errors = [];
  const warnings = [];

  if (!input) {
    return {
      valid: false,
      errors: [
        "No generation input was provided."
      ],
      warnings: []
    };
  }

  if (!input.model) {
    errors.push(
      "No model was selected."
    );
  }

  if (!input.aspectRatio) {
    errors.push(
      "No aspect ratio was selected."
    );
  }

  if (input.manualState) {
    const state =
      createV14StateFromManualSelections(
        input.manualState
      );

    const results =
      validateV14ManualSelections(
        input.manualState,
        state
      );

    results.forEach(
      function (result) {
        if (!result.valid) {
          warnings.push({
            category:
              result.category,
            selection:
              result.selection,
            reason:
              result.reason
          });
        }
      }
    );
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}


// ------------------------------------------------------------
// 31.17 — UI → GENERATION PIPELINE
// ------------------------------------------------------------

function generateV14FromUIState(
  uiState
) {
  const input =
    resolveV14GenerationInput(
      uiState
    );

  const validation =
    validateV14GenerationInput(
      input
    );

  if (!validation.valid) {
    return {
      success: false,
      validation: validation,
      input: input,
      result: null
    };
  }

  const result =
    runV14GenerationPipeline(
      input.config,
      input.manualState
    );

  return {
    success: true,
    validation: validation,
    input: input,
    result: result
  };
}


// ------------------------------------------------------------
// 31.18 — PUBLIC UI STATE API
// ------------------------------------------------------------

const V14_UI_STATE = {
  create:
    createV14UISelectionState,

  menuValueToPresetValue:
    v14MenuValueToPresetValue,

  menuValuesToPresetValues:
    v14MenuValuesToPresetValues,

  toManualState:
    convertV14UIStateToManualState,

  getRandomizationConfig:
    getV14RandomizationConfigFromUI,

  createInput:
    createV14GenerationInput,

  createState:
    createV14GenerationStateFromUI,

  resolveModel:
    resolveV14ModelSelection,

  resolveAspect:
    resolveV14AspectSelection,

  qwen:
    getV14QwenSettings,

  customPrompt:
    getV14CustomPrompt,

  resolveInput:
    resolveV14GenerationInput,

  validate:
    validateV14GenerationInput,

  generate:
    generateV14FromUIState
};


// ============================================================
// CHUNK 32 — PROMPT ASSEMBLY & SUBJECT DESCRIPTION
// ============================================================
//
// This layer converts the finished V14 generation state into
// the actual prompt text.
//
// IMPORTANT:
//
// The randomization engine decides WHAT exists.
//
// This layer decides HOW those decisions are expressed.
//
// It does not randomly select traits.
// It does not change selections.
// It does not use menu indexes.
//
// ============================================================


// ------------------------------------------------------------
// 32.1 — PROMPT TEXT NORMALIZATION
// ------------------------------------------------------------

function normalizeV14PromptText(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+\./g, ".")
    .trim();
}


function joinV14PromptParts(parts) {
  return normalizeV14PromptText(
    parts
      .filter(function (part) {
        return (
          part !== undefined &&
          part !== null &&
          String(part).trim() !== ""
        );
      })
      .map(function (part) {
        return String(part).trim();
      })
      .join(", ")
  );
}


// ------------------------------------------------------------
// 32.2 — PRESET VALUE RESOLUTION
// ------------------------------------------------------------

function getV14StatePresetValue(
  state,
  category
) {
  if (!state) {
    return "";
  }

  const value = state[category];

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map(function (item) {
        const preset =
          resolveV14Preset(
            category,
            item
          );

        return preset
          ? getPresetValue(preset)
          : String(item);
      })
      .filter(function (item) {
        return item !== "";
      });
  }

  const preset =
    resolveV14Preset(
      category,
      value
    );

  return preset
    ? getPresetValue(preset)
    : String(value);
}


// ------------------------------------------------------------
// 32.3 — IDENTITY DESCRIPTION
// ------------------------------------------------------------

function buildV14IdentityDescription(state) {
  if (!state) {
    return "";
  }

  const parts = [];

  const gender =
    getV14StatePresetValue(
      state,
      "gender"
    );

  const age =
    getV14StatePresetValue(
      state,
      "age"
    );

  const nationality =
    getV14StatePresetValue(
      state,
      "nationality"
    );

  if (age) {
    parts.push(age);
  }

  if (gender) {
    parts.push(gender);
  }

  if (nationality) {
    parts.push(nationality);
  }

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.4 — BODY DESCRIPTION
// ------------------------------------------------------------

function buildV14BodyDescription(state) {
  if (!state) {
    return "";
  }

  const parts = [];

  const categories = [
    "overallBuild",
    "height",
    "bodyShape",
    "chest",
    "hips",
    "legs",
    "buttocks",
    "belly",
    "lips",
    "eyelashes"
  ];

  categories.forEach(
    function (category) {
      const value =
        getV14StatePresetValue(
          state,
          category
        );

      if (value) {
        parts.push(value);
      }
    }
  );

  const specificBody =
    getV14StatePresetValue(
      state,
      "specificBody"
    );

  if (specificBody) {
    parts.push(specificBody);
  }

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.5 — SKIN / EYE DESCRIPTION
// ------------------------------------------------------------

function buildV14SkinAndEyeDescription(
  state
) {
  if (!state) {
    return "";
  }

  const parts = [];

  const skin =
    getV14StatePresetValue(
      state,
      "skin"
    );

  const eyes =
    getV14StatePresetValue(
      state,
      "eyes"
    );

  if (skin) {
    parts.push(skin);
  }

  if (eyes) {
    parts.push(eyes);
  }

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.6 — FACIAL / APPEARANCE DESCRIPTION
// ------------------------------------------------------------

function buildV14AppearanceDescription(
  state
) {
  if (!state) {
    return "";
  }

  const parts = [];

  [
    "nose",
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails"
  ].forEach(
    function (category) {
      const value =
        getV14StatePresetValue(
          state,
          category
        );

      if (Array.isArray(value)) {
        value.forEach(
          function (item) {
            if (item) {
              parts.push(item);
            }
          }
        );
      } else if (value) {
        parts.push(value);
      }
    }
  );

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.7 — HAIR DESCRIPTION
// ------------------------------------------------------------

function buildV14HairDescription(state) {
  if (!state) {
    return "";
  }

  const parts = [];

  [
    "hairColor",
    "hairLength",
    "hairType"
  ].forEach(
    function (category) {
      const value =
        getV14StatePresetValue(
          state,
          category
        );

      if (value) {
        parts.push(value);
      }
    }
  );

  const hairstyles =
    getV14StatePresetValue(
      state,
      "hairstyles"
    );

  if (Array.isArray(hairstyles)) {
    hairstyles.forEach(
      function (item) {
        if (item) {
          parts.push(item);
        }
      }
    );
  } else if (hairstyles) {
    parts.push(hairstyles);
  }

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.8 — ACCESSORY DESCRIPTION
// ------------------------------------------------------------

function buildV14AccessoryDescription(
  state
) {
  if (!state) {
    return "";
  }

  const accessories =
    getV14StatePresetValue(
      state,
      "accessories"
    );

  if (Array.isArray(accessories)) {
    return joinV14PromptParts(
      accessories
    );
  }

  return normalizeV14PromptText(
    accessories
  );
}


// ------------------------------------------------------------
// 32.9 — CLOTHING DESCRIPTION
// ------------------------------------------------------------

function buildV14ClothingDescription(
  state
) {
  if (!state) {
    return "";
  }

  const clothing =
    getV14StatePresetValue(
      state,
      "clothing"
    );

  if (Array.isArray(clothing)) {
    return joinV14PromptParts(
      clothing
    );
  }

  return normalizeV14PromptText(
    clothing
  );
}


// ------------------------------------------------------------
// 32.10 — ACTION DESCRIPTION
// ------------------------------------------------------------

function buildV14ActionDescription(state) {
  if (!state) {
    return "";
  }

  return normalizeV14PromptText(
    getV14StatePresetValue(
      state,
      "action"
    )
  );
}


// ------------------------------------------------------------
// 32.11 — CAMERA DESCRIPTION
// ------------------------------------------------------------

function buildV14CameraDescription(state) {
  if (!state) {
    return "";
  }

  return normalizeV14PromptText(
    getV14StatePresetValue(
      state,
      "camera"
    )
  );
}


// ------------------------------------------------------------
// 32.12 — LIGHTING DESCRIPTION
// ------------------------------------------------------------

function buildV14LightingDescription(
  state
) {
  if (!state) {
    return "";
  }

  const parts = [];

  const timeOfDay =
    getV14StatePresetValue(
      state,
      "timeOfDay"
    );

  const lighting =
    getV14StatePresetValue(
      state,
      "lighting"
    );

  if (timeOfDay) {
    parts.push(timeOfDay);
  }

  if (lighting) {
    parts.push(lighting);
  }

  return joinV14PromptParts(parts);
}


// ------------------------------------------------------------
// 32.13 — ART STYLE DESCRIPTION
// ------------------------------------------------------------

function buildV14ArtStyleDescription(
  state
) {
  if (!state) {
    return "";
  }

  return normalizeV14PromptText(
    getV14StatePresetValue(
      state,
      "artStyle"
    )
  );
}


// ------------------------------------------------------------
// 32.14 — COMPLETE SUBJECT DESCRIPTION
// ------------------------------------------------------------

function buildV14SubjectDescription(state) {
  if (!state) {
    return "";
  }

  const sections = [
    buildV14IdentityDescription(state),
    buildV14BodyDescription(state),
    buildV14SkinAndEyeDescription(state),
    buildV14AppearanceDescription(state),
    buildV14HairDescription(state),
    buildV14AccessoryDescription(state)
  ];

  return joinV14PromptParts(
    sections
  );
}


// ------------------------------------------------------------
// 32.15 — SUBJECT LEAD
// ------------------------------------------------------------
//
// This gives the prompt a simple natural opening.
//
// Example:
//
//     "A 32-year-old woman, Irish"
//
// rather than:
//
//     "A photo of a woman wearing ..."
//
// The detailed attributes follow afterward.
// ------------------------------------------------------------

function buildV14SubjectLead(state) {
  const identity =
    buildV14IdentityDescription(
      state
    );

  if (identity) {
    return "A " + identity;
  }

  const fallback =
    DEFAULT_PROMPT_FALLBACKS.subject ||
    "a woman";

  return fallback;
}


// ------------------------------------------------------------
// 32.16 — COMPLETE PROMPT
// ------------------------------------------------------------

function buildV14PromptFromState(
  state,
  options
) {
  const settings =
    options || {};

  if (!state) {
    return (
      DEFAULT_PROMPT_FALLBACKS
        .genericPrompt ||
      "a portrait of the subject"
    );
  }

  const subject =
    buildV14SubjectDescription(
      state
    );

  const clothing =
    buildV14ClothingDescription(
      state
    );

  const action =
    buildV14ActionDescription(
      state
    );

  const camera =
    buildV14CameraDescription(
      state
    );

  const lighting =
    buildV14LightingDescription(
      state
    );

  const artStyle =
    buildV14ArtStyleDescription(
      state
    );

  const parts = [];

  parts.push(
    settings.prefix ||
    "A photo of"
  );

  parts.push(
    subject ||
    DEFAULT_PROMPT_FALLBACKS.subject
  );

  if (clothing) {
    parts.push(
      "wearing " + clothing
    );
  }

  if (action) {
    parts.push(action);
  }

  if (camera) {
    parts.push(camera);
  }

  if (lighting) {
    parts.push(lighting);
  }

  if (artStyle) {
    parts.push(artStyle);
  }

  if (settings.customPrompt) {
    parts.push(
      settings.customPrompt
    );
  }

  return normalizeV14PromptText(
    parts.join(", ")
  );
}


// ------------------------------------------------------------
// 32.17 — PROMPT SECTION BREAKDOWN
// ------------------------------------------------------------

function getV14PromptSections(state) {
  return {
    identity:
      buildV14IdentityDescription(
        state
      ),

    body:
      buildV14BodyDescription(
        state
      ),

    skinEyes:
      buildV14SkinAndEyeDescription(
        state
      ),

    appearance:
      buildV14AppearanceDescription(
        state
      ),

    hair:
      buildV14HairDescription(
        state
      ),

    accessories:
      buildV14AccessoryDescription(
        state
      ),

    clothing:
      buildV14ClothingDescription(
        state
      ),

    action:
      buildV14ActionDescription(
        state
      ),

    camera:
      buildV14CameraDescription(
        state
      ),

    lighting:
      buildV14LightingDescription(
        state
      ),

    artStyle:
      buildV14ArtStyleDescription(
        state
      )
  };
}


// ------------------------------------------------------------
// 32.18 — PROMPT REPORT
// ------------------------------------------------------------

function getV14PromptReport(
  state,
  options
) {
  return {
    sections:
      getV14PromptSections(
        state
      ),

    prompt:
      buildV14PromptFromState(
        state,
        options
      )
  };
}


// ------------------------------------------------------------
// 32.19 — PROMPT FALLBACK
// ------------------------------------------------------------

function getV14SafePrompt(
  state,
  options
) {
  const prompt =
    buildV14PromptFromState(
      state,
      options
    );

  if (
    prompt &&
    prompt.trim() !== ""
  ) {
    return prompt;
  }

  return (
    DEFAULT_PROMPT_FALLBACKS
      .genericPrompt ||
    "a portrait of the subject"
  );
}


// ------------------------------------------------------------
// 32.20 — PUBLIC PROMPT API
// ------------------------------------------------------------

const V14_PROMPT_ENGINE = {
  normalize:
    normalizeV14PromptText,

  join:
    joinV14PromptParts,

  identity:
    buildV14IdentityDescription,

  body:
    buildV14BodyDescription,

  skinEyes:
    buildV14SkinAndEyeDescription,

  appearance:
    buildV14AppearanceDescription,

  hair:
    buildV14HairDescription,

  accessories:
    buildV14AccessoryDescription,

  clothing:
    buildV14ClothingDescription,

  action:
    buildV14ActionDescription,

  camera:
    buildV14CameraDescription,

  lighting:
    buildV14LightingDescription,

  artStyle:
    buildV14ArtStyleDescription,

  subject:
    buildV14SubjectDescription,

  subjectLead:
    buildV14SubjectLead,

  build:
    buildV14PromptFromState,

  sections:
    getV14PromptSections,

  report:
    getV14PromptReport,

  safe:
    getV14SafePrompt
};


// ============================================================
// CHUNK 33 — QWEN REFINEMENT + MODEL / ASPECT CONFIGURATION
// ============================================================
//
// This layer handles everything that happens AFTER the V14
// prompt has been assembled but BEFORE Draw Things receives
// the generation request.
//
// Pipeline:
//
//     V14 State
//         ↓
//     Prompt
//         ↓
//     Optional Qwen refinement
//         ↓
//     Final prompt
//         ↓
//     Model configuration
//         ↓
//     Aspect / dimensions
//         ↓
//     Draw Things request
//
// Qwen is a refinement step.
// It is NOT allowed to become a second randomizer.
//
// ============================================================


// ------------------------------------------------------------
// 33.1 — MODEL LOOKUP HELPERS
// ------------------------------------------------------------

function findV14ModelById(id) {
  if (!id) {
    return null;
  }

  for (
    let i = 0;
    i < MODEL_OPTIONS.length;
    i++
  ) {
    if (
      MODEL_OPTIONS[i].id === id
    ) {
      return MODEL_OPTIONS[i];
    }
  }

  return null;
}


function findV14ModelByLabel(label) {
  if (!label) {
    return null;
  }

  const normalized =
    String(label)
      .trim()
      .toLowerCase();

  for (
    let i = 0;
    i < MODEL_OPTIONS.length;
    i++
  ) {
    if (
      String(
        MODEL_OPTIONS[i].label
      )
        .trim()
        .toLowerCase() === normalized
    ) {
      return MODEL_OPTIONS[i];
    }
  }

  return null;
}


// ------------------------------------------------------------
// 33.2 — MODEL CONFIGURATION
// ------------------------------------------------------------

function buildV14ModelConfiguration(
  selection
) {
  const model =
    resolveV14ModelSelection(
      selection
    );

  return {
    id:
      model.id || "",

    label:
      model.label || "",

    file:
      model.file || "",

    loras:
      Array.isArray(model.loras)
        ? model.loras.map(
          function (lora) {
            return {
              file:
                lora.file || "",

              weight:
                Number(
                  lora.weight
                )
            };
          }
        )
        : []
  };
}


// ------------------------------------------------------------
// 33.3 — ASPECT CONFIGURATION
// ------------------------------------------------------------

function buildV14AspectConfiguration(
  selection
) {
  const aspect =
    resolveV14AspectSelection(
      selection
    );

  return {
    id:
      aspect.id || "",

    label:
      aspect.label || "",

    width:
      Number(aspect.width),

    height:
      Number(aspect.height),

    ratio:
      aspect.ratio || ""
  };
}


// ------------------------------------------------------------
// 33.4 — DIMENSION LOOKUP
// ------------------------------------------------------------

function getV14AspectDimensions(
  selection
) {
  const aspect =
    resolveV14AspectSelection(
      selection
    );

  if (!aspect) {
    return {
      width: 1024,
      height: 1024
    };
  }

  return {
    width:
      Number(aspect.width),

    height:
      Number(aspect.height)
  };
}


// ------------------------------------------------------------
// 33.5 — QWEN TEMPLATE BUILDER
// ------------------------------------------------------------
//
// Qwen receives explicit instructions not to alter the user's
// selections.
//
// That distinction matters.
//
// The generator determines:
//
//     subject
//     gender
//     age
//     ethnicity
//     body
//     hair
//     clothing
//     action
//     camera
//     lighting
//     style
//
// Qwen may improve language and scene coherence, but it should
// not reinterpret those selections.
// ------------------------------------------------------------

function buildV14QwenRefinementPrompt(
  prompt
) {
  const source =
    normalizeV14PromptText(
      prompt
    );

  if (!source) {
    return "";
  }

  return KREA2_REFINEMENT_TEMPLATE
    .replace(
      "{{PROMPT}}",
      source
    );
}


// ------------------------------------------------------------
// 33.6 — QWEN SETTINGS NORMALIZATION
// ------------------------------------------------------------

function normalizeV14QwenConfig(
  qwen
) {
  const source =
    qwen || {};

  return {
    enabled:
      source.enabled === true,

    prompt:
      typeof source.prompt ===
        "string"
        ? source.prompt.trim()
        : "",

    model:
      source.model ||
      ENHANCER_MODEL
  };
}


// ------------------------------------------------------------
// 33.7 — QWEN REQUEST OBJECT
// ------------------------------------------------------------

function buildV14QwenRequest(
  prompt,
  qwenConfig
) {
  const cfg =
    normalizeV14QwenConfig(
      qwenConfig
    );

  if (!cfg.enabled) {
    return {
      enabled: false,
      model: null,
      prompt: "",
      sourcePrompt: prompt || ""
    };
  }

  const refinementPrompt =
    cfg.prompt ||
    buildV14QwenRefinementPrompt(
      prompt
    );

  return {
    enabled: true,

    model: cfg.model,

    prompt:
      refinementPrompt,

    sourcePrompt:
      prompt || ""
  };
}


// ------------------------------------------------------------
// 33.8 — QWEN OUTPUT NORMALIZATION
// ------------------------------------------------------------

function normalizeV14QwenOutput(
  output,
  fallback
) {
  if (
    typeof output !== "string"
  ) {
    return normalizeV14PromptText(
      fallback
    );
  }

  const cleaned =
    output
      .trim()
      .replace(
        /^```(?:text)?/i,
        ""
      )
      .replace(
        /```$/i,
        ""
      )
      .trim();

  if (!cleaned) {
    return normalizeV14PromptText(
      fallback
    );
  }

  return normalizeV14PromptText(
    cleaned
  );
}


// ------------------------------------------------------------
// 33.9 — QWEN RESULT CONTAINER
// ------------------------------------------------------------

function createV14QwenResult(
  originalPrompt,
  qwenConfig
) {
  const request =
    buildV14QwenRequest(
      originalPrompt,
      qwenConfig
    );

  return {
    enabled:
      request.enabled,

    model:
      request.model,

    sourcePrompt:
      request.sourcePrompt,

    refinementPrompt:
      request.prompt,

    finalPrompt:
      normalizeV14PromptText(
        originalPrompt
      ),

    refined: false
  };
}


// ------------------------------------------------------------
// 33.10 — APPLY QWEN RESULT
// ------------------------------------------------------------
//
// This function accepts the text returned by the enhancer.
//
// It does not attempt to interpret or re-randomize it.
// ------------------------------------------------------------

function applyV14QwenResult(
  result,
  output
) {
  if (!result) {
    return null;
  }

  if (!result.enabled) {
    return result;
  }

  const refined =
    normalizeV14QwenOutput(
      output,
      result.sourcePrompt
    );

  if (!refined) {
    return result;
  }

  result.finalPrompt =
    refined;

  result.refined = true;

  return result;
}


// ------------------------------------------------------------
// 33.11 — QWEN API
// ------------------------------------------------------------

const V14_QWEN_ENGINE = {
  normalizeConfig:
    normalizeV14QwenConfig,

  buildPrompt:
    buildV14QwenRefinementPrompt,

  buildRequest:
    buildV14QwenRequest,

  normalizeOutput:
    normalizeV14QwenOutput,

  createResult:
    createV14QwenResult,

  applyResult:
    applyV14QwenResult
};


// ------------------------------------------------------------
// 33.12 — COMPLETE MODEL/ASPECT CONFIGURATION
// ------------------------------------------------------------

function buildV14GenerationConfiguration(
  input
) {
  const source =
    input || {};

  const model =
    buildV14ModelConfiguration(
      source.model
    );

  const aspect =
    buildV14AspectConfiguration(
      source.aspectRatio
    );

  const qwen =
    normalizeV14QwenConfig(
      source.qwen
    );

  return {
    model: model,

    aspectRatio: aspect,

    dimensions: {
      width: aspect.width,
      height: aspect.height
    },

    qwen: qwen
  };
}


// ------------------------------------------------------------
// 33.13 — GENERATION REQUEST DATA
// ------------------------------------------------------------
//
// This creates a platform-neutral request.
//
// Nothing here assumes a particular Draw Things generation
// API signature yet.
//
// That is intentional.
//
// The next layer is responsible for translating this into the
// actual Draw Things script request.
// ------------------------------------------------------------

function buildV14GenerationRequestData(
  generationResult
) {
  if (!generationResult) {
    return null;
  }

  const input =
    generationResult.input ||
    {};

  const pipelineResult =
    generationResult.result ||
    {};

  const state =
    pipelineResult.state ||
    null;

  const prompt =
    getV14SafePrompt(
      state,
      {
        customPrompt:
          input.customPrompt ||
          ""
      }
    );

  const configuration =
    buildV14GenerationConfiguration(
      input
    );

  const qwen =
    createV14QwenResult(
      prompt,
      configuration.qwen
    );

  return {
    success:
      generationResult.success === true,

    state:
      state,

    prompt:
      prompt,

    model:
      configuration.model,

    aspectRatio:
      configuration.aspectRatio,

    dimensions:
      configuration.dimensions,

    qwen:
      qwen,

    customPrompt:
      input.customPrompt || ""
  };
}


// ------------------------------------------------------------
// 33.14 — REQUEST VALIDATION
// ------------------------------------------------------------

function validateV14GenerationRequest(
  request
) {
  const errors = [];

  if (!request) {
    errors.push(
      "Generation request is missing."
    );

    return {
      valid: false,
      errors: errors
    };
  }

  if (
    !request.prompt ||
    request.prompt.trim() === ""
  ) {
    errors.push(
      "Generation prompt is empty."
    );
  }

  if (
    !request.model ||
    !request.model.file
  ) {
    errors.push(
      "Generation model is missing."
    );
  }

  if (
    !request.dimensions ||
    !request.dimensions.width ||
    !request.dimensions.height
  ) {
    errors.push(
      "Generation dimensions are invalid."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors:
      errors
  };
}


// ------------------------------------------------------------
// 33.15 — SAFE REQUEST BUILDER
// ------------------------------------------------------------

function createV14SafeGenerationRequest(
  generationResult
) {
  const request =
    buildV14GenerationRequestData(
      generationResult
    );

  const validation =
    validateV14GenerationRequest(
      request
    );

  return {
    request:
      request,

    validation:
      validation
  };
}


// ------------------------------------------------------------
// 33.16 — GENERATION CONFIGURATION API
// ------------------------------------------------------------

const V14_GENERATION_CONFIGURATION = {
  findModelById:
    findV14ModelById,

  findModelByLabel:
    findV14ModelByLabel,

  resolveModel:
    resolveV14ModelSelection,

  buildModel:
    buildV14ModelConfiguration,

  resolveAspect:
    resolveV14AspectSelection,

  buildAspect:
    buildV14AspectConfiguration,

  dimensions:
    getV14AspectDimensions,

  build:
    buildV14GenerationConfiguration,

  buildRequest:
    buildV14GenerationRequestData,

  validate:
    validateV14GenerationRequest,

  safe:
    createV14SafeGenerationRequest
};


// ============================================================
// CHUNK 34 — GENERATION SESSION, PREVIEW SAMPLING & HISTORY
// ============================================================
//
// This layer manages repeated generations.
//
// It separates:
//
//     configuration
//     generation state
//     prompt
//     generation history
//     preview samples
//
// A new random generation creates a NEW state.
//
// Reusing the same state does NOT silently re-randomize it.
//
// This makes V14 predictable when the user wants to inspect,
// reuse, or regenerate a specific result.
// ============================================================


// ------------------------------------------------------------
// 34.1 — SESSION STATE
// ------------------------------------------------------------

function createV14GenerationSession() {
  return {
    id:
      "session_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 100000
      ),

    createdAt:
      Date.now(),

    generationCount: 0,

    currentState:
      createGenerationState(),

    currentResult: null,

    history: [],

    previewHistory: [],

    lastPrompt: "",

    lastConfiguration: null
  };
}


// ------------------------------------------------------------
// 34.2 — SESSION SNAPSHOT
// ------------------------------------------------------------

function snapshotV14Session(
  session
) {
  if (!session) {
    return null;
  }

  return {
    id:
      session.id,

    createdAt:
      session.createdAt,

    generationCount:
      session.generationCount,

    currentState:
      cloneGenerationState(
        session.currentState
      ),

    currentResult:
      session.currentResult,

    history:
      session.history.slice(),

    previewHistory:
      session.previewHistory.slice(),

    lastPrompt:
      session.lastPrompt,

    lastConfiguration:
      session.lastConfiguration
  };
}


// ------------------------------------------------------------
// 34.3 — GENERATION RECORD
// ------------------------------------------------------------

function createV14GenerationRecord(
  request,
  result
) {
  return {
    id:
      "generation_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 100000
      ),

    timestamp:
      Date.now(),

    prompt:
      request
        ? request.prompt || ""
        : "",

    finalPrompt:
      request &&
        request.qwen
        ? request.qwen.finalPrompt ||
        request.prompt ||
        ""
        : request
          ? request.prompt || ""
          : "",

    model:
      request &&
        request.model
        ? request.model.id || ""
        : "",

    aspectRatio:
      request &&
        request.aspectRatio
        ? request.aspectRatio.id || ""
        : "",

    width:
      request &&
        request.dimensions
        ? request.dimensions.width
        : 0,

    height:
      request &&
        request.dimensions
        ? request.dimensions.height
        : 0,

    qwenRefined:
      Boolean(
        request &&
        request.qwen &&
        request.qwen.refined
      ),

    state:
      result &&
        result.state
        ? cloneGenerationState(
          result.state
        )
        : null
  };
}


// ------------------------------------------------------------
// 34.4 — ADD HISTORY RECORD
// ------------------------------------------------------------

function addV14HistoryRecord(
  session,
  record
) {
  if (!session || !record) {
    return;
  }

  session.history.push(
    record
  );

  session.generationCount =
    session.history.length;

  session.currentResult =
    record;

  session.lastPrompt =
    record.finalPrompt ||
    record.prompt ||
    "";
}


// ------------------------------------------------------------
// 34.5 — HISTORY LIMIT
// ------------------------------------------------------------

function trimV14History(
  session,
  maximum
) {
  if (
    !session ||
    !Number.isFinite(maximum)
  ) {
    return;
  }

  const limit =
    Math.max(
      1,
      Math.floor(maximum)
    );

  if (
    session.history.length <=
    limit
  ) {
    return;
  }

  session.history =
    session.history.slice(
      session.history.length -
      limit
    );
}


// ------------------------------------------------------------
// 34.6 — PREVIEW SAMPLE CONFIGURATION
// ------------------------------------------------------------

function normalizeV14PreviewConfig(
  config
) {
  const source =
    config || {};

  const sampleSize =
    Number(
      source.sampleSize ||
      PREVIEW_SAMPLE_SIZE
    );

  return {
    sampleSize:
      Math.max(
        1,
        Math.floor(
          Number.isFinite(
            sampleSize
          )
            ? sampleSize
            : PREVIEW_SAMPLE_SIZE
        )
      ),

    randomizeEachSample:
      source.randomizeEachSample !==
      false,

    preserveManualSelections:
      source.preserveManualSelections !==
      false
  };
}


// ------------------------------------------------------------
// 34.7 — PREVIEW SAMPLE
// ------------------------------------------------------------
//
// A preview sample is a complete candidate generation.
//
// Each sample gets its own state.
//
// Manual selections are copied into every sample.
//
// Random selections are independently generated.
// ------------------------------------------------------------

function createV14PreviewSample(
  input,
  previewConfig
) {
  const cfg =
    normalizeV14PreviewConfig(
      previewConfig
    );

  const manualState =
    cfg.preserveManualSelections
      ? cloneV14ManualSelectionState(
        input.manualState
      )
      : createV14ManualSelectionState();

  const generationConfig =
    Object.assign(
      {},
      input.config || {}
    );

  if (
    !cfg.randomizeEachSample
  ) {
    generationConfig.randomizeIdentity =
      false;

    generationConfig.randomizeBody =
      false;

    generationConfig.randomizeAppearance =
      false;

    generationConfig.randomizeHair =
      false;

    generationConfig.randomizeAccessories =
      false;

    generationConfig.randomizeClothing =
      false;

    generationConfig.randomizeAction =
      false;

    generationConfig.randomizeCamera =
      false;

    generationConfig.randomizeLighting =
      false;

    generationConfig.randomizeTimeOfDay =
      false;

    generationConfig.randomizeArtStyle =
      false;
  }

  const pipeline =
    runV14GenerationPipeline(
      generationConfig,
      manualState
    );

  const result =
  {
    state:
      pipeline.state,

    repaired:
      pipeline.repaired,

    conflicts:
      pipeline.conflicts,

    prompt:
      getV14SafePrompt(
        pipeline.state,
        {
          customPrompt:
            input.customPrompt ||
            ""
        }
      )
  };

  return result;
}


// ------------------------------------------------------------
// 34.8 — BUILD PREVIEW SAMPLE SET
// ------------------------------------------------------------

function buildV14PreviewSamples(
  input,
  previewConfig
) {
  const cfg =
    normalizeV14PreviewConfig(
      previewConfig
    );

  const samples = [];

  for (
    let i = 0;
    i < cfg.sampleSize;
    i++
  ) {
    samples.push(
      createV14PreviewSample(
        input,
        cfg
      )
    );
  }

  return samples;
}


// ------------------------------------------------------------
// 34.9 — PREVIEW SUMMARY
// ------------------------------------------------------------

function getV14PreviewSummary(
  samples
) {
  if (
    !Array.isArray(samples)
  ) {
    return [];
  }

  return samples.map(
    function (sample, index) {
      return {
        index:
          index + 1,

        prompt:
          sample.prompt || "",

        state:
          sample.state
            ? cloneGenerationState(
              sample.state
            )
            : null,

        repaired:
          sample.repaired || [],

        conflicts:
          sample.conflicts || []
      };
    }
  );
}


// ------------------------------------------------------------
// 34.10 — PREVIEW HISTORY
// ------------------------------------------------------------

function saveV14PreviewSet(
  session,
  samples
) {
  if (!session) {
    return;
  }

  session.previewHistory.push({
    timestamp:
      Date.now(),

    samples:
      samples.map(
        function (sample) {
          return {
            prompt:
              sample.prompt,

            state:
              sample.state
                ? cloneGenerationState(
                  sample.state
                )
                : null,

            repaired:
              sample.repaired ||
              [],

            conflicts:
              sample.conflicts ||
              []
          };
        }
      )
  });
}


// ------------------------------------------------------------
// 34.11 — RESTORE A PREVIEW SAMPLE
// ------------------------------------------------------------

function restoreV14PreviewSample(
  session,
  samples,
  index
) {
  if (
    !session ||
    !Array.isArray(samples)
  ) {
    return null;
  }

  const sample =
    samples[index];

  if (!sample) {
    return null;
  }

  session.currentState =
    sample.state
      ? cloneGenerationState(
        sample.state
      )
      : createGenerationState();

  session.lastPrompt =
    sample.prompt || "";

  return session.currentState;
}


// ------------------------------------------------------------
// 34.12 — REGENERATE FROM EXISTING STATE
// ------------------------------------------------------------
//
// This is deliberately different from random generation.
//
// The existing state remains intact.
//
// The prompt is rebuilt from that exact state.
// ------------------------------------------------------------

function regenerateV14CurrentState(
  session,
  input
) {
  if (!session) {
    return null;
  }

  const state =
    session.currentState ||
    createGenerationState();

  const prompt =
    getV14SafePrompt(
      state,
      {
        customPrompt:
          input &&
            input.customPrompt
            ? input.customPrompt
            : ""
      }
    );

  const request =
  {
    prompt:
      prompt,

    model:
      input
        ? input.model
        : null,

    aspectRatio:
      input
        ? input.aspectRatio
        : null,

    dimensions:
      input &&
        input.aspectRatio
        ? {
          width:
            input.aspectRatio.width,

          height:
            input.aspectRatio.height
        }
        : getV14AspectDimensions(
          null
        ),

    qwen:
      input
        ? normalizeV14QwenConfig(
          input.qwen
        )
        : {
          enabled: false
        }
  };

  return request;
}


// ------------------------------------------------------------
// 34.13 — NEW RANDOM GENERATION
// ------------------------------------------------------------

function generateV14SessionResult(
  session,
  input
) {
  if (!session || !input) {
    return null;
  }

  const pipeline =
    runV14GenerationPipeline(
      input.config,
      input.manualState
    );

  const result = {
    state:
      pipeline.state,

    repaired:
      pipeline.repaired,

    conflicts:
      pipeline.conflicts
  };

  session.currentState =
    cloneGenerationState(
      pipeline.state
    );

  const prompt =
    getV14SafePrompt(
      pipeline.state,
      {
        customPrompt:
          input.customPrompt ||
          ""
      }
    );

  const request = {
    prompt:
      prompt,

    model:
      input.model,

    aspectRatio:
      input.aspectRatio,

    dimensions:
      input.aspectRatio
        ? {
          width:
            input.aspectRatio.width,

          height:
            input.aspectRatio.height
        }
        : getV14AspectDimensions(
          null
        ),

    qwen:
      normalizeV14QwenConfig(
        input.qwen
      )
  };

  const record =
    createV14GenerationRecord(
      request,
      result
    );

  addV14HistoryRecord(
    session,
    record
  );

  session.lastConfiguration =
    buildV14GenerationConfiguration(
      input
    );

  return {
    request:
      request,

    result:
      result,

    record:
      record
  };
}


// ------------------------------------------------------------
// 34.14 — SESSION RESET
// ------------------------------------------------------------

function resetV14Session(
  session
) {
  if (!session) {
    return createV14GenerationSession();
  }

  session.generationCount = 0;

  session.currentState =
    createGenerationState();

  session.currentResult =
    null;

  session.history = [];

  session.previewHistory = [];

  session.lastPrompt = "";

  session.lastConfiguration =
    null;

  return session;
}


// ------------------------------------------------------------
// 34.15 — SESSION REPORT
// ------------------------------------------------------------

function getV14SessionReport(
  session
) {
  if (!session) {
    return null;
  }

  return {
    id:
      session.id,

    createdAt:
      session.createdAt,

    generationCount:
      session.generationCount,

    historyCount:
      session.history.length,

    previewSetCount:
      session.previewHistory.length,

    lastPrompt:
      session.lastPrompt,

    currentState:
      cloneGenerationState(
        session.currentState
      ),

    lastConfiguration:
      session.lastConfiguration
  };
}


// ------------------------------------------------------------
// 34.16 — PUBLIC SESSION API
// ------------------------------------------------------------

const V14_SESSION_ENGINE = {
  create:
    createV14GenerationSession,

  snapshot:
    snapshotV14Session,

  createRecord:
    createV14GenerationRecord,

  addHistory:
    addV14HistoryRecord,

  trimHistory:
    trimV14History,

  normalizePreviewConfig:
    normalizeV14PreviewConfig,

  createPreviewSample:
    createV14PreviewSample,

  buildPreviewSamples:
    buildV14PreviewSamples,

  previewSummary:
    getV14PreviewSummary,

  savePreviewSet:
    saveV14PreviewSet,

  restorePreviewSample:
    restoreV14PreviewSample,

  regenerateCurrent:
    regenerateV14CurrentState,

  generate:
    generateV14SessionResult,

  reset:
    resetV14Session,

  report:
    getV14SessionReport
};


// ============================================================
// CHUNK 35 — DRAW THINGS GENERATION BRIDGE + BATCH EXECUTION
// ============================================================
//
// This layer is the boundary between the V14 generator and
// Draw Things.
//
// Everything above this point works with platform-neutral
// configuration/state objects.
//
// Everything below this point is responsible for:
//
//     • translating V14 settings into Draw Things settings
//     • generating one image
//     • generating a batch
//     • keeping generation state separate between images
//     • preserving the selected model / LoRA / dimensions
//
// IMPORTANT:
//
// The generator does NOT use array positions to decide what a
// preset means. Stable IDs are resolved before this layer.
//
// ============================================================


// ------------------------------------------------------------
// 35.1 — DRAW THINGS MODEL LOOKUP
// ------------------------------------------------------------

function getV14DrawThingsModel(
  modelId
) {
  const model =
    findV14ModelById(
      modelId
    );

  if (!model) {
    return null;
  }

  return {
    id:
      model.id,

    label:
      model.label,

    checkpoint:
      model.checkpoint,

    loras:
      Array.isArray(model.loras)
        ? model.loras.map(
          function (lora) {
            return {
              filename:
                lora.filename,

              weight:
                lora.weight
            };
          }
        )
        : []
  };
}


// ------------------------------------------------------------
// 35.2 — DRAW THINGS ASPECT
// ------------------------------------------------------------

function getV14DrawThingsAspect(
  aspectId
) {
  const aspect =
    ASPECT_OPTIONS.find(
      function (option) {
        return (
          option.id ===
          aspectId
        );
      }
    );

  if (!aspect) {
    return ASPECT_OPTIONS[0];
  }

  return {
    id:
      aspect.id,

    label:
      aspect.label,

    width:
      aspect.width,

    height:
      aspect.height
  };
}


// ------------------------------------------------------------
// 35.3 — DRAW THINGS GENERATION OPTIONS
// ------------------------------------------------------------
//
// These are kept in one object so the actual Draw Things call
// is isolated from the V14 generator.
//
// If Draw Things changes its generation API later, this is the
// layer that should need modification.
// ------------------------------------------------------------

function createV14DrawThingsGenerationOptions(
  request
) {
  if (!request) {
    return null;
  }

  const model =
    getV14DrawThingsModel(
      request.model
        ? request.model.id
        : ""
    );

  const aspect =
    getV14DrawThingsAspect(
      request.aspectRatio
        ? request.aspectRatio.id
        : ""
    );

  return {
    prompt:
      request.prompt || "",

    negativePrompt:
      request.negativePrompt || "",

    width:
      aspect.width,

    height:
      aspect.height,

    model:
      model,

    aspectRatio:
      aspect,

    qwen:
      request.qwen
        ? Object.assign(
          {},
          request.qwen
        )
        : {
          enabled: false
        }
  };
}


// ------------------------------------------------------------
// 35.4 — VALIDATE DRAW THINGS OPTIONS
// ------------------------------------------------------------

function validateV14DrawThingsOptions(
  options
) {
  const errors = [];

  if (!options) {
    errors.push(
      "No generation options were supplied."
    );

    return errors;
  }

  if (
    !options.prompt ||
    !String(
      options.prompt
    ).trim()
  ) {
    errors.push(
      "Generation prompt is empty."
    );
  }

  if (
    !Number.isFinite(
      options.width
    ) ||
    options.width <= 0
  ) {
    errors.push(
      "Invalid generation width."
    );
  }

  if (
    !Number.isFinite(
      options.height
    ) ||
    options.height <= 0
  ) {
    errors.push(
      "Invalid generation height."
    );
  }

  if (!options.model) {
    errors.push(
      "No model configuration was resolved."
    );
  }

  return errors;
}


// ------------------------------------------------------------
// 35.5 — DRAW THINGS REQUEST DATA
// ------------------------------------------------------------
//
// This is the exact object passed to the generation adapter.
//
// The adapter itself is kept separate so V14 does not become
// dependent on one particular Draw Things API call.
// ------------------------------------------------------------

function createV14DrawThingsRequest(
  request
) {
  const options =
    createV14DrawThingsGenerationOptions(
      request
    );

  const errors =
    validateV14DrawThingsOptions(
      options
    );

  return {
    valid:
      errors.length === 0,

    errors:
      errors,

    options:
      options
  };
}


// ------------------------------------------------------------
// 35.6 — GENERATION ADAPTER
// ------------------------------------------------------------
//
// Draw Things exposes its generation functions to scripts.
// This function intentionally checks for the available
// function before invoking it.
//
// No fake fallback generation is performed.
//
// If the current Draw Things version does not expose the
// expected generation function, the error is returned instead
// of silently pretending that an image was generated.
// ------------------------------------------------------------

function executeV14DrawThingsGeneration(
  drawThingsRequest,
  callback
) {
  if (
    !drawThingsRequest ||
    !drawThingsRequest.valid
  ) {
    const error =
      new Error(
        "Invalid Draw Things generation request."
      );

    if (callback) {
      callback(
        null,
        error
      );
    }

    return null;
  }

  const options =
    drawThingsRequest.options;

  //
  // The actual Draw Things generation bridge is installed
  // by the final script bootstrap.
  //
  // This prevents the generator from confusing a
  // platform-neutral request with an API-specific call.
  //

  if (
    typeof V14_DRAW_THINGS_GENERATE !==
    "function"
  ) {
    const error =
      new Error(
        "Draw Things generation bridge has not been initialized."
      );

    if (callback) {
      callback(
        null,
        error
      );
    }

    return null;
  }

  return V14_DRAW_THINGS_GENERATE(
    options,
    callback
  );
}


// ------------------------------------------------------------
// 35.7 — SINGLE GENERATION
// ------------------------------------------------------------

function generateV14One(
  input,
  session,
  callback
) {
  if (!input) {
    const error =
      new Error(
        "No V14 generation input."
      );

    if (callback) {
      callback(
        null,
        error
      );
    }

    return null;
  }

  const generation =
    generateV14SessionResult(
      session,
      input
    );

  if (!generation) {
    const error =
      new Error(
        "V14 generation pipeline returned no result."
      );

    if (callback) {
      callback(
        null,
        error
      );
    }

    return null;
  }

  const drawThingsRequest =
    createV14DrawThingsRequest(
      generation.request
    );

  if (
    !drawThingsRequest.valid
  ) {
    const error =
      new Error(
        drawThingsRequest.errors.join(
          " "
        )
      );

    if (callback) {
      callback(
        null,
        error
      );
    }

    return null;
  }

  return executeV14DrawThingsGeneration(
    drawThingsRequest,
    function (result, error) {
      if (callback) {
        callback(
          {
            generation:
              generation,

            drawThingsRequest:
              drawThingsRequest,

            drawThingsResult:
              result
          },
          error
        );
      }
    }
  );
}


// ------------------------------------------------------------
// 35.8 — BATCH CONFIGURATION
// ------------------------------------------------------------

function normalizeV14BatchConfig(
  config
) {
  const source =
    config || {};

  const count =
    Number(
      source.count || 1
    );

  return {
    count:
      Math.max(
        1,
        Math.floor(
          Number.isFinite(count)
            ? count
            : 1
        )
      ),

    generateEachIndependently:
      source.generateEachIndependently !==
      false,

    preserveManualSelections:
      source.preserveManualSelections !==
      false,

    stopOnError:
      source.stopOnError !==
      false,

    historyLimit:
      Number.isFinite(
        source.historyLimit
      )
        ? Math.max(
          1,
          Math.floor(
            source.historyLimit
          )
        )
        : 100
  };
}


// ------------------------------------------------------------
// 35.9 — CREATE BATCH INPUT
// ------------------------------------------------------------
//
// Every batch item gets its own generation state.
//
// Manual selections are shared intentionally.
//
// Automatic selections are NOT shared unless the caller
// explicitly requests that behavior.
// ------------------------------------------------------------

function createV14BatchInput(
  input,
  batchConfig
) {
  const cfg =
    normalizeV14BatchConfig(
      batchConfig
    );

  const inputs = [];

  for (
    let i = 0;
    i < cfg.count;
    i++
  ) {
    const item =
      Object.assign(
        {},
        input
      );

    item.manualState =
      cfg.preserveManualSelections
        ? cloneV14ManualSelectionState(
          input.manualState
        )
        : createV14ManualSelectionState();

    item.config =
      Object.assign(
        {},
        input.config || {}
      );

    if (
      cfg.generateEachIndependently
    ) {
      item.config =
        normalizeV14GenerationConfig(
          item.config
        );
    }

    inputs.push(
      item
    );
  }

  return inputs;
}


// ------------------------------------------------------------
// 35.10 — BATCH RESULT
// ------------------------------------------------------------

function createV14BatchResult(
  total
) {
  return {
    total:
      total,

    completed:
      0,

    failed:
      0,

    results:
      [],

    errors:
      []
  };
}


// ------------------------------------------------------------
// 35.11 — RUN BATCH
// ------------------------------------------------------------
//
// Draw Things generation is asynchronous, so the batch advances
// one image at a time.
//
// This prevents V14 from accidentally launching every image at
// once and losing track of which state belongs to which image.
// ------------------------------------------------------------

function runV14Batch(
  input,
  batchConfig,
  session,
  callback
) {
  const cfg =
    normalizeV14BatchConfig(
      batchConfig
    );

  const batchInputs =
    createV14BatchInput(
      input,
      cfg
    );

  const batchResult =
    createV14BatchResult(
      batchInputs.length
    );

  let currentIndex = 0;

  function finish() {
    if (callback) {
      callback(
        batchResult
      );
    }
  }

  function runNext() {
    if (
      currentIndex >=
      batchInputs.length
    ) {
      finish();
      return;
    }

    const index =
      currentIndex;

    currentIndex += 1;

    generateV14One(
      batchInputs[index],
      session,
      function (result, error) {
        if (error) {
          batchResult.failed += 1;

          batchResult.errors.push({
            index:
              index,

            error:
              String(
                error.message ||
                error
              )
          });

          if (
            cfg.stopOnError
          ) {
            finish();
            return;
          }

          runNext();
          return;
        }

        batchResult.completed += 1;

        batchResult.results.push({
          index:
            index,

          result:
            result
        });

        trimV14History(
          session,
          cfg.historyLimit
        );

        runNext();
      }
    );
  }

  runNext();

  return batchResult;
}


// ------------------------------------------------------------
// 35.12 — BATCH PREVIEW WITHOUT GENERATION
// ------------------------------------------------------------
//
// This lets the UI inspect the candidates before committing
// to actual image generation.
// ------------------------------------------------------------

function previewV14Batch(
  input,
  batchConfig,
  session
) {
  const cfg =
    normalizeV14BatchConfig(
      batchConfig
    );

  const previewConfig = {
    sampleSize:
      cfg.count,

    randomizeEachSample:
      cfg.generateEachIndependently,

    preserveManualSelections:
      cfg.preserveManualSelections
  };

  const samples =
    buildV14PreviewSamples(
      input,
      previewConfig
    );

  if (session) {
    saveV14PreviewSet(
      session,
      samples
    );
  }

  return {
    count:
      samples.length,

    samples:
      samples,

    summary:
      getV14PreviewSummary(
        samples
      )
  };
}


// ------------------------------------------------------------
// 35.13 — BATCH REPORT
// ------------------------------------------------------------

function getV14BatchReport(
  batchResult
) {
  if (!batchResult) {
    return null;
  }

  return {
    total:
      batchResult.total,

    completed:
      batchResult.completed,

    failed:
      batchResult.failed,

    success:
      batchResult.failed === 0,

    errors:
      batchResult.errors.slice()
  };
}


// ------------------------------------------------------------
// 35.14 — PUBLIC GENERATION BRIDGE
// ------------------------------------------------------------

const V14_DRAW_THINGS_ENGINE = {
  getModel:
    getV14DrawThingsModel,

  getAspect:
    getV14DrawThingsAspect,

  createOptions:
    createV14DrawThingsGenerationOptions,

  validate:
    validateV14DrawThingsOptions,

  createRequest:
    createV14DrawThingsRequest,

  execute:
    executeV14DrawThingsGeneration,

  generateOne:
    generateV14One,

  normalizeBatchConfig:
    normalizeV14BatchConfig,

  createBatchInput:
    createV14BatchInput,

  runBatch:
    runV14Batch,

  previewBatch:
    previewV14Batch,

  batchReport:
    getV14BatchReport
};


// ============================================================
// CHUNK 36 — DRAW THINGS UI → V14 CONFIGURATION
// ============================================================
//
// This layer connects the V14 configuration system to the
// Draw Things requestFromUser() interface.
//
// The important architectural rule:
//
//     UI POSITION ≠ PRESET ID
//
// Menu positions are used ONLY while reading the dialog.
// Immediately afterward, selections are converted to stable
// V14 IDs.
//
// Therefore adding/reordering a preset does not silently
// change what another part of the generator means.
// ============================================================


// ------------------------------------------------------------
// 36.1 — UI OPTION HELPERS
// ------------------------------------------------------------

function v14UIOptionLabels(
  presets
) {
  if (
    !Array.isArray(presets)
  ) {
    return [];
  }

  return presets.map(
    function (preset) {
      return getPresetLabel(
        preset
      );
    }
  );
}


function v14UIOptionValues(
  presets
) {
  if (
    !Array.isArray(presets)
  ) {
    return [];
  }

  return presets.map(
    function (preset) {
      return getPresetValue(
        preset
      );
    }
  );
}


function v14UICheckedValues(
  presets,
  values
) {
  const selected =
    Array.isArray(values)
      ? values
      : [];

  return presets.map(
    function (preset) {
      const value =
        getPresetValue(
          preset
        );

      return selected.indexOf(
        value
      ) !== -1;
    }
  );
}


// ------------------------------------------------------------
// 36.2 — GENERIC UI VALUE
// ------------------------------------------------------------

function v14UISelectedMenuValue(
  presets,
  index
) {
  if (
    !Array.isArray(presets) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= presets.length
  ) {
    return "";
  }

  return getPresetValue(
    presets[index]
  );
}


function v14UISelectedMenuPreset(
  presets,
  index
) {
  if (
    !Array.isArray(presets) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= presets.length
  ) {
    return null;
  }

  return presets[index];
}


// ------------------------------------------------------------
// 36.3 — MODEL MENU
// ------------------------------------------------------------

function v14UIModelLabels() {
  return MODEL_OPTIONS.map(
    function (model) {
      return model.label;
    }
  );
}


function v14UIModelFromIndex(
  index
) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= MODEL_OPTIONS.length
  ) {
    return MODEL_OPTIONS[0];
  }

  return MODEL_OPTIONS[index];
}


// ------------------------------------------------------------
// 36.4 — ASPECT MENU
// ------------------------------------------------------------

function v14UIAspectLabels() {
  return ASPECT_OPTIONS.map(
    function (aspect) {
      return aspect.label;
    }
  );
}


function v14UIAspectFromIndex(
  index
) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= ASPECT_OPTIONS.length
  ) {
    return ASPECT_OPTIONS[0];
  }

  return ASPECT_OPTIONS[index];
}


// ------------------------------------------------------------
// 36.5 — RANDOMIZATION MENU
// ------------------------------------------------------------

const V14_RANDOMIZATION_UI_OPTIONS = [
  {
    id:
      "compatible",

    label:
      "Compatible Random"
  },

  {
    id:
      "free",

    label:
      "Free Random"
  }
];


function v14UIRandomizationLabels() {
  return V14_RANDOMIZATION_UI_OPTIONS.map(
    function (option) {
      return option.label;
    }
  );
}


function v14UIRandomizationFromIndex(
  index
) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >=
    V14_RANDOMIZATION_UI_OPTIONS.length
  ) {
    return V14_RANDOMIZATION_UI_OPTIONS[0];
  }

  return V14_RANDOMIZATION_UI_OPTIONS[index];
}


// ------------------------------------------------------------
// 36.6 — SECTION SWITCH DEFINITIONS
// ------------------------------------------------------------
//
// Each switch corresponds to a generation category.
//
// These IDs are stable and are also used by the configuration
// parser.
// ------------------------------------------------------------

const V14_UI_RANDOMIZE_SWITCHES = [
  {
    id:
      "identity",

    label:
      "Randomize Identity"
  },

  {
    id:
      "body",

    label:
      "Randomize Body"
  },

  {
    id:
      "appearance",

    label:
      "Randomize Appearance"
  },

  {
    id:
      "hair",

    label:
      "Randomize Hair"
  },

  {
    id:
      "accessories",

    label:
      "Randomize Accessories"
  },

  {
    id:
      "clothing",

    label:
      "Randomize Clothing"
  },

  {
    id:
      "action",

    label:
      "Randomize Action"
  },

  {
    id:
      "camera",

    label:
      "Randomize Camera"
  },

  {
    id:
      "lighting",

    label:
      "Randomize Lighting"
  },

  {
    id:
      "timeOfDay",

    label:
      "Randomize Time of Day"
  },

  {
    id:
      "artStyle",

    label:
      "Randomize Art Style"
  }
];


// ------------------------------------------------------------
// 36.7 — BUILD RANDOMIZATION UI
// ------------------------------------------------------------

function requestV14RandomizationSection(
  ui
) {
  return {
    randomizationMode:
      ui.menu(
        "Randomization Mode",
        v14UIRandomizationLabels(),
        0
      ),

    identity:
      ui.switch(
        "Randomize Identity",
        true
      ),

    body:
      ui.switch(
        "Randomize Body",
        true
      ),

    appearance:
      ui.switch(
        "Randomize Appearance",
        true
      ),

    hair:
      ui.switch(
        "Randomize Hair",
        true
      ),

    accessories:
      ui.switch(
        "Randomize Accessories",
        true
      ),

    clothing:
      ui.switch(
        "Randomize Clothing",
        true
      ),

    action:
      ui.switch(
        "Randomize Action",
        true
      ),

    camera:
      ui.switch(
        "Randomize Camera",
        true
      ),

    lighting:
      ui.switch(
        "Randomize Lighting",
        true
      ),

    timeOfDay:
      ui.switch(
        "Randomize Time of Day",
        true
      ),

    artStyle:
      ui.switch(
        "Randomize Art Style",
        true
      )
  };
}


// ------------------------------------------------------------
// 36.8 — IDENTITY UI
// ------------------------------------------------------------

function requestV14IdentitySection(
  ui
) {
  return {
    gender:
      ui.menu(
        "Gender",
        v14UIOptionLabels(
          genderPresets
        ),
        0
      ),

    nationality:
      ui.menu(
        "Nationality / Profile",
        v14UIOptionLabels(
          nationalityPresets
        ),
        0
      ),

    age:
      ui.menu(
        "Age",
        v14UIOptionLabels(
          agePresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.9 — BODY UI
// ------------------------------------------------------------

function requestV14BodySection(
  ui
) {
  return {
    skin:
      ui.menu(
        "Skin Tone",
        v14UIOptionLabels(
          skinTonePresets
        ),
        0
      ),

    eyes:
      ui.menu(
        "Eye Color",
        v14UIOptionLabels(
          eyeColorPresets
        ),
        0
      ),

    overallBuild:
      ui.menu(
        "Overall Build",
        v14UIOptionLabels(
          overallBuildPresets
        ),
        0
      ),

    height:
      ui.menu(
        "Height",
        v14UIOptionLabels(
          heightPresets
        ),
        0
      ),

    chest:
      ui.menu(
        "Chest",
        v14UIOptionLabels(
          chestPresets
        ),
        0
      ),

    hips:
      ui.menu(
        "Hips",
        v14UIOptionLabels(
          hipsPresets
        ),
        0
      ),

    lips:
      ui.menu(
        "Lips",
        v14UIOptionLabels(
          lipsPresets
        ),
        0
      ),

    eyelashes:
      ui.menu(
        "Eyelashes",
        v14UIOptionLabels(
          eyelashesPresets
        ),
        0
      ),

    bodyShape:
      ui.menu(
        "Body Shape",
        v14UIOptionLabels(
          bodyShapePresets
        ),
        0
      ),

    legs:
      ui.menu(
        "Legs",
        v14UIOptionLabels(
          legsPresets
        ),
        0
      ),

    buttocks:
      ui.menu(
        "Buttocks",
        v14UIOptionLabels(
          buttocksPresets
        ),
        0
      ),

    belly:
      ui.menu(
        "Belly",
        v14UIOptionLabels(
          bellyPresets
        ),
        0
      ),

    specificBody:
      ui.menu(
        "Specific Body",
        v14UIOptionLabels(
          specificBodyPresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.10 — APPEARANCE UI
// ------------------------------------------------------------

function requestV14AppearanceSection(
  ui
) {
  return {
    makeup:
      ui.menu(
        "Makeup",
        v14UIOptionLabels(
          makeupPresets
        ),
        0
      ),

    makeupOddities:
      ui.menu(
        "Makeup / Face Effects",
        v14UIOptionLabels(
          makeupOdditiesPresets
        ),
        0
      ),

    facialHair:
      ui.menu(
        "Facial Hair",
        v14UIOptionLabels(
          facialHairPresets
        ),
        0
      ),

    tattoos:
      ui.menu(
        "Tattoos",
        v14UIOptionLabels(
          tattooPresets
        ),
        0
      ),

    bodyDetails:
      ui.menu(
        "Body Details",
        v14UIOptionLabels(
          bodyDetailPresets
        ),
        0
      ),

    nails:
      ui.menu(
        "Nails",
        v14UIOptionLabels(
          nailPresets
        ),
        0
      ),

    hairDetails:
      ui.menu(
        "Hair Details",
        v14UIOptionLabels(
          hairDetailPresets
        ),
        0
      ),

    nose:
      ui.menu(
        "Nose",
        v14UIOptionLabels(
          nosePresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.11 — HAIR UI
// ------------------------------------------------------------

function requestV14HairSection(
  ui
) {
  return {
    hairColor:
      ui.menu(
        "Hair Color",
        v14UIOptionLabels(
          hairColorPresets
        ),
        0
      ),

    hairLength:
      ui.menu(
        "Hair Length",
        v14UIOptionLabels(
          hairLengthPresets
        ),
        0
      ),

    hairType:
      ui.menu(
        "Hair Type",
        v14UIOptionLabels(
          hairTypePresets
        ),
        0
      ),

    hairstyle:
      ui.menu(
        "Hairstyle",
        v14UIOptionLabels(
          hairstylePresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.12 — ACCESSORIES UI
// ------------------------------------------------------------

function requestV14AccessoriesSection(
  ui
) {
  return {
    accessories:
      ui.segmented(
        "Accessory Groups",
        [
          "None",
          "Jewelry",
          "Eyewear",
          "Piercings",
          "Headwear",
          "Hair Accessories"
        ],
        0
      )
  };
}


// ------------------------------------------------------------
// 36.13 — CLOTHING UI
// ------------------------------------------------------------

function requestV14ClothingSection(
  ui
) {
  return {
    clothingColor:
      ui.menu(
        "Clothing Color",
        v14UIOptionLabels(
          clothingColorPresets
        ),
        0
      ),

    clothingGroup:
      ui.menu(
        "Clothing Group",
        [
          "Random",
          "Tops",
          "Bottoms",
          "Dresses",
          "Lingerie",
          "Swimwear",
          "Robes / Loungewear",
          "Sets",
          "Uniforms",
          "Costume Oddities",
          "Period Fashion",
          "Footwear"
        ],
        0
      )
  };
}


// ------------------------------------------------------------
// 36.14 — ACTION UI
// ------------------------------------------------------------

function requestV14ActionSection(
  ui
) {
  return {
    action:
      ui.menu(
        "Action",
        [
          "Random"
        ].concat(
          v14UIOptionLabels(
            allActionPresets
          )
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.15 — CAMERA UI
// ------------------------------------------------------------

function requestV14CameraSection(
  ui
) {
  return {
    camera:
      ui.menu(
        "Camera",
        v14UIOptionLabels(
          cameraPresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.16 — LIGHTING UI
// ------------------------------------------------------------

function requestV14LightingSection(
  ui
) {
  return {
    lighting:
      ui.menu(
        "Lighting",
        v14UIOptionLabels(
          lightingPresets
        ),
        0
      ),

    timeOfDay:
      ui.menu(
        "Time of Day",
        v14UIOptionLabels(
          timeOfDayPresets
        ),
        0
      ),

    artStyle:
      ui.menu(
        "Art Style",
        v14UIOptionLabels(
          artStylePresets
        ),
        0
      )
  };
}


// ------------------------------------------------------------
// 36.17 — GENERATION UI
// ------------------------------------------------------------

function requestV14GenerationUI(
  ui
) {
  const result = {};

  result.model =
    ui.menu(
      "Model",
      v14UIModelLabels(),
      0
    );

  result.aspectRatio =
    ui.menu(
      "Aspect Ratio",
      v14UIAspectLabels(),
      0
    );

  result.batchCount =
    ui.slider(
      "Batch Count",
      1,
      32,
      1,
      1
    );

  result.preview =
    ui.switch(
      "Preview Before Generation",
      false
    );

  result.randomization =
    requestV14RandomizationSection(
      ui
    );

  result.identity =
    requestV14IdentitySection(
      ui
    );

  result.body =
    requestV14BodySection(
      ui
    );

  result.appearance =
    requestV14AppearanceSection(
      ui
    );

  result.hair =
    requestV14HairSection(
      ui
    );

  result.accessories =
    requestV14AccessoriesSection(
      ui
    );

  result.clothing =
    requestV14ClothingSection(
      ui
    );

  result.action =
    requestV14ActionSection(
      ui
    );

  result.camera =
    requestV14CameraSection(
      ui
    );

  result.lighting =
    requestV14LightingSection(
      ui
    );

  result.customPrompt =
    ui.textField(
      "Additional Prompt",
      ""
    );

  result.qwen =
    ui.switch(
      "Use Qwen Refinement",
      false
    );

  return result;
}


// ------------------------------------------------------------
// 36.18 — READ RANDOMIZATION SETTINGS
// ------------------------------------------------------------

function parseV14RandomizationUI(
  uiState
) {
  const randomization =
    uiState.randomization ||
    {};

  const mode =
    v14UIRandomizationFromIndex(
      Number(
        randomization.randomizationMode
      )
    );

  return {
    randomizationMode:
      mode.id,

    randomizeIdentity:
      Boolean(
        randomization.identity
      ),

    randomizeBody:
      Boolean(
        randomization.body
      ),

    randomizeAppearance:
      Boolean(
        randomization.appearance
      ),

    randomizeHair:
      Boolean(
        randomization.hair
      ),

    randomizeAccessories:
      Boolean(
        randomization.accessories
      ),

    randomizeClothing:
      Boolean(
        randomization.clothing
      ),

    randomizeAction:
      Boolean(
        randomization.action
      ),

    randomizeCamera:
      Boolean(
        randomization.camera
      ),

    randomizeLighting:
      Boolean(
        randomization.lighting
      ),

    randomizeTimeOfDay:
      Boolean(
        randomization.timeOfDay
      ),

    randomizeArtStyle:
      Boolean(
        randomization.artStyle
      )
  };
}


// ------------------------------------------------------------
// 36.19 — READ UI MENU SELECTION
// ------------------------------------------------------------

function parseV14MenuPreset(
  presets,
  index
) {
  return v14UISelectedMenuPreset(
    presets,
    Number(index)
  );
}


// ------------------------------------------------------------
// 36.20 — BUILD MANUAL STATE FROM UI
// ------------------------------------------------------------
//
// The UI is interpreted once.
//
// From this point forward the generator works with stable
// preset IDs rather than menu positions.
// ------------------------------------------------------------

function buildV14ManualStateFromUI(
  uiState
) {
  const manualState =
    createV14ManualSelectionState();

  const identity =
    uiState.identity || {};

  const body =
    uiState.body || {};

  const appearance =
    uiState.appearance || {};

  const hair =
    uiState.hair || {};

  const clothing =
    uiState.clothing || {};

  const action =
    uiState.action || {};

  const camera =
    uiState.camera || {};

  const lighting =
    uiState.lighting || {};

  setV14ManualSelection(
    manualState,
    "gender",
    parseV14MenuPreset(
      genderPresets,
      Number(identity.gender)
    )
  );

  setV14ManualSelection(
    manualState,
    "nationality",
    parseV14MenuPreset(
      nationalityPresets,
      Number(identity.nationality)
    )
  );

  setV14ManualSelection(
    manualState,
    "age",
    parseV14MenuPreset(
      agePresets,
      Number(identity.age)
    )
  );

  setV14ManualSelection(
    manualState,
    "skin",
    parseV14MenuPreset(
      skinTonePresets,
      Number(body.skin)
    )
  );

  setV14ManualSelection(
    manualState,
    "eyes",
    parseV14MenuPreset(
      eyeColorPresets,
      Number(body.eyes)
    )
  );

  setV14ManualSelection(
    manualState,
    "overallBuild",
    parseV14MenuPreset(
      overallBuildPresets,
      Number(body.overallBuild)
    )
  );

  setV14ManualSelection(
    manualState,
    "height",
    parseV14MenuPreset(
      heightPresets,
      Number(body.height)
    )
  );

  setV14ManualSelection(
    manualState,
    "chest",
    parseV14MenuPreset(
      chestPresets,
      Number(body.chest)
    )
  );

  setV14ManualSelection(
    manualState,
    "hips",
    parseV14MenuPreset(
      hipsPresets,
      Number(body.hips)
    )
  );

  setV14ManualSelection(
    manualState,
    "lips",
    parseV14MenuPreset(
      lipsPresets,
      Number(body.lips)
    )
  );

  setV14ManualSelection(
    manualState,
    "eyelashes",
    parseV14MenuPreset(
      eyelashesPresets,
      Number(body.eyelashes)
    )
  );

  setV14ManualSelection(
    manualState,
    "bodyShape",
    parseV14MenuPreset(
      bodyShapePresets,
      Number(body.bodyShape)
    )
  );

  setV14ManualSelection(
    manualState,
    "legs",
    parseV14MenuPreset(
      legsPresets,
      Number(body.legs)
    )
  );

  setV14ManualSelection(
    manualState,
    "buttocks",
    parseV14MenuPreset(
      buttocksPresets,
      Number(body.buttocks)
    )
  );

  setV14ManualSelection(
    manualState,
    "belly",
    parseV14MenuPreset(
      bellyPresets,
      Number(body.belly)
    )
  );

  setV14ManualSelection(
    manualState,
    "specificBody",
    parseV14MenuPreset(
      specificBodyPresets,
      Number(body.specificBody)
    )
  );

  setV14ManualSelection(
    manualState,
    "makeup",
    parseV14MenuPreset(
      makeupPresets,
      Number(appearance.makeup)
    )
  );

  setV14ManualSelection(
    manualState,
    "makeupOddities",
    parseV14MenuPreset(
      makeupOdditiesPresets,
      Number(
        appearance.makeupOddities
      )
    )
  );

  setV14ManualSelection(
    manualState,
    "facialHair",
    parseV14MenuPreset(
      facialHairPresets,
      Number(appearance.facialHair)
    )
  );

  setV14ManualSelection(
    manualState,
    "tattoos",
    parseV14MenuPreset(
      tattooPresets,
      Number(appearance.tattoos)
    )
  );

  setV14ManualSelection(
    manualState,
    "bodyDetails",
    parseV14MenuPreset(
      bodyDetailPresets,
      Number(
        appearance.bodyDetails
      )
    )
  );

  setV14ManualSelection(
    manualState,
    "nails",
    parseV14MenuPreset(
      nailPresets,
      Number(appearance.nails)
    )
  );

  setV14ManualSelection(
    manualState,
    "hairDetails",
    parseV14MenuPreset(
      hairDetailPresets,
      Number(
        appearance.hairDetails
      )
    )
  );

  setV14ManualSelection(
    manualState,
    "nose",
    parseV14MenuPreset(
      nosePresets,
      Number(appearance.nose)
    )
  );

  setV14ManualSelection(
    manualState,
    "hairColor",
    parseV14MenuPreset(
      hairColorPresets,
      Number(hair.hairColor)
    )
  );

  setV14ManualSelection(
    manualState,
    "hairLength",
    parseV14MenuPreset(
      hairLengthPresets,
      Number(hair.hairLength)
    )
  );

  setV14ManualSelection(
    manualState,
    "hairType",
    parseV14MenuPreset(
      hairTypePresets,
      Number(hair.hairType)
    )
  );

  setV14ManualSelection(
    manualState,
    "hairstyles",
    parseV14MenuPreset(
      hairstylePresets,
      Number(hair.hairstyle)
    )
  );

  setV14ManualSelection(
    manualState,
    "clothing",
    parseV14MenuPreset(
      clothingPresets,
      Number(clothing.clothing)
    )
  );

  setV14ManualSelection(
    manualState,
    "action",
    parseV14MenuPreset(
      allActionPresets,
      Math.max(
        0,
        Number(action.action) - 1
      )
    )
  );

  setV14ManualSelection(
    manualState,
    "camera",
    parseV14MenuPreset(
      cameraPresets,
      Number(camera.camera)
    )
  );

  setV14ManualSelection(
    manualState,
    "lighting",
    parseV14MenuPreset(
      lightingPresets,
      Number(lighting.lighting)
    )
  );

  setV14ManualSelection(
    manualState,
    "timeOfDay",
    parseV14MenuPreset(
      timeOfDayPresets,
      Number(lighting.timeOfDay)
    )
  );

  setV14ManualSelection(
    manualState,
    "artStyle",
    parseV14MenuPreset(
      artStylePresets,
      Number(lighting.artStyle)
    )
  );

  return manualState;
}


// ------------------------------------------------------------
// 36.21 — BUILD COMPLETE V14 INPUT
// ------------------------------------------------------------

function buildV14InputFromUI(
  uiState
) {
  const model =
    v14UIModelFromIndex(
      Number(
        uiState.model
      )
    );

  const aspect =
    v14UIAspectFromIndex(
      Number(
        uiState.aspectRatio
      )
    );

  const randomization =
    parseV14RandomizationUI(
      uiState
    );

  const manualState =
    buildV14ManualStateFromUI(
      uiState
    );

  const config =
    normalizeV14GenerationConfig(
      Object.assign(
        {},
        randomization,
        {
          preserveManualSelections:
            true,

          repairInvalidSelections:
            true,

          useProfileInfluence:
            true,

          useRelationshipEngine:
            true
        }
      )
    );

  const batchCount =
    Math.max(
      1,
      Math.floor(
        Number(
          uiState.batchCount
        ) || 1
      )
    );

  const input =
    createV14GenerationInput(
      config,
      manualState
    );

  input.model =
    model;

  input.aspectRatio =
    aspect;

  input.customPrompt =
    uiState.customPrompt ||
    "";

  input.qwen = {
    enabled:
      Boolean(
        uiState.qwen
      )
  };

  input.batchCount =
    batchCount;

  input.preview =
    Boolean(
      uiState.preview
    );

  return input;
}


// ------------------------------------------------------------
// 36.22 — DRAW THINGS UI REQUEST
// ------------------------------------------------------------
//
// requestFromUser() is intentionally isolated here.
//
// The callback receives the completed UI state and converts it
// immediately into the V14 internal representation.
// ------------------------------------------------------------

function requestV14Configuration(
  callback
) {
  if (
    typeof requestFromUser !==
    "function"
  ) {
    if (callback) {
      callback(
        null,
        new Error(
          "Draw Things requestFromUser() is unavailable."
        )
      );
    }

    return;
  }

  requestFromUser(
    "KREA 2 MODULAR BATCH GENERATOR V14",
    "Generate",
    function (ui) {
      try {
        const input =
          buildV14InputFromUI(
            ui
          );

        if (callback) {
          callback(
            input,
            null
          );
        }
      } catch (error) {
        if (callback) {
          callback(
            null,
            error
          );
        }
      }
    }
  );
}


// ------------------------------------------------------------
// 36.23 — PUBLIC UI ENGINE
// ------------------------------------------------------------

const V14_UI_ENGINE = {
  optionLabels:
    v14UIOptionLabels,

  optionValues:
    v14UIOptionValues,

  selectedValue:
    v14UISelectedMenuValue,

  selectedPreset:
    v14UISelectedMenuPreset,

  modelLabels:
    v14UIModelLabels,

  aspectLabels:
    v14UIAspectLabels,

  randomizationLabels:
    v14UIRandomizationLabels,

  randomizationFromIndex:
    v14UIRandomizationFromIndex,

  requestRandomization:
    requestV14RandomizationSection,

  requestIdentity:
    requestV14IdentitySection,

  requestBody:
    requestV14BodySection,

  requestAppearance:
    requestV14AppearanceSection,

  requestHair:
    requestV14HairSection,

  requestAccessories:
    requestV14AccessoriesSection,

  requestClothing:
    requestV14ClothingSection,

  requestAction:
    requestV14ActionSection,

  requestCamera:
    requestV14CameraSection,

  requestLighting:
    requestV14LightingSection,

  request:
    requestV14GenerationUI,

  parseRandomization:
    parseV14RandomizationUI,

  buildManualState:
    buildV14ManualStateFromUI,

  buildInput:
    buildV14InputFromUI,

  requestConfiguration:
    requestV14Configuration
};


// ============================================================
// CHUNK 37 — V14 FINAL BOOTSTRAP + ENTRY POINT
// ============================================================
//
// This is the orchestration layer.
//
// It does NOT contain the randomization logic.
// It does NOT contain the preset definitions.
// It does NOT contain the relationship rules.
//
// Its job is simply:
//
//     1. Build the UI
//     2. Read the user's choices
//     3. Create a V14 session
//     4. Optionally preview candidates
//     5. Generate the requested batch
//     6. Report errors/results
//
// ============================================================


// ------------------------------------------------------------
// 37.1 — GLOBAL V14 SESSION
// ------------------------------------------------------------

let V14_SESSION =
  null;


function getV14Session() {
  if (!V14_SESSION) {
    V14_SESSION =
      createV14GenerationSession();
  }

  return V14_SESSION;
}


// ------------------------------------------------------------
// 37.2 — RESET SESSION
// ------------------------------------------------------------

function resetV14GlobalSession() {
  V14_SESSION =
    resetV14Session(
      getV14Session()
    );

  return V14_SESSION;
}


// ------------------------------------------------------------
// 37.3 — PREVIEW DISPLAY DATA
// ------------------------------------------------------------
//
// Draw Things' UI can be used to inspect generated text before
// committing to the image generation step.
//
// This function intentionally returns plain text rather than
// assuming a particular presentation widget.
// ------------------------------------------------------------

function formatV14PreviewText(
  preview
) {
  if (
    !preview ||
    !Array.isArray(
      preview.summary
    )
  ) {
    return "No preview samples were generated.";
  }

  const lines = [];

  lines.push(
    "KREA 2 V14 PREVIEW"
  );

  lines.push(
    "=================="
  );

  lines.push(
    "Samples: " +
    preview.summary.length
  );

  lines.push("");

  preview.summary.forEach(
    function (sample) {
      lines.push(
        "SAMPLE " +
        sample.index
      );

      lines.push(
        sample.prompt ||
        "(empty prompt)"
      );

      if (
        sample.repaired &&
        sample.repaired.length
      ) {
        lines.push(
          "Repairs: " +
          sample.repaired.length
        );
      }

      if (
        sample.conflicts &&
        sample.conflicts.length
      ) {
        lines.push(
          "Conflicts: " +
          sample.conflicts.length
        );
      }

      lines.push("");
    }
  );

  return lines.join(
    "\n"
  );
}


// ------------------------------------------------------------
// 37.4 — PREVIEW CONFIRMATION
// ------------------------------------------------------------
//
// If Draw Things provides requestFromUser(), use another small
// dialog to let the user choose whether to continue.
//
// The generation itself is never performed by the preview.
// ------------------------------------------------------------

function requestV14PreviewConfirmation(
  preview,
  callback
) {
  if (
    typeof requestFromUser !==
    "function"
  ) {
    if (callback) {
      callback(
        true
      );
    }

    return;
  }

  requestFromUser(
    "V14 Preview\n\n" +
    formatV14PreviewText(
      preview
    ),
    "Generate",
    function () {
      if (callback) {
        callback(
          true
        );
      }
    }
  );
}


// ------------------------------------------------------------
// 37.5 — GENERATION REPORT
// ------------------------------------------------------------

function formatV14BatchReportText(
  report
) {
  if (!report) {
    return (
      "No generation report."
    );
  }

  const lines = [];

  lines.push(
    "KREA 2 V14 GENERATION COMPLETE"
  );

  lines.push(
    "================================"
  );

  lines.push(
    "Requested: " +
    report.total
  );

  lines.push(
    "Completed: " +
    report.completed
  );

  lines.push(
    "Failed: " +
    report.failed
  );

  if (
    report.errors &&
    report.errors.length
  ) {
    lines.push("");

    lines.push(
      "ERRORS"
    );

    report.errors.forEach(
      function (error) {
        lines.push(
          "Image " +
          (
            error.index + 1
          ) +
          ": " +
          error.error
        );
      }
    );
  }

  return lines.join(
    "\n"
  );
}


// ------------------------------------------------------------
// 37.6 — ERROR REPORT
// ------------------------------------------------------------

function formatV14Error(
  error
) {
  if (!error) {
    return (
      "Unknown V14 error."
    );
  }

  if (
    error.message
  ) {
    return String(
      error.message
    );
  }

  return String(
    error
  );
}


// ------------------------------------------------------------
// 37.7 — RUN PREVIEW
// ------------------------------------------------------------

function runV14Preview(
  input,
  session,
  callback
) {
  const preview =
    V14_DRAW_THINGS_ENGINE.previewBatch(
      input,
      {
        count:
          input.batchCount ||
          PREVIEW_SAMPLE_SIZE,

        generateEachIndependently:
          true,

        preserveManualSelections:
          true
      },
      session
    );

  requestV14PreviewConfirmation(
    preview,
    function (confirmed) {
      if (callback) {
        callback(
          confirmed,
          preview
        );
      }
    }
  );
}


// ------------------------------------------------------------
// 37.8 — RUN ACTUAL GENERATION
// ------------------------------------------------------------

function runV14Generation(
  input,
  session,
  callback
) {
  const batchConfig = {
    count:
      input.batchCount ||
      1,

    generateEachIndependently:
      true,

    preserveManualSelections:
      true,

    stopOnError:
      false,

    historyLimit:
      100
  };

  V14_DRAW_THINGS_ENGINE.runBatch(
    input,
    batchConfig,
    session,
    function (batchResult) {
      const report =
        V14_DRAW_THINGS_ENGINE.batchReport(
          batchResult
        );

      if (callback) {
        callback(
          report,
          batchResult
        );
      }
    }
  );
}


// ------------------------------------------------------------
// 37.9 — COMPLETE V14 RUN
// ------------------------------------------------------------

function runV14Application(
  input,
  session
) {
  if (!input) {
    return;
  }

  if (
    input.preview
  ) {
    runV14Preview(
      input,
      session,
      function (
        confirmed,
        preview
      ) {
        if (!confirmed) {
          return;
        }

        runV14Generation(
          input,
          session,
          function (
            report
          ) {
            //
            // Generation completed.
            //
            // The report is kept in the session
            // even if no additional UI is displayed.
            //

            session.lastGenerationReport =
              report;
          }
        );
      }
    );

    return;
  }

  runV14Generation(
    input,
    session,
    function (report) {
      session.lastGenerationReport =
        report;
    }
  );
}


// ------------------------------------------------------------
// 37.10 — MAIN V14 ENTRY POINT
// ------------------------------------------------------------

function runKrea2V14() {
  const session =
    getV14Session();

  requestV14Configuration(
    function (
      input,
      error
    ) {
      if (error) {
        session.lastError =
          formatV14Error(
            error
          );

        return;
      }

      if (!input) {
        return;
      }

      runV14Application(
        input,
        session
      );
    }
  );
}


// ------------------------------------------------------------
// 37.11 — PUBLIC APPLICATION API
// ------------------------------------------------------------

const KREA2_V14 = {
  run:
    runKrea2V14,

  session:
    getV14Session,

  reset:
    resetV14GlobalSession,

  preview:
    runV14Preview,

  generate:
    runV14Generation,

  report:
    function () {
      return getV14SessionReport(
        getV14Session()
      );
    }
};


// ============================================================
// CHUNK 38 — ACTUAL DRAW THINGS PIPELINE BRIDGE
// ============================================================
//
// This is the first layer that actually talks to the Draw
// Things generation pipeline.
//
// Draw Things exposes:
//
//     pipeline.configuration
//     pipeline.prompts
//     pipeline.run(options)
//
// The V14 generator deliberately keeps its own architecture
// separate from Draw Things' GenerationConfiguration object.
//
// This layer translates V14 -> Draw Things.
//
// ============================================================


// ------------------------------------------------------------
// 38.1 — DRAW THINGS CONFIGURATION BASE
// ------------------------------------------------------------
//
// Start from the current Draw Things configuration whenever
// possible.
//
// This preserves settings that V14 does not explicitly own,
// such as sampler, steps, guidance scale, seed behavior,
// tiled diffusion, hires fix, etc.
//
// V14 only replaces the settings it is responsible for.
// ------------------------------------------------------------

function getV14CurrentDrawThingsConfiguration() {
  if (
    typeof pipeline ===
    "undefined"
  ) {
    return {};
  }

  if (
    !pipeline.configuration
  ) {
    return {};
  }

  return Object.assign(
    {},
    pipeline.configuration
  );
}


// ------------------------------------------------------------
// 38.2 — COPY LORA CONFIGURATION
// ------------------------------------------------------------

function buildV14DrawThingsLoRAs(
  model
) {
  if (
    !model ||
    !Array.isArray(
      model.loras
    )
  ) {
    return [];
  }

  return model.loras.map(
    function (lora) {
      return {
        filename:
          lora.filename,

        weight:
          Number(
            lora.weight
          )
      };
    }
  );
}


// ------------------------------------------------------------
// 38.3 — APPLY V14 MODEL
// ------------------------------------------------------------
//
// Draw Things' generation configuration contains a model name
// and LoRA configuration.
//
// The V14 model registry remains the source of truth for which
// model and LoRA filenames belong together.
// ------------------------------------------------------------

function applyV14ModelToDrawThingsConfiguration(
  configuration,
  model
) {
  const result =
    Object.assign(
      {},
      configuration || {}
    );

  if (!model) {
    return result;
  }

  if (
    model.checkpoint
  ) {
    result.model =
      model.checkpoint;
  }

  result.loras =
    buildV14DrawThingsLoRAs(
      model
    );

  return result;
}


// ------------------------------------------------------------
// 38.4 — APPLY V14 DIMENSIONS
// ------------------------------------------------------------

function applyV14DimensionsToDrawThingsConfiguration(
  configuration,
  aspect
) {
  const result =
    Object.assign(
      {},
      configuration || {}
    );

  if (!aspect) {
    return result;
  }

  if (
    Number.isFinite(
      aspect.width
    )
  ) {
    result.width =
      aspect.width;
  }

  if (
    Number.isFinite(
      aspect.height
    )
  ) {
    result.height =
      aspect.height;
  }

  return result;
}


// ------------------------------------------------------------
// 38.5 — BUILD COMPLETE DRAW THINGS CONFIGURATION
// ------------------------------------------------------------

function buildV14ActualDrawThingsConfiguration(
  request
) {
  const base =
    getV14CurrentDrawThingsConfiguration();

  const model =
    request &&
      request.model
      ? findV14ModelById(
        request.model.id
      )
      : null;

  const aspect =
    request &&
      request.aspectRatio
      ? getV14DrawThingsAspect(
        request.aspectRatio.id
      )
      : ASPECT_OPTIONS[0];

  let configuration =
    Object.assign(
      {},
      base
    );

  configuration =
    applyV14ModelToDrawThingsConfiguration(
      configuration,
      model
    );

  configuration =
    applyV14DimensionsToDrawThingsConfiguration(
      configuration,
      aspect
    );

  return configuration;
}


// ------------------------------------------------------------
// 38.6 — BUILD ACTUAL PIPELINE ARGUMENT
// ------------------------------------------------------------
//
// Draw Things' scripting API accepts:
//
//     pipeline.run({
//         configuration: ...
//         mask: ...
//     })
//
// V14 currently has no mask requirement, so only configuration
// is supplied here.
// ------------------------------------------------------------

function buildV14ActualPipelineArguments(
  request
) {
  const configuration =
    buildV14ActualDrawThingsConfiguration(
      request
    );

  return {
    configuration:
      configuration
  };
}


// ------------------------------------------------------------
// 38.7 — VALIDATE ACTUAL CONFIGURATION
// ------------------------------------------------------------

function validateV14ActualDrawThingsConfiguration(
  configuration
) {
  const errors = [];

  if (!configuration) {
    errors.push(
      "Draw Things configuration is missing."
    );

    return errors;
  }

  if (
    !configuration.model ||
    !String(
      configuration.model
    ).trim()
  ) {
    errors.push(
      "Draw Things model is missing."
    );
  }

  if (
    !Number.isFinite(
      configuration.width
    ) ||
    configuration.width <= 0
  ) {
    errors.push(
      "Draw Things width is invalid."
    );
  }

  if (
    !Number.isFinite(
      configuration.height
    ) ||
    configuration.height <= 0
  ) {
    errors.push(
      "Draw Things height is invalid."
    );
  }

  return errors;
}


// ------------------------------------------------------------
// 38.8 — ACTUAL PIPELINE EXECUTION
// ------------------------------------------------------------
//
// pipeline.run() is synchronous from the script's perspective.
//
// Draw Things handles the actual image-generation operation.
//
// The returned value is passed back to the V14 session layer.
// ------------------------------------------------------------

function executeV14ActualPipeline(
  request
) {
  if (
    typeof pipeline ===
    "undefined"
  ) {
    throw new Error(
      "Draw Things pipeline is unavailable."
    );
  }

  const argumentsObject =
    buildV14ActualPipelineArguments(
      request
    );

  const errors =
    validateV14ActualDrawThingsConfiguration(
      argumentsObject.configuration
    );

  if (
    errors.length > 0
  ) {
    throw new Error(
      errors.join(
        " "
      )
    );
  }

  return pipeline.run(
    argumentsObject
  );
}


// ------------------------------------------------------------
// 38.9 — ACTUAL V14 GENERATION
// ------------------------------------------------------------
//
// This replaces the placeholder bridge from Chunk 35.
//
// The prompt is supplied separately from the configuration,
// because Draw Things' pipeline API accepts generation options
// containing the configuration and prompt information.
// ------------------------------------------------------------

function generateV14ActualImage(
  generation
) {
  if (
    !generation ||
    !generation.request
  ) {
    throw new Error(
      "V14 generation request is missing."
    );
  }

  const request =
    generation.request;

  const configuration =
    buildV14ActualDrawThingsConfiguration(
      request
    );

  const errors =
    validateV14ActualDrawThingsConfiguration(
      configuration
    );

  if (
    errors.length > 0
  ) {
    throw new Error(
      errors.join(
        " "
      )
    );
  }

  return pipeline.run({
    configuration:
      configuration,

    prompt:
      request.prompt || "",

    negativePrompt:
      request.negativePrompt ||
      ""
  });
}


// ------------------------------------------------------------
// 38.10 — INSTALL ACTUAL BRIDGE
// ------------------------------------------------------------
//
// Chunk 35 intentionally used an adapter function so the
// platform-specific implementation could be installed here.
//
// The rest of V14 can continue calling:
//
//     V14_DRAW_THINGS_GENERATE(...)
//
// without knowing anything about Draw Things internals.
// ------------------------------------------------------------

function installV14ActualDrawThingsBridge() {
  V14_DRAW_THINGS_GENERATE =
    function (
      options,
      callback
    ) {
      try {
        const request = {
          prompt:
            options.prompt,

          negativePrompt:
            options.negativePrompt,

          model:
            options.model,

          aspectRatio:
            options.aspectRatio,

          dimensions: {
            width:
              options.width,

            height:
              options.height
          },

          qwen:
            options.qwen
        };

        const result =
          generateV14ActualImage({
            request:
              request
          });

        if (callback) {
          callback(
            result,
            null
          );
        }

        return result;
      } catch (error) {
        if (callback) {
          callback(
            null,
            error
          );
        }

        return null;
      }
    };
}


// ------------------------------------------------------------
// 38.11 — PIPELINE CONFIGURATION REPORT
// ------------------------------------------------------------

function getV14ActualPipelineReport(
  request
) {
  const configuration =
    buildV14ActualDrawThingsConfiguration(
      request
    );

  return {
    model:
      configuration.model ||
      "",

    width:
      configuration.width ||
      0,

    height:
      configuration.height ||
      0,

    loras:
      Array.isArray(
        configuration.loras
      )
        ? configuration.loras.map(
          function (lora) {
            return {
              filename:
                lora.filename,

              weight:
                lora.weight
            };
          }
        )
        : [],

    steps:
      configuration.steps,

    guidanceScale:
      configuration.guidanceScale,

    sampler:
      configuration.sampler,

    seed:
      configuration.seed
  };
}


// ------------------------------------------------------------
// 38.12 — PUBLIC DRAW THINGS PIPELINE API
// ------------------------------------------------------------

const V14_ACTUAL_PIPELINE = {
  currentConfiguration:
    getV14CurrentDrawThingsConfiguration,

  buildConfiguration:
    buildV14ActualDrawThingsConfiguration,

  buildArguments:
    buildV14ActualPipelineArguments,

  validate:
    validateV14ActualDrawThingsConfiguration,

  execute:
    executeV14ActualPipeline,

  generate:
    generateV14ActualImage,

  install:
    installV14ActualDrawThingsBridge,

  report:
    getV14ActualPipelineReport
};


// ------------------------------------------------------------
// 38.13 — INSTALL BRIDGE
// ------------------------------------------------------------
//
// The bridge is installed after all V14 generation functions
// have been defined.
//
// ------------------------------------------------------------

installV14ActualDrawThingsBridge();


// ============================================================
// CHUNK 39 — PROMPT / QWEN INTEGRATION LAYER
// ============================================================
//
// This layer keeps prompt construction separate from image
// generation.
//
// Pipeline:
//
//     V14 state
//         ↓
//     base prompt
//         ↓
//     optional Qwen refinement
//         ↓
//     final prompt
//         ↓
//     Draw Things pipeline
//
// Qwen is NEVER allowed to alter the underlying generation
// state. It may refine wording, but the selected subject,
// clothing, action, camera, lighting, etc. remain authoritative.
//
// ============================================================


// ------------------------------------------------------------
// 39.1 — PROMPT RESULT
// ------------------------------------------------------------

function createV14PromptResult(
  state,
  customPrompt
) {
  const basePrompt =
    getV14SafePrompt(
      state,
      {
        customPrompt:
          customPrompt || ""
      }
    );

  return {
    basePrompt:
      basePrompt,

    finalPrompt:
      basePrompt,

    refined:
      false,

    refinementError:
      null
  };
}


// ------------------------------------------------------------
// 39.2 — NORMALIZE REFINEMENT TEXT
// ------------------------------------------------------------

function normalizeV14RefinedPrompt(
  text,
  fallback
) {
  if (
    text === undefined ||
    text === null
  ) {
    return (
      fallback || ""
    );
  }

  const normalized =
    String(
      text
    )
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\r/g,
        "\n"
      )
      .trim();

  return normalized ||
    fallback ||
    "";
}


// ------------------------------------------------------------
// 39.3 — VALIDATE REFINED PROMPT
// ------------------------------------------------------------
//
// Qwen must not return an empty prompt.
//
// If it does, V14 falls back to the original prompt.
// ------------------------------------------------------------

function validateV14RefinedPrompt(
  refined,
  original
) {
  const value =
    normalizeV14RefinedPrompt(
      refined,
      ""
    );

  if (!value) {
    return {
      valid:
        false,

      prompt:
        original || "",

      reason:
        "Qwen returned an empty prompt."
    };
  }

  return {
    valid:
      true,

    prompt:
      value,

    reason:
      ""
  };
}


// ------------------------------------------------------------
// 39.4 — QWEN INPUT
// ------------------------------------------------------------

function buildV14QwenInput(
  state,
  customPrompt
) {
  const promptResult =
    createV14PromptResult(
      state,
      customPrompt
    );

  return {
    originalPrompt:
      promptResult.basePrompt,

    instruction:
      buildV14QwenRefinementPrompt(
        promptResult.basePrompt
      )
  };
}


// ------------------------------------------------------------
// 39.5 — QWEN AVAILABILITY
// ------------------------------------------------------------
//
// V14 does not assume that a Qwen execution API exists.
//
// The actual Draw Things environment may expose different
// facilities depending on version.
//
// Therefore this layer detects the adapter rather than
// pretending that an unavailable function exists.
// ------------------------------------------------------------

function isV14QwenAvailable() {
  return (
    typeof V14_QWEN_EXECUTE ===
    "function"
  );
}


// ------------------------------------------------------------
// 39.6 — QWEN REFINEMENT
// ------------------------------------------------------------

function refineV14PromptWithQwen(
  state,
  customPrompt,
  callback
) {
  const input =
    buildV14QwenInput(
      state,
      customPrompt
    );

  if (
    !isV14QwenAvailable()
  ) {
    const result = {
      basePrompt:
        input.originalPrompt,

      finalPrompt:
        input.originalPrompt,

      refined:
        false,

      refinementError:
        "Qwen refinement adapter is unavailable."
    };

    if (callback) {
      callback(
        result
      );
    }

    return result;
  }

  try {
    const qwenResult =
      V14_QWEN_EXECUTE(
        input.instruction
      );

    const validation =
      validateV14RefinedPrompt(
        qwenResult,
        input.originalPrompt
      );

    const result = {
      basePrompt:
        input.originalPrompt,

      finalPrompt:
        validation.prompt,

      refined:
        validation.valid,

      refinementError:
        validation.valid
          ? null
          : validation.reason
    };

    if (callback) {
      callback(
        result
      );
    }

    return result;
  } catch (error) {
    const result = {
      basePrompt:
        input.originalPrompt,

      finalPrompt:
        input.originalPrompt,

      refined:
        false,

      refinementError:
        String(
          error.message ||
          error
        )
    };

    if (callback) {
      callback(
        result
      );
    }

    return result;
  }
}


// ------------------------------------------------------------
// 39.7 — APPLY REFINEMENT TO REQUEST
// ------------------------------------------------------------

function applyV14PromptResultToRequest(
  request,
  promptResult
) {
  const result =
    Object.assign(
      {},
      request || {}
    );

  if (!promptResult) {
    return result;
  }

  result.prompt =
    promptResult.finalPrompt ||
    promptResult.basePrompt ||
    result.prompt ||
    "";

  result.qwen =
    Object.assign(
      {},
      result.qwen || {},
      {
        refined:
          Boolean(
            promptResult.refined
          ),

        finalPrompt:
          result.prompt,

        originalPrompt:
          promptResult.basePrompt ||
          result.prompt,

        error:
          promptResult.refinementError ||
          null
      }
    );

  return result;
}


// ------------------------------------------------------------
// 39.8 — BUILD FINAL REQUEST
// ------------------------------------------------------------
//
// This is the canonical route from V14 state to a generation
// request.
//
// The underlying state is never changed by prompt refinement.
// ------------------------------------------------------------

function buildV14FinalGenerationRequest(
  state,
  input
) {
  const source =
    input || {};

  const basePrompt =
    getV14SafePrompt(
      state,
      {
        customPrompt:
          source.customPrompt ||
          ""
      }
    );

  let request = {
    prompt:
      basePrompt,

    model:
      source.model || null,

    aspectRatio:
      source.aspectRatio || null,

    dimensions:
      source.aspectRatio
        ? {
          width:
            source.aspectRatio.width,

          height:
            source.aspectRatio.height
        }
        : getV14AspectDimensions(
          null
        ),

    qwen: {
      enabled:
        Boolean(
          source.qwen &&
          source.qwen.enabled
        ),

      refined:
        false,

      originalPrompt:
        basePrompt,

      finalPrompt:
        basePrompt,

      error:
        null
    }
  };

  return request;
}


// ------------------------------------------------------------
// 39.9 — OPTIONAL REFINEMENT REQUEST
// ------------------------------------------------------------
//
// If Qwen is enabled, the request is refined.
//
// If it is disabled, the base prompt is returned unchanged.
// ------------------------------------------------------------

function prepareV14FinalGenerationRequest(
  state,
  input
) {
  let request =
    buildV14FinalGenerationRequest(
      state,
      input
    );

  if (
    !request.qwen.enabled
  ) {
    return request;
  }

  const refinement =
    refineV14PromptWithQwen(
      state,
      input.customPrompt || ""
    );

  request =
    applyV14PromptResultToRequest(
      request,
      refinement
    );

  return request;
}


// ------------------------------------------------------------
// 39.10 — QWEN ADAPTER INSTALLATION
// ------------------------------------------------------------
//
// The adapter remains intentionally empty until a verified
// Draw Things Qwen execution API is available.
//
// This is important: V14 must never silently treat a normal
// JavaScript function, a model filename, or an image-generation
// pipeline as though it were a text-generation API.
// ------------------------------------------------------------

let V14_QWEN_EXECUTE =
  null;


function installV14QwenAdapter(
  executeFunction
) {
  if (
    typeof executeFunction !==
    "function"
  ) {
    V14_QWEN_EXECUTE =
      null;

    return false;
  }

  V14_QWEN_EXECUTE =
    executeFunction;

  return true;
}


function removeV14QwenAdapter() {
  V14_QWEN_EXECUTE =
    null;
}


// ------------------------------------------------------------
// 39.11 — FINAL REQUEST FROM STATE
// ------------------------------------------------------------

function createV14FinalRequestFromState(
  state,
  input
) {
  const request =
    prepareV14FinalGenerationRequest(
      state,
      input
    );

  return createV14SafeGenerationRequest(
    Object.assign(
      {},
      request,
      {
        state:
          state
      }
    )
  );
}


// ------------------------------------------------------------
// 39.12 — GENERATION FROM STATE
// ------------------------------------------------------------
//
// This is useful when a preview sample has been selected.
//
// It generates the exact state represented by the preview.
// ------------------------------------------------------------

function generateV14State(
  state,
  input,
  session
) {
  if (!state) {
    throw new Error(
      "Cannot generate an empty V14 state."
    );
  }

  const request =
    createV14FinalRequestFromState(
      state,
      input
    );

  const generation =
  {
    request:
      request,

    result:
    {
      state:
        cloneGenerationState(
          state
        )
    }
  };

  if (session) {
    session.currentState =
      cloneGenerationState(
        state
      );

    session.lastPrompt =
      request.prompt;

    session.lastConfiguration =
      buildV14GenerationConfiguration(
        Object.assign(
          {},
          input || {},
          {
            state:
              state
          }
        )
      );
  }

  return generation;
}


// ------------------------------------------------------------
// 39.13 — PUBLIC PROMPT / QWEN ENGINE
// ------------------------------------------------------------

const V14_PROMPT_QWEN_ENGINE = {
  createPromptResult:
    createV14PromptResult,

  normalizeRefinedPrompt:
    normalizeV14RefinedPrompt,

  validateRefinedPrompt:
    validateV14RefinedPrompt,

  buildQwenInput:
    buildV14QwenInput,

  qwenAvailable:
    isV14QwenAvailable,

  refine:
    refineV14PromptWithQwen,

  apply:
    applyV14PromptResultToRequest,

  buildRequest:
    buildV14FinalGenerationRequest,

  prepareRequest:
    prepareV14FinalGenerationRequest,

  installQwenAdapter:
    installV14QwenAdapter,

  removeQwenAdapter:
    removeV14QwenAdapter,

  createFinalRequest:
    createV14FinalRequestFromState,

  generateState:
    generateV14State
};


// ============================================================
// KREA 2 V14 — CHUNK 40
// VERIFIED DRAW THINGS UI + EXECUTION ENTRY POINT
// ============================================================

// ------------------------------------------------------------
// DRAW THINGS UI HELPERS
// ------------------------------------------------------------

function v14DTMenuIndex(value, options, fallback) {
  const index = options.indexOf(value);
  return index >= 0 ? index : (fallback || 0);
}

function v14DTSelectedMenuValue(result, index, options, fallback) {
  const raw = result[index];

  if (typeof raw === "number" && options[raw] !== undefined) {
    return options[raw];
  }

  if (typeof raw === "string" && options.indexOf(raw) >= 0) {
    return raw;
  }

  return fallback !== undefined ? fallback : options[0];
}

function v14DTSelectedSwitch(result, index, fallback) {
  if (typeof result[index] === "boolean") {
    return result[index];
  }

  return fallback === true;
}

function v14DTSelectedText(result, index, fallback) {
  if (typeof result[index] === "string") {
    return result[index];
  }

  return fallback || "";
}


// ------------------------------------------------------------
// STABLE MENU OPTIONS
// ------------------------------------------------------------

function getV14IdentityMenuOptions() {
  return [
    "Random",
    "Woman",
    "Man"
  ];
}

function getV14NationalityMenuOptions() {
  return [
    "Random"
  ].concat(
    nationalityPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14AgeMenuOptions() {
  return [
    "Random"
  ].concat(
    agePresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14SkinMenuOptions() {
  return [
    "Random"
  ].concat(
    skinTonePresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14EyeMenuOptions() {
  return [
    "Random"
  ].concat(
    eyeColorPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14BodyBuildMenuOptions() {
  return [
    "Random"
  ].concat(
    overallBuildPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14HeightMenuOptions() {
  return [
    "Random"
  ].concat(
    heightPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14BodyShapeMenuOptions() {
  return [
    "Random"
  ].concat(
    bodyShapePresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14ClothingMenuOptions() {
  return [
    "Random"
  ].concat(
    clothingPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14ActionMenuOptions() {
  return [
    "Random"
  ].concat(
    allActionPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14CameraMenuOptions() {
  return [
    "Random"
  ].concat(
    cameraPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14LightingMenuOptions() {
  return [
    "Random"
  ].concat(
    lightingPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14TimeMenuOptions() {
  return [
    "Random"
  ].concat(
    timeOfDayPresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}

function getV14ArtStyleMenuOptions() {
  return [
    "Random"
  ].concat(
    artStylePresets.map(function (preset) {
      return getPresetLabel(preset);
    })
  );
}


// ------------------------------------------------------------
// ACTUAL DRAW THINGS CONFIGURATION DIALOG
// ------------------------------------------------------------

function requestV14Configuration() {

  const modelOptions = MODEL_OPTIONS.map(function (model) {
    return model.label;
  });

  const aspectOptions = ASPECT_OPTIONS.map(function (aspect) {
    return aspect.label;
  });

  const randomizationOptions = [
    "Compatible",
    "Free"
  ];

  const identityOptions = getV14IdentityMenuOptions();
  const nationalityOptions = getV14NationalityMenuOptions();
  const ageOptions = getV14AgeMenuOptions();
  const skinOptions = getV14SkinMenuOptions();
  const eyeOptions = getV14EyeMenuOptions();
  const buildOptions = getV14BodyBuildMenuOptions();
  const heightOptions = getV14HeightMenuOptions();
  const bodyShapeOptions = getV14BodyShapeMenuOptions();
  const clothingOptions = getV14ClothingMenuOptions();
  const actionOptions = getV14ActionMenuOptions();
  const cameraOptions = getV14CameraMenuOptions();
  const lightingOptions = getV14LightingMenuOptions();
  const timeOptions = getV14TimeMenuOptions();
  const styleOptions = getV14ArtStyleMenuOptions();

  const result = requestFromUser(
    "KREA 2 MODULAR BATCH GENERATOR V14",
    "Generate",
    function () {

      return [

        // ------------------------------------------------
        // 0-3 — GENERATION
        // ------------------------------------------------

        this.section(
          "Generation",
          "Model, aspect ratio and randomization behavior.",
          [
            this.menu(1, modelOptions),
            this.menu(0, aspectOptions),
            this.menu(0, randomizationOptions),
            this.slider(
              1,
              this.slider.scale,
              1,
              32,
              "Batch count"
            )
          ]
        ),

        // ------------------------------------------------
        // 4-6 — RANDOMIZATION SWITCHES
        // ------------------------------------------------

        this.section(
          "Randomization",
          "Turn categories on or off. Manual selections remain deliberate.",
          [
            this.switch(true, "Randomize identity"),
            this.switch(true, "Randomize body"),
            this.switch(true, "Randomize appearance"),
            this.switch(true, "Randomize hair"),
            this.switch(true, "Randomize accessories"),
            this.switch(true, "Randomize clothing"),
            this.switch(true, "Randomize action"),
            this.switch(true, "Randomize camera"),
            this.switch(true, "Randomize lighting"),
            this.switch(true, "Randomize time of day"),
            this.switch(true, "Randomize art style")
          ]
        ),

        // ------------------------------------------------
        // 7-13 — IDENTITY
        // ------------------------------------------------

        this.section(
          "Identity",
          "Choose an identity manually or leave it random.",
          [
            this.menu(0, identityOptions),
            this.menu(0, nationalityOptions),
            this.menu(0, ageOptions),
            this.menu(0, skinOptions),
            this.menu(0, eyeOptions),
            this.menu(0, buildOptions),
            this.menu(0, heightOptions)
          ]
        ),

        // ------------------------------------------------
        // 14 — BODY SHAPE
        // ------------------------------------------------

        this.section(
          "Body",
          "The relationship engine uses gender and profile context when randomizing body traits.",
          [
            this.menu(0, bodyShapeOptions)
          ]
        ),

        // ------------------------------------------------
        // 15 — CLOTHING
        // ------------------------------------------------

        this.section(
          "Clothing",
          "Manual clothing is preserved. Random clothing is selected through compatibility rules.",
          [
            this.menu(0, clothingOptions)
          ]
        ),

        // ------------------------------------------------
        // 16 — ACTION
        // ------------------------------------------------

        this.section(
          "Action",
          "Actions are selected with clothing, camera and scene context.",
          [
            this.menu(0, actionOptions)
          ]
        ),

        // ------------------------------------------------
        // 17-20 — CAMERA / LIGHT / TIME / STYLE
        // ------------------------------------------------

        this.section(
          "Scene",
          "Camera, lighting, time of day and style are context-aware.",
          [
            this.menu(0, cameraOptions),
            this.menu(0, lightingOptions),
            this.menu(0, timeOptions),
            this.menu(0, styleOptions)
          ]
        ),

        // ------------------------------------------------
        // 21-23 — QWEN / CUSTOM
        // ------------------------------------------------

        this.section(
          "Prompt Refinement",
          "Optional Qwen refinement. The refinement layer is instructed not to change selected subject traits or scene decisions.",
          [
            this.switch(false, "Use Qwen refinement"),
            this.textField(
              "",
              "Optional custom prompt additions",
              true,
              80
            ),
            this.textField(
              "",
              "Optional negative prompt",
              true,
              60
            )
          ]
        )
      ];
    }
  );

  return result;
}


// ------------------------------------------------------------
// PARSE THE ACTUAL DRAW THINGS RESULT
// ------------------------------------------------------------

function parseV14DrawThingsConfiguration(result) {

  const modelOptions = MODEL_OPTIONS.map(function (model) {
    return model.label;
  });

  const aspectOptions = ASPECT_OPTIONS.map(function (aspect) {
    return aspect.label;
  });

  const randomizationOptions = [
    "Compatible",
    "Free"
  ];

  const identityOptions = getV14IdentityMenuOptions();
  const nationalityOptions = getV14NationalityMenuOptions();
  const ageOptions = getV14AgeMenuOptions();
  const skinOptions = getV14SkinMenuOptions();
  const eyeOptions = getV14EyeMenuOptions();
  const buildOptions = getV14BodyBuildMenuOptions();
  const heightOptions = getV14HeightMenuOptions();
  const bodyShapeOptions = getV14BodyShapeMenuOptions();
  const clothingOptions = getV14ClothingMenuOptions();
  const actionOptions = getV14ActionMenuOptions();
  const cameraOptions = getV14CameraMenuOptions();
  const lightingOptions = getV14LightingMenuOptions();
  const timeOptions = getV14TimeMenuOptions();
  const styleOptions = getV14ArtStyleMenuOptions();

  // Generation
  const modelLabel = v14DTSelectedMenuValue(
    result,
    0,
    modelOptions,
    modelOptions[0]
  );

  const aspectLabel = v14DTSelectedMenuValue(
    result,
    1,
    aspectOptions,
    aspectOptions[0]
  );

  const randomizationLabel = v14DTSelectedMenuValue(
    result,
    2,
    randomizationOptions,
    "Compatible"
  );

  const batchCount = Math.max(
    1,
    Math.round(Number(result[3]) || 1)
  );

  // Randomization switches
  const randomizeIdentity = v14DTSelectedSwitch(result, 4, true);
  const randomizeBody = v14DTSelectedSwitch(result, 5, true);
  const randomizeAppearance = v14DTSelectedSwitch(result, 6, true);
  const randomizeHair = v14DTSelectedSwitch(result, 7, true);
  const randomizeAccessories = v14DTSelectedSwitch(result, 8, true);
  const randomizeClothing = v14DTSelectedSwitch(result, 9, true);
  const randomizeAction = v14DTSelectedSwitch(result, 10, true);
  const randomizeCamera = v14DTSelectedSwitch(result, 11, true);
  const randomizeLighting = v14DTSelectedSwitch(result, 12, true);
  const randomizeTime = v14DTSelectedSwitch(result, 13, true);
  const randomizeArtStyle = v14DTSelectedSwitch(result, 14, true);

  // Identity
  const identityLabel = v14DTSelectedMenuValue(
    result,
    15,
    identityOptions,
    "Random"
  );

  const nationalityLabel = v14DTSelectedMenuValue(
    result,
    16,
    nationalityOptions,
    "Random"
  );

  const ageLabel = v14DTSelectedMenuValue(
    result,
    17,
    ageOptions,
    "Random"
  );

  const skinLabel = v14DTSelectedMenuValue(
    result,
    18,
    skinOptions,
    "Random"
  );

  const eyeLabel = v14DTSelectedMenuValue(
    result,
    19,
    eyeOptions,
    "Random"
  );

  const buildLabel = v14DTSelectedMenuValue(
    result,
    20,
    buildOptions,
    "Random"
  );

  const heightLabel = v14DTSelectedMenuValue(
    result,
    21,
    heightOptions,
    "Random"
  );

  // Body
  const bodyShapeLabel = v14DTSelectedMenuValue(
    result,
    22,
    bodyShapeOptions,
    "Random"
  );

  // Clothing
  const clothingLabel = v14DTSelectedMenuValue(
    result,
    23,
    clothingOptions,
    "Random"
  );

  // Action
  const actionLabel = v14DTSelectedMenuValue(
    result,
    24,
    actionOptions,
    "Random"
  );

  // Scene
  const cameraLabel = v14DTSelectedMenuValue(
    result,
    25,
    cameraOptions,
    "Random"
  );

  const lightingLabel = v14DTSelectedMenuValue(
    result,
    26,
    lightingOptions,
    "Random"
  );

  const timeLabel = v14DTSelectedMenuValue(
    result,
    27,
    timeOptions,
    "Random"
  );

  const styleLabel = v14DTSelectedMenuValue(
    result,
    28,
    styleOptions,
    "Random"
  );

  // Qwen/custom
  const useQwen = v14DTSelectedSwitch(result, 29, false);

  const customPrompt = v14DTSelectedText(
    result,
    30,
    ""
  );

  const negativePrompt = v14DTSelectedText(
    result,
    31,
    ""
  );

  return {
    modelLabel: modelLabel,
    aspectLabel: aspectLabel,
    randomizationLabel: randomizationLabel,
    batchCount: batchCount,

    randomizeIdentity: randomizeIdentity,
    randomizeBody: randomizeBody,
    randomizeAppearance: randomizeAppearance,
    randomizeHair: randomizeHair,
    randomizeAccessories: randomizeAccessories,
    randomizeClothing: randomizeClothing,
    randomizeAction: randomizeAction,
    randomizeCamera: randomizeCamera,
    randomizeLighting: randomizeLighting,
    randomizeTime: randomizeTime,
    randomizeArtStyle: randomizeArtStyle,

    identityLabel: identityLabel,
    nationalityLabel: nationalityLabel,
    ageLabel: ageLabel,
    skinLabel: skinLabel,
    eyeLabel: eyeLabel,
    buildLabel: buildLabel,
    heightLabel: heightLabel,
    bodyShapeLabel: bodyShapeLabel,

    clothingLabel: clothingLabel,
    actionLabel: actionLabel,

    cameraLabel: cameraLabel,
    lightingLabel: lightingLabel,
    timeLabel: timeLabel,
    styleLabel: styleLabel,

    useQwen: useQwen,
    customPrompt: customPrompt,
    negativePrompt: negativePrompt
  };
}


// ------------------------------------------------------------
// CONVERT UI RESULT TO MANUAL SELECTIONS
// ------------------------------------------------------------

function v14ManualSelectionFromLabel(category, label) {

  if (!label || label === "Random") {
    return null;
  }

  const preset = resolveV14Preset(
    category,
    label
  );

  if (!preset) {
    return null;
  }

  return preset;
}

function buildV14ManualStateFromDrawThingsUI(parsed) {

  const manualState = createV14ManualSelectionState();

  const mappings = [
    ["gender", parsed.identityLabel],
    ["nationality", parsed.nationalityLabel],
    ["age", parsed.ageLabel],
    ["skin", parsed.skinLabel],
    ["eyes", parsed.eyeLabel],
    ["overallBuild", parsed.buildLabel],
    ["height", parsed.heightLabel],
    ["bodyShape", parsed.bodyShapeLabel],
    ["clothing", parsed.clothingLabel],
    ["action", parsed.actionLabel],
    ["camera", parsed.cameraLabel],
    ["lighting", parsed.lightingLabel],
    ["timeOfDay", parsed.timeLabel],
    ["artStyle", parsed.styleLabel]
  ];

  mappings.forEach(function (mapping) {

    const category = mapping[0];
    const label = mapping[1];

    const preset = v14ManualSelectionFromLabel(
      category,
      label
    );

    if (preset) {
      setV14ManualSelection(
        manualState,
        category,
        preset
      );
    }
  });

  return manualState;
}


// ------------------------------------------------------------
// CONFIGURATION FROM DRAW THINGS UI
// ------------------------------------------------------------

function buildV14GenerationConfigFromDrawThingsUI(parsed) {

  const config = normalizeV14GenerationConfig({
    randomizationMode:
      parsed.randomizationLabel === "Free"
        ? RANDOMIZATION_MODES.free
        : RANDOMIZATION_MODES.compatible,

    randomizeIdentity: parsed.randomizeIdentity,
    randomizeBody: parsed.randomizeBody,
    randomizeAppearance: parsed.randomizeAppearance,
    randomizeHair: parsed.randomizeHair,
    randomizeAccessories: parsed.randomizeAccessories,
    randomizeClothing: parsed.randomizeClothing,
    randomizeAction: parsed.randomizeAction,
    randomizeCamera: parsed.randomizeCamera,
    randomizeLighting: parsed.randomizeLighting,
    randomizeTime: parsed.randomizeTime,
    randomizeArtStyle: parsed.randomizeArtStyle,

    useProfileInfluence: true,
    useRelationshipEngine: true,
    preserveManualSelections: true,
    repairInvalidSelections: true,

    preferredMultiplier: 4,
    discouragedMultiplier: 0.2,

    previewSampleSize: PREVIEW_SAMPLE_SIZE
  });

  return config;
}


// ------------------------------------------------------------
// COMPLETE INPUT BUILDER
// ------------------------------------------------------------

function buildV14GenerationInputFromDrawThingsUI(parsed) {

  const manualState =
    buildV14ManualStateFromDrawThingsUI(parsed);

  const config =
    buildV14GenerationConfigFromDrawThingsUI(parsed);

  const input = createV14GenerationInput({
    manualState: manualState,
    config: config,

    modelLabel: parsed.modelLabel,
    aspectLabel: parsed.aspectLabel,

    useQwen: parsed.useQwen,

    customPrompt: parsed.customPrompt,
    negativePrompt: parsed.negativePrompt
  });

  input.batchCount = parsed.batchCount;

  return input;
}


// ------------------------------------------------------------
// APPLY MANUAL SELECTIONS BEFORE GENERATION
// ------------------------------------------------------------

function applyV14DrawThingsManualSelections(
  state,
  manualState
) {

  if (!state) {
    state = createGenerationState();
  }

  if (!manualState) {
    return state;
  }

  return applyV14ManualStateToGenerationState(
    state,
    manualState
  );
}


// ------------------------------------------------------------
// ACTUAL PIPELINE EXECUTION
// ------------------------------------------------------------

function executeV14DrawThingsRequest(request) {

  if (
    !request ||
    !request.configuration
  ) {
    throw new Error(
      "V14: missing Draw Things generation configuration."
    );
  }

  if (
    typeof pipeline === "undefined" ||
    !pipeline ||
    typeof pipeline.run !== "function"
  ) {
    throw new Error(
      "V14: Draw Things pipeline.run() is unavailable."
    );
  }

  return pipeline.run({
    configuration: request.configuration,
    prompt: request.prompt || "",
    negativePrompt: request.negativePrompt || ""
  });
}


// ------------------------------------------------------------
// GENERATE ONE FINAL IMAGE
// ------------------------------------------------------------

function generateV14DrawThingsImage(
  state,
  input
) {

  const request =
    createV14FinalRequestFromState(
      state,
      input
    );

  const finalRequest =
    prepareV14FinalGenerationRequest(
      request,
      input
    );

  const actualRequest =
    buildV14ActualGenerationRequest
      ? buildV14ActualGenerationRequest(finalRequest)
      : finalRequest;

  return executeV14DrawThingsRequest(
    actualRequest
  );
}


// ------------------------------------------------------------
// SAFE FALLBACK IF THE OPTIONAL BRIDGE FUNCTION DOES NOT EXIST
// ------------------------------------------------------------

function buildV14ActualGenerationRequest(request) {

  if (
    typeof buildV14ActualDrawThingsConfiguration ===
    "function"
  ) {
    const configuration =
      buildV14ActualDrawThingsConfiguration(
        request
      );

    return {
      configuration: configuration,
      prompt: request.prompt || "",
      negativePrompt: request.negativePrompt || ""
    };
  }

  return {
    configuration:
      request.configuration,

    prompt:
      request.prompt || "",

    negativePrompt:
      request.negativePrompt || ""
  };
}


// ------------------------------------------------------------
// BATCH GENERATION
// ------------------------------------------------------------

function runV14DrawThingsBatch(
  input
) {

  const count = Math.max(
    1,
    Number(input.batchCount || 1)
  );

  const results = [];

  for (let i = 0; i < count; i++) {

    const state =
      runV14GenerationPipeline(
        createGenerationState(),
        input.config,
        input.manualState
      );

    const generated =
      generateV14DrawThingsImage(
        state,
        input
      );

    results.push({
      index: i + 1,
      state: cloneGenerationState(state),
      result: generated
    });
  }

  return results;
}


// ------------------------------------------------------------
// MAIN SCRIPT ENTRY POINT
// ------------------------------------------------------------

function main() {

  const uiResult =
    requestV14Configuration();

  if (!uiResult) {
    return;
  }

  const parsed =
    parseV14DrawThingsConfiguration(
      uiResult
    );

  const input =
    buildV14GenerationInputFromDrawThingsUI(
      parsed
    );

  const batchResults =
    runV14DrawThingsBatch(
      input
    );

  return batchResults;
}


// ------------------------------------------------------------
// PUBLIC V14 DRAW THINGS ENTRY
// ------------------------------------------------------------

const KREA2_V14_DRAW_THINGS = {
  requestConfiguration:
    requestV14Configuration,

  parseConfiguration:
    parseV14DrawThingsConfiguration,

  buildInput:
    buildV14GenerationInputFromDrawThingsUI,

  generate:
    generateV14DrawThingsImage,

  batch:
    runV14DrawThingsBatch,

  main:
    main
};
// ============================================================
// KREA 2 V14 — CHUNK 41
// FINAL VALIDATION + DIAGNOSTICS + DEBUG REPORTING
// ============================================================

// ------------------------------------------------------------
// GENERIC VALUE TESTS
// ------------------------------------------------------------

function v14HasValue(value) {

  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
}

function v14IsArray(value) {

  return Array.isArray(value);
}

function v14ArrayHasValue(array, value) {

  if (!Array.isArray(array)) {
    return false;
  }

  return array.indexOf(value) >= 0;
}


// ------------------------------------------------------------
// STATE VALIDATION
// ------------------------------------------------------------

function validateV14GenerationState(state) {

  const errors = [];
  const warnings = [];

  if (!state) {

    errors.push(
      "Generation state does not exist."
    );

    return {
      valid: false,
      errors: errors,
      warnings: warnings
    };
  }

  // --------------------------------------------------------
  // Identity
  // --------------------------------------------------------

  if (!v14HasValue(state.gender)) {
    warnings.push(
      "Gender was not selected."
    );
  }

  if (!v14HasValue(state.nationality)) {
    warnings.push(
      "Nationality was not selected."
    );
  }

  // --------------------------------------------------------
  // Body
  // --------------------------------------------------------

  if (!v14HasValue(state.overallBuild)) {
    warnings.push(
      "Overall build was not selected."
    );
  }

  // --------------------------------------------------------
  // Hair
  // --------------------------------------------------------

  if (
    !v14HasValue(state.hairColor) ||
    !v14HasValue(state.hairLength) ||
    !v14HasValue(state.hairType)
  ) {
    warnings.push(
      "Hair is only partially specified."
    );
  }

  // --------------------------------------------------------
  // Clothing
  // --------------------------------------------------------

  if (
    !v14HasValue(state.clothing) &&
    !v14IsArray(state.clothing)
  ) {
    warnings.push(
      "No clothing selection exists."
    );
  }

  // --------------------------------------------------------
  // Action
  // --------------------------------------------------------

  if (!v14HasValue(state.action)) {
    warnings.push(
      "No action selection exists."
    );
  }

  // --------------------------------------------------------
  // Scene
  // --------------------------------------------------------

  if (!v14HasValue(state.camera)) {
    warnings.push(
      "No camera selection exists."
    );
  }

  if (!v14HasValue(state.lighting)) {
    warnings.push(
      "No lighting selection exists."
    );
  }

  if (!v14HasValue(state.timeOfDay)) {
    warnings.push(
      "No time-of-day selection exists."
    );
  }

  if (!v14HasValue(state.artStyle)) {
    warnings.push(
      "No art-style selection exists."
    );
  }

  // --------------------------------------------------------
  // Relationship validation
  // --------------------------------------------------------

  if (
    typeof getV14MatchedRelationships ===
    "function"
  ) {

    const relationshipConflicts =
      getV14MatchedRelationships(state);

    if (
      relationshipConflicts &&
      relationshipConflicts.length
    ) {

      relationshipConflicts.forEach(
        function (relationship) {

          const type =
            normalizeV14RelationshipType(
              relationship.type
            );

          if (type === "blocked") {

            warnings.push(
              "Blocked relationship detected: " +
              JSON.stringify(relationship)
            );
          }
        }
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}


// ------------------------------------------------------------
// MANUAL-SELECTION VALIDATION
// ------------------------------------------------------------

function validateV14ManualState(manualState) {

  if (
    typeof validateV14ManualSelections ===
    "function"
  ) {

    return validateV14ManualSelections(
      manualState
    );
  }

  return {
    valid: true,
    errors: [],
    warnings: []
  };
}


// ------------------------------------------------------------
// CONFIGURATION VALIDATION
// ------------------------------------------------------------

function validateV14DrawThingsUIConfiguration(
  parsed
) {

  const errors = [];
  const warnings = [];

  if (!parsed) {

    errors.push(
      "Draw Things UI configuration is missing."
    );

    return {
      valid: false,
      errors: errors,
      warnings: warnings
    };
  }

  // --------------------------------------------------------
  // Model
  // --------------------------------------------------------

  if (!v14HasValue(parsed.modelLabel)) {

    errors.push(
      "No model was selected."
    );
  }

  // --------------------------------------------------------
  // Aspect
  // --------------------------------------------------------

  if (!v14HasValue(parsed.aspectLabel)) {

    errors.push(
      "No aspect ratio was selected."
    );
  }

  // --------------------------------------------------------
  // Batch count
  // --------------------------------------------------------

  if (
    !Number.isFinite(
      Number(parsed.batchCount)
    ) ||
    Number(parsed.batchCount) < 1
  ) {

    errors.push(
      "Batch count must be at least 1."
    );
  }

  // --------------------------------------------------------
  // Randomization mode
  // --------------------------------------------------------

  if (
    parsed.randomizationLabel !==
    "Compatible" &&
    parsed.randomizationLabel !==
    "Free"
  ) {

    warnings.push(
      "Unknown randomization mode. Compatible mode will be used."
    );
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}


// ------------------------------------------------------------
// FINAL REQUEST VALIDATION
// ------------------------------------------------------------

function validateV14FinalRequest(
  request
) {

  const errors = [];
  const warnings = [];

  if (!request) {

    errors.push(
      "Final generation request is missing."
    );

    return {
      valid: false,
      errors: errors,
      warnings: warnings
    };
  }

  if (
    !request.configuration
  ) {

    errors.push(
      "Draw Things configuration is missing."
    );
  }

  if (
    !v14HasValue(request.prompt)
  ) {

    errors.push(
      "Final prompt is empty."
    );
  }

  if (
    request.prompt &&
    request.prompt.length < 10
  ) {

    warnings.push(
      "Final prompt is unusually short."
    );
  }

  if (
    request.prompt &&
    request.prompt.length > 12000
  ) {

    warnings.push(
      "Final prompt is unusually long."
    );
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}


// ------------------------------------------------------------
// FULL PRE-GENERATION VALIDATION
// ------------------------------------------------------------

function validateV14BeforeGeneration(
  state,
  input,
  request
) {

  const stateReport =
    validateV14GenerationState(
      state
    );

  const manualReport =
    validateV14ManualState(
      input
        ? input.manualState
        : null
    );

  const requestReport =
    validateV14FinalRequest(
      request
    );

  const errors =
    []
      .concat(stateReport.errors || [])
      .concat(manualReport.errors || [])
      .concat(requestReport.errors || []);

  const warnings =
    []
      .concat(stateReport.warnings || [])
      .concat(manualReport.warnings || [])
      .concat(requestReport.warnings || []);

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,

    state: stateReport,
    manual: manualReport,
    request: requestReport
  };
}


// ------------------------------------------------------------
// SAFE FINAL GENERATION
// ------------------------------------------------------------

function generateV14DrawThingsImageSafe(
  state,
  input
) {

  if (!state) {
    throw new Error(
      "V14: Cannot generate without a state."
    );
  }

  if (!input) {
    throw new Error(
      "V14: Cannot generate without input configuration."
    );
  }

  // --------------------------------------------------------
  // Build the request first.
  // --------------------------------------------------------

  const request =
    createV14FinalRequestFromState(
      state,
      input
    );

  const finalRequest =
    prepareV14FinalGenerationRequest(
      request,
      input
    );

  // --------------------------------------------------------
  // Validate before touching pipeline.run().
  // --------------------------------------------------------

  const validation =
    validateV14BeforeGeneration(
      state,
      input,
      finalRequest
    );

  if (!validation.valid) {

    throw new Error(
      "V14 generation validation failed:\n" +
      validation.errors.join("\n")
    );
  }

  // --------------------------------------------------------
  // Execute only after validation succeeds.
  // --------------------------------------------------------

  return executeV14DrawThingsRequest(
    buildV14ActualGenerationRequest(
      finalRequest
    )
  );
}


// ------------------------------------------------------------
// STATE SUMMARY
// ------------------------------------------------------------

function getV14StateSummary(state) {

  if (!state) {
    return "No generation state.";
  }

  const lines = [];

  function add(label, category) {

    const value =
      getV14StatePresetValue
        ? getV14StatePresetValue(
          state,
          category
        )
        : state[category];

    if (v14HasValue(value)) {

      lines.push(
        label + ": " + value
      );
    }
  }

  add("Gender", "gender");
  add("Nationality", "nationality");
  add("Age", "age");
  add("Skin", "skin");
  add("Eyes", "eyes");
  add("Build", "overallBuild");
  add("Height", "height");
  add("Chest", "chest");
  add("Hips", "hips");
  add("Body Shape", "bodyShape");
  add("Legs", "legs");
  add("Buttocks", "buttocks");
  add("Belly", "belly");

  add("Makeup", "makeup");
  add("Facial Hair", "facialHair");
  add("Tattoos", "tattoos");
  add("Body Details", "bodyDetails");
  add("Nails", "nails");

  add("Hair Color", "hairColor");
  add("Hair Length", "hairLength");
  add("Hair Type", "hairType");
  add("Hairstyle", "hairstyles");

  add("Clothing", "clothing");
  add("Action", "action");

  add("Camera", "camera");
  add("Lighting", "lighting");
  add("Time", "timeOfDay");
  add("Art Style", "artStyle");

  return lines.join("\n");
}


// ------------------------------------------------------------
// RELATIONSHIP REPORT
// ------------------------------------------------------------

function getV14StateRelationshipReport(
  state
) {

  if (
    typeof getV14MatchedRelationships !==
    "function"
  ) {

    return [];
  }

  const matches =
    getV14MatchedRelationships(
      state
    );

  if (!Array.isArray(matches)) {
    return [];
  }

  return matches.map(
    function (relationship) {

      return {
        type:
          normalizeV14RelationshipType(
            relationship.type
          ),

        category:
          relationship.category || "",

        option:
          relationship.option || "",

        condition:
          relationship.condition || "",

        source:
          relationship.source || ""
      };
    }
  );
}


// ------------------------------------------------------------
// COMPLETE DEBUG REPORT
// ------------------------------------------------------------

function createV14DebugReport(
  state,
  input,
  request
) {

  const validation =
    validateV14BeforeGeneration(
      state,
      input,
      request
    );

  return {
    version: 14,

    valid:
      validation.valid,

    errors:
      validation.errors,

    warnings:
      validation.warnings,

    state:
      state
        ? cloneGenerationState(state)
        : null,

    stateSummary:
      getV14StateSummary(state),

    relationships:
      getV14StateRelationshipReport(
        state
      ),

    manualSelections:
      input
        ? cloneV14ManualState(
          input.manualState
        )
        : null,

    configuration:
      input
        ? normalizeV14GenerationConfig(
          input.config
        )
        : null,

    prompt:
      request
        ? request.prompt || ""
        : "",

    negativePrompt:
      request
        ? request.negativePrompt || ""
        : ""
  };
}


// ------------------------------------------------------------
// HUMAN-READABLE DEBUG TEXT
// ------------------------------------------------------------

function formatV14DebugReport(
  report
) {

  if (!report) {
    return "No V14 debug report.";
  }

  const lines = [];

  lines.push(
    "KREA 2 V14 DEBUG REPORT"
  );

  lines.push(
    "========================"
  );

  lines.push(
    "Valid: " +
    (report.valid ? "YES" : "NO")
  );

  if (
    report.errors &&
    report.errors.length
  ) {

    lines.push("");
    lines.push("ERRORS:");

    report.errors.forEach(
      function (error) {

        lines.push(
          "- " + error
        );
      }
    );
  }

  if (
    report.warnings &&
    report.warnings.length
  ) {

    lines.push("");
    lines.push("WARNINGS:");

    report.warnings.forEach(
      function (warning) {

        lines.push(
          "- " + warning
        );
      }
    );
  }

  if (report.stateSummary) {

    lines.push("");
    lines.push("STATE:");
    lines.push(
      report.stateSummary
    );
  }

  if (
    report.relationships &&
    report.relationships.length
  ) {

    lines.push("");
    lines.push(
      "MATCHED RELATIONSHIPS:"
    );

    report.relationships.forEach(
      function (relationship) {

        lines.push(
          "- " +
          relationship.type +
          " | " +
          relationship.category +
          " | " +
          relationship.option
        );
      }
    );
  }

  if (report.prompt) {

    lines.push("");
    lines.push("PROMPT:");
    lines.push(report.prompt);
  }

  return lines.join("\n");
}


// ------------------------------------------------------------
// DEBUG API
// ------------------------------------------------------------

const V14_DIAGNOSTICS = {

  validateState:
    validateV14GenerationState,

  validateManual:
    validateV14ManualState,

  validateUI:
    validateV14DrawThingsUIConfiguration,

  validateRequest:
    validateV14FinalRequest,

  validateBeforeGeneration:
    validateV14BeforeGeneration,

  stateSummary:
    getV14StateSummary,

  relationships:
    getV14StateRelationshipReport,

  createReport:
    createV14DebugReport,

  formatReport:
    formatV14DebugReport
};


// ------------------------------------------------------------
// REPLACE THE UNSAFE GENERATION ENTRY WITH THE SAFE ONE
// ------------------------------------------------------------

function generateV14DrawThingsImage(
  state,
  input
) {

  return generateV14DrawThingsImageSafe(
    state,
    input
  );
}


// ------------------------------------------------------------
// UPDATE PUBLIC DRAW THINGS ENGINE
// ------------------------------------------------------------

const V14_SAFE_DRAW_THINGS_ENGINE = {

  generate:
    generateV14DrawThingsImage,

  validate:
    validateV14BeforeGeneration,

  diagnostics:
    V14_DIAGNOSTICS
};

// ============================================================
// KREA 2 V14 — CHUNK 42
// FINAL INTEGRATION + SAFE BATCH PIPELINE
// ============================================================

// ------------------------------------------------------------
// DECLARE THE OPTIONAL DRAW THINGS ADAPTER SAFELY
// ------------------------------------------------------------

if (
  typeof V14_DRAW_THINGS_GENERATE ===
  "undefined"
) {
  var V14_DRAW_THINGS_GENERATE = null;
}


// ------------------------------------------------------------
// NORMALIZE A COMPLETE V14 INPUT
// ------------------------------------------------------------

function normalizeV14CompleteInput(input) {

  if (!input) {

    throw new Error(
      "V14: generation input is missing."
    );
  }

  const normalized = Object.assign(
    {},
    input
  );

  normalized.config =
    normalizeV14GenerationConfig(
      input.config || {}
    );

  normalized.manualState =
    input.manualState
      ? normalizeV14ManualSelectionState(
        input.manualState
      )
      : createV14ManualSelectionState();

  normalized.batchCount =
    Math.max(
      1,
      Math.round(
        Number(
          input.batchCount || 1
        )
      )
    );

  return normalized;
}


// ------------------------------------------------------------
// BUILD A FRESH STATE FOR ONE BATCH ITERATION
// ------------------------------------------------------------

function createV14BatchState(
  input
) {

  const state =
    createGenerationState();

  // Manual selections are applied first.
  applyV14DrawThingsManualSelections(
    state,
    input.manualState
  );

  return state;
}


// ------------------------------------------------------------
// GENERATE ONE STATE WITHOUT LOSING MANUAL CHOICES
// ------------------------------------------------------------

function generateV14BatchState(
  input
) {

  const state =
    createV14BatchState(
      input
    );

  const generatedState =
    runV14GenerationPipeline(
      state,
      input.config,
      input.manualState
    );

  return generatedState;
}


// ------------------------------------------------------------
// BUILD FINAL REQUEST FOR A STATE
// ------------------------------------------------------------

function buildV14BatchRequest(
  state,
  input
) {

  const baseRequest =
    createV14FinalRequestFromState(
      state,
      input
    );

  const preparedRequest =
    prepareV14FinalGenerationRequest(
      baseRequest,
      input
    );

  return buildV14ActualGenerationRequest(
    preparedRequest
  );
}


// ------------------------------------------------------------
// VALIDATE BEFORE ACTUAL PIPELINE EXECUTION
// ------------------------------------------------------------

function validateV14BatchRequest(
  state,
  input,
  request
) {

  return validateV14BeforeGeneration(
    state,
    input,
    request
  );
}


// ------------------------------------------------------------
// GENERATE ONE IMAGE — FINAL PATH
// ------------------------------------------------------------

function generateV14BatchItem(
  input,
  index
) {

  const state =
    generateV14BatchState(
      input
    );

  const request =
    buildV14BatchRequest(
      state,
      input
    );

  const validation =
    validateV14BatchRequest(
      state,
      input,
      request
    );

  if (!validation.valid) {

    throw new Error(
      "V14 batch item " +
      index +
      " failed validation:\n" +
      validation.errors.join("\n")
    );
  }

  const result =
    executeV14DrawThingsRequest(
      request
    );

  return {
    index: index,

    state:
      cloneGenerationState(
        state
      ),

    request: request,

    result: result,

    validation: validation
  };
}


// ------------------------------------------------------------
// FINAL BATCH ENGINE
// ------------------------------------------------------------

function runV14FinalBatch(
  input
) {

  const normalized =
    normalizeV14CompleteInput(
      input
    );

  const results = [];

  for (
    let index = 1;
    index <= normalized.batchCount;
    index++
  ) {

    results.push(
      generateV14BatchItem(
        normalized,
        index
      )
    );
  }

  return results;
}


// ------------------------------------------------------------
// PREVIEW WITHOUT GENERATING IMAGES
// ------------------------------------------------------------

function previewV14FinalBatch(
  input
) {

  const normalized =
    normalizeV14CompleteInput(
      input
    );

  const count =
    Math.min(
      normalized.batchCount,
      normalized.config.previewSampleSize ||
      PREVIEW_SAMPLE_SIZE
    );

  const samples = [];

  for (
    let index = 1;
    index <= count;
    index++
  ) {

    const state =
      generateV14BatchState(
        normalized
      );

    const request =
      buildV14BatchRequest(
        state,
        normalized
      );

    const validation =
      validateV14BatchRequest(
        state,
        normalized,
        request
      );

    samples.push({

      index: index,

      state:
        cloneGenerationState(
          state
        ),

      request:
        request,

      validation:
        validation,

      prompt:
        request.prompt || ""
    });
  }

  return samples;
}


// ------------------------------------------------------------
// BATCH REPORT
// ------------------------------------------------------------

function createV14FinalBatchReport(
  results
) {

  if (!Array.isArray(results)) {

    return {
      count: 0,
      successful: 0,
      failed: 0,
      results: []
    };
  }

  let successful = 0;
  let failed = 0;

  results.forEach(
    function (item) {

      if (
        item &&
        item.result !== undefined &&
        item.result !== null
      ) {
        successful++;
      } else {
        failed++;
      }
    }
  );

  return {

    count:
      results.length,

    successful:
      successful,

    failed:
      failed,

    results:
      results
  };
}


// ------------------------------------------------------------
// MODEL + ASPECT SANITY CHECK
// ------------------------------------------------------------

function validateV14ModelAndAspect(
  input
) {

  const errors = [];

  const model =
    findV14ModelById
      ? findV14ModelById(
        input.modelId
      )
      : null;

  const resolvedModel =
    model ||
    (
      typeof findV14ModelByLabel ===
        "function"
        ? findV14ModelByLabel(
          input.modelLabel
        )
        : null
    );

  if (!resolvedModel) {

    errors.push(
      "V14 could not resolve the selected model."
    );
  }

  const aspect =
    typeof getV14AspectDimensions ===
      "function"
      ? getV14AspectDimensions(
        input.aspectLabel
      )
      : null;

  if (!aspect) {

    errors.push(
      "V14 could not resolve the selected aspect ratio."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors:
      errors
  };
}


// ------------------------------------------------------------
// COMPLETE INPUT VALIDATION
// ------------------------------------------------------------

function validateV14CompleteInput(
  input
) {

  const normalized =
    normalizeV14CompleteInput(
      input
    );

  const errors = [];
  const warnings = [];

  const modelReport =
    validateV14ModelAndAspect(
      normalized
    );

  errors.push.apply(
    errors,
    modelReport.errors
  );

  const manualReport =
    validateV14ManualState(
      normalized.manualState
    );

  errors.push.apply(
    errors,
    manualReport.errors || []
  );

  warnings.push.apply(
    warnings,
    manualReport.warnings || []
  );

  return {
    valid:
      errors.length === 0,

    errors:
      errors,

    warnings:
      warnings
  };
}


// ------------------------------------------------------------
// FINAL PUBLIC GENERATION FUNCTION
// ------------------------------------------------------------

function generateKrea2V14(
  input
) {

  const normalized =
    normalizeV14CompleteInput(
      input
    );

  const inputValidation =
    validateV14CompleteInput(
      normalized
    );

  if (!inputValidation.valid) {

    throw new Error(
      "V14 input validation failed:\n" +
      inputValidation.errors.join("\n")
    );
  }

  const results =
    runV14FinalBatch(
      normalized
    );

  return createV14FinalBatchReport(
    results
  );
}


// ------------------------------------------------------------
// FINAL PREVIEW FUNCTION
// ------------------------------------------------------------

function previewKrea2V14(
  input
) {

  const normalized =
    normalizeV14CompleteInput(
      input
    );

  const inputValidation =
    validateV14CompleteInput(
      normalized
    );

  if (!inputValidation.valid) {

    throw new Error(
      "V14 preview validation failed:\n" +
      inputValidation.errors.join("\n")
    );
  }

  return previewV14FinalBatch(
    normalized
  );
}


// ------------------------------------------------------------
// FINAL RESET
// ------------------------------------------------------------

function resetKrea2V14() {

  if (
    typeof V14_SESSION !==
    "undefined" &&
    V14_SESSION &&
    typeof resetV14GenerationSession ===
    "function"
  ) {

    resetV14GenerationSession();
  }

  return createGenerationState();
}


// ------------------------------------------------------------
// FINAL PUBLIC API
// ------------------------------------------------------------

const KREA2_V14_FINAL = {

  version: 14,

  generate:
    generateKrea2V14,

  preview:
    previewKrea2V14,

  reset:
    resetKrea2V14,

  validate:
    validateV14CompleteInput,

  diagnostics:
    V14_DIAGNOSTICS,

  relationships:
    V14_RELATIONSHIP_ENGINE,

  randomizer:
    V14_CORE_RANDOMIZER,

  pipeline:
    V14_GENERATION_PIPELINE,

  prompt:
    V14_PROMPT_ENGINE,

  qwen:
    V14_QWEN_ENGINE,

  session:
    V14_SESSION_ENGINE
};


// ------------------------------------------------------------
// DRAW THINGS MAIN ENTRY
// ------------------------------------------------------------

function runKrea2V14Final() {

  const uiResult =
    requestV14Configuration();

  if (
    uiResult === null ||
    uiResult === undefined
  ) {
    return;
  }

  const parsed =
    parseV14DrawThingsConfiguration(
      uiResult
    );

  const input =
    buildV14GenerationInputFromDrawThingsUI(
      parsed
    );

  return generateKrea2V14(
    input
  );
}


// ------------------------------------------------------------
// FINAL GLOBAL API
// ------------------------------------------------------------

// ============================================================
// KREA 2 V14
// IDENTITY OVERRIDES + EXACT AGE PRESETS + CELEBRITY LAYER
// ============================================================

// ------------------------------------------------------------
// EXACT AGE PRESETS
// ------------------------------------------------------------

const V14_EXACT_AGE_PRESETS = [
  {
    id: "age.18",
    label: "18",
    value: "18 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.20",
    label: "20",
    value: "20 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.25",
    label: "25",
    value: "25 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.30",
    label: "30",
    value: "30 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.35",
    label: "35",
    value: "35 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.40",
    label: "40",
    value: "40 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.45",
    label: "45",
    value: "45 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.50",
    label: "50",
    value: "50 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.55",
    label: "55",
    value: "55 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.60",
    label: "60",
    value: "60 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.65",
    label: "65",
    value: "65 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.70",
    label: "70",
    value: "70 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.75",
    label: "75",
    value: "75 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.80",
    label: "80",
    value: "80 years old",
    metadata: {
      category: "age"
    }
  },
  {
    id: "age.85",
    label: "85",
    value: "85 years old",
    metadata: {
      category: "age"
    }
  }
];


// ------------------------------------------------------------
// USE EXACT AGES FOR V14
// ------------------------------------------------------------

const V14_AGE_PRESETS =
  V14_EXACT_AGE_PRESETS;


// ------------------------------------------------------------
// CELEBRITY / IDENTITY OVERRIDE PRESETS
// ------------------------------------------------------------
//
// These are deliberately kept separate from nationality,
// profile, body and appearance randomization.
//
// An identity preset can provide a recognizable subject
// description without forcing every other category to become
// permanently locked.
//
// ------------------------------------------------------------

const V14_IDENTITY_PRESETS = [

  {
    id: "identity.my_baby",
    label: "My Baby",
    value: "a baby-faced young adult woman",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.anne_hathaway",
    label: "Anne Hathaway",
    value: "Anne Hathaway",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.dolly_parton",
    label: "Dolly Parton",
    value: "Dolly Parton",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.sabrina_carpenter",
    label: "Sabrina Carpenter",
    value: "Sabrina Carpenter",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.marilyn_monroe",
    label: "Marilyn Monroe",
    value: "Marilyn Monroe",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.lisbeth_salander",
    label: "Lisbeth Salander",
    value: "Lisbeth Salander",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.curvy_black_box_braids",
    label: "Curvy Black Woman with Box Braids",
    value: "a curvy Black woman with box braids",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman",
      profile: "african"
    }
  },

  {
    id: "identity.curvy_mexican_woman",
    label: "Curvy Mexican Woman",
    value: "a curvy Mexican woman",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman",
      profile: "latina"
    }
  },

  {
    id: "identity.mixed_race",
    label: "Mixed Race",
    value: "a mixed-race woman",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman",
      profile: "mixed"
    }
  },

  {
    id: "identity.petite_korean",
    label: "Petite Korean",
    value: "a petite Korean woman",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman",
      profile: "eastAsian"
    }
  },

  {
    id: "identity.slim_blonde_pixie",
    label: "Slim Blonde with Pixie Cut",
    value: "a slim blonde woman with a pixie cut",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.oversized_head_eyes",
    label: "Oversized Head / Eyes",
    value: "a stylized woman with an oversized head and large expressive eyes",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.michelle_obama",
    label: "Michelle Obama",
    value: "Michelle Obama",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  },

  {
    id: "identity.betty_boop",
    label: "Betty Boop",
    value: "Betty Boop",
    metadata: {
      category: "identity",
      identityOverride: true,
      gender: "woman"
    }
  }
];


// ------------------------------------------------------------
// IDENTITY LOOKUP
// ------------------------------------------------------------

function findV14IdentityPreset(
  value
) {

  if (!v14HasValue(value)) {
    return null;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return V14_IDENTITY_PRESETS.find(
    function (preset) {

      return (
        String(
          getPresetId(preset)
        ).toLowerCase() === normalized ||

        String(
          getPresetLabel(preset)
        ).toLowerCase() === normalized ||

        String(
          getPresetValue(preset)
        ).toLowerCase() === normalized
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// IDENTITY MENU
// ------------------------------------------------------------

function getV14IdentityPresetMenuOptions() {

  return [
    "Random"
  ].concat(
    V14_IDENTITY_PRESETS.map(
      function (preset) {
        return getPresetLabel(preset);
      }
    )
  );
}


// ------------------------------------------------------------
// IDENTITY STATE SUPPORT
// ------------------------------------------------------------

function getV14IdentityStateValue(
  state
) {

  if (!state) {
    return "";
  }

  return (
    state.identity ||
    state.identityOverride ||
    ""
  );
}

function setV14IdentityState(
  state,
  preset
) {

  if (!state) {
    return state;
  }

  if (!preset) {

    state.identity = "";
    state.identityOverride = "";

    return state;
  }

  const value =
    getPresetValue(preset);

  state.identity = value;
  state.identityOverride = value;

  return state;
}


// ------------------------------------------------------------
// IDENTITY OVERRIDE METADATA
// ------------------------------------------------------------

function getV14IdentityMetadata(
  preset
) {

  if (!preset) {
    return {};
  }

  return Object.assign(
    {},
    getPresetMetadata(preset) || {}
  );
}


// ------------------------------------------------------------
// APPLY IDENTITY OVERRIDE
// ------------------------------------------------------------

function applyV14IdentityPreset(
  state,
  preset
) {

  if (!state || !preset) {
    return state;
  }

  setV14IdentityState(
    state,
    preset
  );

  const metadata =
    getV14IdentityMetadata(
      preset
    );

  // Identity presets can provide contextual information.
  if (
    metadata.gender &&
    !state.gender
  ) {

    const genderPreset =
      resolveV14Preset(
        "gender",
        metadata.gender
      );

    if (genderPreset) {

      state.gender =
        getPresetValue(
          genderPreset
        );
    }
  }

  if (
    metadata.profile &&
    !state.nationalityProfile
  ) {

    state.nationalityProfile =
      metadata.profile;
  }

  return state;
}


// ------------------------------------------------------------
// RANDOM IDENTITY
// ------------------------------------------------------------

function randomizeV14Identity(
  state,
  config,
  manualState
) {

  if (!state) {
    state = createGenerationState();
  }

  if (
    manualState &&
    hasV14ManualSelection(
      manualState,
      "identity"
    )
  ) {

    const manual =
      manualState.identity;

    if (manual) {

      applyV14IdentityPreset(
        state,
        manual
      );
    }

    return state;
  }

  if (
    !config ||
    config.randomizeIdentity === false
  ) {
    return state;
  }

  const candidates =
    V14_IDENTITY_PRESETS.filter(
      function (preset) {

        return !isV14OptionBlocked(
          "identity",
          preset,
          state
        );
      }
    );

  // Identity presets are optional.
  // Most random generations should still use
  // ordinary generated identities rather than
  // constantly selecting celebrities.

  if (
    candidates.length &&
    randomChance(0.08)
  ) {

    const selected =
      randomV14CompatibleOption(
        "identity",
        candidates,
        state,
        config
      );

    if (selected) {

      applyV14IdentityPreset(
        state,
        selected
      );
    }
  }

  return state;
}


// ------------------------------------------------------------
// IDENTITY RELATIONSHIPS
// ------------------------------------------------------------

function buildV14IdentityRelationships() {

  if (
    typeof defineV14Relationship !==
    "function"
  ) {
    return;
  }

  V14_IDENTITY_PRESETS.forEach(
    function (preset) {

      const metadata =
        getV14IdentityMetadata(
          preset
        );

      if (
        metadata.gender
      ) {

        defineV14Relationship(
          "identity",
          getPresetId(preset),
          "preferred",
          "gender",
          metadata.gender,
          "identity gender"
        );
      }

      if (
        metadata.profile
      ) {

        defineV14Relationship(
          "identity",
          getPresetId(preset),
          "preferred",
          "nationalityProfile",
          metadata.profile,
          "identity profile"
        );
      }
    }
  );
}


// ------------------------------------------------------------
// IDENTITY PROMPT BUILDER
// ------------------------------------------------------------

function buildV14IdentityDescription(
  state
) {

  const identity =
    getV14IdentityStateValue(
      state
    );

  if (!identity) {
    return "";
  }

  return identity;
}


// ------------------------------------------------------------
// UPDATE SUBJECT BUILDER
// ------------------------------------------------------------
//
// Identity is placed at the beginning of the subject
// description, while ordinary generated traits continue
// to provide additional context.
//
// ------------------------------------------------------------

function buildV14SubjectIdentityLead(
  state
) {

  const identity =
    buildV14IdentityDescription(
      state
    );

  if (!identity) {
    return "";
  }

  return identity;
}


// ------------------------------------------------------------
// PATCH SUBJECT DESCRIPTION WITHOUT REPLACING THE
// EXISTING V14 BODY / APPEARANCE SYSTEM
// ------------------------------------------------------------

function buildV14SubjectDescriptionWithIdentity(
  state
) {

  const identity =
    buildV14SubjectIdentityLead(
      state
    );

  let existing = "";

  if (
    typeof buildV14SubjectDescription ===
    "function"
  ) {

    existing =
      buildV14SubjectDescription(
        state
      );
  }

  if (!identity) {
    return existing;
  }

  if (!existing) {
    return identity;
  }

  // Avoid repeating the same identity phrase.
  if (
    existing
      .toLowerCase()
      .indexOf(
        identity.toLowerCase()
      ) >= 0
  ) {

    return existing;
  }

  return [
    identity,
    existing
  ].join(", ");
}


// ------------------------------------------------------------
// PATCH SUBJECT LEAD
// ------------------------------------------------------------

function buildV14SubjectLeadWithIdentity(
  state
) {

  const identity =
    buildV14SubjectIdentityLead(
      state
    );

  if (identity) {
    return identity;
  }

  if (
    typeof buildV14SubjectLead ===
    "function"
  ) {

    return buildV14SubjectLead(
      state
    );
  }

  return "";
}


// ------------------------------------------------------------
// AGE RESOLUTION
// ------------------------------------------------------------

function resolveV14ExactAgePreset(
  value
) {

  if (!v14HasValue(value)) {
    return null;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return V14_EXACT_AGE_PRESETS.find(
    function (preset) {

      return (
        String(
          getPresetId(preset)
        ).toLowerCase() === normalized ||

        String(
          getPresetLabel(preset)
        ).toLowerCase() === normalized ||

        String(
          getPresetValue(preset)
        ).toLowerCase() === normalized
      );
    }
  ) || null;
}


// ------------------------------------------------------------
// EXACT AGE RANDOMIZER
// ------------------------------------------------------------

function randomizeV14ExactAge(
  state,
  config,
  manualState
) {

  if (!state) {
    return state;
  }

  if (
    manualState &&
    hasV14ManualSelection(
      manualState,
      "age"
    )
  ) {

    const manual =
      manualState.age;

    if (manual) {

      state.age =
        getPresetValue(
          manual
        );
    }

    return state;
  }

  if (
    !config ||
    config.randomizeIdentity === false
  ) {
    return state;
  }

  const selected =
    randomV14CompatibleOption(
      "age",
      V14_EXACT_AGE_PRESETS,
      state,
      config
    );

  if (selected) {

    state.age =
      getPresetValue(
        selected
      );
  }

  return state;
}


// ------------------------------------------------------------
// IDENTITY CATEGORY REGISTRATION
// ------------------------------------------------------------

if (
  typeof V14_PRESET_COLLECTIONS !==
  "undefined"
) {

  V14_PRESET_COLLECTIONS.identity =
    V14_IDENTITY_PRESETS;

  V14_PRESET_COLLECTIONS.age =
    V14_EXACT_AGE_PRESETS;
}

if (
  typeof V14_CATEGORY_LABELS !==
  "undefined"
) {

  V14_CATEGORY_LABELS.identity =
    "Identity";

  V14_CATEGORY_LABELS.age =
    "Age";
}


// ------------------------------------------------------------
// BUILD IDENTITY RELATIONSHIPS
// ------------------------------------------------------------

buildV14IdentityRelationships();


// ------------------------------------------------------------
// PATCH RANDOMIZATION PIPELINE
// ------------------------------------------------------------

function runV14IdentityStage(
  state,
  config,
  manualState
) {

  state =
    randomizeV14Identity(
      state,
      config,
      manualState
    );

  state =
    randomizeV14ExactAge(
      state,
      config,
      manualState
    );

  return state;
}


// ------------------------------------------------------------
// PUBLIC IDENTITY ENGINE
// ------------------------------------------------------------

const V14_IDENTITY_ENGINE = {

  presets:
    V14_IDENTITY_PRESETS,

  ages:
    V14_EXACT_AGE_PRESETS,

  find:
    findV14IdentityPreset,

  set:
    applyV14IdentityPreset,

  randomize:
    randomizeV14Identity,

  randomizeAge:
    randomizeV14ExactAge,

  describe:
    buildV14IdentityDescription
};

// ============================================================
// KREA 2 V14 — CHUNK 44
// MANUAL SELECTION LOCKING + RANDOMIZATION HARDENING
// ============================================================

// ------------------------------------------------------------
// SAFE MANUAL-SELECTION TEST
// ------------------------------------------------------------

function v14HasManualCategory(
  manualState,
  category
) {

  if (!manualState) {
    return false;
  }

  if (
    typeof hasV14ManualSelection ===
    "function"
  ) {

    return hasV14ManualSelection(
      manualState,
      category
    );
  }

  return !!(
    manualState[category]
  );
}


// ------------------------------------------------------------
// SAFE MANUAL PRESET
// ------------------------------------------------------------

function v14GetManualPreset(
  manualState,
  category
) {

  if (!manualState) {
    return null;
  }

  const value =
    manualState[category];

  if (!value) {
    return null;
  }

  if (
    typeof resolveV14Preset ===
    "function"
  ) {

    return resolveV14Preset(
      category,
      value
    );
  }

  return value;
}


// ------------------------------------------------------------
// DO NOT RANDOMIZE A MANUAL CATEGORY
// ------------------------------------------------------------

function shouldV14PreserveCategory(
  category,
  manualState,
  config
) {

  if (
    config &&
    config.preserveManualSelections === false
  ) {
    return false;
  }

  return v14HasManualCategory(
    manualState,
    category
  );
}


// ------------------------------------------------------------
// APPLY A MANUAL VALUE DIRECTLY
// ------------------------------------------------------------

function applyV14ManualCategory(
  state,
  manualState,
  category
) {

  if (!state || !manualState) {
    return state;
  }

  const preset =
    v14GetManualPreset(
      manualState,
      category
    );

  if (!preset) {
    return state;
  }

  const value =
    getPresetValue(
      preset
    );

  if (!v14HasValue(value)) {
    return state;
  }

  state[category] = value;

  return state;
}


// ------------------------------------------------------------
// MANUAL CATEGORY LIST
// ------------------------------------------------------------

const V14_MANUAL_PROTECTED_CATEGORIES = [

  "identity",

  "gender",
  "nationality",
  "age",

  "skin",
  "eyes",

  "overallBuild",
  "height",
  "chest",
  "hips",
  "lips",
  "eyelashes",
  "bodyShape",
  "legs",
  "buttocks",
  "belly",
  "specificBody",

  "makeup",
  "makeupOddities",
  "facialHair",
  "tattoos",
  "bodyDetails",
  "nails",
  "hairDetails",
  "nose",

  "hairColor",
  "hairLength",
  "hairType",
  "hairstyles",

  "clothing",
  "action",

  "camera",
  "lighting",
  "timeOfDay",
  "artStyle"
];


// ------------------------------------------------------------
// RE-APPLY ALL MANUAL SELECTIONS
// ------------------------------------------------------------
//
// This is intentionally done AFTER automatic randomization.
// It prevents an automatic stage from accidentally overwriting
// a deliberate user selection.
//
// ------------------------------------------------------------

function reapplyV14ManualSelections(
  state,
  manualState,
  config
) {

  if (
    !state ||
    !manualState
  ) {
    return state;
  }

  if (
    config &&
    config.preserveManualSelections === false
  ) {
    return state;
  }

  V14_MANUAL_PROTECTED_CATEGORIES.forEach(
    function (category) {

      if (
        !v14HasManualCategory(
          manualState,
          category
        )
      ) {
        return;
      }

      applyV14ManualCategory(
        state,
        manualState,
        category
      );
    }
  );

  // Identity needs its special application logic.
  if (
    v14HasManualCategory(
      manualState,
      "identity"
    )
  ) {

    const identity =
      v14GetManualPreset(
        manualState,
        "identity"
      );

    if (identity) {

      applyV14IdentityPreset(
        state,
        identity
      );
    }
  }

  return state;
}


// ------------------------------------------------------------
// PRESERVE MANUAL CLOTHING
// ------------------------------------------------------------

function preserveV14ManualClothing(
  state,
  manualState
) {

  if (
    !v14HasManualCategory(
      manualState,
      "clothing"
    )
  ) {
    return state;
  }

  const preset =
    v14GetManualPreset(
      manualState,
      "clothing"
    );

  if (!preset) {
    return state;
  }

  const value =
    getPresetValue(
      preset
    );

  if (v14HasValue(value)) {
    state.clothing = value;
  }

  return state;
}


// ------------------------------------------------------------
// PRESERVE MANUAL ACTION
// ------------------------------------------------------------

function preserveV14ManualAction(
  state,
  manualState
) {

  if (
    !v14HasManualCategory(
      manualState,
      "action"
    )
  ) {
    return state;
  }

  const preset =
    v14GetManualPreset(
      manualState,
      "action"
    );

  if (!preset) {
    return state;
  }

  const value =
    getPresetValue(
      preset
    );

  if (v14HasValue(value)) {
    state.action = value;
  }

  return state;
}


// ------------------------------------------------------------
// PRESERVE MANUAL SCENE
// ------------------------------------------------------------

function preserveV14ManualScene(
  state,
  manualState
) {

  [
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ].forEach(
    function (category) {

      if (
        v14HasManualCategory(
          manualState,
          category
        )
      ) {

        applyV14ManualCategory(
          state,
          manualState,
          category
        );
      }
    }
  );

  return state;
}


// ------------------------------------------------------------
// HARDENED CATEGORY RANDOMIZER
// ------------------------------------------------------------

function randomizeV14CategorySafely(
  state,
  category,
  config,
  manualState,
  candidates
) {

  if (!state) {
    return state;
  }

  // --------------------------------------------------------
  // Manual selection always wins.
  // --------------------------------------------------------

  if (
    shouldV14PreserveCategory(
      category,
      manualState,
      config
    )
  ) {

    applyV14ManualCategory(
      state,
      manualState,
      category
    );

    return state;
  }

  // --------------------------------------------------------
  // Randomization disabled for this category.
  // --------------------------------------------------------

  if (
    typeof shouldV14Randomize ===
    "function" &&
    !shouldV14Randomize(
      config,
      category
    )
  ) {

    return state;
  }

  // --------------------------------------------------------
  // No candidate list.
  // --------------------------------------------------------

  if (
    !Array.isArray(candidates) ||
    !candidates.length
  ) {
    return state;
  }

  // --------------------------------------------------------
  // Choose through the authoritative engine.
  // --------------------------------------------------------

  const selected =
    randomV14CompatibleOption(
      category,
      candidates,
      state,
      config
    );

  if (!selected) {
    return state;
  }

  state[category] =
    getPresetValue(
      selected
    );

  return state;
}


// ------------------------------------------------------------
// SAFE RANDOMIZER FOR SIMPLE CATEGORIES
// ------------------------------------------------------------

function randomizeV14SimpleCategory(
  state,
  category,
  presets,
  config,
  manualState
) {

  return randomizeV14CategorySafely(
    state,
    category,
    config,
    manualState,
    presets
  );
}


// ------------------------------------------------------------
// SAFE IDENTITY STAGE
// ------------------------------------------------------------

function runV14IdentityStageSafe(
  state,
  config,
  manualState
) {

  if (
    shouldV14PreserveCategory(
      "identity",
      manualState,
      config
    )
  ) {

    const identity =
      v14GetManualPreset(
        manualState,
        "identity"
      );

    if (identity) {

      applyV14IdentityPreset(
        state,
        identity
      );
    }

  } else {

    randomizeV14Identity(
      state,
      config,
      manualState
    );
  }

  // Age is independent of identity.
  randomizeV14ExactAge(
    state,
    config,
    manualState
  );

  // These are deliberately restored after the identity
  // stage because an identity preset may provide context.
  reapplyV14ManualSelections(
    state,
    manualState,
    config
  );

  return state;
}


// ------------------------------------------------------------
// SAFE BODY STAGE
// ------------------------------------------------------------

function runV14BodyStageSafe(
  state,
  config,
  manualState
) {

  if (
    config &&
    config.randomizeBody === false
  ) {

    return reapplyV14ManualSelections(
      state,
      manualState,
      config
    );
  }

  const bodyCategories = [

    ["overallBuild", overallBuildPresets],
    ["height", heightPresets],
    ["chest", chestPresets],
    ["hips", hipsPresets],
    ["lips", lipsPresets],
    ["eyelashes", eyelashesPresets],
    ["bodyShape", bodyShapePresets],
    ["legs", legsPresets],
    ["buttocks", buttocksPresets],
    ["belly", bellyPresets],
    ["specificBody", specificBodyPresets]
  ];

  bodyCategories.forEach(
    function (entry) {

      const category =
        entry[0];

      const presets =
        entry[1];

      randomizeV14SimpleCategory(
        state,
        category,
        presets,
        config,
        manualState
      );
    }
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE APPEARANCE STAGE
// ------------------------------------------------------------

function runV14AppearanceStageSafe(
  state,
  config,
  manualState
) {

  if (
    config &&
    config.randomizeAppearance === false
  ) {

    return reapplyV14ManualSelections(
      state,
      manualState,
      config
    );
  }

  randomizeV14Appearance(
    state,
    config,
    manualState
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE HAIR STAGE
// ------------------------------------------------------------

function runV14HairStageSafe(
  state,
  config,
  manualState
) {

  if (
    config &&
    config.randomizeHair === false
  ) {

    return reapplyV14ManualSelections(
      state,
      manualState,
      config
    );
  }

  randomizeV14Hair(
    state,
    config,
    manualState
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE ACCESSORY STAGE
// ------------------------------------------------------------

function runV14AccessoryStageSafe(
  state,
  config,
  manualState
) {

  if (
    config &&
    config.randomizeAccessories === false
  ) {

    return reapplyV14ManualSelections(
      state,
      manualState,
      config
    );
  }

  randomizeV14Accessories(
    state,
    config,
    manualState
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE CLOTHING STAGE
// ------------------------------------------------------------

function runV14ClothingStageSafe(
  state,
  config,
  manualState
) {

  if (
    shouldV14PreserveCategory(
      "clothing",
      manualState,
      config
    )
  ) {

    return preserveV14ManualClothing(
      state,
      manualState
    );
  }

  if (
    config &&
    config.randomizeClothing === false
  ) {

    return state;
  }

  randomizeV14Clothing(
    state,
    config,
    manualState
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE ACTION STAGE
// ------------------------------------------------------------

function runV14ActionStageSafe(
  state,
  config,
  manualState
) {

  if (
    shouldV14PreserveCategory(
      "action",
      manualState,
      config
    )
  ) {

    return preserveV14ManualAction(
      state,
      manualState
    );
  }

  if (
    config &&
    config.randomizeAction === false
  ) {

    return state;
  }

  randomizeV14Action(
    state,
    config,
    manualState
  );

  return reapplyV14ManualSelections(
    state,
    manualState,
    config
  );
}


// ------------------------------------------------------------
// SAFE SCENE STAGE
// ------------------------------------------------------------

function runV14SceneStageSafe(
  state,
  config,
  manualState
) {

  if (
    config &&
    config.randomizeCamera !== false &&
    !v14HasManualCategory(
      manualState,
      "camera"
    )
  ) {

    if (
      typeof randomizeV14Camera ===
      "function"
    ) {

      randomizeV14Camera(
        state,
        config,
        manualState
      );
    }
  }

  if (
    config &&
    config.randomizeLighting !== false &&
    !v14HasManualCategory(
      manualState,
      "lighting"
    )
  ) {

    if (
      typeof randomizeV14Lighting ===
      "function"
    ) {

      randomizeV14Lighting(
        state,
        config,
        manualState
      );
    }
  }

  if (
    config &&
    config.randomizeTime !== false &&
    !v14HasManualCategory(
      manualState,
      "timeOfDay"
    )
  ) {

    if (
      typeof randomizeV14TimeOfDay ===
      "function"
    ) {

      randomizeV14TimeOfDay(
        state,
        config,
        manualState
      );
    }
  }

  if (
    config &&
    config.randomizeArtStyle !== false &&
    !v14HasManualCategory(
      manualState,
      "artStyle"
    )
  ) {

    if (
      typeof randomizeV14ArtStyle ===
      "function"
    ) {

      randomizeV14ArtStyle(
        state,
        config,
        manualState
      );
    }
  }

  return preserveV14ManualScene(
    state,
    manualState
  );
}


// ------------------------------------------------------------
// COMPLETE HARDENED PIPELINE
// ------------------------------------------------------------

function runV14GenerationPipelineSafe(
  state,
  config,
  manualState
) {

  const generationState =
    state ||
    createGenerationState();

  // --------------------------------------------------------
  // 1. Identity
  // --------------------------------------------------------

  runV14IdentityStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 2. Body
  // --------------------------------------------------------

  runV14BodyStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 3. Appearance
  // --------------------------------------------------------

  runV14AppearanceStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 4. Hair
  // --------------------------------------------------------

  runV14HairStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 5. Accessories
  // --------------------------------------------------------

  runV14AccessoryStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 6. Clothing
  // --------------------------------------------------------

  runV14ClothingStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 7. Action
  // --------------------------------------------------------

  runV14ActionStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 8. Scene
  // --------------------------------------------------------

  runV14SceneStageSafe(
    generationState,
    config,
    manualState
  );

  // --------------------------------------------------------
  // 9. Final manual restoration
  // --------------------------------------------------------

  reapplyV14ManualSelections(
    generationState,
    manualState,
    config
  );

  // --------------------------------------------------------
  // 10. Relationship repair
  // --------------------------------------------------------

  if (
    config &&
    config.repairInvalidSelections !== false &&
    typeof repairV14RequiredRelationships ===
    "function"
  ) {

    repairV14RequiredRelationships(
      generationState,
      config,
      manualState
    );
  }

  // --------------------------------------------------------
  // 11. Manual restoration AGAIN.
  //
  // Repair may have touched an automatic category.
  // It must never overwrite deliberate user selections.
  // --------------------------------------------------------

  reapplyV14ManualSelections(
    generationState,
    manualState,
    config
  );

  return generationState;
}


// ------------------------------------------------------------
// MAKE THE HARDENED PIPELINE AUTHORITATIVE
// ------------------------------------------------------------

function runV14GenerationPipeline(
  state,
  config,
  manualState
) {

  return runV14GenerationPipelineSafe(
    state,
    config,
    manualState
  );
}


// ------------------------------------------------------------
// PUBLIC HARDENED PIPELINE
// ------------------------------------------------------------

const V14_HARDENED_PIPELINE = {

  run:
    runV14GenerationPipelineSafe,

  preserveManual:
    reapplyV14ManualSelections,

  randomizeCategory:
    randomizeV14CategorySafely,

  protectedCategories:
    V14_MANUAL_PROTECTED_CATEGORIES
};

// =========================================
// V14 IDENTITY / AGE / MANUAL-STATE HARDENING
// =========================================
//
// This section fixes an important architectural distinction:
//
//   identity != gender
//   identity != nationality
//   age != age-range
//
// An identity preset can define several characteristics at once,
// while ordinary gender/nationality/age selections remain independent.
//
// It also restores the exact V13 age choices instead of the grouped
// age ranges that were temporarily introduced during the V14 rewrite.
// =========================================


// -----------------------------------------
// NORMALIZE AGE VALUES
// -----------------------------------------

function normalizeV14AgeValue(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const text = String(value).trim();

  const exact = V14_EXACT_AGE_PRESETS.find(
    preset =>
      preset.value === text ||
      preset.label === text ||
      String(preset.id) === text
  );

  if (exact) {
    return exact.value;
  }

  // Accept a bare number such as 35.
  const numeric = Number(text);

  if (Number.isFinite(numeric)) {
    const numericMatch = V14_EXACT_AGE_PRESETS.find(
      preset => parseInt(preset.value, 10) === numeric
    );

    if (numericMatch) {
      return numericMatch.value;
    }
  }

  return text;
}


// -----------------------------------------
// AGE LOOKUP
// -----------------------------------------

function findV14AgePreset(value) {
  const normalized = normalizeV14AgeValue(value);

  return V14_EXACT_AGE_PRESETS.find(
    preset =>
      preset.value === normalized ||
      preset.label === normalized ||
      preset.id === normalized
  ) || null;
}


// -----------------------------------------
// RANDOM AGE
// -----------------------------------------

function randomizeV14ExactAge(state) {
  const selected = randomElement(V14_EXACT_AGE_PRESETS);

  state.age = selected.value;

  return selected.value;
}


// -----------------------------------------
// IDENTITY OVERRIDE HELPERS
// -----------------------------------------

function getV14IdentityPreset(value) {
  if (!value) return null;

  if (typeof V14_IDENTITY_PRESETS === "undefined") {
    return null;
  }

  return V14_IDENTITY_PRESETS.find(
    preset =>
      preset.id === value ||
      preset.label === value ||
      preset.value === value
  ) || null;
}


function identityPresetHasOverride(preset, category) {
  if (!preset || !preset.overrides) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
    preset.overrides,
    category
  );
}


function getIdentityPresetOverride(preset, category) {
  if (!identityPresetHasOverride(preset, category)) {
    return undefined;
  }

  return preset.overrides[category];
}


// -----------------------------------------
// APPLY IDENTITY OVERRIDE
// -----------------------------------------
//
// Identity presets are deliberately applied through the same state
// object as everything else.
//
// That means later compatibility checks can see the identity choices
// instead of treating the identity preset as a completely separate
// prompt fragment.
//

function applyV14IdentityPreset(state, preset) {
  if (!state || !preset) {
    return state;
  }

  state.identity = preset.id || preset.label || preset.value || "";

  if (preset.overrides) {
    const categories = Object.keys(preset.overrides);

    for (const category of categories) {
      const value = preset.overrides[category];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        state[category] = value;
      }
    }
  }

  if (preset.gender) {
    state.gender = preset.gender;
  }

  if (preset.profile) {
    state.nationalityProfile = preset.profile;
  }

  if (preset.nationality) {
    state.nationality = preset.nationality;
  }

  return state;
}


// -----------------------------------------
// IDENTITY PRESET VALUE
// -----------------------------------------

function getV14IdentityPromptValue(state) {
  if (!state || !state.identity) {
    return "";
  }

  const preset = getV14IdentityPreset(state.identity);

  if (!preset) {
    return "";
  }

  return preset.value || "";
}


// -----------------------------------------
// IDENTITY RANDOMIZATION
// -----------------------------------------

function chooseV14IdentityPreset(state, config) {
  if (
    !state ||
    !config ||
    config.randomizationMode === "free"
  ) {
    return null;
  }

  if (
    !config.randomizeIdentity ||
    v14HasManualCategory(state, "identity")
  ) {
    return getV14IdentityPreset(state.identity);
  }

  if (
    typeof V14_IDENTITY_PRESETS === "undefined" ||
    V14_IDENTITY_PRESETS.length === 0
  ) {
    return null;
  }

  // Identity presets are deliberately selected independently.
  //
  // Their internal overrides are then fed back into the same
  // compatibility/state system as ordinary selections.

  const candidates = V14_IDENTITY_PRESETS.filter(preset => {
    if (!preset) return false;

    if (
      preset.gender &&
      isV14OptionBlocked(
        "gender",
        preset.gender,
        state
      )
    ) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  return randomElement(candidates);
}


// -----------------------------------------
// IDENTITY STAGE
// -----------------------------------------

function runV14IdentityStageHardened(state, config) {
  if (!state) {
    return createGenerationState();
  }

  // Manual identity is authoritative.
  if (v14HasManualCategory(state, "identity")) {
    const manualIdentity = getV14IdentityPreset(state.identity);

    if (manualIdentity) {
      applyV14IdentityPreset(state, manualIdentity);
    }

    return state;
  }

  if (
    config &&
    config.randomizeIdentity === true &&
    config.randomizationMode !== "free"
  ) {
    const selected = chooseV14IdentityPreset(state, config);

    if (selected) {
      applyV14IdentityPreset(state, selected);
    }
  }

  return state;
}


// -----------------------------------------
// AGE STAGE
// -----------------------------------------

function runV14AgeStageHardened(state, config) {
  if (!state) {
    return createGenerationState();
  }

  if (v14HasManualCategory(state, "age")) {
    state.age = normalizeV14AgeValue(state.age);
    return state;
  }

  if (
    config &&
    config.randomizeIdentity === true &&
    config.randomizationMode !== "free"
  ) {
    randomizeV14ExactAge(state);
  }

  return state;
}


// -----------------------------------------
// REGISTER EXACT AGE COLLECTION
// -----------------------------------------

if (typeof V14_PRESET_COLLECTIONS !== "undefined") {
  V14_PRESET_COLLECTIONS.age = V14_EXACT_AGE_PRESETS;
}


// -----------------------------------------
// IDENTITY COLLECTION
// -----------------------------------------

if (
  typeof V14_PRESET_COLLECTIONS !== "undefined" &&
  typeof V14_IDENTITY_PRESETS !== "undefined"
) {
  V14_PRESET_COLLECTIONS.identity = V14_IDENTITY_PRESETS;
}


// -----------------------------------------
// MANUAL CATEGORY NORMALIZATION
// -----------------------------------------
//
// This prevents the UI's "identity" menu from accidentally being
// interpreted as the gender category.
//
// The old temporary implementation did this:
//
//     state.gender = identitySelection;
//
// That is wrong because "identity" and "gender" are separate
// dimensions.
//

function normalizeV14ManualCategoryValue(category, value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  if (category === "age") {
    return normalizeV14AgeValue(value);
  }

  if (category === "identity") {
    const identity = getV14IdentityPreset(value);

    return identity
      ? identity.id
      : value;
  }

  return value;
}


// -----------------------------------------
// APPLY MANUAL CATEGORY
// -----------------------------------------

function applyV14ManualCategoryHardened(state, category, value) {
  if (!state || !category) {
    return state;
  }

  const normalized = normalizeV14ManualCategoryValue(
    category,
    value
  );

  if (
    normalized === undefined ||
    normalized === null ||
    normalized === ""
  ) {
    return state;
  }

  if (category === "identity") {
    state.identity = normalized;

    const identity = getV14IdentityPreset(normalized);

    if (identity) {
      applyV14IdentityPreset(state, identity);
    }

    return state;
  }

  state[category] = normalized;

  return state;
}


// -----------------------------------------
// REAPPLY MANUAL IDENTITY SAFELY
// -----------------------------------------
//
// Identity must be reapplied FIRST because it can intentionally
// establish several other state values.
//
// Ordinary manual selections are reapplied afterward so:
//
//     identity -> gender/profile/etc.
//     explicit manual trait -> wins over identity default
//

function reapplyV14ManualSelectionsHardened(state, manualState) {
  if (!state || !manualState) {
    return state;
  }

  const identityValue = manualState.identity;

  if (identityValue) {
    applyV14ManualCategoryHardened(
      state,
      "identity",
      identityValue
    );
  }

  const categories = Object.keys(manualState);

  for (const category of categories) {
    if (category === "identity") {
      continue;
    }

    const value = manualState[category];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    applyV14ManualCategoryHardened(
      state,
      category,
      value
    );
  }

  return state;
}


// -----------------------------------------
// FINAL IDENTITY / AGE NORMALIZATION
// -----------------------------------------

function normalizeV14IdentityAndAge(state) {
  if (!state) {
    return state;
  }

  if (state.age) {
    state.age = normalizeV14AgeValue(state.age);
  }

  if (state.identity) {
    const identity = getV14IdentityPreset(state.identity);

    if (identity) {
      state.identity = identity.id;
    }
  }

  return state;
}


// -----------------------------------------
// REBUILD THE HARDENED PIPELINE
// -----------------------------------------

function runV14IdentityAndAgeStages(state, config) {
  runV14IdentityStageHardened(state, config);
  runV14AgeStageHardened(state, config);

  normalizeV14IdentityAndAge(state);

  return state;
}


// -----------------------------------------
// PATCH THE SAFE PIPELINE
// -----------------------------------------
//
// Keep this as a separate function rather than rewriting the entire
// pipeline again. The final pipeline can call this immediately after
// creating the initial state and before body/appearance selection.
//

function prepareV14IdentityAndAge(state, config, manualState) {
  runV14IdentityAndAgeStages(state, config);

  if (manualState) {
    reapplyV14ManualSelectionsHardened(
      state,
      manualState
    );
  }

  normalizeV14IdentityAndAge(state);

  return state;
}


// -----------------------------------------
// PUBLIC IDENTITY / AGE API
// -----------------------------------------

const V14_IDENTITY_AGE_ENGINE = {
  exactAges: V14_EXACT_AGE_PRESETS,

  getIdentity: getV14IdentityPreset,

  getAge: findV14AgePreset,

  normalizeAge: normalizeV14AgeValue,

  randomAge: randomizeV14ExactAge,

  applyIdentity: applyV14IdentityPreset,

  normalizeState: normalizeV14IdentityAndAge,

  prepare: prepareV14IdentityAndAge
};

// =========================================
// V14 CLOTHING STATE HARDENING
// =========================================
//
// Clothing is a composed state, not a single scalar value.
//
// Examples:
//
//   ["T-Shirt", "Jeans", "Sneakers"]
//   ["Dress", "Heels"]
//   ["Bra and Panties"]
//
// Therefore manual-selection protection must never blindly do:
//
//   state.clothing = value
//
// when value represents an already-composed outfit.
//
// This section gives clothing a consistent normalized representation
// while still allowing the existing clothing engine to operate.
// =========================================


// -----------------------------------------
// CLOTHING VALUE HELPERS
// -----------------------------------------

function isV14ClothingItem(value) {
  if (!value) {
    return false;
  }

  if (typeof value === "string") {
    return true;
  }

  if (typeof value === "object") {
    return !!(
      value.id ||
      value.label ||
      value.value
    );
  }

  return false;
}


function normalizeV14ClothingItem(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.value ||
      value.label ||
      value.id ||
      ""
    );
  }

  return String(value);
}


function normalizeV14ClothingArray(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  const source = Array.isArray(value)
    ? value
    : [value];

  return source
    .map(normalizeV14ClothingItem)
    .filter(Boolean);
}


function getV14ClothingStateItems(state) {
  if (!state) {
    return [];
  }

  return normalizeV14ClothingArray(state.clothing);
}


// -----------------------------------------
// DEDUPLICATE CLOTHING
// -----------------------------------------

function uniqueV14ClothingItems(items) {
  const result = [];
  const seen = new Set();

  for (const item of normalizeV14ClothingArray(items)) {
    const key = String(item).trim().toLowerCase();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}


// -----------------------------------------
// SET CLOTHING STATE
// -----------------------------------------

function setV14ClothingState(state, items) {
  if (!state) {
    return state;
  }

  state.clothing = uniqueV14ClothingItems(items);

  state.clothingGroups = state.clothing
    .map(item => {
      const preset = findV14ClothingPreset(item);

      return preset && preset.group
        ? preset.group
        : null;
    })
    .filter(Boolean);

  return state;
}


// -----------------------------------------
// ADD ONE CLOTHING ITEM
// -----------------------------------------

function addV14ClothingStateItem(state, item) {
  if (!state || !item) {
    return state;
  }

  const current = getV14ClothingStateItems(state);

  current.push(
    normalizeV14ClothingItem(item)
  );

  return setV14ClothingState(
    state,
    current
  );
}


// -----------------------------------------
// REMOVE ONE CLOTHING ITEM
// -----------------------------------------

function removeV14ClothingStateItem(state, item) {
  if (!state || !item) {
    return state;
  }

  const target = normalizeV14ClothingItem(item)
    .toLowerCase();

  const current = getV14ClothingStateItems(state);

  return setV14ClothingState(
    state,
    current.filter(
      candidate =>
        candidate.toLowerCase() !== target
    )
  );
}


// -----------------------------------------
// FIND CLOTHING ITEM
// -----------------------------------------

function findV14ClothingPreset(value) {
  if (
    typeof V14_CLOTHING_PRESETS === "undefined" ||
    !V14_CLOTHING_PRESETS
  ) {
    return null;
  }

  const text = normalizeV14ClothingItem(value);

  if (!text) {
    return null;
  }

  return V14_CLOTHING_PRESETS.find(
    preset =>
      preset.id === text ||
      preset.label === text ||
      preset.value === text
  ) || null;
}


// -----------------------------------------
// CLOTHING GROUP LOOKUP
// -----------------------------------------

function findV14ClothingGroup(value) {
  if (
    typeof clothingGroups === "undefined" ||
    !clothingGroups
  ) {
    return null;
  }

  const text = String(value || "");

  return clothingGroups.find(
    group =>
      group.id === text ||
      group.label === text ||
      group.value === text
  ) || null;
}


// -----------------------------------------
// GET GROUP FOR ITEM
// -----------------------------------------

function getV14ClothingItemGroup(item) {
  const preset = findV14ClothingPreset(item);

  if (preset && preset.group) {
    return preset.group;
  }

  if (
    typeof clothingGroupId === "function"
  ) {
    return clothingGroupId(
      normalizeV14ClothingItem(item)
    );
  }

  return "";
}


// -----------------------------------------
// GET GROUPS FROM OUTFIT
// -----------------------------------------

function getV14ClothingGroupsFromItems(items) {
  const groups = [];

  for (
    const item of normalizeV14ClothingArray(items)
  ) {
    const group = getV14ClothingItemGroup(item);

    if (
      group &&
      !groups.includes(group)
    ) {
      groups.push(group);
    }
  }

  return groups;
}


// -----------------------------------------
// CLOTHING ROLE LOOKUP
// -----------------------------------------

function getV14ClothingRoleForItem(item) {
  const preset = findV14ClothingPreset(item);

  if (preset && preset.role) {
    return preset.role;
  }

  const group = getV14ClothingItemGroup(item);

  if (
    group &&
    typeof V14_CLOTHING_GROUP_ROLES !== "undefined"
  ) {
    return V14_CLOTHING_GROUP_ROLES[group] || "";
  }

  return "";
}


// -----------------------------------------
// OUTFIT ROLE MAP
// -----------------------------------------

function getV14OutfitRoleMap(items) {
  const map = {};

  for (
    const item of normalizeV14ClothingArray(items)
  ) {
    const role = getV14ClothingRoleForItem(item);

    if (!role) {
      continue;
    }

    if (!map[role]) {
      map[role] = [];
    }

    map[role].push(item);
  }

  return map;
}


// -----------------------------------------
// DETECT ONE-PIECE OUTFIT
// -----------------------------------------

function v14OutfitHasOnePiece(items) {
  const roles = getV14OutfitRoleMap(items);

  return (
    Array.isArray(roles.onePiece) &&
    roles.onePiece.length > 0
  );
}


// -----------------------------------------
// DETECT UNDERWEAR
// -----------------------------------------

function v14OutfitHasUnderwear(items) {
  const roles = getV14OutfitRoleMap(items);

  return (
    Array.isArray(roles.underwear) &&
    roles.underwear.length > 0
  );
}


// -----------------------------------------
// DETECT PRIMARY UPPER / LOWER
// -----------------------------------------

function v14OutfitHasUpper(items) {
  const roles = getV14OutfitRoleMap(items);

  return (
    Array.isArray(roles.upper) &&
    roles.upper.length > 0
  );
}


function v14OutfitHasLower(items) {
  const roles = getV14OutfitRoleMap(items);

  return (
    Array.isArray(roles.lower) &&
    roles.lower.length > 0
  );
}


// -----------------------------------------
// VALID OUTFIT STRUCTURE
// -----------------------------------------

function validateV14ClothingStructure(items) {
  const normalized =
    uniqueV14ClothingItems(items);

  const errors = [];
  const warnings = [];

  if (normalized.length === 0) {
    warnings.push(
      "No clothing items selected."
    );

    return {
      valid: true,
      errors,
      warnings,
      items: normalized
    };
  }

  const roles =
    getV14OutfitRoleMap(normalized);

  const hasOnePiece =
    !!(
      roles.onePiece &&
      roles.onePiece.length
    );

  const hasUpper =
    !!(
      roles.upper &&
      roles.upper.length
    );

  const hasLower =
    !!(
      roles.lower &&
      roles.lower.length
    );

  const hasOutfit =
    !!(
      roles.outfit &&
      roles.outfit.length
    );

  const hasUnderwear =
    !!(
      roles.underwear &&
      roles.underwear.length
    );

  const hasSwim =
    !!(
      roles.swim &&
      roles.swim.length
    );

  // A one-piece garment already supplies the main body
  // clothing, so an ordinary upper/lower combination is
  // not required.
  if (
    !hasOnePiece &&
    !hasOutfit &&
    !hasSwim &&
    !hasUpper &&
    !hasLower &&
    !hasUnderwear
  ) {
    warnings.push(
      "Outfit contains no recognized primary clothing role."
    );
  }

  // Do not automatically call underwear + ordinary clothing
  // invalid. Some presets intentionally allow layering.
  if (
    hasUnderwear &&
    (
      hasUpper ||
      hasLower ||
      hasOnePiece
    )
  ) {
    warnings.push(
      "Outfit contains underwear with additional clothing."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    items: normalized,
    roles: roles
  };
}


// -----------------------------------------
// CLOTHING COMPATIBILITY
// -----------------------------------------

function getV14ClothingCompatibilityReport(
  state,
  items
) {
  const normalized =
    uniqueV14ClothingItems(items);

  const blocked = [];
  const discouraged = [];
  const preferred = [];

  for (const item of normalized) {
    const preset =
      findV14ClothingPreset(item);

    const value =
      preset
        ? (
          preset.id ||
          preset.value ||
          preset.label
        )
        : item;

    const relationships =
      getV14EffectiveRelationships(
        "clothing",
        value
      );

    for (const relationship of relationships) {
      if (
        !relationship ||
        !relationship.condition
      ) {
        continue;
      }

      if (
        !relationshipConditionMatches(
          relationship.condition,
          state
        )
      ) {
        continue;
      }

      if (
        relationship.type ===
        RELATIONSHIP_TYPES.blocked
      ) {
        blocked.push(item);
      }

      if (
        relationship.type ===
        RELATIONSHIP_TYPES.discouraged
      ) {
        discouraged.push(item);
      }

      if (
        relationship.type ===
        RELATIONSHIP_TYPES.preferred
      ) {
        preferred.push(item);
      }
    }
  }

  return {
    blocked: uniqueV14ClothingItems(blocked),
    discouraged:
      uniqueV14ClothingItems(discouraged),
    preferred:
      uniqueV14ClothingItems(preferred)
  };
}


// -----------------------------------------
// FILTER INVALID CLOTHING
// -----------------------------------------

function filterV14CompatibleClothing(
  state,
  items
) {
  const normalized =
    uniqueV14ClothingItems(items);

  return normalized.filter(item => {
    const preset =
      findV14ClothingPreset(item);

    const option =
      preset
        ? (
          preset.id ||
          preset.value ||
          preset.label
        )
        : item;

    return !isV14OptionBlocked(
      "clothing",
      option,
      state
    );
  });
}


// -----------------------------------------
// REPAIR CLOTHING STATE
// -----------------------------------------

function repairV14ClothingState(state) {
  if (!state) {
    return state;
  }

  const current =
    getV14ClothingStateItems(state);

  if (current.length === 0) {
    return state;
  }

  const compatible =
    filterV14CompatibleClothing(
      state,
      current
    );

  // If every manually/randomly selected item was rejected,
  // preserve the state rather than silently inventing an outfit.
  //
  // The random clothing stage is responsible for constructing
  // a replacement outfit when randomization is enabled.
  if (compatible.length === 0) {
    return state;
  }

  setV14ClothingState(
    state,
    compatible
  );

  return state;
}


// -----------------------------------------
// MANUAL CLOTHING PROTECTION
// -----------------------------------------

function captureV14ManualClothing(state) {
  if (!state) {
    return [];
  }

  return uniqueV14ClothingItems(
    state.clothing
  );
}


function restoreV14ManualClothing(
  state,
  clothingItems
) {
  if (!state) {
    return state;
  }

  const items =
    uniqueV14ClothingItems(
      clothingItems
    );

  if (items.length > 0) {
    setV14ClothingState(
      state,
      items
    );
  }

  return state;
}


// -----------------------------------------
// HARDEN MANUAL REAPPLICATION
// -----------------------------------------
//
// This replaces the scalar assignment behavior for clothing.
//
// Other categories remain ordinary state values.
//

function applyV14ManualCategoryHardened2(
  state,
  category,
  value
) {
  if (!state || !category) {
    return state;
  }

  if (category === "clothing") {
    const items =
      normalizeV14ClothingArray(value);

    if (items.length > 0) {
      setV14ClothingState(
        state,
        items
      );
    }

    return state;
  }

  return applyV14ManualCategoryHardened(
    state,
    category,
    value
  );
}


// -----------------------------------------
// MANUAL SELECTION REAPPLICATION V2
// -----------------------------------------

function reapplyV14ManualSelectionsHardened2(
  state,
  manualState
) {
  if (!state || !manualState) {
    return state;
  }

  // Identity first.
  if (manualState.identity) {
    applyV14ManualCategoryHardened2(
      state,
      "identity",
      manualState.identity
    );
  }

  // Clothing is deliberately delayed until all identity/body
  // choices have been restored so the clothing compatibility
  // engine sees the final subject state.
  const clothing =
    manualState.clothing;

  for (const category of Object.keys(manualState)) {
    if (
      category === "identity" ||
      category === "clothing"
    ) {
      continue;
    }

    const value =
      manualState[category];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    applyV14ManualCategoryHardened(
      state,
      category,
      value
    );
  }

  if (clothing) {
    applyV14ManualCategoryHardened2(
      state,
      "clothing",
      clothing
    );
  }

  normalizeV14IdentityAndAge(state);

  return state;
}


// -----------------------------------------
// PATCH THE MANUAL-SELECTION FUNCTION
// -----------------------------------------

reapplyV14ManualSelections =
  reapplyV14ManualSelectionsHardened2;


// -----------------------------------------
// CLOTHING ENGINE PUBLIC API
// -----------------------------------------

const V14_CLOTHING_STATE_ENGINE = {
  normalizeItem:
    normalizeV14ClothingItem,

  normalizeItems:
    normalizeV14ClothingArray,

  unique:
    uniqueV14ClothingItems,

  getItems:
    getV14ClothingStateItems,

  set:
    setV14ClothingState,

  add:
    addV14ClothingStateItem,

  remove:
    removeV14ClothingStateItem,

  getGroup:
    getV14ClothingItemGroup,

  getGroups:
    getV14ClothingGroupsFromItems,

  getRoles:
    getV14OutfitRoleMap,

  validate:
    validateV14ClothingStructure,

  compatibility:
    getV14ClothingCompatibilityReport,

  filterCompatible:
    filterV14CompatibleClothing,

  repair:
    repairV14ClothingState,

  captureManual:
    captureV14ManualClothing,

  restoreManual:
    restoreV14ManualClothing
};


// -----------------------------------------
// FINAL NORMALIZATION HOOK
// -----------------------------------------

function normalizeV14ClothingBeforeGeneration(state) {
  if (!state) {
    return state;
  }

  if (state.clothing !== undefined) {
    setV14ClothingState(
      state,
      state.clothing
    );
  }

  return state;
}

// =========================================
// V14 MANUAL SELECTION + RANDOMIZATION
// FINAL STATE AUTHORITY
// =========================================
//
// This section makes one rule authoritative:
//
//     A deliberate user selection survives randomization.
//
// Randomization may use that selection to influence other choices,
// but it must not silently replace the selection itself.
//
// The compatibility engine remains responsible for deciding what
// other random choices are valid.
//
// No generation logic depends on array positions or slice().
// =========================================


// -----------------------------------------
// CATEGORY VALUE COMPARISON
// -----------------------------------------

function v14ValuesEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (
    a === undefined ||
    a === null ||
    b === undefined ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    const left = a.map(String).sort();
    const right = b.map(String).sort();

    return left.every(
      (value, index) =>
        value === right[index]
    );
  }

  return String(a) === String(b);
}


// -----------------------------------------
// MANUAL STATE VALUE
// -----------------------------------------

function getV14ManualStateValue(
  manualState,
  category
) {
  if (!manualState) {
    return undefined;
  }

  return manualState[category];
}


// -----------------------------------------
// CATEGORY HAS DELIBERATE VALUE
// -----------------------------------------

function v14ManualValueExists(
  manualState,
  category
) {
  const value =
    getV14ManualStateValue(
      manualState,
      category
    );

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return false;
  }

  if (
    Array.isArray(value) &&
    value.length === 0
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// BUILD MANUAL STATE SNAPSHOT
// -----------------------------------------

function captureV14ManualState(
  state,
  existingManualState
) {
  const manual =
    existingManualState || {};

  if (!state) {
    return manual;
  }

  // Only copy values that are already explicitly represented
  // in the manual state. This prevents automatically generated
  // values from becoming "manual" merely because they exist
  // in the generation state.
  for (const category of Object.keys(manual)) {
    if (
      state[category] !== undefined
    ) {
      manual[category] =
        state[category];
    }
  }

  if (
    manual.clothing !== undefined
  ) {
    manual.clothing =
      normalizeV14ClothingArray(
        manual.clothing
      );
  }

  return manual;
}


// -----------------------------------------
// MANUAL CATEGORY LIST
// -----------------------------------------

const V14_MANUAL_CATEGORY_ORDER = [
  "identity",
  "gender",
  "nationality",
  "age",
  "skin",
  "eyes",
  "overallBuild",
  "height",
  "chest",
  "hips",
  "lips",
  "eyelashes",
  "bodyShape",
  "legs",
  "buttocks",
  "belly",
  "specificBody",
  "makeup",
  "makeupOddities",
  "facialHair",
  "tattoos",
  "bodyDetails",
  "nails",
  "hairDetails",
  "nose",
  "hairColor",
  "hairLength",
  "hairType",
  "hairstyles",
  "accessories",
  "clothing",
  "action",
  "camera",
  "lighting",
  "timeOfDay",
  "artStyle"
];


// -----------------------------------------
// RESTORE ONE MANUAL CATEGORY
// -----------------------------------------

function restoreV14ManualCategory(
  state,
  manualState,
  category
) {
  if (
    !state ||
    !manualState ||
    !v14ManualValueExists(
      manualState,
      category
    )
  ) {
    return state;
  }

  const value =
    manualState[category];

  return applyV14ManualCategoryHardened2(
    state,
    category,
    value
  );
}


// -----------------------------------------
// RESTORE ALL MANUAL CATEGORIES
// -----------------------------------------

function restoreV14AllManualCategories(
  state,
  manualState
) {
  if (!state || !manualState) {
    return state;
  }

  // Identity goes first because an identity preset can establish
  // several underlying traits.
  restoreV14ManualCategory(
    state,
    manualState,
    "identity"
  );

  // Then restore all ordinary categories.
  for (
    const category of
    V14_MANUAL_CATEGORY_ORDER
  ) {
    if (category === "identity") {
      continue;
    }

    if (category === "clothing") {
      continue;
    }

    restoreV14ManualCategory(
      state,
      manualState,
      category
    );
  }

  // Clothing goes last because its compatibility depends on the
  // completed subject state.
  restoreV14ManualCategory(
    state,
    manualState,
    "clothing"
  );

  normalizeV14IdentityAndAge(state);
  normalizeV14ClothingBeforeGeneration(state);

  return state;
}


// -----------------------------------------
// PROTECTED CATEGORY CHECK
// -----------------------------------------

function isV14CategoryProtected(
  category,
  manualState,
  config
) {
  if (
    !manualState ||
    !v14ManualValueExists(
      manualState,
      category
    )
  ) {
    return false;
  }

  if (
    config &&
    config.preserveManualSelections === false
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// SHOULD RANDOMIZE CATEGORY
// -----------------------------------------

function shouldV14RandomizeCategory(
  category,
  config,
  manualState
) {
  if (!config) {
    return false;
  }

  if (
    config.randomizationMode === "free"
  ) {
    return true;
  }

  if (
    !config.useRelationshipEngine
  ) {
    return true;
  }

  const flagMap = {
    identity: "randomizeIdentity",
    gender: "randomizeIdentity",
    nationality: "randomizeIdentity",
    age: "randomizeIdentity",

    skin: "randomizeBody",
    eyes: "randomizeBody",
    overallBuild: "randomizeBody",
    height: "randomizeBody",
    chest: "randomizeBody",
    hips: "randomizeBody",
    lips: "randomizeBody",
    eyelashes: "randomizeBody",
    bodyShape: "randomizeBody",
    legs: "randomizeBody",
    buttocks: "randomizeBody",
    belly: "randomizeBody",
    specificBody: "randomizeBody",

    makeup: "randomizeAppearance",
    makeupOddities: "randomizeAppearance",
    facialHair: "randomizeAppearance",
    tattoos: "randomizeAppearance",
    bodyDetails: "randomizeAppearance",
    nails: "randomizeAppearance",
    hairDetails: "randomizeAppearance",
    nose: "randomizeAppearance",

    hairColor: "randomizeHair",
    hairLength: "randomizeHair",
    hairType: "randomizeHair",
    hairstyles: "randomizeHair",

    accessories: "randomizeAccessories",

    clothing: "randomizeClothing",

    action: "randomizeAction",

    camera: "randomizeCamera",
    lighting: "randomizeLighting",
    timeOfDay: "randomizeTimeOfDay",
    artStyle: "randomizeArtStyle"
  };

  const flag =
    flagMap[category];

  if (
    flag &&
    config[flag] === false
  ) {
    return false;
  }

  if (
    isV14CategoryProtected(
      category,
      manualState,
      config
    )
  ) {
    return false;
  }

  return true;
}


// -----------------------------------------
// RANDOMIZATION CATEGORY MAP
// -----------------------------------------

const V14_RANDOM_CATEGORY_MAP = {
  identity: [
    "identity",
    "gender",
    "nationality",
    "age"
  ],

  body: [
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "chest",
    "hips",
    "lips",
    "eyelashes",
    "bodyShape",
    "legs",
    "buttocks",
    "belly",
    "specificBody"
  ],

  appearance: [
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails",
    "nose"
  ],

  hair: [
    "hairColor",
    "hairLength",
    "hairType",
    "hairstyles"
  ],

  accessories: [
    "accessories"
  ],

  clothing: [
    "clothing"
  ],

  action: [
    "action"
  ],

  scene: [
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ]
};


// -----------------------------------------
// CATEGORY VALUE GETTER
// -----------------------------------------

function getV14CategoryValue(
  state,
  category
) {
  if (!state) {
    return undefined;
  }

  if (category === "clothing") {
    return getV14ClothingStateItems(
      state
    );
  }

  return state[category];
}


// -----------------------------------------
// CATEGORY VALUE SETTER
// -----------------------------------------

function setV14CategoryValue(
  state,
  category,
  value
) {
  if (!state) {
    return state;
  }

  if (category === "clothing") {
    return setV14ClothingState(
      state,
      value
    );
  }

  state[category] = value;

  return state;
}


// -----------------------------------------
// PROTECTED RANDOM PICK
// -----------------------------------------

function randomizeV14CategoryIfAllowed(
  state,
  category,
  config,
  manualState
) {
  if (
    !shouldV14RandomizeCategory(
      category,
      config,
      manualState
    )
  ) {
    return state;
  }

  if (
    category === "clothing"
  ) {
    if (
      typeof randomizeV14Clothing ===
      "function"
    ) {
      randomizeV14Clothing(
        state,
        config
      );
    }

    return state;
  }

  if (
    category === "action"
  ) {
    if (
      typeof randomizeV14Action ===
      "function"
    ) {
      randomizeV14Action(
        state,
        config
      );
    }

    return state;
  }

  if (
    category === "camera" &&
    typeof randomizeV14Camera ===
    "function"
  ) {
    state.camera =
      randomizeV14Camera(
        state,
        config
      );

    return state;
  }

  if (
    category === "lighting" &&
    typeof randomizeV14Lighting ===
    "function"
  ) {
    state.lighting =
      randomizeV14Lighting(
        state,
        config
      );

    return state;
  }

  if (
    category === "timeOfDay" &&
    typeof randomizeV14TimeOfDay ===
    "function"
  ) {
    state.timeOfDay =
      randomizeV14TimeOfDay(
        state,
        config
      );

    return state;
  }

  if (
    category === "artStyle" &&
    typeof randomizeV14ArtStyle ===
    "function"
  ) {
    state.artStyle =
      randomizeV14ArtStyle(
        state,
        config
      );

    return state;
  }

  if (
    typeof randomizeV14SimpleCategory ===
    "function"
  ) {
    randomizeV14SimpleCategory(
      state,
      category,
      config
    );
  }

  return state;
}


// -----------------------------------------
// RANDOMIZE GROUP IF ALLOWED
// -----------------------------------------

function randomizeV14CategoryGroupIfAllowed(
  state,
  groupName,
  config,
  manualState
) {
  const categories =
    V14_RANDOM_CATEGORY_MAP[
    groupName
    ];

  if (!categories) {
    return state;
  }

  for (const category of categories) {
    randomizeV14CategoryIfAllowed(
      state,
      category,
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// PRESERVE MANUAL VALUES AFTER RANDOMIZATION
// -----------------------------------------

function preserveV14ManualSelections(
  state,
  manualState,
  config
) {
  if (
    !state ||
    !manualState ||
    !config ||
    config.preserveManualSelections === false
  ) {
    return state;
  }

  return restoreV14AllManualCategories(
    state,
    manualState
  );
}


// -----------------------------------------
// REPAIR ONLY AUTOMATIC VALUES
// -----------------------------------------
//
// A repair operation must not "fix" a deliberate manual selection.
//
// If a manual selection conflicts with another manually selected
// value, the conflict is reported rather than silently changing the
// user's choice.
//

function repairV14AutomaticValues(
  state,
  manualState,
  config
) {
  if (!state) {
    return state;
  }

  const report =
    typeof validateV14GenerationState ===
      "function"
      ? validateV14GenerationState(
        state
      )
      : null;

  if (
    report &&
    report.valid
  ) {
    return state;
  }

  // First restore deliberate values.
  if (manualState) {
    restoreV14AllManualCategories(
      state,
      manualState
    );
  }

  // Clothing can safely repair only the automatically generated
  // portion. Manual clothing remains authoritative.
  if (
    !isV14CategoryProtected(
      "clothing",
      manualState,
      config
    )
  ) {
    repairV14ClothingState(state);
  }

  return state;
}


// -----------------------------------------
// FINAL STATE AUTHORITY
// -----------------------------------------

function finalizeV14StateAuthority(
  state,
  manualState,
  config
) {
  if (!state) {
    return state;
  }

  // Normalize first.
  normalizeV14IdentityAndAge(state);
  normalizeV14ClothingBeforeGeneration(state);

  // Manual values always get the last word.
  preserveV14ManualSelections(
    state,
    manualState,
    config
  );

  // Only automatically generated values are repairable.
  repairV14AutomaticValues(
    state,
    manualState,
    config
  );

  // One final restoration guarantees that a repair routine did not
  // accidentally overwrite a deliberate selection.
  preserveV14ManualSelections(
    state,
    manualState,
    config
  );

  normalizeV14IdentityAndAge(state);
  normalizeV14ClothingBeforeGeneration(state);

  return state;
}


// -----------------------------------------
// MANUAL-STATE DEBUG REPORT
// -----------------------------------------

function getV14ManualProtectionReport(
  manualState,
  config
) {
  const protectedCategories = [];
  const randomizedCategories = [];

  for (
    const category of
    V14_MANUAL_CATEGORY_ORDER
  ) {
    if (
      isV14CategoryProtected(
        category,
        manualState,
        config
      )
    ) {
      protectedCategories.push(
        category
      );
    }
  }

  for (
    const groupName of
    Object.keys(V14_RANDOM_CATEGORY_MAP)
  ) {
    for (
      const category of
      V14_RANDOM_CATEGORY_MAP[groupName]
    ) {
      if (
        shouldV14RandomizeCategory(
          category,
          config,
          manualState
        )
      ) {
        randomizedCategories.push(
          category
        );
      }
    }
  }

  return {
    protectedCategories:
      [...new Set(
        protectedCategories
      )],

    randomizedCategories:
      [...new Set(
        randomizedCategories
      )]
  };
}


// -----------------------------------------
// PUBLIC MANUAL/RANDOMIZATION ENGINE
// -----------------------------------------

const V14_STATE_AUTHORITY_ENGINE = {
  categoryOrder:
    V14_MANUAL_CATEGORY_ORDER,

  randomCategoryMap:
    V14_RANDOM_CATEGORY_MAP,

  capture:
    captureV14ManualState,

  restore:
    restoreV14AllManualCategories,

  preserve:
    preserveV14ManualSelections,

  shouldRandomize:
    shouldV14RandomizeCategory,

  randomizeCategory:
    randomizeV14CategoryIfAllowed,

  randomizeGroup:
    randomizeV14CategoryGroupIfAllowed,

  repair:
    repairV14AutomaticValues,

  finalize:
    finalizeV14StateAuthority,

  report:
    getV14ManualProtectionReport
};

// =========================================
// V14 MASTER GENERATION PIPELINE
// =========================================
//
// This is the main state-generation pipeline.
//
// Order matters:
//
//   1. Start clean
//   2. Apply deliberate identity
//   3. Randomize identity-dependent traits
//   4. Randomize body
//   5. Randomize appearance
//   6. Randomize hair
//   7. Randomize accessories
//   8. Build clothing
//   9. Build action
//  10. Build scene
//  11. Restore deliberate selections
//  12. Repair only automatic conflicts
//  13. Validate
//
// Every later stage receives the same state object, so it can see
// what earlier stages selected.
//
// This is the important difference from the old randomization
// approach: choices are state-aware rather than independently
// randomized arrays.
// =========================================


// -----------------------------------------
// CREATE CLEAN GENERATION STATE
// -----------------------------------------

function createV14CleanGenerationState() {
  const state =
    typeof createGenerationState ===
      "function"
      ? createGenerationState()
      : {};

  // Explicitly initialize the dimensions used by the V14 engine.
  //
  // These are not random selections. They are simply known empty
  // state values.

  state.identity = state.identity || "";
  state.gender = state.gender || "";
  state.nationality = state.nationality || "";
  state.nationalityProfile =
    state.nationalityProfile || "";

  state.age = state.age || "";

  state.skin = state.skin || "";
  state.eyes = state.eyes || "";

  state.overallBuild =
    state.overallBuild || "";
  state.height =
    state.height || "";
  state.chest =
    state.chest || "";
  state.hips =
    state.hips || "";
  state.lips =
    state.lips || "";
  state.eyelashes =
    state.eyelashes || "";
  state.bodyShape =
    state.bodyShape || "";
  state.legs =
    state.legs || "";
  state.buttocks =
    state.buttocks || "";
  state.belly =
    state.belly || "";
  state.specificBody =
    state.specificBody || "";

  state.makeup =
    state.makeup || "";
  state.makeupOddities =
    state.makeupOddities || "";
  state.facialHair =
    state.facialHair || "";
  state.tattoos =
    state.tattoos || "";
  state.bodyDetails =
    state.bodyDetails || "";
  state.nails =
    state.nails || "";
  state.hairDetails =
    state.hairDetails || "";
  state.nose =
    state.nose || "";

  state.hairColor =
    state.hairColor || "";
  state.hairLength =
    state.hairLength || "";
  state.hairType =
    state.hairType || "";
  state.hairstyles =
    state.hairstyles || "";

  state.accessories =
    state.accessories || [];

  state.clothing =
    state.clothing || [];
  state.clothingGroups =
    state.clothingGroups || [];

  state.action =
    state.action || "";
  state.actionGroups =
    state.actionGroups || [];

  state.camera =
    state.camera || "";
  state.lighting =
    state.lighting || "";
  state.timeOfDay =
    state.timeOfDay || "";
  state.artStyle =
    state.artStyle || "";

  state.custom =
    state.custom || "";

  return state;
}


// -----------------------------------------
// PREPARE MANUAL STATE
// -----------------------------------------

function prepareV14ManualState(
  input,
  existingManualState
) {
  let manual =
    existingManualState
      ? { ...existingManualState }
      : {};

  if (!input) {
    return manual;
  }

  // If the input already contains a manual state, use it.
  if (input.manualState) {
    manual = {
      ...manual,
      ...input.manualState
    };
  }

  // Explicitly supplied state values are treated as manual only
  // when the caller identifies them as deliberate selections.
  //
  // This prevents a generated state from accidentally becoming
  // the next generation's manual state.

  if (input.manualSelections) {
    manual = {
      ...manual,
      ...input.manualSelections
    };
  }

  if (manual.age) {
    manual.age =
      normalizeV14AgeValue(
        manual.age
      );
  }

  if (manual.identity) {
    const identity =
      getV14IdentityPreset(
        manual.identity
      );

    if (identity) {
      manual.identity =
        identity.id;
    }
  }

  if (manual.clothing) {
    manual.clothing =
      normalizeV14ClothingArray(
        manual.clothing
      );
  }

  return manual;
}


// -----------------------------------------
// APPLY MANUAL STATE BEFORE RANDOMIZATION
// -----------------------------------------

function applyV14InitialManualState(
  state,
  manualState
) {
  if (!state || !manualState) {
    return state;
  }

  // Identity first.
  if (
    v14ManualValueExists(
      manualState,
      "identity"
    )
  ) {
    applyV14ManualCategoryHardened2(
      state,
      "identity",
      manualState.identity
    );
  }

  // Then ordinary subject/body selections.
  for (
    const category of
    V14_MANUAL_CATEGORY_ORDER
  ) {
    if (
      category === "identity" ||
      category === "clothing"
    ) {
      continue;
    }

    if (
      v14ManualValueExists(
        manualState,
        category
      )
    ) {
      applyV14ManualCategoryHardened2(
        state,
        category,
        manualState[category]
      );
    }
  }

  // Clothing last.
  if (
    v14ManualValueExists(
      manualState,
      "clothing"
    )
  ) {
    applyV14ManualCategoryHardened2(
      state,
      "clothing",
      manualState.clothing
    );
  }

  normalizeV14IdentityAndAge(state);
  normalizeV14ClothingBeforeGeneration(state);

  return state;
}


// -----------------------------------------
// RANDOMIZE IDENTITY-DEPENDENT CATEGORIES
// -----------------------------------------

function runV14IdentityDependentRandomization(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  // Identity and exact age.
  runV14IdentityAndAgeStages(
    state,
    config
  );

  // Restore any deliberate identity/age values immediately.
  if (
    manualState &&
    v14ManualValueExists(
      manualState,
      "identity"
    )
  ) {
    applyV14ManualCategoryHardened2(
      state,
      "identity",
      manualState.identity
    );
  }

  if (
    manualState &&
    v14ManualValueExists(
      manualState,
      "age"
    )
  ) {
    applyV14ManualCategoryHardened2(
      state,
      "age",
      manualState.age
    );
  }

  return state;
}


// -----------------------------------------
// BODY STAGE
// -----------------------------------------

function runV14BodyStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  const categories =
    V14_RANDOM_CATEGORY_MAP.body;

  for (const category of categories) {
    if (
      !shouldV14RandomizeCategory(
        category,
        config,
        manualState
      )
    ) {
      continue;
    }

    randomizeV14CategoryIfAllowed(
      state,
      category,
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// APPEARANCE STAGE
// -----------------------------------------

function runV14AppearanceStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  const categories =
    V14_RANDOM_CATEGORY_MAP.appearance;

  for (const category of categories) {
    if (
      !shouldV14RandomizeCategory(
        category,
        config,
        manualState
      )
    ) {
      continue;
    }

    randomizeV14CategoryIfAllowed(
      state,
      category,
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// HAIR STAGE
// -----------------------------------------

function runV14HairStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  const categories =
    V14_RANDOM_CATEGORY_MAP.hair;

  for (const category of categories) {
    if (
      !shouldV14RandomizeCategory(
        category,
        config,
        manualState
      )
    ) {
      continue;
    }

    randomizeV14CategoryIfAllowed(
      state,
      category,
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// ACCESSORY STAGE
// -----------------------------------------

function runV14AccessoryStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  if (
    shouldV14RandomizeCategory(
      "accessories",
      config,
      manualState
    )
  ) {
    randomizeV14CategoryIfAllowed(
      state,
      "accessories",
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// CLOTHING STAGE
// -----------------------------------------

function runV14ClothingStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  if (
    shouldV14RandomizeCategory(
      "clothing",
      config,
      manualState
    )
  ) {
    randomizeV14CategoryIfAllowed(
      state,
      "clothing",
      config,
      manualState
    );
  }

  normalizeV14ClothingBeforeGeneration(
    state
  );

  return state;
}


// -----------------------------------------
// ACTION STAGE
// -----------------------------------------

function runV14ActionStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  if (
    shouldV14RandomizeCategory(
      "action",
      config,
      manualState
    )
  ) {
    randomizeV14CategoryIfAllowed(
      state,
      "action",
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// SCENE STAGE
// -----------------------------------------

function runV14SceneStageMaster(
  state,
  config,
  manualState
) {
  if (
    !state ||
    !config
  ) {
    return state;
  }

  const sceneCategories = [
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  for (
    const category of sceneCategories
  ) {
    if (
      !shouldV14RandomizeCategory(
        category,
        config,
        manualState
      )
    ) {
      continue;
    }

    randomizeV14CategoryIfAllowed(
      state,
      category,
      config,
      manualState
    );
  }

  return state;
}


// -----------------------------------------
// MASTER PIPELINE
// -----------------------------------------

function runV14MasterGenerationPipeline(
  input
) {
  const source =
    input || {};

  const config =
    typeof normalizeV14GenerationConfig ===
      "function"
      ? normalizeV14GenerationConfig(
        source.config || {}
      )
      : source.config || {};

  const manualState =
    prepareV14ManualState(
      source,
      source.manualState
    );

  const state =
    createV14CleanGenerationState();

  // -------------------------------------
  // PHASE 1 — DELIBERATE INPUT
  // -------------------------------------

  applyV14InitialManualState(
    state,
    manualState
  );

  // -------------------------------------
  // PHASE 2 — IDENTITY
  // -------------------------------------

  runV14IdentityDependentRandomization(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 3 — BODY
  // -------------------------------------

  runV14BodyStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 4 — APPEARANCE
  // -------------------------------------

  runV14AppearanceStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 5 — HAIR
  // -------------------------------------

  runV14HairStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 6 — ACCESSORIES
  // -------------------------------------

  runV14AccessoryStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 7 — CLOTHING
  // -------------------------------------

  runV14ClothingStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 8 — ACTION
  // -------------------------------------

  runV14ActionStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 9 — CAMERA / LIGHTING / STYLE
  // -------------------------------------

  runV14SceneStageMaster(
    state,
    config,
    manualState
  );

  // -------------------------------------
  // PHASE 10 — FINAL STATE AUTHORITY
  // -------------------------------------

  finalizeV14StateAuthority(
    state,
    manualState,
    config
  );

  // -------------------------------------
  // PHASE 11 — FINAL NORMALIZATION
  // -------------------------------------

  normalizeV14IdentityAndAge(state);
  normalizeV14ClothingBeforeGeneration(state);

  return {
    state: state,
    manualState: manualState,
    config: config
  };
}


// -----------------------------------------
// VALIDATED MASTER PIPELINE
// -----------------------------------------

function runV14ValidatedMasterPipeline(
  input
) {
  const result =
    runV14MasterGenerationPipeline(
      input
    );

  const state =
    result.state;

  let validation = null;

  if (
    typeof validateV14GenerationState ===
    "function"
  ) {
    validation =
      validateV14GenerationState(
        state
      );
  }

  return {
    ...result,
    validation: validation
  };
}


// -----------------------------------------
// SAFE MASTER PIPELINE
// -----------------------------------------

function runV14SafeMasterGenerationPipeline(
  input
) {
  try {
    const result =
      runV14ValidatedMasterPipeline(
        input
      );

    return result;
  } catch (error) {
    return {
      state:
        createV14CleanGenerationState(),

      manualState:
        prepareV14ManualState(
          input || {}
        ),

      config:
        input &&
          input.config
          ? input.config
          : {},

      validation: {
        valid: false,
        errors: [
          String(
            error &&
              error.message
              ? error.message
              : error
          )
        ],
        warnings: []
      },

      error: error
    };
  }
}


// -----------------------------------------
// MASTER PIPELINE API
// -----------------------------------------

const V14_MASTER_GENERATION_ENGINE = {
  createState:
    createV14CleanGenerationState,

  prepareManual:
    prepareV14ManualState,

  applyManual:
    applyV14InitialManualState,

  identity:
    runV14IdentityDependentRandomization,

  body:
    runV14BodyStageMaster,

  appearance:
    runV14AppearanceStageMaster,

  hair:
    runV14HairStageMaster,

  accessories:
    runV14AccessoryStageMaster,

  clothing:
    runV14ClothingStageMaster,

  action:
    runV14ActionStageMaster,

  scene:
    runV14SceneStageMaster,

  finalize:
    finalizeV14StateAuthority,

  generate:
    runV14MasterGenerationPipeline,

  validate:
    runV14ValidatedMasterPipeline,

  safeGenerate:
    runV14SafeMasterGenerationPipeline
};

// =========================================
// V14 PROMPT ASSEMBLY — FINAL STATE FORMAT
// =========================================
//
// Converts the finished generation state into the actual prompt.
//
// Important:
// The prompt builder does NOT make random decisions.
// It only describes decisions already made by the state engine.
//
// This keeps generation logic and prompt wording separate.
// =========================================


// -----------------------------------------
// GENERIC STATE VALUE
// -----------------------------------------

function getV14PromptStateValue(
  state,
  category
) {
  if (!state) {
    return "";
  }

  const value = state[category];

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (
          item &&
          typeof item === "object"
        ) {
          return (
            item.value ||
            item.label ||
            item.id ||
            ""
          );
        }

        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value.value ||
      value.label ||
      value.id ||
      ""
    );
  }

  return String(value);
}


// -----------------------------------------
// PRESET VALUE RESOLUTION
// -----------------------------------------

function getV14PromptPresetValue(
  category,
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  if (
    typeof findV14Preset ===
    "function"
  ) {
    const preset =
      findV14Preset(
        category,
        value
      );

    if (preset) {
      return getPresetValue(
        preset
      );
    }
  }

  return getV14PromptStateValue(
    { value: value },
    "value"
  );
}


// -----------------------------------------
// JOIN PROMPT PARTS
// -----------------------------------------

function joinV14PromptParts(parts) {
  return parts
    .flatMap(part => {
      if (
        Array.isArray(part)
      ) {
        return part;
      }

      return [part];
    })
    .map(part =>
      String(part || "").trim()
    )
    .filter(Boolean)
    .join(", ");
}


// -----------------------------------------
// IDENTITY DESCRIPTION
// -----------------------------------------

function buildV14IdentityDescription(
  state
) {
  if (!state) {
    return "";
  }

  const identity =
    getV14IdentityPromptValue(
      state
    );

  // Identity presets can contain their own complete descriptive
  // value. When one exists, use it as the identity anchor.
  if (identity) {
    return identity;
  }

  const parts = [];

  const age =
    getV14PromptStateValue(
      state,
      "age"
    );

  const gender =
    getV14PromptStateValue(
      state,
      "gender"
    );

  const nationality =
    getV14PromptStateValue(
      state,
      "nationality"
    );

  if (age) {
    parts.push(age);
  }

  if (gender) {
    parts.push(gender);
  }

  if (nationality) {
    parts.push(nationality);
  }

  return joinV14PromptParts(parts);
}


// -----------------------------------------
// PROFILE DESCRIPTION
// -----------------------------------------

function buildV14ProfileDescription(
  state
) {
  if (!state) {
    return "";
  }

  const profile =
    getV14PromptStateValue(
      state,
      "nationalityProfile"
    );

  // Profiles are primarily compatibility metadata.
  //
  // We intentionally do not dump the internal profile name
  // (such as "celtic" or "eastAsian") into the prompt.
  return profile
    ? ""
    : "";
}


// -----------------------------------------
// BODY DESCRIPTION
// -----------------------------------------

function buildV14BodyDescription(
  state
) {
  if (!state) {
    return "";
  }

  const categories = [
    "overallBuild",
    "height",
    "chest",
    "hips",
    "lips",
    "eyelashes",
    "bodyShape",
    "legs",
    "buttocks",
    "belly",
    "specificBody"
  ];

  const parts = [];

  for (
    const category of categories
  ) {
    const value =
      getV14PromptStateValue(
        state,
        category
      );

    if (value) {
      parts.push(value);
    }
  }

  return joinV14PromptParts(parts);
}


// -----------------------------------------
// SKIN / EYES / FACE
// -----------------------------------------

function buildV14FaceDescription(
  state
) {
  if (!state) {
    return "";
  }

  const parts = [
    getV14PromptStateValue(
      state,
      "skin"
    ),

    getV14PromptStateValue(
      state,
      "eyes"
    ),

    getV14PromptStateValue(
      state,
      "nose"
    ),

    getV14PromptStateValue(
      state,
      "lips"
    ),

    getV14PromptStateValue(
      state,
      "eyelashes"
    )
  ];

  return joinV14PromptParts(parts);
}


// -----------------------------------------
// APPEARANCE DESCRIPTION
// -----------------------------------------

function buildV14AppearanceDescription(
  state
) {
  if (!state) {
    return "";
  }

  const categories = [
    "makeup",
    "makeupOddities",
    "facialHair",
    "tattoos",
    "bodyDetails",
    "nails",
    "hairDetails"
  ];

  const parts = [];

  for (
    const category of categories
  ) {
    const value =
      getV14PromptStateValue(
        state,
        category
      );

    if (value) {
      parts.push(value);
    }
  }

  return joinV14PromptParts(parts);
}


// -----------------------------------------
// HAIR DESCRIPTION
// -----------------------------------------

function buildV14HairDescription(
  state
) {
  if (!state) {
    return "";
  }

  const parts = [
    getV14PromptStateValue(
      state,
      "hairColor"
    ),

    getV14PromptStateValue(
      state,
      "hairLength"
    ),

    getV14PromptStateValue(
      state,
      "hairType"
    ),

    getV14PromptStateValue(
      state,
      "hairstyles"
    )
  ];

  return joinV14PromptParts(parts);
}


// -----------------------------------------
// ACCESSORY DESCRIPTION
// -----------------------------------------

function buildV14AccessoryDescription(
  state
) {
  if (!state) {
    return "";
  }

  return joinV14PromptParts([
    getV14PromptStateValue(
      state,
      "accessories"
    )
  ]);
}


// -----------------------------------------
// CLOTHING DESCRIPTION
// -----------------------------------------

function buildV14ClothingDescription(
  state
) {
  if (!state) {
    return "";
  }

  const clothing =
    getV14ClothingStateItems(
      state
    );

  if (
    clothing.length === 0
  ) {
    return "";
  }

  return clothing.join(", ");
}


// -----------------------------------------
// ACTION DESCRIPTION
// -----------------------------------------

function buildV14ActionDescription(
  state
) {
  return getV14PromptStateValue(
    state,
    "action"
  );
}


// -----------------------------------------
// CAMERA DESCRIPTION
// -----------------------------------------

function buildV14CameraDescription(
  state
) {
  return getV14PromptStateValue(
    state,
    "camera"
  );
}


// -----------------------------------------
// LIGHTING DESCRIPTION
// -----------------------------------------

function buildV14LightingDescription(
  state
) {
  return joinV14PromptParts([
    getV14PromptStateValue(
      state,
      "timeOfDay"
    ),

    getV14PromptStateValue(
      state,
      "lighting"
    )
  ]);
}


// -----------------------------------------
// STYLE DESCRIPTION
// -----------------------------------------

function buildV14StyleDescription(
  state
) {
  return getV14PromptStateValue(
    state,
    "artStyle"
  );
}


// -----------------------------------------
// COMPLETE SUBJECT DESCRIPTION
// -----------------------------------------

function buildV14CompleteSubjectDescription(
  state
) {
  if (!state) {
    return "";
  }

  const sections = [
    buildV14IdentityDescription(
      state
    ),

    buildV14ProfileDescription(
      state
    ),

    buildV14BodyDescription(
      state
    ),

    buildV14FaceDescription(
      state
    ),

    buildV14AppearanceDescription(
      state
    ),

    buildV14HairDescription(
      state
    ),

    buildV14AccessoryDescription(
      state
    )
  ];

  return joinV14PromptParts(
    sections
  );
}


// -----------------------------------------
// PROMPT CLEANUP
// -----------------------------------------

function normalizeV14PromptText(
  prompt
) {
  if (!prompt) {
    return "";
  }

  return String(prompt)
    .replace(/\s+/g, " ")
    .replace(/,\s*,+/g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*$/g, "")
    .trim();
}


// -----------------------------------------
// PROMPT BUILD
// -----------------------------------------

function buildV14FinalPrompt(
  state,
  customPrompt
) {
  if (!state) {
    return "";
  }

  const subject =
    buildV14CompleteSubjectDescription(
      state
    );

  const clothing =
    buildV14ClothingDescription(
      state
    );

  const action =
    buildV14ActionDescription(
      state
    );

  const camera =
    buildV14CameraDescription(
      state
    );

  const lighting =
    buildV14LightingDescription(
      state
    );

  const style =
    buildV14StyleDescription(
      state
    );

  const parts = [];

  if (subject) {
    parts.push(
      "A photo of " + subject
    );
  } else {
    parts.push(
      DEFAULT_PROMPT_FALLBACKS.subject
    );
  }

  if (clothing) {
    parts.push(
      "wearing " + clothing
    );
  } else {
    parts.push(
      "wearing " +
      DEFAULT_PROMPT_FALLBACKS.outfit
    );
  }

  if (action) {
    parts.push(action);
  } else {
    parts.push(
      DEFAULT_PROMPT_FALLBACKS.action
    );
  }

  if (camera) {
    parts.push(camera);
  } else {
    parts.push(
      DEFAULT_PROMPT_FALLBACKS.camera
    );
  }

  if (lighting) {
    parts.push(lighting);
  } else {
    parts.push(
      DEFAULT_PROMPT_FALLBACKS.timeOfDay
    );

    parts.push(
      DEFAULT_PROMPT_FALLBACKS.lighting
    );
  }

  if (style) {
    parts.push(style);
  } else {
    parts.push(
      DEFAULT_PROMPT_FALLBACKS.artStyle
    );
  }

  if (
    customPrompt &&
    String(customPrompt).trim()
  ) {
    parts.push(
      String(customPrompt).trim()
    );
  }

  return normalizeV14PromptText(
    parts.join(", ")
  );
}


// -----------------------------------------
// NEGATIVE PROMPT
// -----------------------------------------

function buildV14NegativePrompt(
  input
) {
  if (
    input &&
    input.negativePrompt
  ) {
    return normalizeV14PromptText(
      input.negativePrompt
    );
  }

  return "";
}


// -----------------------------------------
// PROMPT RESULT
// -----------------------------------------

function buildV14PromptResult(
  state,
  input
) {
  const source =
    input || {};

  const prompt =
    buildV14FinalPrompt(
      state,
      source.customPrompt ||
      state.custom
    );

  const negativePrompt =
    buildV14NegativePrompt(
      source
    );

  return {
    prompt:
      prompt ||
      DEFAULT_PROMPT_FALLBACKS.genericPrompt,

    negativePrompt:
      negativePrompt,

    state:
      state
  };
}


// -----------------------------------------
// PROMPT VALIDATION
// -----------------------------------------

function validateV14PromptResult(
  result
) {
  const errors = [];
  const warnings = [];

  if (
    !result ||
    !result.prompt
  ) {
    errors.push(
      "Generated prompt is empty."
    );
  }

  if (
    result &&
    result.prompt &&
    result.prompt.length < 10
  ) {
    warnings.push(
      "Generated prompt is unusually short."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors:
      errors,

    warnings:
      warnings
  };
}


// -----------------------------------------
// PROMPT ENGINE
// -----------------------------------------

const V14_FINAL_PROMPT_ENGINE = {
  identity:
    buildV14IdentityDescription,

  profile:
    buildV14ProfileDescription,

  body:
    buildV14BodyDescription,

  face:
    buildV14FaceDescription,

  appearance:
    buildV14AppearanceDescription,

  hair:
    buildV14HairDescription,

  accessories:
    buildV14AccessoryDescription,

  clothing:
    buildV14ClothingDescription,

  action:
    buildV14ActionDescription,

  camera:
    buildV14CameraDescription,

  lighting:
    buildV14LightingDescription,

  style:
    buildV14StyleDescription,

  subject:
    buildV14CompleteSubjectDescription,

  build:
    buildV14FinalPrompt,

  negative:
    buildV14NegativePrompt,

  result:
    buildV14PromptResult,

  validate:
    validateV14PromptResult
};

// =========================================
// V14 QWEN REFINEMENT + FINAL REQUEST
// =========================================
//
// Qwen is a refinement stage, not a generation stage.
//
// The state engine decides WHAT exists.
// The prompt engine describes WHAT exists.
// Qwen may improve wording and coherence, but must not change
// the selected subject, traits, clothing, action, camera, or style.
//
// If no Qwen adapter is installed, the original prompt is retained.
// =========================================


// -----------------------------------------
// QWEN CONFIGURATION
// -----------------------------------------

const V14_QWEN_DEFAULT_CONFIG = {
  enabled: false,
  model:
    typeof ENHANCER_MODEL !== "undefined"
      ? ENHANCER_MODEL
      : "qwen_3.5_4b_i8x.ckpt",

  preserveState: true,
  preserveIdentity: true,
  preserveClothing: true,
  preserveAction: true,
  preserveCamera: true,
  preserveStyle: true
};


// -----------------------------------------
// NORMALIZE QWEN CONFIG
// -----------------------------------------

function normalizeV14QwenConfig(
  input
) {
  const source =
    input || {};

  return {
    ...V14_QWEN_DEFAULT_CONFIG,

    ...source,

    enabled:
      source.enabled === true,

    preserveState:
      source.preserveState !== false,

    preserveIdentity:
      source.preserveIdentity !== false,

    preserveClothing:
      source.preserveClothing !== false,

    preserveAction:
      source.preserveAction !== false,

    preserveCamera:
      source.preserveCamera !== false,

    preserveStyle:
      source.preserveStyle !== false
  };
}


// -----------------------------------------
// QWEN PROTECTED STATE
// -----------------------------------------

function buildV14QwenProtectedState(
  state
) {
  if (!state) {
    return {};
  }

  return {
    identity:
      state.identity || "",

    gender:
      state.gender || "",

    nationality:
      state.nationality || "",

    nationalityProfile:
      state.nationalityProfile || "",

    age:
      state.age || "",

    skin:
      state.skin || "",

    eyes:
      state.eyes || "",

    overallBuild:
      state.overallBuild || "",

    height:
      state.height || "",

    chest:
      state.chest || "",

    hips:
      state.hips || "",

    lips:
      state.lips || "",

    eyelashes:
      state.eyelashes || "",

    bodyShape:
      state.bodyShape || "",

    legs:
      state.legs || "",

    buttocks:
      state.buttocks || "",

    belly:
      state.belly || "",

    specificBody:
      state.specificBody || "",

    makeup:
      state.makeup || "",

    makeupOddities:
      state.makeupOddities || "",

    facialHair:
      state.facialHair || "",

    tattoos:
      state.tattoos || "",

    bodyDetails:
      state.bodyDetails || "",

    nails:
      state.nails || "",

    hairDetails:
      state.hairDetails || "",

    nose:
      state.nose || "",

    hairColor:
      state.hairColor || "",

    hairLength:
      state.hairLength || "",

    hairType:
      state.hairType || "",

    hairstyles:
      state.hairstyles || "",

    accessories:
      Array.isArray(state.accessories)
        ? [...state.accessories]
        : state.accessories || "",

    clothing:
      normalizeV14ClothingArray(
        state.clothing
      ),

    action:
      state.action || "",

    camera:
      state.camera || "",

    lighting:
      state.lighting || "",

    timeOfDay:
      state.timeOfDay || "",

    artStyle:
      state.artStyle || ""
  };
}


// -----------------------------------------
// QWEN INSTRUCTION
// -----------------------------------------

function buildV14QwenInstruction(
  state,
  prompt,
  config
) {
  const protectedState =
    buildV14QwenProtectedState(
      state
    );

  const stateSummary =
    JSON.stringify(
      protectedState
    );

  return [
    KREA2_REFINEMENT_TEMPLATE,

    "",

    "AUTHORITATIVE GENERATION STATE:",
    stateSummary,

    "",

    "CURRENT PROMPT:",
    prompt,

    "",

    "REFINEMENT RULES:",
    config.preserveState
      ? "Preserve every selected state value."
      : "",

    config.preserveIdentity
      ? "Do not change identity, gender, age, nationality, body, face, skin, eyes, or hair."
      : "",

    config.preserveClothing
      ? "Do not change, remove, replace, or add clothing."
      : "",

    config.preserveAction
      ? "Do not change the action, pose, or activity."
      : "",

    config.preserveCamera
      ? "Do not change camera position, framing, angle, or composition."
      : "",

    config.preserveStyle
      ? "Do not change lighting, time of day, or artistic style."
      : "",

    "Return only the refined final prompt."
  ]
    .filter(Boolean)
    .join("\n");
}


// -----------------------------------------
// QWEN ADAPTER
// -----------------------------------------
//
// This variable is intentionally initialized to null.
//
// The actual Draw Things/Qwen integration can install an adapter
// without changing the generation engine.
//

// -----------------------------------------
// QWEN AVAILABILITY
// -----------------------------------------

function isV14QwenAvailable() {
  return (
    typeof V14_QWEN_EXECUTE ===
    "function"
  );
}


// -----------------------------------------
// QWEN RESULT EXTRACTION
// -----------------------------------------

function extractV14QwenText(
  result
) {
  if (
    result === undefined ||
    result === null
  ) {
    return "";
  }

  if (typeof result === "string") {
    return result.trim();
  }

  if (typeof result.text === "string") {
    return result.text.trim();
  }

  if (
    typeof result.output ===
    "string"
  ) {
    return result.output.trim();
  }

  if (
    typeof result.prompt ===
    "string"
  ) {
    return result.prompt.trim();
  }

  if (
    typeof result.response ===
    "string"
  ) {
    return result.response.trim();
  }

  return "";
}


// -----------------------------------------
// CLEAN QWEN OUTPUT
// -----------------------------------------

function cleanV14QwenOutput(
  text
) {
  if (!text) {
    return "";
  }

  let cleaned =
    String(text).trim();

  // Remove common markdown wrappers.
  cleaned =
    cleaned.replace(
      /^```(?:text|markdown)?\s*/i,
      ""
    );

  cleaned =
    cleaned.replace(
      /\s*```$/i,
      ""
    );

  // Remove accidental leading labels.
  cleaned =
    cleaned.replace(
      /^(?:final prompt|refined prompt)\s*:\s*/i,
      ""
    );

  return normalizeV14PromptText(
    cleaned
  );
}


// -----------------------------------------
// QWEN STATE SAFETY CHECK
// -----------------------------------------
//
// We do not attempt semantic NLP here.
//
// Instead, verify that critical explicit values remain represented
// in the refined prompt.
//
// If a protected value disappears, fall back to the original prompt.
// This is intentionally conservative.
//

function qwenPromptContainsValue(
  prompt,
  value
) {
  if (
    !prompt ||
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return true;
  }

  const text =
    String(prompt).toLowerCase();

  const target =
    String(value).toLowerCase();

  return text.includes(target);
}


function validateV14QwenPreservation(
  state,
  originalPrompt,
  refinedPrompt,
  config
) {
  if (!config.preserveState) {
    return {
      valid: true,
      missing: []
    };
  }

  const protectedState =
    buildV14QwenProtectedState(
      state
    );

  const missing = [];

  const criticalCategories = [
    "age",
    "gender",
    "nationality",
    "skin",
    "eyes",
    "overallBuild",
    "height",
    "bodyShape",
    "hairColor",
    "hairLength",
    "hairType",
    "hairstyles",
    "action",
    "camera",
    "lighting",
    "timeOfDay",
    "artStyle"
  ];

  if (config.preserveClothing) {
    criticalCategories.push(
      "clothing"
    );
  }

  for (
    const category of
    criticalCategories
  ) {
    const value =
      protectedState[
      category
      ];

    if (
      Array.isArray(value)
    ) {
      for (
        const item of value
      ) {
        if (
          item &&
          !qwenPromptContainsValue(
            refinedPrompt,
            item
          )
        ) {
          missing.push({
            category:
              category,

            value:
              item
          });
        }
      }

      continue;
    }

    if (
      value &&
      !qwenPromptContainsValue(
        refinedPrompt,
        value
      )
    ) {
      missing.push({
        category:
          category,

        value:
          value
      });
    }
  }

  return {
    valid:
      missing.length === 0,

    missing:
      missing
  };
}


// -----------------------------------------
// EXECUTE QWEN
// -----------------------------------------

async function executeV14QwenRefinement(
  state,
  prompt,
  config
) {
  const normalizedConfig =
    normalizeV14QwenConfig(
      config
    );

  if (
    !normalizedConfig.enabled
  ) {
    return {
      prompt:
        prompt,

      usedQwen:
        false,

      skipped:
        true,

      reason:
        "Qwen refinement disabled."
    };
  }

  if (
    !isV14QwenAvailable()
  ) {
    return {
      prompt:
        prompt,

      usedQwen:
        false,

      skipped:
        true,

      reason:
        "No Qwen adapter installed."
    };
  }

  const instruction =
    buildV14QwenInstruction(
      state,
      prompt,
      normalizedConfig
    );

  try {
    const result =
      await V14_QWEN_EXECUTE(
        instruction,
        {
          model:
            normalizedConfig.model,

          state:
            buildV14QwenProtectedState(
              state
            ),

          prompt:
            prompt
        }
      );

    const refined =
      cleanV14QwenOutput(
        extractV14QwenText(
          result
        )
      );

    if (!refined) {
      return {
        prompt:
          prompt,

        usedQwen:
          false,

        skipped:
          true,

        reason:
          "Qwen returned no usable prompt."
      };
    }

    const preservation =
      validateV14QwenPreservation(
        state,
        prompt,
        refined,
        normalizedConfig
      );

    if (!preservation.valid) {
      return {
        prompt:
          prompt,

        usedQwen:
          false,

        rejected:
          true,

        reason:
          "Qwen output failed state-preservation validation.",

        missing:
          preservation.missing
      };
    }

    return {
      prompt:
        refined,

      usedQwen:
        true,

      skipped:
        false,

      preservation:
        preservation
    };
  } catch (error) {
    return {
      prompt:
        prompt,

      usedQwen:
        false,

      error:
        error,

      reason:
        "Qwen refinement failed; original prompt retained."
    };
  }
}


// -----------------------------------------
// INSTALL QWEN ADAPTER
// -----------------------------------------

function installV14QwenAdapter(
  executor
) {
  if (
    typeof executor !== "function"
  ) {
    throw new Error(
      "Qwen adapter must be a function."
    );
  }

  V14_QWEN_EXECUTE =
    executor;

  return true;
}


// -----------------------------------------
// REMOVE QWEN ADAPTER
// -----------------------------------------

function removeV14QwenAdapter() {
  V14_QWEN_EXECUTE =
    null;

  return true;
}


// -----------------------------------------
// FINAL REQUEST BUILDER
// -----------------------------------------

async function buildV14FinalGenerationRequest(
  generationResult,
  input
) {
  const source =
    input || {};

  const result =
    generationResult || {};

  const state =
    result.state ||
    source.state ||
    createV14CleanGenerationState();

  const promptResult =
    buildV14PromptResult(
      state,
      source
    );

  const qwenConfig =
    normalizeV14QwenConfig(
      source.qwen ||
      source.qwenConfig ||
      {}
    );

  const refined =
    await executeV14QwenRefinement(
      state,
      promptResult.prompt,
      qwenConfig
    );

  return {
    prompt:
      refined.prompt ||
      promptResult.prompt,

    negativePrompt:
      promptResult.negativePrompt,

    state:
      state,

    manualState:
      result.manualState ||
      source.manualState ||
      {},

    config:
      result.config ||
      source.config ||
      {},

    qwen:
      refined
  };
}


// -----------------------------------------
// FINAL REQUEST VALIDATION
// -----------------------------------------

function validateV14FinalGenerationRequest(
  request
) {
  const errors = [];
  const warnings = [];

  if (
    !request ||
    !request.prompt
  ) {
    errors.push(
      "Final generation request has no prompt."
    );
  }

  if (
    request &&
    request.state &&
    typeof validateV14GenerationState ===
    "function"
  ) {
    const stateReport =
      validateV14GenerationState(
        request.state
      );

    if (
      stateReport &&
      Array.isArray(
        stateReport.errors
      )
    ) {
      errors.push(
        ...stateReport.errors
      );
    }

    if (
      stateReport &&
      Array.isArray(
        stateReport.warnings
      )
    ) {
      warnings.push(
        ...stateReport.warnings
      );
    }
  }

  return {
    valid:
      errors.length === 0,

    errors:
      errors,

    warnings:
      warnings
  };
}


// -----------------------------------------
// PUBLIC QWEN ENGINE
// -----------------------------------------

const V14_QWEN_REFINEMENT_ENGINE = {
  defaults:
    V14_QWEN_DEFAULT_CONFIG,

  normalize:
    normalizeV14QwenConfig,

  protectedState:
    buildV14QwenProtectedState,

  instruction:
    buildV14QwenInstruction,

  available:
    isV14QwenAvailable,

  execute:
    executeV14QwenRefinement,

  install:
    installV14QwenAdapter,

  remove:
    removeV14QwenAdapter,

  validate:
    validateV14QwenPreservation,

  buildFinalRequest:
    buildV14FinalGenerationRequest,

  validateFinalRequest:
    validateV14FinalGenerationRequest
};

// ============================================================
// KREA 2 V14 — CHUNK 51
// FINAL DRAW THINGS INTEGRATION + BATCH RUNNER
// ============================================================
//
// Purpose:
//   Connect the completed V14 generation architecture to the
//   actual Draw Things execution pipeline.
//
// This layer deliberately does NOT contain generation logic.
// It consumes the final state/request produced by the engines
// above it.
//
// ============================================================

function v14FinalIntegrationIsObject(value) {
  return value !== null && typeof value === "object";
}

function v14FinalIntegrationString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function v14FinalIntegrationNumber(value, fallback) {
  var numberValue = Number(value);

  if (!isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
}

function v14FinalIntegrationClone(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return v14FinalIntegrationClone(item);
    });
  }

  if (v14FinalIntegrationIsObject(value)) {
    var result = {};

    Object.keys(value).forEach(function (key) {
      result[key] = v14FinalIntegrationClone(value[key]);
    });

    return result;
  }

  return value;
}


// ------------------------------------------------------------
// MODEL CONFIGURATION
// ------------------------------------------------------------

function v14ResolveModelConfiguration(modelSelection) {
  var requested = v14FinalIntegrationString(modelSelection);

  if (typeof getV14ModelConfig === "function") {
    var resolved = getV14ModelConfig(requested);

    if (resolved) {
      return resolved;
    }
  }

  if (typeof resolveV14ModelConfig === "function") {
    var resolvedLegacy = resolveV14ModelConfig(requested);

    if (resolvedLegacy) {
      return resolvedLegacy;
    }
  }

  if (typeof MODEL_OPTIONS !== "undefined" && Array.isArray(MODEL_OPTIONS)) {
    for (var i = 0; i < MODEL_OPTIONS.length; i++) {
      var model = MODEL_OPTIONS[i];

      if (!model) {
        continue;
      }

      if (
        model.id === requested ||
        model.label === requested ||
        model.file === requested
      ) {
        return model;
      }
    }
  }

  return null;
}


// ------------------------------------------------------------
// ASPECT CONFIGURATION
// ------------------------------------------------------------

function v14ResolveAspectConfiguration(aspectSelection) {
  var requested = v14FinalIntegrationString(aspectSelection);

  if (typeof getV14AspectConfig === "function") {
    var resolved = getV14AspectConfig(requested);

    if (resolved) {
      return resolved;
    }
  }

  if (typeof resolveV14AspectConfig === "function") {
    var resolvedLegacy = resolveV14AspectConfig(requested);

    if (resolvedLegacy) {
      return resolvedLegacy;
    }
  }

  if (typeof ASPECT_OPTIONS !== "undefined" && Array.isArray(ASPECT_OPTIONS)) {
    for (var i = 0; i < ASPECT_OPTIONS.length; i++) {
      var aspect = ASPECT_OPTIONS[i];

      if (!aspect) {
        continue;
      }

      if (
        aspect.id === requested ||
        aspect.label === requested ||
        aspect.width + "x" + aspect.height === requested
      ) {
        return aspect;
      }
    }
  }

  if (
    typeof ASPECT_DIMENSIONS !== "undefined" &&
    ASPECT_DIMENSIONS[requested]
  ) {
    return {
      id: requested,
      width: ASPECT_DIMENSIONS[requested].width,
      height: ASPECT_DIMENSIONS[requested].height
    };
  }

  return null;
}


// ------------------------------------------------------------
// DRAW THINGS CONFIGURATION
// ------------------------------------------------------------

function v14BuildDrawThingsConfiguration(request) {
  var configuration = {};

  if (!request || !v14FinalIntegrationIsObject(request)) {
    return configuration;
  }

  if (request.configuration) {
    configuration = v14FinalIntegrationClone(request.configuration);
  }

  var modelConfig = v14ResolveModelConfiguration(
    request.model ||
    request.modelId ||
    request.modelSelection
  );

  var aspectConfig = v14ResolveAspectConfiguration(
    request.aspect ||
    request.aspectId ||
    request.aspectSelection
  );

  if (modelConfig) {
    if (modelConfig.file) {
      configuration.model = modelConfig.file;
    }

    if (modelConfig.model) {
      configuration.model = modelConfig.model;
    }

    if (modelConfig.lora) {
      configuration.lora = modelConfig.lora;
    }

    if (modelConfig.loraFile) {
      configuration.lora = modelConfig.loraFile;
    }

    if (modelConfig.loraWeight !== undefined) {
      configuration.loraWeight = modelConfig.loraWeight;
    }

    if (modelConfig.loraScale !== undefined) {
      configuration.loraWeight = modelConfig.loraScale;
    }

    if (modelConfig.steps !== undefined) {
      configuration.steps = modelConfig.steps;
    }

    if (modelConfig.sampler !== undefined) {
      configuration.sampler = modelConfig.sampler;
    }
  }

  if (aspectConfig) {
    if (aspectConfig.width !== undefined) {
      configuration.width = aspectConfig.width;
    }

    if (aspectConfig.height !== undefined) {
      configuration.height = aspectConfig.height;
    }
  }

  if (request.width !== undefined) {
    configuration.width = request.width;
  }

  if (request.height !== undefined) {
    configuration.height = request.height;
  }

  return configuration;
}


// ------------------------------------------------------------
// NEGATIVE PROMPT
// ------------------------------------------------------------

function v14BuildNegativePrompt(request) {
  if (!request) {
    return "";
  }

  if (request.negativePrompt !== undefined) {
    return v14FinalIntegrationString(request.negativePrompt);
  }

  if (request.negative !== undefined) {
    return v14FinalIntegrationString(request.negative);
  }

  return "";
}


// ------------------------------------------------------------
// FINAL REQUEST NORMALIZATION
// ------------------------------------------------------------

function v14NormalizeFinalDrawThingsRequest(request) {
  var source = request || {};

  var normalized = {
    prompt: v14FinalIntegrationString(source.prompt),
    negativePrompt: v14BuildNegativePrompt(source),
    configuration: v14BuildDrawThingsConfiguration(source)
  };

  if (source.state) {
    normalized.state = v14FinalIntegrationClone(source.state);
  }

  if (source.model) {
    normalized.model = source.model;
  }

  if (source.aspect) {
    normalized.aspect = source.aspect;
  }

  return normalized;
}


// ------------------------------------------------------------
// PIPELINE DISCOVERY
// ------------------------------------------------------------

function v14GetActiveDrawThingsPipeline() {
  if (typeof pipeline !== "undefined" && pipeline) {
    return pipeline;
  }

  if (
    typeof this !== "undefined" &&
    this &&
    this.pipeline
  ) {
    return this.pipeline;
  }

  return null;
}


// ------------------------------------------------------------
// ACTUAL IMAGE EXECUTION
// ------------------------------------------------------------

async function v14ExecuteDrawThingsRequest(request) {
  var normalized = v14NormalizeFinalDrawThingsRequest(request);

  if (!normalized.prompt) {
    throw new Error("V14 cannot generate an image without a prompt.");
  }

  var activePipeline = v14GetActiveDrawThingsPipeline();

  if (!activePipeline) {
    throw new Error(
      "Draw Things pipeline is unavailable."
    );
  }

  if (typeof activePipeline.run !== "function") {
    throw new Error(
      "Draw Things pipeline does not expose a run() function."
    );
  }

  return await activePipeline.run({
    configuration: normalized.configuration,
    prompt: normalized.prompt,
    negativePrompt: normalized.negativePrompt
  });
}


// ------------------------------------------------------------
// QWEN → FINAL PROMPT
// ------------------------------------------------------------

async function v14PreparePromptForGeneration(
  state,
  prompt,
  qwenConfig
) {
  var basePrompt = v14FinalIntegrationString(prompt);

  if (!basePrompt) {
    throw new Error(
      "V14 generated an empty base prompt."
    );
  }

  if (
    typeof executeV14QwenRefinement === "function" &&
    qwenConfig &&
    qwenConfig.enabled
  ) {
    try {
      var refined = await executeV14QwenRefinement(
        state,
        basePrompt,
        qwenConfig
      );

      if (refined && typeof refined === "string") {
        return refined;
      }

      if (
        refined &&
        typeof refined.prompt === "string"
      ) {
        return refined.prompt;
      }
    } catch (error) {
      // Preserve the base prompt if refinement fails.
    }
  }

  return basePrompt;
}


// ------------------------------------------------------------
// SINGLE GENERATION
// ------------------------------------------------------------

async function v14GenerateOneFinalImage(
  generationInput
) {
  var input = generationInput || {};

  var generatedState;

  if (typeof generateV14State === "function") {
    generatedState = generateV14State(input);
  } else if (
    typeof runV14MasterGeneration === "function"
  ) {
    generatedState = await runV14MasterGeneration(input);
  } else if (
    typeof runV14GenerationPipelineSafe === "function"
  ) {
    generatedState = runV14GenerationPipelineSafe(input);
  } else {
    throw new Error(
      "V14 generation engine is unavailable."
    );
  }

  if (
    generatedState &&
    generatedState.state &&
    !generatedState.gender &&
    !generatedState.nationality
  ) {
    generatedState = generatedState.state;
  }

  var promptResult;

  if (typeof buildV14FinalPrompt === "function") {
    promptResult = buildV14FinalPrompt(
      generatedState,
      input
    );
  } else if (typeof buildPromptFromState === "function") {
    promptResult = buildPromptFromState(
      generatedState,
      input
    );
  } else {
    throw new Error(
      "V14 prompt engine is unavailable."
    );
  }

  var basePrompt =
    typeof promptResult === "string"
      ? promptResult
      : promptResult && promptResult.prompt
        ? promptResult.prompt
        : "";

  var qwenConfig =
    input.qwen ||
    input.qwenConfig ||
    {};

  var finalPrompt = await v14PreparePromptForGeneration(
    generatedState,
    basePrompt,
    qwenConfig
  );

  var finalRequest = {
    prompt: finalPrompt,
    negativePrompt:
      input.negativePrompt ||
      input.negative ||
      "",
    model:
      input.model ||
      input.modelSelection ||
      "",
    aspect:
      input.aspect ||
      input.aspectSelection ||
      "",
    state: generatedState,
    configuration:
      input.configuration || {}
  };

  return await v14ExecuteDrawThingsRequest(
    finalRequest
  );
}


// ------------------------------------------------------------
// BATCH COUNT
// ------------------------------------------------------------

function v14ResolveBatchCount(input) {
  var count = 1;

  if (input) {
    if (input.batchCount !== undefined) {
      count = input.batchCount;
    } else if (input.count !== undefined) {
      count = input.count;
    }
  }

  count = Math.floor(
    v14FinalIntegrationNumber(count, 1)
  );

  if (count < 1) {
    count = 1;
  }

  if (count > 100) {
    count = 100;
  }

  return count;
}


// ------------------------------------------------------------
// BATCH GENERATION
// ------------------------------------------------------------

async function v14GenerateBatchFinal(input) {
  var source = input || {};
  var count = v14ResolveBatchCount(source);

  var results = [];

  for (var i = 0; i < count; i++) {
    var batchInput =
      v14FinalIntegrationClone(source);

    batchInput.batchIndex = i;
    batchInput.batchCount = count;

    try {
      var result =
        await v14GenerateOneFinalImage(
          batchInput
        );

      results.push({
        index: i,
        success: true,
        result: result
      });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error &&
          error.message
          ? error.message
          : String(error)
      });
    }
  }

  return results;
}


// ------------------------------------------------------------
// GENERATION REPORT
// ------------------------------------------------------------

function v14BuildBatchReport(results) {
  var list = Array.isArray(results)
    ? results
    : [];

  var successful = 0;
  var failed = 0;

  list.forEach(function (item) {
    if (item && item.success) {
      successful++;
    } else {
      failed++;
    }
  });

  return {
    total: list.length,
    successful: successful,
    failed: failed,
    results: list
  };
}


// ------------------------------------------------------------
// PUBLIC FINAL GENERATION API
// ------------------------------------------------------------

async function runKrea2V14FinalGeneration(input) {
  var source = input || {};

  var count = v14ResolveBatchCount(source);

  if (count === 1) {
    var single =
      await v14GenerateOneFinalImage(source);

    return {
      total: 1,
      successful: 1,
      failed: 0,
      results: [
        {
          index: 0,
          success: true,
          result: single
        }
      ]
    };
  }

  var results =
    await v14GenerateBatchFinal(source);

  return v14BuildBatchReport(results);
}


// ------------------------------------------------------------
// PREVIEW — NO IMAGE GENERATION
// ------------------------------------------------------------

function v14PreviewFinalGeneration(input) {
  var source =
    v14FinalIntegrationClone(input || {});

  var state;

  if (typeof generateV14State === "function") {
    state = generateV14State(source);
  } else if (
    typeof runV14GenerationPipelineSafe === "function"
  ) {
    state =
      runV14GenerationPipelineSafe(source);
  } else {
    throw new Error(
      "V14 generation engine is unavailable."
    );
  }

  if (
    state &&
    state.state &&
    !state.gender &&
    !state.nationality
  ) {
    state = state.state;
  }

  var prompt;

  if (typeof buildV14FinalPrompt === "function") {
    prompt =
      buildV14FinalPrompt(state, source);
  } else if (
    typeof buildPromptFromState === "function"
  ) {
    prompt =
      buildPromptFromState(state, source);
  } else {
    prompt = "";
  }

  if (
    prompt &&
    typeof prompt === "object"
  ) {
    prompt = prompt.prompt || "";
  }

  return {
    state: state,
    prompt: prompt || "",
    model:
      source.model ||
      source.modelSelection ||
      "",
    aspect:
      source.aspect ||
      source.aspectSelection ||
      "",
    batchCount:
      v14ResolveBatchCount(source)
  };
}


// ------------------------------------------------------------
// FINAL PUBLIC API
// ------------------------------------------------------------

var KREA2_V14_GENERATOR = {
  version: 14,

  generate:
    runKrea2V14FinalGeneration,

  preview:
    v14PreviewFinalGeneration,

  generateOne:
    v14GenerateOneFinalImage,

  generateBatch:
    v14GenerateBatchFinal,

  buildReport:
    v14BuildBatchReport,

  normalizeRequest:
    v14NormalizeFinalDrawThingsRequest,

  buildConfiguration:
    v14BuildDrawThingsConfiguration
};


// Preserve the existing public object if one already exists.
if (
  typeof KREA2_V14 === "undefined" ||
  !KREA2_V14
) {
}

KREA2_V14.version = 14;
KREA2_V14.generate =
  runKrea2V14FinalGeneration;
KREA2_V14.preview =
  v14PreviewFinalGeneration;
KREA2_V14.generateOne =
  v14GenerateOneFinalImage;
KREA2_V14.generateBatch =
  v14GenerateBatchFinal;
KREA2_V14.finalGeneration =
  runKrea2V14FinalGeneration;


// ------------------------------------------------------------
// OPTIONAL COMPATIBILITY ALIASES
// ------------------------------------------------------------

if (
  typeof generateV14DrawThingsImage === "undefined"
) {
  var generateV14DrawThingsImage =
    v14GenerateOneFinalImage;
}

if (
  typeof runKrea2V14Final === "undefined"
) {
  var runKrea2V14Final =
    runKrea2V14FinalGeneration;
}


// ============================================================
// KREA 2 V14 — CHUNK 52
// FINAL UI ENTRY POINT + CONFIGURATION PARSER
// ============================================================

function v14UiString(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback !== undefined ? fallback : "";
  }

  return String(value);
}

function v14UiNumber(value, fallback) {
  var n = Number(value);

  if (!isFinite(n)) {
    return fallback;
  }

  return n;
}

function v14UiBoolean(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }

  return !!value;
}


// ------------------------------------------------------------
// UI OPTION HELPERS
// ------------------------------------------------------------

function v14UiModelOptions() {
  if (
    typeof MODEL_OPTIONS !== "undefined" &&
    Array.isArray(MODEL_OPTIONS)
  ) {
    return MODEL_OPTIONS.map(function (item) {
      return item.label || item.id || item.file;
    });
  }

  return [
    "Flux.2 Klein",
    "Krea 2"
  ];
}

function v14UiAspectOptions() {
  if (
    typeof ASPECT_OPTIONS !== "undefined" &&
    Array.isArray(ASPECT_OPTIONS)
  ) {
    return ASPECT_OPTIONS.map(function (item) {
      return item.label || item.id;
    });
  }

  return [
    "1:1",
    "3:4",
    "4:3",
    "16:9"
  ];
}

function v14UiAgeOptions() {
  if (
    typeof V14_EXACT_AGE_PRESETS !== "undefined" &&
    Array.isArray(V14_EXACT_AGE_PRESETS)
  ) {
    return V14_EXACT_AGE_PRESETS.map(function (item) {
      return item.label || item.value;
    });
  }

  if (
    typeof agePresets !== "undefined" &&
    Array.isArray(agePresets)
  ) {
    return agePresets.map(function (item) {
      return getPresetLabel(item);
    });
  }

  return [
    "18 years old",
    "20 years old",
    "25 years old",
    "30 years old",
    "35 years old",
    "40 years old",
    "45 years old",
    "50 years old",
    "55 years old",
    "60 years old",
    "65 years old",
    "70 years old",
    "75 years old",
    "80 years old",
    "85 years old"
  ];
}


// ------------------------------------------------------------
// SAFE MENU INDEX
// ------------------------------------------------------------

function v14UiMenuIndex(options, desired, fallback) {
  if (!Array.isArray(options)) {
    return fallback || 0;
  }

  var index = options.indexOf(desired);

  if (index >= 0) {
    return index;
  }

  return fallback || 0;
}


// ------------------------------------------------------------
// CONFIGURATION OBJECT
// ------------------------------------------------------------

function v14ParseUiConfiguration(values) {
  var v = Array.isArray(values)
    ? values
    : [];

  var switches = {
    identity:
      v14UiBoolean(v[4], true),

    body:
      v14UiBoolean(v[5], true),

    appearance:
      v14UiBoolean(v[6], true),

    hair:
      v14UiBoolean(v[7], true),

    accessories:
      v14UiBoolean(v[8], true),

    clothing:
      v14UiBoolean(v[9], true),

    action:
      v14UiBoolean(v[10], true),

    camera:
      v14UiBoolean(v[11], true),

    lighting:
      v14UiBoolean(v[12], true),

    timeOfDay:
      v14UiBoolean(v[13], true),

    artStyle:
      v14UiBoolean(v[14], true)
  };

  return {
    model:
      v14UiString(v[0], "Krea 2"),

    aspect:
      v14UiString(v[1], "1:1"),

    randomizationMode:
      v14UiString(
        v[2],
        "compatible"
      ),

    batchCount:
      Math.max(
        1,
        Math.floor(
          v14UiNumber(v[3], 1)
        )
      ),

    switches: switches,

    identity:
      v14UiString(v[15], "Random"),

    gender:
      v14UiString(v[15], "Random"),

    nationality:
      v14UiString(v[16], "Random"),

    age:
      v14UiString(v[17], "Random"),

    skin:
      v14UiString(v[18], "Random"),

    eyes:
      v14UiString(v[19], "Random"),

    overallBuild:
      v14UiString(v[20], "Random"),

    height:
      v14UiString(v[21], "Random"),

    bodyShape:
      v14UiString(v[22], "Random"),

    clothing:
      v14UiString(v[23], "Random"),

    action:
      v14UiString(v[24], "Random"),

    camera:
      v14UiString(v[25], "Random"),

    lighting:
      v14UiString(v[26], "Random"),

    timeOfDay:
      v14UiString(v[27], "Random"),

    artStyle:
      v14UiString(v[28], "Random"),

    qwenEnabled:
      v14UiBoolean(v[29], false),

    customPrompt:
      v14UiString(v[30], ""),

    negativePrompt:
      v14UiString(v[31], "")
  };
}


// ------------------------------------------------------------
// RANDOMIZATION CONFIGURATION
// ------------------------------------------------------------

function v14BuildUiGenerationConfig(ui) {
  var source = ui || {};

  var config = {
    randomizationMode:
      source.randomizationMode ||
      "compatible",

    preserveManualSelections: true,

    repairInvalidSelections: true,

    useProfileInfluence: true,

    useRelationshipEngine: true,

    preferredMultiplier: 4,

    discouragedMultiplier: 0.2,

    switches: {
      identity:
        source.switches &&
          source.switches.identity !== undefined
          ? source.switches.identity
          : true,

      body:
        source.switches &&
          source.switches.body !== undefined
          ? source.switches.body
          : true,

      appearance:
        source.switches &&
          source.switches.appearance !== undefined
          ? source.switches.appearance
          : true,

      hair:
        source.switches &&
          source.switches.hair !== undefined
          ? source.switches.hair
          : true,

      accessories:
        source.switches &&
          source.switches.accessories !== undefined
          ? source.switches.accessories
          : true,

      clothing:
        source.switches &&
          source.switches.clothing !== undefined
          ? source.switches.clothing
          : true,

      action:
        source.switches &&
          source.switches.action !== undefined
          ? source.switches.action
          : true,

      camera:
        source.switches &&
          source.switches.camera !== undefined
          ? source.switches.camera
          : true,

      lighting:
        source.switches &&
          source.switches.lighting !== undefined
          ? source.switches.lighting
          : true,

      timeOfDay:
        source.switches &&
          source.switches.timeOfDay !== undefined
          ? source.switches.timeOfDay
          : true,

      artStyle:
        source.switches &&
          source.switches.artStyle !== undefined
          ? source.switches.artStyle
          : true
    }
  };

  if (
    typeof normalizeV14GenerationConfig === "function"
  ) {
    return normalizeV14GenerationConfig(config);
  }

  return config;
}


// ------------------------------------------------------------
// MANUAL SELECTION INPUT
// ------------------------------------------------------------

function v14BuildUiManualSelections(ui) {
  var source = ui || {};

  var manual = {};

  function addIfManual(category, value) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "Random"
    ) {
      manual[category] = value;
    }
  }

  addIfManual("identity", source.identity);
  addIfManual("gender", source.gender);
  addIfManual("nationality", source.nationality);
  addIfManual("age", source.age);
  addIfManual("skin", source.skin);
  addIfManual("eyes", source.eyes);
  addIfManual(
    "overallBuild",
    source.overallBuild
  );
  addIfManual("height", source.height);
  addIfManual("bodyShape", source.bodyShape);
  addIfManual("clothing", source.clothing);
  addIfManual("action", source.action);
  addIfManual("camera", source.camera);
  addIfManual("lighting", source.lighting);
  addIfManual("timeOfDay", source.timeOfDay);
  addIfManual("artStyle", source.artStyle);

  return manual;
}


// ------------------------------------------------------------
// COMPLETE GENERATION INPUT
// ------------------------------------------------------------

function v14BuildUiGenerationInput(ui) {
  var source = ui || {};

  var config =
    v14BuildUiGenerationConfig(source);

  var manual =
    v14BuildUiManualSelections(source);

  return {
    model:
      source.model || "Krea 2",

    aspect:
      source.aspect || "1:1",

    batchCount:
      Math.max(
        1,
        Math.floor(
          v14UiNumber(
            source.batchCount,
            1
          )
        )
      ),

    config: config,

    generationConfig: config,

    manualSelections: manual,

    manualState: manual,

    identity:
      source.identity || "Random",

    gender:
      source.gender || "Random",

    nationality:
      source.nationality || "Random",

    age:
      source.age || "Random",

    skin:
      source.skin || "Random",

    eyes:
      source.eyes || "Random",

    overallBuild:
      source.overallBuild || "Random",

    height:
      source.height || "Random",

    bodyShape:
      source.bodyShape || "Random",

    clothing:
      source.clothing || "Random",

    action:
      source.action || "Random",

    camera:
      source.camera || "Random",

    lighting:
      source.lighting || "Random",

    timeOfDay:
      source.timeOfDay || "Random",

    artStyle:
      source.artStyle || "Random",

    qwen: {
      enabled:
        !!source.qwenEnabled
    },

    customPrompt:
      source.customPrompt || "",

    negativePrompt:
      source.negativePrompt || ""
  };
}


// ------------------------------------------------------------
// UI REQUEST
// ------------------------------------------------------------

async function v14RequestConfigurationFromDrawThings() {
  if (
    typeof this === "undefined" ||
    !this ||
    typeof this.requestFromUser !== "function"
  ) {
    throw new Error(
      "Draw Things requestFromUser() is unavailable."
    );
  }

  var modelOptions =
    v14UiModelOptions();

  var aspectOptions =
    v14UiAspectOptions();

  var randomizationOptions = [
    "Compatible",
    "Free"
  ];

  var genderOptions = [
    "Random",
    "Woman",
    "Man"
  ];

  var nationalityOptions = [
    "Random"
  ];

  if (
    typeof nationalityPresets !== "undefined" &&
    Array.isArray(nationalityPresets)
  ) {
    nationalityPresets.forEach(
      function (item) {
        nationalityOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var ageOptions = ["Random"].concat(
    v14UiAgeOptions()
  );

  var skinOptions = ["Random"];

  if (
    typeof skinTonePresets !== "undefined" &&
    Array.isArray(skinTonePresets)
  ) {
    skinTonePresets.forEach(
      function (item) {
        skinOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var eyeOptions = ["Random"];

  if (
    typeof eyeColorPresets !== "undefined" &&
    Array.isArray(eyeColorPresets)
  ) {
    eyeColorPresets.forEach(
      function (item) {
        eyeOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var buildOptions = ["Random"];

  if (
    typeof overallBuildPresets !== "undefined" &&
    Array.isArray(overallBuildPresets)
  ) {
    overallBuildPresets.forEach(
      function (item) {
        buildOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var heightOptions = ["Random"];

  if (
    typeof heightPresets !== "undefined" &&
    Array.isArray(heightPresets)
  ) {
    heightPresets.forEach(
      function (item) {
        heightOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var bodyShapeOptions = ["Random"];

  if (
    typeof bodyShapePresets !== "undefined" &&
    Array.isArray(bodyShapePresets)
  ) {
    bodyShapePresets.forEach(
      function (item) {
        bodyShapeOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var clothingOptions = ["Random"];

  if (
    typeof clothingPresets !== "undefined" &&
    Array.isArray(clothingPresets)
  ) {
    clothingPresets.forEach(
      function (item) {
        clothingOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var actionOptions = ["Random"];

  if (
    typeof allActionPresets !== "undefined" &&
    Array.isArray(allActionPresets)
  ) {
    allActionPresets.forEach(
      function (item) {
        actionOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var cameraOptions = ["Random"];

  if (
    typeof cameraPresets !== "undefined" &&
    Array.isArray(cameraPresets)
  ) {
    cameraPresets.forEach(
      function (item) {
        cameraOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var lightingOptions = ["Random"];

  if (
    typeof lightingPresets !== "undefined" &&
    Array.isArray(lightingPresets)
  ) {
    lightingPresets.forEach(
      function (item) {
        lightingOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var timeOptions = ["Random"];

  if (
    typeof timeOfDayPresets !== "undefined" &&
    Array.isArray(timeOfDayPresets)
  ) {
    timeOfDayPresets.forEach(
      function (item) {
        timeOptions.push(
          getPresetLabel(item)
        );
      }
    );
  }

  var styleOptions = ["Random"];

  if (
    typeof artStylePresets !== "undefined" &&
    Array.isArray(artStylePresets)
  ) {
    artStylePresets.forEach(
      function (item) {
        styleOptions.push(
          getPresetLabel(item)
        );
      }
    );
  };

  return await this.requestFromUser(
    "KREA 2 V14",
    "Generate",
    function () {
      return [
        this.section(
          "Generation"
        ),

        this.menu(
          1,
          modelOptions
        ),

        this.menu(
          0,
          aspectOptions
        ),

        this.menu(
          0,
          randomizationOptions
        ),

        this.slider(
          1,
          1,
          20,
          1
        ),

        this.section(
          "Randomization"
        ),

        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),
        this.switch(true),

        this.section(
          "Identity"
        ),

        this.menu(
          0,
          genderOptions
        ),

        this.menu(
          0,
          nationalityOptions
        ),

        this.menu(
          0,
          ageOptions
        ),

        this.menu(
          0,
          skinOptions
        ),

        this.menu(
          0,
          eyeOptions
        ),

        this.menu(
          0,
          buildOptions
        ),

        this.menu(
          0,
          heightOptions
        ),

        this.menu(
          0,
          bodyShapeOptions
        ),

        this.section(
          "Clothing"
        ),

        this.menu(
          0,
          clothingOptions
        ),

        this.section(
          "Action"
        ),

        this.menu(
          0,
          actionOptions
        ),

        this.section(
          "Scene"
        ),

        this.menu(
          0,
          cameraOptions
        ),

        this.menu(
          0,
          lightingOptions
        ),

        this.menu(
          0,
          timeOptions
        ),

        this.menu(
          0,
          styleOptions
        ),

        this.section(
          "Prompt Refinement"
        ),

        this.switch(false),

        this.textField(
          ""
        ),

        this.textField(
          ""
        )
      ];
    }
  );
}


// ------------------------------------------------------------
// PUBLIC UI RUNNER
// ------------------------------------------------------------

async function runKrea2V14DrawThings() {
  var values =
    await v14RequestConfigurationFromDrawThings.call(
      this
    );

  if (!values) {
    return null;
  }

  var ui =
    v14ParseUiConfiguration(values);

  var input =
    v14BuildUiGenerationInput(ui);

  if (
    typeof KREA2_V14_GENERATOR !== "undefined" &&
    KREA2_V14_GENERATOR &&
    typeof KREA2_V14_GENERATOR.generate ===
    "function"
  ) {
    return await KREA2_V14_GENERATOR.generate(
      input
    );
  }

  return await runKrea2V14FinalGeneration(
    input
  );
}


// ------------------------------------------------------------
// MAIN ENTRY POINT
// ------------------------------------------------------------

async function main() {
  return await runKrea2V14DrawThings.call(
    this
  );
}


// ------------------------------------------------------------
// FINAL SCRIPT ENTRY
// ------------------------------------------------------------

main();

// ============================================================
// KREA 2 V14 — CHUNK 53
// COMPATIBILITY + DATA NORMALIZATION LAYER
// ============================================================
//
// This layer sits at the very end of the script.
// It does not replace the V14 relationship engine.
//
// Its job is to:
//
//   1. Normalize old V13 preset structures.
//   2. Bridge old category names to V14 names.
//   3. Make clothing arrays safe.
//   4. Make exact-age presets authoritative.
//   5. Keep manual selections deliberate.
//   6. Prevent old helper assumptions from leaking
//      back into the V14 generation engine.
//
// ============================================================


// ------------------------------------------------------------
// CATEGORY ALIASES
// ------------------------------------------------------------

var V14_CATEGORY_ALIASES = {
  assSize: "buttocks",
  buttSize: "buttocks",
  eyeColor: "eyes",
  eyeColours: "eyes",
  skinTone: "skin",
  skinColor: "skin",
  build: "overallBuild",
  body: "bodyShape",
  hairColour: "hairColor",
  hairColor: "hairColor",
  hairStyle: "hairstyles",
  hairstyle: "hairstyles",
  accessoriesGroup: "accessories",
  accessory: "accessories",
  time: "timeOfDay",
  style: "artStyle"
};


function v14CanonicalCategory(category) {
  var key =
    v14FinalIntegrationString(category);

  if (
    V14_CATEGORY_ALIASES &&
    V14_CATEGORY_ALIASES[key]
  ) {
    return V14_CATEGORY_ALIASES[key];
  }

  return key;
}


// ------------------------------------------------------------
// SAFE PRESET VALUE
// ------------------------------------------------------------

function v14CanonicalPresetValue(preset) {
  if (
    typeof getPresetValue === "function"
  ) {
    return getPresetValue(preset);
  }

  if (
    preset &&
    typeof preset === "object"
  ) {
    if (preset.value !== undefined) {
      return preset.value;
    }

    if (preset.label !== undefined) {
      return preset.label;
    }
  }

  return v14FinalIntegrationString(
    preset
  );
}


// ------------------------------------------------------------
// SAFE PRESET LABEL
// ------------------------------------------------------------

function v14CanonicalPresetLabel(preset) {
  if (
    typeof getPresetLabel === "function"
  ) {
    return getPresetLabel(preset);
  }

  if (
    preset &&
    typeof preset === "object"
  ) {
    if (preset.label !== undefined) {
      return String(preset.label);
    }

    if (preset.value !== undefined) {
      return String(preset.value);
    }
  }

  return v14FinalIntegrationString(
    preset
  );
}


// ------------------------------------------------------------
// EXACT AGE BRIDGE
// ------------------------------------------------------------

function v14GetAuthoritativeAgePresets() {
  if (
    typeof V14_EXACT_AGE_PRESETS !== "undefined" &&
    Array.isArray(V14_EXACT_AGE_PRESETS)
  ) {
    return V14_EXACT_AGE_PRESETS;
  }

  if (
    typeof V14_AGE_PRESETS !== "undefined" &&
    Array.isArray(V14_AGE_PRESETS)
  ) {
    return V14_AGE_PRESETS;
  }

  if (
    typeof agePresets !== "undefined" &&
    Array.isArray(agePresets)
  ) {
    return agePresets;
  }

  return [];
}


function v14GetAuthoritativeAgeValue(selection) {
  var presets =
    v14GetAuthoritativeAgePresets();

  var requested =
    v14FinalIntegrationString(
      selection
    );

  if (!requested || requested === "Random") {
    return "";
  }

  for (var i = 0; i < presets.length; i++) {
    var preset = presets[i];

    if (
      requested ===
      v14CanonicalPresetLabel(preset) ||
      requested ===
      v14CanonicalPresetValue(preset) ||
      requested ===
      preset.id
    ) {
      return v14CanonicalPresetValue(
        preset
      );
    }
  }

  return requested;
}


// ------------------------------------------------------------
// SAFE OPTION COLLECTION
// ------------------------------------------------------------

function v14GetPresetCollection(category) {
  var canonical =
    v14CanonicalCategory(category);

  if (
    typeof V14_PRESET_COLLECTIONS !==
    "undefined" &&
    V14_PRESET_COLLECTIONS &&
    V14_PRESET_COLLECTIONS[canonical]
  ) {
    return V14_PRESET_COLLECTIONS[
      canonical
    ];
  }

  var fallbackMap = {
    gender: "genderPresets",
    nationality: "nationalityPresets",
    age: "agePresets",
    skin: "skinTonePresets",
    eyes: "eyeColorPresets",
    overallBuild: "overallBuildPresets",
    height: "heightPresets",
    chest: "chestPresets",
    hips: "hipPresets",
    lips: "lipsPresets",
    eyelashes: "eyelashPresets",
    bodyShape: "bodyShapePresets",
    legs: "legPresets",
    buttocks: "buttocksPresets",
    belly: "bellyPresets",
    specificBody: "specificBodyPresets",
    makeup: "makeupPresets",
    makeupOddities:
      "makeupOdditiesPresets",
    facialHair:
      "facialHairPresets",
    tattoos:
      "tattooPresets",
    bodyDetails:
      "bodyDetailPresets",
    nails:
      "nailPresets",
    hairDetails:
      "hairDetailPresets",
    nose:
      "nosePresets",
    hairColor:
      "hairColorPresets",
    hairLength:
      "hairLengthPresets",
    hairType:
      "hairTypePresets",
    hairstyles:
      "hairstylePresets",
    accessories:
      "accessoryPresets",
    clothing:
      "clothingPresets",
    action:
      "allActionPresets",
    camera:
      "cameraPresets",
    lighting:
      "lightingPresets",
    timeOfDay:
      "timeOfDayPresets",
    artStyle:
      "artStylePresets"
  };

  var variableName =
    fallbackMap[canonical];

  if (
    variableName &&
    typeof globalThis !== "undefined" &&
    globalThis[variableName] &&
    Array.isArray(
      globalThis[variableName]
    )
  ) {
    return globalThis[variableName];
  }

  return [];
}


// ------------------------------------------------------------
// FIND PRESET WITHOUT INDEX ASSUMPTIONS
// ------------------------------------------------------------

function v14FindPresetSafely(
  category,
  selection
) {
  var presets =
    v14GetPresetCollection(category);

  var requested =
    v14FinalIntegrationString(
      selection
    );

  if (!requested || requested === "Random") {
    return null;
  }

  for (var i = 0; i < presets.length; i++) {
    var preset = presets[i];

    if (!preset) {
      continue;
    }

    var id =
      preset.id !== undefined
        ? String(preset.id)
        : "";

    var label =
      v14CanonicalPresetLabel(
        preset
      );

    var value =
      v14CanonicalPresetValue(
        preset
      );

    if (
      requested === id ||
      requested === label ||
      requested === value
    ) {
      return preset;
    }
  }

  return null;
}


// ------------------------------------------------------------
// STATE CATEGORY NORMALIZATION
// ------------------------------------------------------------

function v14NormalizeStateCategories(state) {
  var source =
    state &&
      typeof state === "object"
      ? state
      : {};

  var normalized = source;

  Object.keys(
    V14_CATEGORY_ALIASES
  ).forEach(function (alias) {
    var canonical =
      V14_CATEGORY_ALIASES[alias];

    if (
      normalized[canonical] ===
      undefined &&
      normalized[alias] !== undefined
    ) {
      normalized[canonical] =
        normalized[alias];
    }
  });

  if (
    normalized.age !== undefined &&
    normalized.age !== null
  ) {
    normalized.age =
      v14GetAuthoritativeAgeValue(
        normalized.age
      );
  }

  return normalized;
}


// ------------------------------------------------------------
// CLOTHING NORMALIZATION
// ------------------------------------------------------------

function v14NormalizeFinalClothing(
  clothing
) {
  if (
    clothing === undefined ||
    clothing === null ||
    clothing === ""
  ) {
    return [];
  }

  if (Array.isArray(clothing)) {
    return clothing.filter(
      function (item) {
        return (
          item !== undefined &&
          item !== null &&
          item !== ""
        );
      }
    );
  }

  return [clothing];
}


function v14ClothingValues(
  clothing
) {
  return v14NormalizeFinalClothing(
    clothing
  ).map(function (item) {
    if (
      item &&
      typeof item === "object"
    ) {
      return (
        item.value ||
        item.label ||
        item.id ||
        ""
      );
    }

    return String(item);
  }).filter(function (value) {
    return value !== "";
  });
}


// ------------------------------------------------------------
// MANUAL CLOTHING VALUE
// ------------------------------------------------------------

function v14ResolveManualClothing(
  selection
) {
  var values =
    v14ClothingValues(
      selection
    );

  if (values.length === 0) {
    return [];
  }

  var result = [];

  values.forEach(function (value) {
    var preset =
      v14FindPresetSafely(
        "clothing",
        value
      );

    result.push(
      preset || value
    );
  });

  return result;
}


// ------------------------------------------------------------
// MANUAL SELECTION NORMALIZATION
// ------------------------------------------------------------

function v14NormalizeManualSelections(
  manual
) {
  var source =
    manual &&
      typeof manual === "object"
      ? manual
      : {};

  var result = {};

  Object.keys(source).forEach(
    function (category) {
      var canonical =
        v14CanonicalCategory(
          category
        );

      var value =
        source[category];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "Random"
      ) {
        return;
      }

      if (canonical === "age") {
        value =
          v14GetAuthoritativeAgeValue(
            value
          );
      }

      if (canonical === "clothing") {
        value =
          v14ResolveManualClothing(
            value
          );
      }

      result[canonical] = value;
    }
  );

  return result;
}


// ------------------------------------------------------------
// MANUAL STATE APPLICATION
// ------------------------------------------------------------

function v14ApplyNormalizedManualSelections(
  state,
  manual
) {
  var target =
    state &&
      typeof state === "object"
      ? state
      : {};

  var selections =
    v14NormalizeManualSelections(
      manual
    );

  Object.keys(
    selections
  ).forEach(function (category) {
    var value =
      selections[category];

    if (category === "clothing") {
      target.clothing =
        v14NormalizeFinalClothing(
          value
        );

      return;
    }

    target[category] = value;
  });

  return target;
}


// ------------------------------------------------------------
// PROFILE NORMALIZATION
// ------------------------------------------------------------

function v14NormalizeProfileName(
  profile
) {
  var value =
    v14FinalIntegrationString(
      profile
    ).trim();

  if (!value) {
    return "";
  }

  if (
    typeof normalizeV14ProfileLabel ===
    "function"
  ) {
    return normalizeV14ProfileLabel(
      value
    );
  }

  if (
    typeof PROFILE_LABEL_ALIASES !==
    "undefined" &&
    PROFILE_LABEL_ALIASES &&
    PROFILE_LABEL_ALIASES[value]
  ) {
    return PROFILE_LABEL_ALIASES[
      value
    ];
  }

  return value;
}


// ------------------------------------------------------------
// NATIONALITY → PROFILE
// ------------------------------------------------------------

function v14ResolveNationalityProfile(
  nationality
) {
  var preset =
    v14FindPresetSafely(
      "nationality",
      nationality
    );

  if (
    preset &&
    preset.profile
  ) {
    return v14NormalizeProfileName(
      preset.profile
    );
  }

  return "";
}


// ------------------------------------------------------------
// IDENTITY OVERRIDE SAFETY
// ------------------------------------------------------------

function v14IsIdentityOverridePreset(
  value
) {
  var preset =
    v14FindPresetSafely(
      "identity",
      value
    );

  return !!(
    preset &&
    preset.identityOverride
  );
}


function v14ApplyIdentityOverrideSafely(
  state,
  selection
) {
  var target =
    state &&
      typeof state === "object"
      ? state
      : {};

  if (!selection) {
    return target;
  }

  if (
    typeof applyV14IdentityOverride ===
    "function"
  ) {
    return applyV14IdentityOverride(
      target,
      selection
    );
  }

  var preset =
    v14FindPresetSafely(
      "identity",
      selection
    );

  if (!preset) {
    return target;
  }

  if (preset.gender) {
    target.gender =
      preset.gender;
  }

  if (preset.nationality) {
    target.nationality =
      preset.nationality;
  }

  if (preset.age) {
    target.age =
      preset.age;
  }

  if (preset.profile) {
    target.nationalityProfile =
      preset.profile;
  }

  if (preset.value) {
    target.identity =
      preset.value;
  }

  return target;
}


// ------------------------------------------------------------
// RELATIONSHIP SAFETY
// ------------------------------------------------------------

function v14SafeRelationshipMultiplier(
  category,
  option,
  state
) {
  if (
    typeof getV14RelationshipMultiplier ===
    "function"
  ) {
    return getV14RelationshipMultiplier(
      category,
      option,
      state
    );
  }

  return 1;
}


function v14SafeOptionBlocked(
  category,
  option,
  state
) {
  if (
    typeof isV14OptionBlocked ===
    "function"
  ) {
    return isV14OptionBlocked(
      category,
      option,
      state
    );
  }

  return false;
}


// ------------------------------------------------------------
// AUTHORITATIVE RANDOM OPTION
// ------------------------------------------------------------

function v14ChooseAuthoritativeOption(
  category,
  presets,
  state,
  profile
) {
  var list =
    Array.isArray(presets)
      ? presets
      : [];

  var candidates = [];

  for (var i = 0; i < list.length; i++) {
    var preset = list[i];

    if (!preset) {
      continue;
    }

    var option =
      v14CanonicalPresetValue(
        preset
      );

    if (!option) {
      continue;
    }

    if (
      v14SafeOptionBlocked(
        category,
        option,
        state
      )
    ) {
      continue;
    }

    var weight = 1;

    if (
      typeof getV14ProfileTraitWeightSafe ===
      "function"
    ) {
      weight *=
        getV14ProfileTraitWeightSafe(
          profile,
          category,
          preset
        );
    }

    weight *=
      v14SafeRelationshipMultiplier(
        category,
        option,
        state
      );

    if (
      !isFinite(weight) ||
      weight <= 0
    ) {
      continue;
    }

    candidates.push({
      preset: preset,
      weight: weight
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  if (
    typeof weightedPick ===
    "function"
  ) {
    return weightedPick(
      candidates.map(
        function (item) {
          return {
            value:
              item.preset,
            weight:
              item.weight
          };
        }
      )
    );
  }

  var total = 0;

  candidates.forEach(
    function (item) {
      total += item.weight;
    }
  );

  var target =
    Math.random() * total;

  for (
    var j = 0;
    j < candidates.length;
    j++
  ) {
    target -=
      candidates[j].weight;

    if (target <= 0) {
      return candidates[j].preset;
    }
  }

  return candidates[
    candidates.length - 1
  ].preset;
}


// ------------------------------------------------------------
// FINAL STATE SANITIZER
// ------------------------------------------------------------

function v14SanitizeFinalState(
  state,
  manualSelections
) {
  var result =
    v14NormalizeStateCategories(
      state || {}
    );

  result.clothing =
    v14NormalizeFinalClothing(
      result.clothing
    );

  if (
    manualSelections &&
    typeof manualSelections ===
    "object"
  ) {
    result =
      v14ApplyNormalizedManualSelections(
        result,
        manualSelections
      );
  }

  if (
    result.nationality &&
    !result.nationalityProfile
  ) {
    result.nationalityProfile =
      v14ResolveNationalityProfile(
        result.nationality
      );
  }

  return result;
}


// ------------------------------------------------------------
// FINAL REQUEST SANITIZER
// ------------------------------------------------------------

function v14SanitizeFinalRequest(
  request
) {
  var source =
    request &&
      typeof request === "object"
      ? request
      : {};

  var result =
    v14FinalIntegrationClone(
      source
    );

  if (result.state) {
    result.state =
      v14SanitizeFinalState(
        result.state,
        result.manualSelections ||
        result.manualState ||
        null
      );
  }

  result.prompt =
    v14FinalIntegrationString(
      result.prompt
    );

  result.negativePrompt =
    v14FinalIntegrationString(
      result.negativePrompt
    );

  return result;
}


// ------------------------------------------------------------
// FINAL GENERATION WRAPPER
// ------------------------------------------------------------
//
// This wrapper is intentionally assigned rather than
// redeclaring the existing generation function.
//
// That avoids another const/let declaration and keeps
// this cleanup layer safe when the previous chunks are
// pasted into one file.
//

var v14OriginalGenerateOneFinalImage =
  typeof v14GenerateOneFinalImage ===
    "function"
    ? v14GenerateOneFinalImage
    : null;


async function v14GenerateOneFinalImageSafe(
  generationInput
) {
  var input =
    v14FinalIntegrationClone(
      generationInput || {}
    );

  input.manualSelections =
    v14NormalizeManualSelections(
      input.manualSelections ||
      input.manualState ||
      {}
    );

  if (
    input.age &&
    input.age !== "Random"
  ) {
    input.age =
      v14GetAuthoritativeAgeValue(
        input.age
      );
  }

  if (
    input.nationality &&
    input.nationality !== "Random" &&
    !input.nationalityProfile
  ) {
    input.nationalityProfile =
      v14ResolveNationalityProfile(
        input.nationality
      );
  }

  if (
    input.manualSelections &&
    input.manualSelections.age
  ) {
    input.manualSelections.age =
      v14GetAuthoritativeAgeValue(
        input.manualSelections.age
      );
  }

  var result;

  if (v14OriginalGenerateOneFinalImage) {
    result =
      await v14OriginalGenerateOneFinalImage(
        input
      );
  } else {
    throw new Error(
      "V14 final generation function is unavailable."
    );
  }

  return result;
}


// ------------------------------------------------------------
// FINAL API UPDATE
// ------------------------------------------------------------

if (
  typeof KREA2_V14_GENERATOR !==
  "undefined" &&
  KREA2_V14_GENERATOR
) {
  KREA2_V14_GENERATOR.generateOne =
    v14GenerateOneFinalImageSafe;
}

if (
  typeof KREA2_V14 !== "undefined" &&
  KREA2_V14
) {
  KREA2_V14.generateOne =
    v14GenerateOneFinalImageSafe;
}


// ============================================================
// KREA 2 V14 — CHUNK 54
// FINAL REPAIR + LAUNCH LAYER
// ============================================================
//
// This is the final defensive layer.
//
// It fixes the remaining integration problems without
// introducing another generation/randomization architecture.
//
// ============================================================


// ------------------------------------------------------------
// SAFE FUNCTION LOOKUP
// ------------------------------------------------------------

function v14LaunchFunctionExists(name) {
  return (
    typeof globalThis !== "undefined" &&
    typeof globalThis[name] === "function"
  );
}


// ------------------------------------------------------------
// NORMALIZE UI INPUT BEFORE GENERATION
// ------------------------------------------------------------

function v14NormalizeLaunchInput(input) {
  var source =
    input &&
      typeof input === "object"
      ? input
      : {};

  var result =
    v14FinalIntegrationClone(
      source
    );

  if (!result.config) {
    result.config =
      result.generationConfig ||
      {};
  }

  if (!result.generationConfig) {
    result.generationConfig =
      result.config;
  }

  if (!result.manualSelections) {
    result.manualSelections =
      result.manualState ||
      {};
  }

  result.manualSelections =
    v14NormalizeManualSelections(
      result.manualSelections
    );

  result.manualState =
    result.manualSelections;

  if (
    result.age &&
    result.age !== "Random"
  ) {
    result.age =
      v14GetAuthoritativeAgeValue(
        result.age
      );
  }

  if (
    result.manualSelections.age
  ) {
    result.manualSelections.age =
      v14GetAuthoritativeAgeValue(
        result.manualSelections.age
      );
  }

  if (
    result.nationality &&
    result.nationality !== "Random" &&
    !result.nationalityProfile
  ) {
    result.nationalityProfile =
      v14ResolveNationalityProfile(
        result.nationality
      );
  }

  result.batchCount =
    Math.max(
      1,
      Math.min(
        100,
        Math.floor(
          v14UiNumber(
            result.batchCount,
            1
          )
        )
      )
    );

  return result;
}


// ------------------------------------------------------------
// SAFE GENERATION INPUT
// ------------------------------------------------------------

function v14BuildSafeGenerationInput(
  input
) {
  var normalized =
    v14NormalizeLaunchInput(
      input
    );

  if (
    typeof normalizeV14GenerationConfig ===
    "function"
  ) {
    normalized.config =
      normalizeV14GenerationConfig(
        normalized.config
      );

    normalized.generationConfig =
      normalized.config;
  }

  return normalized;
}


// ------------------------------------------------------------
// PREVIEW INPUT
// ------------------------------------------------------------

function v14BuildLaunchPreview(
  input
) {
  var safeInput =
    v14BuildSafeGenerationInput(
      input
    );

  if (
    typeof v14PreviewFinalGeneration ===
    "function"
  ) {
    return v14PreviewFinalGeneration(
      safeInput
    );
  }

  return {
    state: null,
    prompt: "",
    model:
      safeInput.model || "",
    aspect:
      safeInput.aspect || "",
    batchCount:
      safeInput.batchCount
  };
}


// ------------------------------------------------------------
// FINAL GENERATION ENTRY
// ------------------------------------------------------------

async function v14LaunchGeneration(
  input
) {
  var safeInput =
    v14BuildSafeGenerationInput(
      input
    );

  return await runKrea2V14FinalGeneration(
    safeInput
  );
}


// ------------------------------------------------------------
// FINAL PREVIEW ENTRY
// ------------------------------------------------------------

function v14LaunchPreview(
  input
) {
  return v14BuildLaunchPreview(
    input
  );
}


// ------------------------------------------------------------
// FINAL PUBLIC ENGINE
// ------------------------------------------------------------

var KREA2_V14_FINAL_ENGINE = {
  version: 14,

  generate:
    v14LaunchGeneration,

  preview:
    v14LaunchPreview,

  normalizeInput:
    v14NormalizeLaunchInput,

  buildInput:
    v14BuildSafeGenerationInput
};


// ------------------------------------------------------------
// UPDATE PUBLIC OBJECTS
// ------------------------------------------------------------

if (
  typeof KREA2_V14 !== "undefined" &&
  KREA2_V14
) {
  KREA2_V14.version = 14;

  KREA2_V14.generate =
    v14LaunchGeneration;

  KREA2_V14.preview =
    v14LaunchPreview;

  KREA2_V14.engine =
    KREA2_V14_FINAL_ENGINE;
}

if (
  typeof KREA2_V14_GENERATOR !==
  "undefined" &&
  KREA2_V14_GENERATOR
) {
  KREA2_V14_GENERATOR.version = 14;

  KREA2_V14_GENERATOR.generate =
    v14LaunchGeneration;

  KREA2_V14_GENERATOR.preview =
    v14LaunchPreview;
}


// ------------------------------------------------------------
// DEBUG INFORMATION
// ------------------------------------------------------------

function v14GetFinalArchitectureStatus() {
  return {
    version: 14,

    relationshipEngine:
      typeof getV14RelationshipMultiplier ===
      "function",

    clothingEngine:
      typeof randomizeV14Clothing ===
      "function" ||
      typeof runV14ClothingStage ===
      "function",

    actionEngine:
      typeof randomizeV14Action ===
      "function" ||
      typeof runV14ActionStage ===
      "function",

    promptEngine:
      typeof buildV14FinalPrompt ===
      "function",

    qwenEngine:
      typeof executeV14QwenRefinement ===
      "function",

    drawThingsPipeline:
      typeof pipeline !== "undefined" &&
      !!pipeline,

    exactAgePresets:
      typeof V14_EXACT_AGE_PRESETS !==
      "undefined" &&
      Array.isArray(
        V14_EXACT_AGE_PRESETS
      ),

    identityPresets:
      typeof V14_IDENTITY_PRESETS !==
      "undefined" &&
      Array.isArray(
        V14_IDENTITY_PRESETS
      ),

    generator:
      typeof v14LaunchGeneration ===
      "function"
  };
}


// ------------------------------------------------------------
// FINAL DEBUG API
// ------------------------------------------------------------

if (
  typeof V14_DIAGNOSTICS !==
  "undefined" &&
  V14_DIAGNOSTICS
) {
  V14_DIAGNOSTICS.architecture =
    v14GetFinalArchitectureStatus;
}


// ------------------------------------------------------------
// IMPORTANT:
//
// Chunk 52 contained the original main() call.
// We intentionally do NOT call main() here again.
//
// The final launch layer is already installed.
// Calling main() a second time would open the UI twice.
//
// ============================================================
// END CHUNK 54
// ============================================================
