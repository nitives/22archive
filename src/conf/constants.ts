export const APP = {
  NAME: "22archive",
  DESCRIPTION: "an unofficial 2hollis archive.",
  AUTHOR: {
    NAME: "nitves",
    GITHUB: "nitives",
    TWITTER: "@nitives",
    EMAIL: "nite@superlist.cc",
  },
};

const KEYWORDS = [
  "2hollis",
  "archive",
  "white tiger",
  "unreleased",
  "unreleased 2hollis",
  "leaks",
  "unreleased songs",
  "discography",
  "all songs",
  "hyperpop",
  "music archive",
  "deleted songs",
  "rarities",
  "demos",
  "chainmail",
  "qiyoku",
  "the jarl",
  "boy album",
  "star album",
  "engineboye",
  "live performances",
  "music videos",
  "underground music",
  "glitchcore",
  "trance music",
];

export const SEO = {
  KEYWORDS: genKeywords({ keywords: KEYWORDS }),
};

function genKeywords({ keywords }: { keywords: string[] }): string[] {
  const newKws = keywords.map((kw) => `2hollis ${kw}`);
  return [...keywords, ...newKws];
}
