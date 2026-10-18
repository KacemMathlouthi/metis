"""Build every Metis brand asset from one mark geometry.

Writes the favicons (landing site + dashboard), the README logos in static/, and the header
wordmark outline (the social preview comes from build_readme_banner.py). The font is not
vendored; fetch Space Grotesk (SIL OFL) from google/fonts and pin the weight:

    mkdir -p /tmp/metis-fonts && cd /tmp/metis-fonts
    curl -fLo sg.ttf "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
    uv run --no-project --with fonttools python -c "from fontTools.ttLib import TTFont; \
      from fontTools.varLib.instancer import instantiateVariableFont as i; \
      i(TTFont('sg.ttf'), {'wght': 700}).save('SpaceGrotesk-Bold.ttf')"

Then, from the repository root:

    uv run --no-project --with pillow --with fonttools \
      python landing/scripts/build_brand_assets.py . /tmp/metis-fonts

Mark: a yellow-to-red gradient tile with a 2-unit black frame and a white Space Grotesk Bold
"M", on a 32-unit grid. Letters are stored as outlines, so they render the same everywhere
without the font. At 16px (legacy ICO only) a hand-placed pixel M keeps it crisp.
"""

import sys
from pathlib import Path

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw

ROOT, FONTS = Path(sys.argv[1]), Path(sys.argv[2])
INK, WHITE = '#000000', '#ffffff'
# Tile gradient, top-left to bottom-right: yellow, orange-light, red.
GRADIENT = ((0.0, '#ffd800'), (0.55, '#ffaf00'), (1.0, '#e10500'))

FRAME = 2
# Cap height of the M inside the tile: matches 18px type in a 32px box.
GLYPH_CAP = 12.6


def glyph_outline(font_path: Path, char: str, cap: float) -> list[tuple[float, float]]:
    """Polygon of a straight-edged glyph, centered in the 32-unit tile at the given cap height."""
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    glyph = glyph_set[font.getBestCmap()[ord(char)]]
    recorder = RecordingPen()
    glyph.draw(recorder)
    points = [args[0] for op, args in recorder.value if op in ('moveTo', 'lineTo')]
    assert all(op in ('moveTo', 'lineTo', 'closePath') for op, _ in recorder.value), 'curves'
    assert sum(op == 'moveTo' for op, _ in recorder.value) == 1, 'single contour expected'
    xs, ys = [x for x, _ in points], [y for _, y in points]
    scale = cap / (max(ys) - min(ys))
    width = (max(xs) - min(xs)) * scale
    dx = (32 - width) / 2 - min(xs) * scale
    dy = (32 + cap) / 2 + min(ys) * scale
    return [(round(x * scale + dx, 2), round(dy - y * scale, 2)) for x, y in points]


GLYPH = glyph_outline(FONTS / 'SpaceGrotesk-Bold.ttf', 'M', GLYPH_CAP)
GLYPH_POINTS = ' '.join(f'{x:g},{y:g}' for x, y in GLYPH)

PIXEL_16 = [  # legacy 16px favicon: K = ink (frame) or white (glyph), O = gradient tile
    'KKKKKKKKKKKKKKKK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK',
    'KOOKKOOOOOOKKOOK', 'KOOKKKOOOOKKKOOK', 'KOOKKKKOOKKKKOOK', 'KOOKKOKKKKOKKOOK',
    'KOOKKOOKKOOKKOOK', 'KOOKKOOOOOOKKOOK', 'KOOKKOOOOOOKKOOK', 'KOOKKOOOOOOKKOOK',
    'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KKKKKKKKKKKKKKKK',
]


def hex_rgb(value: str) -> tuple[int, int, int]:
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5))


def gradient_at(t: float) -> tuple[int, int, int]:
    """Tile gradient color at position t in [0, 1] along the diagonal."""
    for (t0, c0), (t1, c1) in zip(GRADIENT, GRADIENT[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            a, b = hex_rgb(c0), hex_rgb(c1)
            return tuple(round(a[i] + (b[i] - a[i]) * k) for i in range(3))
    return hex_rgb(GRADIENT[-1][1])


def gradient_image(width: int, height: int) -> Image.Image:
    """Diagonal gradient (top-left to bottom-right), like SVG's objectBoundingBox 0,0 -> 1,1."""
    span = max(width + height - 2, 1)
    lut = [gradient_at(i / span) for i in range(span + 1)]
    img = Image.new('RGB', (width, height))
    img.putdata([lut[x + y] for y in range(height) for x in range(width)])
    return img


def mark_svg_body(x: float = 0, y: float = 0, size: float = 32) -> str:
    """SVG elements for the mark at (x, y) with the given size."""
    s = size / 32
    stops = ''.join(f'<stop offset="{t:g}" stop-color="{c}"/>' for t, c in GRADIENT)
    return (
        f'<defs><linearGradient id="metis-tile" x1="0" y1="0" x2="1" y2="1">{stops}</linearGradient></defs>'
        f'<g transform="translate({x:g} {y:g}) scale({s:g})">'
        f'<rect width="32" height="32" fill="{INK}"/>'
        f'<rect x="{FRAME}" y="{FRAME}" width="{32 - 2 * FRAME}" height="{32 - 2 * FRAME}" fill="url(#metis-tile)"/>'
        f'<polygon points="{GLYPH_POINTS}" fill="{WHITE}"/>'
        '</g>'
    )


def render_mark(size: int, shadow: float = 0) -> Image.Image:
    """Raster mark; `shadow` is the hard offset in grid units (canvas grows to fit)."""
    ss = 8
    total = 32 + shadow
    scale = size * ss / total
    img = Image.new('RGBA', (size * ss, size * ss), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if shadow:
        draw.rectangle([shadow * scale, shadow * scale, total * scale - 1, total * scale - 1], fill=INK)
    draw.rectangle([0, 0, 32 * scale - 1, 32 * scale - 1], fill=INK)
    f = round(FRAME * scale)
    inner = round(32 * scale) - 2 * f
    img.paste(gradient_image(inner, inner), (f, f))
    draw.polygon([(px * scale, py * scale) for px, py in GLYPH], fill=WHITE)
    return img.resize((size, size), Image.BOX)


def pixel_16() -> Image.Image:
    img = Image.new('RGBA', (16, 16))
    pixels = []
    for y, row in enumerate(PIXEL_16):
        for x, c in enumerate(row):
            if c == 'O':
                pixels.append(gradient_at((x + y - 2) / 24) + (255,))
            elif x in (0, 15) or y in (0, 15):
                pixels.append(hex_rgb(INK) + (255,))
            else:
                pixels.append(hex_rgb(WHITE) + (255,))
    img.putdata(pixels)
    return img


def wordmark_path(text: str, font_path: Path, cap_height: float, tracking_em: float) -> tuple[str, float]:
    """Outline `text` as one SVG path, scaled so capitals are `cap_height` tall.

    Returns (path data, advance width). The path's baseline sits at y = cap_height.
    """
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    units_cap = font['OS/2'].sCapHeight
    scale = cap_height / units_cap
    tracking = tracking_em * font['head'].unitsPerEm
    pen = SVGPathPen(glyph_set)
    cursor = 0.0
    for i, char in enumerate(text):
        name = cmap[ord(char)]
        # Flip y (font units point up) and place the baseline at cap_height.
        transform = TransformPen(pen, (scale, 0, 0, -scale, cursor * scale, cap_height))
        glyph_set[name].draw(transform)
        cursor += glyph_set[name].width + (tracking if i < len(text) - 1 else 0)
    return pen.getCommands(), cursor * scale


def write(path: Path, content: str | bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, bytes):
        path.write_bytes(content)
    else:
        path.write_text(content)
    print('wrote', path.relative_to(ROOT))


# --- Favicons -------------------------------------------------------------------------
favicon_svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' + mark_svg_body() + '</svg>\n'
)
for public in ('landing/public', 'frontend/public'):
    write(ROOT / public / 'favicon.svg', favicon_svg)

ico_base = render_mark(48)
ico_base.save(ROOT / 'landing/public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[pixel_16(), render_mark(32)])
print('wrote landing/public/favicon.ico')
# The dashboard keeps its existing file name.
ico_base.save(ROOT / 'frontend/public/metis.ico', sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[pixel_16(), render_mark(32)])
print('wrote frontend/public/metis.ico')

touch = Image.new('RGB', (180, 180), hex_rgb(INK))
touch.paste(render_mark(180).convert('RGB'))
touch.save(ROOT / 'landing/public/apple-touch-icon.png', optimize=True)
print('wrote landing/public/apple-touch-icon.png')

# --- README / static logos ------------------------------------------------------------
MARK = 64          # lockup mark size
SHADOW = 4         # hard shadow offset
CAP = 40           # wordmark cap height
GAP = 22
word_d, word_w = wordmark_path('METIS', FONTS / 'SpaceGrotesk-Bold.ttf', CAP, -0.04)
word_y = (MARK - CAP) / 2


def lockup(word_fill: str) -> str:
    width = MARK + SHADOW + GAP + word_w
    height = MARK + SHADOW
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {height:g}" '
        f'width="{width:.0f}" height="{height:g}" role="img" aria-label="Metis">'
        f'<rect x="{SHADOW}" y="{SHADOW}" width="{MARK}" height="{MARK}" fill="{INK}"/>'
        + mark_svg_body(0, 0, MARK)
        + f'<path transform="translate({MARK + SHADOW + GAP} {word_y:g})" d="{word_d}" fill="{word_fill}"/>'
        '</svg>\n'
    )


write(
    ROOT / 'landing/src/components/layout/wordmark.ts',
    '// Generated by landing/scripts/build_brand_assets.py: "METIS" in Space Grotesk Bold, outlined\n'
    '// so the header wordmark keeps its original look without loading the font.\n'
    f'export const WORDMARK_PATH =\n  {word_d!r};\n'.replace("'", '"')
    + f'export const WORDMARK_VIEWBOX = "0 0 {word_w:.2f} {CAP}";\n',
)
write(ROOT / 'static/metis-logo.svg', lockup(INK))
write(ROOT / 'static/metis-logo-dark.svg', lockup(WHITE))
write(
    ROOT / 'static/metis-logo-icon.svg',
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MARK + SHADOW} {MARK + SHADOW}" '
    f'width="{MARK + SHADOW}" height="{MARK + SHADOW}" role="img" aria-label="Metis">'
    f'<rect x="{SHADOW}" y="{SHADOW}" width="{MARK}" height="{MARK}" fill="{INK}"/>'
    + mark_svg_body(0, 0, MARK) + '</svg>\n',
)

print('GLYPH_POINTS', GLYPH_POINTS)
