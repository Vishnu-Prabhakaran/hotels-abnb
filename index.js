const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const url =
  'https://www.airbnb.com.au/s/Japan/homes?query=Japan%20homes&place_id=ChIJLxl_1w9OZzQRRFJmfNR1QvU&refinement_paths%5B%5D=%2Fhomes&source=mc_search_bar&search_type=pagination&tab_id=home_tab&federated_search_session_id=4204db4e-e470-4b24-8634-b4f74d82cdaa&section_offset=4&items_offset=0';
let browser;
async function scrapeHomesInIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    // Element with itemprops
    const abnbUrl = 'https://www.airbnb.com.au';
    const homes = $('[itemprop=itemListElement]')
      .map(
        (i, e) =>
          abnbUrl +
          $(e)
            .find('a')
            .attr('href')
      )
      .get();

    return homes;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeDescriptionPage(Pageurl, page) {
  try {
    // Consider navigation to be finished when there are no more than 2 network connections for at least 500ms
    await page.goto(Pageurl, { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const pricePerNight = $(
      '#room > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span > span'
    ).text();

    // Getting values using regular expression

    const roomtext = $('#room').text();
    // d+ means digits greater than 0
    const guestMatches = roomtext.match(/\d+ guest/);

    let guestAllowed = 'N/A';
    if (guestMatches != null) {
      guestAllowed = guestMatches[0];
    }
    console.log(pricePerNight);
    console.log(guestAllowed);
    return { pricePerNight, guestAllowed };
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  // Instead of opening multiple pages for each urls - make a single page
  const descriptionPage = await browser.newPage();
  const homes = await scrapeHomesInIndexPage(url);
  for (var i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }
}

main();
