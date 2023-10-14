import fs from "fs"

const readAnalyticsData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error}`)
    return []
  }
}

const combineAnalyticsData = ({ googleAnalyticsFile, plausibleFile }) => {
  const googleAnalyticsData = readAnalyticsData(googleAnalyticsFile)
  const plausibleData = readAnalyticsData(plausibleFile)

  const combinedData = {}

  // Combine Google Analytics data
  for (const entry of googleAnalyticsData) {
    const { page, visitors } = entry
    if (combinedData[page]) {
      combinedData[page] += visitors
    } else {
      combinedData[page] = visitors
    }
  }

  // Combine Plausible data
  for (const entry of plausibleData) {
    const { page, visitors } = entry
    if (combinedData[page]) {
      combinedData[page] += visitors
    } else {
      combinedData[page] = visitors
    }
  }

  return combinedData
}

const writeCombinedDataToFile = (combinedData, combinedFile) => {
  try {
    fs.writeFileSync(
      combinedFile,
      JSON.stringify(combinedData, null, 2),
      "utf8"
    )
    console.log(`Combined data written to ${combinedFile}`)
  } catch (error) {
    console.error(`Error writing to ${combinedFile}: ${error}`)
  }
}

const combine = ({ googleAnalyticsFile, plausibleFile, combinedFile }) => {
  const combinedData = combineAnalyticsData({
    googleAnalyticsFile,
    plausibleFile
  })

  writeCombinedDataToFile(combinedData, combinedFile)
}

export default combine
