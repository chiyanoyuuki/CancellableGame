# 🎲🍺 Donjons & Gorgées — Cahier des charges

> Mode de jeu **RPG de soirée** pour l'app **Cancellable** : un quiz sur les univers
> existants, enrobé d'une couche jeu de rôle (classes, races, stats, dé 20, objets),
> qui relie **culture générale**, **gorgées**, **gages / intimité** et **stratégie**.
>
> Statut : **conception en cours** — les décisions validées sont marquées ✅,
> les propositions à confirmer 🟡, les points ouverts ❓.

---

## 1. Pitch

Chaque joueur incarne un personnage (**Race + Classe**) avec des **stats**, des
**bonus/malus** et une **capacité**. À chaque tour, le joueur actif **cible** un
autre joueur et lui impose un **défi** (question de culture, action ou vérité,
j'ai déjà/jamais, duel). La cible résout le défi avec un **jet de d20 + stat** :
le **1** est une catastrophe, le **20** un sauvetage. Réussir rapporte de l'**XP**
(→ montée de niveau en cours de partie) ; échouer fait **boire** ou déclenche un
**gage**. Plus on boit, plus l'**ivresse** monte et déforme les stats. Le plus
haut niveau en fin de partie l'emporte.

**Principe directeur ✅ :** le téléphone est le **Maître du Jeu**. Il gère tout
(stats, dés, DC, bonus, ivresse, cibles, conséquences, objets). **Zéro calcul
mental** pour les joueurs, même éméchés.

---

## 2. Objectif & fin de partie

- ✅ **Progression = XP + niveaux + jauge d'ivresse.**
- ✅ **Durée réglable** à la config de la partie :
  | Preset | Objectif (proposition 🟡) | Durée indicative |
  |---|---|---|
  | Court | course au **niveau 3** | ~15 min |
  | Normal | course au **niveau 5** | ~30 min |
  | Long | course au **niveau 7** | ~45 min+ |
- Sécurité anti-partie-infinie 🟡 : plafond de manches (ex. 4 tours/joueur) ;
  à l'échéance, **le plus haut niveau (puis XP) gagne**.
- ❓ Égalité : départage par XP, puis par nombre de crits, puis mort subite (1 duel).

---

## 3. Les 6 stats

Modificateurs (proposition 🟡 : de **−2 à +4**). Base 0 ; **Race + Classe** s'ajoutent.

| Stat | Sert à… |
|---|---|
| 🧠 **Savoir** | Questions de culture |
| 😎 **Charisme** | Social, Vérité, séduction / rapprochement |
| 👁️ **Perception** | Gages d'observation, détecter un bluff |
| 🍺 **Descente** | Résister à l'alcool (encaisser des gorgées) |
| 🤸 **Adresse** | Défis physiques / réflexe |
| 🔥 **Audace** | Oser un gage gênant, bluffer |

---

## 4. Résolution d'une action

- ✅ Formule : **`d20 + stat concernée ≥ DC`** (seuil de difficulté).
- Échelle de DC 🟡 : facile **8** · moyen **12** · difficile **15** · corsé **18**.
  Une **question de culture** fixe son DC selon sa difficulté (d1→10, d2→13,
  d3→15, d4→17).
- ✅ **Savoir & dé** : **bonne réponse = avantage** (2 d20, on garde le meilleur) ;
  **mauvaise réponse = tentative au désavantage** (2 d20, on garde le pire — le
  « bluff » peut passer sur un gros jet).
- ✅ **1 naturel = échec critique** (pire conséquence : gage corsé + gorgée).
- ✅ **20 naturel = réussite critique** (loot d'objet + option : **refiler
  l'action à l'attaquant**).

---

## 5. Les types de défi (« cartes »)

✅ Le joueur actif **choisit la cible ET le type de défi**.

| Carte | Contenu | Stat testée |
|---|---|---|
| 📚 **Question** | Quiz sur un univers dispo (au choix de l'actif) | 🧠 Savoir |
| 🎭 **Action ou Vérité** | La cible tire *Action* (gage) ou *Vérité* (question perso) | 🔥 Audace (Action) / 😎 Charisme (Vérité) |
| 🙊 **J'ai déjà / jamais** | Une affirmation ; avouer avec panache ou bluffer | 😎 Charisme / 🔥 Audace |
| ⚔️ **Duel** | Actif vs cible, **jets opposés** sur une stat commune | stat du duel |

✅ **Les 4 cartes ci-dessus sont retenues pour le v1.**

🟡 Extensions ultérieures : carte **Tu préfères ?** (la table vote, la cible doit
deviner la majorité → Perception), carte **Défi d'équipe**.

---

## 6. Conséquences

✅ **Mix gorgée + gage selon l'ampleur de l'échec :**

| Résultat | Conséquence (proposition 🟡) |
|---|---|
| Réussite (≥ DC) | **+XP**, parfois renvoyer une gorgée à l'attaquant |
| Réussite critique (20) | +XP max, **loot**, refiler l'action à l'attaquant |
| Échec de peu (DC−1 à DC−4) | **1 gorgée** |
| Échec franc (≤ DC−5) | **2 gorgées OU un gage** |
| Échec critique (1) | le **pire** : gage corsé + gorgée (+ malus éventuel) |

- Les **gages** puisent dans les banques existantes (voir §11), au **niveau
  Cancellable** choisi à la config (Chill → ☠️), y compris les gages de
  **rapprochement** (câlins, bisous…).
- ✅ **Mode sans alcool** : les gorgées deviennent des **gages soft** / points de
  pénalité (l'app le gère déjà via `isNoAlcohol`).

---

## 7. Mécanique d'ivresse ✅

- Jauge d'ivresse par joueur = gorgées cumulées.
- **Chaque palier de 3 gorgées** (proposition 🟡) → **+1 Audace, +1 Charisme,
  −1 Perception, −1 Savoir** (cumulatif).
- → Sobre = lucide et bon au quiz ; bourré = culotté et bon aux gages/social,
  mais nul en questions. Crée des **retournements** en fin de partie.
- L'**eau** / l'objet **Antidote** fait redescendre d'un palier.
- ❓ Palier « blackout » (ex. 12+) : gros malus global ? saut de tour ? (à trancher —
  attention à ne pas punir jusqu'à l'ennui).

---

## 8. XP, niveaux, montée en puissance

- Gains 🟡 : réussite **+10** · crit **+20** · échec courageux **+3** · gage
  accompli **+5**.
- **Niveau +1 tous les 30 XP** (proposition 🟡) : le joueur choisit **+1 à une
  stat**. Aux **niveaux 3 et 5**, sa **capacité de classe s'améliore**.
- Fin : selon le preset de durée (§2).

---

## 9. Races (chacune « possède » une stat) 🟡

| Race | Forces | Faiblesse | Trait |
|---|---|---|---|
| 🧔 Nain | Descente +2, Audace +1 | Charisme −1 | **Estomac de fer** : la 1re gorgée de chaque tour ne compte pas dans son ivresse |
| 🧝 Elfe | Perception +2, Savoir +1 | Descente −1 | **Œil de lynx** : avantage sur tous les gages d'observation |
| 🧌 Orc | Adresse +2, Audace +1 | Savoir −2 | **Berserk** : relance un jet de défi physique/action par manche |
| 🧛 Vampire | Charisme +2, Perception +1 | Descente −1 | **Charme** : 1×/partie, force une Vérité sans jet |
| 🔬 Gnome | Savoir +2, Perception +1 | Adresse −1 | **Érudit** : avantage sur un univers de quiz au choix |
| 😈 Diablotin | Audace +2, Charisme +1 | Perception −1 | **Provocateur** : les échecs de ses cibles sont aggravés d'un cran |

✅ **Décidé : pas de 7ᵉ race.** On garde 6 races bien typées (une stat chacune).

---

## 10. Classes (rôle + capacité signature) 🟡

✅ **Capacités à coût** : réutilisables, mais chaque activation se paie **1 gorgée**
par défaut (ou de l'ivresse / un objet).

| Classe | Rôle | Lean | Capacité (à coût) |
|---|---|---|---|
| 🎵 Barde | Soutien | Charisme | **Sérénade** : prendre un défi à la place d'un allié, ou lui donner l'avantage |
| 🛡️ Guerrier | Tank | Descente | **Provocation** : encaisser une conséquence à la place d'un autre, réduite d'un cran |
| 🗡️ Voleur | Saboteur | Adresse | **Sabotage** : désavantage au prochain jet d'une cible, ou lui voler un objet |
| 🔮 Mage | Cerveau | Savoir | **Illumination** : transformer une question en QCM facilité / révéler un indice |
| ⛪ Prêtre | Soigneur | Perception | **Bénédiction** : annuler une gorgée/gage, ou baisser l'ivresse d'un allié |
| 🏹 Rôdeur | Dégâts | Audace | **Visée** : rendre le défi d'une cible plus dur (+DC), ou doubler la casse sur un 1 |

**36 combos Race × Classe**, avec synergies : Nain Guerrier (tank alcoolo), Gnome
Mage (machine à quiz), Vampire Barde (manipulateur), Elfe Rôdeur (sniper de gages),
Diablotin Voleur (chaos)…

- ✅ **Tirage aléatoire** Race + Classe disponible (démarrage rapide / chaos).
- ✅ **Doublons de classe autorisés** : chacun choisit librement (deux Voleurs possibles).

---

## 11. Objets 🟡

Gagnés sur les **20 naturels** et certains **gages** ; à usage unique.

| Objet | Effet |
|---|---|
| 🛡️ Bouclier | Annule une conséquence (gorgée/gage) |
| 🔮 Miroir | Renvoie le défi à l'attaquant |
| 🧪 Potion | Avantage à ton prochain jet |
| 🎲 Dé pipé | Relance un jet |
| 💧 Antidote | −1 palier d'ivresse |

❓ Inventaire limité (ex. 3 objets max) ? Objets échangeables/volables ?

---

## 12. Déroulé d'un tour

1. **App → joueur actif** : « Choisis une cible ».
2. **Actif** : choisit une cible + une **carte** (§5) (+ précise l'univers pour une Question).
3. **App** : génère le contenu (question / gage / affirmation…).
4. **Cible** : peut **répondre/tenter**, **dépenser un objet** (bouclier, miroir,
   potion), ou **activer sa capacité** si pertinent (paie le coût).
5. **Jet** : `d20 + stat` (avantage/désavantage selon réponse), l'app calcule.
6. **Conséquence** appliquée (§6) + gains d'XP/ivresse/objets mis à jour.
7. ✅ **Rotation simple** : le tour passe au **joueur suivant dans l'ordre**
   (chacun attaque autant).

---

## 13. Réutilisation du contenu existant (atout majeur ✅)

Le mode est une **couche par-dessus le contenu déjà en place** :
- **Quiz** multi-univers (`src/games/quiz/questions/…`) → carte 📚 Question, avec
  filtrage par univers et par **niveaux Cancellable**.
- **Gages** (`src/core/dares.ts`, soft/alcool + rapprochement) → cartes 🎭 Action,
  conséquences, objets.
- **Dilemmes** « Tu préfères ? » (`src/games/tupreferes/dilemmas.ts`) → carte
  optionnelle Tu préfères.
- **Affirmations** « Qui de nous / J'ai jamais » (`src/games/quidenous/prompts.ts`)
  → carte 🙊 J'ai déjà/jamais.
- Le **dosage 70/10/10/10** et le suivi « déjà vu » restent applicables.

---

## 14. Contraintes techniques

- ✅ Tout automatisé par l'app (MJ numérique) ; UI lisible en soirée (gros
  boutons, feedback haptique/sonore déjà dispos).
- Moteur **pur et testé** (comme les autres modes : un fichier `…Engine.ts` +
  tests Jest), séparé de l'UI React Native.
- Respecte le **mode sans alcool**, les **niveaux Cancellable** et le **gate
  d'achat** (le pack Cancellable conditionne l'accès aux gages/questions 2-3-4).
- ❓ Nombre de joueurs : min 3 ? max ? (les cibles et duels supposent ≥ 3).

---

## 15. Points ouverts à trancher (prochaines itérations)

1. **Blackout** d'ivresse : effet exact (ou pas de palier punitif) ?
2. **Inventaire** : taille max, vol/échange d'objets ?
3. Équilibrage chiffré (mods, DC, XP, paliers) — à **caler aux tests**.
4. Détail des **capacités améliorées** aux niveaux 3 et 5.
5. Ajustements de flavor **races/classes** (noms, capacités) selon tes retours.

---

## 16. Découpage de développement — avancement

- **Phase 0** ✅ — Cahier des charges validé.
- **Phase 1** ✅ — Moteur pur (`src/core/donjonsEngine.ts`) : stats, races/classes,
  jet d20 + DC (avantage/crit/fumble), ivresse, conséquences, XP/niveaux, boucle de
  tour, duel, fin de partie. **29 tests**.
- **Phase 2** ✅ — Adaptateur de contenu (`src/games/donjons/content.ts`) + banques
  Vérités et J'ai jamais. Branche quiz (univers + niveaux) et gages. **12 tests**.
- **Phase 3** ✅ — UI (Config + Play + création de perso + boucle de tour) et
  enregistrement du mode. *À valider sur appareil (l'UI RN n'est pas couverte par Jest).*
- **Phase 4** ✅ (câblée) — **Traits passifs** (avantage Elfe/Gnome), système
  **buff/débuff + bouclier**, **objets** utilisables (potion, dé pipé, bouclier,
  antidote, miroir), **capacités de classe** à coût, **traits activés** (Charme
  Vampire, Berserk Orc), **résultat de duel** et **badge d'ivresse** affichés.
  Moteur **testé** (42 tests au total). UI branchée (section « Coups de pouce »).
- **Phase 5** ✅ (en grande partie) — polish : **jet de dé animé**, **blackout**
  d'ivresse (au-delà de 4 paliers, tous les jets passent en désavantage, testé),
  et flux **résultat → montée de niveau** revu (le résultat du jet reste visible,
  la montée de niveau se fait ensuite sans masquer le tirage).
  Reste : ciblage plus souple des capacités de soutien (Barde/Prêtre sur
  n'importe quel allié) et l'**équilibrage** chiffré en playtest réel.

### État « moteur vs UI » (transparence)
Câblé de bout en bout **et** dans l'UI : stats, d20, DC, avantage si bonne réponse,
crit/fumble, conséquences (gorgée/gage/XP), ivresse dynamique (+ badge), montée de
niveau, classement, mode sans alcool, **tous les traits de race** (Nain, Elfe, Orc,
Vampire, Gnome, Diablotin), **capacités de classe** (à coût), **objets**, **duel**
(vainqueur/perdant). Reste surtout du **polish visuel** et l'équilibrage en test réel.

---

*Document vivant — on continue à l'affiner ensemble jusqu'à validation complète.*
