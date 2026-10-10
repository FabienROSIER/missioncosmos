import type { Metadata } from 'next';
import { PublicInfoPage } from '@/components/layout/PublicInfoPage';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Mission Cosmos est un jeu éducatif gratuit d’astronomie pour les 6–12 ans, sans publicité et sans compte.',
};

export default function AboutPage() {
  return (
    <PublicInfoPage title="À propos">
      <h1>À propos</h1>
      <p>
        Mission Cosmos est un jeu éducatif gratuit consacré à l’astronomie, destiné
        principalement aux enfants de 6 à 12 ans.
      </p>
      <h2>Découvrir en jouant</h2>
      <p>
        L’enfant observe, manipule et relève de petits défis. Le voyage part de la
        Terre, passe par la Lune et le système solaire, puis s’éloigne vers les
        étoiles, les galaxies et plus loin encore.
      </p>
      <h2>Gratuit et sans publicité</h2>
      <p>
        Le jeu est gratuit. Il n’y a pas de publicité, pas d’achat et pas de compte
        à créer. C’est un projet indépendant et non commercial.
      </p>
      <h2>À la maison ou en classe</h2>
      <p>
        On peut y jouer dans le navigateur, en famille ou dans un cadre éducatif.
        L’installation sur l’écran d’accueil reste facultative.
      </p>
    </PublicInfoPage>
  );
}
