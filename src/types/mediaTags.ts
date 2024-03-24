export type MediaTags = {
  title: string;
  album: string;
  genre: string;
  year: string;
  trackNumber: string;
  partOfSet: string;
  artist: string;
  performerInfo: string;
  composer: string;
  userDefinedText: UserDefinedText[];
  image: string;
};

export type UserDefinedText = {
  description: string;
  value: string;
};
