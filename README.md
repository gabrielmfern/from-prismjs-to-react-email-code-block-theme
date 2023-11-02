# PrismJS theme to React Email code block theme converter

This is a bit of code that has utilities to generate a [React Email](https://react.email) code block component theme
from the existing CSS of a PrismJS theme. I made this mostly because I was developing the component and needed
a fast way to get default themes without taking an eternity copying and pasting.

## What happens if I run the index.ts?

First and foremost, you need to run this with Bun because I made it with Bun and using Bun's APIs and it will 
error otherwise. 

As for what happens, it will read the themes defined inside of `./prism-themes`, which was cloned from the 
[here](https://github.com/PrismJS/prism-themes), and then will turn it into a react-email code block component theme
compose them all into a single `.json` file that will be written into `./generated-themes.json`.

## How can I use this then if it only does that?

You will need to just delete the last portion of the code that does what I said before, and use the `getThemeFromCSS` 
function passing in the CSS for the theme you want to convert.

That's all, thanks.
