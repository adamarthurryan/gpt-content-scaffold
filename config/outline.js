import {promises} from 'fs';
const fs = promises;

const outline = (await fs.readFile("./config/outline.md")).toString();

const sectionsRaw=outline.replace(/^\s+\d\. .*$\n/gm, '');

const sections=sectionsRaw.split('\n\n');
const topics=sections.map(section=>{
    const lines = section.split('\n');
    const sectionNum = lines[0].split('. ')[0];
    return lines.slice(1).map(line => sectionNum+'.'+line);
}).flat();

export {topics, outline};
