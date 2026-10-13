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


def person(rng, x, hy, s):
    """One silhouette: torso, hair, head, plus optional raised arms. Returns (body, arms)."""
    w = rng.uniform(17, 24) * s
    y0 = hy + rng.uniform(17, 20) * s
    torso = (f'M{f(x - w)} {H + 4}L{f(x - w - s)} {f(y0 + 16 * s)}Q{f(x - w)} {f(y0 + s)} {f(x - w + 10 * s)} {f(y0)}'
             f'L{f(x - 5 * s)} {f(y0 - 3 * s)}L{f(x + 5 * s)} {f(y0 - 3 * s)}L{f(x + w - 10 * s)} {f(y0)}'
             f'Q{f(x + w)} {f(y0 + s)} {f(x + w + s)} {f(y0 + 16 * s)}L{f(x + w)} {H + 4}Z')
    parts = [f'<path d="{torso}"/>', f'<rect x="{f(x - 4.5 * s)}" y="{f(hy + 8 * s)}" width="{f(9 * s)}" height="{f(10 * s)}"/>']
    style = rng.choice(['short', 'short', 'long', 'long', 'tail', 'bun', 'curly', 'cap'])
    rx, ry = 10 * s, 12.5 * s
    if style == 'long':
        parts.append(f'<path d="M{f(x - 11 * s)} {f(hy - 3 * s)}Q{f(x - 14 * s)} {f(hy + 17 * s)} {f(x - 10 * s)} {f(hy + 25 * s)}'
                     f'L{f(x + 10 * s)} {f(hy + 25 * s)}Q{f(x + 14 * s)} {f(hy + 17 * s)} {f(x + 11 * s)} {f(hy - 3 * s)}Z"/>')
    elif style == 'tail':
        side = rng.choice([-1, 1])
        parts.append(f'<ellipse cx="{f(x + side * 10 * s)}" cy="{f(hy + 7 * s)}" rx="{f(4 * s)}" ry="{f(9 * s)}" transform="rotate({side * -18} {f(x + side * 10 * s)} {f(hy + 7 * s)})"/>')
    elif style == 'bun':
        parts.append(f'<circle cx="{f(x)}" cy="{f(hy - 12 * s)}" r="{f(5 * s)}"/>')
    elif style == 'curly':
        rx, ry = 13 * s, 14 * s
    tilt = rng.uniform(-9, 9)
    parts.append(f'<ellipse cx="{f(x)}" cy="{f(hy)}" rx="{f(rx)}" ry="{f(ry)}" transform="rotate({f(tilt)} {f(x)} {f(hy)})"/>')
    if style == 'cap':
        side = rng.choice([-1, 1])
        parts.append(f'<path d="M{f(x - 10.5 * s)} {f(hy - 2 * s)}Q{f(x)} {f(hy - 17 * s)} {f(x + 10.5 * s)} {f(hy - 2 * s)}Z"/>'
                     f'<rect x="{f(x if side > 0 else x - 19 * s)}" y="{f(hy - 4 * s)}" width="{f(19 * s)}" height="{f(3.2 * s)}" rx="{f(1.6 * s)}"/>')
    arms = ''
    kind = rng.choice(['', '', 'V', 'L', 'R', 'RP', 'LP'])
    if kind:
        strokes, extra = [], []
        sides = (-1, 1) if kind == 'V' else ((-1,) if 'L' in kind else (1,))
        for side in sides:
            sx, sy = x + side * (w - 6 * s), y0 + 4 * s
            ex, ey = x + side * (w + (5 if kind == 'V' else 1) * s), hy - 2 * s
            hx, hy2 = x + side * ((w + 2 * s) if kind == 'V' else (w - 6 * s)), hy - 30 * s
            strokes.append(f'M{f(sx)} {f(sy)}L{f(ex)} {f(ey)}L{f(hx)} {f(hy2)}')
            extra.append(f'<circle cx="{f(hx)}" cy="{f(hy2 - 3 * s)}" r="{f(5 * s)}"/>')
            if 'P' in kind:
                extra.append(f'<rect class="phone" x="{f(hx - 4 * s)}" y="{f(hy2 - 16 * s)}" width="{f(8 * s)}" height="{f(12 * s)}" rx="{f(1.5 * s)}"/>')
        arms = (f'<path d="{"".join(strokes)}" fill="none" stroke-width="{f(8.5 * s)}" stroke-linecap="round" stroke-linejoin="round"/>'
                + ''.join(extra))
    return ''.join(parts), arms


ROWS = [  # name, scale, head y range, people, layers (groups that move with their own phase)
    ('back', .5, (44, 54), 34, 1),
    ('mid', .72, (58, 70), 22, 2),
    ('front', 1.0, (74, 94), 14, 3),
]


def crowd(seed=11):
    """Inline SVG crowd for .stage-audience: one <svg> per layer so each group bobs on its own
    composited layer. Rim light gradients read --rim / --rim-o, set in CSS from the lights."""
    rng = np.random.default_rng(seed)
    layers = []
    for name, scale, (top, bottom), count, groups in ROWS:
        step = (W + 40) / count
        bodies = [[] for _ in range(groups)]
        arms = [[] for _ in range(groups)]
        for n in range(count):
            x = -20 + step * (n + .5) + rng.uniform(-.3, .3) * step
            body, arm = person(rng, x, rng.uniform(top, bottom), scale * rng.uniform(.92, 1.08))
            bodies[n % groups].append(body)
            if arm and name != 'back':
                arms[n % groups].append(arm)
        for g in range(groups):
            gid = f'{name}-{g}'
            layers.append(
                f'<svg class="crowd-layer {name} g{g}" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">'
                f'<defs><linearGradient id="rim-{gid}" x1="0" y1="0" x2="0" y2="1">'
                '<stop offset="0" style="stop-color:var(--rim);stop-opacity:var(--rim-o)"/>'
                '<stop offset=".3" style="stop-color:var(--rim);stop-opacity:calc(var(--rim-o) * .25)"/>'
                '<stop offset=".55" style="stop-color:var(--rim);stop-opacity:0"/></linearGradient></defs>'
                f'<g class="arms" stroke="url(#rim-{gid})">{"".join(arms[g])}</g>'
                f'<g class="bodies" stroke="url(#rim-{gid})">{"".join(bodies[g])}</g></svg>')
    return ''.join(layers)


def write_crowd():
    import re
    index = ROOT / 'dist' / 'index.html'
    html = index.read_text()
    html, count = re.subn(r'(<div class="stage-audience" aria-hidden="true">).*?(</div>)',
                          lambda m: m.group(1) + crowd() + m.group(2), html, count=1, flags=re.S)
    if count != 1:
        raise SystemExit('stage-audience not found in dist/index.html')
    index.write_text(html)


if __name__ == '__main__':
    fog()
    write_crowd()
    print('Wrote dist/assets/stage-fog.webp and the crowd into dist/index.html')
