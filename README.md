# The Famous — Beauty · Spa · Gym

> Institut de beauté, spa et salle de sport, Bastos, Yaoundé.

Maquette de site vitrine réalisée pour **présentation à un client prospect**. Aucun
contrat signé à ce jour, aucun nom de domaine, aucun hébergement. Rien n'est en ligne.

Client pressenti : The Famous (Bastos, Yaoundé). Réalisation : [Innova Alpha](https://innovaalpha.com).

---

## Ouvrir la maquette

Les pages utilisent un composant `<x-dc>` interprété par `support.js`, qui charge ses
fragments par requête réseau. **Un double-clic sur le fichier ne suffit pas**, il faut
servir le dossier :

```
cd livrables/sites-web/site-famous-beauty
python3 -m http.server 8080
```

Puis ouvrir `http://127.0.0.1:8080/Bienvenue.dc.html`.

Page d'entrée déclarée dans `manifest.json` : `Bienvenue.dc.html`.

---

## Pages

| Fichier | Rôle |
|---|---|
| `Bienvenue.dc.html` | Page d'accueil, entrée du site |
| `Spa-Beaute.dc.html` | Pôle institut, spa, coiffure, onglerie, barbershop |
| `Gym-Fitness.dc.html` | Pôle salle de sport |
| `Beauty-Shop.dc.html` | Boutique produits capillaires |
| `Fidelite.dc.html` | Carte de fidélité, Pass VIP |
| `A-propos.dc.html` | Présentation de la maison |
| `Contact.dc.html` | Contact et localisation |

`Nav.dc.html`, `Nav-Gym.dc.html`, `Footer.dc.html` et `Footer-Gym.dc.html` sont des
fragments partagés, pas des pages. Les deux jeux de navigation et de pied de page
correspondent aux deux univers, beauté et sport.

Le dossier `a-supprimer/` contient trois anciennes versions conservées par précaution.

---

## Structure technique

HTML, CSS et JavaScript, sans framework ni serveur applicatif. Hébergement visé :
Hostinger, statique.

| Script | Rôle |
|---|---|
| `support.js` | Interprète les composants `<x-dc>` |
| `couche-innova.css` / `couche-innova.js` | Couche de style de maison INNOVA ALPHA |
| `image-slot.js` | Emplacements d'images remplaçables |
| `coverflow.js` | Carrousel |
| `particles.js`, `spa-particles.js`, `fam-dither.js`, `vip-lumiere.js` | Effets visuels |
| `assistant.js` | Assistant de navigation |

La couche de maison vient de `livrables/innova-alpha/style-maison/`. Si elle évolue,
recopier les deux fichiers plutôt que de les modifier ici, pour que tous les projets
restent alignés.

---

## Médias

- `assets/` : 35 fichiers, images de la maquette
- `assets/slots/` : 22 fichiers, emplacements d'images
- `uploads/` : 75 fichiers, envois bruts

Toutes les images se chargent, contrôle effectué sur les 7 pages.

---

## Points relevés, à traiter avant présentation

1. **Le H1 de la page Gym est en anglais** (« Your only limit is you ») alors que le
   site est en français et que la balise `lang` déclare `fr`. À trancher avec le client :
   parti pris assumé, ou incohérence.
2. **La page d'accueil ne contient que 255 caractères de texte.** Elle fonctionne comme
   une page de garde. C'est un choix défendable, mais elle n'apporte aucun signal de
   référencement, alors que c'est la page qui en aurait le plus besoin.
3. **Aucune donnée structurée** sur l'ensemble du site. Pour un établissement local,
   c'est le balisage qui alimente la fiche Google. Voir le standard technique décrit dans
   `livrables/innova-alpha/style-maison/prompt-claude-design.md`.
4. **Aucun mode nuit.** Volontaire : la couche de style n'en pose pas, pour ne pas
   toucher aux couleurs de la maquette.
