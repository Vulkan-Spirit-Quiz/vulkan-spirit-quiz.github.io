// Vulkan Spirit Quiz – English question bank.
// Mirrors docs/js/questions.mjs exactly: same themes (German keys), same order, and the
// CORRECT answer first in o. The answer shuffle in questions.mjs is applied to both languages,
// so A–D are the same answer on a German and an English phone.

export const THEMES_EN = {
  'Brückencrew': 'Bridge Crew', 'Schiffe & Stationen': 'Ships & Stations', 'Aliens & Welten': 'Aliens & Worlds',
  'Technik': 'Technology', 'Freizeit': 'Off Duty', 'Deep Space Nine': 'Deep Space Nine', 'Voyager': 'Voyager',
  'Enterprise': 'Enterprise', 'Neue Serien': 'New Series', 'Kinofilme': 'Movies', 'Kobayashi Maru': 'Kobayashi Maru'
};

export const BANK_EN = {
  'Brückencrew': [
    { q: 'What service number does Captain Picard give in “Chain of Command”?', o: ['SP-937-215', 'NCC-1701-D', 'SC-937-0176', 'SP-1701-77'], e: 'Under Cardassian torture Picard gives only his name, rank and service number: SP-937-215.' },
    { q: 'Who is the first officer of the USS Enterprise-D?', o: ['William Riker', 'Data', 'Worf', 'Geordi La Forge'], e: 'Commander William T. Riker – “Number One” – is Picard’s first officer.' },
    { q: 'Who is in this picture?', o: ['Data', 'Geordi La Forge', 'Worf', 'Wesley Crusher'], e: 'Lieutenant Commander Data, the android of the Enterprise-D.' },
    { q: 'Who is the ship’s doctor of the Enterprise in the Original Series?', o: ['Leonard McCoy', 'Montgomery Scott', 'Hikaru Sulu', 'Christine Chapel'], e: '“Bones” McCoy: “I’m a doctor, not a …”' },
    { q: 'Who is in this picture?', o: ['James T. Kirk', 'Christopher Pike', 'Jonathan Archer', 'Montgomery Scott'], e: 'Captain James T. Kirk from the Original Series.' },
    { q: 'What is Nyota Uhura’s job on the bridge in the Original Series?', o: ['Communications', 'Navigation', 'Engineering', 'Medicine'], e: 'Uhura is the communications officer of the Enterprise.' },
    { q: 'Who is in this picture?', o: ['Spock', 'Sarek', 'Tuvok', 'Sybok'], e: 'Spock, first officer and science officer under Kirk.' },
    { q: 'Which Klingon serves as an officer on the Enterprise-D?', o: ['Worf', 'Kor', 'Martok', 'Gowron'], e: 'Worf is the first Klingon in Starfleet.' },
    { q: 'Who is in this picture?', o: ['Jean-Luc Picard', 'Benjamin Sisko', 'Edward Jellico', 'Benjamin Maxwell'], e: 'Captain Jean-Luc Picard: “Tea, Earl Grey, hot.”' },
    { q: 'What is the name of Kirk’s chief engineer?', o: ['Montgomery Scott', 'Pavel Chekov', 'Hikaru Sulu', 'Geordi La Forge'], e: 'Montgomery “Scotty” Scott – the miracle worker in engineering.' }
  ],
  'Schiffe & Stationen': [
    { q: 'What registry number does Kirk’s Enterprise carry?', o: ['NCC-1701', 'NX-01', 'NCC-1701-D', 'NCC-74656'], e: 'NCC-1701 – no letter. The Enterprise-D is NCC-1701-D.' },
    { q: 'How many decks does the Galaxy-class USS Enterprise-D have?', o: ['42', '24', '36', '57'], e: 'The Enterprise-D has 42 decks.' },
    { q: 'What was Deep Space Nine called under Cardassian rule?', o: ['Terok Nor', 'Empok Nor', 'Bajor VIII', 'Dominion Prime'], e: 'The Cardassians called the station Terok Nor.' },
    { q: 'Which class does the USS Voyager belong to?', o: ['Intrepid class', 'Galaxy class', 'Defiant class', 'Constitution class'], e: 'Voyager is an Intrepid-class ship.' },
    { q: 'Which ship does Captain Carol Freeman command in “Lower Decks”?', o: ['USS Cerritos', 'USS Titan', 'USS Protostar', 'USS Excelsior'], e: 'Captain Freeman commands the USS Cerritos.' },
    { q: 'Which ship did Picard command before the Enterprise-D?', o: ['USS Stargazer', 'USS Reliant', 'USS Defiant', 'USS Saratoga'], e: 'Picard was captain of the USS Stargazer.' },
    { q: 'Which ship does Captain Sulu command in “Star Trek VI”?', o: ['USS Excelsior', 'USS Enterprise-A', 'USS Grissom', 'USS Reliant'], e: 'Sulu is captain of the USS Excelsior.' },
    { q: 'Which ship do Dal and his friends find in “Star Trek: Prodigy”?', o: ['USS Protostar', 'USS Cerritos', 'USS Voyager', 'USS Dauntless'], e: 'The young heroes discover the USS Protostar.' },
    { q: 'Which ship is the star of the series “Enterprise”?', o: ['Enterprise NX-01', 'USS Enterprise-A', 'USS Enterprise-B', 'USS Enterprise-J'], e: 'Archer’s Enterprise NX-01 – Earth’s first Warp 5 ship.' },
    { q: 'Which ship does Captain Liam Shaw command in “Picard” season 3?', o: ['USS Titan-A', 'USS Zheng He', 'USS Enterprise-F', 'USS Stargazer'], e: 'Captain Liam Shaw commands the USS Titan-A.' }
  ],
  'Aliens & Welten': [
    { q: 'Which planet is Spock’s father Sarek from?', o: ['Vulcan', 'Romulus', 'Andoria', 'Bajor'], e: 'Sarek is a Vulcan; Spock’s mother Amanda is human.' },
    { q: 'What is the name of the Klingon homeworld?', o: ['Qo’noS (Kronos)', 'Remus', 'Cardassia', 'Ferenginar'], e: 'Qo’noS, often written “Kronos”.' },
    { q: 'What is the name of Romulus’s sister planet?', o: ['Remus', 'Rigel', 'Risa', 'Romii'], e: 'Remus – home of the Remans, known from “Nemesis”.' },
    { q: 'Which species says: “Resistance is futile”?', o: ['Borg', 'Breen', 'Dominion', 'Xindi'], e: 'The Borg assimilate – resistance is futile.' },
    { q: 'Which species has blue skin and antennae?', o: ['Andorians', 'Bolians', 'Vulcans', 'Tellarites'], e: 'The Andorians, like Commander Shran.' },
    { q: 'Who leads the Dominion?', o: ['The Founders (Changelings)', 'The Vorta', 'The Jem’Hadar', 'The Breen'], e: 'The shape-shifting Founders control the Dominion.' },
    { q: 'What is the Ferengi Rule of Acquisition No. 1?', o: ['Once you have their money, you never give it back.', 'War is good for business.', 'More is good, all is better.', 'A contract is a contract.'], e: 'Rule No. 1: once it’s in your pocket, it never comes back out.' },
    { q: 'Which species can be joined with a symbiont?', o: ['Trill', 'Betazoids', 'Bajorans', 'Talaxians'], e: 'Joined Trill carry a symbiont – like Dax.' },
    { q: 'What are the furry creatures that multiply incredibly fast?', o: ['Tribbles', 'Gorn', 'Horta', 'Targs'], e: 'The trouble with tribbles: they never stop multiplying.' },
    { q: 'Which people occupied Bajor for decades?', o: ['Cardassians', 'Romulans', 'Klingons', 'Breen'], e: 'The Cardassians occupied Bajor for about 50 years.' }
  ],
  'Technik': [
    { q: 'What do you use to “beam” in Star Trek?', o: ['Transporter', 'Replicator', 'Tractor beam', 'Deflector'], e: '“Beam me up!” – that’s what the transporter is for.' },
    { q: 'Which crystal regulates the matter-antimatter reaction in the warp core?', o: ['Dilithium', 'Trilithium', 'Latinum', 'Kelbonite'], e: 'Dilithium crystals make warp drive possible.' },
    { q: 'What is a tricorder?', o: ['A handheld scanning and analysis device', 'A hand weapon', 'A communicator badge', 'A shuttle'], e: 'The tricorder scans, analyses and records.' },
    { q: 'Which warp factor is the unreachable limit in TNG?', o: ['Warp 10', 'Warp 9.975', 'Warp 12', 'Warp 15'], e: 'Warp 10 would mean infinite speed.' },
    { q: 'Where do crews have adventures in a simulated world?', o: ['On the holodeck', 'In sickbay', 'In engineering', 'In the shuttle bay'], e: 'The holodeck creates entire worlds.' },
    { q: 'Which hand weapon has a “stun” setting?', o: ['Phaser', 'Disruptor', 'Bat’leth', 'Tricorder'], e: '“Set phasers to stun!”' },
    { q: 'What are Starfleet’s standard torpedoes called in TNG?', o: ['Photon torpedoes', 'Plasma torpedoes', 'Quantum torpedoes', 'Tachyon torpedoes'], e: 'Photon torpedoes – quantum torpedoes came later.' },
    { q: 'What translates alien languages automatically?', o: ['The universal translator', 'The ship’s computer', 'The tricorder', 'The communicator'], e: 'The universal translator makes first contact easier.' },
    { q: 'What protects a starship from enemy fire?', o: ['The shields', 'The tractor beam', 'The warp nacelles', 'The impulse engines'], e: '“Shields up!”' },
    { q: 'What creates food and drinks at the touch of a button?', o: ['The replicator', 'The transporter', 'The holodeck', 'The spore drive'], e: 'The replicator – only Neelix prefers to cook himself.' }
  ],
  'Freizeit': [
    { q: 'Which card game do the officers of the Enterprise-D play regularly?', o: ['Poker', 'Tongo', 'Dabo', 'Skat'], e: 'The senior officers’ poker game is legendary.' },
    { q: 'Which instrument does William Riker play?', o: ['Trombone', 'Clarinet', 'Saxophone', 'Flute'], e: 'Riker loves jazz and the trombone.' },
    { q: 'Which instrument does Harry Kim play?', o: ['Clarinet', 'Violin', 'Trombone', 'Piano'], e: 'Harry Kim plays the clarinet.' },
    { q: 'What is the name of Data’s cat?', o: ['Spot', 'Porthos', 'Neelix', 'Tribble'], e: 'Data even wrote an “Ode to Spot”.' },
    { q: 'Which detective does Picard like to play on the holodeck?', o: ['Dixon Hill', 'Sherlock Holmes', 'Hercule Poirot', 'Philip Marlowe'], e: 'Picard slips into the role of private eye Dixon Hill.' },
    { q: 'Which sport does Captain Sisko love?', o: ['Baseball', 'Football (soccer)', 'Basketball', 'Parrises squares'], e: 'Sisko is a huge baseball fan.' },
    { q: 'Which game do Kirk and Spock like to play against each other?', o: ['3D chess', 'Poker', 'Kal-toh', 'Dom-jot'], e: 'Three-dimensional chess is an Original Series classic.' },
    { q: 'Which holonovel character does Tom Paris play in “Voyager”?', o: ['Captain Proton', 'Dixon Hill', 'Vic Fontaine', 'Captain Pluto'], e: 'Captain Proton – in black and white.' },
    { q: 'What is Captain Janeway’s favourite drink?', o: ['Coffee', 'Tea, Earl Grey, hot', 'Raktajino', 'Prune juice'], e: '“There’s coffee in that nebula!”' },
    { q: 'What is Worf’s favourite drink?', o: ['Prune juice', 'Bloodwine', 'Raktajino', 'Synthehol'], e: 'Worf calls prune juice “a warrior’s drink”.' }
  ],
  'Deep Space Nine': [
    { q: 'Who commands Deep Space Nine?', o: ['Benjamin Sisko', 'Kira Nerys', 'Odo', 'Julian Bashir'], e: 'Commander, later Captain, Benjamin Sisko.' },
    { q: 'Which shape-shifter is the station’s chief of security?', o: ['Odo', 'Garak', 'Morn', 'Laas'], e: 'Odo – a Changeling.' },
    { q: 'Who owns the bar on the Promenade?', o: ['Quark', 'Rom', 'Nog', 'Garak'], e: 'Quark’s Bar, Grill, Gaming House and Holosuite Arcade.' },
    { q: 'Which Cardassian works on the station as a tailor?', o: ['Garak', 'Dukat', 'Damar', 'Tain'], e: '“Plain, simple Garak” – tailor and ex-spy.' },
    { q: 'What is the name of Sisko’s son?', o: ['Jake', 'Nog', 'Rom', 'Joseph'], e: 'Jake Sisko becomes a writer.' },
    { q: 'What is Sisko’s baseball team called in the holoprogram?', o: ['Niners', 'Logicians', 'Yankees', 'Pioneers'], e: 'The Niners lose to Solok and his Logicians.' },
    { q: 'What do the Bajorans call the beings in the wormhole?', o: ['The Prophets', 'The Pah-wraiths', 'The Founders', 'The Vorta'], e: 'For the Bajorans, the Prophets live in the Celestial Temple.' },
    { q: 'Which warship does Sisko bring to the station from season 3?', o: ['USS Defiant', 'USS Enterprise', 'USS Rio Grande', 'USS Saratoga'], e: 'The USS Defiant – small but dangerous.' },
    { q: 'Which young Ferengi goes to Starfleet Academy?', o: ['Nog', 'Rom', 'Brunt', 'Zek'], e: 'Nog is the first Ferengi in Starfleet.' },
    { q: 'Which Cardassian was Prefect of Bajor?', o: ['Gul Dukat', 'Garak', 'Legate Damar', 'Enabran Tain'], e: 'Gul Dukat was prefect during the occupation.' }
  ],
  'Voyager': [
    { q: 'Who is in this picture?', o: ['Kathryn Janeway', 'Beverly Crusher', 'Kira Nerys', 'Elizabeth Shelby'], e: 'Captain Kathryn Janeway of the USS Voyager.' },
    { q: 'Which quadrant is Voyager stranded in?', o: ['Delta Quadrant', 'Gamma Quadrant', 'Beta Quadrant', 'Alpha Quadrant'], e: 'The Caretaker flings them into the Delta Quadrant.' },
    { q: 'Which being brings Voyager to the Delta Quadrant?', o: ['The Caretaker', 'Q', 'The Borg Queen', 'The Prophets'], e: 'The Caretaker pulls the ship across with his array.' },
    { q: 'What is the name of Voyager’s doctor?', o: ['The Doctor (EMH)', 'Dr. Bashir', 'Dr. Phlox', 'Dr. Pulaski'], e: 'The Emergency Medical Hologram – “the Doctor”.' },
    { q: 'Which species does Neelix belong to?', o: ['Talaxian', 'Ocampa', 'Kazon', 'Vidiian'], e: 'Neelix is a Talaxian – cook and morale officer.' },
    { q: 'Who is in this picture?', o: ['Seven of Nine', 'Kes', 'B’Elanna Torres', 'T’Pol'], e: 'Seven of Nine – former Borg drone.' },
    { q: 'What is Seven of Nine’s human birth name?', o: ['Annika Hansen', 'Erin Hansen', 'Anna Torres', 'Kathryn Hansen'], e: 'Born Annika Hansen, daughter of Magnus and Erin Hansen.' },
    { q: 'Which group did Chakotay and part of his crew belong to?', o: ['The Maquis', 'The Kazon', 'The Obsidian Order', 'Section 31'], e: 'Chakotay was a Maquis commander.' },
    { q: 'Which Vulcan is Voyager’s chief of security?', o: ['Tuvok', 'Vorik', 'Sarek', 'Tuvix'], e: 'Lieutenant Commander Tuvok.' },
    { q: 'How far from Earth is Voyager at the start?', o: ['About 70,000 light years', 'About 7,000 light years', 'About 700 light years', 'About 700,000 light years'], e: 'About 70,000 light years – roughly a 75-year journey home.' }
  ],
  'Enterprise': [
    { q: 'Who is captain of the Enterprise NX-01?', o: ['Jonathan Archer', 'James T. Kirk', 'Christopher Pike', 'Robert April'], e: 'Captain Jonathan Archer.' },
    { q: 'What is the name of Archer’s dog?', o: ['Porthos', 'Spot', 'Butler', 'Number One'], e: 'Porthos, a beagle who loves cheese.' },
    { q: 'Which Vulcan serves as first officer on the NX-01?', o: ['T’Pol', 'T’Pring', 'Saavik', 'Valeris'], e: 'Subcommander T’Pol.' },
    { q: 'Which Andorian becomes Archer’s rival and friend?', o: ['Shran', 'Thy’lek', 'Talas', 'Keval'], e: 'Commander Shran: “Pinkskin!”' },
    { q: 'What is the name of the NX-01’s Denobulan doctor?', o: ['Phlox', 'Bashir', 'McCoy', 'Crusher'], e: 'Dr. Phlox with his legendary smile.' },
    { q: 'Which people attack Earth at the end of season 2?', o: ['Xindi', 'Suliban', 'Klingons', 'Romulans'], e: 'The Xindi attack sends the NX-01 into the Delphic Expanse in season 3.' },
    { q: 'Who is chief engineer of the Enterprise NX-01?', o: ['Charles “Trip” Tucker', 'Malcolm Reed', 'Travis Mayweather', 'Montgomery Scott'], e: 'Commander Charles “Trip” Tucker III.' },
    { q: 'What is the name of Archer’s father, who worked on the Warp 5 engine?', o: ['Henry Archer', 'Richard Archer', 'Jonathan Archer Sr.', 'Zefram Archer'], e: 'Henry Archer helped develop the Warp 5 engine.' },
    { q: 'Which linguist on the NX-01 speaks dozens of languages?', o: ['Hoshi Sato', 'T’Pol', 'Uhura', 'Keiko O’Brien'], e: 'Ensign Hoshi Sato is the communications officer.' },
    { q: 'In which century is the series “Enterprise” set?', o: ['The 22nd century', 'The 21st century', 'The 23rd century', 'The 24th century'], e: 'The NX-01 launches in 2151.' }
  ],
  'Neue Serien': [
    { q: 'Who is the main character of “Star Trek: Discovery”?', o: ['Michael Burnham', 'Sylvia Tilly', 'Philippa Georgiou', 'Saru'], e: 'Michael Burnham – later captain of the Discovery.' },
    { q: 'Who commands the Enterprise in “Strange New Worlds”?', o: ['Christopher Pike', 'James T. Kirk', 'Una Chin-Riley', 'Robert April'], e: 'Captain Christopher Pike.' },
    { q: 'Which two ensigns are at the centre of “Lower Decks”?', o: ['Boimler and Mariner', 'Kim and Paris', 'Nog and Jake', 'Rutherford and Shaxs'], e: 'Brad Boimler and Beckett Mariner.' },
    { q: 'Who developed the spore drive on the Discovery?', o: ['Paul Stamets', 'Hugh Culber', 'Sylvia Tilly', 'Saru'], e: 'Lieutenant Commander Paul Stamets.' },
    { q: 'Who is chancellor of the academy in “Starfleet Academy”?', o: ['Nahla Ake', 'Kathryn Janeway', 'Una Chin-Riley', 'Michael Burnham'], e: 'Nahla Ake, played by Holly Hunter.' },
    { q: 'What are the names of Picard’s Romulan companions at his vineyard?', o: ['Laris and Zhaban', 'Elnor and Raffi', 'Sela and Tomalak', 'Shinzon and Vreenak'], e: 'Laris and Zhaban live with Picard at Château Picard.' },
    { q: 'Who plays Spock in “Strange New Worlds”?', o: ['Ethan Peck', 'Zachary Quinto', 'Leonard Nimoy', 'Anson Mount'], e: 'Ethan Peck – Anson Mount plays Pike.' },
    { q: 'Who guides the kids in “Prodigy” as a hologram?', o: ['A holo version of Janeway', 'The Doctor', 'Vic Fontaine', 'Moriarty'], e: 'Hologram Janeway becomes the crew’s mentor.' },
    { q: 'Which century does the Discovery jump to in season 3?', o: ['The 32nd century', 'The 29th century', 'The 25th century', 'The 31st century'], e: 'The Discovery arrives in the year 3188.' },
    { q: 'What is the name of Picard’s vineyard in France?', o: ['Château Picard', 'Domaine La Barre', 'Château Saint-Clair', 'Clos Romulus'], e: 'Château Picard in La Barre.' }
  ],
  'Kinofilme': [
    { q: 'Which villain returns in “Star Trek II”?', o: ['Khan', 'Kruge', 'Chang', 'Shinzon'], e: '“KHAAAAN!” – Khan Noonien Singh.' },
    { q: 'Which animals does the crew bring to the future in “Star Trek IV”?', o: ['Humpback whales', 'Dolphins', 'Eagles', 'Elephants'], e: 'The humpback whales George and Gracie.' },
    { q: 'According to “First Contact”, who invented warp drive?', o: ['Zefram Cochrane', 'Henry Archer', 'Noonien Soong', 'Richard Daystrom'], e: 'Zefram Cochrane with his Phoenix.' },
    { q: 'Who tries to change the past in “First Contact”?', o: ['The Borg', 'The Romulans', 'The Klingons', 'The Xindi'], e: 'The Borg travel back to the year 2063.' },
    { q: 'In which film does Captain Kirk die?', o: ['Generations', 'The Undiscovered Country', 'Insurrection', 'Nemesis'], e: 'Kirk dies in “Star Trek Generations”.' },
    { q: 'Which test is deliberately impossible for cadets to win?', o: ['Kobayashi Maru', 'Ilia simulation', 'Vulcan Kolinahr', 'Kal-if-fee'], e: 'The Kobayashi Maru tests how you face the inevitable.' },
    { q: 'What is the name of Picard’s clone in “Nemesis”?', o: ['Shinzon', 'B-4', 'Lore', 'Sela'], e: 'Shinzon, raised on Remus.' },
    { q: 'What is the name of Zefram Cochrane’s warp ship?', o: ['Phoenix', 'Bonaventure', 'Valiant', 'Pegasus'], e: 'The Phoenix – humanity’s first warp flight.' },
    { q: 'According to “First Contact”, in which year does first contact with the Vulcans happen?', o: ['2063', '2161', '2051', '1996'], e: 'On 5 April 2063.' },
    { q: 'What was the name of Khan’s ship, on which he was found in cryosleep?', o: ['SS Botany Bay', 'SS Valiant', 'SS Conestoga', 'SS Mariposa'], e: 'The SS Botany Bay from “Space Seed”.' }
  ]
};

export const FINALE_EN = [
  { q: 'What is the name of Khan Noonien Singh’s wife?', o: ['Marla McGivers', 'Carla McGuiver', 'Jacqueline O’Neil', 'Janice Rand'], e: 'In “Space Seed” Lieutenant Marla McGivers falls in love with Khan and follows him into exile on Ceti Alpha V.' },
  { q: 'What is the name of James T. Kirk’s brother?', o: ['George Samuel Kirk', 'Thomas Kirk', 'Flavius Kirk', 'Otto Kirk'], e: 'Kirk’s older brother George Samuel “Sam” Kirk is a scientist – he dies on the planet Deneva.' },
  { q: 'What is meant by the “Vulcan hello” in Star Trek: Discovery?', o: ['A pre-emptive first strike against a possible enemy', 'An invitation to a Vulcan mind meld', 'A traditional invitation to tea', 'A special greeting of friendship for close friends'], e: 'At first contact the Vulcans immediately opened fire on the Klingons – and earned their respect. That is why Burnham advises the “Vulcan hello”.' },
  { q: 'On which starship did Michael Burnham originally serve as first officer?', o: ['USS Shenzhou', 'USS Discovery', 'USS Europa', 'USS Enterprise'], e: 'Before joining the Discovery, Burnham was first officer under Captain Philippa Georgiou on the USS Shenzhou.' },
  // music question: fixed answer order, same as the German version
  { q: 'Listen closely: which series is this theme music from?', o: ['Enterprise', 'Discovery', 'Starfleet Academy', 'Strange New Worlds'], e: 'This is the main title theme of “Star Trek: Discovery” (composer: Jeff Russo).' }
];
