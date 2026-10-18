"""Turn a source illustration into the responsive cover images for one docs page.

Usage, from the repository root:

    uv run --no-project --with pillow python website/scripts/optimize_doc_cover.py <image> <slug>

<slug> is the docs page's last path segment ("quickstart", "github-app", ...; "introduction"
for /docs). Writes website/src/assets/doc-covers/<slug>-800.webp and <slug>-1600.webp, which
the page then shows as its cover, under the title.
"""

import sys
from pathlib import Path

from PIL import Image

WIDTHS = (800, 1600)
# Halftone dot texture smears below ~80; this keeps the grain while staying small.
QUALITY = 82
# Not named "docs": the repository's root .gitignore ignores every docs/ directory.
OUT_DIR = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'doc-covers'


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    source, slug = Path(sys.argv[1]), sys.argv[2]
    if not slug.replace('-', '').isalnum():
        sys.exit(f'invalid slug: {slug!r}')

    image = Image.open(source).convert('RGB')
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for width in WIDTHS:
        height = round(image.height * width / image.width)
        target = OUT_DIR / f'{slug}-{width}.webp'
        image.resize((width, height), Image.LANCZOS).save(target, 'WEBP', quality=QUALITY, method=6)
        print(f'{target.relative_to(OUT_DIR.parents[2])}: {width}x{height}, {target.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
