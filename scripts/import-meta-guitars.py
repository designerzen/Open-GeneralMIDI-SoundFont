"""Replace the two GM acoustic guitars from Meta's original CC0 WAV releases.

Python 3.11+, FFmpeg and FFprobe required. Both banks use LAME VBR quality 4.
Keeps 88 existing note URLs; out-of-register notes are resampled extensions.
"""

import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import urllib.request
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "gh-pages/MetaGuitars-source"
QUALITY = 4
FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
STRINGS = [("LowE", 40), ("A", 45), ("D", 50), ("G", 55), ("B", 59), ("HighE", 64)]
CONFIGS = [
    {"kind": "nylon", "program": 24, "name": "Meta Nylon Guitar", "maxMidi": 83,
     "layer": "01Finger", "sampleCount": 348,
     "archiveSha256": "e7fa168b97a72ecc1257917f85cb524fe7c2e1f098dfdcaf8f5c0e29cabe768e"},
    {"kind": "steel", "program": 25, "name": "Meta Steel Guitar", "maxMidi": 84,
     "layer": "02", "sampleCount": 375,
     "archiveSha256": "caaa8a9c07217f4a82d1dfd9f5657c286155464b66bf4dd27797811c2558a909"},
]


def sha256_file(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def probe(path):
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "stream=codec_name,sample_rate,channels,bits_per_sample:format=duration",
        "-of", "json", str(path),
    ]))


def build(config):
    kind = config["kind"]
    collection = f"meta-{kind}-guitar"
    tag = f"{collection}-v1.0.0"
    archive_name = f"meta-open-sound-{collection}-wav.zip"
    url = f"https://github.com/facebookincubator/Meta-open-sound/releases/download/{tag}/{archive_name}"
    cache = CACHE / kind
    cache.mkdir(parents=True, exist_ok=True)
    archive = cache / archive_name
    if not archive.exists():
        print(f"Downloading {config['name']} original WAVs", flush=True)
        partial = archive.with_suffix(".zip.part")
        request = urllib.request.Request(url, headers={"User-Agent": "OpenGM24-WAV-import"})
        with urllib.request.urlopen(request, timeout=120) as response, partial.open("wb") as handle:
            shutil.copyfileobj(response, handle)
        partial.replace(archive)
    if sha256_file(archive) != config["archiveSha256"]:
        raise RuntimeError(f"Archive checksum mismatch: {archive}")

    wav_dir = cache / "wav"
    wav_dir.mkdir(exist_ok=True)
    inventory = {}
    with ZipFile(archive) as bundle:
        sums = bundle.read("SHA256SUMS")
        checksums = dict((name.lstrip("*"), digest) for digest, name in
                         (line.split(maxsplit=1) for line in sums.decode().splitlines()))
        count = 0
        for name in bundle.namelist():
            match = re.fullmatch(r"INSGuitar(Nylon|Steel)_String(LowE|A|D|G|B|HighE)_Vel(0[1-3](?:Finger|Pick)?)_([A-G])(s?)([0-8])_01\.wav", name)
            if not match:
                continue
            instrument, string, layer, letter, sharp, octave = match.groups()
            if instrument.lower() != kind:
                raise RuntimeError(f"Unexpected instrument: {name}")
            data = bundle.read(name)
            if hashlib.sha256(data).hexdigest() != checksums.get(name):
                raise RuntimeError(f"WAV checksum mismatch: {name}")
            count += 1
            if layer != config["layer"]:
                continue
            pitch = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}[letter] + bool(sharp)
            midi = 12 * (int(octave) + 1) + pitch
            key = (midi, string)
            if key in inventory:
                raise RuntimeError(f"Duplicate string/pitch: {name}")
            inventory[key] = {"sourceWav": name, "sourceSha256": checksums[name]}
            destination = wav_dir / name
            if not destination.exists() or sha256_file(destination) != checksums[name]:
                destination.write_bytes(data)
        if count != config["sampleCount"]:
            raise RuntimeError(f"Unexpected source sample count: {count}")
        license_text = bundle.read("LICENSE")
        if b"CC0 1.0 Universal" not in license_text:
            raise RuntimeError("Unexpected collection license")
        (cache / "LICENSE").write_bytes(license_text)
        (cache / "SHA256SUMS").write_bytes(sums)
        (cache / f"{collection}.sfz").write_bytes(bundle.read(f"{collection}.sfz"))
    print(f"{config['name']}: verified release digest and all {count} WAV checksums", flush=True)

    # Match the upstream SFZ channel-1 first-position string choices. High E
    # handles its upper sampled range. No missing string/pitch is guessed.
    chosen = {}
    for midi in range(40, config["maxMidi"] + 1):
        string = next((name for name, root in STRINGS if 0 <= midi - root <= 4), "HighE")
        if (midi, string) not in inventory:
            raise RuntimeError(f"Missing native note/string: MIDI {midi}, {string}")
        chosen[midi] = {**inventory[midi, string], "string": string}

    target = ROOT / f"OpenGM24/acoustic_guitar_{kind}-mp3"
    expected_files = {f"{FLATS[midi % 12]}{midi // 12 - 1}.mp3" for midi in range(21, 109)}
    if {p.name for p in target.glob("*.mp3")} != expected_files:
        raise RuntimeError(f"Unexpected existing note layout: {target}")
    staged = cache / "staged"
    staged.mkdir(exist_ok=True)
    flags = ["-map", "0:a:0", "-c:a", "libmp3lame", "-q:a", str(QUALITY),
             "-map_metadata", "-1", "-write_xing", "1"]

    def encode(midi):
        source_midi = min(max(midi, 40), config["maxMidi"])
        source = chosen[source_midi]
        source_path = wav_dir / source["sourceWav"]
        info = probe(source_path)
        stream = info["streams"][0]
        if stream["codec_name"] != "pcm_s24le" or stream["sample_rate"] != "48000":
            raise RuntimeError(f"Unexpected WAV format: {source_path}")
        semitones = midi - source_midi
        shifted_rate = round(48000 * 2 ** (semitones / 12))
        filters = ["-af", f"asetrate={shifted_rate},aresample=48000"] if semitones else []
        filename = f"{FLATS[midi % 12]}{midi // 12 - 1}.mp3"
        output = staged / filename
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                        "-i", str(source_path), *filters, *flags, str(output)], check=True)
        result = probe(output)
        encoded = result["streams"][0]
        expected_duration = float(info["format"]["duration"]) * 48000 / shifted_rate
        if (encoded["codec_name"] != "mp3" or encoded["sample_rate"] != "48000"
                or encoded["channels"] != stream["channels"]
                or abs(float(result["format"]["duration"]) - expected_duration) > .1):
            raise RuntimeError(f"Output format/duration mismatch: {output}")
        return {**source, "file": filename, "midi": midi, "sourceMidi": source_midi,
                "transpositionSemitones": semitones, "resamplingRate": shifted_rate,
                "channels": stream["channels"], "sourceDurationSeconds": float(info["format"]["duration"]),
                "sha256": sha256_file(output)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        samples = list(pool.map(encode, range(21, 109)))
    backup = cache / "previous-bank"
    if not backup.exists() and not (target / "SOURCE.json").exists():
        shutil.copytree(target, backup)
    for sample in samples:
        shutil.copyfile(staged / sample["file"], target / sample["file"])
    (target / "LICENSE.txt").write_bytes(license_text)
    provenance = {
        "source": f"{config['name']} by Meta's Creative Audio team", "license": "CC0-1.0",
        "release": tag, "sourceArchive": url, "archiveSha256": config["archiveSha256"],
        "verifiedWavCount": count, "sourceFormat": "24-bit 48 kHz WAV",
        "encoder": subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0],
        "ffmpegOutputArguments": flags, "gmProgram": config["program"],
        "velocityLayer": int(config["layer"][:2]),
        "technique": "fingerstyle" if kind == "nylon" else "medium picked",
        "nativeMidiRange": [40, config["maxMidi"]], "outputMidiRange": [21, 108],
        "stringSelection": "Upstream default first-position zones; High E from MIDI 64 upward",
        "processing": "Direct WAV to MP3. Native notes preserve sample rate, channels, levels and complete decays. Outside the recorded range, resample the nearest recorded note to preserve existing note URLs; these extremes are artificial extensions. No normalization or trimming.",
        "samples": samples,
    }
    (target / "SOURCE.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    size = sum((target / sample["file"]).stat().st_size for sample in samples)
    native_count = sum(sample["transpositionSemitones"] == 0 for sample in samples)
    print(f"{config['name']}: installed 88 quality-{QUALITY} MP3s, {size} bytes ({size / 1024**2:.2f} MiB); {native_count} native pitches", flush=True)


def main():
    for executable in ("ffmpeg", "ffprobe"):
        if not shutil.which(executable):
            raise RuntimeError(f"Required executable missing: {executable}")
    for config in CONFIGS:
        build(config)


if __name__ == "__main__":
    main()
