const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const url =
  'https://www.airbnb.com.au/s/Japan/homes?query=Japan%20homes&place_id=ChIJLxl_1w9OZzQRRFJmfNR1QvU&refinement_paths%5B%5D=%2Fhomes&source=mc_search_bar&search_type=pagination&tab_id=home_tab&federated_search_session_id=4204db4e-e470-4b24-8634-b4f74d82cdaa&section_offset=4&items_offset=0';
let browser;
async function scrapeHomesInIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
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
    await page.goto(Pageurl);
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  // Instead of opening multiple pages for each urls - make a single page
  const descriptionPage = await browser.newPage();
  const homes = await scrapeHomesInIndexPage(url);
  for (var i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }
}

main();
