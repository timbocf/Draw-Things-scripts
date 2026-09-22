//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================


// =========================================
// PRESET LISTS
// =========================================

const subjectPresets = [
    "woman with blonde hair",
    "woman with black hair",
    "Anne Hathaway",
    "Dolly Parton"
];

const outfitPresets = [
    "a loose fitting T-shirt and blue jeans",
    "a bikini",
    "a halter top and pleated shorts"
];

const actionPresets = [
    "smiling",
    "laying on a beach",
    "standing, looking away from the camera"
];

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function generateBatch() {

const subject = randomize(subjectPresets);
const outfit = randomize(outfitPresets);
const action = randomize(actionPresets);

const imagePrompt = "A photo of " + subject + ", " + action + ", wearing " + outfit + ". Natural anatomy."
										console.log("=================================");
console.log("Generating:");
console.log(imagePrompt);
console.log("=================================");

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
// FORCE SINGLE IMAGE
// =================================

   if (config.gridRows) {
       config.gridRows = 1;
   }

   if (config.gridColumns) {
       config.gridColumns = 1;
   }

   if (config.numFrames) {
       config.numFrames = 1;
   }

   if (config.stride) {
       config.stride = 0;
   }


// =================================
// RANDOM SEED
// =================================
config.seed = -1;

// =================================
// LORAS
// =================================

config.loras = [
    {
      mode: "all",
      file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
      weight: 1.0
    },
    {
      mode: "all",
      file: "mysticxxx_krea2_v3_lora_f16.ckpt",
      weight: 0.6
    }
];i

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

    console.log("=================================");
console.log("BATCH FINISHED SUCCESSFULLY!");
console.log("=================================");
}

for (var i=0; i < 3; i++) {
	generateBatch();
}
