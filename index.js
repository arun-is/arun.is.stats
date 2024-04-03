import fs from "fs"
import html from "./src/html.js"
import plausible from "./src/plausible.js"
import combine from "./src/combine.js"

const OUTPUT_DIRECTORY = "public"
const PLAUSIBLE_FILE_PATH = `${OUTPUT_DIRECTORY}/plausible.json`
const GOOGLE_ANALYTICS_FILE_PATH = `${OUTPUT_DIRECTORY}/googleAnalytics.json`
const COMBINED_FILE = `combinedStats.json`
const COMBINED_FILE_PATH = `${OUTPUT_DIRECTORY}/${COMBINED_FILE}`

// ensure output directory exists
if (!fs.existsSync(OUTPUT_DIRECTORY)) {
  fs.mkdirSync(OUTPUT_DIRECTORY)
}
await plausible(PLAUSIBLE_FILE_PATH)
await html(COMBINED_FILE)
await combine({
  googleAnalyticsFile: GOOGLE_ANALYTICS_FILE_PATH,
  plausibleFile: PLAUSIBLE_FILE_PATH,
  combinedFile: COMBINED_FILE_PATH
})
