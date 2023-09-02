const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/', (req, res) => {
  res.send('Head to /news for the latest news from BBC');
});

const uniqueUrls = new Set();

app.get('/news', async (req, res) => {
  try {
    // Get data from bbc
    const bbc = await axios.get('https://www.bbc.com/news');
    const $bbc = cheerio.load(bbc.data);
    const bbcArticles = [];

    $bbc('.gs-c-promo-body').each(function () {
      const title = $bbc(this).find('.gs-c-promo-heading__title').text();
      const relativeUrl = $bbc(this).find('a').attr('href');
      const time = $bbc(this).find('.qa-status-date-output').text()+" ago";
      const fullArticleUrl = url.resolve('https://www.bbc.com/news', relativeUrl);

      if (!uniqueUrls.has(fullArticleUrl)) {
        bbcArticles.push({
          source: 'bbc',
          title,
          url: fullArticleUrl,
          time,
        });
        uniqueUrls.add(fullArticleUrl); // Add the URL to the set
      }
    });

    // Send the scraped data as JSON
    res.json(bbcArticles);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
