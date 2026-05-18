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

### Fichiers du projet

- **`frida_in_london.html`** — Le jeu complet, en monolithe. ~135 Ko, ~3900 lignes de JS dans une seule balise `<script>`. **Contient des duplications de plusieurs fonctions** (drawHUD, drawTeacup, drawScone, drawRibbon, drawShawl, drawCrown, drawPickup) à cause de troncatures répétées pendant le développement. En JS les déclarations s'écrasent (la dernière gagne) donc le code fonctionne, mais le fichier mérite un nettoyage.
- **`solver.js`** — Solveur d'atteignabilité en Node. Réplique exactement la physique du jeu et fait un BFS sur les "plateformes" pour vérifier que chaque pièce, scone, bloc `?` et drapeau est accessible depuis le spawn. À garder synchronisé avec les constantes physiques du jeu.
- **`build_levels.js`** — Générateur de niveaux avec validation automatique (utilise `solver.js`). Permet d'éditer la structure des niveaux en JS lisible puis d'exporter du JSON inséré dans le HTML.
- **`frida_movement_lab.html`** — Mini-fichier de R&D pour la maniabilité, avec sliders en temps réel pour ajuster tous les paramètres physiques. C'est en l'utilisant qu'on a trouvé les valeurs actuelles. À garder pour les futures itérations.

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

## Ce que je recommanderais de faire en priorité

### 1. Nettoyer les duplications de fonctions

Cherche dans `frida_in_london.html` les fonctions définies en double (au moins : `drawHUD`, `drawTeacup`, `drawScone`, `drawRibbon`, `drawShawl`, `drawCrown`, `drawPickup`, `drawMiniTeacup`, `drawTinyFrida`, peut-être `drawIntermission` et `drawTitle` aussi). Pour chacune, garde uniquement la **dernière** définition (c'est celle effectivement utilisée par JS). Le fichier devrait perdre 30-40% de sa taille.

### 2. Découper en modules

Le fichier monolithique est devenu pénible à maintenir. Je proposerais cette structure :

```
index.html           — squelette HTML + canvas + imports modules
js/
  main.js            — boucle de jeu, état global, init
  physics.js         — constantes physiques, moveAndCollide, checkWall, corner correction
  player.js          — makePlayer, updatePlayer, drawFrida
  enemies.js         — makeEnemy, updateEnemy, drawBobby/Sweep/Topboss/Smog/Dog/Sheep/Guard/Queen, chatter
  levels.js          — RAW_LEVELS, parseLevel, loadLevel, buildPickups
  pickups.js         — drawTeacup, drawScone, drawRibbon, drawShawl, drawCrown, drawPickupLantern/Gear/Rose/Brush
  powers.js          — POWER_POOL, rollPowerChoices, durations
  ui.js              — drawHUD, drawTitle, drawIntermission, drawFridaQA, drawPowerSelect, drawWinScreen, drawGameOver, drawPause
  rendering.js       — drawBackground, drawLondonBG/FactoryBG/MoorBG/BigBenBG, drawDecorOverlay, drawTiles, drawChatter, drawParticles, drawFloatTexts, drawNotifications, drawUnionJackFlag, drawCarriage
  notifications.js   — pushNotif, updateNotifications, drawNotifications + icônes
  audio.js           — SFX bips synthétisés
  input.js           — keys, keyPressed, consume, pressing
```

Pour importer dans un navigateur sans bundler, utilise des `<script type="module">` avec des `import` / `export`. Ou si tu préfères du JS global, fais simplement plusieurs `<script>` dans `index.html` dans l'ordre des dépendances.

### 3. Ajouter un dev server avec hot reload

Un simple `python3 -m http.server` ou `npx vite` suffit. Hot reload accéléra énormément les itérations.

### 4. Le solveur d'atteignabilité

Garde-le. Chaque fois qu'on touche aux niveaux ou à la physique, on relance `node build_levels.js` (ou un équivalent) pour s'assurer qu'aucun objet n'est devenu inaccessible. C'est ce qui m'a permis d'éviter de livrer un niveau impossible à finir.

## Choses connues qui ne sont pas idéales

- **Audio** : très basique, des bips synthétisés via Web Audio API. Si Sébastien le veut, on pourrait ajouter des vraies musiques d'ambiance par niveau (loop court).
- **Sprites** : tout dessiné au canvas avec des formes géométriques. C'est volontairement stylisé/caricatural, mais si on veut monter en qualité on pourrait passer à du pixel-art (sprites PNG) plus tard.
- **Mobile** : non testé, probablement injouable sans contrôles tactiles. Pas demandé pour l'instant mais à noter.
- **Sauvegarde** : aucune. Si on meurt 3 fois au niveau 4, on recommence depuis le niveau 1. Sébastien n'a pas demandé de save mais ce serait facile à ajouter via localStorage.
- **Élément interactif type "interrupteur"** : Sébastien l'a demandé dans une itération passée, mais je n'ai pas réussi à l'implémenter proprement. À reprendre si l'envie revient.

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
