import { Declaration, Rule, parse } from 'css';

import Prism from 'prismjs';

type CSS = Record<string, string>;

type CodeBlockTheme = Partial<Record<keyof Prism.Grammar, CSS>> & {
  base: CSS;
};

function camelize(text: string) {
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function fromDeclarationsToCSSObject(declarations: Declaration[]): CSS {
  const css: CSS = {};
  declarations.filter(d => d.type === 'declaration')
    .forEach((declaration: Declaration) => {
      if (declaration.property && declaration.value) {
        css[camelize(declaration.property)] = declaration.value;
      } else {
        console.warn(`Weird declaration without property nor value defined: ${JSON.stringify(declaration)}`);
      }
    });
  return css;
}

export function getThemeFromCSS(css: string): CodeBlockTheme {
  const stylesheet = parse(css);
  const theme: CodeBlockTheme = { base: {} };

  stylesheet.stylesheet?.rules.forEach((node) => {
    if (node.type === 'rule') {
      const rule = node as Rule;

      if (Array.isArray(rule.selectors)) {
        if (rule.selectors.some(
          (selector) => selector === 'code[class*="language-"]' || selector === 'pre[class*="language-"]'
        ) && rule.declarations) { // these are the base styles
          theme.base = { ...theme.base, ...fromDeclarationsToCSSObject(rule.declarations) };
        } else if (rule.selectors.some(selector => selector.startsWith('.token')) && rule.declarations) {
          const tokenSelectors = rule.selectors.filter(selector => selector.startsWith('.token'));

          const tokenTypesThatStylesAppliesTo = tokenSelectors.map(selector => selector.slice(7)) as (keyof Prism.Grammar)[];
          const cssObject = fromDeclarationsToCSSObject(rule.declarations);

          for (const tokenType of tokenTypesThatStylesAppliesTo) {
            theme[tokenType] = { ...theme[tokenType], ...cssObject };
          }
        }
      }
    }
  });

  return theme;
}

import { readdir } from 'fs/promises';

const filesInsideThemes = await readdir('./prism-themes/themes', { withFileTypes: true });
const themeFiles = filesInsideThemes.filter(file => file.name.endsWith('.css') && file.isFile());

const themes: Record<string, any> = {};

for (const themeFile of themeFiles) {
  const themePath = `./prism-themes/themes/${themeFile.name}`;
  const themeName = themeFile.name.slice(6, -4); // removes the "prism-" prefix and the ".css" suffix
  const themeCSS = await Bun.file(themePath).text();

  themes[themeName] = getThemeFromCSS(themeCSS);
};

Bun.write('./generated-themes.json', JSON.stringify(themes, null, 2));
