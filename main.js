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


import * as dotenv from 'dotenv';
import {topics, outline} from './config/topics.js';
import * as prompts from './config/prompts.js';
import * as openaiApi from './config/openai-api.js';

dotenv.config();

let count = 0;

async function main() {
    //ensure 
    //topics are read from the config
    let topics = topics;

    //limit for debugging
    topics.slice(0,2);

    //filter already completed topics

    
    //start processing each topic
    const promises = topics.slice(0,2).map(processTopic);

    //wait until all promises are settled
    await Promise.allSettled(promises);
}

await main();


async function processTopic(topic) {
    console.log(topic);
    count++;

    //create prompt
    const prompt = createPrompt(topic);

    //create fetch optons
    const fetchOptions = createFetchOptions(prompt);

    //do fetch
    const res = await fetch(openaiApi.url, fetchOptions);
    console.log(res);

    if (!res.ok) {
        throw new Error("Server error: "+res.statusText);
    }
    
    //unpack results
    const data = await res.json();
    console.log(data);
    const content = data.choices[0].message.content;

    //write to disk
    const outputFilename = createOutputFilename(topic);

    return content;
}

function createPrompt(topic) {
    let prompt = [];
    prompt.push({ role: 'system', content: prompts.system});
    prompt.push({ role: 'user', content: prompts.outline});
    prompt.push({ role: 'assistant', content: outline});
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