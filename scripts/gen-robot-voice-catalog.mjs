import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dialogues = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/audio/robot/dialogues-essentiels.fr.json'), 'utf8'),
);

const lines = [];
lines.push('/** Catalogue runtime des voix essentielles du robot (lot 47). */');
lines.push('');
lines.push('export type RobotVoiceMessage = {');
lines.push('  id: string;');
lines.push('  /** Chemin relatif sous public/assets/audio/robot/fr/ */');
lines.push('  relativePath: string;');
lines.push('  stepIds: readonly string[];');
lines.push('};');
lines.push('');
lines.push("export const ROBOT_VOICE_LOCALE = 'fr' as const;");
lines.push('');
lines.push('export const ROBOT_VOICE_COMMON = {');
lines.push("  quiz: 'common.quiz',");
lines.push("  retry: 'common.reessayer',");
lines.push("  success: 'common.bravo',");
lines.push("  maquette: 'common.maquette',");
lines.push('} as const;');
lines.push('');
lines.push('export const ROBOT_VOICE_MESSAGES: readonly RobotVoiceMessage[] = [');

for (const d of dialogues) {
  const id = `${d.group}.${d.key}`;
  const relativePath = `${d.group}/${id}.mp3`;
  lines.push('  {');
  lines.push(`    id: ${JSON.stringify(id)},`);
  lines.push(`    relativePath: ${JSON.stringify(relativePath)},`);
  lines.push(`    stepIds: ${JSON.stringify(d.steps)},`);
  lines.push('  },');
}

lines.push('] as const;');
lines.push('');
lines.push('const BY_ID = new Map(ROBOT_VOICE_MESSAGES.map((m) => [m.id, m]));');
lines.push('');
lines.push('/** Priorité sécurité éclipses si plusieurs messages ciblent la même étape. */');
lines.push("const STEP_PRIORITY_SUFFIX = '.securite';");
lines.push('');
lines.push('const STEP_TO_ID = (() => {');
lines.push('  const map = new Map<string, string>();');
lines.push('  for (const message of ROBOT_VOICE_MESSAGES) {');
lines.push('    for (const stepId of message.stepIds) {');
lines.push('      const current = map.get(stepId);');
lines.push('      if (!current) {');
lines.push('        map.set(stepId, message.id);');
lines.push('        continue;');
lines.push('      }');
lines.push('      if (message.id.endsWith(STEP_PRIORITY_SUFFIX)) map.set(stepId, message.id);');
lines.push('    }');
lines.push('  }');
lines.push('  return map;');
lines.push('})();');
lines.push('');
lines.push('export function getRobotVoiceMessage(id: string): RobotVoiceMessage | undefined {');
lines.push('  return BY_ID.get(id);');
lines.push('}');
lines.push('');
lines.push("/** Message d'étape (consigne / explication), hors phrases communes. */");
lines.push(
  'export function resolveRobotVoiceForStep(stepId: string): RobotVoiceMessage | undefined {',
);
lines.push('  const id = STEP_TO_ID.get(stepId);');
lines.push('  return id ? BY_ID.get(id) : undefined;');
lines.push('}');
lines.push('');

const out = path.join(root, 'src/content/audio/robotVoiceCatalog.ts');
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`wrote ${dialogues.length} messages → ${out}`);
