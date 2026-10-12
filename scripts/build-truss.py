#!/usr/bin/env python3
"""Draw the ground-support truss of the home stage and write it into dist/index.html.

Run from the repo root after changing the geometry:
    python3 scripts/build-truss.py

The SVG uses a 1000x1000 viewBox stretched over .stage-preview, so x and y are
percentages x10. The front plane matches the CSS layout (strobes, side strobes,
fixtures and line-array motors sit on it); the roof and rear towers are projected
towards a vanishing point to give the structure depth.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'dist' / 'index.html'

VANISH = (500, 450)          # eye level a little above the deck
REAR = 0.8                   # scale of the rear plane (roof depth)
TOWER_DEPTH = 0.982          # scale for one truss width of depth

TRUSS_TOP, TRUSS_BOTTOM = 92, 176
LEFT_TOWER, RIGHT_TOWER = (66, 110), (890, 934)
FLOOR = 860
HEADER = 40


def back(point, scale):
    x, y = point
    return (VANISH[0] + scale * (x - VANISH[0]), VANISH[1] + scale * (y - VANISH[1]))


def f(n):
    return f'{n:.1f}'.rstrip('0').rstrip('.')


def line(a, b):
    return f'M{f(a[0])} {f(a[1])}L{f(b[0])} {f(b[1])}'


def poly(*points, close=True):
    d = 'M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in points)
    return d + ('Z' if close else '')


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def lattice(a1, a2, b1, b2, cells):
    """Zigzag web between chord a1->a2 and chord b1->b2."""
    parts = []
    for n in range(cells):
        t0, t1 = n / cells, (n + 1) / cells
        top0, top1 = lerp(a1, a2, t0), lerp(a1, a2, t1)
        bot0, bot1 = lerp(b1, b2, t0), lerp(b1, b2, t1)
        parts.append(line(top0, bot1) if n % 2 == 0 else line(bot0, top1))
        parts.append(line(bot0, top1) if n % 2 == 0 else line(top0, bot1))
    return ''.join(parts)


def column(x0, x1, y0, y1, scale=1.0):
    """A vertical box-truss column: chords, rungs every cell and X bracing."""
    if scale != 1.0:
        (x0, y0), (x1, y1) = back((x0, y0), scale), back((x1, y1), scale)
    width = x1 - x0
    cells = max(2, round((y1 - y0) / (width * 1.6)))
    step = (y1 - y0) / cells
    chords = line((x0, y0), (x0, y1)) + line((x1, y0), (x1, y1))
    web = ''.join(line((x0, y0 + n * step), (x1, y0 + (n + 1) * step)) + line((x1, y0 + n * step), (x0, y0 + (n + 1) * step)) for n in range(cells))
    rungs = ''.join(line((x0, y0 + n * step), (x1, y0 + n * step)) for n in range(cells + 1))
    return chords, web, rungs


def outrigger(x0, x1):
    """Four-leg base with levelling feet; front/back legs follow the perspective."""
    cx, foot = (x0 + x1) / 2, FLOOR + 40
    top = FLOOR - 50
    front = (cx + (cx - VANISH[0]) * 0.18, foot + 55)
    rear = back((cx, foot), 0.9)
    legs = (line((x0, top), (x0 - 70, foot)) + line((x1, top), (x1 + 70, foot)) +
            line((cx, FLOOR), front) + line((cx, FLOOR), rear) +
            line((x0 - 70, foot), (x1 + 70, foot)))
    feet = ''.join(f'<rect x="{f(x - 9)}" y="{f(y - 3)}" width="18" height="6" rx="2"/>'
                   for x, y in ((x0 - 70, foot), (x1 + 70, foot), front, rear))
    return legs, feet


def hoist(x, y_top, y_bottom, scale=1.0):
    """Chain hoist hung from a tower header, pulling the roof corner block."""
    if scale != 1.0:
        x, y_top = back((x, y_top), scale)
        _, y_bottom = back((x, y_bottom), scale)
    body_h = 22 * scale
    chain = line((x, y_top), (x, y_bottom))
    body = f'<rect class="truss-motor" x="{f(x - 9 * scale)}" y="{f(y_top + 6 * scale)}" width="{f(18 * scale)}" height="{f(body_h)}" rx="{f(4 * scale)}"/>'
    return chain, body


def build():
    lt0, lt1 = LEFT_TOWER
    rt0, rt1 = RIGHT_TOWER
    tl, tr = (60, TRUSS_TOP), (940, TRUSS_TOP)
    bl, br = (60, TRUSS_BOTTOM), (940, TRUSS_BOTTOM)

    rear_paths, rear_web = [], []
    # Rear truss and rear towers, drawn first and dimmer (further away).
    rtl, rtr, rbl, rbr = back(tl, REAR), back(tr, REAR), back(bl, REAR), back(br, REAR)
    rear_paths.append(line(rtl, rtr) + line(rbl, rbr))
    rear_web.append(lattice(rtl, rtr, rbl, rbr, 26))
    for x0, x1 in (LEFT_TOWER, RIGHT_TOWER):
        chords, web, rungs = column(x0, x1, TRUSS_BOTTOM, FLOOR, REAR)
        rear_paths.append(chords)
        rear_web.append(web + rungs)
        top_x0, top_y = back((x0, HEADER), REAR)
        top_x1, _ = back((x1, HEADER), REAR)
        cap = back((x0, TRUSS_TOP), REAR)[1]
        rear_paths.append(line((top_x0, top_y), (top_x0, cap)) + line((top_x1, top_y), (top_x1, cap)))
        rear_paths.append(line((top_x0 - 6, top_y), (top_x1 + 6, top_y)))

    side_paths, side_web = [], []
    # Side roof trusses receding from the front corners to the rear truss.
    for outer, inner in ((60, 110), (940, 890)):
        for x in (outer, inner):
            side_paths.append(line((x, TRUSS_TOP), back((x, TRUSS_TOP), REAR)))
            side_paths.append(line((x, TRUSS_BOTTOM), back((x, TRUSS_BOTTOM), REAR)))
        side_web.append(lattice((outer, TRUSS_TOP), back((outer, TRUSS_TOP), REAR),
                                (outer, TRUSS_BOTTOM), back((outer, TRUSS_BOTTOM), REAR), 7))
        side_web.append(lattice((outer, TRUSS_BOTTOM), back((outer, TRUSS_BOTTOM), REAR),
                                (inner, TRUSS_BOTTOM), back((inner, TRUSS_BOTTOM), REAR), 7))

    front_paths, front_web, front_shade, details = [], [], [], []
    # Front truss: face lattice plus the underside seen from the audience.
    front_paths.append(line(tl, tr) + line(bl, br))
    front_web.append(lattice(tl, tr, bl, br, 20))
    ubl, ubr = back(bl, TOWER_DEPTH), back(br, TOWER_DEPTH)
    front_shade.append(poly(bl, br, ubr, ubl))
    front_web.append(lattice(bl, br, ubl, ubr, 40))
    front_paths.append(line(ubl, ubr))
    # Front towers with their inner face, header and base.
    for (x0, x1), inner in ((LEFT_TOWER, 'right'), (RIGHT_TOWER, 'left')):
        chords, web, rungs = column(x0, x1, TRUSS_BOTTOM, FLOOR - 50)
        front_paths.append(chords)
        front_web.append(web + rungs)
        edge = x1 if inner == 'right' else x0
        deep = back((edge, TRUSS_BOTTOM), TOWER_DEPTH)[0]
        front_shade.append(poly((edge, TRUSS_BOTTOM), (deep, back((edge, TRUSS_BOTTOM), TOWER_DEPTH)[1]),
                                (deep, back((edge, FLOOR - 50), TOWER_DEPTH)[1]), (edge, FLOOR - 50)))
        up_chords, up_web, up_rungs = column(x0, x1, HEADER + 14, TRUSS_TOP)
        front_paths.append(up_chords)
        front_web.append(up_web + up_rungs)
        legs, feet = outrigger(x0, x1)
        front_paths.append(legs)
        details.append(feet)
        details.append(f'<rect class="truss-plate" x="{x0 - 12}" y="{HEADER}" width="{x1 - x0 + 24}" height="14" rx="2"/>')
        # Sleeve block: the collar that rides up the tower carrying the roof corner.
        details.append(f'<rect class="truss-sleeve" x="{x0 - 5}" y="{TRUSS_BOTTOM - 4}" width="{x1 - x0 + 10}" height="12" rx="2"/>')
        motor_x = x1 + 16 if inner == 'right' else x0 - 16
        chain, body = hoist(motor_x, HEADER + 14, TRUSS_TOP - 8)
        front_paths.append(chain)
        details.append(body)
        rear_x = x1 + 12 if inner == 'right' else x0 - 12
        chain, body = hoist(rear_x, HEADER + 14, TRUSS_TOP - 8, REAR)
        rear_paths.append(chain)
        details.append(body.replace('truss-motor', 'truss-motor rear'))

    # Line-array motors under the front truss; the chains to the bumpers are CSS (.la-rig).
    for x in (183, 217, 782, 818):  # measured .la-rig chain positions
        details.append(f'<rect class="truss-motor" x="{x - 8}" y="{TRUSS_BOTTOM + 6}" width="16" height="20" rx="3"/>')
        front_paths.append(line((x, TRUSS_BOTTOM), (x, TRUSS_BOTTOM + 6)))

    def path(cls, parts):
        return f'<path class="{cls}" d="{"".join(parts)}"/>'

    return ('<svg class="stage-truss" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">'
            '<defs><linearGradient id="truss-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c6d6e2"/><stop offset=".3" stop-color="#5d7283"/>'
            '<stop offset=".52" stop-color="#a9bccb"/><stop offset="1" stop-color="#3b4d5c"/></linearGradient></defs>'
            '<g class="truss-rear">' + path('truss-chord', rear_paths) + path('truss-web', rear_web) + '</g>'
            '<g class="truss-side">' + path('truss-chord', side_paths) + path('truss-web', side_web) + '</g>'
            '<g class="truss-front">' + path('truss-shade', front_shade) + path('truss-chord', front_paths) + path('truss-web', front_web) +
            '<g class="truss-hardware">' + ''.join(details) + '</g></g></svg>')


def main():
    html = INDEX.read_text()
    svg = build()
    updated, count = re.subn(r'<svg class="stage-truss".*?</svg>', lambda _: svg, html, count=1, flags=re.S)
    if count != 1:
        raise SystemExit('stage-truss SVG not found in dist/index.html')
    INDEX.write_text(updated)
    print(f'Truss written to {INDEX.relative_to(ROOT)} ({len(svg)} bytes)')


if __name__ == '__main__':
    main()
