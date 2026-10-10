import type { Metadata } from 'next';
import { PublicInfoPage } from '@/components/layout/PublicInfoPage';
import styles from '@/components/layout/PublicInfoPage.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Écrire à Mission Cosmos : contact@missioncosmos.fr',
};

export default function ContactPage() {
  return (
    <PublicInfoPage title="Contact">
      <h1>Contact</h1>
      <p>Une question sur le jeu ? Écris-nous à cette adresse.</p>
      <p>
        <a className={styles.mail} href="mailto:contact@missioncosmos.fr">
          contact@missioncosmos.fr
        </a>
      </p>
      <p>
        Le lien ouvre l’application de messagerie de l’appareil. Mission Cosmos ne
        reçoit pas le message sur un serveur et ne le stocke pas.
      </p>
    </PublicInfoPage>
  );
}
