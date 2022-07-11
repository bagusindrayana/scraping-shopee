const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const baseUrl = "https://shopee.co.id";
const searchUrl = baseUrl+"/search?";


async function scrapping(paramArray = null,userAgentOs = null) {
    const randomAgent = randomUseragent.getRandom(function (ua) {
        return ua.osName === userAgentOs || userAgentOs == null;
    });
    var url = searchUrl;
    Object.entries(paramArray).forEach(entry => {
        const [key, value] = entry;
        url += `${value}&`;
    });
    console.log(url);

    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.setJavaScriptEnabled(true);
        await page.setUserAgent(randomAgent);
        await page.goto(url, { waituntil: 'domcontentloaded', timeout: 0 });
        await page.setViewport({
            width: 1200,
            height: 800
        });
        //await page.waitForSelector('.shopee-search-item-result__items',{timeout:0});

        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        const body = await page.evaluate(() => {
            return document.querySelector('body').innerHTML;
        });
  
        const $ = cheerio.load(body);
        const listItems = $('[data-sqe="item"]');

        if(listItems.length <= 0){
            return { error: body.toString() };
        }

        var resulst = [];
        listItems.each(function (idx, el) {
            var linkEl = $('[data-sqe="link"]',el);
            var namaEl = $('[data-sqe="name"]',el);
            var nama = namaEl.text().replace(/(<([^>]+)>)/gi, "");
            var hargaElParent = namaEl.next("div");
            var hargaEl = $("div",hargaElParent).length > 1 ? $('div:nth-child(2)',hargaElParent) : hargaElParent.children('div');
            if(hargaEl){
                var harga = hargaEl.text().replace(/(<([^>]+)>)/gi, "");
                if (harga != null && harga != "") {
                    resulst.push({
                        "nama": nama,
                        "harga": harga,
                        "link": baseUrl+linkEl.attr("href")
                    });
                }
            }

        });

        await browser.close();
        return resulst;
    } catch (error) {
        return {error:error.toString()};
    }
}

const myArgs = process.argv.slice(2);
scrapping(myArgs);