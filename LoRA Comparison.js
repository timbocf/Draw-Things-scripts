//@api-1.0
// Testing prompts against different LoRAs in Draw Things

const promptsToTest = [
    "High-angle shot. A 1940s era oil painting in the style of Gil Ervgren and Alberto Vargas  of a young woman with auburn hair in victory curls and a porcelain complexion lying on a bed with her cheek touching the mattress and her ass up in the air. She is wearing a lacy pink satin camisole. The woman's eyes are looking upwards at the camera."
];

// Use 'file' instead of 'id' as expected by the pipeline configuration schema
const loraNames = [
	"PornMaster_Uncensored_Krea2_V1",
	"Krea2_TextFusion_Refusal_Reduction",
	"MysticXXX_KREA2_v3"
];

// Nested loop to test every prompt against every LoRA
for (let p = 0; p < promptsToTest.length; p++) {
    const currentPrompt = promptsToTest[p];
    
    for (const name of loraNames) {
			let config = JSON.parse(JSON.stringify(pipeline.configuration));

			const lora = pipeline.findLoRAByName(name);
			lora.weight = 0.8;

			config.loras = [lora];
        
        pipeline.run({
				configuration: config,
				prompt: currentPrompt
			});
    }
}
