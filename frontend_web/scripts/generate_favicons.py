"""Generate favicon assets from the official Smart Rehabilitation horizontal logo."""
from __future__ import annotations

import base64
import io
import struct
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/branding/smart_rehab_horizontal_logo.png"
PUBLIC = ROOT / "public"


def content_mask(img: Image.Image):
    import numpy as np

    arr = np.array(img.convert("RGBA"))
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    return (alpha > 10) & (np.max(rgb, axis=2) > 15)


def bbox_from_mask(mask):
    import numpy as np

    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise ValueError("No visible content found in source image")
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def extract_left_icon_mark(img: Image.Image) -> Image.Image:
    """Crop the left official icon mark from the horizontal logo."""
    import numpy as np

    rgba = img.convert("RGBA")
    mask = content_mask(rgba)
    col_counts = mask.sum(axis=0)
    h, w = mask.shape

    if col_counts.max() == 0:
        raise ValueError("Source image appears empty")

    threshold = max(1, int(col_counts.max() * 0.04))
    active = np.where(col_counts > threshold)[0]
    left, right = int(active[0]), int(active[-1])

    # Detect a horizontal gap separating icon from wordmark.
    search_start = max(left + 1, int(w * 0.18))
    search_end = min(right, int(w * 0.72))
    gap_candidates = [
        x
        for x in range(search_start, search_end)
        if col_counts[x] <= threshold
    ]

    if gap_candidates:
        # Use the widest low-density run as the separator.
        runs: list[tuple[int, int]] = []
        start = gap_candidates[0]
        prev = gap_candidates[0]
        for x in gap_candidates[1:]:
            if x == prev + 1:
                prev = x
                continue
            runs.append((start, prev))
            start = prev = x
        runs.append((start, prev))
        gap_start, gap_end = max(runs, key=lambda r: r[1] - r[0])
        crop_right = gap_start - 1
    else:
        # Square/icon-only asset: use full content width.
        crop_right = right

    x0, y0, x1, y1 = bbox_from_mask(mask[:, left : crop_right + 1])
    icon = rgba.crop((left + x0, y0, left + x1, y1))

    # Make near-black background transparent; preserve colored mark pixels.
    px = icon.load()
    iw, ih = icon.size
    for y in range(ih):
        for x in range(iw):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r < 20 and g < 20 and b < 20:
                px[x, y] = (r, g, b, 0)

    return icon


def fit_with_padding(icon: Image.Image, size: int, padding_ratio: float = 0.12) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * padding_ratio)
    inner = size - 2 * pad
    fitted = icon.copy()
    fitted.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    ox = (size - fitted.width) // 2
    oy = (size - fitted.height) // 2
    canvas.paste(fitted, (ox, oy), fitted)
    return canvas


def png_to_svg_embedded(png_bytes: bytes, size: int = 512) -> str:
    b64 = base64.b64encode(png_bytes).decode("ascii")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">\n'
        f'  <image width="{size}" height="{size}" href="data:image/png;base64,{b64}"/>\n'
        f"</svg>\n"
    )


def write_ico(sizes: dict[int, Image.Image], path: Path) -> None:
    """Write a multi-size ICO without external dependencies."""
    images: list[tuple[int, bytes]] = []
    for size in sorted(sizes):
        img = sizes[size]
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        images.append((size, buf.getvalue()))

    # ICO header
    out = io.BytesIO()
    out.write(struct.pack("<HHH", 0, 1, len(images)))
    offset = 6 + 16 * len(images)
    dir_entries = []
    for size, png_data in images:
        dir_entries.append(
            struct.pack(
                "<BBBBHHII",
                size if size < 256 else 0,
                size if size < 256 else 0,
                0,
                0,
                1,
                32,
                len(png_data),
                offset,
            )
        )
        offset += len(png_data)
    for entry in dir_entries:
        out.write(entry)
    for _, png_data in images:
        out.write(png_data)
    path.write_bytes(out.getvalue())


def main() -> None:
    source = Image.open(SOURCE)
    icon = extract_left_icon_mark(source)

    favicon_512 = fit_with_padding(icon, 512)
    favicon_180 = fit_with_padding(icon, 180)
    favicon_32 = fit_with_padding(icon, 32)
    favicon_16 = fit_with_padding(icon, 16)

    PUBLIC.mkdir(parents=True, exist_ok=True)

    favicon_512.save(PUBLIC / "apple-touch-icon.png", format="PNG")
    favicon_32.save(PUBLIC / "favicon-32.png", format="PNG")
    favicon_16.save(PUBLIC / "favicon-16.png", format="PNG")

    write_ico(
        {16: favicon_16, 32: favicon_32, 48: fit_with_padding(icon, 48)},
        PUBLIC / "favicon.ico",
    )

    svg_buf = io.BytesIO()
    favicon_512.save(svg_buf, format="PNG")
    (PUBLIC / "favicon.svg").write_text(
        png_to_svg_embedded(svg_buf.getvalue(), 512),
        encoding="utf-8",
    )

    print(f"Source: {SOURCE}")
    print(f"Extracted icon size: {icon.size}")
    print(f"Generated favicons in: {PUBLIC}")


if __name__ == "__main__":
    main()
