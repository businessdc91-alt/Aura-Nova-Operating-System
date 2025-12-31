'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, Trophy, Code, Terminal, Lightbulb,
  Sparkles, Gift, Lock, Unlock, Star, Zap, ChevronRight, Book,
  Cpu, AlertCircle, CheckCircle, XCircle, Clock, Award, Flame
} from 'lucide-react';

// ============================================================================
// CODING SANDBOX - CUSTOM LANGUAGE & COMMAND SYSTEM
// Learn to code, solve challenges, earn rewards, unlock secrets
// ============================================================================

// ============ NOVACODE LANGUAGE SPECIFICATION ============
// A beginner-friendly language with creative twists

interface Token {
  type: 'keyword' | 'identifier' | 'number' | 'string' | 'operator' | 'punctuation' | 'comment';
  value: string;
  line: number;
  column: number;
}

interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  variables: Record<string, any>;
  executionTime: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  starterCode: string;
  expectedOutput?: string[];
  testCases?: { input: string; expected: string }[];
  hints: string[];
  reward: { xp: number; coins: number; badge?: string };
  isSecret?: boolean;
  unlockCondition?: string;
}

interface PlayerProgress {
  xp: number;
  level: number;
  coins: number;
  badges: string[];
  completedChallenges: string[];
  unlockedSecrets: string[];
  streak: number;
  totalExecutions: number;
}

// NovaCode Keywords
const KEYWORDS = [
  'create', 'set', 'if', 'else', 'loop', 'times', 'while', 'function',
  'return', 'print', 'input', 'true', 'false', 'and', 'or', 'not',
  'break', 'continue', 'for', 'in', 'end', 'cast', 'summon', 'invoke'
];

// NovaCode Interpreter
class NovaCodeInterpreter {
  private variables: Record<string, any> = {};
  private functions: Record<string, { params: string[]; body: string[] }> = {};
  private output: string[] = [];
  private inputQueue: string[] = [];

  constructor(inputs: string[] = []) {
    this.inputQueue = [...inputs];
  }

  execute(code: string): ExecutionResult {
    const startTime = performance.now();
    this.variables = {};
    this.functions = {};
    this.output = [];

    try {
      const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      this.executeBlock(lines, 0, lines.length);

      return {
        success: true,
        output: this.output,
        variables: { ...this.variables },
        executionTime: performance.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        output: this.output,
        error: error.message || 'Unknown error',
        variables: { ...this.variables },
        executionTime: performance.now() - startTime,
      };
    }
  }

  private executeBlock(lines: string[], start: number, end: number): any {
    let i = start;
    while (i < end) {
      const line = lines[i];
      if (!line) { i++; continue; }

      // Variable creation: create x = 5
      if (line.startsWith('create ')) {
        const match = line.match(/^create\s+(\w+)\s*=\s*(.+)$/);
        if (match) {
          this.variables[match[1]] = this.evaluateExpression(match[2]);
        }
        i++;
        continue;
      }

      // Variable assignment: set x = 10
      if (line.startsWith('set ')) {
        const match = line.match(/^set\s+(\w+)\s*=\s*(.+)$/);
        if (match) {
          if (!(match[1] in this.variables)) {
            throw new Error(`Variable '${match[1]}' not found. Use 'create' first.`);
          }
          this.variables[match[1]] = this.evaluateExpression(match[2]);
        }
        i++;
        continue;
      }

      // Print: print "Hello" or print x
      if (line.startsWith('print ')) {
        const content = line.slice(6).trim();
        const value = this.evaluateExpression(content);
        this.output.push(String(value));
        i++;
        continue;
      }

      // Cast spell (fun alias for print): cast "message"
      if (line.startsWith('cast ')) {
        const content = line.slice(5).trim();
        const value = this.evaluateExpression(content);
        this.output.push(`✨ ${value}`);
        i++;
        continue;
      }

      // Summon (create with flair): summon hero = "Knight"
      if (line.startsWith('summon ')) {
        const match = line.match(/^summon\s+(\w+)\s*=\s*(.+)$/);
        if (match) {
          this.variables[match[1]] = this.evaluateExpression(match[2]);
          this.output.push(`🌟 ${match[1]} has been summoned!`);
        }
        i++;
        continue;
      }

      // Loop: loop 5 times ... end
      if (line.startsWith('loop ')) {
        const match = line.match(/^loop\s+(.+)\s+times$/);
        if (match) {
          const times = this.evaluateExpression(match[1]);
          const endIdx = this.findMatchingEnd(lines, i);
          for (let j = 0; j < times; j++) {
            this.executeBlock(lines, i + 1, endIdx);
          }
          i = endIdx + 1;
          continue;
        }
      }

      // If statement: if condition ... end
      if (line.startsWith('if ')) {
        const condition = line.slice(3).trim();
        const endIdx = this.findMatchingEnd(lines, i);
        const elseIdx = this.findElse(lines, i, endIdx);

        if (this.evaluateCondition(condition)) {
          this.executeBlock(lines, i + 1, elseIdx || endIdx);
        } else if (elseIdx) {
          this.executeBlock(lines, elseIdx + 1, endIdx);
        }
        i = endIdx + 1;
        continue;
      }

      // While loop: while condition ... end
      if (line.startsWith('while ')) {
        const condition = line.slice(6).trim();
        const endIdx = this.findMatchingEnd(lines, i);
        let iterations = 0;
        while (this.evaluateCondition(condition) && iterations < 1000) {
          this.executeBlock(lines, i + 1, endIdx);
          iterations++;
        }
        i = endIdx + 1;
        continue;
      }

      // Function definition: function name(params) ... end
      if (line.startsWith('function ')) {
        const match = line.match(/^function\s+(\w+)\s*\(([^)]*)\)$/);
        if (match) {
          const name = match[1];
          const params = match[2].split(',').map(p => p.trim()).filter(Boolean);
          const endIdx = this.findMatchingEnd(lines, i);
          this.functions[name] = {
            params,
            body: lines.slice(i + 1, endIdx),
          };
          i = endIdx + 1;
          continue;
        }
      }

      // Function call: invoke name(args)
      if (line.startsWith('invoke ')) {
        const match = line.match(/^invoke\s+(\w+)\s*\(([^)]*)\)$/);
        if (match) {
          this.callFunction(match[1], match[2]);
        }
        i++;
        continue;
      }

      // Return: return value
      if (line.startsWith('return ')) {
        return this.evaluateExpression(line.slice(7).trim());
      }

      // End keyword (handled by other constructs)
      if (line === 'end') {
        i++;
        continue;
      }

      i++;
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();

    // String literal
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // Number
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }

    // Boolean
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    // Variable
    if (/^\w+$/.test(expr)) {
      if (expr in this.variables) {
        return this.variables[expr];
      }
      throw new Error(`Unknown variable: ${expr}`);
    }

    // Arithmetic expressions
    const ops = ['+', '-', '*', '/', '%'];
    for (const op of ops) {
      const parts = expr.split(op);
      if (parts.length >= 2) {
        const left = this.evaluateExpression(parts[0]);
        const right = this.evaluateExpression(parts.slice(1).join(op));
        switch (op) {
          case '+': return typeof left === 'string' ? left + right : left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
        }
      }
    }

    return expr;
  }

  private evaluateCondition(condition: string): boolean {
    // Handle 'and' and 'or'
    if (condition.includes(' and ')) {
      const parts = condition.split(' and ');
      return parts.every(p => this.evaluateCondition(p.trim()));
    }
    if (condition.includes(' or ')) {
      const parts = condition.split(' or ');
      return parts.some(p => this.evaluateCondition(p.trim()));
    }

    // Handle 'not'
    if (condition.startsWith('not ')) {
      return !this.evaluateCondition(condition.slice(4).trim());
    }

    // Comparison operators
    const comparisons = ['>=', '<=', '!=', '==', '>', '<'];
    for (const op of comparisons) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => this.evaluateExpression(s.trim()));
        switch (op) {
          case '==': return left === right;
          case '!=': return left !== right;
          case '>': return left > right;
          case '<': return left < right;
          case '>=': return left >= right;
          case '<=': return left <= right;
        }
      }
    }

    // Just evaluate as expression
    return Boolean(this.evaluateExpression(condition));
  }

  private findMatchingEnd(lines: string[], start: number): number {
    let depth = 1;
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('if ') || line.startsWith('loop ') || 
          line.startsWith('while ') || line.startsWith('function ')) {
        depth++;
      }
      if (line === 'end') {
        depth--;
        if (depth === 0) return i;
      }
    }
    throw new Error("Missing 'end' keyword");
  }

  private findElse(lines: string[], start: number, end: number): number | null {
    let depth = 1;
    for (let i = start + 1; i < end; i++) {
      const line = lines[i];
      if (line.startsWith('if ')) depth++;
      if (line === 'end') depth--;
      if (line === 'else' && depth === 1) return i;
    }
    return null;
  }

  private callFunction(name: string, argsStr: string): any {
    const func = this.functions[name];
    if (!func) throw new Error(`Function '${name}' not found`);

    const args = argsStr.split(',').map(a => this.evaluateExpression(a.trim()));
    const savedVars = { ...this.variables };

    func.params.forEach((param, idx) => {
      this.variables[param] = args[idx];
    });

    const result = this.executeBlock(func.body, 0, func.body.length);
    this.variables = savedVars;
    return result;
  }
}

// ============ CHALLENGES ============
const CHALLENGES: Challenge[] = [
  {
    id: 'hello-world',
    title: 'Hello Nova!',
    description: 'Print "Hello Nova!" to the console.',
    difficulty: 'beginner',
    starterCode: '// Print a greeting\nprint "Hello Nova!"',
    expectedOutput: ['Hello Nova!'],
    hints: ['Use the print keyword followed by your message in quotes'],
    reward: { xp: 50, coins: 10 },
  },
  {
    id: 'variables',
    title: 'Variable Magic',
    description: 'Create a variable called "hero" with value "Knight" and print it.',
    difficulty: 'beginner',
    starterCode: '// Create and print a variable\ncreate hero = "Knight"\nprint hero',
    expectedOutput: ['Knight'],
    hints: ['Use create to make a variable', 'Use print to display it'],
    reward: { xp: 75, coins: 15 },
  },
  {
    id: 'math-wizard',
    title: 'Math Wizard',
    description: 'Create two numbers, add them, and print the result.',
    difficulty: 'beginner',
    starterCode: '// Add two numbers\ncreate a = 10\ncreate b = 25\ncreate sum = a + b\nprint sum',
    expectedOutput: ['35'],
    hints: ['Use + to add numbers'],
    reward: { xp: 100, coins: 20 },
  },
  {
    id: 'loop-master',
    title: 'Loop Master',
    description: 'Print "Power!" exactly 5 times using a loop.',
    difficulty: 'intermediate',
    starterCode: '// Loop 5 times\nloop 5 times\n  print "Power!"\nend',
    expectedOutput: ['Power!', 'Power!', 'Power!', 'Power!', 'Power!'],
    hints: ['Use loop N times ... end'],
    reward: { xp: 150, coins: 30 },
  },
  {
    id: 'decision-maker',
    title: 'Decision Maker',
    description: 'If score > 50, print "Winner!", otherwise print "Try again".',
    difficulty: 'intermediate',
    starterCode: 'create score = 75\n\nif score > 50\n  print "Winner!"\nelse\n  print "Try again"\nend',
    expectedOutput: ['Winner!'],
    hints: ['Use if condition ... else ... end'],
    reward: { xp: 175, coins: 35, badge: 'Logic Master' },
  },
  {
    id: 'counter',
    title: 'The Counter',
    description: 'Count from 1 to 5, printing each number.',
    difficulty: 'intermediate',
    starterCode: 'create count = 1\n\nwhile count <= 5\n  print count\n  set count = count + 1\nend',
    expectedOutput: ['1', '2', '3', '4', '5'],
    hints: ['Use while loop', 'Increment the counter'],
    reward: { xp: 200, coins: 40 },
  },
  {
    id: 'spell-caster',
    title: 'Spell Caster',
    description: 'Use the special cast command to conjure a magic message!',
    difficulty: 'beginner',
    starterCode: '// Cast a spell!\ncast "Abracadabra!"',
    expectedOutput: ['✨ Abracadabra!'],
    hints: ['cast adds sparkles to your output'],
    reward: { xp: 100, coins: 25, badge: 'Apprentice Mage' },
  },
  {
    id: 'summoner',
    title: 'The Summoner',
    description: 'Summon a creature and watch it appear!',
    difficulty: 'beginner',
    starterCode: '// Summon a dragon\nsummon dragon = "Fire Dragon"\nprint dragon',
    expectedOutput: ['🌟 dragon has been summoned!', 'Fire Dragon'],
    hints: ['summon creates variables with flair'],
    reward: { xp: 125, coins: 30, badge: 'Summoner' },
  },
  {
    id: 'function-creator',
    title: 'Function Creator',
    description: 'Create a function called greet that prints "Hello, Nova Coder!"',
    difficulty: 'advanced',
    starterCode: 'function greet()\n  print "Hello, Nova Coder!"\nend\n\ninvoke greet()',
    expectedOutput: ['Hello, Nova Coder!'],
    hints: ['Use function name() ... end to define', 'Use invoke to call it'],
    reward: { xp: 300, coins: 60, badge: 'Function Master' },
  },
  {
    id: 'secret-fibonacci',
    title: '???SECRET???',
    description: 'Print the first 10 Fibonacci numbers.',
    difficulty: 'expert',
    starterCode: '// Can you solve this mystery?',
    expectedOutput: ['1', '1', '2', '3', '5', '8', '13', '21', '34', '55'],
    hints: ['Each number is the sum of the two before it'],
    reward: { xp: 500, coins: 100, badge: 'Secret Solver' },
    isSecret: true,
    unlockCondition: 'Complete 5 challenges',
  },
];

export const CodingSandbox: React.FC = () => {
  const [code, setCode] = useState(CHALLENGES[0].starterCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'challenges' | 'rewards'>('code');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'input' | 'output' | 'error'; content: string }[]>([]);
  
  const [progress, setProgress] = useState<PlayerProgress>({
    xp: 0,
    level: 1,
    coins: 0,
    badges: [],
    completedChallenges: [],
    unlockedSecrets: [],
    streak: 0,
    totalExecutions: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const xpToNextLevel = progress.level * 200;

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setError(null);
    setOutput([]);

    setTimeout(() => {
      const interpreter = new NovaCodeInterpreter();
      const result = interpreter.execute(code);

      setOutput(result.output);
      if (!result.success) {
        setError(result.error || 'Unknown error');
      }

      // Update progress
      setProgress(prev => ({
        ...prev,
        totalExecutions: prev.totalExecutions + 1,
      }));

      // Check challenge completion
      if (selectedChallenge && result.success && selectedChallenge.expectedOutput) {
        const isComplete = JSON.stringify(result.output) === JSON.stringify(selectedChallenge.expectedOutput);
        if (isComplete && !progress.completedChallenges.includes(selectedChallenge.id)) {
          const newXp = progress.xp + selectedChallenge.reward.xp;
          const newCoins = progress.coins + selectedChallenge.reward.coins;
          const newBadges = selectedChallenge.reward.badge 
            ? [...progress.badges, selectedChallenge.reward.badge]
            : progress.badges;
          const newLevel = Math.floor(newXp / 200) + 1;

          setProgress(prev => ({
            ...prev,
            xp: newXp,
            coins: newCoins,
            badges: newBadges,
            level: newLevel,
            completedChallenges: [...prev.completedChallenges, selectedChallenge.id],
            streak: prev.streak + 1,
          }));

          setOutput(prev => [
            ...prev,
            '',
            '🎉 CHALLENGE COMPLETE!',
            `+${selectedChallenge.reward.xp} XP`,
            `+${selectedChallenge.reward.coins} Coins`,
            ...(selectedChallenge.reward.badge ? [`🏆 Badge: ${selectedChallenge.reward.badge}`] : []),
          ]);
        }
      }

      setIsRunning(false);
    }, 300);
  }, [code, selectedChallenge, progress]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalHistory(prev => [...prev, { type: 'input', content: `> ${cmd}` }]);

    // Process commands
    if (cmd === 'help') {
      setTerminalHistory(prev => [...prev, { 
        type: 'output', 
        content: 'Commands: help, clear, run, status, challenges, hint, exit' 
      }]);
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
    } else if (cmd === 'run') {
      runCode();
      setTerminalHistory(prev => [...prev, { type: 'output', content: 'Executing code...' }]);
    } else if (cmd === 'status') {
      setTerminalHistory(prev => [...prev, { 
        type: 'output', 
        content: `Level: ${progress.level} | XP: ${progress.xp}/${xpToNextLevel} | Coins: ${progress.coins}` 
      }]);
    } else if (cmd === 'challenges') {
      setActiveTab('challenges');
      setTerminalHistory(prev => [...prev, { type: 'output', content: 'Opening challenges...' }]);
    } else if (cmd === 'hint' && selectedChallenge) {
      const hint = selectedChallenge.hints[0];
      setTerminalHistory(prev => [...prev, { type: 'output', content: `💡 ${hint}` }]);
    } else {
      setTerminalHistory(prev => [...prev, { type: 'error', content: `Unknown command: ${cmd}` }]);
    }

    setTerminalInput('');
  };

  const loadChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setCode(challenge.starterCode);
    setOutput([]);
    setError(null);
    setShowHints(false);
    setActiveTab('code');
  };

  const availableChallenges = CHALLENGES.filter(c => {
    if (c.isSecret && progress.completedChallenges.length < 5) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Code className="w-6 h-6 text-purple-400" />
          <h1 className="font-bold text-lg">NovaCode Sandbox</h1>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Lv.{progress.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>{progress.xp}/{xpToNextLevel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>{progress.coins}</span>
          </div>
          {progress.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-4 h-4" />
              <span>{progress.streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'code' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Code
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'challenges' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Challenges
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'rewards' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Rewards
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedChallenge && (
                <div className="p-3 bg-purple-900/20 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedChallenge.title}</h3>
                      <p className="text-sm text-slate-400">{selectedChallenge.description}</p>
                    </div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="p-2 hover:bg-white/10 rounded-lg text-yellow-400"
                    >
                      <Lightbulb className="w-5 h-5" />
                    </button>
                  </div>
                  {showHints && (
                    <div className="mt-2 p-2 bg-yellow-900/20 rounded-lg text-sm text-yellow-300">
                      {selectedChallenge.hints.map((hint, i) => (
                        <p key={i}>💡 {hint}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-2 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-slate-800/50 rounded-lg p-4 font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="// Write your NovaCode here..."
                  spellCheck={false}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 p-2 border-t border-slate-700/50">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg font-medium"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Run
                </button>
                <button
                  onClick={() => setCode('')}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className="ml-auto px-3 py-2 hover:bg-white/10 rounded-lg text-sm"
                >
                  <Book className="w-4 h-4 inline mr-1" />
                  Challenges
                </button>
              </div>
            </div>

            {/* Output/Terminal */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700/50 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Output</span>
              </div>
              
              <div className="flex-1 p-3 font-mono text-sm overflow-auto bg-slate-950/50">
                {error ? (
                  <div className="flex items-start gap-2 text-red-400">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : output.length > 0 ? (
                  output.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                      <span className={line.startsWith('🎉') ? 'text-yellow-400 font-bold' : ''}>{line}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">// Output will appear here</span>
                )}
              </div>

              {/* Mini Terminal */}
              <div className="border-t border-slate-700/50">
                <div 
                  ref={terminalRef}
                  className="h-24 p-2 text-xs font-mono overflow-auto bg-slate-950"
                >
                  {terminalHistory.map((item, i) => (
                    <div 
                      key={i} 
                      className={
                        item.type === 'error' ? 'text-red-400' :
                        item.type === 'input' ? 'text-cyan-400' : 'text-slate-300'
                      }
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleTerminalSubmit} className="flex border-t border-slate-700/50">
                  <span className="px-2 py-1 text-green-400 text-sm">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type 'help' for commands..."
                    className="flex-1 bg-transparent text-sm outline-none py-1"
                  />
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="h-full overflow-auto p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableChallenges.map((challenge) => {
                const isCompleted = progress.completedChallenges.includes(challenge.id);
                const isLocked = challenge.isSecret && progress.completedChallenges.length < 5;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => !isLocked && loadChallenge(challenge)}
                    disabled={isLocked}
                    className={`
                      p-4 rounded-xl text-left transition-all
                      ${isCompleted 
                        ? 'bg-green-900/30 border border-green-500/30' 
                        : isLocked
                          ? 'bg-slate-800/30 border border-slate-700/30 opacity-50 cursor-not-allowed'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        {isLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <CheckCircle className="w-4 h-4 text-green-400" /> : null}
                        {challenge.title}
                      </h3>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${challenge.difficulty === 'beginner' ? 'bg-green-900/50 text-green-400' :
                          challenge.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-400' :
                          challenge.difficulty === 'advanced' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-red-900/50 text-red-400'}
                      `}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {challenge.reward.xp} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {challenge.reward.coins}
                      </span>
                      {challenge.reward.badge && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <Trophy className="w-3 h-3" />
                          Badge
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="h-full overflow-auto p-4">
            {/* Level Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">Level {progress.level}</span>
                <span className="text-sm text-slate-400">{progress.xp} / {xpToNextLevel} XP</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                  style={{ width: `${(progress.xp % 200) / 2}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <Gift className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{progress.coins}</div>
                <div className="text-xs text-slate-400">Coins</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{progress.completedChallenges.length}</div>
                <div className="text-xs text-slate-400">Completed</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{progress.streak}</div>
                <div className="text-xs text-slate-400">Streak</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <Cpu className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{progress.totalExecutions}</div>
                <div className="text-xs text-slate-400">Runs</div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-3">
                {progress.badges.length > 0 ? (
                  progress.badges.map((badge, i) => (
                    <div key={i} className="px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-full border border-purple-500/30 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{badge}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">Complete challenges to earn badges!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingSandbox;
