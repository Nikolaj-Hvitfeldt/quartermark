export interface WouldILieImage {
  id: string;
  imageUrl: string;
  description: string; // For host reference - who is in the picture
}

// These are placeholder images - replace with actual images
// Images should be placed in public/images/would-i-lie-images/
export const WOULD_I_LIE_IMAGES: WouldILieImage[] = [
  {
    id: '1',
    imageUrl: '/images/would-i-lie-images/person1.jpg',
    description: 'Person 1 - Celebrity or friend photo',
  },
  {
    id: '2',
    imageUrl: '/images/would-i-lie-images/person2.jpg',
    description: 'Person 2 - Celebrity or friend photo',
  },
  {
    id: '3',
    imageUrl: '/images/would-i-lie-images/person3.jpg',
    description: 'Person 3 - Celebrity or friend photo',
  },
  {
    id: '4',
    imageUrl: '/images/would-i-lie-images/person4.jpg',
    description: 'Person 4 - Celebrity or friend photo',
  },
  {
    id: '5',
    imageUrl: '/images/would-i-lie-images/person5.jpg',
    description: 'Person 5 - Celebrity or friend photo',
  },
];

// Configuration for a Would I Lie round
export interface WouldILieRoundConfig {
  imageId: string;
  imageUrl: string;
  truthTeller: string;  // Player name who actually knows this person
  liar: string;         // Player name who will make up a story
}

