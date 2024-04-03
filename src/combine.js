import fs from "fs"
const BLOG_REGEX_PATTERN = /^\/blog\/[a-z0-9-]+\/$/
const PREFIX_PATTERN = /^\/blog\/[a-z0-9-]+\//

const readAnalyticsData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error}`)
    return []
  }
}

const filterData = (data) => {
  const filteredData = {}

  for (const page in data) {
    if (page.startsWith("/blog/") && page !== "/blog/") {
      filteredData[page] = data[page]
    }
  }

  return filteredData
}

const splitData = (filteredData) => {
  const blogPages = {}
  const blogPagesWithExtraCharacters = {}

  for (const page in filteredData) {
    if (BLOG_REGEX_PATTERN.test(page)) {
      blogPages[page] = filteredData[page]
    } else {
      blogPagesWithExtraCharacters[page] = filteredData[page]
    }
  }

  return { blogPages, blogPagesWithExtraCharacters }
}

const stripExtraCharacters = (page) => {
  const pattern = PREFIX_PATTERN
  const match = page.match(pattern)
  return match ? match[0] : ""
}

const addBlogPagesWithExtraCharacters = ({
  blogPages,
  blogPagesWithExtraCharacters
}) => {
  for (const pageWithExtraCharacter in blogPagesWithExtraCharacters) {
    const strippedKey = stripExtraCharacters(pageWithExtraCharacter)
    if (strippedKey && blogPages[strippedKey] !== undefined) {
      blogPages[strippedKey] +=
        blogPagesWithExtraCharacters[pageWithExtraCharacter]
    }
  }

  return blogPages
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

const sortObjectByValueDescending = (inputObject) => {
  const sortedEntries = Object.entries(inputObject).sort((a, b) => b[1] - a[1])
  return Object.fromEntries(sortedEntries)
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

  const filteredData = filterData(combinedData)

  const { blogPages, blogPagesWithExtraCharacters } = splitData(filteredData)
  addBlogPagesWithExtraCharacters({ blogPages, blogPagesWithExtraCharacters })

  const sortedBlogPages = sortObjectByValueDescending(blogPages)

  writeCombinedDataToFile(sortedBlogPages, combinedFile)
}

export default combine
