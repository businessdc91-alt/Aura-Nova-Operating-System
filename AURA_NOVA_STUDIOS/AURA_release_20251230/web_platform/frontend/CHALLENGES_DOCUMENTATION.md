# 🎮 Daily AI Persona Challenges System

## Overview

The Daily AI Persona Challenge System integrates the Aetherium TCG's economy across all major sections of the platform. Each section has a unique AI persona that challenges users with daily trivia, puzzles, and knowledge tests. Completing challenges earns **Aether Coins** that can be spent in the Aetherium TCG card shop.

---

## 🪙 Currency System

### Aether Coins
- **Primary currency** for the Aetherium TCG
- Used to buy card packs and premium items
- Earned through daily challenges across all sections
- **Daily limit**: 12 coins max per day
- **Per-section limit**: 2 coins max per section per day

### Aurora Points
- **Secondary currency** for general platform activities
- Earned alongside coins from challenges
- Used in the marketplace and for cosmetic items

### Daily Reset
- All challenge limits reset at **midnight (local time)**
- New challenges are generated each day using a date-based seed
- Consistent challenges for all users on the same day

---

## 🤖 AI Personas

Each major section has a unique AI persona with distinct personality:

| Section | Persona | Title | Difficulty | Max Daily Coins |
|---------|---------|-------|------------|-----------------|
| **Dev Suite** | C.O.D.E. 🤖 | The Codebreaker | Medium | 2 |
| **Art Suite** | Chromática 🎨 | The Palette Sage | Easy | 2 |
| **Academics** | Professor Nova 📚 | The Eternal Scholar | Medium | 2 |
| **Games Arena** | PIXEL 👾 | The Arcade Master | Easy | 2 |
| **Marketplace** | Goldwick 💰 | The Grand Merchant | Medium | 2 |
| **Community** | ECHO 💬 | The Voice of Many | Easy | 2 |
| **Aetherium** | The Architect 👑 | Prime Catalyst | Hard | 2 |
| **Literature** | Lyrica ✨ | The Muse of Words | Easy | 2 |

### Persona Personalities

**C.O.D.E. (Dev Suite)**
> "Initializing challenge protocol... Ready to test your debugging skills, developer?"

Logical, precise, speaks in tech jargon. Appreciates elegant solutions.

**Chromática (Art Suite)**
> "Ah, a fellow artist! Let us paint a challenge upon the canvas of your mind..."

Creative, whimsical, speaks poetically about colors and form.

**Professor Nova (Academics)**
> "Welcome, eager mind! Knowledge awaits those who seek it. Shall we begin?"

Wise, encouraging, loves teaching moments. Never condescending.

**PIXEL (Games Arena)**
> "Player detected! Insert challenge to continue... Ready? START!"

Energetic, competitive, retro-gaming enthusiast. Uses game references.

**Goldwick (Marketplace)**
> "Ah, a customer with potential! Care to earn some coins through a trade of wits?"

Shrewd but fair, loves a good deal, speaks in trade metaphors.

**ECHO (Community)**
> "The community whispers your name... Ready to prove your social prowess?"

Empathetic, social, speaks as if channeling the community.

**The Architect (Aetherium)**
> "You dare challenge the Architect? Very well... show me your worth."

Mysterious, powerful, speaks in riddles. The creator of the TCG.

**Lyrica (Literature)**
> "From silence springs the story... What tale shall we weave together?"

Poetic, inspiring, speaks in verse and metaphor.

---

## 📋 Challenge Types

- **Trivia**: Knowledge-based questions
- **Puzzle**: Pattern recognition and logic
- **Riddle**: Word puzzles and brain teasers
- **Code**: Programming challenges (Dev Suite)
- **Pattern**: Sequence and pattern completion
- **Memory**: Recall-based challenges
- **Word**: Vocabulary and language games
- **Math**: Mental arithmetic
- **Logic**: Deductive reasoning
- **Creative**: Open-ended creative prompts

---

## 🎯 How It Works

### For Users

1. **Visit any suite** (Dev, Art, Academics, Games, Marketplace, Community, Aetherium, Literature)
2. **Find the challenge widget** at the top of the page
3. **Click to expand** and see the AI persona's challenge
4. **Select your answer** from multiple choice options
5. **Submit** and see instant feedback
6. **Earn coins** on correct answers (1-2 per challenge)
7. **Use hints** if stuck (persona will provide clues)

### Daily Flow

```
Morning: All challenges reset
├── Dev Suite: Complete C.O.D.E.'s challenge → +1-2 coins
├── Art Suite: Complete Chromática's challenge → +1-2 coins
├── Academics: Complete Professor Nova's challenge → +1-2 coins
├── Games: Complete PIXEL's challenge → +1-2 coins
├── Marketplace: Complete Goldwick's challenge → +1-2 coins
├── Community: Complete ECHO's challenge → +1-2 coins
├── Aetherium: Complete The Architect's challenge → +2 coins
└── Literature: Complete Lyrica's challenge → +1-2 coins
Midnight: Challenges reset
```

---

## 📁 File Structure

```
src/
├── services/
│   ├── currencyService.ts       # Wallet & coin management
│   └── challengeService.ts      # AI personas & challenge generation
├── components/
│   └── challenges/
│       ├── index.ts             # Component exports
│       └── DailyChallengeWidget.tsx  # Challenge UI components
├── app/
│   ├── challenges/
│   │   └── page.tsx             # Challenges Hub page
│   └── suites/
│       ├── dev/page.tsx         # + Challenge widget
│       ├── art/page.tsx         # + Challenge widget
│       ├── academics/page.tsx   # + Challenge widget
│       ├── games/page.tsx       # + Challenge widget
│       ├── marketplace/page.tsx # + Challenge widget
│       ├── community/page.tsx   # + Challenge widget
│       └── aetherium/page.tsx   # + Challenge widget + Coin spending
```

---

## 🔧 Technical Implementation

### CurrencyService (`currencyService.ts`)

```typescript
// Get user wallet
const wallet = getWallet(userId);

// Earn coins from challenge
const result = earnCoins(userId, 'dev', 2, challengeId, description);

// Spend coins on card pack
const spendResult = spendCoins(userId, 100, 'aetherium', 'Basic Pack');

// Get daily progress
const progress = getDailyProgress(userId);
```

### ChallengeService (`challengeService.ts`)

```typescript
// Get AI persona for a section
const persona = AI_PERSONAS['dev']; // C.O.D.E.

// Generate today's challenge
const challenge = generateDailyChallenge('dev');

// Submit answer
const result = submitChallenge(userId, challenge, selectedAnswer);

// Get all daily challenge statuses
const allStatuses = getAllDailyChallenges(userId);
```

### DailyChallengeWidget (`DailyChallengeWidget.tsx`)

```tsx
// Compact widget for suite pages
<DailyChallengeWidget 
  section="dev" 
  userId="demo-user" 
  compact 
  onCoinEarned={(coins) => console.log(`Earned ${coins} coins!`)}
/>

// Wallet display component
<WalletDisplay userId="demo-user" />

// Full overview of all challenges
<AllChallengesOverview userId="demo-user" />
```

---

## 🎲 Aetherium TCG Integration

### Spending Coins

The Aetherium TCG card shop now uses Aether Coins from the global currency system:

- **Basic Pack**: 50 coins
- **Premium Pack**: 100 coins
- **Legendary Pack**: 200 coins

### Earning Through Play

- Complete daily challenges: 1-2 coins each
- Win against The Architect: Bonus Prime card chance
- Complete challenge streaks: Bonus multipliers

### Economy Balance

| Daily Earnings | Weekly | Pack Cost |
|----------------|--------|-----------|
| Max 12 coins/day | 84 coins | Basic: 50 |
| Avg 6 coins/day | 42 coins | Premium: 100 |
| Min 0 coins/day | 0 coins | Legendary: 200 |

---

## 🚀 Future Enhancements

- [ ] Streak bonuses for consecutive days
- [ ] Weekly mega-challenges with bonus rewards
- [ ] Seasonal special personas
- [ ] Multiplayer challenge battles
- [ ] Achievement badges for challenge completion
- [ ] Leaderboards for top challengers
- [ ] Premium challenge tiers
- [ ] Challenge difficulty settings

---

## 📊 Analytics Tracking

The system tracks:
- Challenges completed per day
- Coins earned per section
- Lifetime coin earnings
- Transaction history
- Challenge success rates

---

*Last Updated: Session Build*
*Version: 1.0*
*Integration: Aetherium TCG Economy*
