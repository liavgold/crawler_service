const axios = require( 'axios' );
const cheerio = require('cheerio');
const fs = require('fs');

const url = process.argv[2];
const argDepth = parseInt(process.argv[3]);

const WriteStream = fs.createWriteStream("../results.json", "utf-8");
WriteStream.write("{results: [ ");
WriteStream.write("\n");

const crawlUrls = {};

const getUrl = (link) => {
    if(!link.includes('http')){
        return `${url}/${link}`;
    }
    return link;
}

const crawl = async (url, depth) => {

    if(crawlUrls[url]) return;
    crawlUrls[url] = true;
const response = await axios.get(url);
const html = await response.data;
const  $ = cheerio.load(html);

const links = $("a")
.map((i, link) => link.attribs.href)
.get();//get all links

const images = $("img")
.map((i, link) => link.attribs.src)
.get();//get all images

const imgResult =  images.map(img => {
    return {
        imageUrl: img,
        sourceUrl: url,
        depth,
    }
} )//create images result

WriteStream.write(imgResult);
WriteStream.write("\n");


if(depth < argDepth){
    links.forEach(link => {
        crawl(getUrl(link), depth+1)    
        });
}

WriteStream.write("]");
WriteStream.write("\n");
WriteStream.write("}");
WriteStream.write("\n");

return 
};

crawl(url, 0);