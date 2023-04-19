import {promises} from 'fs';
const fs = promises;

const template = (await fs.readFile("./config/template.html")).toString();

export default function ({content, title}) {
    let finalHtml = template;
    finalHtml = finalHtml.replace("${content}", content);
    finalHtml = finalHtml.replace(/\$\{title\}/g, title);
    return finalHtml;
}