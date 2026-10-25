# OpenGM24 - General MIDI Soundfont

OpenGM24 is a comprehensive [General MIDI](https://en.wikipedia.org/wiki/General_MIDI) soundfont repository containing pre-rendered MP3 audio files for all 128 standard MIDI instruments. This project provides easy-to-use audio assets for web applications, MIDI sequencers, music software, and interactive music projects.

## Overview

This repository contains high-quality audio samples for all General MIDI instruments organized by category. Each instrument is available as individual MP3 files, making it easy to load and use specific sounds in your projects.

## Available Soundfonts

OpenGM24 includes 128 instruments across the following categories:

### Pianos & Keyboards (0-8)
acoustic_grand_piano, bright_acoustic_piano, electric_grand_piano, honkytonk_piano, electric_piano_1, electric_piano_2, harpsichord, clavinet

### Chromatic & Percussion (9-15)
celesta, glockenspiel, music_box, vibraphone, marimba, xylophone, tubular_bells, dulcimer

### Organs (16-20)
drawbar_organ, percussive_organ, rock_organ, church_organ, reed_organ

### Accordions & Harmonicas (21-23)
accordion, harmonica, tango_accordion

### Guitars (24-31)
acoustic_guitar_nylon, acoustic_guitar_steel, electric_guitar_jazz, electric_guitar_clean, electric_guitar_muted, overdriven_guitar, distortion_guitar, guitar_harmonics

### Bass (32-39)
acoustic_bass, electric_bass_finger, electric_bass_pick, fretless_bass, slap_bass_1, slap_bass_2, synth_bass_1, synth_bass_2

### Strings (40-47)
violin, viola, cello, contrabass, tremolo_strings, pizzicato_strings, orchestral_harp, timpani

### Ensembles & Orchestra (48-55)
string_ensemble_1, string_ensemble_2, synth_strings_1, synth_strings_2, choir_aahs, voice_oohs, synth_choir, orchestra_hit

### Brass (56-63)
trumpet, trombone, tuba, muted_trumpet, french_horn, brass_section, synth_brass_1, synth_brass_2

### Saxophones & Woodwinds (64-79)
soprano_sax, alto_sax, tenor_sax, baritone_sax, oboe, english_horn, bassoon, clarinet, piccolo, flute, recorder, pan_flute, blown_bottle, shakuhachi, whistle, ocarina

### Synthesizer Leads (80-87)
lead_1_square, lead_2_sawtooth, lead_3_calliope, lead_4_chiff, lead_5_charang, lead_6_voice, lead_7_fifths, lead_8_bass__lead

### Synthesizer Pads (88-95)
pad_1_new_age, pad_2_warm, pad_3_polysynth, pad_4_choir, pad_5_bowed, pad_6_metallic, pad_7_halo, pad_8_sweep

### Sound Effects (96-103)
fx_1_rain, fx_2_soundtrack, fx_3_crystal, fx_4_atmosphere, fx_5_brightness, fx_6_goblins, fx_7_echoes, fx_8_scifi

### Ethnic & World Instruments (104-111)
sitar, banjo, shamisen, koto, kalimba, bagpipe, fiddle, shanai

### Percussion & Effects (112-127)
tinkle_bell, agogo, steel_drums, woodblock, taiko_drum, melodic_tom, synth_drum, reverse_cymbal, guitar_fret_noise, breath_noise, seashore, bird_tweet, telephone_ring, helicopter, applause, gunshot

## Usage

All soundfont files are organized in the `OpenGM24/` directory by instrument name. Each instrument folder contains MP3 audio samples that can be directly referenced in your projects.

## Source Materials

This soundfont collection is derived from the following open-source soundfont sources as well as some personally recorded variations :

### Primary Sources

- **Meta Piano** (`bright_acoustic_piano`, GM program 1)
  - Source: [Meta Open Sound WAV release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-piano-v1.0.0)
  - License: CC0 1.0 Universal
  - Original 24-bit / 48 kHz WAVs encoded directly to MP3 with LAME VBR quality 5 for smaller downloads
  - Uses the mezzo-forte layer for the existing single-sample-per-note layout; full decays and source levels are preserved
  - Rebuild with `python scripts/import-meta-piano.py` (Python 3.11+, FFmpeg and FFprobe)

- **Meta Nylon Guitar** (`acoustic_guitar_nylon`, GM program 24)
  - Source: [Meta Open Sound WAV release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-nylon-guitar-v1.0.0)
  - License: CC0 1.0 Universal
  - Fingerstyle recordings, encoded directly from 24-bit / 48 kHz WAVs to MP3 at LAME VBR quality 4
  - Native notes E2–B5; nearest-note transposition preserves the remaining existing note URLs

- **Meta Steel Guitar** (`acoustic_guitar_steel`, GM program 25)
  - Source: [Meta Open Sound WAV release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-steel-guitar-v1.0.0)
  - License: CC0 1.0 Universal
  - Medium-picked recordings, encoded directly from 24-bit / 48 kHz WAVs to MP3 at LAME VBR quality 4
  - Native notes E2–C6; nearest-note transposition preserves the remaining existing note URLs

Rebuild both guitars with `python scripts/import-meta-guitars.py` (Python 3.11+, FFmpeg and FFprobe). Each instrument retains 88 note files using its existing folder and filenames. Native notes preserve source channels, levels and full decays. Transposed extensions outside the recorded register have less natural timbre and proportionally changed decay lengths. See [guitar conversion details](docs/meta-guitars.md).

- **Fluid Soundfont (FluidR3_GM.sf2)**
  - Source: [FluidR3_GM.sfArk](http://www.synthfont.com/SoundFonts/FluidR3_GM.sfArk) (148 MB uncompressed)
  - License: [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/us/)
  - Reference: [MIDI.js Soundfonts - FluidR3_GM](https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/)

- **Musyng Kite Soundfont**
  - Source: [Musyng Kite.sfpack](http://www.synthfont.com/SoundFonts/Musyng.sfpack) (1.75 GB uncompressed)
  - License: [Creative Commons Attribution Share-Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
  - Reference: [MIDI.js Soundfonts - MusyngKite](https://gleitz.github.io/midi-js-soundfonts/MusyngKite/)

- **FatBoy Soundfont**
  - Source: [FatBoy.sf2](https://fatboy.site) (320 MB uncompressed)
  - License: [Creative Commons Attribution Share-Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
  - Reference: [MIDI.js Soundfonts - FatBoy](https://gleitz.github.io/midi-js-soundfonts/FatBoy/)

## Contributions and attributions

Thanks to Meta's Creative Audio team for the piano and both acoustic guitar recordings, and to the original soundfont creators, gleitz, mudcube, and this repository's contributors. See [the consolidated contribution and attribution list](ATTRIBUTIONS.md) and [license information](LICENSE.txt) for sources, licenses, and conversion details.

## Notes

- For the Meta bright piano source verification, transcoding details, and four-dynamic audition, see [the Meta Piano investigation](docs/meta-piano-investigation.md).

- All sounds are provided as MP3 files for web compatibility and reasonable file sizes
- See `OpenGM24.json` for the complete instrument list in JSON format
- Instruments follow the General MIDI standard numbering (0-127)
- Files can be served directly from the githun-pages URL / RSS for use in web applications
- Based on the work of [gleitz](https://github.com/gleitz/) and the [MIDI.js](https://github.com/mudcube/MIDI.js) project
