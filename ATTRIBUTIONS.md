# Contributions and attributions

OpenGM24 combines recorded material, soundfont renders, conversion work, and the
MIDI.js ecosystem. The licenses below apply to their respective materials; the
three Meta-derived instrument folders are CC0 exceptions to the collection's
general CC BY-SA 3.0 terms. See [LICENSE.txt](LICENSE.txt).

## Meta's Creative Audio team / Meta Open Sound

Thanks to Meta's Creative Audio team for recording and releasing these instruments:

- [Meta Piano v1.0.0](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-piano-v1.0.0)
  supplies `bright_acoustic_piano` (program 1), using the mezzo-forte layer.
- [Meta Nylon Guitar v1.0.0](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-nylon-guitar-v1.0.0)
  supplies `acoustic_guitar_nylon` (program 24), using the fingerstyle layer.
- [Meta Steel Guitar v1.0.0](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-steel-guitar-v1.0.0)
  supplies `acoustic_guitar_steel` (program 25), using the medium-picked layer.

These recordings are released under **CC0 1.0 Universal**; attribution is voluntary.
The original license is included in each of the three instrument folders.

OpenGM24 encodes directly from the original 24-bit / 48 kHz WAVs, using LAME VBR
quality 5 for the piano and quality 4 for the guitars. Guitar notes beyond the
recorded range are nearest-note transpositions for compatibility with the existing
88-note layout. Native notes retain the original sample rate, channel count,
levels and complete decays. No OGG previews are used as conversion sources.

Each folder's `SOURCE.json` records the release URL, archive SHA-256, source and
output sample hashes, encoding settings, and note mapping. Guitar records also
identify source string, source pitch, and any transposition.

## Original soundfont sources

- **Fluid Soundfont (FluidR3_GM)** — Creative Commons Attribution 3.0 US.
  [Source archive](http://www.synthfont.com/SoundFonts/FluidR3_GM.sfArk),
  [license](https://creativecommons.org/licenses/by/3.0/us/).
- **Musyng Kite** — Creative Commons Attribution-ShareAlike 3.0.
  [Source archive](http://www.synthfont.com/SoundFonts/Musyng.sfpack),
  [license](https://creativecommons.org/licenses/by-sa/3.0/).
- **FatBoy** — Creative Commons Attribution-ShareAlike 3.0.
  [Source website](https://fatboy.site),
  [license](https://creativecommons.org/licenses/by-sa/3.0/).
- **Tabla Soundfont** — Creative Commons Attribution-ShareAlike 3.0.
  [Source](https://gleitz.github.io/midi-js-soundfonts/Tabla/Tabla.sf2),
  [license](https://creativecommons.org/licenses/by-sa/3.0/).

These retain the source credits and license declarations already recorded in
this repository. They continue to supply other instruments in the collection.

## Software and project contributions

- **gleitz** — [MIDI.js Soundfonts](https://github.com/gleitz/midi-js-soundfonts),
  on which this collection's soundfont rendering work is based.
- **mudcube** — [MIDI.js](https://github.com/mudcube/MIDI.js).
- **OpenGM24 contributors** — collection assembly, personally recorded variations,
  instrument metadata, sample conversion, and source verification.
