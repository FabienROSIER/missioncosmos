#!/usr/bin/env python3
"""
Mission Cosmos — coloration légère « petit robot » sur les MP3 du Guide.

Traitement destructif sur place (même nom, même dossier).
Fais une sauvegarde avant utilisation.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CONFIG = SCRIPT_DIR / "config.json"
TEMP_SUFFIX = ".__mission_cosmos_processing__.mp3"
TEMP_MARKER = ".__mission_cosmos_processing__"


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("config.json doit être un objet JSON.")
    return data


def find_ffmpeg() -> str | None:
    explicit = os.environ.get("FFMPEG_PATH")
    if explicit and Path(explicit).is_file():
        return explicit
    which = shutil.which("ffmpeg")
    return which


def require_ffmpeg(for_processing: bool) -> str | None:
    ffmpeg = find_ffmpeg()
    if ffmpeg:
        try:
            subprocess.run(
                [ffmpeg, "-version"],
                check=True,
                capture_output=True,
                text=True,
            )
            return ffmpeg
        except (OSError, subprocess.CalledProcessError) as exc:
            print("ERREUR : FFmpeg trouvé mais inutilisable.", file=sys.stderr)
            print(exc, file=sys.stderr)
            if for_processing:
                sys.exit(1)
            return None

    print("ERREUR : FFmpeg n'est pas disponible dans le PATH.", file=sys.stderr)
    print("", file=sys.stderr)
    print("Installe FFmpeg, puis rouvre le terminal. Sous Windows :", file=sys.stderr)
    print("  winget install Gyan.FFmpeg", file=sys.stderr)
    print("", file=sys.stderr)
    print("Vérifie ensuite avec :", file=sys.stderr)
    print("  ffmpeg -version", file=sys.stderr)
    if for_processing:
        sys.exit(1)
    return None


def probe_audio(ffmpeg: str, src: Path) -> tuple[int | None, int | None]:
    """Retourne (sample_rate, channels) via ffprobe si possible, sinon (None, None)."""
    ffprobe = Path(ffmpeg).with_name("ffprobe.exe" if os.name == "nt" else "ffprobe")
    if not ffprobe.is_file():
        which = shutil.which("ffprobe")
        ffprobe = Path(which) if which else None  # type: ignore[assignment]
    if not ffprobe or not Path(ffprobe).is_file():
        return None, None
    try:
        result = subprocess.run(
            [
                str(ffprobe),
                "-v",
                "error",
                "-select_streams",
                "a:0",
                "-show_entries",
                "stream=sample_rate,channels",
                "-of",
                "json",
                str(src),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        streams = payload.get("streams") or []
        if not streams:
            return None, None
        stream = streams[0]
        rate = int(stream["sample_rate"]) if stream.get("sample_rate") else None
        channels = int(stream["channels"]) if stream.get("channels") else None
        return rate, channels
    except (OSError, subprocess.CalledProcessError, ValueError, KeyError, json.JSONDecodeError):
        return None, None


def pitch_factor(semitones: float) -> float:
    return 2.0 ** (semitones / 12.0)


def cents_factor(cents: float) -> float:
    return 2.0 ** (cents / 1200.0)


def build_atempo_chain(tempo: float) -> list[str]:
    """FFmpeg atempo accepte seulement 0.5–2.0 ; chaîner si besoin."""
    filters: list[str] = []
    remaining = float(tempo)
    if remaining <= 0:
        raise ValueError("tempo doit être > 0")
    while remaining < 0.5:
        filters.append("atempo=0.5")
        remaining /= 0.5
    while remaining > 2.0:
        filters.append("atempo=2.0")
        remaining /= 2.0
    filters.append(f"atempo={remaining:.6f}")
    return filters


def build_filter_complex(cfg: dict[str, Any], sample_rate: int) -> str:
    semitones = float(cfg.get("pitch_semitones", 1.5))
    tempo = float(cfg.get("tempo", 0.96))
    highpass_hz = float(cfg.get("highpass_hz", 90))
    presence_db = float(cfg.get("presence_gain_db", 1.5))
    presence_hz = float(cfg.get("presence_frequency_hz", 3000))
    robot_enabled = bool(cfg.get("robot_effect_enabled", True))
    robot_delay_ms = float(cfg.get("robot_delay_ms", 16))
    robot_mix = float(cfg.get("robot_mix", 0.06))
    robot_cents = float(cfg.get("robot_side_pitch_cents", 8))
    sat_enabled = bool(cfg.get("saturation_enabled", False))
    sat_drive = float(cfg.get("saturation_drive", 0.08))
    comp_thr = float(cfg.get("compress_threshold_db", -18))
    comp_ratio = float(cfg.get("compress_ratio", 2.5))
    comp_attack = float(cfg.get("compress_attack_ms", 20)) / 1000.0
    comp_release = float(cfg.get("compress_release_ms", 200)) / 1000.0
    comp_makeup = float(cfg.get("compress_makeup_db", 1.0))
    lufs = float(cfg.get("normalize_lufs", -16))
    true_peak = float(cfg.get("true_peak_db", -1))

    pf = pitch_factor(semitones)
    # Pitch sans changer le tempo (asetrate + compensation), puis tempo indépendant.
    pitched_rate = max(1000, int(round(sample_rate * pf)))
    chain: list[str] = [
        f"asetrate={pitched_rate}",
        f"aresample={sample_rate}",
        *build_atempo_chain(1.0 / pf),
        *build_atempo_chain(tempo),
        f"highpass=f={highpass_hz}:p=1",
        f"equalizer=f={presence_hz}:t=h:width=1200:g={presence_db}",
    ]

    filters: list[str] = []
    filters.append(f"[0:a]{','.join(chain)}[pre]")

    current = "pre"

    if robot_enabled and robot_mix > 0:
        delay_ms = max(1, int(round(robot_delay_ms)))
        side_pf = cents_factor(robot_cents)
        side_rate = max(1000, int(round(sample_rate * side_pf)))
        dry = max(0.0, 1.0 - robot_mix)
        filters.append(f"[{current}]asplit=2[dryraw][sideraw]")
        filters.append(
            f"[sideraw]adelay={delay_ms}|{delay_ms},"
            f"asetrate={side_rate},aresample={sample_rate},"
            f"volume={robot_mix:.4f}[wet]"
        )
        filters.append(f"[dryraw]volume={dry:.4f}[dry]")
        filters.append("[dry][wet]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[robot]")
        current = "robot"

    if sat_enabled and sat_drive > 0:
        # Soft clip très léger (désactivé par défaut).
        filters.append(
            f"[{current}]asoftclip=type=tanh:param={sat_drive:.4f}[sat]"
        )
        current = "sat"

    filters.append(
        f"[{current}]acompressor="
        f"threshold={comp_thr}dB:ratio={comp_ratio}:"
        f"attack={comp_attack}:release={comp_release}:"
        f"makeup={comp_makeup}[comp]"
    )
    current = "comp"

    # loudnorm en une passe (bon compromis pour lots courts éducatifs).
    filters.append(
        f"[{current}]loudnorm=I={lufs}:TP={true_peak}:LRA=11:linear=true:print_format=summary[out]"
    )

    return ";".join(filters)


def list_mp3_files(root: Path) -> list[Path]:
    found: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        name = path.name
        if TEMP_MARKER in name:
            continue
        if path.suffix.lower() != ".mp3":
            continue
        found.append(path)
    found.sort(key=lambda p: str(p.relative_to(root)).lower())
    return found


def relative_display(root: Path, path: Path) -> str:
    return str(path.relative_to(root))


def process_one(
    ffmpeg: str,
    cfg: dict[str, Any],
    root: Path,
    src: Path,
) -> None:
    if not src.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {src}")

    sample_rate, channels = probe_audio(ffmpeg, src)
    if sample_rate is None:
        sample_rate = 44100
    if channels is None:
        channels = 1

    filter_complex = build_filter_complex(cfg, sample_rate)
    bitrate = str(cfg.get("mp3_bitrate", "192k"))

    # Temp dans le même dossier pour que os.replace reste sur le même volume.
    temp_path = src.with_name(src.stem + TEMP_SUFFIX)
    if temp_path.exists():
        temp_path.unlink()

    cmd = [
        ffmpeg,
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(src),
        "-filter_complex",
        filter_complex,
        "-map",
        "[out]",
        "-c:a",
        "libmp3lame",
        "-b:a",
        bitrate,
        "-ac",
        str(channels),
        "-ar",
        str(sample_rate),
        str(temp_path),
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        if not temp_path.is_file() or temp_path.stat().st_size < 64:
            raise RuntimeError("Fichier temporaire invalide ou trop petit.")
        os.replace(temp_path, src)
    except Exception:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass
        raise


def confirm_or_abort(root: Path, count: int, assume_yes: bool) -> None:
    print()
    print("ATTENTION")
    print()
    print(f"{count} fichiers MP3 vont être modifiés définitivement dans :")
    print()
    print(root)
    print()
    print("Une sauvegarde du dossier est recommandée.")
    print()
    if assume_yes:
        print("Confirmation automatique (--yes).")
        return
    answer = input("Continuer ? [O/N] ").strip()
    if answer.lower() not in {"o", "y", "oui", "yes"}:
        print("Annulé.")
        sys.exit(0)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Coloration légère « petit robot » des voix Mission Cosmos (destructif).",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="Chemin vers config.json",
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=None,
        help="Dossier racine alternatif (sinon config.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Lister les MP3 sans rien modifier",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Ne pas demander de confirmation",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help=r'Un seul fichier relatif, ex: "common\common.bravo.mp3"',
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cfg = load_config(args.config.resolve())

    root = Path(args.root) if args.root else Path(str(cfg["root_folder"]))
    root = root.expanduser().resolve()

    print("Dossier cible :")
    print(root)
    print()

    if not root.is_dir():
        print(f"ERREUR : dossier introuvable : {root}", file=sys.stderr)
        return 1

    for_processing = not args.dry_run
    ffmpeg = require_ffmpeg(for_processing=for_processing)
    sys.stdout.flush()
    sys.stderr.flush()
    if ffmpeg:
        print(f"FFmpeg : {ffmpeg}")
    elif args.dry_run:
        print("Avertissement : FFmpeg absent — dry-run OK, traitement réel impossible.")
    print()

    all_files = list_mp3_files(root)
    print(f"{len(all_files)} fichiers MP3 trouvés.")
    print()

    if args.file:
        target = (root / args.file).resolve()
        try:
            target.relative_to(root)
        except ValueError:
            print("ERREUR : le fichier doit être sous le dossier cible.", file=sys.stderr)
            return 1
        if not target.is_file() or target.suffix.lower() != ".mp3":
            print(f"ERREUR : MP3 introuvable : {args.file}", file=sys.stderr)
            return 1
        if TEMP_MARKER in target.name:
            print("ERREUR : fichier temporaire interdit.", file=sys.stderr)
            return 1
        files = [target]
    else:
        files = all_files

    if args.dry_run:
        for index, path in enumerate(files, start=1):
            print(f"[{index}/{len(files)}] {relative_display(root, path)}")
        print()
        print("Dry-run terminé. Aucun fichier modifié.")
        return 0

    if not files:
        print("Aucun MP3 à traiter.")
        return 0

    if not ffmpeg:
        return 1

    confirm_or_abort(root, len(files), assume_yes=args.yes)

    treated = 0
    errors: list[tuple[str, str]] = []

    for index, path in enumerate(files, start=1):
        rel = relative_display(root, path)
        print(f"[{index}/{len(files)}] {rel}")
        try:
            process_one(ffmpeg, cfg, root, path)
            treated += 1
        except subprocess.CalledProcessError as exc:
            detail = (exc.stderr or exc.stdout or str(exc)).strip()
            errors.append((rel, detail or "échec FFmpeg"))
            print(f"  ERREUR : {detail or 'échec FFmpeg'}", file=sys.stderr)
        except Exception as exc:  # noqa: BLE001 — continuer le lot
            errors.append((rel, str(exc)))
            print(f"  ERREUR : {exc}", file=sys.stderr)

    print()
    print("Traitement terminé.")
    print()
    print(f"Fichiers détectés : {len(files)}")
    print(f"Fichiers traités : {treated}")
    print(f"Erreurs : {len(errors)}")
    if errors:
        print()
        print("Détail des erreurs :")
        for rel, detail in errors:
            print(f"- {rel}")
            print(f"  {detail}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
