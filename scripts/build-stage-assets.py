#!/usr/bin/env python3
"""Draw the stage's fog texture and its crowd.

Run from the repo root:
    python3 scripts/build-stage-assets.py
Writes dist/assets/stage-fog.webp (a tileable smoke mask) and the crowd silhouettes
(three rows, rim-lit, split into groups that move on their own) into dist/index.html.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'dist' / 'assets'


def fog(size=256, seed=7):
    """Periodic smoke: white noise low-passed in the frequency domain, so it tiles."""
    rng = np.random.default_rng(seed)
    fx = np.fft.fftfreq(size)[:, None]
    fy = np.fft.fftfreq(size)[None, :]
    radius = np.sqrt(fx ** 2 + (fy * 2.2) ** 2)  # wisps a little wider than tall
    spectrum = np.fft.fft2(rng.standard_normal((size, size))) * np.exp(-(radius * 14) ** 2) / (radius + 1 / size) ** 1.2
    smoke = np.real(np.fft.ifft2(spectrum))
    smoke = (smoke - smoke.min()) / (smoke.max() - smoke.min())
    alpha = np.clip((smoke - .25) / .6, 0, 1) ** 1.4
    rgba = np.zeros((size, size, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(ASSETS / 'stage-fog.webp', quality=82, method=6)


W, H = 820, 161  # .stage-audience box on the 820x700 stage canvas


def f(n):
    return f'{n:.1f}'.rstrip('0').rstrip('.')


# Bust outline seen from behind (head radius ~8.5px at front-row scale): crown, ear, jaw,
# neck, trapezius, shoulder and arm, as cubic segments of the right half; mirrored for the left.
BUST_HEAD = [((4.6, -11), (8.1, -8.2), (8.4, -3.6)), ((8.7, -1.6), (9.7, -1.3), (9.6, 1)),
             ((9.5, 3), (8.7, 4.1), (8.1, 4.6)), ((7.4, 8), (5.2, 10.4), (3.7, 11.2))]
BUST_BODY = [((3.8, 12.5), (3.9, 13.6), (4, 14.6)), ((6.5, 16.6), (11, 17.6), (15, 18.6)),
             ((19.6, 19.6), (22.6, 21.7), (23.4, 26)), ((23.9, 30), (24.1, 36), (24.3, 60))]


def cubic_path(start, segments):
    out = f'M{f(start[0])} {f(start[1])}'
    for c1, c2, end in segments:
        out += f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(end[0])} {f(end[1])}'
    return out


def bust(x, hy, s, shoulders, head_shift, bottom):
    """Closed outline of one person: (head, neck, shoulders) with asymmetric shoulder widths
    (a body turned three-quarters) and the head shifted on the neck."""
    def place(pt, side, head):
        px, py = pt
        if head:
            px = side * px + head_shift
        else:
            px = side * (px if abs(px) < 4.5 else 4.5 + (px - 4.5) * shoulders[side > 0])
        if py >= 59:
            py = (bottom - hy) / s
        return (x + s * px, hy + s * py)

    right = [(place(c1, 1, k < 4), place(c2, 1, k < 4), place(e, 1, k < 4))
             for k, (c1, c2, e) in enumerate(BUST_HEAD + BUST_BODY)]
    segments = BUST_HEAD + BUST_BODY
    starts = [(0, -11)] + [seg[2] for seg in segments[:-1]]
    left = []
    for k in range(len(segments) - 1, -1, -1):
        c1, c2, _ = segments[k]
        head = k < 4
        left.append((place(c2, -1, head), place(c1, -1, head), place(starts[k], -1, head)))
    top = place((0, -11), 1, True)
    path = cubic_path(top, right)
    path += f'L{f(place(segments[-1][2], -1, False)[0])} {f(place(segments[-1][2], -1, False)[1])}'
    for c1, c2, e in left:
        path += f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(e[0])} {f(e[1])}'
    return path + 'Z'


def hair(rng, x, hy, s, head_shift):
    """Hair in the same fill as the body; ragged ends so it does not read as a cut-out."""
    cx = x + s * head_shift
    def P(px, py):
        return f'{f(cx + s * px)} {f(hy + s * py)}'
    style = rng.choice(['short', 'short', 'short', 'long', 'long', 'tail', 'bun', 'curly', 'cap', 'beanie', 'none'])
    if style == 'short':
        return f'<path d="M{P(-8.6, -2)}C{P(-9.4, -10.5)} {P(-4, -12.6)} {P(0, -12.4)}C{P(4.5, -12.6)} {P(9.3, -10)} {P(8.6, -2)}Z"/>'
    if style == 'long':
        length = rng.uniform(17, 26)
        ends = ''.join(f'L{P(-9.5 + k * 2.375, length + (1.8 if k % 2 else 0) + rng.uniform(-1, 1))}' for k in range(9))
        return (f'<path d="M{P(-8.7, -4)}C{P(-10.5, 4)} {P(-10.8, 11)} {P(-9.5, length)}{ends}'
                f'C{P(10.8, 11)} {P(10.5, 4)} {P(8.7, -4)}C{P(8, -12)} {P(-8, -12)} {P(-8.7, -4)}Z"/>')
    if style == 'tail':
        side = rng.choice([-1, 1])
        return (f'<path d="M{P(-8.6, -2)}C{P(-9.4, -10.5)} {P(9.4, -10.5)} {P(8.6, -2)}Z'
                f'M{P(side * 5, -7)}C{P(side * 13, -6)} {P(side * 14.5, 6)} {P(side * 10.5, 16)}C{P(side * 10, 10)} {P(side * 8.5, 3)} {P(side * 5, 0)}Z"/>')
    if style == 'bun':
        return f'<circle cx="{f(cx + s * rng.uniform(-2, 2))}" cy="{f(hy - 12.3 * s)}" r="{f(4.3 * s)}"/>'
    if style == 'curly':
        pts = []
        for k in range(40):
            a = np.pi * (1.05 + .9 * k / 39)
            r = 11.4 + .55 * np.sin(k * 2.1)
            pts.append(P(r * np.cos(a) * 1.05, r * np.sin(a) * .95 + 1.5))
        return f'<path d="M{P(-11, 4)}L' + 'L'.join(pts) + f'L{P(11, 4)}L{P(0, 6)}Z"/>'
    if style == 'cap':
        return f'<path d="M{P(-9, -1.5)}C{P(-9.5, -9)} {P(-6, -12.2)} {P(0, -12.2)}C{P(6, -12.2)} {P(9.5, -9)} {P(9, -1.5)}L{P(9.6, -.6)}L{P(-9.6, -.6)}Z"/>'
    if style == 'beanie':
        return f'<path d="M{P(-9.2, -1)}C{P(-9.4, -11)} {P(-4, -14.5)} {P(0, -14.6)}C{P(4, -14.5)} {P(9.4, -11)} {P(9.2, -1)}Z"/>'
    return ''


def limb(points, widths):
    """Tapered arm along shoulder-elbow-wrist as one closed path with a round wrist."""
    pts = [np.array(p, float) for p in points]
    dirs = [pts[1] - pts[0], pts[2] - pts[1]]
    norms = [np.array([-d[1], d[0]]) / np.linalg.norm(d) for d in dirs]
    joint = [norms[0], (norms[0] + norms[1]) / np.linalg.norm(norms[0] + norms[1]), norms[1]]
    left = [pts[k] + joint[k] * widths[k] / 2 for k in range(3)]
    right = [pts[k] - joint[k] * widths[k] / 2 for k in range(3)]
    r = widths[2] / 2
    d = f'M{f(left[0][0])} {f(left[0][1])}L{f(left[1][0])} {f(left[1][1])}L{f(left[2][0])} {f(left[2][1])}'
    d += f'A{f(r)} {f(r)} 0 0 1 {f(right[2][0])} {f(right[2][1])}'
    d += f'L{f(right[1][0])} {f(right[1][1])}L{f(right[0][0])} {f(right[0][1])}Z'
    return d


def hand(rng, kind, wx, wy, angle, s):
    """A hand drawn at the wrist, pointing along the forearm: open hand, fist, peace sign,
    rock horns or a lit phone. Palm and fingers are solid (no rim) so they read as a hand
    against the lights instead of a ring."""
    # Local coordinates: wrist at 0,0, fingers towards -y; rotated to the arm angle.
    palm_w = 1.0 if kind == 'open' else .92
    palm = (f'M-2.9 0.6C-3.4 -2 -4.4 -4.6 -4.2 -6.6C-4 -7.8 4 -7.8 4.2 -6.6'
            f'C4.4 -4.6 3.4 -2 2.9 0.6Z')
    fingers = []
    if kind == 'open':
        for dx, length, tilt in ((-3.1, 5.2, -14), (-1.05, 6.4, -4), (1.05, 6.8, 4), (3.1, 5.6, 13)):
            a = np.radians(tilt)
            fingers.append(f'M{f(dx)} -6.6L{f(dx + np.sin(a) * length)} {f(-6.6 - np.cos(a) * length)}')
        fingers.append('M-3.6 -2.6L-7 -6.4')  # thumb
    elif kind == 'peace':
        fingers += ['M-1.1 -6.6L-2.9 -13.4', 'M1.1 -6.6L2.9 -13.4', 'M-3.8 -3.4L-1 -5.6']
    elif kind == 'horns':
        fingers += ['M-3 -6.6L-4.4 -12.6', 'M3 -6.6L4.3 -12.4', 'M-3.6 -3.2L-.4 -5.4']
    elif kind == 'fist':
        palm = ('M-3 0.6C-3.5 -2 -4.4 -4.4 -4.3 -6.8C-4.2 -8.6 -3 -9.2 -2.1 -8.8C-1.4 -9.6 -.5 -9.6 0 -9'
                'C.6 -9.6 1.6 -9.6 2.1 -8.8C3 -9.3 4.3 -8.6 4.3 -6.8C4.4 -4.4 3.5 -2 3 0.6Z')
    elif kind == 'phone':
        fingers.append('M-3.6 -2.6L-6.2 -5.6')
    rot = f'translate({f(wx)} {f(wy)}) rotate({f(angle)}) scale({f(s)} {f(s * palm_w)})'
    out = f'<g class="hand" transform="{rot}"><path d="{palm}"/>'
    if fingers:
        out += f'<path class="fingers" d="{"".join(fingers)}" stroke-width="2.3" stroke-linecap="round"/>'
    if kind == 'phone':
        out += '<rect class="phone" x="-3.8" y="-17.5" width="7.6" height="12" rx="1.4"/>'
    return out + '</g>'


def raised_arms(rng, x, hy, s, shoulders, head_shift):
    choice = rng.choice(['V', 'V', 'L', 'R', 'L', 'R'])
    sides = (-1, 1) if choice == 'V' else ((-1,) if choice == 'L' else (1,))
    out = ''
    for side in sides:
        sw = shoulders[side > 0]
        sx, sy = x + side * s * (4.5 + 13.5 * sw), hy + 23 * s
        spread = rng.uniform(.2, 1) if choice == 'V' else rng.uniform(-.2, .6)
        ex, ey = sx + side * s * (6 + 7 * spread), hy + s * rng.uniform(-9, -1)
        wx, wy = ex + side * s * rng.uniform(-5, 6 * spread + 2), hy - s * rng.uniform(32, 42)
        angle = np.degrees(np.arctan2(wx - ex, ey - wy))
        out += f'<path d="{limb([(sx, sy), (ex, ey), (wx, wy)], [9.6 * s, 7.6 * s, 5.8 * s])}"/>'
        out += hand(rng, rng.choice(['fist', 'fist', 'open', 'open', 'peace', 'horns', 'phone']), wx, wy, angle, s)
    return out


def person(rng, x, hy, s, bottom, arm_chance):
    """One rim-lit silhouette. Returns (body, arms, arms_always)."""
    shoulders = {False: rng.uniform(.8, 1.18), True: rng.uniform(.8, 1.18)}
    head_shift = rng.uniform(-1.6, 1.6)
    hs = s * rng.uniform(.94, 1.06)
    body = f'<path d="{bust(x, hy, hs, shoulders, head_shift, bottom)}"/>' + hair(rng, x, hy, hs, head_shift)
    arms = raised_arms(rng, x, hy, hs, shoulders, head_shift) if rng.random() < arm_chance else ''
    always = ''
    if not arms and rng.random() < arm_chance * .4:
        always = raised_arms(rng, x, hy, hs, shoulders, head_shift)
    return body, arms, always


ROWS = [  # name, scale, head y range, people, layers (groups that move with their own phase), arm chance
    ('back', .5, (44, 54), 40, 1, .35),
    ('mid', .72, (58, 70), 26, 2, .6),
    ('front', 1.0, (74, 94), 16, 3, .75),
]


def foh():
    """Front-of-house tent in the middle of the crowd, between the back and mid rows: canopy,
    poles, mixing desk with lit screens and two engineers. Hovering it shows the consoles."""
    cx, roof, eave, w = 560, 20, 33, 118
    desk = 60
    return (f'<svg class="crowd-layer foh-layer" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">'
            '<g class="foh" data-gear="mixer">'
            f'<rect class="foh-hit" x="{cx - w / 2}" y="{roof}" width="{w}" height="{H - roof}"/>'
            f'<path class="foh-roof" d="M{cx - w / 2 - 8} {eave}L{cx - w / 2 + 14} {roof}H{cx + w / 2 - 14}L{cx + w / 2 + 8} {eave}Z"/>'
            f'<rect class="foh-valance" x="{cx - w / 2 - 8}" y="{eave}" width="{w + 16}" height="7"/>'
            f'<text class="foh-label" x="{cx}" y="{eave + 5.6}" text-anchor="middle">PSM · FOH</text>'
            f'<path class="foh-poles" d="M{cx - w / 2 - 4} {eave + 7}V{H}M{cx + w / 2 + 4} {eave + 7}V{H}"/>'
            f'<ellipse class="foh-head" cx="{cx - 22}" cy="{desk - 9}" rx="5" ry="6"/><ellipse class="foh-head" cx="{cx + 20}" cy="{desk - 10}" rx="5" ry="6.2"/>'
            f'<path class="foh-desk" d="M{cx - 48} {desk + 12}L{cx - 42} {desk}H{cx + 42}L{cx + 48} {desk + 12}Z"/>'
            f'<rect class="foh-screen" x="{cx - 34}" y="{desk - 9}" width="20" height="9" rx="1"/>'
            f'<rect class="foh-screen" x="{cx + 6}" y="{desk - 9}" width="20" height="9" rx="1"/>'
            + ''.join(f'<circle class="foh-led" cx="{cx - 38 + k * 7.5}" cy="{desk + 6}" r="1"/>' for k in range(11))
            + '</g></svg>')


def crowd(seed=11):
    """Inline SVG crowd for .stage-audience: one <svg> per layer so each group bobs on its own
    composited layer. Rim light gradients read --rim / --rim-o, set in CSS from the lights."""
    rng = np.random.default_rng(seed)
    layers = []
    for name, scale, (top, bottom), count, groups, arm_chance in ROWS:
        step = (W + 40) / count
        bodies, arms, always = ([[] for _ in range(groups)] for _ in range(3))
        for n in range(count):
            x = -20 + step * (n + .5) + rng.uniform(-.3, .3) * step
            body, arm, calm = person(rng, x, rng.uniform(top, bottom), scale * rng.uniform(.92, 1.08), H + 4, arm_chance)
            bodies[n % groups].append(f'<g class="t{n % 4}">{body}</g>')  # tone class: daylight clothing
            arms[n % groups].append(arm)
            always[n % groups].append(calm)
        if name == 'mid':
            layers.append(foh())  # behind the mid and front rows, in front of the back row
        for g in range(groups):
            gid = f'{name}-{g}'
            layers.append(
                f'<svg class="crowd-layer {name} g{g}" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">'
                f'<defs><linearGradient id="rim-{gid}" x1="0" y1="0" x2="0" y2="1">'
                '<stop offset="0" style="stop-color:var(--rim);stop-opacity:min(1,calc(var(--rim-o) + var(--flash,0) * .9))"/>'
                '<stop offset=".3" style="stop-color:var(--rim);stop-opacity:calc(var(--rim-o) * .25)"/>'
                '<stop offset=".55" style="stop-color:var(--rim);stop-opacity:0"/></linearGradient></defs>'
                f'<g class="arms always" stroke="url(#rim-{gid})">{"".join(always[g])}</g>'
                f'<g class="arms" stroke="url(#rim-{gid})">{"".join(arms[g])}</g>'
                f'<g class="bodies" stroke="url(#rim-{gid})">{"".join(bodies[g])}</g></svg>')
    return ''.join(layers)


def treeline(seed=5):
    """Distant trees for the daytime sky, drawn behind the stage (dist/assets/stage-treeline.svg)."""
    rng = np.random.default_rng(seed)
    far, near = [], []
    x = -10
    while x < 830:
        r = rng.uniform(10, 22)
        far.append(f'<ellipse cx="{f(x)}" cy="{f(58 - rng.uniform(0, 16))}" rx="{f(r * 1.3)}" ry="{f(r)}"/>')
        x += r * rng.uniform(1.1, 1.7)
    x = -10
    while x < 830:
        r = rng.uniform(8, 16)
        near.append(f'<ellipse cx="{f(x)}" cy="{f(68 - rng.uniform(0, 10))}" rx="{f(r * 1.2)}" ry="{f(r)}"/>')
        x += r * rng.uniform(1.4, 2.4)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="820" height="80" viewBox="0 0 820 80" preserveAspectRatio="none">'
           f'<g fill="#8fae9f">{"".join(far)}<rect y="52" width="820" height="28"/></g>'
           f'<g fill="#6f9480">{"".join(near)}<rect y="64" width="820" height="16"/></g></svg>')
    (ASSETS / 'stage-treeline.svg').write_text(svg)


def write_crowd():
    import re
    index = ROOT / 'dist' / 'index.html'
    html = index.read_text()
    html, count = re.subn(r'(<div class="stage-audience" aria-hidden="true">).*?(</div>)',
                          lambda m: m.group(1) + crowd() + '<i class="crowd-spots"></i>' + m.group(2), html, count=1, flags=re.S)
    if count != 1:
        raise SystemExit('stage-audience not found in dist/index.html')
    index.write_text(html)


if __name__ == '__main__':
    fog()
    treeline()
    write_crowd()
    print('Wrote dist/assets/stage-fog.webp and the crowd into dist/index.html')
