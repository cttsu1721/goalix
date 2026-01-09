/**
 * Curated motivational quotes for Goalzenix
 * Focused on goals, action, consistency, and long-term thinking
 */

export interface Quote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // Action-oriented
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },

  // Consistency and habits
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Dripping water hollows out stone, not through force but through persistence.", author: "Ovid" },
  { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell" },

  // Goals and vision
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupery" },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "Your goals are the road maps that guide you and show you what is possible.", author: "Les Brown" },

  // Progress over perfection
  { text: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },

  // Focus and priorities
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "You can do anything, but not everything.", author: "David Allen" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta" },

  // Mindset and belief
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation is only your imagination.", author: "Unknown" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },

  // Resilience and persistence
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The comeback is always stronger than the setback.", author: "Unknown" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },

  // Time and urgency
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "One day you'll wake up and there won't be any more time to do the things you've always wanted.", author: "Paulo Coelho" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin" },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
  { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },

  // Growth and learning
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck.", author: "Mandy Hale" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Be not afraid of growing slowly, be afraid only of standing still.", author: "Chinese Proverb" },
];

/**
 * Get a random quote from the collection
 */
export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

/**
 * Get a quote based on the day of the year (consistent for the same day)
 * This ensures users see the same quote throughout their day
 */
export function getDailyQuote(): Quote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use day of year to pick a consistent quote for the day
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
