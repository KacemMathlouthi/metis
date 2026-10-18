"""Build every Metis brand asset from one mark geometry.

Writes the favicons (website + dashboard), the README logos in static/, and the PNG social
preview. Fonts are not vendored; fetch the SIL OFL fonts from google/fonts and pin the weights:

    mkdir -p /tmp/metis-fonts && cd /tmp/metis-fonts
    curl -fLo sg.ttf "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
    curl -fLo sora.ttf "https://github.com/google/fonts/raw/main/ofl/sora/Sora%5Bwght%5D.ttf"
    uv run --no-project --with fonttools python -c "from fontTools.ttLib import TTFont; \
      from fontTools.varLib.instancer import instantiateVariableFont as i; \
      i(TTFont('sg.ttf'), {'wght': 700}).save('SpaceGrotesk-Bold.ttf'); \
      i(TTFont('sora.ttf'), {'wght': 600}).save('Sora-SemiBold.ttf')"

Then, from the repository root:

    uv run --no-project --with pillow --with fonttools \
      python website/scripts/build_brand_assets.py . /tmp/metis-fonts

Mark: orange tile with a 2-unit black frame and a black Space Grotesk Bold "M", on a 32-unit
grid. The letter is stored as an outline, so it renders the same everywhere without the font.
At 16px (legacy ICO only) a hand-placed pixel M keeps it crisp.
"""

import sys
from pathlib import Path

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT, FONTS = Path(sys.argv[1]), Path(sys.argv[2])
ORANGE, INK, CREAM, WHITE = '#ff8205', '#000000', '#fff7f2', '#ffffff'

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

PIXEL_16 = [  # legacy 16px favicon: classic pixel M, K = ink, O = orange
    'KKKKKKKKKKKKKKKK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK',
    'KOOKKOOOOOOKKOOK', 'KOOKKKOOOOKKKOOK', 'KOOKKKKOOKKKKOOK', 'KOOKKOKKKKOKKOOK',
    'KOOKKOOKKOOKKOOK', 'KOOKKOOOOOOKKOOK', 'KOOKKOOOOOOKKOOK', 'KOOKKOOOOOOKKOOK',
    'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KOOOOOOOOOOOOOOK', 'KKKKKKKKKKKKKKKK',
]


def hex_rgb(value: str) -> tuple[int, int, int]:
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5))


def mark_svg_body(x: float = 0, y: float = 0, size: float = 32) -> str:
    """SVG elements for the mark at (x, y) with the given size."""
    s = size / 32
    return (
        f'<g transform="translate({x:g} {y:g}) scale({s:g})">'
        f'<rect width="32" height="32" fill="{INK}"/>'
        f'<rect x="{FRAME}" y="{FRAME}" width="{32 - 2 * FRAME}" height="{32 - 2 * FRAME}" fill="{ORANGE}"/>'
        f'<polygon points="{GLYPH_POINTS}" fill="{INK}"/>'
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
    f = FRAME * scale
    draw.rectangle([f, f, 32 * scale - f - 1, 32 * scale - f - 1], fill=ORANGE)
    draw.polygon([(px * scale, py * scale) for px, py in GLYPH], fill=INK)
    return img.resize((size, size), Image.BOX)


def pixel_16() -> Image.Image:
    img = Image.new('RGBA', (16, 16))
    colors = {'K': hex_rgb(INK) + (255,), 'O': hex_rgb(ORANGE) + (255,)}
    img.putdata([colors[c] for row in PIXEL_16 for c in row])
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
for public in ('website/public', 'frontend/public'):
    write(ROOT / public / 'favicon.svg', favicon_svg)

ico_base = render_mark(48)
ico_base.save(ROOT / 'website/public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[pixel_16(), render_mark(32)])
print('wrote website/public/favicon.ico')
# The dashboard keeps its existing file name.
ico_base.save(ROOT / 'frontend/public/metis.ico', sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[pixel_16(), render_mark(32)])
print('wrote frontend/public/metis.ico')

touch = Image.new('RGB', (180, 180), hex_rgb(INK))
touch.paste(render_mark(180).convert('RGB'))
touch.save(ROOT / 'website/public/apple-touch-icon.png', optimize=True)
print('wrote website/public/apple-touch-icon.png')

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


write(ROOT / 'static/metis-logo.svg', lockup(INK))
write(ROOT / 'static/metis-logo-dark.svg', lockup(WHITE))
write(
    ROOT / 'static/metis-logo-icon.svg',
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MARK + SHADOW} {MARK + SHADOW}" '
    f'width="{MARK + SHADOW}" height="{MARK + SHADOW}" role="img" aria-label="Metis">'
    f'<rect x="{SHADOW}" y="{SHADOW}" width="{MARK}" height="{MARK}" fill="{INK}"/>'
    + mark_svg_body(0, 0, MARK) + '</svg>\n',
)

# --- Social preview (1200x630 PNG; social networks don't render SVG previews) -------------
W, H = 1200, 630
og = Image.new('RGB', (W, H), hex_rgb(CREAM))
draw = ImageDraw.Draw(og)
draw.rectangle([0, 0, W - 1, H - 1], outline=hex_rgb(INK), width=12)
draw.rectangle([0, H - 64, W, H], fill=hex_rgb(INK))
mark = render_mark(200, shadow=2.5)
og.paste(mark, (96, 150), mark)
display = ImageFont.truetype(str(FONTS / 'SpaceGrotesk-Bold.ttf'), 150)
body = ImageFont.truetype(str(FONTS / 'Sora-SemiBold.ttf'), 34)
small = ImageFont.truetype(str(FONTS / 'Sora-SemiBold.ttf'), 24)
draw.text((350, 140), 'METIS', font=display, fill=hex_rgb(INK))
draw.text((356, 318), 'Open-source AI code review for GitHub', font=body, fill=hex_rgb(INK))
draw.text((356, 368), 'Reviews every pull request.', font=body, fill=(70, 70, 70))
draw.text((356, 412), 'Turns issues into pull requests.', font=body, fill=(70, 70, 70))
draw.rectangle([356, 470, 356 + 150, 478], fill=hex_rgb(ORANGE))
draw.text((48, H - 48), 'SELF-HOSTED  ·  MIT LICENSED  ·  ANY LLM', font=small, fill=hex_rgb(ORANGE))
buffer = ROOT / 'website/public/social-preview.png'
og.save(buffer, optimize=True)
print('wrote website/public/social-preview.png')
print('GLYPH_POINTS', GLYPH_POINTS)
