# Frida à Londres — L'Odyssée Victorienne

Un jeu de plateforme 2D où Frida Kahlo se promène dans une Angleterre du 19ᵉ siècle caricaturale, affronte des bobbies, des ramoneurs et la Reine Victoria.

## 🎮 Jouer

👉 **[https://eneekb.github.io/frida-in-london/](https://eneekb.github.io/frida-in-london/)**

Pas d'installation, pas d'inscription. Ça marche dans n'importe quel navigateur récent.

## Contrôles

| Touche | Action |
|---|---|
| Flèches / ZQSD / WASD | Bouger |
| Espace / ↑ | Sauter (maintenir = saut plus haut) |
| Shift | Dash |
| F | Boule de feu / pinceau magique (selon le pouvoir choisi) |
| ↓ | S'accroupir / Ground pound (selon le pouvoir) |
| P | Pause |
| R | Recommencer le niveau |
| 1, 2, 3 | Choisir une réponse / un pouvoir |

## Concept

Quatre actes :

1. **Les Ruelles de Londres** — pavés, brouillard, lampadaires à gaz
2. **L'Usine à Vapeur** — engrenages, cheminées, suie
3. **La Lande Brumeuse** — collines, moutons, chiens
4. **Le Sommet de Big Ben** — escalade jusqu'au boss final

Au début de chaque niveau, on choisit un pouvoir parmi 3 cartes tirées aléatoirement parmi 10 (double saut, sprint, invincibilité, boule de feu, planage, etc.). On peut aussi répondre à une question sur Frida pour gagner des points bonus.

## Technique

- **HTML + JS + Canvas pur**, aucune dépendance externe
- Déployé automatiquement via **GitHub Pages** à chaque push sur `main`
- Fichiers utilitaires :
  - `frida_movement_lab.html` — labo interactif pour ajuster la physique
  - `build_levels.js` + `solver.js` — édition de niveaux et vérification d'atteignabilité

## Crédits

Jeu créé par Sébastien Bruand avec l'aide de Claude (Anthropic).
