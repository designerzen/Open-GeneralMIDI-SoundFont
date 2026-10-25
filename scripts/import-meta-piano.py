"""Build bright acoustic piano MP3s from Meta's original WAV release.

Requires Python 3.11+, ffmpeg, and ffprobe on PATH. No third-party Python packages.
Downloads and intermediate artifacts stay in the ignored gh-pages directory.
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
TAG = "meta-piano-v1.0.0"
ARCHIVE = "meta-open-sound-meta-piano-wav.zip"
URL = f"https://github.com/facebookincubator/Meta-open-sound/releases/download/{TAG}/{ARCHIVE}"
ARCHIVE_SHA256 = "ee9023dbde849ecab393a098aa0cfbd6f2ef48d4a096b9c08808b72fc913f70e"
CACHE = ROOT / "gh-pages/MetaPiano-source"
PACK = ROOT / "gh-pages/MetaPiano"
TARGET = ROOT / "OpenGM24/bright_acoustic_piano-mp3"
MP3_VBR_QUALITY = 5
FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


def sha256_file(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def probe(path):
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "stream=codec_name,sample_rate,channels,bits_per_sample:format=duration",
        "-of", "json", str(path),
    ]))


def main():
    for executable in ("ffmpeg", "ffprobe"):
        if not shutil.which(executable):
            raise RuntimeError(f"Required executable missing: {executable}")
    CACHE.mkdir(parents=True, exist_ok=True)
    archive = CACHE / ARCHIVE
    if not archive.exists():
        print(f"Downloading original WAVs: {URL}", flush=True)
        partial = archive.with_suffix(".zip.part")
        request = urllib.request.Request(URL, headers={"User-Agent": "OpenGM24-WAV-import"})
        with urllib.request.urlopen(request, timeout=120) as response, partial.open("wb") as output:
            shutil.copyfileobj(response, output)
        partial.replace(archive)
    if sha256_file(archive) != ARCHIVE_SHA256:
        raise RuntimeError(f"WAV archive checksum mismatch: {archive}")
    print("Verified release archive SHA-256", flush=True)

    wav_dir = CACHE / "wav"
    wav_dir.mkdir(exist_ok=True)
    PACK.mkdir(parents=True, exist_ok=True)
    samples = []
    with ZipFile(archive) as bundle:
        sums = bundle.read("SHA256SUMS")
        checksums = {}
        for line in sums.decode().splitlines():
            digest, name = line.split(maxsplit=1)
            checksums[name.lstrip("*")] = digest
        for name in bundle.namelist():
            match = re.fullmatch(r"INSPiano_Vel0([1-4])_([A-G])(s?)([0-8])_01\.wav", name)
            if not match:
                continue
            layer, letter, sharp, octave = match.groups()
            pitch = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}[letter] + bool(sharp)
            midi = 12 * (int(octave) + 1) + pitch
            data = bundle.read(name)
            if hashlib.sha256(data).hexdigest() != checksums.get(name):
                raise RuntimeError(f"WAV sample checksum mismatch: {name}")
            destination = wav_dir / name
            if not destination.exists() or sha256_file(destination) != checksums[name]:
                destination.write_bytes(data)
            samples.append({"midi": midi, "layer": int(layer), "source": name,
                            "sourceSha256": checksums[name], "file": f"mp3/{name[:-4]}.mp3"})
        for name in ("LICENSE", "meta-piano.sfz"):
            (PACK / ("SOURCE.sfz" if name.endswith(".sfz") else name)).write_bytes(bundle.read(name))
        (PACK / "WAV-SHA256SUMS").write_bytes(sums)

    expected = {(midi, layer) for midi in range(21, 109) for layer in range(1, 5)}
    if len(samples) != 352 or {(s["midi"], s["layer"]) for s in samples} != expected:
        raise RuntimeError("Expected all 88 piano keys with four WAV dynamics each")
    print("Verified all 352 WAV sample checksums and key/layer coverage", flush=True)

    (PACK / "mp3").mkdir(exist_ok=True)
    staged = CACHE / "bright-staged"
    staged.mkdir(exist_ok=True)
    encoder = subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0]
    flags = ["-map", "0:a:0", "-c:a", "libmp3lame", "-q:a", str(MP3_VBR_QUALITY), "-map_metadata", "-1", "-write_xing", "1"]

    def encode(sample):
        source = wav_dir / sample["source"]
        info = probe(source)
        stream = info["streams"][0]
        if stream["codec_name"] != "pcm_s24le" or stream["sample_rate"] != "48000":
            raise RuntimeError(f"Unexpected WAV encoding: {source}: {stream}")
        output = PACK / sample["file"]
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                        "-i", str(source), *flags, str(output)], check=True)
        result = probe(output)
        mp3_stream = result["streams"][0]
        if (mp3_stream["codec_name"] != "mp3" or mp3_stream["sample_rate"] != stream["sample_rate"]
                or mp3_stream["channels"] != stream["channels"]):
            raise RuntimeError(f"Output format mismatch: {output}")
        if abs(float(result["format"]["duration"]) - float(info["format"]["duration"])) > .1:
            raise RuntimeError(f"Output duration mismatch: {output}")
        sample["sha256"] = sha256_file(output)
        sample["channels"] = stream["channels"]
        sample["sourceDurationSeconds"] = float(info["format"]["duration"])
        if sample["layer"] == 3:
            note = f"{FLATS[sample['midi'] % 12]}{sample['midi'] // 12 - 1}"
            sample["compatibilityFile"] = f"{note}.mp3"
            shutil.copyfile(output, staged / sample["compatibilityFile"])
        return output.stat().st_size

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        sizes = list(pool.map(encode, samples))
    selected = [s for s in samples if s["layer"] == 3]
    existing = {p.name for p in TARGET.glob("*.mp3")}
    if existing != {s["compatibilityFile"] for s in selected}:
        raise RuntimeError("Compatibility note set differs from existing bright piano; no bank files replaced")

    # Preserve the original bright piano locally before replacing any bank files.
    backup = CACHE / "previous-bright"
    if not backup.exists() and not (TARGET / "SOURCE.json").exists():
        shutil.copytree(TARGET, backup)
    TARGET.mkdir(parents=True, exist_ok=True)
    for sample in selected:
        shutil.copyfile(staged / sample["compatibilityFile"], TARGET / sample["compatibilityFile"])
    shutil.copyfile(PACK / "LICENSE", TARGET / "LICENSE.txt")
    provenance = {
        "source": "Meta Piano by Meta's Creative Audio team", "license": "CC0-1.0",
        "release": TAG, "sourceArchive": URL, "archiveSha256": ARCHIVE_SHA256,
        "sourceFormat": "24-bit 48 kHz WAV", "encoder": encoder, "ffmpegOutputArguments": flags,
        "processing": "Direct WAV to MP3; original sample rate, channels, levels, and complete decays preserved. No normalization.",
    }
    compatibility_samples = [{"file": s["compatibilityFile"], "midi": s["midi"],
        "sourceWav": s["source"], "sourceSha256": s["sourceSha256"], "sha256": s["sha256"],
        "channels": s["channels"], "sourceDurationSeconds": s["sourceDurationSeconds"]} for s in selected]
    (TARGET / "SOURCE.json").write_text(json.dumps({**provenance, "gmProgram": 1,
        "velocityLayer": 3, "dynamic": "mezzo-forte", "samples": compatibility_samples}, indent=2) + "\n", encoding="utf-8")
    (PACK / "playback.json").write_text(json.dumps({**provenance, "id": "meta-piano",
        "name": "Meta Upright Piano", "noteRange": [21, 108], "velocitySplits": [32, 64, 96],
        "releaseSeconds": .035, "format": "mp3", "sampleCount": len(samples),
        "audioBytes": sum(sizes), "samples": samples}, indent=2) + "\n", encoding="utf-8")
    print(f"Encoded 352 WAVs to MP3 ({sum(sizes) / 1024**2:.2f} MiB)", flush=True)
    print(f"Installed 88 mezzo-forte samples into {TARGET}", flush=True)


if __name__ == "__main__":
    main()
