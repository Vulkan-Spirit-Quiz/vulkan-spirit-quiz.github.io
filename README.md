# Vulkan Spirit Quiz 🖖

Das Star-Trek-Quiz für Conventions und Fan-Treffen: im Team gegen andere Fans antreten und Preise gewinnen – **direkt im Browser, ohne Anmeldung, ohne Server.**
Die Spielleitung startet ein Quiz, Teams treten per QR-Code mit dem Handy bei, ein Beamer zeigt Fragen und Rangliste.

**▶ Jetzt spielen: https://vulkan-spirit-quiz.github.io/**

*English: A German-language Star Trek team quiz. One device hosts, teams join by scanning a QR code, a projector shows questions and scores. Runs entirely on GitHub Pages – the host's browser is the game server and phones connect to it peer-to-peer (WebRTC). There is also a solo practice mode.*

## So wird gespielt
1. **Spielleitung** öffnet die Seite, wählt eine Mission und klickt **„Quiz erstellen“**.
2. **Teams** scannen den QR-Code (oder geben den sechsstelligen Code ein), wählen Namen und Teambild.
3. Optional **„Bildschirm öffnen“** für den Beamer.
4. **Spiel starten** – 25 Sekunden pro Frage, je schneller, desto mehr Punkte (500–1.000). Frage 10 ist die Knackfrage mit 2,5× Punkten.
5. Am Ende: Siegerteam, Siegerdiplom zum Drucken, Ergebnis als CSV, nächste Mission mit denselben Teams.

Keine Teams zur Hand? **„Allein üben“** spielt eine Mission allein auf einem Gerät.

Das Design ist von den LCARS-Computeranzeigen aus Star Trek inspiriert und für Handys optimiert; auf dem Handy lässt sich das Quiz auch „zum Startbildschirm hinzufügen“.

## Android TV App 📺
Der Fernseher wird zur Spielleitung und zum Bildschirm: Mission mit der Fernbedienung wählen, die Teams scannen den QR-Code vom Fernseher, gesteuert wird mit **Pfeiltasten + OK**.

**Download:** [VulkanSpiritQuiz-TV.apk](https://github.com/Vulkan-Spirit-Quiz/vulkan-spirit-quiz.github.io/releases/download/tv/VulkanSpiritQuiz-TV.apk) (Seite: [Releases → Android TV App](https://github.com/Vulkan-Spirit-Quiz/vulkan-spirit-quiz.github.io/releases/tag/tv))

Installation auf dem Fernseher (Google TV, Android TV, Fire TV):
1. Im Play Store bzw. Amazon Appstore die kostenlose App **„Downloader“** (von AFTVnews) installieren.
2. In den Einstellungen des Fernsehers „Apps aus unbekannten Quellen“ für **Downloader** erlauben
   (Google TV: Einstellungen → System → Info → 7× auf „Android TV OS-Build“ tippen, dann Einstellungen → Apps → Sicherheit → Unbekannte Apps).
3. In Downloader die Download-Adresse oben eingeben → herunterladen → **Installieren**.
4. Die App „Vulkan Spirit Quiz“ erscheint auf dem Startbildschirm.

Die App zeigt die Webseite im Vollbild, hält den Bildschirm wach und braucht Internet. Inhalte (Fragen, Design) kommen immer aktuell von der Webseite – die App muss dafür nicht neu installiert werden. Quellcode: `android/`, gebaut automatisch von GitHub Actions (`.github/workflows/android-tv.yml`).

## Was ist drin
- **11 Missionen**: 10 Schiffe mit je 10 Fragen (eine aus jedem der 10 Themen) und das **Kobayashi-Maru-Finale** (5 Bonusfragen, die letzte ist eine Musikfrage mit 45 Sekunden Zeit) – 105 Fragen insgesamt.
- Automatische Auflösung, sobald alle Teams geantwortet haben oder die Zeit um ist.
- Teambilder: 14 Charakterfotos, Völker, Uniformen, Technik, Tiere & Snacks oder ein eigenes Foto.
- Spielleitung: QR-Code speichern, Link kopieren, Beamer-Ansicht, Teams entfernen, Mission/Preis vor dem Start ändern, Quiz beenden.
- Tastatur: **Leertaste/Enter** = Weiter/Auflösen (Spielleitung), **A–D** oder **1–4** = Antworten.

## Wie funktioniert das ohne Server?
Auf GitHub Pages gibt es nur statische Dateien. Deshalb läuft das Spiel **im Browser der Spielleitung**: Dort liegt der Spielstand (auch nach Neuladen), und die Handys der Teams verbinden sich direkt per WebRTC ([PeerJS](https://peerjs.com/), mitgeliefert in `docs/vendor/`). Der öffentliche PeerJS-Vermittlungsdienst hilft nur beim Verbindungsaufbau.

Wichtig für den Abend:
- **Das Fenster der Spielleitung offen lassen**, bis das Spiel vorbei ist. Neu laden ist kein Problem.
- Spielleitung und Teams brauchen Internet. In sehr restriktiven Netzwerken (manche Firmen- oder Hotel-WLANs) kann die Direktverbindung scheitern – dann hilft meist mobiles Internet.
- „Leitungslink sichern“ öffnet die Steuerung auf einem zweiten Gerät (z. B. Handy als Fernbedienung), solange das erste Fenster offen ist.

## Auf GitHub Pages veröffentlichen (eigene Kopie)
1. Repository forken (oder herunterladen und neu hochladen).
2. **Settings → Pages → Build and deployment**: *Deploy from a branch*, Branch `main`, Ordner **`/docs`**.
3. Nach ein bis zwei Minuten läuft das Quiz unter `https://<name>.github.io/<repository>/`.

Kein Build-Schritt nötig – alles in `docs/` wird so ausgeliefert, wie es ist.

## Weiterhin möglich: Netlify mit Server
Die ursprüngliche Server-Variante ist noch dabei (`netlify/`, `lib/game.mjs`, Netlify Database). Die App erkennt automatisch, ob ein Server unter `api/game` antwortet, und nutzt ihn dann.
```
npm install
netlify link
netlify deploy --build --prod
```

## Aufbau
```
docs/                       Webseite für GitHub Pages (kein Build nötig)
  index.html, css/, js/     App, QR-Code-Erzeugung im Browser
  js/questions.mjs          Fragenkatalog (hier Fragen bearbeiten)
  js/engine.mjs             Spiellogik im Browser der Spielleitung
  js/net.mjs                Verbindung: Server, lokal oder Peer-to-Peer
  vendor/peerjs.min.js      PeerJS 1.5.4 (MIT)
  media/, fonts/, logo.png  Bilder (inkl. media/aliens/*.svg), Schrift Antonio, Logo
lib/game.mjs                Spiellogik für die Netlify-Server-Variante
netlify/                    Server-Funktion und Datenbankschema
scripts/check.mjs           prüft den Fragenkatalog
```

## Fragen bearbeiten
In `docs/js/questions.mjs` steht bei jeder Frage die **richtige Antwort zuerst**; die Reihenfolge wird automatisch fest gemischt. `node scripts/check.mjs` prüft danach, ob alles stimmt.

## Rechtliches
Inoffizielles Fanprojekt von Vulkan Spirit. Star Trek ist eine Marke von Paramount/CBS. Die Alien-Porträts sind eigene Illustrationen. Bild- und Schriftquellen: [`docs/bildquellen.html`](docs/bildquellen.html), Fragenquellen: [`docs/fragenquellen.html`](docs/fragenquellen.html). Schrift Antonio unter SIL Open Font License, PeerJS unter MIT-Lizenz.
