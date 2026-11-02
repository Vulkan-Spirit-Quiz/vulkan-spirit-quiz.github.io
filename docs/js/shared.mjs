// Shared between browser and server (no answers in here!).
export const MISSIONS = [
  { name: 'USS Enterprise', image: 'media/ships/enterprise.jpeg' },
  { name: 'USS Voyager', image: 'media/ships/voyager.jpg' },
  { name: 'USS Defiant', image: 'media/ships/defiant.jpeg' },
  { name: 'USS Discovery', image: 'media/ships/discovery.jpg' },
  { name: 'USS Cerritos', image: 'media/ships/cerritos.jpeg' },
  { name: 'USS Protostar', image: 'media/ships/protostar.jpeg' },
  { name: 'Enterprise NX-01', image: 'media/ships/nx-01.jpeg' },
  { name: 'USS Titan-A', image: 'media/ships/titan-a.jpeg' },
  { name: 'USS Excelsior', image: 'media/ships/excelsior.jpeg' },
  { name: 'USS Stargazer', image: 'media/ships/stargazer.jpeg' },
  { name: 'Kobayashi Maru', image: 'media/ships/kobayashi-maru.webp', finale: true }
];

export const THEME_COLORS = {
  'Brückencrew': ['#6de7ff', '#a78bff'], 'Schiffe & Stationen': ['#66e5ff', '#5d87ff'],
  'Aliens & Welten': ['#d7a1ff', '#ff80c0'], 'Technik': ['#6bf1c8', '#71aeff'], 'Freizeit': ['#ffdb8a', '#ff9cbb'],
  'Deep Space Nine': ['#ffb95c', '#d28aff'], 'Voyager': ['#aeb3ff', '#54e8e0'], 'Enterprise': ['#78b5ff', '#7affd3'],
  'Neue Serien': ['#ff8ddc', '#ad9cff'], 'Kinofilme': ['#ffd47e', '#ff8db3'], 'Kobayashi Maru': ['#ff9a91', '#ffd16d']
};

const c = (id, name, image) => ({ id, name, group: 'crew', image: 'media/characters/' + image });
const s = (id, name, emoji, tag, group, bg) => ({ id, name, emoji, tag, group, bg });
const alien = (id, name, tag) => ({ id, name, tag, group: 'voelker', image: 'media/aliens/' + id + '.svg' });
export const AVATAR_GROUPS = [
  ['crew', 'Charaktere'], ['voelker', 'Aliens'], ['uniform', 'Uniformen'], ['technik', 'Technik & Schiffe'], ['tiere', 'Tiere & Snacks']
];
export const AVATARS = [
  c('spock', 'Spock', 'spock.jpeg'), c('kirk', 'Kirk', 'kirk.jpeg'), c('picard', 'Picard', 'picard.jpeg'),
  c('janeway', 'Janeway', 'janeway.jpeg'), c('sisko', 'Sisko', 'sisko.jpeg'), c('archer', 'Archer', 'archer.jpeg'),
  c('pike', 'Pike', 'pike.jpeg'), c('burnham', 'Burnham', 'burnham.jpeg'), c('ake', 'Ake', 'ake.jpeg'),
  c('shran', 'Shran', 'shran.jpeg'), c('khan', 'Khan', 'khan.jpeg'), c('boimler', 'Boimler', 'boimler.jpeg'),
  c('mariner', 'Mariner', 'mariner.jpeg'), c('dukat', 'Dukat', 'dukat.jpeg'),
  alien('vulkanier', 'Vulkanier', 'Faszinierend.'), alien('klingone', 'Klingone', 'Qapla’!'),
  alien('romulaner', 'Romulaner', 'Tarnung an!'), alien('andorianer', 'Andorianer', 'Antennen ausgefahren!'),
  alien('ferengi', 'Ferengi', 'Gewinn ist Pflicht.'), alien('borg', 'Borg', 'Widerstand zwecklos.'),
  alien('cardassianer', 'Cardassianer', 'Ordnung muss sein.'), alien('bajoraner', 'Bajoraner', 'Die Propheten wissen es.'),
  alien('trill', 'Trill', 'Mehrere Leben, ein Team.'), alien('gorn', 'Gorn', 'Zum Fressen gern.'),
  s('betazoid', 'Betazoid', '💜', 'Ich spüre eure Antwort.', 'voelker', '#4a2b6b'),
  s('wechselbalg', 'Wechselbalg', '💧', 'Heute in neuer Form.', 'voelker', '#6b4a1f'),
  s('android', 'Android', '🤖', 'Positronisch brillant.', 'voelker', '#4a4a5a'),
  s('hologramm', 'Hologramm-Arzt', '🩺', 'Art des Notfalls?', 'voelker', '#1f5a6b'),
  s('rotes-hemd', 'Rotes Hemd', '🟥', 'Landurlaub? Lieber nicht!', 'uniform', '#7a1f1f'),
  s('kommando', 'Kommando', '🟨', 'Auf mein Kommando!', 'uniform', '#7a6a1f'),
  s('wissenschaft', 'Wissenschaft', '🟦', 'Messungen laufen.', 'uniform', '#1f3f7a'),
  s('sternenkreuzer', 'Sternenkreuzer', '🚀', 'Warp 9 voraus!', 'technik', '#22305a'),
  s('raumstation', 'Raumstation', '🛰️', 'Andocken erlaubt.', 'technik', '#2a2a4a'),
  s('ringplanet', 'Ringplanet', '🪐', 'Neue Welten!', 'technik', '#3a2a5a'),
  s('warpkern', 'Warpkern', '⚡', 'Volle Energie!', 'technik', '#1f3a6b'),
  s('phaser', 'Phaser', '🔫', 'Nur auf Betäubung.', 'technik', '#4a3a2a'),
  s('tricorder', 'Tricorder', '📟', 'Faszinierende Daten.', 'technik', '#2a4a3a'),
  s('tribbles', 'Tribbles', '🐹', 'Wir werden mehr!', 'tiere', '#6b4a2a'),
  s('bordkatze', 'Bordkatze', '🐈', 'Miau, Captain.', 'tiere', '#5a4a3a'),
  s('beagle', 'Beagle', '🐶', 'Wuff! Aufbruch!', 'tiere', '#4a3a2a'),
  s('kaffee', 'Kaffee', '☕', 'Schwarz wie das All.', 'tiere', '#3a2a1f'),
  s('earl-grey', 'Earl Grey', '🫖', 'Heiß, bitte.', 'tiere', '#5a3a2a'),
  s('poker', 'Pokerabend', '🃏', 'Ich erhöhe.', 'tiere', '#1f4a2a')
];
export const AVATAR_IDS = new Set(AVATARS.map(a => a.id));
export const MAX_UPLOAD_LENGTH = 32000; // data URL of a 160×160 JPEG
export function isUploadAvatar(v) {
  return typeof v === 'string' && v.length <= MAX_UPLOAD_LENGTH && /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(v);
}
export const DEFAULT_PRIZE = 'Goldenes Sternenflotten-Diplom';
export const QUESTION_SECONDS = 25;
