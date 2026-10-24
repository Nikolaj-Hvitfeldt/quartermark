/**
 * Game datasets: the people-specific content for Would I Lie, Contestant Guess (AI morphs)
 * and Social Media Guess. The host picks one in the lobby, so the same app can be played
 * with different groups of friends.
 *
 * Folder datasets need no code changes: drop images into
 *   src/datasets/<dataset>/would-i-lie/   any filename
 *   src/datasets/<dataset>/ai-morph/      filename starts with the person's name, e.g. Emily-elsa.jpg
 *   src/datasets/<dataset>/social-media/  filename starts with the person's name, e.g. Sofie1.png
 * and the answers are built from the dataset's `people`.
 */
import { WOULD_I_LIE_IMAGES, WouldILieImage } from './wouldILieImages';
import { CONTESTANT_GUESS_QUESTIONS, ContestantGuessQuestion } from './contestantGuessQuestions';
import { SOCIAL_MEDIA_GUESS_QUESTIONS, SocialMediaGuessQuestion } from './socialMediaGuessQuestions';

export interface GameDataset {
  id: string;
  name: string;
  people: string[];
  wouldILieImages: WouldILieImage[];
  contestantGuessQuestions: ContestantGuessQuestion[];
  socialMediaGuessQuestions: SocialMediaGuessQuestion[];
}

type ImageGlob = Record<string, string>; // file path -> served URL

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const fileName = (path: string) => path.split('/').pop() ?? path;

// Sorted by filename so the list is stable before any shuffling
const sortedEntries = (images: ImageGlob) =>
  Object.entries(images).sort(([a], [b]) => fileName(a).localeCompare(fileName(b), 'da'));

/** The person a picture is about: the longest name the filename starts with (case-insensitive). */
const personFromFileName = (path: string, people: string[]) => {
  const name = fileName(path).toLowerCase();
  return [...people]
    .sort((a, b) => b.length - a.length)
    .find(person => name.startsWith(person.toLowerCase()));
};

/** The correct person plus three others, in random order (the server expects exactly 4). */
const answersFor = (correct: string, people: string[]): [string, string, string, string] => {
  const others = shuffle(people.filter(p => p !== correct)).slice(0, 3);
  return shuffle([correct, ...others]) as [string, string, string, string];
};

// "Nolle-media-1-before.png" + "Nolle-media-1-after.png" make one question: the censored
// image while guessing, the uncensored one once the answer is revealed
const BEFORE_AFTER = /-(before|after)(\.[^.]+)$/i;
const pairKey = (path: string) => fileName(path).replace(BEFORE_AFTER, '').toLowerCase();

// Shuffled so the people are mixed rather than grouped by filename (new order on every reload)
const guessQuestionsFromImages = (images: ImageGlob, people: string[], idPrefix: string) => {
  const revealImages = new Map<string, string>();
  const questionImages: [string, string][] = [];
  for (const [path, url] of sortedEntries(images)) {
    if (fileName(path).match(BEFORE_AFTER)?.[1].toLowerCase() === 'after') revealImages.set(pairKey(path), url);
    else questionImages.push([path, url]);
  }

  return shuffle(questionImages).flatMap(([path, url]) => {
    const person = personFromFileName(path, people);
    if (!person) {
      console.warn(`[datasets] ${fileName(path)} doesn't start with any of: ${people.join(', ')} - skipped`);
      return [];
    }
    const revealImageUrl = revealImages.get(pairKey(path));
    return [{
      id: `${idPrefix}-${fileName(path)}`,
      imageUrl: url,
      ...(revealImageUrl ? { revealImageUrl } : {}),
      answers: answersFor(person, people),
      correctAnswer: person,
    }];
  });
};

/**
 * Would I Lie images named after who knows the person (Emily-person-1.jpg) would otherwise
 * sort into runs of the same truth teller. Take one per person in turn instead; images that
 * don't start with a name go last.
 */
const interleaveByPerson = (entries: [string, string][], people: string[]) => {
  const queues = new Map<string, [string, string][]>();
  const unnamed: [string, string][] = [];
  for (const entry of entries) {
    const person = personFromFileName(entry[0], people);
    if (person) queues.set(person, [...(queues.get(person) ?? []), entry]);
    else unnamed.push(entry);
  }
  const ordered: [string, string][] = [];
  while ([...queues.values()].some(queue => queue.length > 0)) {
    for (const queue of queues.values()) {
      const next = queue.shift();
      if (next) ordered.push(next);
    }
  }
  return [...ordered, ...unnamed];
};

const folderDataset = (
  id: string,
  name: string,
  people: string[],
  images: { wouldILie: ImageGlob; aiMorph: ImageGlob; socialMedia: ImageGlob }
): GameDataset => {
  if (people.length < 4) {
    console.warn(`[datasets] "${name}" needs at least 4 people for the 4 answer options`);
  }
  return {
    id,
    name,
    people,
    wouldILieImages: interleaveByPerson(sortedEntries(images.wouldILie), people).map(([path, url], index) => ({
      id: `${id}-wil-${index + 1}`,
      imageUrl: url,
      description: fileName(path),
    })),
    contestantGuessQuestions: guessQuestionsFromImages(images.aiMorph, people, `${id}-morph`),
    socialMediaGuessQuestions: guessQuestionsFromImages(images.socialMedia, people, `${id}-social`),
  };
};

// import.meta.glob needs literal patterns and options, so each folder dataset spells out its folders

export const DATASETS: GameDataset[] = [
  {
    id: 'original',
    name: 'Original (nytår 2025)',
    people: ['Anders', 'Eline', 'Frederikke', 'Martin', 'Sebastian'],
    wouldILieImages: WOULD_I_LIE_IMAGES,
    contestantGuessQuestions: CONTESTANT_GUESS_QUESTIONS,
    socialMediaGuessQuestions: SOCIAL_MEDIA_GUESS_QUESTIONS,
  },
  folderDataset('pigerne', 'Pigerne', ['Frederikke', 'Emily', 'Nolle', 'Sofie'], {
    wouldILie: import.meta.glob('../datasets/pigerne/would-i-lie/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' }) as ImageGlob,
    aiMorph: import.meta.glob('../datasets/pigerne/ai-morph/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' }) as ImageGlob,
    socialMedia: import.meta.glob('../datasets/pigerne/social-media/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' }) as ImageGlob,
  }),
];

export const DEFAULT_DATASET_ID = 'original';

export const getDataset = (id: string) => DATASETS.find(d => d.id === id) ?? DATASETS[0];
