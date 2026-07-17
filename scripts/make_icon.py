"""Generate simple solid-background PNG app icons with a water-drop glyph.
Uses only the standard library (zlib) so no image deps are required.
"""
import struct
import zlib
import sys

BG = (14, 116, 202)  # blue
DROP = (255, 255, 255)


def make_png(path, size):
    def in_drop(x, y):
        # Normalize to -1..1, origin center, y grows down.
        nx = (x - size / 2) / (size * 0.28)
        ny = (y - size / 2) / (size * 0.32)
        # Teardrop: circle for the lower part, point at the top.
        if ny < -0.15:
            # pointed top: narrow triangle
            t = (ny + 0.85) / 0.7  # 0 at tip(-0.85) .. 1 at (-0.15)
            if t < 0:
                return False
            width = 0.9 * t
            return abs(nx) <= width and ny >= -0.85
        else:
            return (nx * nx + (ny - (-0.15)) ** 2 / 1.15) <= 0.85

    rows = []
    for y in range(size):
        row = bytearray([0])  # filter byte
        for x in range(size):
            color = DROP if in_drop(x, y) else BG
            row += bytes(color)
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag, data):
        return (
            struct.pack("!I", len(data))
            + tag
            + data
            + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack("!IIBBBBB", size, size, 8, 2, 0, 0, 0)
    idat = zlib.compress(raw, 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
        make_png(f"{out_dir}/{name}", size)
        print(f"wrote {name}")
