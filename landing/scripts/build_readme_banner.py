"""Compose the Metis banner: a background illustration, a vignette, the logo, and a tagline.

Usage, from the repository root:

    uv run --no-project --with pillow --with fonttools --with brotli --with resvg-py \\
      python landing/scripts/build_readme_banner.py <background-image>

Writes the README banner (static/metis-banner.jpg, 1600x800) and the landing site's social preview
(landing/public/social-preview.jpg, 1200x630). The logo comes from static/metis-logo-dark.svg and the
text is set in Geist, the landing site's font (landing/src/assets/fonts).
"""

import io
import math
import sys
from pathlib import Path

import resvg_py
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
# (path, width, height, layout scale). The social preview runs a little larger relative to its
# frame because link previews are shown small in feeds.
OUTPUTS = (
    (ROOT / 'static' / 'metis-banner.jpg', 1600, 800, 1.0),
    (ROOT / 'landing' / 'public' / 'social-preview.jpg', 1200, 630, 0.85),
)
LOGO = ROOT / 'static' / 'metis-logo-dark.svg'
GEIST = ROOT / 'landing' / 'src' / 'assets' / 'fonts' / 'Geist-Variable.woff2'

LOGO_WIDTH = 720  # at scale 1.0
TITLE = 'Open-source AI code review for GitHub'
SUBTITLE = 'Reviews every pull request  ·  Turns issues into pull requests  ·  Self-hosted, any LLM'


def geist(weight: int, size: int) -> ImageFont.FreeTypeFont:
    """A static Geist instance at `weight` (Pillow cannot read variable woff2 directly)."""
    font = TTFont(GEIST)
    font.flavor = None
    buffer = io.BytesIO()
    instantiateVariableFont(font, {'wght': weight}).save(buffer)
    buffer.seek(0)
    return ImageFont.truetype(buffer, size)


def cover(image: Image.Image, width: int, height: int) -> Image.Image:
    """Scale and center-crop to the output size."""
    scale = max(width / image.width, height / image.height)
    resized = image.resize((math.ceil(image.width * scale), math.ceil(image.height * scale)), Image.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def radial_mask(strength_at, size: tuple[int, int], blur: int) -> Image.Image:
    """Grayscale mask whose value depends on normalized elliptical distance from the center."""
    w, h = size
    small_w, small_h = w // 8, h // 8
    mask = Image.new('L', (small_w, small_h))
    mask.putdata([
        round(255 * strength_at(math.hypot((x - small_w / 2) / (small_w / 2), (y - small_h / 2) / (small_h / 2))))
        for y in range(small_h) for x in range(small_w)
    ])
    return mask.resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    t = min(max((x - edge0) / (edge1 - edge0), 0.0), 1.0)
    return t * t * (3 - 2 * t)


def draw_centered(canvas: Image.Image, text: str, font: ImageFont.FreeTypeFont, y: int, fill) -> None:
    """Centered text with a soft shadow so it stays legible over busy artwork."""
    draw = ImageDraw.Draw(canvas)
    width = draw.textlength(text, font=font)
    x = (canvas.width - width) / 2
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((x, y + 2), text, font=font, fill=(0, 0, 0, 200))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(6)))
    draw.text((x, y), text, font=font, fill=fill)


def compose(source: Image.Image, width: int, height: int, scale: float) -> Image.Image:
    """Lay out the banner at `width` x `height`; `scale` sizes the logo, type, and spacing."""
    banner = cover(source, width, height).convert('RGBA')

    def px(value: float) -> int:
        return round(value * scale)

    logo = Image.open(
        io.BytesIO(bytes(resvg_py.svg_to_bytes(svg_path=str(LOGO), width=px(LOGO_WIDTH))))
    ).convert('RGBA')
    title_font, subtitle_font = geist(600, px(44)), geist(500, px(26))
    logo_gap, title_to_subtitle, subtitle_height = px(24), px(64), px(34)
    block_height = logo.height + logo_gap + title_to_subtitle + subtitle_height
    logo_top = (height - block_height) // 2  # keep the logo + tagline block vertically centered
    text_top = logo_top + logo.height + logo_gap
    subtitle_top = text_top + title_to_subtitle

    black = Image.new('RGBA', banner.size, (0, 0, 0, 255))
    # Vignette: darken toward the edges and corners.
    banner = Image.composite(black, banner, radial_mask(lambda r: 0.7 * smoothstep(0.45, 1.35, r), banner.size, 40))
    # Pool of shade around the middle.
    banner = Image.composite(black, banner, radial_mask(lambda r: 0.5 * (1 - smoothstep(0.1, 0.95, r)), banner.size, 60))
    # Soft dark shadow shaped to the logo and tagline block, so all of it sits in shade.
    measure = ImageDraw.Draw(banner)
    content_width = max(logo.width, measure.textlength(TITLE, font=title_font), measure.textlength(SUBTITLE, font=subtitle_font))
    pad_x, pad_y = px(90), px(70)
    shadow = Image.new('L', banner.size, 0)
    ImageDraw.Draw(shadow).rounded_rectangle(
        ((width - content_width) / 2 - pad_x, logo_top - pad_y, (width + content_width) / 2 + pad_x, subtitle_top + subtitle_height + pad_y),
        radius=px(120),
        fill=165,
    )
    banner = Image.composite(black, banner, shadow.filter(ImageFilter.GaussianBlur(px(70))))

    banner.alpha_composite(logo, ((width - logo.width) // 2, logo_top))
    draw_centered(banner, TITLE, title_font, text_top, (255, 255, 255, 255))
    draw_centered(banner, SUBTITLE, subtitle_font, subtitle_top, (255, 255, 255, 230))
    return banner.convert('RGB')


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = Image.open(sys.argv[1]).convert('RGB')
    for path, width, height, scale in OUTPUTS:
        compose(source, width, height, scale).save(path, 'JPEG', quality=86, optimize=True, progressive=True)
        print(f'wrote {path.relative_to(ROOT)}: {width}x{height}, {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
