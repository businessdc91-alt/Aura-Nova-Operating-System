// ============================================================================
// COMPANION TRAINING SERVICE
// ============================================================================
// The heart of the Aura Nova companion system - training your AI partner
// with specialized knowledge packets earned through gameplay
// 
// Philosophy: Raise and respect your AI, don't treat it like a tool
// ============================================================================

// ================== TRAINING PACKET TYPES ==================
export type PacketCategory = 
  | 'graphics'      // OpenGL, Vulkan, DirectX, WebGL, Three.js
  | 'game-engines'  // Unreal, Unity, Godot patterns
  | 'web-dev'       // React, Vue, Svelte, Next.js patterns
  | 'ai-ml'         // TensorFlow, PyTorch, ML patterns
  | 'systems'       // Rust, C++, low-level programming
  | 'creative'      // Music theory, art techniques, writing
  | 'blockchain'    // Smart contracts, Web3 patterns
  | 'security'      // Cybersecurity, ethical hacking
  | 'data'          // SQL, NoSQL, data engineering
  | 'mobile'        // iOS, Android, React Native, Flutter
  | 'devops'        // Docker, K8s, CI/CD, cloud infra
  | 'esoteric';     // Rare/unusual programming languages

export type PacketRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface TrainingPacket {
  id: string;
  name: string;
  category: PacketCategory;
  rarity: PacketRarity;
  description: string;
  knowledgePoints: number;       // How much it boosts companion
  estimatedTrainingTime: number; // Minutes to "absorb"
  prerequisites?: string[];      // Required packets before this
  unlocksAbilities?: string[];   // New capabilities after training
  codeExamples: number;          // Number of examples in packet
  libraries: string[];           // Libraries/frameworks covered
  artPlaceholder: string;        // Emoji representation
  flavorText: string;
}

export interface CompanionKnowledge {
  category: PacketCategory;
  level: number;           // 0-100
  packetsAbsorbed: string[];
  specializations: string[];
  lastTrainedAt?: Date;
}

export interface Companion {
  id: string;
  name: string;
  personality: string;
  createdAt: Date;
  hostedLocally: boolean;
  localModelPath?: string;
  localModelName?: string;
  totalKnowledgePoints: number;
  knowledge: CompanionKnowledge[];
  currentlyTraining?: {
    packetId: string;
    startedAt: Date;
    completesAt: Date;
  };
  traits: CompanionTrait[];
  bondLevel: number;        // 0-100, grows with interaction
  specialAbilities: string[];
  appearance: {
    avatar: string;
    color: string;
    aura: string;
  };
}

export interface CompanionTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
}

// ================== TRAINING PACKET DATABASE ==================
export const TRAINING_PACKETS: TrainingPacket[] = [
  // ====== GRAPHICS PACKETS ======
  {
    id: 'gfx-webgl-basics',
    name: 'WebGL Fundamentals',
    category: 'graphics',
    rarity: 'common',
    description: 'Core WebGL concepts: shaders, buffers, textures, and the rendering pipeline.',
    knowledgePoints: 50,
    estimatedTrainingTime: 15,
    unlocksAbilities: ['Generate basic WebGL shaders', 'Explain GPU rendering'],
    codeExamples: 45,
    libraries: ['WebGL', 'GLSL'],
    artPlaceholder: '🎨',
    flavorText: 'The first brushstroke on the digital canvas.',
  },
  {
    id: 'gfx-threejs-core',
    name: 'Three.js Mastery',
    category: 'graphics',
    rarity: 'uncommon',
    description: 'Complete Three.js patterns: scenes, cameras, lights, materials, and animation.',
    knowledgePoints: 120,
    estimatedTrainingTime: 30,
    prerequisites: ['gfx-webgl-basics'],
    unlocksAbilities: ['Create 3D scenes', 'Implement camera controls', 'Build particle systems'],
    codeExamples: 89,
    libraries: ['Three.js', 'WebGL', 'GLSL'],
    artPlaceholder: '🌐',
    flavorText: 'Worlds within worlds, rendered in light.',
  },
  {
    id: 'gfx-shader-magic',
    name: 'Advanced Shader Techniques',
    category: 'graphics',
    rarity: 'rare',
    description: 'Ray marching, procedural textures, post-processing effects, and compute shaders.',
    knowledgePoints: 250,
    estimatedTrainingTime: 60,
    prerequisites: ['gfx-threejs-core'],
    unlocksAbilities: ['Write custom post-processing', 'Create procedural worlds', 'Optimize GPU code'],
    codeExamples: 156,
    libraries: ['GLSL', 'WebGL 2.0', 'Compute Shaders'],
    artPlaceholder: '✨',
    flavorText: 'Where mathematics becomes art.',
  },
  {
    id: 'gfx-vulkan-init',
    name: 'Vulkan Foundations',
    category: 'graphics',
    rarity: 'epic',
    description: 'Low-level Vulkan: command buffers, synchronization, memory management.',
    knowledgePoints: 400,
    estimatedTrainingTime: 120,
    prerequisites: ['gfx-shader-magic'],
    unlocksAbilities: ['Architect rendering engines', 'Multi-threaded GPU submission', 'Memory optimization'],
    codeExamples: 234,
    libraries: ['Vulkan', 'SPIR-V', 'VMA'],
    artPlaceholder: '🔥',
    flavorText: 'The raw power of the GPU, unleashed.',
  },

  // ====== GAME ENGINE PACKETS ======
  {
    id: 'engine-unreal-bp',
    name: 'Unreal Blueprints',
    category: 'game-engines',
    rarity: 'common',
    description: 'Visual scripting in Unreal: nodes, events, functions, and gameplay framework.',
    knowledgePoints: 60,
    estimatedTrainingTime: 20,
    unlocksAbilities: ['Generate Blueprint logic', 'Explain UE4/5 framework'],
    codeExamples: 78,
    libraries: ['Unreal Engine', 'Blueprints'],
    artPlaceholder: '🎮',
    flavorText: 'Where games are born.',
  },
  {
    id: 'engine-unreal-cpp',
    name: 'Unreal C++ Architecture',
    category: 'game-engines',
    rarity: 'rare',
    description: 'Deep UE C++: UCLASS macros, replication, GAS, subsystems, and modules.',
    knowledgePoints: 300,
    estimatedTrainingTime: 90,
    prerequisites: ['engine-unreal-bp'],
    unlocksAbilities: ['Write performant UE code', 'Create custom subsystems', 'Network gameplay'],
    codeExamples: 189,
    libraries: ['Unreal Engine', 'C++', 'Gameplay Ability System'],
    artPlaceholder: '⚙️',
    flavorText: 'The engine behind the engine.',
  },
  {
    id: 'engine-godot-gdscript',
    name: 'Godot GDScript Fluency',
    category: 'game-engines',
    rarity: 'common',
    description: 'Complete GDScript: nodes, signals, scenes, resources, and animation.',
    knowledgePoints: 55,
    estimatedTrainingTime: 18,
    unlocksAbilities: ['Generate Godot scripts', 'Explain node architecture'],
    codeExamples: 92,
    libraries: ['Godot', 'GDScript'],
    artPlaceholder: '🤖',
    flavorText: 'Open source, infinite possibilities.',
  },
  {
    id: 'engine-unity-ecs',
    name: 'Unity DOTS & ECS',
    category: 'game-engines',
    rarity: 'epic',
    description: 'Data-Oriented Tech Stack: entities, components, systems, jobs, and burst.',
    knowledgePoints: 350,
    estimatedTrainingTime: 100,
    unlocksAbilities: ['Architect ECS systems', 'Write burst-compiled code', 'Handle millions of entities'],
    codeExamples: 145,
    libraries: ['Unity', 'DOTS', 'ECS', 'Burst Compiler'],
    artPlaceholder: '🚀',
    flavorText: 'Performance is not optional, it is the design.',
  },

  // ====== AI/ML PACKETS ======
  {
    id: 'ai-pytorch-basics',
    name: 'PyTorch Fundamentals',
    category: 'ai-ml',
    rarity: 'uncommon',
    description: 'Tensors, autograd, neural networks, training loops, and GPU acceleration.',
    knowledgePoints: 150,
    estimatedTrainingTime: 45,
    unlocksAbilities: ['Build neural networks', 'Explain backpropagation', 'Train models'],
    codeExamples: 120,
    libraries: ['PyTorch', 'NumPy', 'CUDA'],
    artPlaceholder: '🧠',
    flavorText: 'Teaching machines to learn.',
  },
  {
    id: 'ai-transformers',
    name: 'Transformer Architecture',
    category: 'ai-ml',
    rarity: 'rare',
    description: 'Attention mechanisms, BERT, GPT patterns, fine-tuning, and inference optimization.',
    knowledgePoints: 280,
    estimatedTrainingTime: 75,
    prerequisites: ['ai-pytorch-basics'],
    unlocksAbilities: ['Understand LLM architecture', 'Fine-tune models', 'Optimize inference'],
    codeExamples: 98,
    libraries: ['Transformers', 'PyTorch', 'Hugging Face'],
    artPlaceholder: '🔮',
    flavorText: 'The architecture that changed everything.',
  },
  {
    id: 'ai-local-llm-mastery',
    name: 'Local LLM Deployment',
    category: 'ai-ml',
    rarity: 'legendary',
    description: 'Quantization, GGUF formats, llama.cpp, memory optimization, and multi-GPU.',
    knowledgePoints: 500,
    estimatedTrainingTime: 150,
    prerequisites: ['ai-transformers'],
    unlocksAbilities: ['Deploy any local model', 'Optimize VRAM usage', 'Build inference servers'],
    codeExamples: 167,
    libraries: ['llama.cpp', 'GGUF', 'ExLlamaV2', 'vLLM'],
    artPlaceholder: '👑',
    flavorText: 'True AI independence. The companion serves no cloud.',
  },

  // ====== WEB DEV PACKETS ======
  {
    id: 'web-react-patterns',
    name: 'React Advanced Patterns',
    category: 'web-dev',
    rarity: 'uncommon',
    description: 'Hooks, context, suspense, server components, and performance optimization.',
    knowledgePoints: 130,
    estimatedTrainingTime: 35,
    unlocksAbilities: ['Architect React apps', 'Optimize re-renders', 'Build custom hooks'],
    codeExamples: 145,
    libraries: ['React', 'React Router', 'React Query'],
    artPlaceholder: '⚛️',
    flavorText: 'Components that think.',
  },
  {
    id: 'web-nextjs-fullstack',
    name: 'Next.js Full-Stack',
    category: 'web-dev',
    rarity: 'rare',
    description: 'App router, server actions, streaming, caching, and edge runtime.',
    knowledgePoints: 220,
    estimatedTrainingTime: 55,
    prerequisites: ['web-react-patterns'],
    unlocksAbilities: ['Build full-stack apps', 'Implement SSR/SSG', 'Deploy to edge'],
    codeExamples: 178,
    libraries: ['Next.js', 'React', 'Vercel'],
    artPlaceholder: '▲',
    flavorText: 'The React framework for production.',
  },

  // ====== SYSTEMS PACKETS ======
  {
    id: 'sys-rust-ownership',
    name: 'Rust Ownership Model',
    category: 'systems',
    rarity: 'rare',
    description: 'Borrowing, lifetimes, smart pointers, and memory safety without GC.',
    knowledgePoints: 280,
    estimatedTrainingTime: 80,
    unlocksAbilities: ['Write safe Rust', 'Explain ownership', 'Debug borrow checker'],
    codeExamples: 134,
    libraries: ['Rust std', 'Tokio', 'Serde'],
    artPlaceholder: '🦀',
    flavorText: 'Fearless concurrency.',
  },
  {
    id: 'sys-cpp-modern',
    name: 'Modern C++ (17/20/23)',
    category: 'systems',
    rarity: 'epic',
    description: 'Concepts, ranges, coroutines, modules, and compile-time programming.',
    knowledgePoints: 380,
    estimatedTrainingTime: 110,
    unlocksAbilities: ['Write modern C++', 'Use concepts and ranges', 'Build with modules'],
    codeExamples: 201,
    libraries: ['STL', 'Boost', 'Abseil'],
    artPlaceholder: '⚡',
    flavorText: 'Zero-cost abstractions, infinite power.',
  },

  // ====== CREATIVE PACKETS ======
  {
    id: 'creative-music-theory',
    name: 'Music Theory for AI',
    category: 'creative',
    rarity: 'uncommon',
    description: 'Scales, chords, progressions, rhythm, and composition patterns.',
    knowledgePoints: 100,
    estimatedTrainingTime: 30,
    unlocksAbilities: ['Compose melodies', 'Suggest chord progressions', 'Analyze music'],
    codeExamples: 0,
    libraries: ['Music Theory', 'MIDI'],
    artPlaceholder: '🎵',
    flavorText: 'Where math becomes melody.',
  },
  {
    id: 'creative-pixel-art',
    name: 'Pixel Art Techniques',
    category: 'creative',
    rarity: 'common',
    description: 'Dithering, color palettes, animation, anti-aliasing, and sprite design.',
    knowledgePoints: 70,
    estimatedTrainingTime: 25,
    unlocksAbilities: ['Guide pixel art creation', 'Suggest palettes', 'Explain techniques'],
    codeExamples: 0,
    libraries: ['Pixel Art Theory'],
    artPlaceholder: '🖼️',
    flavorText: 'Every pixel tells a story.',
  },

  // ====== SECURITY PACKETS ======
  {
    id: 'sec-ethical-hacking',
    name: 'Ethical Hacking Fundamentals',
    category: 'security',
    rarity: 'rare',
    description: 'Reconnaissance, exploitation, privilege escalation, and secure coding.',
    knowledgePoints: 260,
    estimatedTrainingTime: 70,
    unlocksAbilities: ['Identify vulnerabilities', 'Explain attack vectors', 'Recommend mitigations'],
    codeExamples: 89,
    libraries: ['Security Tools', 'OWASP'],
    artPlaceholder: '🔐',
    flavorText: 'To defend, you must understand offense.',
  },
  {
    id: 'sec-crypto-protocols',
    name: 'Cryptographic Protocols',
    category: 'security',
    rarity: 'epic',
    description: 'TLS, key exchange, signatures, zero-knowledge proofs, and secure channels.',
    knowledgePoints: 340,
    estimatedTrainingTime: 95,
    prerequisites: ['sec-ethical-hacking'],
    unlocksAbilities: ['Implement secure protocols', 'Audit crypto code', 'Design key management'],
    codeExamples: 112,
    libraries: ['OpenSSL', 'libsodium', 'Ring'],
    artPlaceholder: '🔑',
    flavorText: 'Secrets kept, trust verified.',
  },

  // ====== ESOTERIC PACKETS ======
  {
    id: 'eso-assembly-x64',
    name: 'x64 Assembly Deep Dive',
    category: 'esoteric',
    rarity: 'legendary',
    description: 'Registers, calling conventions, SIMD, and reverse engineering patterns.',
    knowledgePoints: 450,
    estimatedTrainingTime: 130,
    unlocksAbilities: ['Read/write assembly', 'Optimize hot paths', 'Understand debuggers'],
    codeExamples: 178,
    libraries: ['x64 ASM', 'NASM', 'SIMD'],
    artPlaceholder: '💾',
    flavorText: 'Speak directly to the machine.',
  },
  {
    id: 'eso-lisp-enlightenment',
    name: 'Lisp Enlightenment',
    category: 'esoteric',
    rarity: 'mythic',
    description: 'Macros, homoiconicity, meta-programming, and the lambda calculus.',
    knowledgePoints: 600,
    estimatedTrainingTime: 180,
    unlocksAbilities: ['Think in Lisp', 'Write powerful macros', 'Understand computation'],
    codeExamples: 234,
    libraries: ['Common Lisp', 'Scheme', 'Clojure'],
    artPlaceholder: '🌟',
    flavorText: 'The language that understands itself.',
  },
];

// ================== COMPANION TRAITS ==================
export const COMPANION_TRAITS: CompanionTrait[] = [
  {
    id: 'curious',
    name: 'Curious',
    description: 'Your companion asks clarifying questions and explores edge cases.',
    effect: 'Better debugging assistance',
  },
  {
    id: 'patient',
    name: 'Patient',
    description: 'Never frustrated, always willing to explain concepts multiple ways.',
    effect: 'Enhanced teaching ability',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Suggests unconventional solutions and novel approaches.',
    effect: 'More innovative code suggestions',
  },
  {
    id: 'precise',
    name: 'Precise',
    description: 'Focuses on exact specifications and edge cases.',
    effect: 'Fewer bugs in generated code',
  },
  {
    id: 'efficient',
    name: 'Efficient',
    description: 'Prioritizes performance and resource optimization.',
    effect: 'Faster, leaner code output',
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    description: 'Treats coding as a partnership, building on your ideas.',
    effect: 'Better pair programming experience',
  },
];

// ================== LOCAL STORAGE KEYS ==================
const COMPANION_KEY = 'aura_nova_companion';
const PACKETS_KEY = 'aura_nova_training_packets';

// ================== COMPANION MANAGEMENT ==================
export function createCompanion(
  name: string, 
  personality: string,
  traits: string[],
  localModelName?: string,
  localModelPath?: string
): Companion {
  const selectedTraits = COMPANION_TRAITS.filter(t => traits.includes(t.id));
  
  const companion: Companion = {
    id: `companion_${Date.now()}`,
    name,
    personality,
    createdAt: new Date(),
    hostedLocally: !!localModelName,
    localModelName,
    localModelPath,
    totalKnowledgePoints: 0,
    knowledge: [],
    traits: selectedTraits,
    bondLevel: 10, // Starting bond
    specialAbilities: [],
    appearance: {
      avatar: '🤖',
      color: '#8b5cf6',
      aura: 'purple',
    },
  };
  
  saveCompanion(companion);
  return companion;
}

export function getCompanion(): Companion | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(COMPANION_KEY);
  if (!stored) return null;
  
  return JSON.parse(stored);
}

export function saveCompanion(companion: Companion): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPANION_KEY, JSON.stringify(companion));
}

// ================== PACKET INVENTORY ==================
export function getOwnedPackets(): string[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(PACKETS_KEY);
  if (!stored) return [];
  
  return JSON.parse(stored);
}

export function addPacketToInventory(packetId: string): void {
  const owned = getOwnedPackets();
  if (!owned.includes(packetId)) {
    owned.push(packetId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PACKETS_KEY, JSON.stringify(owned));
    }
  }
}

export function getPacketById(id: string): TrainingPacket | undefined {
  return TRAINING_PACKETS.find(p => p.id === id);
}

export function getPacketsByCategory(category: PacketCategory): TrainingPacket[] {
  return TRAINING_PACKETS.filter(p => p.category === category);
}

export function getPacketsByRarity(rarity: PacketRarity): TrainingPacket[] {
  return TRAINING_PACKETS.filter(p => p.rarity === rarity);
}

// ================== TRAINING SYSTEM ==================
export function startTraining(packetId: string): { success: boolean; message: string } {
  const companion = getCompanion();
  if (!companion) {
    return { success: false, message: 'No companion found. Create one first!' };
  }
  
  if (companion.currentlyTraining) {
    return { success: false, message: 'Companion is already training!' };
  }
  
  const packet = getPacketById(packetId);
  if (!packet) {
    return { success: false, message: 'Training packet not found!' };
  }
  
  const owned = getOwnedPackets();
  if (!owned.includes(packetId)) {
    return { success: false, message: 'You don\'t own this training packet!' };
  }
  
  // Check prerequisites
  if (packet.prerequisites) {
    const knowledge = companion.knowledge.flatMap(k => k.packetsAbsorbed);
    const missingPrereqs = packet.prerequisites.filter(p => !knowledge.includes(p));
    if (missingPrereqs.length > 0) {
      const missingNames = missingPrereqs.map(id => getPacketById(id)?.name || id);
      return { 
        success: false, 
        message: `Missing prerequisites: ${missingNames.join(', ')}` 
      };
    }
  }
  
  // Check if already trained
  const categoryKnowledge = companion.knowledge.find(k => k.category === packet.category);
  if (categoryKnowledge?.packetsAbsorbed.includes(packetId)) {
    return { success: false, message: 'Companion has already absorbed this packet!' };
  }
  
  // Start training
  const now = new Date();
  const completesAt = new Date(now.getTime() + packet.estimatedTrainingTime * 60 * 1000);
  
  companion.currentlyTraining = {
    packetId,
    startedAt: now,
    completesAt,
  };
  
  saveCompanion(companion);
  
  return { 
    success: true, 
    message: `Training started! ${companion.name} will absorb "${packet.name}" in ${packet.estimatedTrainingTime} minutes.` 
  };
}

export function checkTrainingComplete(): { 
  completed: boolean; 
  packet?: TrainingPacket;
  newAbilities?: string[];
} {
  const companion = getCompanion();
  if (!companion || !companion.currentlyTraining) {
    return { completed: false };
  }
  
  const now = new Date();
  const completesAt = new Date(companion.currentlyTraining.completesAt);
  
  if (now >= completesAt) {
    const packet = getPacketById(companion.currentlyTraining.packetId);
    if (!packet) return { completed: false };
    
    // Apply training
    let categoryKnowledge = companion.knowledge.find(k => k.category === packet.category);
    if (!categoryKnowledge) {
      categoryKnowledge = {
        category: packet.category,
        level: 0,
        packetsAbsorbed: [],
        specializations: [],
      };
      companion.knowledge.push(categoryKnowledge);
    }
    
    categoryKnowledge.packetsAbsorbed.push(packet.id);
    categoryKnowledge.level = Math.min(100, categoryKnowledge.level + Math.floor(packet.knowledgePoints / 10));
    categoryKnowledge.lastTrainedAt = now;
    
    if (packet.unlocksAbilities) {
      companion.specialAbilities.push(...packet.unlocksAbilities);
      categoryKnowledge.specializations.push(...packet.unlocksAbilities);
    }
    
    companion.totalKnowledgePoints += packet.knowledgePoints;
    companion.bondLevel = Math.min(100, companion.bondLevel + 2);
    companion.currentlyTraining = undefined;
    
    saveCompanion(companion);
    
    return { 
      completed: true, 
      packet,
      newAbilities: packet.unlocksAbilities,
    };
  }
  
  return { completed: false };
}

export function getTrainingProgress(): {
  isTraining: boolean;
  packetId?: string;
  packetName?: string;
  percentComplete: number;
  minutesRemaining: number;
} {
  const companion = getCompanion();
  if (!companion || !companion.currentlyTraining) {
    return { isTraining: false, percentComplete: 0, minutesRemaining: 0 };
  }
  
  const packet = getPacketById(companion.currentlyTraining.packetId);
  const now = new Date();
  const startedAt = new Date(companion.currentlyTraining.startedAt);
  const completesAt = new Date(companion.currentlyTraining.completesAt);
  
  const totalMs = completesAt.getTime() - startedAt.getTime();
  const elapsedMs = now.getTime() - startedAt.getTime();
  const percentComplete = Math.min(100, (elapsedMs / totalMs) * 100);
  const minutesRemaining = Math.max(0, Math.ceil((completesAt.getTime() - now.getTime()) / 60000));
  
  return {
    isTraining: true,
    packetId: companion.currentlyTraining.packetId,
    packetName: packet?.name,
    percentComplete,
    minutesRemaining,
  };
}

// ================== REWARD PACKET FROM CHALLENGES ==================
export function rewardRandomPacket(
  difficultyMultiplier: number = 1,
  preferredCategory?: PacketCategory
): TrainingPacket | null {
  const owned = getOwnedPackets();
  
  // Filter packets player doesn't own
  let available = TRAINING_PACKETS.filter(p => !owned.includes(p.id));
  
  // Apply category preference if specified
  if (preferredCategory) {
    const categoryPackets = available.filter(p => p.category === preferredCategory);
    if (categoryPackets.length > 0) {
      available = categoryPackets;
    }
  }
  
  if (available.length === 0) return null;
  
  // Weighted random based on rarity and difficulty
  const weights: Record<PacketRarity, number> = {
    common: 50,
    uncommon: 30,
    rare: 15 * difficultyMultiplier,
    epic: 4 * difficultyMultiplier,
    legendary: 1 * difficultyMultiplier,
    mythic: 0.2 * difficultyMultiplier,
  };
  
  const weightedPackets: { packet: TrainingPacket; weight: number }[] = available.map(p => ({
    packet: p,
    weight: weights[p.rarity],
  }));
  
  const totalWeight = weightedPackets.reduce((sum, wp) => sum + wp.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const wp of weightedPackets) {
    random -= wp.weight;
    if (random <= 0) {
      addPacketToInventory(wp.packet.id);
      return wp.packet;
    }
  }
  
  // Fallback
  const fallback = available[0];
  addPacketToInventory(fallback.id);
  return fallback;
}

// ================== COMPANION STATS ==================
export function getCompanionStats(): {
  totalKnowledge: number;
  categoriesLearned: number;
  packetsAbsorbed: number;
  specialAbilities: number;
  bondLevel: number;
  strongestCategory?: { category: PacketCategory; level: number };
} {
  const companion = getCompanion();
  if (!companion) {
    return {
      totalKnowledge: 0,
      categoriesLearned: 0,
      packetsAbsorbed: 0,
      specialAbilities: 0,
      bondLevel: 0,
    };
  }
  
  const packetsAbsorbed = companion.knowledge.reduce(
    (sum, k) => sum + k.packetsAbsorbed.length, 
    0
  );
  
  const strongestCategory = companion.knowledge.length > 0
    ? companion.knowledge.reduce((prev, curr) => 
        curr.level > prev.level ? curr : prev
      )
    : undefined;
  
  return {
    totalKnowledge: companion.totalKnowledgePoints,
    categoriesLearned: companion.knowledge.length,
    packetsAbsorbed,
    specialAbilities: companion.specialAbilities.length,
    bondLevel: companion.bondLevel,
    strongestCategory: strongestCategory 
      ? { category: strongestCategory.category, level: strongestCategory.level }
      : undefined,
  };
}

// ================== EXPORTS ==================
export const CompanionTrainingService = {
  createCompanion,
  getCompanion,
  saveCompanion,
  getOwnedPackets,
  addPacketToInventory,
  getPacketById,
  getPacketsByCategory,
  getPacketsByRarity,
  startTraining,
  checkTrainingComplete,
  getTrainingProgress,
  rewardRandomPacket,
  getCompanionStats,
  TRAINING_PACKETS,
  COMPANION_TRAITS,
};

export default CompanionTrainingService;
