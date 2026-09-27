'use client';

import { Fragment, type ReactNode } from 'react';
import { GlossaryTermButton } from '@/features/glossary/GlossaryTermButton';
import type { GlossaryEntry } from '@/types/glossary';

type RichMissionTextProps = {
  text: string;
  entries: GlossaryEntry[];
  onOpenTerm: (entryId: string) => void;
};

/**
 * Transforme les mots du glossaire présents dans le texte en boutons cliquables.
 * Matching simple, insensible à la casse.
 */
export function RichMissionText({ text, entries, onOpenTerm }: RichMissionTextProps) {
  if (entries.length === 0) return <>{text}</>;

  const patterns = entries
    .flatMap((entry) => {
      const labels = [entry.term, ...(entry.aliases ?? [])];
      return labels.map((label) => ({ id: entry.id, label }));
    })
    .sort((a, b) => b.label.length - a.label.length);

  const uniqueLabels = [...new Set(patterns.map((p) => p.label))];
  if (uniqueLabels.length === 0) return <>{text}</>;

  const escaped = uniqueLabels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

  const parts = text.split(regex);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i]!;
    if (!part) continue;
    const match = patterns.find((p) => p.label.toLowerCase() === part.toLowerCase());
    if (match) {
      nodes.push(
        <GlossaryTermButton
          key={`${match.id}-${i}`}
          label={part}
          onOpen={() => onOpenTerm(match.id)}
        />,
      );
    } else {
      nodes.push(<Fragment key={`t-${i}`}>{part}</Fragment>);
    }
  }

  return <>{nodes}</>;
}
