# Datasæt: Pigerne

Personer: **Frederikke, Emily, Nolle, Sofie** (rettes i `src/data/datasets.ts`).

Læg billeder (jpg, png, webp, gif) i mapperne her. Spillet finder dem selv; der skal ikke skrives kode.

| Mappe | Spil | Filnavn |
|---|---|---|
| `would-i-lie/` | Would I Lie to You? | Hvad som helst. Filnavnet vises kun for hosten, når runderne sættes op. |
| `ai-morph/` | Contestant Guess (AI-morph) | Skal **starte med personens navn**, fx `Emily-elsa.jpg`, `Sofie_trump.png` |
| `social-media/` | Social Media Deep Dive | Skal **starte med personens navn**, fx `Nolle1.jpg`, `Frederikke-insta.png` |

Social media kan have et udstreget og et afsløret billede: `Nolle-media-1-before.png` vises, mens der gættes, og `Nolle-media-1-after.png` vises, når svaret afsløres (på TV og telefoner). Så venter hosten med stillingen, til der trykkes "Se stilling".

- Svarmulighederne er de fire navne i tilfældig rækkefølge.
- Rækkefølgen af AI-morph- og social media-billederne blandes tilfældigt, hver gang siden indlæses.
- Et billede, hvis navn ikke starter med en af personerne, springes over (der står en advarsel i browserens konsol).
- Vælg datasættet i hostens lobby under **Spildata**, før du starter spillet.
