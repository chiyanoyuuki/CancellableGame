# 🎧 Extraits audio du blind test

Déposez ici vos extraits `.mp3` (intros de chansons, génériques de séries/jeux…
courts, ~10–20 s), puis référencez-les dans `src/games/quiz/questions/blindtest.ts` :

```ts
{
  id: 'blind-mario',
  theme: 'blindtest',
  difficulty: 2,
  text: 'Quel jeu vidéo ? (écoute le thème)',
  answer: 'Super Mario Bros.',
  distractors: ['Zelda', 'Sonic', 'Tetris'],
  media: { type: 'audio', module: require('../../../../assets/audio/mario.mp3') },
},
```

- `module: require(...)` → l'extrait est **embarqué** dans l'APK : il marche
  **hors-ligne** et de façon fiable (recommandé pour une soirée).
- `uri: 'https://.../extrait.mp3'` → extrait **distant** (nécessite une connexion).

⚠️ N'utilisez que des extraits dont vous avez le droit de vous servir.
