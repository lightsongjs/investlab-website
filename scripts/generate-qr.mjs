import QRCode from 'qrcode'
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'assets/qr')
const BRAND_ICON = resolve(ROOT, 'assets/brand/investlab-il-icon.svg')

// InvestLab brand
const NAVY = '#0f2942'
const WHITE = '#ffffff'

// All variants encode the same URL — the print shop picks the one that fits.
const URL = 'https://app.investlab.ro/signup'
const VARIANTS = [
  // Primary — branded, looks the most "premium" but largest logo footprint.
  { name: 'signup',       logoRatio: 0.22 },
  // Safety — smaller logo, easier to scan at small print sizes or low light.
  { name: 'signup-safe',  logoRatio: 0.16 },
  // Plain — no logo at all. Ultimate fallback if anything looks wrong.
  { name: 'signup-plain', logoRatio: 0    },
]

// H = ~30% error correction — required because we punch a logo into the center.
const QR_OPTS = { errorCorrectionLevel: 'H' }

// Quiet zone (white border around the QR), measured in modules.
const QUIET_ZONE = 4

await mkdir(OUT_DIR, { recursive: true })

// Inline the brand icon's inner SVG so the QR is fully self-contained.
const iconSvgRaw = await readFile(BRAND_ICON, 'utf8')
const iconViewBox = (iconSvgRaw.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 512 512'
const iconInner = iconSvgRaw
  .replace(/<\?xml[^?]*\?>/g, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim()

// Build the QR matrix once — all variants share the same payload.
const qr = QRCode.create(URL, QR_OPTS)
const size = qr.modules.size
const data = qr.modules.data
const totalSize = size + QUIET_ZONE * 2

const rects = []
for (let row = 0; row < size; row++) {
  for (let col = 0; col < size; col++) {
    if (data[row * size + col]) {
      rects.push(`<rect x="${col + QUIET_ZONE}" y="${row + QUIET_ZONE}" width="1" height="1"/>`)
    }
  }
}
const modulesGroup = `<g fill="${NAVY}">\n    ${rects.join('\n    ')}\n  </g>`

for (const { name, logoRatio } of VARIANTS) {
  let logoLayer = ''
  if (logoRatio > 0) {
    const logoSize = totalSize * logoRatio
    const logoX = (totalSize - logoSize) / 2
    const logoY = (totalSize - logoSize) / 2
    const padding = logoSize * 0.12
    const knockoutSize = logoSize + padding * 2
    const knockoutX = (totalSize - knockoutSize) / 2
    const knockoutY = (totalSize - knockoutSize) / 2
    const knockoutR = knockoutSize * 0.18

    logoLayer = `
  <rect x="${knockoutX.toFixed(3)}" y="${knockoutY.toFixed(3)}" width="${knockoutSize.toFixed(3)}" height="${knockoutSize.toFixed(3)}" rx="${knockoutR.toFixed(3)}" ry="${knockoutR.toFixed(3)}" fill="${WHITE}"/>
  <svg x="${logoX.toFixed(3)}" y="${logoY.toFixed(3)}" width="${logoSize.toFixed(3)}" height="${logoSize.toFixed(3)}" viewBox="${iconViewBox}">
    ${iconInner}
  </svg>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges" role="img" aria-label="InvestLab signup QR code">
  <rect width="${totalSize}" height="${totalSize}" fill="${WHITE}"/>
  ${modulesGroup}${logoLayer}
</svg>
`

  const path = resolve(OUT_DIR, `${name}.svg`)
  await writeFile(path, svg, 'utf8')
  const logoDesc = logoRatio > 0 ? `logo ${(logoRatio * 100).toFixed(0)}%` : 'no logo'
  console.log(`✓ ${name}.svg → ${URL}  (${size}×${size}, ${logoDesc})`)
}
