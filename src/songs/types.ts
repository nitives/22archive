export type Song = {
  id: string;
  title: string;
  artist: string;
  producer?: Producer[];
  era?: string;
  year?: number;
  coverUrl?: string;
  source?: Source;
  status: "draft" | "published" | "archived";
};

export type Producer = {
  name: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    soundcloud?: string;
  };
};

export type Source = {
  name: string;
  url: string;
  platform?:
    | "SoundCloud"
    | "YouTube"
    | "Bandcamp"
    | "Spotify"
    | "AppleMusic"
    | "Other";
  description?: string;
};
