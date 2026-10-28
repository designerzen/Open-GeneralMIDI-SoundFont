# OpenGM24 — General MIDI Soundfont

OpenGM24 is a soundfont sample library for music software, MIDI sequencers, and live playback applications. It contains 128 General MIDI instruments as individual MP3 note samples, with JSON metadata for loading them.

The files are ready to use. No build, package installation, or conversion step is required.

## Contents

- `OpenGM24/` — 11,264 MP3 samples, with 88 notes per instrument from A0 to C8.
- `OpenGM24.json` — instrument names in General MIDI program order (0–127).
- `index.json` — instrument metadata, including program numbers and sample folder names.
- `SOURCE.json` and `LICENSE.txt` in the three Meta-derived instrument folders — source records and licenses.
- [ATTRIBUTIONS.md](ATTRIBUTIONS.md) and [LICENSE.txt](LICENSE.txt) — collection credits and license information.

## Loading the sounds

Load the JSON metadata in your playback software, select the instrument by its zero-based General MIDI program number, and load notes from:

```text
OpenGM24/<folder>/<note>.mp3
```

Use the `folder` value from `index.json`. For example, program 0 uses `acoustic_grand_piano-mp3`, so its middle C sample is:

```text
OpenGM24/acoustic_grand_piano-mp3/C4.mp3
```

Note filenames use flats for accidentals: `Db`, `Eb`, `Gb`, `Ab`, and `Bb`. Keep the folder structure and filenames intact when copying or serving the library. A host application can load the files locally or from a static asset URL and handle decoding, scheduling, and playback.

This library uses MP3 samples and JSON metadata rather than a single `.sf2` file. The host software needs to support loading individual audio samples.

## Sources and credits

The collection draws on FluidR3_GM, Musyng Kite, FatBoy, Tabla, personally recorded variations, and the MIDI.js Soundfonts project.

Meta's Creative Audio team supplies the bright acoustic piano (program 1), nylon guitar (24), and steel guitar (25), released under CC0. The piano uses the mezzo-forte layer; the guitars use fingerstyle and medium-picked recordings respectively. Guitar notes outside the recorded ranges are transposed extensions. Source and conversion details remain in each instrument's `SOURCE.json`.

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for source links and credits, and [LICENSE.txt](LICENSE.txt) for the applicable licenses, including the three CC0 sample sets.
