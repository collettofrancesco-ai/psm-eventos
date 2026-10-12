#!/usr/bin/env python3
"""Precompute the beat map that drives the stage lights.

Run from the repo root after adding or replacing a stage track:
    python3 scripts/analyze-beats.py
Writes dist/assets/beats.json. Needs ffmpeg and numpy.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'dist'
TRACKS = [
    'assets/wall-mobile/intro.m4a',
    'assets/stage-track-1.m4a',
    'assets/stage-track-2-thank-you.m4a',
    'assets/stage-track-3.m4a',
    'assets/stage-track-4-desire.m4a',
]
SR, N_FFT, HOP = 22050, 2048, 512
FPS = SR / HOP


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def spectrogram(signal):
    window = np.hanning(N_FFT).astype(np.float32)
    frames = 1 + (len(signal) - N_FFT) // HOP
    index = np.arange(N_FFT)[None, :] + HOP * np.arange(frames)[:, None]
    return np.abs(np.fft.rfft(signal[index] * window, axis=1))


def flux(magnitude):
    log = np.log1p(100 * magnitude)
    rise = np.maximum(0, np.diff(log, axis=0)).sum(axis=1)
    return np.concatenate([[0], rise])


def normalise(envelope):
    envelope = envelope - np.convolve(envelope, np.ones(16) / 16, mode='same')
    envelope = np.maximum(envelope, 0)
    return envelope / (envelope.std() + 1e-9)


def estimate_period(onset):
    """Autocorrelation tempo with a gentle preference for 90-140 BPM."""
    ac = np.correlate(onset, onset, mode='full')[len(onset) - 1:]
    lags = np.arange(len(ac))
    valid = (lags >= FPS * 60 / 190) & (lags <= FPS * 60 / 60)
    bpm = 60 * FPS / np.maximum(lags, 1)
    weight = np.exp(-0.5 * (np.log2(bpm / 118) / 0.9) ** 2)
    score = np.where(valid, ac * weight, 0)
    lag = int(np.argmax(score))
    # Parabolic refinement for a sub-frame period.
    a, b, c = score[lag - 1], score[lag], score[lag + 1]
    shift = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) else 0
    return lag + shift


def track_beats(onset, period, tightness=120):
    """Ellis dynamic-programming beat tracker."""
    n = len(onset)
    score = onset.copy()
    back = np.full(n, -1)
    window = np.arange(-int(2 * period), -int(period / 2) + 1)
    penalty = -tightness * np.log(-window / period) ** 2
    for t in range(n):
        candidates = t + window
        ok = candidates >= 0
        if not ok.any():
            continue
        values = score[candidates[ok]] + penalty[ok]
        best = int(np.argmax(values))
        score[t] = onset[t] + values[best]
        back[t] = candidates[ok][best]
    # Start from the strongest score in the last period and walk back.
    t = int(np.argmax(score[-int(period):])) + n - int(period)
    beats = []
    while t >= 0:
        beats.append(t)
        t = back[t]
    return np.array(beats[::-1])


def analyse(path):
    magnitude = spectrogram(decode(ASSETS / path))
    freqs = np.fft.rfftfreq(N_FFT, 1 / SR)
    bass = normalise(flux(magnitude[:, freqs < 150]))
    # Weight the kick so the grid locks onto it rather than hi-hats or snares.
    onset = normalise(flux(magnitude)) + 1.5 * bass
    period = estimate_period(onset)
    frames = track_beats(onset, period)

    def kick(at):
        return np.mean([bass[max(0, f - 2):f + 3].max() for f in at if f < len(bass)])

    halves = (frames[:-1] + np.diff(frames) / 2).astype(int)
    if kick(halves) > 1.3 * kick(frames):
        frames = halves  # grid sat on the off-beat
    elif 60 * FPS / period < 90 and kick(halves) > 0.75 * kick(frames):
        frames = np.sort(np.concatenate([frames, halves]))  # half-time feel: light every half beat
        period /= 2
    times = frames / FPS

    # Beat strength: kick energy around each beat, scaled 0..1.
    strength = np.array([bass[max(0, f - 2):f + 3].max() for f in frames])
    strength = np.clip(strength / (np.percentile(strength, 90) + 1e-9), 0, 1)

    # Downbeat: the phase (of 4) whose beats carry the most kick.
    phase = int(np.argmax([strength[p::4].sum() for p in range(4)]))

    # Loudness per bar, 0..1 against the track's own range.
    rms = np.sqrt((magnitude ** 2).mean(axis=1))
    bar_starts = frames[phase::4]
    edges = list(bar_starts) + [len(rms)]
    energy = np.array([rms[a:b].mean() for a, b in zip(edges[:-1], edges[1:])])
    low, high = np.percentile(energy, 10), np.percentile(energy, 95)
    energy = np.clip((energy - low) / (high - low + 1e-9), 0, 1)

    return {
        'bpm': round(60 * FPS / period, 1),
        'beats': [round(float(t), 3) for t in times],
        'strength': [round(float(s), 2) for s in strength],
        'downbeat': phase,
        'bars': [round(float(e), 2) for e in energy],
    }


def main():
    result = {}
    for path in TRACKS:
        result[path] = analyse(path)
        info = result[path]
        print(f"{path}: {info['bpm']} BPM, {len(info['beats'])} beats, downbeat phase {info['downbeat']}")
    out = ASSETS / 'assets' / 'beats.json'
    out.write_text(json.dumps(result, separators=(',', ':')))
    print(f'Wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
