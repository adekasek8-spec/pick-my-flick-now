export type Mood =
  | "Happy"
  | "Sad"
  | "Calm"
  | "Motivated"
  | "Action"
  | "Romantic"
  | "Scary"
  | "Anime";

export interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  moods: Mood[];
  rating: number;
  year: number;
  trailerUrl: string;
  keywords: string[];
  reason?: string;
  score?: number;
}

export const MOODS: { name: Mood; emoji: string }[] = [
  { name: "Happy", emoji: "😊" },
  { name: "Sad", emoji: "😢" },
  { name: "Calm", emoji: "🌿" },
  { name: "Motivated", emoji: "🔥" },
  { name: "Action", emoji: "💥" },
  { name: "Romantic", emoji: "💖" },
  { name: "Scary", emoji: "👻" },
  { name: "Anime", emoji: "🌸" },
];

export const MOVIES: Movie[] = [
  // Happy
  { id: "1", title: "Paddington 2", genre: "Comedy / Family", description: "A charming bear spreads kindness across London while clearing his name.", moods: ["Happy", "Calm"], rating: 8.2, year: 2017, trailerUrl: "https://www.youtube.com/results?search_query=Paddington+2+trailer", keywords: ["comedy", "family", "feelgood"] },
  { id: "2", title: "The Grand Budapest Hotel", genre: "Comedy / Adventure", description: "A legendary concierge and his protégé get tangled in a wild caper.", moods: ["Happy"], rating: 8.1, year: 2014, trailerUrl: "https://www.youtube.com/results?search_query=Grand+Budapest+Hotel+trailer", keywords: ["wes anderson", "quirky", "comedy"] },
  { id: "3", title: "La La Land", genre: "Musical / Romance", description: "Two dreamers chase love and ambition across a dazzling Los Angeles.", moods: ["Happy", "Romantic"], rating: 8.0, year: 2016, trailerUrl: "https://www.youtube.com/results?search_query=La+La+Land+trailer", keywords: ["musical", "romance", "dreams"] },

  // Sad
  { id: "4", title: "Hachi: A Dog's Tale", genre: "Drama", description: "A loyal dog waits every day at the train station for his beloved owner.", moods: ["Sad"], rating: 8.1, year: 2009, trailerUrl: "https://www.youtube.com/results?search_query=Hachi+A+Dogs+Tale+trailer", keywords: ["dog", "emotional", "drama", "hachiko"] },
  { id: "5", title: "Marley & Me", genre: "Drama / Comedy", description: "A family grows up alongside their wildly mischievous yellow lab.", moods: ["Sad", "Happy"], rating: 7.1, year: 2008, trailerUrl: "https://www.youtube.com/results?search_query=Marley+and+Me+trailer", keywords: ["dog", "family", "emotional"] },
  { id: "6", title: "The Pursuit of Happyness", genre: "Drama", description: "A struggling father fights homelessness to build a future for his son.", moods: ["Sad", "Motivated"], rating: 8.0, year: 2006, trailerUrl: "https://www.youtube.com/results?search_query=Pursuit+of+Happyness+trailer", keywords: ["drama", "inspiring", "father", "emotional"] },

  // Calm
  { id: "7", title: "My Neighbor Totoro", genre: "Anime / Family", description: "Two sisters discover magical forest spirits in the Japanese countryside.", moods: ["Calm", "Anime", "Happy"], rating: 8.2, year: 1988, trailerUrl: "https://www.youtube.com/results?search_query=My+Neighbor+Totoro+trailer", keywords: ["ghibli", "anime", "calm", "magical"] },
  { id: "8", title: "Before Sunrise", genre: "Romance / Drama", description: "Two strangers spend one unforgettable night walking through Vienna.", moods: ["Calm", "Romantic"], rating: 8.1, year: 1995, trailerUrl: "https://www.youtube.com/results?search_query=Before+Sunrise+trailer", keywords: ["romance", "talk", "slow"] },

  // Motivated
  { id: "9", title: "Whiplash", genre: "Drama / Music", description: "A young drummer is pushed to his limits by a ruthless music instructor.", moods: ["Motivated"], rating: 8.5, year: 2014, trailerUrl: "https://www.youtube.com/results?search_query=Whiplash+trailer", keywords: ["music", "intense", "drive"] },
  { id: "10", title: "Rocky", genre: "Sports / Drama", description: "A small-time boxer gets the chance of a lifetime to fight the champion.", moods: ["Motivated"], rating: 8.1, year: 1976, trailerUrl: "https://www.youtube.com/results?search_query=Rocky+trailer", keywords: ["boxing", "inspiring", "sports"] },
  { id: "11", title: "The Social Network", genre: "Drama / Biography", description: "The sharp, brutal rise of Facebook and the friendships left behind.", moods: ["Motivated"], rating: 7.8, year: 2010, trailerUrl: "https://www.youtube.com/results?search_query=Social+Network+trailer", keywords: ["tech", "ambition", "drama"] },

  // Action
  { id: "12", title: "Spider-Man: Into the Spider-Verse", genre: "Animation / Action", description: "Miles Morales joins a multiverse of Spider-people to save reality.", moods: ["Action", "Happy"], rating: 8.4, year: 2018, trailerUrl: "https://www.youtube.com/results?search_query=Spider+Man+Into+the+Spider+Verse+trailer", keywords: ["spiderman", "superhero", "action", "marvel"] },
  { id: "13", title: "Mad Max: Fury Road", genre: "Action / Sci-Fi", description: "A relentless chase across a post-apocalyptic wasteland.", moods: ["Action"], rating: 8.1, year: 2015, trailerUrl: "https://www.youtube.com/results?search_query=Mad+Max+Fury+Road+trailer", keywords: ["action", "chase", "post-apocalyptic"] },
  { id: "14", title: "The Dark Knight", genre: "Action / Crime", description: "Batman faces the Joker in a battle for Gotham's soul.", moods: ["Action"], rating: 9.0, year: 2008, trailerUrl: "https://www.youtube.com/results?search_query=Dark+Knight+trailer", keywords: ["batman", "superhero", "action", "crime"] },
  { id: "15", title: "John Wick", genre: "Action / Thriller", description: "A retired hitman returns for one last bloody mission of revenge.", moods: ["Action"], rating: 7.4, year: 2014, trailerUrl: "https://www.youtube.com/results?search_query=John+Wick+trailer", keywords: ["action", "revenge", "thriller"] },

  // Romantic
  { id: "16", title: "Pride & Prejudice", genre: "Romance / Drama", description: "Elizabeth Bennet matches wits and hearts with the brooding Mr. Darcy.", moods: ["Romantic"], rating: 7.8, year: 2005, trailerUrl: "https://www.youtube.com/results?search_query=Pride+and+Prejudice+2005+trailer", keywords: ["romance", "classic", "period"] },
  { id: "17", title: "The Notebook", genre: "Romance / Drama", description: "A summer love story echoes across decades of devotion.", moods: ["Romantic", "Sad"], rating: 7.8, year: 2004, trailerUrl: "https://www.youtube.com/results?search_query=The+Notebook+trailer", keywords: ["romance", "emotional"] },

  // Scary
  { id: "18", title: "Hereditary", genre: "Horror", description: "A family's dark inheritance unravels in nightmarish ways.", moods: ["Scary"], rating: 7.3, year: 2018, trailerUrl: "https://www.youtube.com/results?search_query=Hereditary+trailer", keywords: ["horror", "dark", "scary"] },
  { id: "19", title: "Get Out", genre: "Horror / Thriller", description: "A weekend meeting the girlfriend's family turns into a waking nightmare.", moods: ["Scary"], rating: 7.7, year: 2017, trailerUrl: "https://www.youtube.com/results?search_query=Get+Out+trailer", keywords: ["horror", "thriller", "twist"] },
  { id: "20", title: "The Conjuring", genre: "Horror", description: "Paranormal investigators face a malevolent presence haunting a family.", moods: ["Scary"], rating: 7.5, year: 2013, trailerUrl: "https://www.youtube.com/results?search_query=Conjuring+trailer", keywords: ["horror", "ghost", "supernatural"] },

  // Anime
  { id: "21", title: "Your Name", genre: "Anime / Romance", description: "Two teenagers mysteriously swap lives across time and space.", moods: ["Anime", "Romantic"], rating: 8.4, year: 2016, trailerUrl: "https://www.youtube.com/results?search_query=Your+Name+trailer", keywords: ["anime", "romance", "fantasy"] },
  { id: "22", title: "Spirited Away", genre: "Anime / Fantasy", description: "A girl enters a magical spirit world to save her parents.", moods: ["Anime", "Calm"], rating: 8.6, year: 2001, trailerUrl: "https://www.youtube.com/results?search_query=Spirited+Away+trailer", keywords: ["ghibli", "anime", "fantasy"] },
  { id: "23", title: "Demon Slayer: Mugen Train", genre: "Anime / Action", description: "Tanjiro and friends battle a demon aboard a doomed train.", moods: ["Anime", "Action"], rating: 8.2, year: 2020, trailerUrl: "https://www.youtube.com/results?search_query=Demon+Slayer+Mugen+Train+trailer", keywords: ["anime", "action", "shounen"] },
  { id: "24", title: "A Silent Voice", genre: "Anime / Drama", description: "A former bully seeks redemption with the deaf classmate he hurt.", moods: ["Anime", "Sad"], rating: 8.1, year: 2016, trailerUrl: "https://www.youtube.com/results?search_query=A+Silent+Voice+trailer", keywords: ["anime", "emotional", "drama"] },

  // Sci-fi / extras
  { id: "25", title: "Interstellar", genre: "Sci-Fi / Drama", description: "A team of explorers travel through a wormhole to save humanity.", moods: ["Motivated", "Sad"], rating: 8.7, year: 2014, trailerUrl: "https://www.youtube.com/results?search_query=Interstellar+trailer", keywords: ["space", "sci-fi", "interstellar", "nolan"] },
  { id: "26", title: "Arrival", genre: "Sci-Fi / Drama", description: "A linguist must communicate with mysterious alien visitors.", moods: ["Calm", "Sad"], rating: 7.9, year: 2016, trailerUrl: "https://www.youtube.com/results?search_query=Arrival+trailer", keywords: ["sci-fi", "space", "aliens"] },
  { id: "27", title: "Gravity", genre: "Sci-Fi / Thriller", description: "A stranded astronaut fights to survive after disaster strikes in orbit.", moods: ["Action"], rating: 7.7, year: 2013, trailerUrl: "https://www.youtube.com/results?search_query=Gravity+trailer", keywords: ["space", "sci-fi", "survival"] },
  { id: "28", title: "The Martian", genre: "Sci-Fi / Adventure", description: "An astronaut stranded on Mars uses science to survive.", moods: ["Motivated"], rating: 8.0, year: 2015, trailerUrl: "https://www.youtube.com/results?search_query=The+Martian+trailer", keywords: ["space", "sci-fi", "survival"] },

  // Superhero extras for spider-man-style searches
  { id: "29", title: "The Avengers", genre: "Action / Superhero", description: "Earth's mightiest heroes assemble to stop a global threat.", moods: ["Action"], rating: 8.0, year: 2012, trailerUrl: "https://www.youtube.com/results?search_query=Avengers+trailer", keywords: ["marvel", "superhero", "action"] },
  { id: "30", title: "Guardians of the Galaxy", genre: "Action / Sci-Fi", description: "A ragtag crew of misfits save the galaxy with attitude and a great mixtape.", moods: ["Action", "Happy"], rating: 8.0, year: 2014, trailerUrl: "https://www.youtube.com/results?search_query=Guardians+of+the+Galaxy+trailer", keywords: ["marvel", "superhero", "space", "action"] },
];

// Hints: words a user might type that map to a mood in our catalog
const MOOD_HINTS: Record<string, Mood> = {
  funny: "Happy", comedy: "Happy", happy: "Happy", feelgood: "Happy",
  sad: "Sad", emotional: "Sad", cry: "Sad", drama: "Sad",
  calm: "Calm", chill: "Calm", relaxing: "Calm", slow: "Calm",
  motivated: "Motivated", inspiring: "Motivated", inspirational: "Motivated", sport: "Motivated", sports: "Motivated",
  action: "Action", fight: "Action", war: "Action", thriller: "Action", hero: "Action", superhero: "Action",
  romance: "Romantic", romantic: "Romantic", love: "Romantic",
  scary: "Scary", horror: "Scary", ghost: "Scary", creepy: "Scary",
  anime: "Anime", ghibli: "Anime", japanese: "Anime",
};

// Naive similarity: shared keywords, genre overlap, and shared moods
export function findSimilar(query: string, limit = 6): Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const target = MOVIES.find(
    (m) => m.title.toLowerCase() === q || m.title.toLowerCase().includes(q),
  );

  const tokens = q.split(/\s+/).filter(Boolean);
  const baseKeywords = target ? target.keywords : tokens;
  const baseGenres = target ? target.genre.toLowerCase().split(/[\s/]+/) : tokens;
  const baseMoods: Mood[] = target
    ? target.moods
    : Array.from(
        new Set(tokens.map((t) => MOOD_HINTS[t]).filter(Boolean) as Mood[]),
      );

  const scored = MOVIES
    .filter((m) => !target || m.id !== target.id)
    .map((m) => {
      let score = 0;
      for (const k of baseKeywords) {
        if (!k) continue;
        if (m.keywords.some((mk) => mk.includes(k) || k.includes(mk))) score += 3;
        if (m.title.toLowerCase().includes(k)) score += 2;
        if (m.genre.toLowerCase().includes(k)) score += 2;
        if (m.description.toLowerCase().includes(k)) score += 1;
      }
      for (const g of baseGenres) {
        if (g.length > 2 && m.genre.toLowerCase().includes(g)) score += 2;
      }
      for (const mood of baseMoods) {
        if (m.moods.includes(mood)) score += 3;
      }
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);

  // Fallback: if nothing matched, return top-rated movies so the user still gets ideas
  if (scored.length === 0) {
    return [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  return scored;
}

export function byMood(mood: Mood): Movie[] {
  return MOVIES.filter((m) => m.moods.includes(mood));
}
