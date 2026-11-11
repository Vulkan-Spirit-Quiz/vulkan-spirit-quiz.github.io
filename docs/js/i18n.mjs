// Vulkan Spirit Quiz – languages. Every device picks its own language (remembered on the device):
//   de   – German (the original)
//   en   – English
//   both – German with the English question, answers and explanation underneath (projector / host)
// The German text is the key: t('Frage {n} von {total}', { n, total }). Anything without an English
// entry simply stays German, so a missing translation never breaks the page.

const KEY = 'vs-lang';
const read = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
const fromUrl = new URLSearchParams(location.search).get('lang');
if (['de', 'en', 'both'].includes(fromUrl)) { try { localStorage.setItem(KEY, fromUrl); } catch { /* private mode */ } }

let lang = ['de', 'en', 'both'].includes(fromUrl) ? fromUrl : read()
  || ((navigator.languages || [navigator.language || 'de']).some(l => /^de\b/i.test(l)) ? 'de' : 'en');

export const getLang = () => lang;
export function setLang(l) {
  if (!['de', 'en', 'both'].includes(l)) return;
  lang = l; try { localStorage.setItem(KEY, l); } catch { /* private mode */ }
  document.documentElement.lang = l === 'en' ? 'en' : 'de';
}
document.documentElement.lang = lang === 'en' ? 'en' : 'de';

/** Language of the interface text (buttons, labels). "both" keeps the interface German. */
export const uiEn = () => lang === 'en';
export const locale = () => (uiEn() ? 'en-GB' : 'de-AT');

export function t(de, vars) {
  let s = (uiEn() && EN[de]) || de;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}
/** Singular/plural: tn(n, 'Team', 'Teams'). */
export const tn = (n, one, many) => t(n === 1 ? one : many);

const EN = {
  // frame
  'Startseite': 'Home', 'Verbinde …': 'Connecting …', 'Sprache': 'Language',
  'Wartet auf Start': 'Waiting to start', 'Frage {n}/{total}': 'Question {n}/{total}', 'Auflösung': 'Answer', 'Endstand': 'Final score',
  'Code {code}': 'Code {code}', 'Team': 'team', 'Teams': 'teams', 'Crew': 'crew', 'Crews': 'crews',
  // home
  'Wissen · die letzte Grenze': 'Knowledge · the final frontier',
  'Das Star-Trek-Quiz der Vulkan Spirit Crew für Conventions und Fan-Abende: Crews treten gegeneinander an, sammeln Punkte und holen sich die Belohnung. QR-Code scannen, Teamname eingeben, los geht’s – ohne Anmeldung, ohne App.':
    'The Star Trek quiz by the Vulkan Spirit crew for conventions and fan nights: crews compete, collect points and win the prize. Scan the QR code, enter a team name and go – no sign-up, no app.',
  'An Bord kommen': 'Come aboard', 'SPIELCODE': 'GAME CODE', 'Sechsstelliger Spielcode': 'Six-character game code', 'Beitreten →': 'Join →',
  'Brücke übernehmen': 'Take the bridge', 'Schiff wählen – jede Mission enthält Fragen aus allen zehn Themenbereichen.': 'Pick a ship – every mission has questions from all ten topics.',
  'Belohnung für die Siegercrew': 'Prize for the winning crew', 'Mission eröffnen →': 'Open mission →', 'Zurück zur Mission {code}': 'Back to mission {code}',
  'Holodeck-Training': 'Holodeck training',
  'Gerade keine Crews da? Spiel die oben gewählte Mission allein auf diesem Gerät – mit Countdown, Punkten und Auflösung.':
    'No crews around? Play the mission selected above on your own on this device – with countdown, points and answers.',
  'Dein Name': 'Your name', 'z. B. Kadett Kirk': 'e.g. Cadet Kirk', 'Training starten →': 'Start training →', 'Kadett': 'Cadet',
  'Fragen &amp; Quellen': 'Questions &amp; sources', 'Bild- &amp; Schriftquellen': 'Image &amp; font credits',
  'Inoffizielles Fanprojekt von Vulkan Spirit. Star Trek ist eine Marke von Paramount/CBS.': 'Unofficial fan project by Vulkan Spirit. Star Trek is a trademark of Paramount/CBS.',
  '5 Bonusfragen · inkl. Musikfrage': '5 bonus questions · incl. music question', '10 Fragen': '10 questions',
  // question
  'Frage {n} von {total}': 'Question {n} of {total}', 'KNACKFRAGE · 2,5× PUNKTE': 'TOUGH QUESTION · 2.5× POINTS', '♫ MUSIKFRAGE · {s} SEKUNDEN': '♫ MUSIC QUESTION · {s} SECONDS',
  '⏸ Musik pausieren': '⏸ Pause music', '↺ Musik nochmal': '↺ Play again', '▶ Musik abspielen': '▶ Play music',
  'Der Browser hat die Musik angehalten – bitte einmal tippen.': 'The browser paused the music – please tap once.',
  'Missionsfortschritt': 'Mission progress', 'Fragenbild': 'Question picture', 'Vergrößertes Fragenbild': 'Enlarged question picture', 'Schließen': 'Close',
  'Noch keine Teams.': 'No teams yet.', 'Achtung, Brücke …': 'Attention, bridge …', 'LOGBUCHEINTRAG': 'LOG ENTRY', 'RANGLISTE · LIVE': 'LEADERBOARD · LIVE',
  '{a} von {b} Teams haben geantwortet.': '{a} of {b} teams have answered.',
  // lobby / host
  'MISSIONSZIEL': 'MISSION', 'BELOHNUNG FÜR DIE SIEGERCREW': 'PRIZE FOR THE WINNING CREW',
  '{n} Fragen · {s} Sekunden pro Frage · 500–1.000 Punkte': '{n} questions · {s} seconds per question · 500–1,000 points',
  '{n} {crews} an Bord': '{n} {crews} aboard', 'Team entfernen': 'Remove team', '{name} entfernen': 'Remove {name}', 'Warte auf Crews – QR-Code scannen …': 'Waiting for crews – scan the QR code …',
  'Link für Teams kopieren': 'Copy link for teams', 'QR-Code speichern ↓': 'Save QR code ↓', 'Bildschirm öffnen ↗': 'Open projector screen ↗', 'Leitungslink sichern': 'Save host link',
  'Mission oder Preis ändern': 'Change mission or prize', 'Preis': 'Prize', 'Übernehmen': 'Apply', 'Mission beginnen →': 'Start mission →',
  'Sobald die erste Crew an Bord ist, kann es losgehen.': 'As soon as the first crew is aboard, you can start.',
  'Tipp: Leertaste oder Enter = Weiter / Auflösen.': 'Tip: space or Enter = next / reveal.',
  'Fernbedienung: Pfeiltasten zum Auswählen, OK zum Bestätigen. Die Teams scannen den QR-Code mit dem Handy.': 'Remote: arrow keys to select, OK to confirm. Teams scan the QR code with their phones.',
  'Endstand zeigen →': 'Show final score →', 'Nächste Frage →': 'Next question →', 'Lösung zeigen': 'Reveal answer', 'Wirklich beenden?': 'Really end?', 'Quiz beenden': 'End quiz',
  'Spielleitung · {code}': 'Host · {code}', 'Beamer · {code}': 'Screen · {code}',
  'Geräte, die gerade mit diesem Browser verbunden sind': 'Devices currently connected to this browser', '📡 {n} {devices} verbunden': '📡 {n} {devices} connected', 'Gerät': 'device', 'Geräte': 'devices',
  'Funkmodul fehlt – Internet prüfen': 'Radio module missing – check internet', 'Funkkanal wird geöffnet …': 'Opening radio channel …',
  '📡 Das Quiz läuft in <b>diesem Browserfenster</b>. Bitte geöffnet lassen, bis das Spiel vorbei ist – die Teams sind direkt mit diesem Gerät verbunden. Neu laden ist kein Problem, der Spielstand bleibt erhalten.':
    '📡 The quiz runs in <b>this browser window</b>. Please keep it open until the game is over – the teams are connected directly to this device. Reloading is fine, the score is kept.',
  'JETZT AN BORD KOMMEN': 'COME ABOARD NOW',
  // finished
  'Picard applaudiert': 'Picard applauding', 'Picard mit einer Facepalm-Reaktion': 'Picard facepalming',
  'Captain-Niveau': 'Captain level', 'Picard wäre stolz.': 'Picard would be proud.', 'Erster Offizier': 'First officer', 'Nummer Eins – fast ganz oben.': 'Number One – nearly at the top.',
  'Fähnrich': 'Ensign', 'Solide. Die Akademie ruft trotzdem.': 'Solid. The Academy is still calling.', 'Jeder Captain hat mal so angefangen.': 'Every captain started like this.',
  'Rotes Hemd': 'Red shirt', 'Landurlaub abgesagt. Nächster Versuch?': 'Shore leave cancelled. Try again?',
  'MISSION {m} ABGESCHLOSSEN': 'MISSION {m} COMPLETE', '{a} von {b} möglichen Punkten': '{a} of {b} possible points', 'Diplom herunterladen ↓': 'Download diploma ↓',
  'Nächste Mission': 'Next mission', 'Mission starten →': 'Start mission →', 'SIEG AUF DER BRÜCKE': 'VICTORY ON THE BRIDGE', 'HELDEN DER NÄCHSTEN RUNDE': 'HEROES OF THE NEXT ROUND',
  'Platz {p} · {s} Punkte': 'Place {p} · {s} points', 'Preis: <b>{p}</b>': 'Prize: <b>{p}</b>', 'Siegerdiplom herunterladen ↓': 'Download winner’s diploma ↓',
  'Heute kein Pokal. Dafür eine hervorragende Origin-Story.': 'No trophy today. But an excellent origin story.', 'SIEGERTEAM': 'WINNING TEAM', 'SIEGERTEAMS': 'WINNING TEAMS',
  'Kein Siegerteam – alle Antworten sind im Transporterpuffer verschwunden.': 'No winning team – all answers vanished in the transporter buffer.',
  '{s} Punkte · 🏆 {p}': '{s} points · 🏆 {p}', 'Diplom für {name} ↓': 'Diploma for {name} ↓', 'Ergebnis als CSV speichern ↓': 'Save result as CSV ↓',
  'Nächste Mission – gleiche Teams': 'Next mission – same teams', 'Neue Mission starten →': 'Start new mission →', 'ENDSTAND · {m}': 'FINAL SCORE · {m}',
  // team
  'AN BORD KOMMEN · {code}': 'COME ABOARD · {code}', '🏆 {p} · {n} {crews} an Bord': '🏆 {p} · {n} {crews} aboard',
  'Euer Team wurde von der Spielleitung entfernt. Ihr könnt mit einem neuen Namen beitreten.': 'Your team was removed by the host. You can join again with a new name.',
  'Teamname': 'Team name', 'z. B. Die Tribble-Bande': 'e.g. The Tribble Gang', 'Teambild': 'Team picture', 'Eigenes Bild': 'Own picture', 'Eigenes Teambild hochladen': 'Upload your own team picture',
  'JPG, PNG oder WebP · maximal 10 MB. Das Bild wird verkleinert und für alle Teams sichtbar.': 'JPG, PNG or WebP · up to 10 MB. The picture is resized and visible to all teams.',
  'Crew anmelden →': 'Register crew →', 'CREW AN BORD': 'CREW ABOARD', 'Mission <b>{m}</b> · {n} Fragen · {s} Sekunden pro Frage': 'Mission <b>{m}</b> · {n} questions · {s} seconds per question',
  'Warten auf den Befehl der Brücke …': 'Waiting for orders from the bridge …', '{n} {teams} dabei': '{n} {teams} playing',
  '✓ Antwort gespeichert. Gemeinsam auf die Auflösung warten.': '✓ Answer saved. Wait for the reveal together.', 'Zeit abgelaufen. Die Lösung kommt gleich.': 'Time’s up. The answer is coming.',
  'Die erste Antwort zählt – je schneller, desto mehr Punkte.': 'Your first answer counts – the faster, the more points.', 'Kurz beraten – nur die erste Antwort zählt.': 'Talk it over – only the first answer counts.',
  'VOLLTREFFER!': 'DIRECT HIT!', 'DANEBEN – ANDERE ZEITLINIE.': 'MISSED – ALTERNATE TIMELINE.', 'FUNKSTILLE – KEINE ANTWORT': 'RADIO SILENCE – NO ANSWER',
  '+{p} Punkte': '+{p} points', '{p} Punkte': '{p} points', 'Ergebnis zeigen →': 'Show result →', 'Euer Team': 'Your team', 'Platz {p}': 'Place {p}',
  'Letzte Sektoren! Die ganze Flotte drückt die Daumen.': 'Final sectors! The whole fleet has its fingers crossed.',
  'Diese Runde läuft bereits. Ihr könnt zuschauen und bei der nächsten Runde als Team beitreten.': 'This round has already started. You can watch and join as a team in the next round.',
  // loading
  'Funkmodul laden': 'Loading radio module', 'Subraum-Relais anfunken': 'Calling the subspace relay', 'Brücke {code} rufen': 'Hailing bridge {code}',
  'Das dauert länger als üblich. Meist hilft eines davon:': 'This is taking longer than usual. One of these usually helps:',
  'WLAN aus- und mobile Daten einschalten (manche WLANs blockieren die Direktverbindung).': 'Turn Wi-Fi off and mobile data on (some Wi-Fi networks block the direct connection).',
  'Prüfen, ob der Spielcode <b>{code}</b> stimmt und die Spielleitung das Quiz geöffnet hat.': 'Check that the game code <b>{code}</b> is right and the host has the quiz open.',
  'Neu laden': 'Reload', 'Anderen Code eingeben': 'Enter another code', 'Verbindungsaufbau · Code {code}': 'Connecting · code {code}', 'Kanal wird geöffnet': 'Opening channel',
  'Spiel nicht gefunden': 'Game not found', 'Zur Startseite': 'To the home page',
  // toasts, prompts, diploma, csv
  'Bitte kopieren:': 'Please copy:', 'Bitte Pop-ups für das Diplom erlauben.': 'Please allow pop-ups for the diploma.', 'Dieses Team entfernen?': 'Remove this team?',
  'Leitungslink kopiert – damit steuert ihr das Quiz auch vom Handy, solange dieses Fenster offen ist.': 'Host link copied – with it you can run the quiz from a phone too, as long as this window stays open.',
  'Leitungslink kopiert – gut aufheben, er öffnet die Spielleitung.': 'Host link copied – keep it safe, it opens the host controls.', 'Link für Teams kopiert.': 'Link for teams copied.', 'Gespeichert.': 'Saved.',
  'Platz': 'Place', 'Punkte': 'Points', 'Ergebnis': 'Result',
  'Siegerdiplom': 'Winner’s diploma', 'SIEGERDIPLOM': 'WINNER’S DIPLOMA', 'Das Team': 'The team', 'gewinnt die Mission <b>{m}</b> des Vulkan Spirit Quiz<br>mit <b>{s} Punkten</b>.<br>Preis: <b>{p}</b>':
    'wins the mission <b>{m}</b> of the Vulkan Spirit Quiz<br>with <b>{s} points</b>.<br>Prize: <b>{p}</b>',
  // prizes
  'Goldenes Sternenflotten-Diplom': 'Golden Starfleet Diploma', 'Ruhm und Ehre': 'Glory and honour',
  // errors (from this page, from the game engine and from the connection)
  'Bitte JPG, PNG oder WebP mit maximal 10 MB wählen.': 'Please choose a JPG, PNG or WebP of up to 10 MB.',
  'Das Bild konnte nicht gelesen werden. Bitte ein anderes wählen.': 'The picture could not be read. Please choose another one.',
  'Bitte einen Teamnamen mit mindestens 2 Zeichen eingeben.': 'Please enter a team name with at least 2 characters.', 'Bitte ein Teambild auswählen.': 'Please choose a team picture.',
  'Bitte den sechsstelligen Spielcode eingeben.': 'Please enter the six-character game code.',
  'Unter dem Code {code} antwortet gerade keine Spielleitung. Bitte den Code prüfen – und das Quiz muss auf dem Gerät der Spielleitung geöffnet sein. Wir versuchen es weiter …':
    'No host is answering under code {code} right now. Please check the code – and the quiz must be open on the host’s device. We’ll keep trying …',
  'Diese Solo-Mission ist schon in einem anderen Tab geöffnet.': 'This solo mission is already open in another tab.',
  'Der Teamname darf höchstens 24 Zeichen lang sein.': 'The team name can be at most 24 characters long.', 'Bitte eine Mission auswählen.': 'Please choose a mission.',
  'Dieses Spiel gibt es nicht (mehr). Bitte den Code prüfen.': 'This game doesn’t exist (any more). Please check the code.',
  'Der Teamname braucht mindestens einen Buchstaben oder eine Zahl.': 'The team name needs at least one letter or number.',
  'Dieses Spiel ist voll (maximal 40 Teams).': 'This game is full (40 teams maximum).', 'Diesen Teamnamen gibt es schon. Bitte einen anderen wählen.': 'That team name is taken. Please choose another.',
  'Bitte zuerst als Team beitreten.': 'Please join as a team first.', 'Für diese Frage werden keine Antworten mehr angenommen.': 'Answers are no longer accepted for this question.',
  'Diese Frage ist schon vorbei.': 'This question is already over.', 'Ungültige Antwort.': 'Invalid answer.', 'Noch einen Moment – die Frage startet gleich.': 'One moment – the question is about to start.',
  'Die Zeit ist abgelaufen.': 'Time is up.', 'Es ist noch kein Team beigetreten.': 'No team has joined yet.', 'Mission und Preis lassen sich nur vor dem Start ändern.': 'Mission and prize can only be changed before the start.',
  'Team fehlt.': 'Team missing.', 'Unbekannte Aktion.': 'Unknown action.', 'Ungültige Anfrage.': 'Invalid request.', 'Nur die Spielleitung darf das.': 'Only the host can do that.',
  'Die Verbindung zur Flotte ist gestört. Bitte gleich noch einmal versuchen.': 'The connection to the fleet is disrupted. Please try again in a moment.',
  'Die Verbindung zur Flotte ist gestört.': 'The connection to the fleet is disrupted.', 'Das Funkmodul konnte nicht geladen werden.': 'The radio module could not be loaded.',
  'Die Anfrage ist zu groß.': 'The request is too large.',
  // feedback lines
  'Spock hebt eine Augenbraue. Mehr Lob geht kaum.': 'Spock raises an eyebrow. Praise doesn’t get higher.', 'Euer Wissen hat gerade Warp 9 erreicht.': 'Your knowledge just hit warp 9.',
  'Data rechnet nach: ziemlich brillant.': 'Data ran the numbers: quite brilliant.', 'Scotty: Für diese Antwort ist genug Energie da.': 'Scotty: there’s enough power for that answer.',
  'Make it so – und ihr habt es so gemacht.': 'Make it so – and you made it so.',
  'Picard braucht kurz einen Moment. Dann geht’s weiter.': 'Picard needs a moment. Then we carry on.', 'Die Antwort ist im Transporterpuffer verschwunden.': 'The answer vanished in the transporter buffer.',
  'Der Universalübersetzer war heute wohl im Urlaub.': 'The universal translator must be on holiday today.', 'Keine Sorge: Auch die Enterprise verfliegt sich mal.': 'Don’t worry: even the Enterprise takes a wrong turn sometimes.',
  'Das war kein Fehler. Das war eine alternative Zeitlinie.': 'That wasn’t a mistake. That was an alternate timeline.',
  // team pictures
  'Charaktere': 'Characters', 'Uniformen': 'Uniforms', 'Technik & Schiffe': 'Tech & ships', 'Tiere & Snacks': 'Pets & snacks',
  'Vulkanier': 'Vulcan', 'Klingone': 'Klingon', 'Romulaner': 'Romulan', 'Andorianer': 'Andorian', 'Cardassianer': 'Cardassian', 'Bajoraner': 'Bajoran',
  'Wechselbalg': 'Changeling', 'Hologramm-Arzt': 'Holo-doctor', 'Kommando': 'Command', 'Wissenschaft': 'Science', 'Sternenkreuzer': 'Starship', 'Raumstation': 'Space station',
  'Ringplanet': 'Ringed planet', 'Warpkern': 'Warp core', 'Bordkatze': 'Ship’s cat', 'Kaffee': 'Coffee', 'Pokerabend': 'Poker night',
  'Faszinierend.': 'Fascinating.', 'Tarnung an!': 'Cloak on!', 'Antennen ausgefahren!': 'Antennae up!', 'Gewinn ist Pflicht.': 'Profit is a duty.', 'Widerstand zwecklos.': 'Resistance is futile.',
  'Ordnung muss sein.': 'Order above all.', 'Die Propheten wissen es.': 'The Prophets know.', 'Mehrere Leben, ein Team.': 'Many lives, one team.', 'Zum Fressen gern.': 'Good enough to eat.',
  'Ich spüre eure Antwort.': 'I sense your answer.', 'Heute in neuer Form.': 'New shape today.', 'Positronisch brillant.': 'Positronically brilliant.', 'Art des Notfalls?': 'Nature of the emergency?',
  'Landurlaub? Lieber nicht!': 'Shore leave? Better not!', 'Auf mein Kommando!': 'On my command!', 'Messungen laufen.': 'Scans running.', 'Warp 9 voraus!': 'Warp 9 ahead!',
  'Andocken erlaubt.': 'Docking permitted.', 'Neue Welten!': 'New worlds!', 'Volle Energie!': 'Full power!', 'Nur auf Betäubung.': 'Stun only.', 'Faszinierende Daten.': 'Fascinating data.',
  'Wir werden mehr!': 'There are more of us!', 'Miau, Captain.': 'Meow, Captain.', 'Wuff! Aufbruch!': 'Woof! Let’s go!', 'Schwarz wie das All.': 'Black as space.', 'Heiß, bitte.': 'Hot, please.', 'Ich erhöhe.': 'I raise.'
};
