import axios from "axios"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config() // Load environment variables from .env file

const OUTPUT_DIRECTORY = "public"
const SITE_ID = process.env.SITE_ID
const TOKEN = process.env.TOKEN

const startDate = "2017-01-01"
const endDate = new Date().toISOString().split("T")[0]

const getStatsFromPlausible = async () => {
  const url =
    `https://plausible.io/api/v1/stats/breakdown` +
    `?site_id=${SITE_ID}` +
    `&period=custom` +
    `&date=${startDate},${endDate}` +
    `&property=event:page` +
    `&limit=1000`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    })
    return response.data.results
  } catch (error) {
    throw new Error(`Error fetching data from Plausible: ${error}`)
  }
}

const filterBlogPages = (results) => {
  return results.filter(
    (result) =>
      result.page.startsWith("/blog/") &&
      result.page !== "/blog/" &&
      result.page !== "/blog/archive/"
  )
}

const ensureOutputDirectoryExists = () => {
  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY)
  }
}

const saveResultsToFile = (filteredResults) => {
  const filePath = `${OUTPUT_DIRECTORY}/results.json`

  fs.writeFile(filePath, JSON.stringify(filteredResults, null, 2), (err) => {
    if (err) throw new Error(`Error saving results to file: ${err}`)
    console.log(`Results saved to ${filePath}`)
  })
}

const createIndexHtml = () => {
  const timestampUTC = new Date().toISOString()
  const timestampPST = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
  })

  const indexHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Results</title>
      </head>
      <body>
        <h1>Results</h1>
        <a href="results.json">View Results</a>
        <p>Last fetched (UTC): ${timestampUTC}</p>
        <p>Last fetched (PST): ${timestampPST}</p>
      </body>
      </html>
    `

  const filePath = "public/index.html"

  fs.writeFile(filePath, indexHtmlContent, (err) => {
    if (err) throw new Error(`Error creating index.html: ${err}`)
    console.log(`index.html created at ${filePath}`)
  })
}

;(async () => {
  try {
    ensureOutputDirectoryExists() // Create 'public' directory if it doesn't exist
    const stats = await getStatsFromPlausible()
    const filteredResults = filterBlogPages(stats)
    saveResultsToFile(filteredResults)
    createIndexHtml()
  } catch (error) {
    console.error(error.message)
  }
})()
