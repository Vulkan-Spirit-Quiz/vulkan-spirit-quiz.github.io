// Validates the question bank before every deploy.
import { PACKS, MISSIONS, THEMES, pointsFor } from '../lib/questions.mjs';
const errors = [];
if (PACKS.length !== 11 || MISSIONS.length !== 11) errors.push('Es müssen 11 Missionen sein.');
PACKS.forEach((pack, p) => {
  const expected = MISSIONS[p].finale ? 9 : 10;
  if (pack.length !== expected) errors.push(`Mission ${p}: ${pack.length} statt ${expected} Fragen`);
  if (!MISSIONS[p].finale) {
    const themes = new Set(pack.map(q => q.theme));
    if (themes.size !== THEMES.length) errors.push(`Mission ${p}: nicht alle Themen vertreten`);
    if (!pack[9].hard || pack.slice(0, 9).some(q => q.hard)) errors.push(`Mission ${p}: nur Frage 10 darf die Knackfrage sein`);
  }
  pack.forEach((q, i) => {
    const where = `Mission ${p} Frage ${i + 1}`;
    if (!q.text || !q.explanation) errors.push(where + ': Text oder Erklärung fehlt');
    if (q.options.length !== 4 || new Set(q.options).size !== 4) errors.push(where + ': braucht 4 verschiedene Antworten');
    if (!(q.correct >= 0 && q.correct < 4)) errors.push(where + ': richtige Antwort fehlt');
  });
});
if (pointsFor(0, 9, 0) > 2500) errors.push('Punkte über dem Datenbanklimit (2500)');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Fragenkatalog ok: ${PACKS.reduce((n, p) => n + p.length, 0)} Fragen in ${PACKS.length} Missionen.`);
