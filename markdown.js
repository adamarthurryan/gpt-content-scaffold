import showdown  from 'showdown';

import {promises} from 'fs';
import * as path from 'path';
const fs = promises;

import template from './config/template.js';


const INPUT_FOLDER = "./output/content";
const OUTPUT_FOLDER = "./output/html";


async function main() {
    const converter=setupConverter();

    //ensure output dir exists
    await fs.mkdir(OUTPUT_FOLDER, {recursive: true});

    //get the filenames
    let filenames = await fs.readdir(INPUT_FOLDER);
    filenames = filenames.map(filename => ({input: path.join(INPUT_FOLDER,filename), output:path.join(OUTPUT_FOLDER,path.parse(filename).name+".html") }));
    
    //start processing each file
    const promises = filenames.map(({input, output})=>convert(converter, input, output));

    //wait until all promises are settled
    const results = await Promise.allSettled(promises);
    console.log(results);
}

await main();

async function convert(converter, inputFilename, outputFilename) {
    //read the markdown string
    const markdown = (await fs.readFile(inputFilename)).toString();

    //convert to html
    const html = converter.makeHtml(markdown);

    //post conversion cleanup for CMS
    let cleanHtml = html;
    cleanHtml = cleanHtml.replace(/<pre><code class="([^"]*)">/g, '<pre class="brush: $1">');
    cleanHtml = cleanHtml.replace(/<\/code><\/pre>/g, '</pre>');
    cleanHtml = cleanHtml.replace(/ id="[^"]+"/g, "");
    cleanHtml = cleanHtml.replace(/<h1>[^<]*<\/h1>/g, "");

    //embed in Tuts+ boilerplate HTML
    const finalHtml = template({content: cleanHtml, title: path.parse(outputFilename).name})
    
    //write the html
    await fs.writeFile(outputFilename, finalHtml);
}

function setupConverter() {
    const converter = new showdown.Converter();
    converter.setOption("completeHTMLDocument", false);
    converter.setOption("headerLevelStart", 1);
    converter.setOption("tables", true);

    return converter;
}

