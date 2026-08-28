import fs from 'node:fs'

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
const hero = fs.readFileSync(new URL('../src/mobile-subject-hero-gap-fix.css', import.meta.url), 'utf8')
const heading = fs.readFileSync(new URL('../src/mobile-study-heading-gap-fix.css', import.meta.url), 'utf8')
const overlap = fs.readFileSync(new URL('../src/text-overlap-guard.css', import.meta.url), 'utf8')

const fail = (message) => {
  console.error(`mobile-layout-gap verify failed: ${message}`)
  process.exit(1)
}

if (!overlap.includes('.study-section-heading > div') || !overlap.includes('flex: 1 1 440px')) {
  fail('expected shared desktop study heading flex-basis rule was not found')
}

for (const required of [
  '@media (max-width: 768px)',
  '.study-section-heading',
  '.study-section-heading > div',
  '.study-section-heading .law-reference',
  'flex-direction: column !important',
  'justify-content: flex-start !important',
  'flex-basis: auto !important',
  'min-height: 0 !important',
]) {
  if (!heading.includes(required)) fail(`heading guard missing: ${required}`)
}

for (const required of [
  '.public-law-hero',
  'justify-content: flex-start !important',
  'min-height: 0 !important',
]) {
  if (!hero.includes(required)) fail(`hero guard missing: ${required}`)
}

const heroImport = "import './mobile-subject-hero-gap-fix.css'"
const headingImport = "import './mobile-study-heading-gap-fix.css'"
if (!main.includes(heroImport)) fail('hero whitespace guard is not imported')
if (!main.includes(headingImport)) fail('study heading whitespace guard is not imported')
if (main.indexOf(headingImport) < main.indexOf(heroImport)) fail('study heading guard must load after hero guard')

const cssImports = [...main.matchAll(/^import ['"](.+\.css)['"]$/gm)].map((match) => match[1])
if (cssImports.at(-1) !== './mobile-study-heading-gap-fix.css') {
  fail('mobile study heading guard must be the final CSS import')
}

console.log('mobile-layout-gap verify: shared hero and study-heading whitespace guards are active')
