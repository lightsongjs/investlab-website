# QR Codes — InvestLab

Sursă unică pentru toate QR-urile folosite în prezentări, flyere, materiale print.
Toate variantele codează același URL: **`https://app.investlab.ro/signup`**.

## Variante disponibile

| Fișier | Logo IL | Recomandat pentru |
|--------|---------|-------------------|
| `signup.svg` | 22% (premium) | Default. Flyere A5/A4, slide BNI, postere — tot ce e ≥ 3 cm pe print |
| `signup-safe.svg` | 16% (mai mic) | Print mic (carduri de vizită, ≤ 2 cm), iluminare slabă, scan de la distanță |
| `signup-plain.svg` | fără logo | Fallback ultim — dacă variantele cu logo dau probleme la scan |

**Culori brand:**
- Module: navy `#0f2942`
- Background: alb `#ffffff`
- Logo IL: navy + alb + verde `#3aa861`

## Generare

```bash
cd ilWebsite
npm run qr
```

Adaugă noi destinații / variante în `scripts/generate-qr.mjs`.

## Specificații tehnice

- Format: **SVG vector** (scalabil la orice DPI, print-ready)
- Error correction: **level H** (~30% rezistență la deteriorare → permite logo central)
- Dimensiune matrice: 33×33 module + quiet zone 4 module
- Module: pătrate solide, `shape-rendering="crispEdges"`

## Pentru tipografie

Trimite **`signup.svg`** ca default. Atașează și `signup-safe.svg` ca backup dacă printul e foarte mic.
Toate tipografiile premium acceptă SVG direct.

Conversie la PNG high-res (dacă cer raster):
```bash
magick assets/qr/signup.svg -resize 2000x2000 signup.png
# sau cu Inkscape:
inkscape assets/qr/signup.svg --export-type=png --export-width=2000
```

## Înainte să trimiți la print — TESTEAZĂ

1. Deschide SVG-ul pe ecran
2. Scanează cu telefonul (camera native)
3. Confirmă că deschide `https://app.investlab.ro/signup`
4. Dacă scan-ul șovăie → folosește `signup-safe.svg` sau `signup-plain.svg`
