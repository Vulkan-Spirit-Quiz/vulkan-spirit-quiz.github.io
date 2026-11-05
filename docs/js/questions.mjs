// Vulkan Spirit Quiz – Fragenkatalog
// 10 Themen × 10 Fragen (eine pro Mission) + 5 Kobayashi-Maru-Fragen.
// Jede Frage: q = Frage, o = Antworten (die RICHTIGE steht immer zuerst; die Reihenfolge
// wird unten pro Frage fest gemischt), e = kurze Erklärung, img = optionales Bild.
// Die Frage mit Index t im Thema t ist die schwierige Schlussfrage (Frage 10) von Mission t.

import { MISSIONS, QUESTION_SECONDS } from './shared.mjs';
export { MISSIONS };

export const THEMES = [
  'Brückencrew', 'Schiffe & Stationen', 'Aliens & Welten', 'Technik', 'Freizeit',
  'Deep Space Nine', 'Voyager', 'Enterprise', 'Neue Serien', 'Kinofilme'
];

const BANK = {
  'Brückencrew': [
    { q: 'Wie lautet Captain Picards Dienstnummer, die er in „Geheime Mission auf Celtris Drei“ nennt?', o: ['SP-937-215', 'NCC-1701-D', 'SC-937-0176', 'SP-1701-77'], e: 'Unter cardassianischer Folter nennt Picard nur Namen, Rang und Dienstnummer: SP-937-215.' },
    { q: 'Wer ist der Erste Offizier der USS Enterprise-D?', o: ['William Riker', 'Data', 'Worf', 'Geordi La Forge'], e: 'Commander William T. Riker – „Nummer Eins“ – ist Picards Erster Offizier.' },
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/data.webp', o: ['Data', 'Geordi La Forge', 'Worf', 'Wesley Crusher'], e: 'Lieutenant Commander Data, der Android der Enterprise-D.' },
    { q: 'Wer ist in der Originalserie der Bordarzt der Enterprise?', o: ['Leonard McCoy', 'Montgomery Scott', 'Hikaru Sulu', 'Christine Chapel'], e: '„Pille“ McCoy: „Ich bin Arzt, kein …“' },
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/kirk.webp', o: ['James T. Kirk', 'Christopher Pike', 'Jonathan Archer', 'Montgomery Scott'], e: 'Captain James T. Kirk aus der Originalserie.' },
    { q: 'Welche Aufgabe hat Nyota Uhura auf der Brücke der Originalserie?', o: ['Kommunikation', 'Navigation', 'Technik', 'Medizin'], e: 'Uhura ist die Kommunikationsoffizierin der Enterprise.' },
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/spock.webp', o: ['Spock', 'Sarek', 'Tuvok', 'Sybok'], e: 'Spock, Erster Offizier und Wissenschaftsoffizier unter Kirk.' },
    { q: 'Welcher Klingone dient als Offizier auf der Enterprise-D?', o: ['Worf', 'Kor', 'Martok', 'Gowron'], e: 'Worf ist der erste Klingone in der Sternenflotte.' },
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/picard.webp', o: ['Jean-Luc Picard', 'Benjamin Sisko', 'Edward Jellico', 'Benjamin Maxwell'], e: 'Captain Jean-Luc Picard: „Tee, Earl Grey, heiß.“' },
    { q: 'Wie heißt Kirks Chefingenieur?', o: ['Montgomery Scott', 'Pavel Chekov', 'Hikaru Sulu', 'Geordi La Forge'], e: 'Montgomery „Scotty“ Scott – der Mann für Wunder im Maschinenraum.' }
  ],
  'Schiffe & Stationen': [
    { q: 'Welche Registriernummer trägt Kirks Enterprise?', o: ['NCC-1701', 'NX-01', 'NCC-1701-D', 'NCC-74656'], e: 'NCC-1701 – ohne Buchstaben. Die Enterprise-D trägt NCC-1701-D.' },
    { q: 'Wie viele Decks hat die USS Enterprise-D der Galaxy-Klasse?', o: ['42', '24', '36', '57'], e: 'Die Enterprise-D hat 42 Decks.' },
    { q: 'Wie hieß Deep Space Nine unter cardassianischer Herrschaft?', o: ['Terok Nor', 'Empok Nor', 'Bajor VIII', 'Dominion Prime'], e: 'Die Cardassianer nannten die Station Terok Nor.' },
    { q: 'Zu welcher Klasse gehört die USS Voyager?', o: ['Intrepid-Klasse', 'Galaxy-Klasse', 'Defiant-Klasse', 'Constitution-Klasse'], e: 'Die Voyager ist ein Schiff der Intrepid-Klasse.' },
    { q: 'Welches Schiff kommandiert Captain Carol Freeman in „Lower Decks“?', o: ['USS Cerritos', 'USS Titan', 'USS Protostar', 'USS Excelsior'], e: 'Captain Freeman führt die USS Cerritos.' },
    { q: 'Welches Schiff kommandierte Picard vor der Enterprise-D?', o: ['USS Stargazer', 'USS Reliant', 'USS Defiant', 'USS Saratoga'], e: 'Picard war Captain der USS Stargazer.' },
    { q: 'Welches Schiff kommandiert Captain Sulu in „Star Trek VI“?', o: ['USS Excelsior', 'USS Enterprise-A', 'USS Grissom', 'USS Reliant'], e: 'Sulu ist Captain der USS Excelsior.' },
    { q: 'Welches Schiff finden Dal und seine Freunde in „Star Trek: Prodigy“?', o: ['USS Protostar', 'USS Cerritos', 'USS Voyager', 'USS Dauntless'], e: 'Die jungen Helden entdecken die USS Protostar.' },
    { q: 'Welches Schiff ist der Star der Serie „Enterprise“?', o: ['Enterprise NX-01', 'USS Enterprise-A', 'USS Enterprise-B', 'USS Enterprise-J'], e: 'Archers Enterprise NX-01 – das erste Warp-5-Schiff der Erde.' },
    { q: 'Welches Schiff kommandiert Captain Liam Shaw in „Picard“ Staffel 3?', o: ['USS Titan-A', 'USS Zheng He', 'USS Enterprise-F', 'USS Stargazer'], e: 'Captain Liam Shaw kommandiert die USS Titan-A.' }
  ],
  'Aliens & Welten': [
    { q: 'Von welchem Planeten stammt Spocks Vater Sarek?', o: ['Vulkan', 'Romulus', 'Andoria', 'Bajor'], e: 'Sarek ist Vulkanier, Spocks Mutter Amanda ist ein Mensch.' },
    { q: 'Wie heißt die Heimatwelt der Klingonen?', o: ['Qo’noS (Kronos)', 'Remus', 'Cardassia', 'Ferenginar'], e: 'Qo’noS, oft „Kronos“ geschrieben.' },
    { q: 'Wie heißt der Schwesterplanet von Romulus?', o: ['Remus', 'Rigel', 'Risa', 'Romii'], e: 'Remus – Heimat der Remaner, bekannt aus „Nemesis“.' },
    { q: 'Welche Spezies sagt: „Widerstand ist zwecklos“?', o: ['Borg', 'Breen', 'Dominion', 'Xindi'], e: 'Die Borg assimilieren – Widerstand ist zwecklos.' },
    { q: 'Welche Spezies hat blaue Haut und Antennen?', o: ['Andorianer', 'Bolianer', 'Vulkanier', 'Tellariten'], e: 'Die Andorianer, wie Commander Shran.' },
    { q: 'Wer steht an der Spitze des Dominion?', o: ['Die Gründer (Wechselbälger)', 'Die Vorta', 'Die Jem’Hadar', 'Die Breen'], e: 'Die formwandelnden Gründer lenken das Dominion.' },
    { q: 'Wie lautet die Erwerbsregel Nr. 1 der Ferengi?', o: ['Wenn du ihr Geld hast, gib es nie zurück.', 'Krieg ist gut fürs Geschäft.', 'Mehr ist gut, alles ist besser.', 'Ein Vertrag ist ein Vertrag.'], e: 'Regel Nr. 1: Einmal kassiert, nie zurückgezahlt.' },
    { q: 'Welche Spezies kann mit einem Symbionten vereinigt werden?', o: ['Trill', 'Betazoiden', 'Bajoraner', 'Talaxianer'], e: 'Vereinigte Trill tragen einen Symbionten – wie Dax.' },
    { q: 'Wie heißen die pelzigen Wesen, die sich rasend schnell vermehren?', o: ['Tribbles', 'Gorn', 'Horta', 'Targs'], e: '„Kennen Sie Tribbles?“ – Sie vermehren sich ohne Ende.' },
    { q: 'Welches Volk hielt Bajor jahrzehntelang besetzt?', o: ['Cardassianer', 'Romulaner', 'Klingonen', 'Breen'], e: 'Die Cardassianer besetzten Bajor rund 50 Jahre lang.' }
  ],
  'Technik': [
    { q: 'Womit wird bei Star Trek „gebeamt“?', o: ['Transporter', 'Replikator', 'Traktorstrahl', 'Deflektor'], e: '„Beam mich hoch!“ – dafür gibt es den Transporter.' },
    { q: 'Welcher Kristall regelt die Materie-Antimaterie-Reaktion im Warpkern?', o: ['Dilithium', 'Trilithium', 'Latinum', 'Kelbonit'], e: 'Dilithiumkristalle machen den Warpantrieb möglich.' },
    { q: 'Was ist ein Tricorder?', o: ['Ein tragbares Scan- und Analysegerät', 'Eine Handwaffe', 'Ein Kommunikationsabzeichen', 'Ein Shuttle'], e: 'Der Tricorder scannt, analysiert und zeichnet auf.' },
    { q: 'Welcher Warpfaktor gilt in TNG als unerreichbare Grenze?', o: ['Warp 10', 'Warp 9,975', 'Warp 12', 'Warp 15'], e: 'Warp 10 würde unendliche Geschwindigkeit bedeuten.' },
    { q: 'Wo erleben Crews Abenteuer in einer simulierten Welt?', o: ['Auf dem Holodeck', 'In der Krankenstation', 'Im Maschinenraum', 'Im Shuttlehangar'], e: 'Das Holodeck erzeugt ganze Welten.' },
    { q: 'Welche Handwaffe hat die Einstellung „Betäubung“?', o: ['Phaser', 'Disruptor', 'Bat’leth', 'Tricorder'], e: '„Phaser auf Betäubung!“' },
    { q: 'Wie heißen die Standard-Torpedos der Sternenflotte in TNG?', o: ['Photonentorpedos', 'Plasmatorpedos', 'Quantentorpedos', 'Tachyonentorpedos'], e: 'Photonentorpedos – Quantentorpedos kamen erst später dazu.' },
    { q: 'Was übersetzt fremde Sprachen automatisch?', o: ['Der Universalübersetzer', 'Der Bordcomputer', 'Der Tricorder', 'Der Kommunikator'], e: 'Der Universalübersetzer macht Erstkontakte leichter.' },
    { q: 'Was schützt ein Raumschiff vor feindlichem Beschuss?', o: ['Die Schilde', 'Der Traktorstrahl', 'Die Warpgondeln', 'Die Impulstriebwerke'], e: '„Schilde hoch!“' },
    { q: 'Was erzeugt Essen und Getränke auf Knopfdruck?', o: ['Der Replikator', 'Der Transporter', 'Das Holodeck', 'Der Sporenantrieb'], e: 'Der Replikator – nur Neelix kocht lieber selbst.' }
  ],
  'Freizeit': [
    { q: 'Welches Kartenspiel spielen die Offiziere der Enterprise-D regelmäßig?', o: ['Poker', 'Tongo', 'Dabo', 'Skat'], e: 'Die Pokerrunde der Senior-Offiziere ist legendär.' },
    { q: 'Welches Instrument spielt William Riker?', o: ['Posaune', 'Klarinette', 'Saxofon', 'Flöte'], e: 'Riker liebt Jazz und die Posaune.' },
    { q: 'Welches Instrument spielt Harry Kim?', o: ['Klarinette', 'Violine', 'Posaune', 'Klavier'], e: 'Harry Kim spielt Klarinette.' },
    { q: 'Wie heißt Datas Katze?', o: ['Spot', 'Porthos', 'Neelix', 'Tribble'], e: 'Data schrieb sogar eine „Ode an Spot“.' },
    { q: 'Welchen Detektiv spielt Picard gern auf dem Holodeck?', o: ['Dixon Hill', 'Sherlock Holmes', 'Hercule Poirot', 'Philip Marlowe'], e: 'Picard schlüpft in die Rolle des Privatdetektivs Dixon Hill.' },
    { q: 'Welche Sportart liebt Captain Sisko?', o: ['Baseball', 'Fußball', 'Basketball', 'Parrises Squares'], e: 'Sisko ist großer Baseball-Fan.' },
    { q: 'Welches Spiel spielen Kirk und Spock gern gegeneinander?', o: ['3D-Schach', 'Poker', 'Kal-toh', 'Dom-jot'], e: 'Dreidimensionales Schach ist ein Klassiker der Originalserie.' },
    { q: 'Welche Holoroman-Figur spielt Tom Paris in „Voyager“?', o: ['Captain Proton', 'Dixon Hill', 'Vic Fontaine', 'Captain Pluto'], e: 'Captain Proton – in Schwarz-Weiß.' },
    { q: 'Was trinkt Captain Janeway am liebsten?', o: ['Kaffee', 'Tee, Earl Grey, heiß', 'Raktajino', 'Pflaumensaft'], e: '„Da ist Kaffee in diesem Nebel!“' },
    { q: 'Was trinkt Worf am liebsten?', o: ['Pflaumensaft', 'Blutwein', 'Raktajino', 'Synthehol'], e: 'Worf nennt Pflaumensaft „ein Getränk für Krieger“.' }
  ],
  'Deep Space Nine': [
    { q: 'Wer ist Kommandant von Deep Space Nine?', o: ['Benjamin Sisko', 'Kira Nerys', 'Odo', 'Julian Bashir'], e: 'Commander, später Captain Benjamin Sisko.' },
    { q: 'Welcher Formwandler ist Sicherheitschef der Station?', o: ['Odo', 'Garak', 'Morn', 'Laas'], e: 'Odo – ein Wechselbalg.' },
    { q: 'Wem gehört die Bar auf der Promenade?', o: ['Quark', 'Rom', 'Nog', 'Garak'], e: 'Quarks Bar, Grill, Spielhalle und Holosuiten.' },
    { q: 'Welcher Cardassianer arbeitet auf der Station als Schneider?', o: ['Garak', 'Dukat', 'Damar', 'Tain'], e: '„Einfach nur Garak“ – Schneider und Ex-Spion.' },
    { q: 'Wie heißt Siskos Sohn?', o: ['Jake', 'Nog', 'Rom', 'Joseph'], e: 'Jake Sisko wird Schriftsteller.' },
    { q: 'Wie heißt Siskos Baseballteam im Holoprogramm?', o: ['Niners', 'Logicians', 'Yankees', 'Pioneers'], e: 'Die Niners verlieren gegen Solok und seine Logicians.' },
    { q: 'Wie nennen die Bajoraner die Wesen im Wurmloch?', o: ['Die Propheten', 'Die Pah-Geister', 'Die Gründer', 'Die Vorta'], e: 'Für die Bajoraner leben die Propheten im Himmelstempel.' },
    { q: 'Welches Kriegsschiff bringt Sisko ab Staffel 3 zur Station?', o: ['USS Defiant', 'USS Enterprise', 'USS Rio Grande', 'USS Saratoga'], e: 'Die USS Defiant – klein, aber gefährlich.' },
    { q: 'Welcher junge Ferengi geht zur Sternenflottenakademie?', o: ['Nog', 'Rom', 'Brunt', 'Zek'], e: 'Nog ist der erste Ferengi der Sternenflotte.' },
    { q: 'Welcher Cardassianer war Präfekt von Bajor?', o: ['Gul Dukat', 'Garak', 'Legat Damar', 'Enabran Tain'], e: 'Gul Dukat war während der Besatzung Präfekt.' }
  ],
  'Voyager': [
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/janeway.webp', o: ['Kathryn Janeway', 'Beverly Crusher', 'Kira Nerys', 'Elizabeth Shelby'], e: 'Captain Kathryn Janeway von der USS Voyager.' },
    { q: 'In welchen Quadranten wird die Voyager verschlagen?', o: ['Delta-Quadrant', 'Gamma-Quadrant', 'Beta-Quadrant', 'Alpha-Quadrant'], e: 'Der Fürsorger schleudert sie in den Delta-Quadranten.' },
    { q: 'Welches Wesen bringt die Voyager in den Delta-Quadranten?', o: ['Der Fürsorger', 'Q', 'Die Borg-Königin', 'Die Propheten'], e: 'Der Fürsorger (Caretaker) holt das Schiff mit seiner Phalanx.' },
    { q: 'Wie heißt der Arzt der Voyager?', o: ['Der Doktor (MHN)', 'Dr. Bashir', 'Dr. Phlox', 'Dr. Pulaski'], e: 'Das Medizinisch-Holografische Notfallprogramm – „der Doktor“.' },
    { q: 'Zu welcher Spezies gehört Neelix?', o: ['Talaxianer', 'Ocampa', 'Kazon', 'Vidiianer'], e: 'Neelix ist Talaxianer – Koch und Moraloffizier.' },
    { q: 'Wer ist auf diesem Bild zu sehen?', img: 'media/seven.webp', o: ['Seven of Nine', 'Kes', 'B’Elanna Torres', 'T’Pol'], e: 'Seven of Nine – ehemalige Borg-Drohne.' },
    { q: 'Wie lautet Seven of Nines menschlicher Geburtsname?', o: ['Annika Hansen', 'Erin Hansen', 'Anna Torres', 'Kathryn Hansen'], e: 'Geboren als Annika Hansen, Tochter von Magnus und Erin Hansen.' },
    { q: 'Welcher Gruppe gehörten Chakotay und Teile seiner Crew an?', o: ['Dem Maquis', 'Den Kazon', 'Dem Obsidianischen Orden', 'Der Sektion 31'], e: 'Chakotay war Maquis-Kommandant.' },
    { q: 'Welcher Vulkanier ist Sicherheitschef der Voyager?', o: ['Tuvok', 'Vorik', 'Sarek', 'Tuvix'], e: 'Lieutenant Commander Tuvok.' },
    { q: 'Wie weit ist die Voyager anfangs von der Erde entfernt?', o: ['Rund 70.000 Lichtjahre', 'Rund 7.000 Lichtjahre', 'Rund 700 Lichtjahre', 'Rund 700.000 Lichtjahre'], e: 'Etwa 70.000 Lichtjahre – rund 75 Jahre Heimreise.' }
  ],
  'Enterprise': [
    { q: 'Wer ist Captain der Enterprise NX-01?', o: ['Jonathan Archer', 'James T. Kirk', 'Christopher Pike', 'Robert April'], e: 'Captain Jonathan Archer.' },
    { q: 'Wie heißt Archers Hund?', o: ['Porthos', 'Spot', 'Butler', 'Number One'], e: 'Porthos, ein Beagle, der Käse liebt.' },
    { q: 'Welche Vulkanierin dient als Erste Offizierin auf der NX-01?', o: ['T’Pol', 'T’Pring', 'Saavik', 'Valeris'], e: 'Subcommander T’Pol.' },
    { q: 'Welcher Andorianer wird Archers Rivale und Freund?', o: ['Shran', 'Thy’lek', 'Talas', 'Keval'], e: 'Commander Shran: „Pinkhaut!“' },
    { q: 'Wie heißt der denobulanische Arzt der NX-01?', o: ['Phlox', 'Bashir', 'McCoy', 'Crusher'], e: 'Dr. Phlox mit seinem legendären Lächeln.' },
    { q: 'Welches Volk greift am Ende von Staffel 2 die Erde an?', o: ['Xindi', 'Suliban', 'Klingonen', 'Romulaner'], e: 'Der Angriff der Xindi führt die NX-01 in Staffel 3 in die Delphische Ausdehnung.' },
    { q: 'Wer ist Chefingenieur der Enterprise NX-01?', o: ['Charles „Trip“ Tucker', 'Malcolm Reed', 'Travis Mayweather', 'Montgomery Scott'], e: 'Commander Charles „Trip“ Tucker III.' },
    { q: 'Wie heißt Archers Vater, der am Warp-5-Antrieb mitarbeitete?', o: ['Henry Archer', 'Richard Archer', 'Jonathan Archer Sr.', 'Zefram Archer'], e: 'Henry Archer half, den Warp-5-Antrieb zu entwickeln.' },
    { q: 'Welche Linguistin spricht auf der NX-01 Dutzende Sprachen?', o: ['Hoshi Sato', 'T’Pol', 'Uhura', 'Keiko O’Brien'], e: 'Ensign Hoshi Sato ist Kommunikationsoffizierin.' },
    { q: 'In welchem Jahrhundert spielt die Serie „Enterprise“?', o: ['Im 22. Jahrhundert', 'Im 21. Jahrhundert', 'Im 23. Jahrhundert', 'Im 24. Jahrhundert'], e: 'Die NX-01 startet im Jahr 2151.' }
  ],
  'Neue Serien': [
    { q: 'Wer ist die Hauptfigur von „Star Trek: Discovery“?', o: ['Michael Burnham', 'Sylvia Tilly', 'Philippa Georgiou', 'Saru'], e: 'Michael Burnham – später Captain der Discovery.' },
    { q: 'Wer kommandiert die Enterprise in „Strange New Worlds“?', o: ['Christopher Pike', 'James T. Kirk', 'Una Chin-Riley', 'Robert April'], e: 'Captain Christopher Pike.' },
    { q: 'Welche beiden Fähnriche stehen im Mittelpunkt von „Lower Decks“?', o: ['Boimler und Mariner', 'Kim und Paris', 'Nog und Jake', 'Rutherford und Shaxs'], e: 'Brad Boimler und Beckett Mariner.' },
    { q: 'Wer entwickelte auf der Discovery den Sporenantrieb?', o: ['Paul Stamets', 'Hugh Culber', 'Sylvia Tilly', 'Saru'], e: 'Lieutenant Commander Paul Stamets.' },
    { q: 'Wer ist Kanzlerin der Akademie in „Starfleet Academy“?', o: ['Nahla Ake', 'Kathryn Janeway', 'Una Chin-Riley', 'Michael Burnham'], e: 'Nahla Ake, gespielt von Holly Hunter.' },
    { q: 'Wie heißen Picards romulanische Vertraute auf seinem Weingut?', o: ['Laris und Zhaban', 'Elnor und Raffi', 'Sela und Tomalak', 'Shinzon und Vreenak'], e: 'Laris und Zhaban leben mit Picard auf Château Picard.' },
    { q: 'Wer spielt Spock in „Strange New Worlds“?', o: ['Ethan Peck', 'Zachary Quinto', 'Leonard Nimoy', 'Anson Mount'], e: 'Ethan Peck – Anson Mount spielt Pike.' },
    { q: 'Wer leitet die Kinder in „Prodigy“ als Hologramm an?', o: ['Eine Holo-Version von Janeway', 'Der Doktor', 'Vic Fontaine', 'Moriarty'], e: 'Hologramm-Janeway wird zur Mentorin der Crew.' },
    { q: 'In welches Jahrhundert springt die Discovery in Staffel 3?', o: ['Ins 32. Jahrhundert', 'Ins 29. Jahrhundert', 'Ins 25. Jahrhundert', 'Ins 31. Jahrhundert'], e: 'Die Discovery landet im Jahr 3188.' },
    { q: 'Wie heißt Picards Weingut in Frankreich?', o: ['Château Picard', 'Domaine La Barre', 'Château Saint-Clair', 'Clos Romulus'], e: 'Château Picard in La Barre.' }
  ],
  'Kinofilme': [
    { q: 'Welcher Bösewicht kehrt in „Star Trek II“ zurück?', o: ['Khan', 'Kruge', 'Chang', 'Shinzon'], e: '„KHAAAAN!“ – Khan Noonien Singh.' },
    { q: 'Welche Tiere holt die Crew in „Star Trek IV“ in die Zukunft?', o: ['Buckelwale', 'Delfine', 'Adler', 'Elefanten'], e: 'Die Buckelwale George und Gracie.' },
    { q: 'Wer erfand laut „Der erste Kontakt“ den Warpantrieb?', o: ['Zefram Cochrane', 'Henry Archer', 'Noonien Soong', 'Richard Daystrom'], e: 'Zefram Cochrane mit seiner Phoenix.' },
    { q: 'Wer will in „Der erste Kontakt“ die Vergangenheit verändern?', o: ['Die Borg', 'Die Romulaner', 'Die Klingonen', 'Die Xindi'], e: 'Die Borg reisen ins Jahr 2063.' },
    { q: 'In welchem Film stirbt Captain Kirk?', o: ['Treffen der Generationen', 'Das unentdeckte Land', 'Der Aufstand', 'Nemesis'], e: 'Kirk stirbt in „Star Trek: Treffen der Generationen“.' },
    { q: 'Welcher Test ist für Kadetten absichtlich nicht zu gewinnen?', o: ['Kobayashi Maru', 'Ilia-Simulation', 'Vulkan-Kolinahr', 'Kal-if-fee'], e: 'Der Kobayashi Maru prüft den Umgang mit dem Unvermeidlichen.' },
    { q: 'Wie heißt Picards Klon in „Nemesis“?', o: ['Shinzon', 'B-4', 'Lore', 'Sela'], e: 'Shinzon, aufgewachsen auf Remus.' },
    { q: 'Wie heißt Zefram Cochranes Warpschiff?', o: ['Phoenix', 'Bonaventure', 'Valiant', 'Pegasus'], e: 'Die Phoenix – der erste Warpflug der Menschheit.' },
    { q: 'In welchem Jahr kommt es laut „Der erste Kontakt“ zum Erstkontakt mit den Vulkaniern?', o: ['2063', '2161', '2051', '1996'], e: 'Am 5. April 2063.' },
    { q: 'Wie hieß Khans Schiff, auf dem er im Kälteschlaf gefunden wurde?', o: ['SS Botany Bay', 'SS Valiant', 'SS Conestoga', 'SS Mariposa'], e: 'Die SS Botany Bay aus „Der schlafende Tiger“.' }
  ]
};

const FINALE = [
  { q: 'Wie heißt die Ehefrau von Khan Noonien Singh?', o: ['Marla McGivers', 'Carla McGuiver', 'Jacqueline O’Neil', 'Janice Rand'], e: 'Lieutenant Marla McGivers verliebt sich in „Der schlafende Tiger“ in Khan und folgt ihm ins Exil nach Ceti Alpha V.' },
  { q: 'Wie heißt der Bruder von James T. Kirk?', o: ['George Samuel Kirk', 'Thomas Kirk', 'Flavius Kirk', 'Otto Kirk'], e: 'Kirks älterer Bruder George Samuel „Sam“ Kirk ist Wissenschaftler – er stirbt auf dem Planeten Deneva.' },
  { q: 'Was versteht man unter dem „vulkanischen Hallo“ aus Star Trek: Discovery?', o: ['Einen präventiven Erstschlag gegen einen möglichen Gegner', 'Eine Einladung zu einer vulkanischen Gedankenverschmelzung', 'Eine traditionelle Einladung zum Tee', 'Einen besonderen Freundschaftsgruß für nahestehende Personen'], e: 'Bei ihrem ersten Kontakt eröffneten die Vulkanier sofort das Feuer auf die Klingonen – seitdem verschaffte ihnen das Respekt. Burnham rät deshalb zum „vulkanischen Hallo“.' },
  { q: 'Auf welchem Raumschiff diente Michael Burnham ursprünglich als Erste Offizierin?', o: ['USS Shenzhou', 'USS Discovery', 'USS Europa', 'USS Enterprise'], e: 'Bevor sie auf die Discovery kam, war Burnham Erste Offizierin unter Captain Philippa Georgiou auf der USS Shenzhou.' },
  // Musikfrage: Antworten in fester Reihenfolge (keep + c = Index der richtigen), Musik auf Beamer/TV, 45 Sekunden Zeit.
  { q: 'Hört genau hin: Aus welcher Serie stammt diese Titelmusik?', keep: true, c: 1, o: ['Enterprise', 'Discovery', 'Starfleet Academy', 'Strange New Worlds'],
    e: 'Das ist die Titelmusik von „Star Trek: Discovery“ (Komponist: Jeff Russo).', audio: 'media/audio/theme-finale.m4a', seconds: 45 }
];

// --- Fester, reproduzierbarer Mix der Antworten (seed pro Frage) ---
function seeded(n) { let s = (n * 2654435761) >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function prepare(item, seed, theme, hard) {
  const extra = { image: item.img || null, audio: item.audio || null, seconds: item.seconds || QUESTION_SECONDS };
  if (item.keep) return { text: item.q, options: item.o, correct: item.c, explanation: item.e, theme, hard, ...extra };
  const order = [0, 1, 2, 3], rnd = seeded(seed + 7);
  for (let i = 3; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { text: item.q, options: order.map(i => item.o[i]), correct: order.indexOf(0), explanation: item.e, theme, hard, ...extra };
}


// Mission p (0–9): je eine Frage aus jedem Thema; das Thema p kommt zuletzt und ist die Knackfrage.
export const PACKS = MISSIONS.map((m, p) => {
  if (m.finale) return FINALE.map((item, i) => prepare(item, 1000 + i, 'Kobayashi Maru', false));
  const order = THEMES.map((_, t) => t).filter(t => t !== p);
  const rnd = seeded(500 + p);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.push(p);
  return order.map((t, i) => prepare(BANK[THEMES[t]][p], t * 100 + p, THEMES[t], i === 9));
});

export const QUESTION_TIME_MS = QUESTION_SECONDS * 1000;
export const GET_READY_MS = 3000;
/** Answer time of one question in ms (25 s, the music question longer). */
export function timeFor(pack, q) { return (PACKS[pack]?.[q]?.seconds || QUESTION_SECONDS) * 1000; }
export function multiplierFor(pack, q) { return PACKS[pack] && PACKS[pack][q] && PACKS[pack][q].hard ? 2.5 : 1; }
export function pointsFor(pack, q, elapsed) {
  const limit = timeFor(pack, q), t = Math.max(0, Math.min(limit - 1, elapsed));
  return Math.round((500 + 500 * (1 - t / limit)) * multiplierFor(pack, q));
}
export function totalQuestions() { return PACKS.reduce((n, p) => n + p.length, 0); }
