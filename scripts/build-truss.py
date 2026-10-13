#!/usr/bin/env python3
"""Draw the ground-support truss, the deck and the stage dressing of the home stage into dist/index.html.

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

    # Moving-head rigging that stays still while the head (.stage-fixtures i, CSS) tilts on its
    # pivot: half-coupler clamp on the bottom chord, safety cable, base and U yoke. The x positions
    # are the centres of the five CSS heads (26%..74%, 30px wide, space-between on 820px).
    for x in (278.3, 389.1, 500, 610.9, 721.7):
        details.append(f'<rect class="mh-clamp" x="{f(x - 6)}" y="{TRUSS_BOTTOM - 4}" width="12" height="8" rx="1.5"/>')
        front_paths.append(f'M{f(x + 9)} {TRUSS_BOTTOM - 2}C{f(x + 14)} {TRUSS_BOTTOM + 3} {f(x + 13)} {TRUSS_BOTTOM + 8} {f(x + 8)} {TRUSS_BOTTOM + 9}')
        details.append(f'<rect class="mh-base" x="{f(x - 17)}" y="{TRUSS_BOTTOM + 3}" width="34" height="8" rx="2"/>')
        details.append(f'<path class="mh-yoke" d="M{f(x - 22)} {TRUSS_BOTTOM + 9}H{f(x + 22)}V{TRUSS_BOTTOM + 21}'
                       f'Q{f(x + 22)} {TRUSS_BOTTOM + 24} {f(x + 19)} {TRUSS_BOTTOM + 24}V{TRUSS_BOTTOM + 13}H{f(x - 19)}V{TRUSS_BOTTOM + 24}'
                       f'Q{f(x - 22)} {TRUSS_BOTTOM + 24} {f(x - 22)} {TRUSS_BOTTOM + 21}Z"/>')
        details.append(f'<circle class="mh-pivot" cx="{f(x - 20.5)}" cy="{TRUSS_BOTTOM + 16}" r="2.4"/><circle class="mh-pivot" cx="{f(x + 20.5)}" cy="{TRUSS_BOTTOM + 16}" r="2.4"/>')

    # Line-array motors under the front truss; the chains to the bumpers are CSS (.la-rig).
    for x in (183, 217, 782, 818):  # measured .la-rig chain positions
        details.append(f'<rect class="truss-motor" x="{x - 8}" y="{TRUSS_BOTTOM + 6}" width="16" height="20" rx="3"/>')
        front_paths.append(line((x, TRUSS_BOTTOM), (x, TRUSS_BOTTOM + 6)))

    # Invisible hover targets (front truss and towers) that open the truss gear card.
    hit = ('<g class="truss-hit" data-gear="truss">'
           f'<rect x="60" y="{TRUSS_TOP}" width="880" height="{TRUSS_BOTTOM - TRUSS_TOP}"/>'
           + ''.join(f'<rect x="{x0}" y="{HEADER}" width="{x1 - x0}" height="{FLOOR - 50 - HEADER}"/>' for x0, x1 in (LEFT_TOWER, RIGHT_TOWER))
           + '</g>')

    def path(cls, parts):
        return f'<path class="{cls}" d="{"".join(parts)}"/>'

    return ('<svg class="stage-truss" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">'
            '<defs><linearGradient id="truss-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c6d6e2"/><stop offset=".3" stop-color="#5d7283"/>'
            '<stop offset=".52" stop-color="#a9bccb"/><stop offset="1" stop-color="#3b4d5c"/></linearGradient></defs>'
            '<g class="truss-rear">' + path('truss-chord', rear_paths) + path('truss-web', rear_web) + '</g>'
            '<g class="truss-side">' + path('truss-chord', side_paths) + path('truss-web', side_web) + '</g>'
            '<g class="truss-front">' + path('truss-shade', front_shade) + path('truss-chord', front_paths) + path('truss-web', front_web) +
            '<g class="truss-hardware">' + ''.join(details) + '</g></g>' + hit + '</svg>')


DECK_LEFT, DECK_RIGHT = 118, 882   # front edge, between the towers
DECK_TOP = 752                     # deck top at the front edge: a concert-height deck (~1.5 m)
STAIRS_X = (395, 475)              # stair unit in front of the skirt, between the subs
STEPS = 5


def forward(point, scale):
    """Project a point towards the audience (scale > 1)."""
    return back(point, scale)


def deck():
    """Stage deck: perspective top with planks, pleated skirt, LED nosing and stairs."""
    fl, fr = (DECK_LEFT, DECK_TOP), (DECK_RIGHT, DECK_TOP)
    rl, rr = back(fl, REAR), back(fr, REAR)
    top = poly(fl, fr, rr, rl)
    # Plank joints run towards the vanishing point; panel joints (2x1 m decks) across.
    planks = ''.join(line(lerp(fl, fr, n / 32), lerp(rl, rr, n / 32)) for n in range(1, 32))
    panels = ''.join(line(lerp(fl, rl, t), lerp(fr, rr, t)) for t in (0.34, 0.66))
    skirt = poly(fl, fr, (DECK_RIGHT, FLOOR), (DECK_LEFT, FLOOR))
    nosing = f'<rect class="deck-nosing" x="{DECK_LEFT - 2}" y="{DECK_TOP - 2}" width="{DECK_RIGHT - DECK_LEFT + 4}" height="7" rx="1.5"/>'
    led = line((DECK_LEFT + 4, DECK_TOP + 9), (DECK_RIGHT - 4, DECK_TOP + 9))
    # Stairs: each step sits a little closer to the audience than the one above.
    x0, x1 = STAIRS_X
    rise = (FLOOR - DECK_TOP) / STEPS
    treads, risers = [], []
    for k in range(STEPS):
        y = DECK_TOP + rise * (k + 1)          # top of step k at floor-relative height
        near, far = 1 + 0.035 * (k + 1), 1 + 0.035 * k
        a, b = forward((x0, y), far), forward((x1, y), far)
        c, d = forward((x1, y), near), forward((x0, y), near)
        treads.append(poly(a, b, c, d))
        bottom = forward((x0, y + rise), near)[1]
        risers.append(poly(d, c, (c[0], bottom), (d[0], bottom)))
    shine = poly(fl, fr, rr, rl)
    return ('<svg class="stage-deck-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">'
            '<defs><linearGradient id="deck-top" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#2c3b49"/><stop offset="1" stop-color="#121b26"/></linearGradient>'
            '<linearGradient id="deck-skirt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d141d"/><stop offset="1" stop-color="#05080d"/></linearGradient>'
            '<pattern id="deck-pleats" width="11" height="1000" patternUnits="userSpaceOnUse"><rect width="11" height="1000" fill="url(#deck-skirt)"/>'
            '<rect x="7" width="4" height="1000" fill="#000" opacity=".45"/><rect x="2" width="2" height="1000" fill="#4a6175" opacity=".18"/></pattern>'
            '<linearGradient id="deck-glare" x1="0" y1="0" x2="1" y2="0"><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
            f'<path class="deck-top" d="{top}"/><path class="deck-planks" d="{planks}"/><path class="deck-panels" d="{panels}"/>'
            f'<path class="deck-glare" d="{shine}"/>'
            f'<path class="deck-skirt" d="{skirt}"/>{nosing}<path class="deck-led" d="{led}"/>'
            f'<g class="deck-stairs"><path class="deck-riser" d="{"".join(risers)}"/><path class="deck-tread" d="{"".join(treads)}"/>'
            f'</g></svg>')


DECK_REAR = VANISH[1] + REAR * (DECK_TOP - VANISH[1])
M_Y, M_X = 72, 61  # viewBox units per metre at the deck front (vertical, horizontal); deck about 1 m high


def on_deck(x, t):
    """Point on the deck surface: x in front-edge units, t from 0 (front edge) to 1 (rear)."""
    k = 1 - (1 - REAR) * t
    return VANISH[0] + k * (x - VANISH[0]), DECK_TOP - t * (DECK_TOP - DECK_REAR), k


def shadow(cx, cy, rx, ry, cls='prop-shadow'):
    return f'<ellipse class="{cls}" cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}"/>'


def figure(cx, base, k, height=1.75, arms='down', extra=''):
    """A performer seen from the front, rim-lit by the LED wall: head, neck, torso and arms."""
    my, mx = M_Y * k, M_X * k
    top = base - height * my
    hr_x, hr_y = .095 * mx, .12 * my
    hy = top + hr_y
    sy = hy + .2 * my           # shoulder line
    sw = .22 * mx               # half shoulder width
    hip = sy + .55 * my
    torso = (f'M{f(cx - sw)} {f(sy + .05 * my)}Q{f(cx - sw)} {f(sy - .02 * my)} {f(cx - sw * .55)} {f(sy - .03 * my)}'
             f'L{f(cx - .05 * mx)} {f(hy + hr_y * .9)}L{f(cx + .05 * mx)} {f(hy + hr_y * .9)}L{f(cx + sw * .55)} {f(sy - .03 * my)}'
             f'Q{f(cx + sw)} {f(sy - .02 * my)} {f(cx + sw)} {f(sy + .05 * my)}L{f(cx + sw * .82)} {f(hip)}L{f(cx + sw * .7)} {f(base)}'
             f'L{f(cx - sw * .7)} {f(base)}L{f(cx - sw * .82)} {f(hip)}Z')
    head = f'<ellipse cx="{f(cx)}" cy="{f(hy)}" rx="{f(hr_x)}" ry="{f(hr_y)}"/>'
    w = .085 * mx
    def arm(side, ex, ey, hx, hy2):
        sx = cx + side * (sw - w * .4)
        return (f'<path class="arm" d="M{f(sx)} {f(sy + .03 * my)}L{f(ex)} {f(ey)}L{f(hx)} {f(hy2)}" fill="none" '
                f'stroke-width="{f(w)}" stroke-linecap="round" stroke-linejoin="round"/>')
    if arms == 'decks':      # both hands on the decks
        limbs = arm(-1, cx - sw * 1.05, sy + .32 * my, cx - sw * .55, sy + .5 * my) + arm(1, cx + sw * 1.05, sy + .32 * my, cx + sw * .6, sy + .5 * my)
        limbs += f'<g class="dj-hand-up">{arm(1, cx + sw * 1.25, sy - .25 * my, cx + sw * 1.1, sy - .62 * my)}</g>'
    elif arms == 'mic':      # right hand holds the mic at the mouth
        limbs = arm(-1, cx - sw * 1.05, sy + .3 * my, cx - sw * .95, sy + .58 * my) + arm(1, cx + sw * 1.1, sy + .28 * my, cx + .05 * mx, hy + hr_y * .7)
    else:                    # hands on the lectern
        limbs = arm(-1, cx - sw * 1.05, sy + .3 * my, cx - sw * .5, sy + .48 * my) + arm(1, cx + sw * 1.05, sy + .3 * my, cx + sw * .5, sy + .48 * my)
    return f'<path d="{torso}"/>{head}{extra}{limbs}'


def props():
    """Stage dressing on the deck, in the deck perspective: DJ booth and DJ (concert), lectern and
    speaker (corporate), mic stand and singer (wedding), monitor wedges, flight cases and cables,
    plus soft contact shadows on the deck and on the floor."""
    out = []
    # Floor shadows: deck front, subwoofers and tower feet (the subs and towers are drawn elsewhere).
    out.append(f'<g class="floor-shadows"><rect class="deck-floor-shadow" x="{DECK_LEFT}" y="{FLOOR}" width="{DECK_RIGHT - DECK_LEFT}" height="14"/>'
               + shadow(200, 912, 78, 9, 'floor-shadow') + shadow(800, 912, 78, 9, 'floor-shadow')
               + shadow(88, 902, 105, 10, 'floor-shadow') + shadow(912, 902, 105, 10, 'floor-shadow') + '</g>')
    # Flight cases at the back corners and monitor wedges near the front edge.
    for x, stack in ((215, 2), (785, 1)):
        cx, base, k = on_deck(x, .86)
        w, h = .7 * M_X * k, .45 * M_Y * k
        out.append(shadow(cx, base, w * .62, 3.5 * k))
        for n in range(stack):
            y = base - h * (n + 1)
            ww = w * (1 - .08 * n)
            out.append(f'<g class="case"><rect x="{f(cx - ww / 2)}" y="{f(y)}" width="{f(ww)}" height="{f(h)}" rx="1.5"/>'
                       f'<path class="case-trim" d="M{f(cx - ww / 2)} {f(y + 2)}H{f(cx + ww / 2)}M{f(cx - ww / 2)} {f(y + h - 2)}H{f(cx + ww / 2)}'
                       f'M{f(cx - ww / 2 + 2)} {f(y)}V{f(y + h)}M{f(cx + ww / 2 - 2)} {f(y)}V{f(y + h)}"/>'
                       f'<rect class="case-latch" x="{f(cx - 3)}" y="{f(y + h * .35)}" width="6" height="{f(h * .25)}" rx="1"/></g>')
    for x in (372, 628):
        cx, base, k = on_deck(x, .1)
        w, h = .6 * M_X * k, .34 * M_Y * k
        out.append(shadow(cx, base, w * .6, 3))
        out.append(f'<g class="wedge"><path d="M{f(cx - w / 2)} {f(base)}V{f(base - h * .55)}L{f(cx - w * .42)} {f(base - h)}H{f(cx + w * .42)}'
                   f'L{f(cx + w / 2)} {f(base - h * .55)}V{f(base)}Z"/><path class="wedge-grille" d="M{f(cx - w * .4)} {f(base - h * .62)}'
                   f'L{f(cx - w * .36)} {f(base - h * .92)}H{f(cx + w * .36)}L{f(cx + w * .4)} {f(base - h * .62)}Z"/></g>')
    # Cables from the centre to the cases and wedges.
    bx, by, _ = on_deck(500, .42)
    cables = ''
    for tx, tt in ((215, .86), (785, .86)):
        ex, ey, _ = on_deck(tx, tt)
        mx, my, _ = on_deck((500 + tx) / 2, .7)
        cables += f'M{f(bx)} {f(by)}Q{f(mx)} {f(my + 3)} {f(ex)} {f(ey)}'
    out.append(f'<path class="cables" d="{cables}"/>')

    # Concert: DJ booth with the DJ behind it.
    cx, base, k = on_deck(500, .45)
    w, h = 1.5 * M_X * k, .95 * M_Y * k
    dj_x, dj_base, dj_k = on_deck(500, .56)
    dj = figure(dj_x, dj_base, dj_k, 1.78, 'decks',
                extra=(f'<path class="headphones" d="M{f(dj_x - .1 * M_X * dj_k)} {f(dj_base - 1.66 * M_Y * dj_k)}'
                       f'Q{f(dj_x)} {f(dj_base - 1.86 * M_Y * dj_k)} {f(dj_x + .1 * M_X * dj_k)} {f(dj_base - 1.66 * M_Y * dj_k)}"/>'))
    out.append(f'<g class="set set-concierto">{shadow(cx, base, w * .58, 4 * k)}'
               f'<g class="performer dj"><g class="bop">{dj}</g></g>'
               f'<g class="booth"><path d="M{f(cx - w / 2)} {f(base)}V{f(base - h)}H{f(cx + w / 2)}V{f(base)}Z"/>'
               f'<path class="booth-top" d="M{f(cx - w / 2 - 2)} {f(base - h)}L{f(cx - w / 2 + 3)} {f(base - h - 5)}H{f(cx + w / 2 - 3)}L{f(cx + w / 2 + 2)} {f(base - h)}Z"/>'
               f'<path class="booth-led" d="M{f(cx - w / 2 + 3)} {f(base - h + 6)}H{f(cx + w / 2 - 3)}M{f(cx - w / 2 + 3)} {f(base - 5)}H{f(cx + w / 2 - 3)}"/>'
               # The real logo; its height undoes the viewBox stretch (x .82 px/unit, y .7 px/unit).
               f'<image class="booth-logo" href="assets/logo-wide.webp" x="{f(cx - w * .41)}" y="{f(base - h * .5 - w * .82 * .82 / .7 / 3.71 / 2)}" '
               f'width="{f(w * .82)}" height="{f(w * .82 * .82 / .7 / 3.71)}" preserveAspectRatio="none"/>'
               + ''.join(f'<circle class="deck-dot" cx="{f(cx + dx * w)}" cy="{f(base - h - 2.5)}" r="1.6"/>' for dx in (-.36, -.18, 0, .18, .36))
               + '</g></g>')
    # Corporate: lectern with the speaker behind it.
    cx, base, k = on_deck(640, .38)
    w, h = .62 * M_X * k, 1.15 * M_Y * k
    sp_x, sp_base, sp_k = on_deck(640, .46)
    out.append(f'<g class="set set-corporativo">{shadow(cx, base, w * .7, 3.5 * k)}'
               f'<g class="performer speaker">{figure(sp_x, sp_base, sp_k, 1.74, "lectern")}</g>'
               f'<g class="lectern"><path d="M{f(cx - w * .42)} {f(base)}L{f(cx - w / 2)} {f(base - h)}H{f(cx + w / 2)}L{f(cx + w * .42)} {f(base)}Z"/>'
               f'<path class="booth-top" d="M{f(cx - w / 2 - 2)} {f(base - h)}L{f(cx - w / 2 + 2)} {f(base - h - 5)}H{f(cx + w / 2 - 2)}L{f(cx + w / 2 + 2)} {f(base - h)}Z"/>'
               f'<rect class="lectern-plate" x="{f(cx - w * .3)}" y="{f(base - h * .72)}" width="{f(w * .6)}" height="{f(h * .2)}" rx="1"/>'
               f'<path class="mic-stand" d="M{f(cx + w * .2)} {f(base - h - 4)}Q{f(cx + w * .25)} {f(base - h - 18)} {f(cx + w * .05)} {f(base - h - 24)}"/></g></g>')
    # Wedding: singer at a mic stand.
    cx, base, k = on_deck(500, .4)
    sx, sbase, sk = on_deck(500, .47)
    stand_h = 1.5 * M_Y * k
    out.append(f'<g class="set set-boda">{shadow(cx, base, 16 * k, 3 * k)}'
               f'<g class="performer singer"><g class="sway">{figure(sx, sbase, sk, 1.7, "mic")}</g></g>'
               f'<g class="mic-stand-full"><path class="mic-stand" d="M{f(cx)} {f(base)}V{f(base - stand_h)}'
               f'M{f(cx - 9 * k)} {f(base)}L{f(cx)} {f(base - 6 * k)}L{f(cx + 9 * k)} {f(base)}"/>'
               f'<ellipse class="mic-head" cx="{f(cx)}" cy="{f(base - stand_h - 3)}" rx="2.4" ry="3.4"/></g></g>')
    return ('<svg class="stage-props" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">'
            '<defs><linearGradient id="prop-rim" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" style="stop-color:var(--rim);stop-opacity:min(1,calc(var(--rim-o) + var(--flash,0) * .9))"/>'
            '<stop offset=".35" style="stop-color:var(--rim);stop-opacity:calc(var(--rim-o) * .2)"/>'
            '<stop offset=".6" style="stop-color:var(--rim);stop-opacity:0"/></linearGradient>'
            '<radialGradient id="soft-shadow"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
            '<linearGradient id="deck-floor-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>'
            + ''.join(out) + '</svg>')


def replace(html, pattern, svg, name):
    updated, count = re.subn(pattern, lambda _: svg, html, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'{name} not found in dist/index.html')
    return updated


def main():
    html = INDEX.read_text()
    html = replace(html, r'<svg class="stage-truss".*?</svg>', build(), 'stage-truss SVG')
    html = replace(html, r'<svg class="stage-deck-svg".*?</svg>|(?<=<div class="stage-deck">)(?=<div class="stage-floor-spots")', deck(), 'stage-deck')
    html = replace(html, r'<svg class="stage-props".*?</svg>|(?<=</div>)(?=<canvas class="stage-reflection")', props(), 'stage-props')
    INDEX.write_text(html)
    print(f'Truss and deck written to {INDEX.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
