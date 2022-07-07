const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const baseUrl = "https://shopee.co.id";
const searchUrl = baseUrl+"/search?";


async function scrapping(paramArray = null,userAgentOs = "Windows") {
    const randomAgent = randomUseragent.getRandom(function (ua) {
        return ua.osName === 'Linux';//change with your OS
    });
    var url = searchUrl;
    Object.entries(paramArray).forEach(entry => {
        const [key, value] = entry;
        url += `${key}=${value}&`;
    });

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

app.get('/', async (req, res) => {
    var result = await scrapping(req.query,req.query.userAgentOs || null);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
});

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})

