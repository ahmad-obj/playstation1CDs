export type ArchiveFilm = { videoId: string; title: string; kind: string; credit: string; src: string; poster: string };

// Archival uploads, not modern remakes. Source URLs and checks: docs/film-sources.md.
const archive = {
  'metal-gear-solid': { videoId: '5SA5VVBb2bU', title: 'Metal Gear Solid — 1998 trailer', kind: 'ARCHIVAL TRAILER', credit: 'Archive upload by Marek Šterbinský' },
  'final-fantasy-vii': { videoId: 'Ru9zzFEdGWk', title: 'Final Fantasy VII — original commercial', kind: 'TV COMMERCIAL', credit: 'Archive upload by ebayismybit0h' },
  'ridge-racer': { videoId: 'PMZ872rsa90', title: 'R4 — opening cinematic', kind: 'OPENING CINEMATIC', credit: 'Archive upload by Thiago' },
  'tekken-3': { videoId: 'LbK8fWyY-c8', title: 'Tekken 3 — PlayStation opening', kind: 'OPENING CINEMATIC', credit: 'Archive upload by SonKitty' },
  'wipeout': { videoId: '-i8AthdHa-k', title: 'Wipeout — 1995 opening', kind: 'OPENING CINEMATIC', credit: 'Archive upload by Gee Tee' },
  'resident-evil-2': { videoId: 'PcDjo_uKeF4', title: 'Resident Evil 2 — 1998 live-action trailer', kind: 'LIVE-ACTION TRAILER', credit: 'Directed by George A. Romero · archival upload' },
  'castlevania-sotn': { videoId: 'v7FYB1-aZQ4', title: 'Castlevania: SOTN — 1997 classic trailer', kind: 'ARCHIVAL TRAILER', credit: 'Archive upload by PlayStation Archive' },
  'silent-hill': { videoId: '_5mZKe40zDA', title: 'Silent Hill — 1999 trailer', kind: 'ARCHIVAL TRAILER', credit: 'Archive upload by Indie Horror Games' },
  'gran-turismo-2': { videoId: 'FSaGqTbzOBw', title: 'Gran Turismo 2 — opening cinematic', kind: 'OPENING CINEMATIC', credit: 'Archive upload by SnazzyAI' },
  'crash-bandicoot': { videoId: 'LCzTI6r63jw', title: 'Crash Bandicoot: Warped — 1998 trailer', kind: 'ARCHIVAL TRAILER', credit: 'Archive upload by Le Bandicoot' },
  'tony-hawk-2': { videoId: 'X-9f5WAcUDs', title: "Tony Hawk's Pro Skater 2 — opening cinematic", kind: 'OPENING CINEMATIC', credit: 'Archive upload by IntroGameOver' },
};

export const films: Record<string, ArchiveFilm> = Object.fromEntries(Object.entries(archive).map(([id, film]) => [id, { ...film, src: `/films/${id}.mp4`, poster: `/films/${id}-poster.webp` }]));
