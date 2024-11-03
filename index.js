const readline = require('readline');
const https = require('https');
const cheerio = require('cheerio');
const imageToAscii = require("image-to-ascii");

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let links = [];
async function savePage(content){
    const d = new Date();
    fs.writeFile(`page-${d.getTime()}.html`, content, (err) => {
        if (err) {
            throw err;
        }
        console.log('The page has been saved!');
        askQuestion();
    });
}

async function loadPage(url){
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                page = data;
                resolve(page);
            });
        });
    });
}

function findTitle(page){
    const $ = cheerio.load(page);
    const title = $('title').text();
    return title || "";
}

function findLinks(page){
    const $ = cheerio.load(page);
    const linksElements = $('a');
    links = [];
    linksElements.each((index, link) => {
        const url = link.attribs.href || "";
        if(url.indexOf('https') === 0){
            links.push(url);
        }
    });
}

async function askQuestion(page){
    const title = findTitle(page);
    console.log(`Title: ${title}`);
    await findLinks(page);
    console.log(`Found ${links.length} links`);
    links.forEach((link, index) => {
        console.log(`[${index}]: ${link}`);
    });
    input.question('Which link to follow ?', async (answer) => {
        if(links[answer]){
            console.log("=========");
            const newPage = await loadPage(links[answer]);
            await askQuestion(newPage);
        }
        
    });
}

function start(){
    input.question('Enter a URL: ', async (url) => {
        const page = await loadPage(url);
        await askQuestion(page);
    });
}

start();