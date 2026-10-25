# Meta bright piano implementation

Updated 25 October 2026. Target: `bright_acoustic_piano`, zero-based GM program 1.

## Implemented

The 88 files in `OpenGM24/bright_acoustic_piano-mp3/` now come directly from
Meta Piano's **original WAV release**, using velocity layer 3 (mezzo-forte).
Existing note filenames, flat spellings, folder paths and program numbering are
preserved. The acoustic grand and all other instruments retain their samples.

The existing bank supports one recording per note, so the replacement uses one
recorded dynamic. All four dynamics are also transcoded for the local audition;
using four layers in downstream applications still requires velocity-aware
sample selection and a larger manifest. The 88-file bank does not claim that feature.

## Source quality and encoding

The downloaded `meta-open-sound-meta-piano-wav.zip` is 752,311,261 bytes, from the
[Meta Piano v1.0.0 release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-piano-v1.0.0).
Its SHA-256 matches GitHub's release asset digest:

```
ee9023dbde849ecab393a098aa0cfbd6f2ef48d4a096b9c08808b72fc913f70e
```

Every one of the 352 WAVs is verified against the archive's own `SHA256SUMS`.
FFprobe confirms 24-bit PCM, 48 kHz and **two channels** for every input.
The collection is CC0; its original license is copied alongside the bank's MP3s.

The earlier OGG investigation used upstream commit
`251c0be57d5d1b3242b91f53e0cde62ab1cb42d9`. All 352 OGGs have an `OpusHead`
header, despite upstream documentation describing Vorbis. The four C4 previews
average approximately 127–134 kb/s including container overhead and are mono.
They may be useful previews, but their stereo information has already been lost.
**No OGG is used as an encoding input or by the updated audition.**

Encoding uses FFmpeg's `libmp3lame -q:a 5` (VBR with a smaller download size), with the source
sample rate and channel count preserved. No normalization, EQ, artificial
brightening, trimming, or gain changes are applied. Encoder metadata is stripped;
the Xing header is retained for encoder delay/padding handling.

MP3 is lossy, so this is not bit-identical to the WAV. Encoding once from PCM avoids
stacking MP3 losses on top of Opus losses. Quality 5 trades more compression for
smaller files; listening is needed to judge audibility for these recordings.
See [FFmpeg's LAME options](https://ffmpeg.org/ffmpeg-codecs.html#libmp3lame).

The installed 88 MP3s total 9,326,624 bytes (8.89 MiB), reduced by 64.6% from
the initial quality-0 conversion's 26,341,784 bytes (25.12 MiB). The previous bright
piano was 2,010,694 bytes (1.92 MiB). All four MP3 dynamics total 35,609,984 bytes
(33.96 MiB). The files retain stereo and long decays: new C4's source is
10.01275 seconds, whereas the old bright C4 MP3 was about 3.129 seconds.

## Rebuild and audition

Requires Python 3.11+, FFmpeg and FFprobe on PATH; no Python packages are needed.
Run from the repository root:

```powershell
python scripts/import-meta-piano.py
node .github/scripts/generate-index.js
python -m http.server 8765 --bind 127.0.0.1
```

The importer downloads and verifies the pinned WAV archive, checks all source
hashes, validates key/layer coverage, encodes all 352 recordings, checks output
format and duration, then installs the 88 mezzo-forte MP3s. It stages the entire
compatibility set before replacing the bank's files and preserves a local copy
of the previous bright piano on the first import. Per-sample source and output
hashes, encoding settings and source provenance are recorded in
`OpenGM24/bright_acoustic_piano-mp3/SOURCE.json`.

WAVs, the archive, backups and the four-dynamic audition pack remain under the
already ignored `gh-pages/` directory. The 88 replacement MP3s, their license and
provenance belong to the source bank and are included by the existing Pages build.
CI does not need to download or encode the WAVs when publishing the bank.

Open <http://127.0.0.1:8765/prototypes/meta-piano.html> for three modes: the previous
bright piano, the installed replacement, and four recorded dynamics. The last
mode selects and crossfades layers; single-dynamic modes scale gain with velocity.
The comparison is not loudness matched. The original-piano comparison requires
the local first-import backup. The prototype itself is a local research page,
not part of the published site's navigation.

The four-dynamic mode uses equal-power crossfades over velocities 24–39, 56–71,
and 88–103, preserving recorded relative levels. Note-off fades over 35 ms and
sustain postpones release. Numeric MIDI keys avoid sharp/flat filename ambiguity.
The upstream [reference SFZ](https://github.com/facebookincubator/Meta-open-sound/blob/251c0be57d5d1b3242b91f53e0cde62ab1cb42d9/systems/instruments/meta-piano/meta-piano.sfz)
provides the mapping guidance. The prototype has no Web MIDI input, voice limit,
bounded buffer cache, resonance modelling, or half-pedalling.

## Validation completed

- Verified the complete release archive digest and all 352 individual WAV hashes.
- Checked every encoded file's MP3 format, 48 kHz rate, stereo channels, and duration.
- Fully decoded all 88 installed MP3s and checked their output hashes.
- Compared quality 4, 5 and 6 on 12 notes spanning the keyboard, then re-encoded
  the full bank directly from WAV at quality 5 and repeated output validation.
- Confirmed exact decoded frame counts against WAVs for A0, C-sharp 4 and C8,
  including MP3 encoder delay/padding handling.
- Rebuilt the Pages artifact; verified all 88 copied sample hashes, license,
  updated metadata, and retention of all 128 GM programs.
- Browser playback passed in all three audition modes, including two-layer
  velocity blending. Observed audio requests use only the intended MP3s.

Browser snapshot/click automation timed out during validation, and the alternate
browser provider was unavailable. Direct browser evaluation worked and allowed
the playback checks above. No listening-quality or cross-browser verdict is implied.
