import fs from "fs"

const html = (statsFilePath) => {
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
          <a href="${statsFilePath}">View Results</a>
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

export default html
