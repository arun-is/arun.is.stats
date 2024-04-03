import fs from "fs"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { config as dotenvConfig } from "dotenv"

dotenvConfig()

const viewId = process.env.VIEW_ID // Google Analytics View ID

const authenticate = async () => {
  const auth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"]
  })

  await auth.authorize()
  return auth
}

const getAnalyticsData = async (auth) => {
  const analyticsreporting = google.analyticsreporting({
    version: "v4",
    auth
  })

  const startDate = "2017-01-01"
  const endDate = "today"

  const res = await analyticsreporting.reports.batchGet({
    requestBody: {
      reportRequests: [
        {
          viewId,
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [
            {
              expression: "ga:users" // Changed metric to 'ga:users'
            }
          ],
          dimensions: [
            {
              name: "ga:pagePath"
            }
          ],
          orderBys: [
            {
              fieldName: "ga:users",
              sortOrder: "DESCENDING"
            }
          ]
        }
      ]
    }
  })

  return res.data.reports[0].data.rows.map((row) => ({
    page: row.dimensions[0],
    visitors: parseInt(row.metrics[0].values[0], 10)
  }))
}

const googleAnalytics = async (filePath) => {
  try {
    const auth = await authenticate()
    const data = await getAnalyticsData(auth)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log(`Google Analytics stats saved to ${filePath}`)
  } catch (error) {
    console.error("Error:", error)
  }
}

export default googleAnalytics
