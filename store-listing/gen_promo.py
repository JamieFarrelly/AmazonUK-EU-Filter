import struct
import zlib
import math
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "icons"))
from gen_icons import EU_BLUE, EU_YELLOW, build_star_ring, point_in_any_star  # noqa: E402

SUPERSAMPLE = 2


def make_promo_png(width, height, path):
    star_size = min(width, height)
    stars = build_star_ring(star_size)
    offset_x = (width - star_size) / 2
    offset_y = (height - star_size) / 2

    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            hits = 0
            for sub in range(SUPERSAMPLE * SUPERSAMPLE):
                sx = x + (sub % SUPERSAMPLE + 0.5) / SUPERSAMPLE
                sy = y + (sub // SUPERSAMPLE + 0.5) / SUPERSAMPLE
                star_x = sx - offset_x
                star_y = sy - offset_y
                if 0 <= star_x < star_size and 0 <= star_y < star_size:
                    if point_in_any_star(star_x, star_y, stars):
                        hits += 1
            t = hits / (SUPERSAMPLE * SUPERSAMPLE)
            r = round(EU_BLUE[0] + (EU_YELLOW[0] - EU_BLUE[0]) * t)
            g = round(EU_BLUE[1] + (EU_YELLOW[1] - EU_BLUE[1]) * t)
            b = round(EU_BLUE[2] + (EU_YELLOW[2] - EU_BLUE[2]) * t)
            row += bytes([r, g, b, 255])
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw, 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    out_dir = os.path.dirname(__file__)
    make_promo_png(440, 280, os.path.join(out_dir, "promo", "small_tile.png"))
    make_promo_png(1400, 560, os.path.join(out_dir, "promo", "marquee.png"))
