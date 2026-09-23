//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================

// =========================================
// PRESET LISTS
// =========================================

const gender = [
    "woman"
];

// --- NATIONALITY / ETHNICITY ---

const nationalityPresets = [
    {
        label: "Caucasian",
        value: "with Western European facial features",
        hairColors: ["blonde", "brunette", "black", "ginger", "ombre", "balayage"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
        ,
    {
        label: "Black",
        value: "with rich deep skin tone and classic African facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["rich mocha", "brown", "dark brown", "black", "dark glossy black"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican facial features, dark brown eyes, thick dark eyebrows, thick wavy hair, plump lips, and a curvy hourglass figure",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm olive tan", "sun-darkened"],
        eyeColors: ["dark brown", "black", "light brown"]
        ,
    {
        label: "Mixed-Race",
        value: "with a natural blend of African and European facial features, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick hair with thick wavy curls, a curvy hourglass figure, and a round ass",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "warm olive"],
        eyeColors: ["blue", "dark brown", " light brown", "hazel"]
        ,
    {
        label: "Indian",
        value: "with dark eyes, and South Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "dark tan", "warm brown"],
        eyeColors: ["black", "dark brown"]
        ,
    {
        label: "Thai",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "golden-tan"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Japanese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "porcelain"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Korean",
        value: "with fair porcelain skin and East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "porcelain", "light"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Filipina",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "deep golden-bronze"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Brazilian",
        value: "with a blend of European, African, and Indigenous features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["sun-kissed olive", "deep golden-bronze"],
        eyeColors: ["dark brown", "black", "light brown", "hazel", "green"]
        ,
    {
        label: "Italian",
        value: "with Mediterranean facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["sun-kissed olive", "rich golden hue"],
        eyeColors: ["brown", "blue", "green"]
        ,
    {
        label: "Scandinavian",
        value: "with Nordic facial features",
        hairColors: ["blonde"],
        skinTones: ["fair", "light"],
        eyeColors: ["blue", "hazel"]
        ,
    {
        label: "Russian/Eastern European",
        value: "with Slavic facial features",
        hairColors: ["blonde", "light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"],
        eyeColors: ["blue", "brown"]
        ,
    {
        label: "Chinese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "olive"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Vietnamese",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "olive", "sun-kissed tan"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Middle Eastern",
        value: "with Middle Eastern facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["olive", "dark"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "French",
        value: "with classic Western European features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"],
        eyeColors: ["blue", "brown", "hazel"]
        ,
    {
        label: "German",
        value: "with Central European facial features",
        hairColors: ["blonde", "light brown", "dark brown"],
        skinTones: ["fair", "light", "porcelain"],
        eyeColors: ["blue", "hazel", "brown"]
        ,
    {
        label: "Irish",
        value: "with freckles and Celtic facial features",
        hairColors: ["ginger", "blonde", "light brown", "dark brown"],
        skinTones: ["porcelain", "fair", "light"],
        eyeColors: ["blue", "hazel", "brown"]
        ,
    {
        label: "Native American",
        value: "with Indigenous American facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm bronze", "sun-kissed olive"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Polynesian/Pacific Islander",
        value: "with Polynesian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm brown", "sun-kissed olive"],
        eyeColors: ["dark brown", "black"]
        ,
    {
        label: "Ethiopian/East African",
        value: "with East African facial features",
        hairColors: ["dark brown", "black", "dark glossy black"],
        skinTones: ["deep brown", "black", "deep glossy black"],
        eyeColors: ["dark brown", "black"]
        ,
];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];

// --- EYE COLOR ---
const eyeColorPresets = [
    { label: "Blue", value: "blue eyes",
    { label: "Green", value: "green eyes",
    { label: "Hazel", value: "hazel eyes",
    { label: "Brown", value: "brown eyes",
    { label: "Dark brown", value: "dark brown eyes",
    { label: "Amber", value: "amber eyes",
    { label: "Gray", value: "gray eyes",
    { label: "Violet", value: "violet eyes",
    { label: "Heterochromia (blue/brown)", value: "eyes that have heterochromia, one eye blue, the other eye brown" }
];

// =========================================
// BODY / PHYSIQUE
// =========================================

const overallBuildPresets = [
    { label: "Slim build", value: "slim build",
    { label: "Soft Fit Frame", value: "toned athletic frame softened by naturally feminine curves, visible but subtle muscle definition",
    { label: "Average build", value: "average build",
    { label: "Petite build", value: "petite build with a small overall frame, narrow hips, short stature, narrow shoulders, thin legs, and flat belly",
    { label: "Curvy build", value: "curvy build with naturally pronounced feminine curves",
    { label: "Muscular build", value: "muscular build with clearly developed musculature",
    { label: "Chubby build", value: "chubby build with a softer, fuller physique",
    { label: "Large frame", value: "large frame with broad shoulders, thick limbs, and a tall, imposing build" }
];

const heightPresets = [
    { label: "Short", value: "short stature with naturally proportioned overall body proportions",
    { label: "Average", value: "average height and proportions",
    { label: "Tall", value: "tall stature, noticeably above-average height, long legs and naturally elongated overall proportions" }
];

const specificBodyPresets = [
    { label: "No specific characteristic", value: "",
    { label: "Adult with achondroplasia", value: "adult with achondroplasia, characteristic short stature and naturally proportioned body",
    { label: "Pregnant", value: "pregnant adult with a visibly rounded pregnant belly",
    { label: "Heavily pregnant", value: "heavily pregnant adult with a large, prominently rounded late-stage pregnancy belly" }
];

const outfitPresets = [
    "a loose fitting T-shirt and bikini panties",
    "a pushup bra, bikini panties, and thigh-high Hello Kitty tube socks",
    "a string bikini with thigh-high leather boots",
    "a halter top and pleated shorts",
    "a silk pajama short set",
    "a lace bustier, garter belt, thigh-high stockings and stiletto heels",
    "an unbuttoned mens dress shirt",
    "a tank top and a wrap-around skirt",
    "a short babydoll dress with cowboy boots",
    "a racy sexy wedding dress",
    "a full-length evening gown",
    "a lowcut full-length sheer dress with side pockets",
    "cut-out dress with a side slit from her waist down",
    "black French maid uniform with short pleated skirt and white collar and stiletto heels",
    "Hooters uniform with a tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts",
    "a schoolgirl uniform with a short pleated skirt and thigh-high white socks. The shirt is unbuttoned down to her navel, revealing deep cleavage.",
    "a sexy nurse's uniform, showing ample cleavage, and a nurse's cap",
    "1940s WWII-era women's ensemble: A-line tea dress with a fitted waist, padded shoulders, and Victory Roll hairstyle",
    "1940s WWII-style leather flight jacket worn over a white dress",
    "1940s-style navy sailor uniform with a white collar and navy tie",
    "1960s Mod shift dress with a geometric pattern, bold graphic print, and knee-length hem",
    "1960s cocktail dress with a fitted bodice, flared A-line skirt, and elbow-length gloves",
    "1960s beatnik turtleneck paired with high-waisted slacks",
    "1960s go-go dress with white go-go boots",
    "1960s pillbox hat and tailored suit ensemble with a boxy jacket and pencil skirt"

];

const actionPresets = [
    "laying on a beach",
    "standing, looking away from the camera",
    "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms raised high above head and hands clasped, lips parted.",
    "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms at {possessive} sides, pressed against the wall, lips parted.",
    "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing {possessive} ass toward the camera",
    "standing at the edge of a bed, leaning forward, feet on floor, one cheek touching the bed, looking to the side at the camera, pushing {possessive} ass toward the camera",
    "on {possessive} knees, leaning forward, {possessive} face in the foreground, back arched, ass high in the air, arms stretched out in front of {objectPronoun}",
    "worms-eye view, squatting with {possessive} knees spread wide and on the tips of {possessive} toes, hands resting on {possessive} knees",
    "sitting cross-legged on the floor, leaning back slightly on {possessive} hands, looking directly into the camera with a relaxed smile",
    "laying on {possessive} back with {possessive} legs raised and spread wide, feet wide apart, holding {possessive} legs in the air with {possessive} hands, looking through {possessive} open legs at the camera",
    "laying on a bed on {possessive} back with {possessive} butt at the edge of the bed, {possessive} legs straight and elevated into the air, knees locked, bending at waist only",
    "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with {possessive} hand covering {possessive} mouth and wide-eyed open-mouthed look of surprise",
    "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below {objectPronoun} looking up",
    "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly above {objectPronoun} looking down",
    "standing and rubbing soapy lather all over a man's nude body in the shower with a soapy loofah, water streaming out of the showerhead onto their nude bodies",
    "standing in a bedroom doorway. {possessive} back is against one side of the door frame, and one of {possessive} feet is elevated to eye-level and the sole of {possessive} shoe is pressing against the opposite door frame, putting {possessive} knee close to {possessive} face.",
    "standing in a bedroom doorway.",
    "standing, facing away from the camera, leaning forward, {possessive} ass toward the camera, hands on {possessive} knees, looking back at the camera, legs straight, knees locked",
    "lying on {possessive} side, with the top leg bent high, hand lightly between {possessive} thighs",
    "standing, mid-stretch reaching both arms overhead while rising up on {possessive} toes, hands in {possessive} hair, back arched, chest pressed forward, shoulders pulled back.",
    "lying on {possessive} stomach on a sunlit windowsill, chin resting on {possessive} hands, legs bent at the knees and crossed at the ankles in the air",
    "lying on {possessive} back on a sofa, one leg hooked over the backrest, other foot on the floor",
    "lying on {possessive} back on a sofa, one leg resting on opposite armrest, other foot on the floor",
    "{subjectPronoun} is on {possessive} knees facing away, looking back over {possessive} shoulder while reaching back to spread {possessive} ass cheeks apart",
    "kneeling on a soft rug in front of a fireplace, hands on {possessive} thighs, chest pushed forward, wearing a long pearl necklace and high heels",
    "on all fours, head turned to the side, back arched hard, ass toward the camera",
    "crawling toward the camera on all fours",
    "standing, leaning over a kitchen counter, resting on elbows, ass pushed out, looking back at camera, wearing only a tiny apron.",
    "taking a selfie in a bathroom mirror",
    "standing in front of a full-length mirror while pulling {possessive} hair up",
    "sitting in front of a full-length mirror looking at {possessive} reflection",
    "standing in a bathroom, leaning over the counter, close to the mirror, applying deep red lipstick. Facing away from the camera.",
    "standing in a bedroom doorway, {subjectPronoun} is touching {possessive} index finger to {possessive} bottom lip with a shy embarrassed smile and biting {possessive} bottom lip. {possessive} legs are crossed and {possessive} free hand is above {possessive} head touching the door frame.",
    "leaning against a glass door on the balcony of a third-floor Manhattan apartment. {possessive} legs are crossed and {subjectPronoun} is smoking a cigarette, blowing the smoke up into the air." }

];

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const nationalityOptions = [
    "Random Selection",
    ...nationalityPresets.map(item => item.label)
];

const imageCounts = [3, 5, 10, 20];

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        // Number of Images to Generate
        this.plainText("Number of Images to Generate"),
        this.menu(0, [
            "3 images",
            "5 images",
            "10 images",
            "20 images"
        ]),

        // Subject-Nationality
        this.plainText("Nationality"),
        this.menu(0, nationalityOptions),

        // Age
        this.plainText("Age"),
        this.menu(0, [
            "Random Selection",
            ...agePresets
        ]),

        // Eye Color
        this.plainText("Eye Color"),
        this.menu(0, [
            "Random Selection",
            ...eyeColorPresets
        ]),

        // Overall Build
        this.plainText("Body Type"),
        this.menu(0, [
            "Random Selection",
            ...overallBuildPresets
        ]),

        // Outfit
        this.plainText("Outfit"),
        this.menu(0, [
            "Random Selection",
            ...outfitPresets
        ]),

        // Action
        this.plainText("Action"),
        this.menu(0, [
            "Random Selection",
            ...actionPresets
        ])
    ]
})

async function generateBatch() {

    canvas.clear();

    let nationality;
    let hairColor;
    let skinTone;
    let age;
    let eyeColor;
    let overallBuild;
    let outfit;
    let action;

    if (promptSelections[3] === 0) {
        nationality = randomize(nationalityPresets);
    } else {
        nationality = nationalityPresets[promptSelections[3] - 1];
    }

    hairColor = randomize(nationality.hairColors);
    skinTone = randomize(nationality.skinTones);

    if (promptSelections[5] === 0) {
        age = randomize(agePresets);
    } else {
        age = agePresets[promptSelections[5] - 1];
    }

    if (promptSelections[7] === 0) {
        eyeColor = randomize(eyeColorPresets);
    } else {
        eyeColor = eyeColorPresets[promptSelections[7] - 1];
    }

    if (promptSelections[9] === 0) {
        overallBuild = randomize(overallBuildPresets);
    } else {
        overallBuild = overallBuildPresets[promptSelections[9] - 1];
    }

    if (promptSelections[11] === 0) {
        outfit = randomize(outfitPresets);
    } else {
        outfit = outfitPresets[promptSelections[11] - 1];
    }

    if (promptSelections[13] === 0) {
        action = randomize(actionPresets);
    } else {
        action = actionPresets[promptSelections[13] - 1];
    }


    const imagePrompt = "A photo of a " + age + " " + nationality.label + " " + gender + " with " + skinTone + " skin, " + hairColor + " hair and " + nationality.value + ", " + action + ", wearing " + outfit + ". She has a " + overallBuild.value + " and " + eyeColor.value + ". Natural anatomy.";
    console.log("Generating:");
    console.log(imagePrompt);

    // =================================
    // COPY CURRENT CONFIGURATION
    // =================================

    let config = JSON.parse(
        JSON.stringify(pipeline.configuration)
    );

    // =================================
    // KREA 2 SETTINGS
    // =================================

    config.model = "krea_2_turbo_i8x.ckpt";
    config.width = 1024;
    config.height = 1024;
    config.batchCount = 1;
    config.batchSize = 1;

    // =================================
    // RANDOM SEED
    // =================================
    config.seed = -1;

    // =================================
    // LORAS
    // =================================

    //    config.loras = [
    //        {
    //            mode: "all",
    //            file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
    //            weight: 1.0
    //        ,
    //        {
    //            mode: "all",
    //            file: "mysticxxx_krea2_v3_lora_f16.ckpt",
    //            weight: 0.6
    //        }
    //    ];

    // =================================
    // GENERATE
    // =================================

    await pipeline.run({
        configuration: config,
        prompt: imagePrompt
    });

    console.log("Image complete.");

    // =========================================
    // FINISHED
    // =========================================

    console.log("Image Complete.");
}

const imageCount = imageCounts[promptSelections[1]];

async function runBatch() {
    for (var i = 0; i < imageCount; i++) {
        await generateBatch();
    }
    console.log("Batch Finished!");
}

runBatch();
