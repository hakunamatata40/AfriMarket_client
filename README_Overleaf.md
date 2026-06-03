# AfriMarket — Rapport LaTeX
## Instructions de compilation sur Overleaf

### Fichiers à uploader sur Overleaf
1. `rapport_AfriMarket.tex`  — fichier principal
2. `references.bib`          — bibliographie
3. `logos/uigee.png`         — logo UIGEE  ← à ajouter manuellement
4. `logos/keyce.png`         — logo Keyce  ← à ajouter manuellement

---

### Étapes sur Overleaf

1. Créer un nouveau projet vide sur https://overleaf.com
2. Uploader les deux fichiers `.tex` et `.bib`
3. Créer un dossier `logos/` et y uploader les deux images
4. Dans les **Settings** du projet (icône engrenage) :
   - **Compiler** : `pdfLaTeX`
   - **Main document** : `rapport_AfriMarket.tex`
5. Cliquer **Recompile** (2 fois pour les références croisées)

---

### Personnalisation obligatoire avant la soutenance

Dans `rapport_AfriMarket.tex`, rechercher et remplacer :

| Placeholder | Valeur réelle |
|---|---|
| `[Votre Prénom NOM]` | Votre nom complet |
| `[XXXX-XXXXXX]` | Votre matricule |
| `[Licence / Master]` | Votre niveau |
| `[Nom de l'encadreur]` | Nom de votre encadreur |
| `[JJ Mois AAAA]` | Date de soutenance |
| `[Nom]` (jury) | Noms des membres du jury |
| `logos/uigee.png` | Chemin réel du logo UIGEE |
| `logos/keyce.png` | Chemin réel du logo Keyce |

Pour activer les logos, décommenter les lignes `\includegraphics` dans la page de titre.

---

### Ajouter des captures d'écran réelles

Pour insérer une vraie capture d'écran (remplacer une figure TikZ) :

```latex
\begin{figure}[H]
  \centering
  \includegraphics[width=0.4\textwidth]{screenshots/discover_screen.png}
  \caption{Écran Découvrir — application consommateur}
  \label{fig:screen_discover}
\end{figure}
```

Créer un dossier `screenshots/` sur Overleaf et y uploader vos captures.

---

### Structure du document

```
Liminaires (numérotation romaine i, ii, iii...)
  ├── Page de titre
  ├── Remerciements
  ├── Résumé / Abstract
  ├── Liste des figures (auto)
  ├── Liste des tableaux (auto)
  ├── Liste des abréviations (auto)
  └── Glossaire

Corps (numérotation arabe 1, 2, 3...)
  ├── Chapitre 1 — Introduction générale
  ├── Chapitre 2 — Concepts et état de l'art
  ├── Chapitre 3 — Méthodologie
  └── Chapitre 4 — Implémentation et résultats

Fin
  ├── Conclusion générale
  ├── Annexe A — Extraits de code
  ├── Annexe B — Modèle de données
  └── Références bibliographiques (auto)
```

---

### Packages requis (tous disponibles sur Overleaf par défaut)
`inputenc`, `fontenc`, `babel`, `geometry`, `setspace`, `lmodern`,
`microtype`, `csquotes`, `xcolor`, `graphicx`, `tikz`, `pgfplots`,
`booktabs`, `tabularx`, `multirow`, `longtable`, `array`,
`caption`, `subcaption`, `float`, `listings`, `hyperref`,
`biblatex`, `glossaries`, `fancyhdr`, `titlesec`, `enumitem`
