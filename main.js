/*
data flow

topics
---prompt-design--->
completion queries
---open-ai-api--->
fetch options
---async-fetch--->
json responses
---open-ai-api--->
unpacked data
---write-file--->
document on disk
*/

import {promises} from 'fs';
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

    //limit for debugging
    //topics = topics.slice(5,8);

    //create filenames
    topics = topics.map(topic=>({topic, filename: createFilename(topic)}))
    topics = topics.map(({topic, filename}) => ({topic, filename: `${OUTPUT_FOLDER}/${filename}.md`}));



    //filter already completed topics
    const access = await Promise.allSettled(topics.map(({filename}) => fs.access(filename)));
    topics = topics.map(({topic, filename}, idx) => ({topic, filename, exists:access[idx].status=='fulfilled'}));

    const ignoreTopics = topics.filter(({exists}) => exists);
    console.log("Skipping existing topics: ", ignoreTopics.map(({topic})=>topic));

    topics = topics.filter(({exists}) => !exists);

    //start processing each topic
    const promises = topics.map(({topic, filename})=>processTopic(topic, filename));

    //wait until all promises are settled
    const results = await Promise.allSettled(promises);
    console.log(results);
}

await main();

async function processTopic(topic, outputFilename) {
    console.log("Starting: "+topic);

    try {
        //create prompt
        const prompt = createPrompt(topic);

        //create fetch optons
        const fetchOptions = createFetchOptions(prompt);

        //do fetch
        const res = await fetch(openaiApi.url, fetchOptions);
        //console.log(fetchOptions)
        
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
        console.log("Error: "+topic, err);
        throw err;
    }
}

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

function createFilename(topic) {
    return topic.toLowerCase().replace(/\s/g, "-").replace(/[^a-z0-9-]/g, "");
}