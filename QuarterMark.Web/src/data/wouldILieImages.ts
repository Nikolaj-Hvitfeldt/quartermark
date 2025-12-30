export interface WouldILieImage {
  id: string;
  imageUrl: string;
  description: string; // For host reference - who is in the picture
}

// Images should be placed in public/images/would-i-lie-images/
export const WOULD_I_LIE_IMAGES: WouldILieImage[] = [
  {
    id: '1',
    imageUrl: '/images/would-i-lie-images/person9.jpg',
    description: 'Person 1',
  },
  {
    id: '2',
    imageUrl: '/images/would-i-lie-images/person3.jpg',
    description: 'Person 2',
  },
  {
    id: '3',
    imageUrl: '/images/would-i-lie-images/person10.jpg',
    description: 'Person 3',
  },
  {
    id: '4',
    imageUrl: '/images/would-i-lie-images/person1.jpg',
    description: 'Person 4',
  },
  {
    id: '5',
    imageUrl: '/images/would-i-lie-images/person7.jpg',
    description: 'Person 5',
  },
  {
    id: '6',
    imageUrl: '/images/would-i-lie-images/person4.jpg',
    description: 'Person 6',
  },
  {
    id: '7',
    imageUrl: '/images/would-i-lie-images/person8.jpg',
    description: 'Person 7',
  },
  {
    id: '8',
    imageUrl: '/images/would-i-lie-images/person2.jpg',
    description: 'Person 8',
  },
  {
    id: '9',
    imageUrl: '/images/would-i-lie-images/person7.jpg',
    description: 'Person 9',
  },
  {
    id: '10',
    imageUrl: '/images/would-i-lie-images/person8.jpg',
    description: 'Person 10',
  },
];

// Configuration for a Would I Lie round
export interface WouldILieRoundConfig {
  imageId: string;
  imageUrl: string;
  truthTeller: string;  // Player name who actually knows this person
  liar: string;         // Player name who will make up a story
}

