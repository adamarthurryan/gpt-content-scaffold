const outline = `I. Introduction to JavaScript DOM Manipulation API
A. What is the DOM (Document Object Model)?
B. DOM Manipulation in JavaScript
C. Importance of DOM manipulation in web development

II. Essential DOM Manipulation Methods
A. Selecting Elements
   1. getElementById()
   2. getElementsByClassName()
   3. getElementsByTagName()
   4. querySelector()
   5. querySelectorAll()
B. Creating and Adding Elements
   1. createElement()
   2. createTextNode()
   3. appendChild()
   4. insertBefore()
   5. innerHTML and textContent
C. Modifying Elements
   1. setAttribute()
   2. removeAttribute()
   3. className and classList
   4. style and cssText
D. Removing Elements
   1. removeChild()
   2. replaceChild()

III. Traversing the DOM Tree
A. parentNode and parentElement
B. childNodes and children
C. firstChild, firstElementChild, lastChild, and lastElementChild
D. nextSibling, nextElementSibling, previousSibling, and previousElementSibling

IV. Event Handling in JavaScript DOM Manipulation
A. Introduction to JavaScript Events
B. Adding Event Listeners
   1. addEventListener()
   2. removeEventListener()
C. Event Types
   1. Mouse events
   2. Keyboard events
   3. Form events
   4. Window events
D. Event Objects and Event Propagation
   1. Event object properties and methods
   2. Eventroduction to JavaScript Events
   3. Event delegation

V. Practical Examples of JavaScript DOM Manipulation
A. Creating a simple to-do list application
B. Building a dynamic image gallery
C. Implementing a responsive navigation menu
D. Creating a content filter for a list

VI. Best Practices for DOM Manipulation
A. Minimizing DOM manipulation for better performance
B. Using modern JavaScript features for cleaner code
C. Accessibility considerations
D. Cross-browser compatibility

VII. Conclusion
A. Recap of JavaScript DOM Manipulation API
B. Further learning resources
C. Encouragement for practice and experimentation`;

const sectionsRaw=outline.replace(/^\s+\d\. .*$\n/gm, '');

const sections=sectionsRaw.split('\n\n');
const topics=sections.map(section=>{
    const lines = section.split('\n');
    const sectionNum = lines[0].split('. ')[0];
    return lines.slice(1).map(line => sectionNum+'.'+line);
}).flat();

export {topics, outline};
