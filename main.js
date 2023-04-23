import {promises} from 'fs';
import * as path from 'path';
const fs = promises;
import * as dotenv from 'dotenv';
import * as outline from './config/outline.js';
import * as prompts from './config/prompts.js';
import * as openaiApi from './config/openai-api.js';
import * as example from './config/example.js';

dotenv.config();

const OUTPUT_FOLDER = "./output/content"


async function main() {
    console.log("Version 0.1.2");

    //ensure output dir exists
    await fs.mkdir(OUTPUT_FOLDER, {recursive: true});

    //topics are read from the config
    let topics = outline.topics;

    //create filenames
    topics = topics.map(topic=>({topic, filename: createFilename(topic)}))
    topics = topics.map(({topic, filename}) => ({topic, filename: `${OUTPUT_FOLDER}/${filename}.md`}));

    //determine already completed topics
    const access = await Promise.allSettled(topics.map(({filename}) => fs.access(filename)));
    topics = topics.map(({topic, filename}, idx) => ({topic, filename, exists:access[idx].status=='fulfilled'}));


    //output table of contents

    let toc = topics.map(({topic, filename}) => `<li><a href="${path.parse(filename).name}.html">${topic}</a></li>`).join("\n");
     toc = "<ul>\n"+toc+"\n</ul>"
    await fs.writeFile("./output/index.html",toc);

    //report topics to ignore
    const ignoreTopics = topics.filter(({exists}) => exists);
    console.log("Skipping existing topics: ", ignoreTopics.map(({topic})=>topic));

    //ignore existing topics
    topics = topics.filter(({exists}) => !exists);

    //start processing each topic
    const promises = topics.map(({topic, filename})=>processTopic(topic, filename));

    //wait until all promises are settled
    const results = await Promise.allSettled(promises);
    console.log(results);

}

//execute
await main();

//perform async data flow for a single topic
async function processTopic(topic, outputFilename) {
    console.log("Starting: "+topic);

    try {
        //create prompt
        const prompt = createPrompt(topic);

        //create fetch optons
        const fetchOptions = createFetchOptions(prompt);

        //do fetch
        const res = await fetch(openaiApi.url, fetchOptions);

        //handle HTML error status
        if (!res.ok) {
            throw new Error("Server error: "+res.statusText);
        }
        
        //unpack results
        const data = await res.json();
        const content = data.choices[0].message.content;

        //write to disk
        await fs.writeFile(outputFilename, content);

        console.log("Completed: "+topic);

        return topic;
    }
    catch (err) {
        //log errors and re-throw
        console.log("Error: "+topic, err);
        throw err;
    }
}

//create prompt for this topic
function createPrompt(topic) {
    let prompt = []
    prompt.push({ role: 'system', content: prompts.system});
    prompt.push({ role: 'user', content: prompts.outline});
    prompt.push({ role: 'assistant', content: outline.outline});
    prompt.push({ role: 'user', content:prompts.topic(example.topic)});
    prompt.push({ role: 'assistant', content: example.content})
    prompt.push({ role: 'user', content:prompts.topic(topic)});

    return prompt;
}

//create the fetch options for the OpenAI API request
function createFetchOptions(prompt) {
    const openaiApiPayload = {
        temperature: openaiApi.temperature,
        model: openaiApi.model,
        messages: prompt
    };

    const options = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
        method: "POST",    
        body: JSON.stringify(openaiApiPayload)
    }
    return options;
}

//create a base filename for this topic
function createFilename(topic) {
    return topic.toLowerCase().replace(/\s/g, "-").replace(/[^a-z0-9-]/g, "");
}