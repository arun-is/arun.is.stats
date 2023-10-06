import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(); // Load environment variables from .env file

const SITE_ID = process.env.SITE_ID;
const TOKEN = process.env.TOKEN;

const startDate = "2017-01-01";
const endDate = new Date().toISOString().split("T")[0];

const getStatsFromPlausible = async () => {
  const url =
    `https://plausible.io/api/v1/stats/breakdown` +
    `?site_id=${SITE_ID}` +
    `&period=custom` +
    `&date=${startDate},${endDate}` +
    `&property=event:page` +
    `&limit=1000`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return response.data.results;
  } catch (error) {
    throw new Error(`Error fetching data from Plausible: ${error}`);
  }
};

const filterBlogPages = (results) => {
  return results.filter(
    (result) =>
      result.page.startsWith("/blog") && result.page !== "/blog/archive/"
  );
};

const saveResultsToFile = (filteredResults) => {
  const directory = "public";

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const filePath = `${directory}/results.json`;

  fs.writeFile(filePath, JSON.stringify(filteredResults, null, 2), (err) => {
    if (err) throw new Error(`Error saving results to file: ${err}`);
    console.log(`Results saved to ${filePath}`);
  });
};

(async () => {
  try {
    const stats = await getStatsFromPlausible();
    const filteredResults = filterBlogPages(stats);
    saveResultsToFile(filteredResults);
  } catch (error) {
    console.error(error.message);
  }
})();
