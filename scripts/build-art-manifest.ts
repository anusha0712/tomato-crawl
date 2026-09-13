/**
 * Generates data/art-manifest.json — the list of artwork actually present in
 * public/art. The UI consults it before requesting an image, so an empty art
 * folder costs zero failed requests instead of one 404 per card.
 *
 * Generated file. Regenerate with `npm run art` after adding or removing art.
 */
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'public', 'art')
const isArt = (f: string) => /\.(png|jpe?g|webp|avif|svg)$/i.test(f)

const hero = existsSync(join(root, 'hero.png'))
const stopsDir = join(root, 'stops')
const stops = existsSync(stopsDir)
  ? readdirSync(stopsDir)
      .filter(isArt)
      .map((f) => f.replace(/\.[^.]+$/, ''))
      .sort()
  : []

const out = { generatedBy: 'scripts/build-art-manifest.ts', hero, stops }
writeFileSync(join(process.cwd(), 'data', 'art-manifest.json'), JSON.stringify(out, null, 2) + '\n')
console.log(`  art manifest: hero=${hero}, ${stops.length} stop image(s)`)
