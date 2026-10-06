import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Production documents only. This script does not connect a voice player to the game.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const cache = new Map();
const rel = (p) => path.relative(root, p).replaceAll('\\', '/');
const full = (p) => path.resolve(root, p);
const contentRoot = full('src/content') + path.sep;

function load(relative) {
  let filename = full(relative);
  if (!path.extname(filename)) filename += fs.existsSync(filename + '.ts') ? '.ts' : '/index.ts';
  const allowed =
    filename.startsWith(contentRoot) ||
    [
      'src/lib/constants.ts',
      'src/lib/basePath.ts',
      'src/lib/shuffle.ts',
      'src/3d/utils/starCinematic.ts',
    ].some((p) => filename === full(p));
  if (!allowed) throw new Error(`Unexpected content dependency: ${rel(filename)}`);
  if (cache.has(filename)) return cache.get(filename).exports;
  const contentModule = { exports: {} };
  cache.set(filename, contentModule);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const contentRequire = (request) =>
    load(
      request.startsWith('@/')
        ? 'src/' + request.slice(2)
        : rel(path.resolve(path.dirname(filename), request)),
    );
  new Function('require', 'module', 'exports', code)(
    contentRequire,
    contentModule,
    contentModule.exports,
  );
  return contentModule.exports;
}

const voicesRoot = 'public/assets/audio/robot/fr';
const docsRoot = 'docs/audio/robot';
const MAX_CHARACTERS = 300;
const MAX_FILES = 50;
const dialogues = JSON.parse(
  fs.readFileSync(full(`${docsRoot}/dialogues-essentiels.fr.json`), 'utf8'),
);
const missions = load('src/content/missions/index.ts').listMissions();
const titles = Object.fromEntries(missions.map((mission) => [mission.id, mission.title]));
titles.common = 'Phrases communes réutilisables';
const messages = dialogues.map((dialogue) => {
  const { group, key, context, steps, speech } = dialogue;
  if (
    !speech ||
    speech !== speech.trim() ||
    speech.includes('\n') ||
    speech.length > MAX_CHARACTERS
  )
    throw new Error(`Texte vide, mal formé ou trop long : ${group}.${key} (${speech.length})`);
  if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Identifiant incorrect : ${key}`);
  const mission = missions.find((item) => item.id === group);
  if (group !== 'common' && !mission) throw new Error(`Mission inconnue : ${group}`);
  if (group !== 'common' && !steps.length) throw new Error(`Contexte sans étape : ${key}`);
  const sourceRefs = steps.map((id) => {
    const step = mission.steps.find((item) => item.id === id);
    if (!step) throw new Error(`Étape inconnue : ${group}/${id}`);
    return {
      source: `src/content/missions/${group}.ts`,
      stepId: id,
      screenText: step.body,
      sourceHash: createHash('sha256').update(step.body).digest('hex'),
    };
  });
  const id = `${group}.${key}`;
  const relativePath = `${group}/${id}.mp3`;
  const destination = `${voicesRoot}/${relativePath}`;
  const clip = {
    id,
    file: `${id}.mp3`,
    relativePath,
    destination,
    publicPath: '/' + destination.slice('public/'.length),
    speech,
    characterCount: speech.length,
    estimatedSeconds: Math.round(speech.split(/\s+/).length / 2.3),
  };
  return {
    id,
    group,
    mission: titles[group],
    context,
    triggerPolicy: 'first-entry-or-request-no-repeat-on-every-step',
    stepIds: steps,
    sourceRefs,
    speech,
    characterCount: speech.length,
    clips: [clip],
  };
});
if (messages.length > MAX_FILES)
  throw new Error(`Budget dépassé : ${messages.length}/${MAX_FILES}`);
if (new Set(messages.map((item) => item.id)).size !== messages.length)
  throw new Error('ID dupliqué');
for (const mission of missions)
  if (!messages.some((item) => item.group === mission.id))
    throw new Error(`Mission oubliée : ${mission.id}`);
for (const group of new Set(messages.map((item) => item.group))) {
  fs.mkdirSync(full(`${voicesRoot}/${group}`), { recursive: true });
  const keep = full(`${voicesRoot}/${group}/.gitkeep`);
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
}
const manifest = {
  schemaVersion: 2,
  locale: 'fr',
  status: 'production-plan-not-connected',
  productionMode: 'essential-only',
  audioRoot: voicesRoot,
  maxCharactersPerFile: MAX_CHARACTERS,
  fileBudget: MAX_FILES,
  optionalQuizManifest: 'manifest-quizz-facultatifs.fr.json',
  messageCount: messages.length,
  clipCount: messages.length,
  countsByGroup: Object.fromEntries(
    Object.keys(titles)
      .filter((group) => messages.some((item) => item.group === group))
      .map((group) => [group, messages.filter((item) => item.group === group).length]),
  ),
  excludedFromRecording: [
    'quiz questions and choices',
    'planet fact sheets',
    'random variants',
    'glossary',
    'badges',
    'film narration',
    'optional constellation bonus',
  ],
  messages,
};
fs.writeFileSync(full(`${docsRoot}/manifest.fr.json`), JSON.stringify(manifest, null, 2) + '\n');
const quote = (value) => '"' + String(value).replaceAll('"', '""') + '"';
const header = [
  'mission',
  'contexte',
  'fichier_mp3',
  'chemin_depot',
  'texte_a_generer',
  'caracteres',
  'etapes_associees',
];
const rows = messages.map((message) => [
  message.mission,
  message.context,
  message.clips[0].relativePath,
  path.join(root, message.clips[0].destination),
  message.speech,
  message.characterCount,
  message.stepIds.join(', '),
]);
fs.writeFileSync(
  full(`${docsRoot}/textes-a-generer.fr.csv`),
  '\uFEFF' + [header, ...rows].map((row) => row.map(quote).join(';')).join('\r\n') + '\r\n',
);
let markdown = `# Voix du robot — liste de production optimisée\n\n**${messages.length} MP3 au total pour les 14 missions**, phrases communes comprises. Chaque texte est limité à **300 caractères**, espaces et ponctuation inclus. Le plus long contient ${Math.max(...messages.map((item) => item.characterCount))} caractères.\n\n`;
markdown += `Cette liste remplace l’ancien catalogue de 754 MP3. Les quiz sont proposés dans [un lot séparé entièrement facultatif](quizz-facultatifs.fr.md). Un texte = une génération dans Chatterrer = un fichier MP3.\n\n`;
markdown += `Copier uniquement le bloc « Texte à générer », sans titre, nom de fichier ou indication de contexte. Déposer le MP3 dans [le dossier français](<${full(voicesRoot).replaceAll('\\', '/')}>), dans le sous-dossier indiqué.\n\n`;
markdown += `Les mêmes consignes peuvent accompagner plusieurs étapes. Jouer le fichier à la première étape pertinente, puis proposer une réécoute ; ne pas le rejouer automatiquement à chaque étape. La consigne écran précise l’objectif actuel.\n\n`;
markdown += `Les quiz, fiches, badges, glossaire, variantes et films ne sont pas enregistrés dans ce lot. La voix accompagne les activités sans lire tout l’écran. Elle ne constitue donc pas une lecture intégrale pour un enfant qui ne lit pas encore : les réponses écrites des quiz peuvent demander l’aide d’un adulte.\n\n`;
markdown += `Aucune voix n’est encore reliée au jeu. Les associations d’étapes sont une proposition d’intégration ; les messages communs ont des déclencheurs décrits dans leur contexte. La sécurité du Soleil reste également visible à l’écran.\n\n`;
for (const group of ['common', ...missions.map((item) => item.id)]) {
  const items = messages.filter((item) => item.group === group);
  markdown += `## ${titles[group]} — ${items.length} MP3\n\n`;
  for (const message of items) {
    markdown += `### ${message.id}\n\n**Contexte :** ${message.context}\n\n`;
    if (message.stepIds.length)
      markdown += `**Étapes :** ${message.stepIds.map((id) => '`' + id + '`').join(', ')}.\n\n`;
    markdown += `**Fichier :** \`${message.clips[0].relativePath}\`\n\n**Longueur :** ${message.characterCount} caractères.\n\n**Texte à générer :**\n\n\`\`\`text\n${message.speech}\n\`\`\`\n\n`;
  }
}
fs.writeFileSync(full(`${docsRoot}/textes-a-generer.fr.md`), markdown);

// Optional quiz pack: one recording per question, including the choices.
// No answer letters or numbers: choices are shuffled in the game.
const quizIndex = load('src/content/quizzes/index.ts');
const quizMessages = [];
for (const mission of missions) {
  if (!mission.quizId) continue;
  const quiz = quizIndex.getQuizById(mission.quizId);
  if (!quiz) throw new Error(`Quiz inconnu : ${mission.quizId}`);
  for (const question of quiz.questions) {
    const prompt = question.prompt.trim();
    const speech =
      `${prompt}${/[.?!…]$/.test(prompt) ? '' : '.'} Tu peux choisir : ${question.choices.map((choice) => choice.label).join(' ; ')}.`
        .replace(/1 UA, une unité astronomique/g, 'Une unité astronomique')
        .replace(/\b9e\b/g, 'neuvième')
        .replace(/\b24 h\b/g, 'vingt-quatre heures')
        .replace(/\b2,5\b/g, 'deux virgule cinq')
        .replace(
          /\b(?:365|24|12|9|8|1)\b/g,
          (number) =>
            ({
              365: 'trois cent soixante-cinq',
              24: 'vingt-quatre',
              12: 'douze',
              9: 'neuf',
              8: 'huit',
              1: 'une',
            })[number],
        );
    if (speech.length > MAX_CHARACTERS)
      throw new Error(`Quiz trop long : ${quiz.id}/${question.id} (${speech.length})`);
    const id = `${mission.id}.quiz.${question.id}`;
    const relativePath = `${mission.id}/quiz/${id}.mp3`;
    const destination = `${voicesRoot}/${relativePath}`;
    quizMessages.push({
      id,
      group: mission.id,
      mission: mission.title,
      optional: true,
      quizId: quiz.id,
      questionId: question.id,
      context: `Quiz « ${quiz.title} » — ${question.prompt}`,
      triggerPolicy: 'question-entry-or-request',
      source: `src/content/quizzes/${mission.id}.ts`,
      sourceHash: createHash('sha256')
        .update(JSON.stringify({ prompt: question.prompt, choices: question.choices }))
        .digest('hex'),
      choiceIds: question.choices.map((choice) => choice.id),
      speech,
      characterCount: speech.length,
      clips: [
        {
          id,
          file: `${id}.mp3`,
          relativePath,
          destination,
          publicPath: '/' + destination.slice('public/'.length),
          speech,
          characterCount: speech.length,
        },
      ],
    });
  }
  fs.mkdirSync(full(`${voicesRoot}/${mission.id}/quiz`), { recursive: true });
  const keep = full(`${voicesRoot}/${mission.id}/quiz/.gitkeep`);
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
}
const optionalManifest = {
  schemaVersion: 2,
  locale: 'fr',
  status: 'production-plan-not-connected',
  productionMode: 'optional-quizzes',
  optional: true,
  audioRoot: voicesRoot,
  maxCharactersPerFile: MAX_CHARACTERS,
  messageCount: quizMessages.length,
  clipCount: quizMessages.length,
  messages: quizMessages,
};
fs.writeFileSync(
  full(`${docsRoot}/manifest-quizz-facultatifs.fr.json`),
  JSON.stringify(optionalManifest, null, 2) + '\n',
);
const quizRows = quizMessages.map((message) => [
  message.mission,
  message.context,
  message.clips[0].relativePath,
  path.join(root, message.clips[0].destination),
  message.speech,
  message.characterCount,
  message.questionId,
]);
fs.writeFileSync(
  full(`${docsRoot}/quizz-facultatifs.fr.csv`),
  '\uFEFF' + [header, ...quizRows].map((row) => row.map(quote).join(';')).join('\r\n') + '\r\n',
);
let quizMarkdown = `# Quiz — voix facultatives\n\n**${quizMessages.length} MP3 facultatifs**, en complément des 47 voix essentielles. Rien dans ce lot n'est obligatoire. Chaque texte est limité à 300 caractères, espaces et ponctuation inclus. Le plus long fait ${Math.max(...quizMessages.map((message) => message.characterCount))} caractères.\n\n`;
quizMarkdown += `Un seul MP3 par question contient la question et ses choix, sans révéler la bonne réponse. Les corrections restent écrites ; les réussites et erreurs peuvent réutiliser les phrases communes. Aucun fichier supplémentaire par réponse ou correction n'est demandé.\n\n`;
quizMarkdown += `Les choix sont mélangés à l'écran. La voix les énumère sans lettre ni numéro : l'enfant choisit le texte correspondant, quelle que soit sa position. L'ordre oral peut différer de l'ordre visuel ; ne pas associer les positions de cette énumération aux boutons ni surligner successivement les réponses dans cet ordre.\n\n`;
quizMarkdown += `Copier seulement le bloc « Texte à générer » dans Chatterrer. Déposer chaque MP3 sous public/assets/audio/robot/fr/ au chemin indiqué. Les sous-dossiers quiz sont prêts. Les fichiers restent à connecter au lecteur. Sans ce lot, les quiz gardent leurs textes et restent jouables.\n\n`;
for (const mission of missions) {
  const items = quizMessages.filter((message) => message.group === mission.id);
  if (!items.length) continue;
  quizMarkdown += `## ${mission.title} — ${items.length} MP3 facultatifs\n\n`;
  for (const message of items)
    quizMarkdown += `### ${message.questionId}\n\n**Contexte :** ${message.context}\n\n**Fichier :** \`${message.clips[0].relativePath}\`\n\n**Longueur :** ${message.characterCount} caractères.\n\n**Texte à générer :**\n\n\`\`\`text\n${message.speech}\n\`\`\`\n\n`;
}
fs.writeFileSync(full(`${docsRoot}/quizz-facultatifs.fr.md`), quizMarkdown);
console.log(
  JSON.stringify(
    {
      optionalQuizFiles: quizMessages.length,
      maxQuizCharacters: Math.max(...quizMessages.map((message) => message.characterCount)),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      mp3: messages.length,
      maxCharacters: Math.max(...messages.map((item) => item.characterCount)),
      counts: manifest.countsByGroup,
    },
    null,
    2,
  ),
);
