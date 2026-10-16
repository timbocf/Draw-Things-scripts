//@api-1.0
// Solo Girl Batch Generator
// author timbocf
// v1
// Draw Things

const theGirls = [

    // Celebrity Presets
    { label: "My Baby", value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes", named: true },
    { label: "Anne Hathaway, Long Hair", value: "Anne Hathaway with a tall slim build with long straight black hair, smokey eyes and heavy mascara", named: true },
    { label: "Anne Hathaway, Short Hair", value: "Anne Hathaway with a tall slim build with short straight black hair in a textured pixie cut, smokey eyes and heavy mascara", named: true },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs", named: true },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair", named: true },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls", named: true },
    { label: "Lisbeth Salander", value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings", named: true },
    { label: "Michelle Obama", value: "Michelle Obama", named: true },
    { label: "Betty Boop", value: "Betty Boop", named: true },

    // Nationality Presets
    {
        label: "Caucasian",
        value: "with Western European facial features",
        hairColors: ["blonde", "brunette", "black", "ginger", "ombre", "balayage"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
    },
    {
        label: "Black",
        value: "with rich deep skin tone and classic African facial features, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings",
        hairColors: ["dark brown", "black", "black with blonde streaks", "dyed blonde", "box braids black", "box braids and blonde streaks of hair braided in black"],
        skinTones: ["rich mocha", "brown", "dark brown", "black", "dark glossy black"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican features, plump lips, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm olive tan", "sun-darkened"],
        eyeColors: ["dark brown", "black", "light brown"]
    },
    {
        label: "Mixed-Race",
        value: "with a natural blend of African and European facial features, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, thick hair with thick wavy curls, a curvy hourglass figure, and a round ass",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "warm olive"],
        eyeColors: ["blue", "dark brown", "light brown", "hazel"]
    },
    {
        label: "Indian",
        value: "with South Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "dark tan", "warm brown"],
        eyeColors: ["black", "dark brown"]
    },
    {
        label: "East Asian",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black", "pink hair in pigtails"],
        skinTones: ["porcelain", "fair", "light", "olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Southeast Asian",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["light", "warm tan", "golden-tan", "deep golden-bronze"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Middle Eastern",
        value: "with Middle Eastern facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["olive", "dark"],
        eyeColors: ["dark brown", "black"]
    },

    // Generic Character Presets
    {
        label: "Oversized head/eyes, small nose",
        value: ", with an unnaturally large head with large eyes, a tiny nose, exaggerated ears and a small mouth with plump lips",
        hairColors: ["blonde", "brunette", "black", "ginger", "ombre", "balayage", "pink hair in pigtails"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
    }

];

const promptSelections = requestFromUser("Enter a prompt here. The script will generate one image for each nationality.", "Generate", function () {
    return [
        this.section(
            "Custom Prompt",
            "Enter prompt without any subject identifiers",
            [
                this.textField("", "Prompt:", true, 94)
            ]
        )
    ]
})