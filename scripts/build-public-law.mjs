import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = resolve(root, 'content/public-law')
const outputFile = resolve(root, 'public/public-law.html')
const expectedSha256 = '45ce21241299adb215b612c4d5fd2e9074f7002f8cc469c00888175610b98a1e'
const expectedBytes = 314492

const parts = (await readdir(sourceDir))
  .filter((name) => name.startsWith('public-law.html.gz.b64.'))
  .sort()

if (!parts.length) {
  throw new Error('No compressed public-law source parts found.')
}

const encoded = (
  await Promise.all(parts.map((name) => readFile(resolve(sourceDir, name), 'utf8')))
).join('').replace(/\s+/g, '')

const raw = gunzipSync(Buffer.from(encoded, 'base64'))
const html = raw.toString('utf8')
const actualSha256 = createHash('sha256').update(raw).digest('hex')

if (raw.byteLength !== expectedBytes || actualSha256 !== expectedSha256) {
  throw new Error(`Public-law source integrity failed: bytes=${raw.byteLength}, sha256=${actualSha256}`)
}

const requiredMarkers = [
  '<title>부동산공법 핵심정리 | 공인중개사 2차</title>',
  'id="c1s1"',
  'id="c6s3"',
  '통합 사이트 타이포그래피·반응형 규칙',
]

for (const marker of requiredMarkers) {
  if (!html.includes(marker)) {
    throw new Error(`Public-law source validation failed: missing ${marker}`)
  }
}

await mkdir(dirname(outputFile), { recursive: true })
await writeFile(outputFile, html, 'utf8')

console.log(`Restored public-law.html from ${parts.length} compressed parts (${raw.byteLength} bytes, sha256 ${actualSha256}).`)
