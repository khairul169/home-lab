export type MediaTags = {
  type: string;
  version: string;
  major: number;
  revision: number;
  flags: Flags;
  size: number;
  tags: Tags;
  picture?: string;
};

export type Flags = {
  unsynchronisation: boolean;
  extended_header: boolean;
  experimental_indicator: boolean;
  footer_present: boolean;
};

export type Tags = {
  title: string;
  artist: string;
  album: string;
  year: string;
  comment: Comment;
  track: string;
  genre: string;
  //   picture: Picture;
  TALB: Talb;
  TPE1: Talb;
  COMM: Comm;
  TCON: Talb;
  TIT2: Talb;
  TRCK: Talb;
  TYER: Talb;
  TXXX: Txxx;
  APIC: APIC;
};

export type APIC = {
  id: string;
  size: number;
  description: string;
  data: Picture;
};

export type Picture = {
  format: string;
  type: string;
  description: string;
  data: number[];
};

export type Comm = {
  id: string;
  size: number;
  description: string;
  data: Comment;
};

export type Comment = {
  language: string;
  short_description: string;
  text: string;
};

export type Talb = {
  id: string;
  size: number;
  description: string;
  data: string;
};

export type Txxx = {
  id: string;
  size: number;
  description: string;
  data: Data;
};

export type Data = {
  user_description: string;
  data: string;
};
