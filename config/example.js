import {promises} from 'fs';
const fs = promises;

export const topic ="II.A. Selecting Elements";

export const content = (await fs.readFile("./config/example.md")).toString();
