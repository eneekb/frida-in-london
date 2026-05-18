# Frida à Londres — Contexte du projet

## Qui je suis et comment me parler

Je m'appelle **Sébastien**. Réponds-moi en français, en me tutoyant. Je préfère la franchise à la flatterie — si une idée que je propose est mauvaise ou mal calibrée, dis-le-moi avec arguments. Quand tu n'es pas sûr, dis-le plutôt que d'inventer. Pour les questions complexes, raisonne par étapes.

## Le jeu — concept et thème

**Frida à Londres — L'odyssée victorienne** est un platformer 2D façon Super Mario, jouable dans un navigateur (HTML + Canvas + JS pur, aucune dépendance externe). L'idée artistique : faire évoluer **Frida Kahlo** dans une **Angleterre du 19e siècle** caricaturale. Le mélange culturel est volontaire et absurde — Frida au monosourcil et fleurs dans les cheveux affronte des bobbies, des ramoneurs, des patrons d'usine en haut-de-forme, des chiens des Baskerville et la Reine Victoria en personne. Le thème est traité avec une touche d'humour potache mais sans tomber dans la dérision facile.

Quatre actes thématiques :
1. **Les Ruelles de Londres** — pavés, brouillard, lampadaires à gaz, calèches
2. **L'Usine à Vapeur** — engrenages, cheminées, suie, patrons exploiteurs
3. **La Lande Brumeuse** — collines, moutons, chiens, brouillard épais
4. **Le Sommet de Big Ben** — vertical, escalade jusqu'au boss final (Reine Victoria)

## État actuel du code

### Hébergement et déploiement

- **Repo public** : https://github.com/eneekb/frida-in-london
- **URL live (GitHub Pages)** : https://eneekb.github.io/frida-in-london/ — redéployée automatiquement à chaque `git push` sur `main` (build ~1 min).
- Authentification configurée via `gh auth login` + `gh auth setup-git`. `gh` est installé via winget mais **pas dans le PATH de Git Bash** — utiliser `"/c/Program Files/GitHub CLI/gh.exe"`.

### Fichiers du projet

- **`index.html`** — Squelette HTML (75 lignes) qui ne contient plus que le canvas, le footer, et 13 balises `<script src="js/...">` dans l'ordre de chargement.
- **`js/`** — Le jeu découpé en 13 modules (~3900 lignes JS au total) :
  - **`core.js`** *(chargé en PREMIER)* — `canvas`, `ctx`, `W`, `H`, `TILE`, `game` state, `OBJECTIVES`, `LEVEL_THEME_OBJECT`. Doit être premier car `levels.js` calcule `LEVELS = RAW_LEVELS.map(parseLevel)` au top-level et `parseLevel` utilise `TILE`.
  - `input.js` — clavier (`keys`, `keyPressed`, `consume`, `pressing`)
  - `audio.js` — bips synthétisés Web Audio (`audioCtx`, `ensureAudio`, `blip`, `SFX`)
  - `physics.js` — constantes physiques + `moveAndCollide`, `checkWallSide`, `tileAt`, `isSolid`, `isHazard`, `entBB`, `rectOverlap`, `checkHazards`
  - `powers.js` — `POWER_POOL` (10 pouvoirs) + `rollPowerChoices` + durées (`POWER_DURATION`)
  - `effects.js` — notifications (`pushNotif`, `drawNotifications` + icônes), particules (`spawnCoinBurst`, `spawnPuff`, `spawnPetals`, `drawParticles`), textes flottants
  - `levels.js` — `RAW_LEVELS` (4 actes en texte) + `parseLevel` + `LEVELS` + `loadLevel` + `triggerDecor`
  - `pickups.js` — `buildPickups`, `drawPickup`, `drawTeacup`, `drawScone`, `drawRibbon`, `drawShawl`, `drawCrown`, sprites lantern/gear/rose/brush
  - `player.js` — `makePlayer`, `updatePlayer`, `killPlayer`, `drawFrida`, `drawFlower`
  - `enemies.js` — `makeEnemy`, `updateEnemy`, `drawEnemy`, sprites Bobby/Sweep/Topboss/Smog/Dog/Sheep/Guard/Queen, `maybeChatter`, `drawChatter`
  - `rendering.js` — `drawBackground`, `drawLondonBG`/`FactoryBG`/`MoorBG`/`BigBenBG`, `drawDecorOverlay`, `drawTiles`, `drawTile`, `drawGround`, `drawBrick`, `drawQBlock`, `drawSpike`, `drawFlag`, `drawLamp`, `drawBeam`, `drawGear`, `drawBarrel`, `drawBench`, `drawUnionJackFlag`, `drawCarriage`
  - `ui.js` — `FRIDA_QUESTIONS`, `FRIDA_QUOTES`, `drawFridaQA`, `drawPowerSelect`, `drawHUD`, `drawPowerTimer`, `drawMiniTeacup`, `drawTinyFrida`, `drawTitle`, `drawIntermission`, `drawWinScreen`, `drawGameOver`, `drawPause`, helpers `wrapText`/`wrapTextLeft`/`wrapTextCenter`
  - **`main.js`** *(chargé en DERNIER)* — `updateCamera`, `update`, `render`, `loop`, et l'appel `loop()` qui démarre tout. En dernier pour que les fonctions des autres modules existent au moment du boot.
- **`solver.js`** — Solveur d'atteignabilité en Node. Réplique exactement la physique du jeu et fait un BFS sur les "plateformes" pour vérifier que chaque pièce, scone, bloc `?` et drapeau est accessible depuis le spawn. **À mettre à jour si la physique change dans `js/physics.js`**.
- **`build_levels.js`** — Générateur de niveaux avec validation automatique (utilise `solver.js`). Permet d'éditer la structure des niveaux en JS lisible puis d'exporter du JSON.
- **`frida_movement_lab.html`** — Mini-fichier de R&D pour la maniabilité, avec sliders en temps réel pour ajuster tous les paramètres physiques. C'est en l'utilisant qu'on a trouvé les valeurs actuelles. À garder pour les futures itérations.

### Règles importantes après modularisation

- **Pas de `<script type="module">`** — on utilise des `<script>` classiques pour que `file://` (double-clic sur `index.html`) marche aussi pour les tests rapides.
- Toutes les variables top-level (`const`, `let`, `function`) sont **partagées entre les modules** via le scope global du script. Pas d'`import`/`export`.
- **Ordre de chargement** : `core.js` en premier, `main.js` en dernier. Les 11 autres modules peuvent en théorie être dans n'importe quel ordre (ils ne contiennent que des définitions de fonctions et des littéraux), mais l'ordre actuel dans `index.html` respecte les dépendances logiques.
- Quand tu ajoutes une fonction ou un module, **n'oublie pas de l'ajouter à `index.html`**.

### Mécaniques en place

**Flow de jeu** :
- Titre → ESPACE
- **Question Frida** (1, 2, 3 pour répondre) liée au niveau à venir, +50 pts si bonne réponse
- **Choix de pouvoir** : 3 cartes tirées aléatoirement parmi 10 (1, 2, 3 pour choisir)
- Niveau (pouvoir actif pendant toute la durée)
- Drapeau atteint → intermission avec citation de Frida → question suivante → etc.
- Boss final (Reine Victoria, 3 HP) à la fin de l'acte 4

**Contrôles** :
- Flèches ou ZQSD/WASD pour bouger
- ESPACE ou ↑ pour sauter (saut variable, hangtime à l'apex)
- Shift pour dasher
- F pour lancer une boule de feu (si Flammes du Cœur) ou peindre une plateforme (si Pinceau Magique)
- Bas pour ground pound (si Talon Ferré actif) ou s'accroupir
- P pour pause, R pour recommencer le niveau

**10 pouvoirs** dans `POWER_POOL` :
1. Ruban Rouge (double saut)
2. Châle Tehuana (sprint)
3. Couronne Fleurie (invincibilité 30s)
4. Flammes du Cœur (boule de feu F)
5. Ailes de Colombe (planage en maintenant saut)
6. Cœur Magnétique (attire les théières)
7. Mezcal de Oaxaca (slow-mo ennemis)
8. Calavera Dorée (théières × 3)
9. Talon Ferré (ground pound bas en l'air)
10. Pinceau Magique (peindre plateforme F, 3 par niveau)

**Objets thématiques par niveau** (5 à collecter, déclenche transformation radicale du décor) :
- Niveau 1 : 5 lanternes → tout s'illumine la nuit
- Niveau 2 : 5 engrenages → cauchemar mécanique rouge avec engrenages géants
- Niveau 3 : 5 roses → la lande se couvre de fleurs, ciel rose
- Niveau 4 : 5 pinceaux → le monde devient une peinture de Frida

**Autres collectibles** :
- Théières (compteur dans le HUD, +1 vie tous les 10)
- Scones (+1 vie immédiate)
- Blocs `?` à frapper par en dessous (+50 pts ou power-up gratuit)

**Ennemis** avec bulles de dialogue françaises occasionnelles (« Halte-là ! », « Saperlipopette ! », « Nous ne sommes pas amusée. »).

### Maniabilité actuelle (issue du labo)

Profil **"lent et flottant"** validé par Sébastien :

```
GRAVITY = 0.30
MOVE_ACCEL = 0.10         (très progressif)
AIR_ACCEL = 0.05          (peu de contrôle en l'air)
MOVE_MAX_BASE = 2.0       (vitesse de marche lente)
FRICTION_GROUND = 0.85
FRICTION_AIR = 0.97
TURN_AROUND_MULT = 2.0    (boost de freinage en demi-tour)
JUMP_V = -6.0
JUMP_CUT = 0.30
GRAVITY_UP_MULT = 0.46    (montée plus lente = sensation flottante)
GRAVITY_DOWN_MULT = 1.50  (chute plus rapide = asymetric gravity)
HANGTIME_THRESHOLD = 3.0
HANGTIME_FACTOR = 0.25    (gros hangtime à l'apex)
COYOTE_FRAMES = 7
JUMP_BUFFER_FRAMES = 8
```

Mouvements optionnels activés :
- **Wall slide** + **Wall jump** (`WALL_SLIDE_SPEED = 0.80`, `WALL_JUMP_VY = -6.0`, `WALL_JUMP_VX = 2.0`)
- **Dash** Shift (`DASH_SPEED = 5.0`, `DASH_DUR = 20`, `DASH_CD = 120`)
- **Corner correction** (`CORNER_CORRECT_PX = 8`)

Le jeu a été vérifié avec le solveur : **103/103 objets atteignables** sur les 4 niveaux avec ces valeurs.

## Travaux déjà faits depuis la version Cowork

Ces étapes ont été menées lors du passage à Claude Code (2026-05-19) :

1. **Récupération depuis Cowork** → projet posé en local + dépôt Git initialisé.
2. **Repo GitHub** + **GitHub Pages** activé → jeu jouable en ligne sur https://eneekb.github.io/frida-in-london/.
3. **Nettoyage du code mort** : suppression de ~480 lignes après le premier `</script>` (5 blocs `</body></html>` empilés à cause de troncatures successives lors de la génération).
4. **Suppression de fichiers obsolètes** : `build_levels_fixed.js` (doublon exact de `build_levels.js`) + `tail_chunks.py` + `tail_chunks2.py` (scripts d'assemblage par chunks plus utiles).
5. **`README.md`** + **`.gitignore`** ajoutés.
6. **Modularisation** : monolithe découpé en 13 modules dans `js/` (voir section "Fichiers du projet").

## Pistes pour la suite (si demandées par Sébastien)

### Dev server avec hot reload

Un simple `python -m http.server` à la racine du projet sert tout via HTTP. Hot reload nécessite Vite ou similaire (à ajouter avec autorisation, car c'est une dépendance).

### Solveur d'atteignabilité — à synchroniser

`solver.js` est un script Node qui réplique la physique du jeu pour faire un BFS d'atteignabilité. Depuis la modularisation, les constantes physiques sont dans `js/physics.js`. Quand on touche à la physique, vérifier que le solveur reste à jour avec les bonnes valeurs avant de relancer `node build_levels.js`.

### Adaptation mobile

Pas testé, probablement injouable sans contrôles tactiles. Si Zélie ou Lucile veulent jouer sur tablette/téléphone, à prioriser.

### Sauvegarde localStorage

Aucune actuellement : si on meurt 3 fois au niveau 4, retour au niveau 1. Facile à ajouter (5-10 min) si demandé.

### Interrupteurs interactifs

Demandé dans une itération passée mais jamais implémenté proprement. À reprendre si l'envie revient.

## Choses connues qui ne sont pas idéales

- **Audio** : très basique, des bips synthétisés via Web Audio API. Si Sébastien le veut, on pourrait ajouter des vraies musiques d'ambiance par niveau (loop court).
- **Sprites** : tout dessiné au canvas avec des formes géométriques. C'est volontairement stylisé/caricatural, mais si on veut monter en qualité on pourrait passer à du pixel-art (sprites PNG) plus tard.

(Pour mobile, sauvegarde et interrupteurs, voir "Pistes pour la suite" plus haut.)

## Historique des décisions importantes

- **Pas de framework** (pas React, Phaser, etc.) — Canvas + JS pur volontaire pour la simplicité et l'absence de dépendances.
- **Physique tunée via labo interactif** — `frida_movement_lab.html` avec sliders. Toujours utiliser ce labo pour itérer sur la maniabilité avant de toucher au jeu.
- **Solveur d'atteignabilité obligatoire** — chaque changement de niveau ou de physique doit passer par lui avant de livrer.
- **Profil maniabilité "lent et flottant"** — choix artistique cohérent avec le thème (Frida contemplative dans une ville étrangère). Ne pas accélérer sans raison.
- **Français partout dans l'UI** — Sébastien est francophone, tout le texte visible doit être en français (sauf les onomatopées étrangères qui jouent la carte de la caricature).

## Comment me poser des questions

Si tu as besoin de clarification sur un choix de design ou une priorité, demande-moi directement. Je préfère répondre à 2-3 questions en début de session plutôt que tu fasses des hypothèses qui s'éloignent de ce que je veux. En particulier, demande-moi avant de :

- Changer la "sensation" de Frida (vitesse, saut, gravité)
- Ajouter un nouveau pouvoir ou retirer un existant
- Refondre l'esthétique générale
- Ajouter des dépendances externes (frameworks, bibliothèques)

Pour les nettoyages techniques, refactoring, corrections de bugs, optimisations : tu peux y aller sans demander, présente-moi juste le résultat.

Bon courage, et merci de prendre le relais.
