// ============================================================================
// CURRENCY SERVICE - GLOBAL COIN & POINTS ECONOMY
// ============================================================================
// Unified currency system that connects all suites to Aetherium TCG economy
// - Aether Coins: Primary currency for TCG card packs & premium items
// - Aurora Points: Secondary currency earned from activities
// - Daily Limits: 1-2 coins per day per section via AI challenges
// ============================================================================

// ================== TYPES ==================
export interface PlayerWallet {
  userId: string;
  aetherCoins: number;          // Primary TCG currency
  auroraPoints: number;          // Secondary activity points
  lifetimeCoins: number;         // Total coins ever earned
  lifetimePoints: number;        // Total points ever earned
  dailyEarnings: DailyEarnings;
  lastUpdated: Date;
}

export interface DailyEarnings {
  date: string;                  // YYYY-MM-DD format
  coinsBySection: Record<string, number>;  // Coins earned per section today
  totalCoinsToday: number;
  maxDailyCoins: number;         // Cap of daily coin earnings
  challengesCompleted: string[]; // IDs of completed challenges
}

export interface CurrencyTransaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'bonus';
  currency: 'coins' | 'points';
  amount: number;
  source: string;               // Which section/feature
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export interface EarningResult {
  success: boolean;
  coinsEarned: number;
  newBalance: number;
  message: string;
  dailyLimitReached: boolean;
  sectionLimitReached: boolean;
}

// ================== CONSTANTS ==================
export const CURRENCY_CONFIG = {
  maxDailyCoins: 12,            // Max coins per day across all sections
  maxCoinsPerSection: 2,        // Max coins per section per day
  challengeRewards: {
    easy: 1,
    medium: 1,
    hard: 2,
  },
  bonusMultipliers: {
    streak3: 1.1,               // 10% bonus for 3-day streak
    streak7: 1.25,              // 25% bonus for 7-day streak
    streak30: 1.5,              // 50% bonus for 30-day streak
  },
  sections: [
    'dev',
    'art',
    'academics',
    'games',
    'marketplace',
    'community',
    'aetherium',
    'literature',
  ] as const,
} as const;

export type SectionId = typeof CURRENCY_CONFIG.sections[number];

// ================== LOCAL STORAGE KEYS ==================
const WALLET_KEY = 'aura_nova_wallet';
const TRANSACTIONS_KEY = 'aura_nova_transactions';

// ================== WALLET MANAGEMENT ==================
export function initializeWallet(userId: string): PlayerWallet {
  const today = new Date().toISOString().split('T')[0];
  
  const wallet: PlayerWallet = {
    userId,
    aetherCoins: 100,            // Starter coins
    auroraPoints: 500,           // Starter points
    lifetimeCoins: 100,
    lifetimePoints: 500,
    dailyEarnings: {
      date: today,
      coinsBySection: {},
      totalCoinsToday: 0,
      maxDailyCoins: CURRENCY_CONFIG.maxDailyCoins,
      challengesCompleted: [],
    },
    lastUpdated: new Date(),
  };
  
  saveWallet(wallet);
  return wallet;
}

export function getWallet(userId: string): PlayerWallet {
  if (typeof window === 'undefined') {
    return initializeWallet(userId);
  }
  
  const stored = localStorage.getItem(`${WALLET_KEY}_${userId}`);
  if (!stored) {
    return initializeWallet(userId);
  }
  
  const wallet = JSON.parse(stored) as PlayerWallet;
  
  // Reset daily earnings if it's a new day
  const today = new Date().toISOString().split('T')[0];
  if (wallet.dailyEarnings.date !== today) {
    wallet.dailyEarnings = {
      date: today,
      coinsBySection: {},
      totalCoinsToday: 0,
      maxDailyCoins: CURRENCY_CONFIG.maxDailyCoins,
      challengesCompleted: [],
    };
    saveWallet(wallet);
  }
  
  return wallet;
}

export function saveWallet(wallet: PlayerWallet): void {
  if (typeof window === 'undefined') return;
  
  wallet.lastUpdated = new Date();
  localStorage.setItem(`${WALLET_KEY}_${wallet.userId}`, JSON.stringify(wallet));
}

// ================== EARNING COINS ==================
export function earnCoins(
  userId: string,
  section: SectionId,
  amount: number,
  challengeId: string,
  description: string
): EarningResult {
  const wallet = getWallet(userId);
  
  // Check if challenge already completed today
  if (wallet.dailyEarnings.challengesCompleted.includes(challengeId)) {
    return {
      success: false,
      coinsEarned: 0,
      newBalance: wallet.aetherCoins,
      message: 'Challenge already completed today!',
      dailyLimitReached: false,
      sectionLimitReached: false,
    };
  }
  
  // Check section daily limit
  const sectionEarnings = wallet.dailyEarnings.coinsBySection[section] || 0;
  if (sectionEarnings >= CURRENCY_CONFIG.maxCoinsPerSection) {
    return {
      success: false,
      coinsEarned: 0,
      newBalance: wallet.aetherCoins,
      message: `You've earned max coins from ${section} today! Come back tomorrow.`,
      dailyLimitReached: false,
      sectionLimitReached: true,
    };
  }
  
  // Check global daily limit
  if (wallet.dailyEarnings.totalCoinsToday >= CURRENCY_CONFIG.maxDailyCoins) {
    return {
      success: false,
      coinsEarned: 0,
      newBalance: wallet.aetherCoins,
      message: 'Daily coin limit reached! Come back tomorrow for more challenges.',
      dailyLimitReached: true,
      sectionLimitReached: false,
    };
  }
  
  // Calculate actual earnings (capped)
  const remainingSection = CURRENCY_CONFIG.maxCoinsPerSection - sectionEarnings;
  const remainingDaily = CURRENCY_CONFIG.maxDailyCoins - wallet.dailyEarnings.totalCoinsToday;
  const actualEarnings = Math.min(amount, remainingSection, remainingDaily);
  
  // Update wallet
  wallet.aetherCoins += actualEarnings;
  wallet.lifetimeCoins += actualEarnings;
  wallet.dailyEarnings.coinsBySection[section] = sectionEarnings + actualEarnings;
  wallet.dailyEarnings.totalCoinsToday += actualEarnings;
  wallet.dailyEarnings.challengesCompleted.push(challengeId);
  
  saveWallet(wallet);
  
  // Log transaction
  logTransaction(userId, {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'earn',
    currency: 'coins',
    amount: actualEarnings,
    source: section,
    description,
    timestamp: new Date(),
    balanceAfter: wallet.aetherCoins,
  });
  
  return {
    success: true,
    coinsEarned: actualEarnings,
    newBalance: wallet.aetherCoins,
    message: `+${actualEarnings} Aether Coin${actualEarnings > 1 ? 's' : ''}! 🪙`,
    dailyLimitReached: wallet.dailyEarnings.totalCoinsToday >= CURRENCY_CONFIG.maxDailyCoins,
    sectionLimitReached: (sectionEarnings + actualEarnings) >= CURRENCY_CONFIG.maxCoinsPerSection,
  };
}

// ================== SPENDING COINS ==================
export function spendCoins(
  userId: string,
  amount: number,
  source: string,
  description: string
): { success: boolean; newBalance: number; message: string } {
  const wallet = getWallet(userId);
  
  if (wallet.aetherCoins < amount) {
    return {
      success: false,
      newBalance: wallet.aetherCoins,
      message: `Not enough coins! You have ${wallet.aetherCoins}, need ${amount}.`,
    };
  }
  
  wallet.aetherCoins -= amount;
  saveWallet(wallet);
  
  logTransaction(userId, {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'spend',
    currency: 'coins',
    amount,
    source,
    description,
    timestamp: new Date(),
    balanceAfter: wallet.aetherCoins,
  });
  
  return {
    success: true,
    newBalance: wallet.aetherCoins,
    message: `Spent ${amount} coins on ${description}`,
  };
}

// ================== POINTS SYSTEM ==================
export function earnPoints(
  userId: string,
  amount: number,
  source: string,
  description: string
): { success: boolean; newBalance: number } {
  const wallet = getWallet(userId);
  
  wallet.auroraPoints += amount;
  wallet.lifetimePoints += amount;
  saveWallet(wallet);
  
  logTransaction(userId, {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'earn',
    currency: 'points',
    amount,
    source,
    description,
    timestamp: new Date(),
    balanceAfter: wallet.auroraPoints,
  });
  
  return {
    success: true,
    newBalance: wallet.auroraPoints,
  };
}

export function spendPoints(
  userId: string,
  amount: number,
  source: string,
  description: string
): { success: boolean; newBalance: number; message: string } {
  const wallet = getWallet(userId);
  
  if (wallet.auroraPoints < amount) {
    return {
      success: false,
      newBalance: wallet.auroraPoints,
      message: `Not enough points! You have ${wallet.auroraPoints}, need ${amount}.`,
    };
  }
  
  wallet.auroraPoints -= amount;
  saveWallet(wallet);
  
  logTransaction(userId, {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'spend',
    currency: 'points',
    amount,
    source,
    description,
    timestamp: new Date(),
    balanceAfter: wallet.auroraPoints,
  });
  
  return {
    success: true,
    newBalance: wallet.auroraPoints,
    message: `Spent ${amount} points on ${description}`,
  };
}

// ================== TRANSACTION HISTORY ==================
function logTransaction(userId: string, transaction: CurrencyTransaction): void {
  if (typeof window === 'undefined') return;
  
  const key = `${TRANSACTIONS_KEY}_${userId}`;
  const stored = localStorage.getItem(key);
  const transactions: CurrencyTransaction[] = stored ? JSON.parse(stored) : [];
  
  transactions.unshift(transaction);
  
  // Keep only last 100 transactions
  if (transactions.length > 100) {
    transactions.pop();
  }
  
  localStorage.setItem(key, JSON.stringify(transactions));
}

export function getTransactionHistory(userId: string, limit = 50): CurrencyTransaction[] {
  if (typeof window === 'undefined') return [];
  
  const key = `${TRANSACTIONS_KEY}_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) return [];
  
  const transactions: CurrencyTransaction[] = JSON.parse(stored);
  return transactions.slice(0, limit);
}

// ================== DAILY PROGRESS ==================
export function getDailyProgress(userId: string): {
  totalEarned: number;
  maxDaily: number;
  percentComplete: number;
  sectionProgress: Record<string, { earned: number; max: number }>;
  challengesCompleted: number;
} {
  const wallet = getWallet(userId);
  
  const sectionProgress: Record<string, { earned: number; max: number }> = {};
  for (const section of CURRENCY_CONFIG.sections) {
    sectionProgress[section] = {
      earned: wallet.dailyEarnings.coinsBySection[section] || 0,
      max: CURRENCY_CONFIG.maxCoinsPerSection,
    };
  }
  
  return {
    totalEarned: wallet.dailyEarnings.totalCoinsToday,
    maxDaily: CURRENCY_CONFIG.maxDailyCoins,
    percentComplete: (wallet.dailyEarnings.totalCoinsToday / CURRENCY_CONFIG.maxDailyCoins) * 100,
    sectionProgress,
    challengesCompleted: wallet.dailyEarnings.challengesCompleted.length,
  };
}

// ================== UTILITY EXPORTS ==================
export const CurrencyService = {
  initializeWallet,
  getWallet,
  saveWallet,
  earnCoins,
  spendCoins,
  earnPoints,
  spendPoints,
  getTransactionHistory,
  getDailyProgress,
};

export default CurrencyService;
