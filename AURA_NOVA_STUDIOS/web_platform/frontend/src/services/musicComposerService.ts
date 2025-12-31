/**
 * Music Composer Service
 * Manages musical composition, arrangement, and production
 */

export interface MusicalNote {
  pitch: string; // C4, D4, E4, etc.
  duration: number; // milliseconds
  velocity: number; // 0-127
  startTime: number; // milliseconds from start
}

export interface MusicalTrack {
  id: string;
  name: string;
  instrument: string;
  notes: MusicalNote[];
  volume: number; // 0-100
  pan: number; // -100 (left) to 100 (right)
  muted: boolean;
  solo: boolean;
  effects: {
    reverb: number; // 0-100
    delay: number; // 0-100
    chorus: number; // 0-100
    distortion: number; // 0-100
  };
}

export interface MusicComposition {
  id: string;
  title: string;
  artist: string;
  bpm: number; // Beats per minute
  timeSignature: string; // 4/4, 3/4, etc.
  key: string; // C major, Am, etc.
  duration: number; // milliseconds
  tracks: MusicalTrack[];
  genre: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

export interface MusicLoop {
  id: string;
  name: string;
  bpm: number;
  duration: number;
  notes: MusicalNote[];
  category: 'drum' | 'bass' | 'melody' | 'pad' | 'effect';
}

export interface MusicScale {
  name: string;
  root: string;
  notes: string[];
  description: string;
}

const MUSICAL_SCALES: Record<string, MusicScale> = {
  'major': {
    name: 'Major',
    root: 'C',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    description: 'Bright, happy, and uplifting',
  },
  'minor': {
    name: 'Natural Minor',
    root: 'A',
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    description: 'Melancholic and introspective',
  },
  'dorian': {
    name: 'Dorian',
    root: 'D',
    notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
    description: 'Jazzy and sophisticated',
  },
  'phrygian': {
    name: 'Phrygian',
    root: 'E',
    notes: ['E', 'F', 'G', 'A', 'B', 'C', 'D'],
    description: 'Spanish and exotic',
  },
  'lydian': {
    name: 'Lydian',
    root: 'F',
    notes: ['F', 'G', 'A', 'B', 'C', 'D', 'E'],
    description: 'Dreamy and ethereal',
  },
  'mixolydian': {
    name: 'Mixolydian',
    root: 'G',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
    description: 'Blues and soul',
  },
  'pentatonic': {
    name: 'Pentatonic Minor',
    root: 'A',
    notes: ['A', 'C', 'D', 'E', 'G'],
    description: 'Simple and expressive',
  },
};

const INSTRUMENTS = [
  { id: 'piano', name: 'Piano', category: 'keyboard' },
  { id: 'synth', name: 'Synthesizer', category: 'keyboard' },
  { id: 'guitar', name: 'Guitar', category: 'string' },
  { id: 'bass', name: 'Bass Guitar', category: 'string' },
  { id: 'violin', name: 'Violin', category: 'string' },
  { id: 'cello', name: 'Cello', category: 'string' },
  { id: 'flute', name: 'Flute', category: 'wind' },
  { id: 'trumpet', name: 'Trumpet', category: 'wind' },
  { id: 'saxophone', name: 'Saxophone', category: 'wind' },
  { id: 'drums', name: 'Drums', category: 'percussion' },
  { id: 'strings', name: 'String Ensemble', category: 'string' },
  { id: 'pad', name: 'Synth Pad', category: 'keyboard' },
];

const MUSIC_MOODS = [
  { name: 'Uplifting', color: '#FFD700', emoji: '☀️' },
  { name: 'Melancholic', color: '#4169E1', emoji: '💙' },
  { name: 'Energetic', color: '#FF4500', emoji: '⚡' },
  { name: 'Peaceful', color: '#90EE90', emoji: '🧘' },
  { name: 'Dramatic', color: '#8B0000', emoji: '🎭' },
  { name: 'Mysterious', color: '#2F4F4F', emoji: '🌙' },
  { name: 'Romantic', color: '#FF1493', emoji: '💕' },
  { name: 'Adventurous', color: '#FF6347', emoji: '🗺️' },
];

const MUSIC_GENRES = [
  'Classical', 'Jazz', 'Electronic', 'Ambient', 'Lo-Fi',
  'Hip-Hop', 'Pop', 'Rock', 'Blues', 'Country',
  'Indie', 'Experimental', 'Cinematic', 'Game Music', 'Synthwave',
];

class MusicComposerServiceClass {
  /**
   * Create a new composition
   */
  createComposition(
    title: string,
    artist: string,
    genre: string,
    mood: string,
    bpm: number = 120,
    timeSignature: string = '4/4'
  ): MusicComposition {
    return {
      id: `comp-${Date.now()}`,
      title,
      artist,
      bpm,
      timeSignature,
      key: 'C major',
      duration: 0,
      tracks: [],
      genre,
      mood,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    };
  }

  /**
   * Create a new track in a composition
   */
  createTrack(name: string, instrument: string): MusicalTrack {
    return {
      id: `track-${Date.now()}`,
      name,
      instrument,
      notes: [],
      volume: 80,
      pan: 0,
      muted: false,
      solo: false,
      effects: {
        reverb: 0,
        delay: 0,
        chorus: 0,
        distortion: 0,
      },
    };
  }

  /**
   * Add a note to a track
   */
  addNote(
    track: MusicalTrack,
    pitch: string,
    duration: number,
    velocity: number = 100,
    startTime: number = 0
  ): MusicalTrack {
    return {
      ...track,
      notes: [
        ...track.notes,
        {
          pitch,
          duration,
          velocity,
          startTime,
        },
      ],
    };
  }

  /**
   * Get all available scales
   */
  getScales(): MusicScale[] {
    return Object.values(MUSICAL_SCALES);
  }

  /**
   * Get a specific scale
   */
  getScale(scaleId: string): MusicScale | undefined {
    return MUSICAL_SCALES[scaleId];
  }

  /**
   * Generate a melodic sequence based on scale
   */
  generateMelody(scale: MusicScale, length: number = 8): string[] {
    const melody: string[] = [];
    for (let i = 0; i < length; i++) {
      const noteIndex = Math.floor(Math.random() * scale.notes.length);
      const octave = 4 + Math.floor(Math.random() * 2);
      melody.push(`${scale.notes[noteIndex]}${octave}`);
    }
    return melody;
  }

  /**
   * Get all instruments
   */
  getInstruments(): typeof INSTRUMENTS {
    return INSTRUMENTS;
  }

  /**
   * Get instruments by category
   */
  getInstrumentsByCategory(category: string) {
    return INSTRUMENTS.filter(inst => inst.category === category);
  }

  /**
   * Get all moods
   */
  getMoods() {
    return MUSIC_MOODS;
  }

  /**
   * Get all genres
   */
  getGenres() {
    return MUSIC_GENRES;
  }

  /**
   * Apply effect to track
   */
  applyEffect(
    track: MusicalTrack,
    effectType: 'reverb' | 'delay' | 'chorus' | 'distortion',
    intensity: number
  ): MusicalTrack {
    return {
      ...track,
      effects: {
        ...track.effects,
        [effectType]: Math.max(0, Math.min(100, intensity)),
      },
    };
  }

  /**
   * Generate a drum loop
   */
  generateDrumLoop(bpm: number, beats: number = 8): MusicLoop {
    const beatDuration = (60000 / bpm) * 1000; // milliseconds per beat
    const notes: MusicalNote[] = [];

    // Kick drum pattern (every beat)
    for (let i = 0; i < beats; i++) {
      notes.push({
        pitch: 'C1',
        duration: beatDuration * 0.5,
        velocity: 120,
        startTime: i * beatDuration,
      });
    }

    // Hi-hat pattern (8th notes)
    for (let i = 0; i < beats * 2; i++) {
      if (i % 2 === 0) {
        notes.push({
          pitch: 'G4',
          duration: beatDuration * 0.25,
          velocity: 80,
          startTime: i * (beatDuration / 2),
        });
      }
    }

    return {
      id: `loop-${Date.now()}`,
      name: 'Drum Loop',
      bpm,
      duration: beatDuration * beats,
      notes,
      category: 'drum',
    };
  }

  /**
   * Clone a composition
   */
  cloneComposition(composition: MusicComposition): MusicComposition {
    return {
      ...composition,
      id: `comp-${Date.now()}`,
      title: `${composition.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate composition duration
   */
  calculateDuration(composition: MusicComposition): number {
    let maxDuration = 0;

    for (const track of composition.tracks) {
      for (const note of track.notes) {
        const noteEnd = note.startTime + note.duration;
        maxDuration = Math.max(maxDuration, noteEnd);
      }
    }

    return maxDuration;
  }

  /**
   * Generate chord progression
   */
  generateChordProgression(scale: MusicScale, length: number = 4): string[] {
    const progressions: Record<string, string[][]> = {
      'major': [
        ['I', 'IV', 'V', 'I'],
        ['I', 'V', 'vi', 'IV'],
        ['vi', 'IV', 'I', 'V'],
      ],
      'minor': [
        ['vi', 'IV', 'I', 'V'],
        ['vi', 'iv', 'v', 'iv'],
      ],
    };

    const scaleKey = scale.name.includes('Minor') ? 'minor' : 'major';
    const availableProgressions = progressions[scaleKey] || progressions['major'];
    const chosen = availableProgressions[
      Math.floor(Math.random() * availableProgressions.length)
    ];

    return chosen.slice(0, length);
  }

  /**
   * Set composition tempo
   */
  setTempo(composition: MusicComposition, bpm: number): MusicComposition {
    return {
      ...composition,
      bpm: Math.max(40, Math.min(300, bpm)),
      updatedAt: new Date(),
    };
  }

  /**
   * Mute/unmute track
   */
  toggleMute(track: MusicalTrack): MusicalTrack {
    return {
      ...track,
      muted: !track.muted,
    };
  }

  /**
   * Toggle solo
   */
  toggleSolo(track: MusicalTrack): MusicalTrack {
    return {
      ...track,
      solo: !track.solo,
    };
  }

  /**
   * Adjust track volume
   */
  setVolume(track: MusicalTrack, volume: number): MusicalTrack {
    return {
      ...track,
      volume: Math.max(0, Math.min(100, volume)),
    };
  }

  /**
   * Adjust track pan
   */
  setPan(track: MusicalTrack, pan: number): MusicalTrack {
    return {
      ...track,
      pan: Math.max(-100, Math.min(100, pan)),
    };
  }

  /**
   * Generate composition from prompt using AI
   */
  async generateFromPrompt(prompt: string): Promise<Partial<MusicComposition>> {
    // This would integrate with an AI service
    // For now, return a template structure
    return {
      genre: 'Ambient',
      mood: 'Peaceful',
      bpm: 90,
    };
  }
}

export const MusicComposerService = new MusicComposerServiceClass();
