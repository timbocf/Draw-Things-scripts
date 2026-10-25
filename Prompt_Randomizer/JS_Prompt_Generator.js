// JS Prompt Generator

// =========================================
// PROMPT GENERATOR
// =========================================

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getSceneSetting(options, presets) {
    if (!options || options.length === 0) {
        return null;
    }

    const selectedLabel = randomize(options);

    return presets.find(preset =>
        preset.label === selectedLabel
    ) || null;
}

function generateBatch() {

    let imagePrompt;
    let artStyle = document.getElementById(getArtStyle);
    let age = document.getElementById(getAge);
    let nationality = document.getElementById(getNationality);
    let isPregnant = document.getElementById(getIsPregnant);
    let isMidget = document.getElementById(getIsMidget);
    let hairColor = document.getElementById(getHairColor);
    let hairStyle = document.getElementById(getHairStyle);
    let skinTone = document.getElementById(getSkinTone);
    let eyeColor = document.getElementById(getEyeColor);
    let overallBuild = document.getElementById(getOverallBuild);
    let outfit = document.getElementById(getOutfit);
    let action = document.getElementById(getAction);
    let scenePreset;
    let environment = document.getElementById(getEnvironment);
    let cameraFraming = document.getElementById(getCameraFraming);
    let cameraAngle = document.getElementById(getCameraAngle);
    let timeOfDay = document.getElementById(getTimeOfDay);
    let lighting = document.getElementById(getLighting);
    let photographicLook = document.getElementById(getPhotographicLook);

    if (!artStyle) {
        artStyle = randomize(artStylePresets);
    }

    if (!nationality) {
        const randomPool = nationalityPresets.filter(item => !item.named);
        nationality = randomize(randomPool);
    }

    if (!age) {
        age = randomize(agePresets);
    }

    if (age < 18 && gender === "woman") {
        gender = "girl";
    }
    if (age < 18 && gender === "man") {
        gender = "boy";
    }

    if (!isPregnant) {
        isPregnant = "pregnant ";
    } else { isPregnant = ""; }

    if (!isMidget) {
        isMidget = " with achondroplasia, characteristic short stature and naturally proportioned body,";
    } else { isMidget = ""; }

    if (!overallBuild) {
        overallBuild = randomize(overallBuildPresets);
    }

    if (!outfit) {
        outfit = randomize(outfitPresets).value;
    }

    if (!action) {
        action = randomize(actionPresets);
    }

    if (!scenePreset) {
        scenePreset = randomize(scenePresets.slice(1));
    }

    // =========================================
    // SCENE CAMERA & LIGHTING SETTINGS
    // =========================================

    if (scenePreset) {
        const sceneFraming = getSceneSetting(
            scenePreset.cameraFraming,
            cameraFramingPresets
        );

        const sceneAngle = getSceneSetting(
            scenePreset.cameraAngle,
            cameraAnglePresets
        );

        const sceneTime = getSceneSetting(
            scenePreset.timeOfDay,
            timeOfDayPresets
        );

        const sceneLighting = getSceneSetting(
            scenePreset.lighting,
            lightingPresets
        );

        const sceneLook = getSceneSetting(
            scenePreset.photographicLook,
            photographicLookPresets
        );

        if (sceneFraming) {
            cameraFraming = sceneFraming.value;
        }

        if (sceneAngle) {
            cameraAngle = sceneAngle;
        }

        if (sceneTime) {
            timeOfDay = sceneTime.value;
        }

        if (sceneLighting) {
            lighting = sceneLighting.value;
        }

        if (sceneLook) {
            photographicLook = sceneLook.value;
        }
    }

    // =========================================
    // ERA COMPATIBILITY
    // =========================================

    if (artStyle.tags) {

        const compatibleOutfits = outfitPresets.filter(outfit =>
            outfit.tags &&
            outfit.tags.includes(artStyle.concept)
        );

        if (compatibleOutfits.length > 0) {
            outfit = randomize(compatibleOutfits).value;
        }


        const compatibleHairstyles = hairstylePresets.filter(hair =>
            hair.tags &&
            hair.tags.includes(artStyle.concept)
        );

        if (compatibleHairstyles.length > 0) {
            hairStyle = randomize(compatibleHairstyles).value;
        }
    }

    if (promptSelections[9][0] === 0 && artStyle.concept) {

        const compatibleActions = actionPresets.filter(action =>
            action.tags &&
            action.tags.includes(artStyle.concept)
        );

        if (compatibleActions.length > 0) {
            action = randomize(compatibleActions);
        }
    }

    let optionalPrompt = "";

    if (action.tags && action.tags.includes("lowAngleRequired")) {
        cameraAngle = cameraAnglePresets.find(
            angle => angle.label === "Low Angle"
        );
    }

    const compatibleEnvironments = environments.filter(environment =>
        action.environmentTags &&
        environment.tags &&
        action.environmentTags.some(tag =>
            environment.tags.includes(tag)
        )
    );

    if (compatibleEnvironments.length > 0) {
        environment = randomize(compatibleEnvironments);
    }

    // ========================================
    // SCENE ENVIRONMENT
    // ========================================

    if (scenePreset?.value) {
        environment = scenePreset;
    }

    // ========================================
    // CAMERA & LIGHTING PROMPT
    // ========================================

    const cameraLightingPrompt = [
        cameraFraming,
        cameraAngle?.value,
        timeOfDay,
        lighting,
        photographicLook
    ].filter(Boolean).join(", ");

    optionalPrompt = cameraLightingPrompt
        ? " " + cameraLightingPrompt + "."
        : "";

    if (action.tags && action.tags.includes("nudeRequired")) {
        outfit = "nude";
    }

    // sitting, kneeling, crouching, laying, standing
    if (action.tags === scenePreset.tags) {

    }

    if (environment === scenePreset && scenePreset?.selfiePhoto) {
        artStyle = artStylePresets.find(
            style => style.label === "Selfie Photo, from Above"
        );
    }

    // PROMPT TEMPLATE
    if (nationality.named) {
        // Celebrity
        imagePrompt = "A " + artStyle.value + " of a " + isPregnant + nationality.value + ", " + action.value + " " + environment.value + ". She is wearing " + outfit + ". " + optionalPrompt + " Natural anatomy.";
    } else {
        hairColor = randomize(nationality.hairColors);
        skinTone = randomize(nationality.skinTones);
        eyeColor = randomize(nationality.eyeColors);
        imagePrompt = "A " + artStyle.value + " of a " + isPregnant + age + "-year-old " + nationality.label + " " + gender + isMidget + " with " + skinTone + " skin, " + hairColor + " hair, " +
            (hairStyle ? hairStyle + ", " : "") +
            nationality.value + ", " + action.value + " " + environment.value + ". She is wearing " + outfit + ". She has a " + overallBuild.value + " and " + eyeColor + " eyes." + optionalPrompt + " Natural anatomy.";
    }

    console.log(imagePrompt);
}

generateBatch();