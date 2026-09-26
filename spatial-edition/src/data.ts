export interface Game {
  id: string;
  title: string;
  short: string;
  year: string;
  developer: string;
  genre: string;
  serial: string;
  region: string;
  color: string;
  quote: string;
  description: string;
  memory: string;
}

export const games: Game[] = [
  {
    id: 'final-fantasy-vii', title: 'Final Fantasy VII', short: 'Final Fantasy VII', year: '1997',
    developer: 'Square', genre: 'Role-playing', serial: 'SCES-00900', region: 'PAL', color: '#a8c0ae',
    quote: 'A world worth\nsaving.',
    description: 'A mercenary, a city running on borrowed life, and a journey far beyond its steel walls. Final Fantasy VII made the role-playing epic feel impossibly big — and unexpectedly personal.',
    memory: 'Three discs. One story that never really left us.',
  },
  {
    id: 'metal-gear-solid', title: 'Metal Gear Solid', short: 'Metal Gear Solid', year: '1998',
    developer: 'Konami', genre: 'Tactical espionage', serial: 'SLPM-86114', region: 'NTSC-J', color: '#b1bdab',
    quote: 'Some things\nstay with you.',
    description: 'Footsteps in the snow. A voice in your ear. One soldier against the secrets of Shadow Moses. Hideo Kojima’s stealth landmark turned a game into a conversation with the person holding the controller.',
    memory: 'The moment a game knew you were on the other side of the screen.',
  },
  {
    id: 'ridge-racer', title: 'R4: Ridge Racer Type 4', short: 'Ridge Racer Type 4', year: '1998',
    developer: 'Namco', genre: 'Arcade racing', serial: 'SLUS-00797', region: 'NTSC-U/C', color: '#ead581',
    quote: 'One more\nperfect lap.',
    description: 'Golden-hour circuits, long drifting corners, and a soundtrack that made every race feel like a late-night drive. R4 found something beautiful in the space between speed and style.',
    memory: 'That first corner. That bassline. That impossible sunset.',
  },
  {
    id: 'tekken-3', title: 'Tekken 3', short: 'Tekken 3', year: '1998',
    developer: 'Namco', genre: 'Fighting', serial: 'SLUS-00402', region: 'NTSC-U/C', color: '#c4a5a0',
    quote: 'Settle it\non the sofa.',
    description: 'New challengers. A third dimension. And a moveset you could spend a lifetime learning. Tekken 3 brought the arcade home, one last round and one borrowed controller at a time.',
    memory: 'The best rival was always sitting right next to you.',
  },
  {
    id: 'wipeout', title: 'WipEout', short: 'WipEout', year: '1995',
    developer: 'Psygnosis', genre: 'Anti-gravity racing', serial: 'SCUS-94301', region: 'NTSC-U/C', color: '#b2bad0',
    quote: 'The future\nhad a sound.',
    description: 'Anti-gravity racing at the intersection of club culture and graphic design. WipEout’s electronic pulse and razor-sharp identity made the PlayStation feel like a glimpse of tomorrow.',
    memory: 'A generation found its frequency at 300 kilometres an hour.',
  },
  {
    id: 'resident-evil-2', title: 'Resident Evil 2', short: 'Resident Evil 2', year: '1998',
    developer: 'Capcom', genre: 'Survival horror', serial: 'SLUS-00421', region: 'NTSC-U/C', color: '#b3b9aa',
    quote: 'Leave the\nlights on.',
    description: 'Two strangers. One city at the end of the world. Resident Evil 2 made every locked door a question, every last bullet a decision, and every typewriter a small moment of relief.',
    memory: 'You can still hear the sound of that opening door.',
  },
  {
    id: 'castlevania-sotn', title: 'Castlevania: Symphony of the Night', short: 'Symphony of the Night', year: '1997',
    developer: 'Konami', genre: 'Action-adventure', serial: 'SLUS-00067', region: 'NTSC-U/C', color: '#c4a882',
    quote: 'What is a man?\nA miserable little pile of secrets.',
    description: 'An inverted castle suspended between nightmare and grace. Michiru Yamane’s baroque score and Ayami Kojima’s sumptuous gothic art redefined exploration for a generation.',
    memory: 'The moment the castle turned upside down.',
  },
  {
    id: 'silent-hill', title: 'Silent Hill', short: 'Silent Hill', year: '1999',
    developer: 'Konami', genre: 'Psychological horror', serial: 'SLUS-00707', region: 'NTSC-U/C', color: '#9a8c82',
    quote: 'The fear of blood\ntends to create fear for the flesh.',
    description: 'A dense fog of falling ash, a broken radio crackling in the darkness, and an industrial nightmare where sirens tear through the silence. Team Silent turned hardware limits into pure psychological dread.',
    memory: 'Running down that darkening alley until the siren begins.',
  },
  {
    id: 'gran-turismo-2', title: 'Gran Turismo 2', short: 'Gran Turismo 2', year: '1999',
    developer: 'Polyphony Digital', genre: 'Simulation racing', serial: 'SCUS-94455', region: 'NTSC-U/C', color: '#7d91a8',
    quote: 'The real driving\nsimulator.',
    description: 'Over six hundred cars, authentic physics simulation, and late nights tuning gear ratios on test tracks. Gran Turismo 2 turned a love for automobiles into an obsession with precision.',
    memory: 'Saving every credit for that first used Skyline GT-R.',
  },
  {
    id: 'crash-bandicoot', title: 'Crash Bandicoot: Warped', short: 'Crash Bandicoot: Warped', year: '1998',
    developer: 'Naughty Dog', genre: 'Platformer', serial: 'SCUS-94244', region: 'NTSC-U/C', color: '#d49258',
    quote: 'Hold onto\nyour pants.',
    description: 'Time-twisting portals, tiger rides along the Great Wall, and precision platforming pushed to the brink of cartoon perfection. Naughty Dog squeezed every ounce of power out of the grey box.',
    memory: 'The frantic dash toward the camera from a giant rolling boulder.',
  },
  {
    id: 'tony-hawk-2', title: "Tony Hawk's Pro Skater 2", short: 'Pro Skater 2', year: '2000',
    developer: 'Neversoft', genre: 'Extreme sports', serial: 'SLUS-01066', region: 'NTSC-U/C', color: '#879199',
    quote: 'One more manual\nto connect the combo.',
    description: 'The manual changed everything. Linking vert airs, street grinds, and impossible gaps across the Hangar and School II to a blistering skate-punk soundtrack that defined an era.',
    memory: 'Landing that million-point combo as the timer ran down to zero.',
  },
];

export const discPath = (game: Game) => `/discs/${game.id}.webp`;
export const wrap = (value: number, length = games.length) => ((value % length) + length) % length;
export const number = (value: number) => String(value + 1).padStart(2, '0');
