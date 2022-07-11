const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const baseUrl = "https://shopee.co.id";
const searchUrl = baseUrl+"/search?";


(async () => {
    const myArgs = process.argv.slice(2);
    var url = searchUrl;
    Object.entries(myArgs).forEach(entry => {
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
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36");
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
        console.dir(resulst);
        await browser.close();
    } catch (error) {
        console.log(error);
    }
})();