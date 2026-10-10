import type { Metadata } from 'next';
import { PublicInfoPage } from '@/components/layout/PublicInfoPage';

export const metadata: Metadata = {
  title: 'Confidentialité',
  description:
    'Mission Cosmos n’envoie aucune donnée personnelle sur un serveur. La partie reste sur l’appareil.',
};

export default function PrivacyPage() {
  return (
    <PublicInfoPage title="Confidentialité">
      <h1>Confidentialité</h1>
      <p>Aucune donnée personnelle du joueur n’est envoyée sur un serveur.</p>
      <ul>
        <li>Aucun compte et aucune inscription.</li>
        <li>Aucune adresse e-mail n’est demandée pour jouer.</li>
        <li>Aucune publicité.</li>
        <li>Aucun tracker marketing.</li>
        <li>Aucune mesure d’audience.</li>
        <li>Aucune géolocalisation.</li>
        <li>Aucune caméra et aucun microphone.</li>
        <li>Aucune donnée de progression envoyée à un serveur.</li>
      </ul>
      <h2>Sauvegarde sur l’appareil</h2>
      <p>
        La partie est enregistrée uniquement dans ce navigateur, dans le stockage
        local (localStorage), sous la clé mc:save.
      </p>
      <p>
        Le nom d’explorateur, l’avatar et la progression restent sur l’appareil.
        Effacer les données du site dans le navigateur, ou choisir « Effacer
        profils et progression » dans les paramètres, supprime cette sauvegarde.
      </p>
    </PublicInfoPage>
  );
}
