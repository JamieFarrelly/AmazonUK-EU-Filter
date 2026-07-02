import struct
import zlib
import math

EU_BLUE = (0, 51, 153)
EU_YELLOW = (255, 204, 0)
SUPERSAMPLE = 4


def star_polygon(cx, cy, outer_r, inner_r, points=5, rotation_deg=-90):
    verts = []
    for i in range(points * 2):
        angle = math.radians(rotation_deg) + i * math.pi / points
        r = outer_r if i % 2 == 0 else inner_r
        verts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return verts


def point_in_polygon(x, y, verts):
    inside = False
    n = len(verts)
    for i in range(n):
        x1, y1 = verts[i]
        x2, y2 = verts[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            x_at_y = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < x_at_y:
                inside = not inside
    return inside


def build_star_ring(size):
    cx = cy = size / 2
    ring_r = size * 0.32
    outer_r = size * 0.105
    inner_r = size * 0.042
    stars = []
    for i in range(12):
        angle = math.radians(-90 + i * 30)
        sx = cx + ring_r * math.cos(angle)
        sy = cy + ring_r * math.sin(angle)
        stars.append(star_polygon(sx, sy, outer_r, inner_r))
    return stars


def point_in_any_star(x, y, stars):
    for verts in stars:
        if point_in_polygon(x, y, verts):
            return True
    return False


def make_png(size, path):
    stars = build_star_ring(size)
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            hits = 0
            for sub in range(SUPERSAMPLE):
                sx = x + (sub % 2 + 0.5) / 2
                sy = y + (sub // 2 + 0.5) / 2
                if point_in_any_star(sx, sy, stars):
                    hits += 1
            t = hits / SUPERSAMPLE
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
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw, 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    for s in (16, 48, 128):
        make_png(s, f"icon{s}.png")
