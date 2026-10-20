# Draw Things Scripts

A workbench of JavaScript prompt generators, batch-generation scripts and experiments for the **Draw Things** app on iOS, iPadOS and macOS.

The repository preserves several development lines: earlier modular batch generators, a simpler hand-coded Prompt Randomizer, a concept-oriented V2 and a multiple-entity prompt experiment. These files are separate iterations, not modules that should all be loaded together.

## Find the right script

| Path | Purpose/status |
| --- | --- |
| [Prompt_Randomizer/Prompt_Randomizer_v1.js](Prompt_Randomizer/Prompt_Randomizer_v1.js) | Hand-coded single-subject randomizer with style, appearance, outfit, action and setting presets |
| [Prompt_Randomizer/Prompt_Randomizer_v2.js](Prompt_Randomizer/Prompt_Randomizer_v2.js) | Work-in-progress visual-concept/era organization with nested scene and rendering data |
| [Prompt_Randomizer/Krea_2_Turbo_V2.js](Prompt_Randomizer/Krea_2_Turbo_V2.js) | Another retained V2 iteration; do not assume it matches Prompt_Randomizer_v2.js |
| [Prompt_Randomizer/Multiple_Subject_Generator.js](Prompt_Randomizer/Multiple_Subject_Generator.js) | Console-oriented entity/scene experiment using Person, Animal and Vehicle classes |
| [Solo_Girl_Batch_Generator.js](Solo_Girl_Batch_Generator.js) | Generates a batch across configured subjects using a shared custom prompt |
| [Krea_2_Wildcards_Batch_Gen.js](Krea_2_Wildcards_Batch_Gen.js) | Nested loops across configured subjects, outfits and actions |
| [wildcards.js](wildcards.js) | Inline wildcard expansion and batch generation; credited to wetcircuit |
| [find lora filename.js](find%20lora%20filename.js) | Logs the currently configured model and LoRA data |
| Krea_2_Batch_Generator/ | Historical batch-generator versions and experiments |
| Prompt_Randomizer/test.js / testing_new_actions.js | Experimental files; not an automated test suite |

## Running Draw Things scripts

Draw Things supplies **requestFromUser**, **pipeline** and **canvas**. Scripts using those APIs do not run unchanged in Node.js or a browser.

1. Download the specific JavaScript file you want to use.
2. Add it to Draw Things' scripting interface.
3. Check its model filename and LoRA configuration against your installed assets.
4. Run it, choose its available options and start with a small batch.
5. Inspect console output when troubleshooting.

Several generators explicitly select **krea_2_turbo_i8x.ckpt** and override dimensions, seed or LoRAs. They do not necessarily preserve every setting currently selected in the app. Models and LoRA weights are not bundled here.

## Prompt Randomizer direction

V1 remains a simpler reference implementation. V2 is being reorganized around visual concepts that choose coherent rendering, scenes and compatible content. Nested data is being introduced while older selection logic remains in the file, so V2 should be treated as under development rather than a drop-in verified replacement.

The multiple-subject experiment is a separate direction: it composes descriptions from entities and prints a prompt to the console without calling the Draw Things generation pipeline. Its current source still references entity classes before they are declared in **scenarioPresets**, which can prevent execution. Scenario selection also remains unfinished.

## Wildcards

**wildcards.js** expands alternatives written like:

~~~text
a {duck|cat|dog} in a {submarine|airplane|taxicab}
~~~

Run it inside Draw Things and enter a wildcard prompt and batch count. This is different from **Krea_2_Wildcards_Batch_Gen.js**, which enumerates arrays using nested loops. The number of images in that array-based script is the product of the three array lengths.

## Editing

Keep working versions intact while experimenting with another file. When adding presets, follow the selected file's existing schema: some use plain strings, others use label/value records or nested objects. Mixing those formats without changing the selection code can leave content unreachable.

Historical version numbers and filenames are retained for comparison. They do not establish a single latest stable release. This overview describes files on the default branch; experiments elsewhere may differ.

## Verification and attribution

Use the script's console output and a one-image run to inspect the final prompt, dimensions and installed model configuration. Live image generation requires Draw Things and local assets; the repository contains no common automated test runner.

The original **wildcards.js** header credits **wetcircuit**, version 0.5. Preserve that credit. This repository includes contributions and experiments from different development stages rather than a uniform library API.
