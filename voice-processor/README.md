# Voice processor — Mission Cosmos

Outil destructif (sur place) pour ajouter une légère signature « petit robot » aux MP3 du dossier `public/assets/audio/robot/fr`.

**Fais une sauvegarde du dossier audio avant tout traitement réel.**

## Prérequis

- Python 3.10+
- FFmpeg dans le PATH

Vérifier FFmpeg :

```powershell
ffmpeg -version
```

Installation possible sous Windows :

```powershell
winget install Gyan.FFmpeg
```

Puis rouvre le terminal pour que le PATH soit pris en compte.

## Installation

```powershell
cd "D:\Programmation\Mission Cosmos\voice-processor"
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Vérification sans modification

```powershell
python process_voices.py --dry-run
```

## Test d'un fichier

```powershell
python process_voices.py --file "common\common.bravo.mp3"
```

Le chemin est relatif à `public/assets/audio/robot/fr`.

## Traitement complet

```powershell
python process_voices.py
```

## Traitement sans confirmation

```powershell
python process_voices.py --yes
```

## Réglages prioritaires

Dans `config.json` :

| Paramètre | Rôle |
|---|---|
| `pitch_semitones` | Hauteur (+1.5 par défaut) |
| `tempo` | Vitesse (0.96 = −4 %) |
| `robot_mix` | Intensité de la copie robot (0.06) |
| `robot_delay_ms` | Retard de la copie (16 ms) |

Commencer subtil ; augmenter ensuite si besoin.
