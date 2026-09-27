# Design system UI — Mission Cosmos

Tokens : `src/styles/tokens.css` · Direction artistique : `docs/DESIGN.md`

| Composant | Fichier | Rôle |
|---|---|---|
| Button | `Button.tsx` | primary / secondary / success / ghost |
| IconButton | `IconButton.tsx` | Action icône (label obligatoire) |
| Card | `Card.tsx` | Surface contenu |
| Modal | `Modal.tsx` | Sheet mobile + dialog desktop |
| Tooltip | `Tooltip.tsx` | Indice court |
| ProgressBar | `ProgressBar.tsx` | Progression mission / profil |
| Badge | `Badge.tsx` | État / étiquette |
| MissionCard | `MissionCard.tsx` | Carte mission (locked/available/completed) |
| DialogueBubble | `DialogueBubble.tsx` | Parole du guide |
| QuizChoice | `QuizChoice.tsx` | Choix de réponse |
| RewardPanel | `RewardPanel.tsx` | Récompense sobre |
| LoadingScreen | `LoadingScreen.tsx` | Chargement |
| ErrorState | `ErrorState.tsx` | Erreur enfant |

Import : `import { Button, MissionCard } from '@/components/ui'`.

Règles : zones tactiles ≥ 48px, contrast fort, `prefers-reduced-motion` respecté.
