export type StoryType =
  | 'aventura'
  | 'mágica'
  | 'tranquila'
  | 'espacial'
  | 'animales'
  | 'misterio';

export type Gender = 'niño' | 'niña';

export interface UserPreferences {
  name: string;
  age: number;
  gender: Gender;
  interests: string[];
  storyType: StoryType;
  language: string;
}

export interface Story {
  id: string; // Unique identifier for saving
  title: string;
  pages: string[][]; // Array of pages, each page is an array of paragraphs
  fullText: string;
  createdAt: number;
}

export enum AppScreen {
  LANDING = 'LANDING',
  CUSTOMIZATION = 'CUSTOMIZATION',
  GENERATING = 'GENERATING',
  COVER = 'COVER',
  READER = 'READER',
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS',
  LIBRARY = 'LIBRARY'
}

