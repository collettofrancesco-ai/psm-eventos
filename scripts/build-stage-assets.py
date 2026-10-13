#!/usr/bin/env python3
"""Draw the stage's fog texture and the crowd's raised hands.

Run from the repo root:
    python3 scripts/build-stage-assets.py
Writes dist/assets/stage-fog.webp (a tileable smoke mask) and
dist/assets/stage-crowd-hands.svg (arms and phones over the front row of
dist/assets/stage-audience.svg, same 720x170 tile).
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


# Front-row heads of stage-audience.svg: (x, y, arms). Arms: L/R raised, V both, P phone.
PEOPLE = [(24, 64, 'V'), (78, 49, 'RP'), (136, 68, 'L'), (252, 61, 'V'), (308, 46, 'RP'),
          (370, 67, 'V'), (433, 41, 'L'), (491, 60, 'RP'), (551, 46, 'L'), (610, 65, 'V'), (677, 52, 'RP')]


def arm(x, y, side, wide):
    shoulder = (x + side * 14, y + 31)
    elbow = (x + side * (26 if wide else 21), y + 4)
    hand = (x + side * (32 if wide else 17), y - 26)
    d = f'M{shoulder[0]} {shoulder[1]}L{elbow[0]} {elbow[1]}L{hand[0]} {hand[1]}'
    return d, hand


def hands():
    arms, fists, phones = [], [], []
    for x, y, kind in PEOPLE:
        sides = (-1, 1) if 'V' in kind else ((-1,) if 'L' in kind else (1,))
        for side in sides:
            d, (hx, hy) = arm(x, y, side, 'V' in kind)
            arms.append(d)
            fists.append(f'<circle cx="{hx}" cy="{hy - 3}" r="5"/>')
            if 'P' in kind:
                phones.append(f'<rect x="{hx - 4}" y="{hy - 15}" width="8" height="12" rx="1.5"/>')
    path = ''.join(arms)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="170" viewBox="0 0 720 170">'
           f'<path d="{path}" fill="none" stroke="#779bad" stroke-opacity=".12" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'
           f'<path d="{path}" fill="none" stroke="#08101a" stroke-width="8.4" stroke-linecap="round" stroke-linejoin="round"/>'
           f'<g fill="#08101a">{"".join(fists)}</g>'
           f'<g fill="#9fdcff" opacity=".35" transform="translate(0 0)">{"".join(p.replace("width=\"8\"", "width=\"8\" stroke=\"#9fdcff\" stroke-width=\"6\"") for p in phones)}</g>'
           f'<g fill="#e6f8ff">{"".join(phones)}</g></svg>')
    (ASSETS / 'stage-crowd-hands.svg').write_text(svg)


if __name__ == '__main__':
    fog()
    hands()
    print('Wrote dist/assets/stage-fog.webp and dist/assets/stage-crowd-hands.svg')
