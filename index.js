const axios = require('axios').default;
const fs = require('fs');
const util = require('util');
const path = require('path');
const cheerio = require('cheerio');
const asyncWriteFile = util.promisify(fs.writeFile);

const fetchHtml = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
    process.exit(1);
  }
};

const scrapSteam = async (url) => {
  const html = await fetchHtml(url);

  try {
    const selector = cheerio.load(html);
    const searchResults = selector('body').find('script#__NEXT_DATA__').html();
    const data = JSON.parse(searchResults).props.initialState.tv.tvSchedule
      .list;

    await asyncWriteFile(
      path.join(__dirname, 'data.json'),
      JSON.stringify(data, null, 2)
    );
    console.log(
      new Date().toLocaleDateString('uk', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ` scraped successfully`
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

scrapSteam('https://my.ua/tv');
