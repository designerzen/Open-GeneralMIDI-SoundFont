# Meta acoustic guitar replacements

The zero-based GM slots `acoustic_guitar_nylon` (24) and `acoustic_guitar_steel`
(25) use Meta Open Sound's original WAV recordings. Both are **CC0** and encoded
directly to MP3 at **LAME VBR quality 4**, as requested. The piano remains at its
existing quality 5 setting.

The 88 nylon MP3s total 3,350,792 bytes (3.20 MiB); the 88 steel MP3s total
7,941,536 bytes (7.57 MiB). Both include their full decay tails. The original
guitar banks were 1,295,876 and 1,446,364 bytes respectively.

## Rebuild

Requires Python 3.11+, FFmpeg and FFprobe. From the repository root:

```powershell
python scripts/import-meta-guitars.py
node .github/scripts/generate-index.js
```

The script downloads the original WAV releases, verifies the complete archive
SHA-256 against the pinned GitHub release digest, and checks every WAV against
the included `SHA256SUMS`. Original archives, selected WAVs, source SFZ maps,
staged outputs, and first-import backups stay in ignored `gh-pages/MetaGuitars-source/`.
The two source banks contain the MP3s, original license texts, and `SOURCE.json`.
Publishing the committed banks does not require downloading the WAV archives.

## Single-sample mapping

The existing bank has one file per pitch; it cannot select a different string,
technique or recording based on MIDI velocity. Nylon uses `Vel01Finger` for a
consistent fingerstyle character. Steel uses `Vel02`, the medium-picked dynamic.
The other recordings remain in the downloaded archives for future work.

String choices match the upstream default SFZ channel: Low E on MIDI 40–44,
A on 45–49, D on 50–54, G on 55–59, B on 60–63, and High E from 64 upward.
Every selected native pitch/string must actually exist in the source archive;
the importer fails rather than guessing a missing filename.

Nylon has 44 native pitches, **E2–B5 (MIDI 40–83)**. Steel has 45, **E2–C6
(40–84)**. Each existing folder nevertheless exposes 88 notes, A0–C8. To replace
both instruments completely while preserving all those URLs, notes below E2
are made from E2 and notes above the recorded register from its highest note.
FFmpeg changes PCM playback rate, resamples back to 48 kHz, then encodes MP3 once.
No lossy intermediate is used.

These extended notes are artificial and become less natural far from the recorded
register. The source guidance recommends keeping transposition small; the extreme
compatibility notes exceed that guidance. This limitation is explicit in the
manifest descriptions and every sample's provenance. Playback-rate transposition
also changes decay length in proportion to pitch. Native notes preserve full
decays, source channel counts and levels; nothing is normalized, trimmed or looped.

## Provenance and licenses

Both sources are from v1.0.0 releases:

- [Nylon WAV release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-nylon-guitar-v1.0.0),
  archive SHA-256 `e7fa168b97a72ecc1257917f85cb524fe7c2e1f098dfdcaf8f5c0e29cabe768e`.
- [Steel WAV release](https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-steel-guitar-v1.0.0),
  archive SHA-256 `caaa8a9c07217f4a82d1dfd9f5657c286155464b66bf4dd27797811c2558a909`.

Per-folder `SOURCE.json` records the source filename and hash, target and source
MIDI pitch, string, transposition, actual resampling rate, source channel count,
duration, and output hash. The metadata preserves the original program numbers,
folder paths and flat note spelling. The legacy source licenses still apply to
other instruments; the three Meta banks remain CC0. See [contributions and
attributions](../ATTRIBUTIONS.md) and [LICENSE.txt](../LICENSE.txt).

## Validation completed

- Verified both complete archive digests and all 723 individual source WAV hashes.
- Compared every native note's selected string/recording against the archive's
  actual channel-1 SFZ regions.
- Checked MP3 format, sample rate, channel count and expected duration during
  encoding; fully decoded all 176 installed MP3s and verified output hashes.
- Compared decoded PCM frame counts for low extensions, native low/middle/high
  notes and high extensions against the expected WAV/resampling lengths.
- Rebuilt the site and verified all 176 copied audio hashes, both 88-note indexes,
  all 128 GM programs, instrument licenses/provenance, and public credit links.
