'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Send, Share2, Download, LogOut, Trophy, Clock } from 'lucide-react';
import { CollaborativeWritingService, WritingSession, WritingVibe, WritingParticipant } from '@/services/collaborativeWritingService';
import toast from 'react-hot-toast';

export default function CollaborativeWritingPage() {
  const [activeSection, setActiveSection] = useState<'browse' | 'session' | 'history'>('browse');
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  const [currentUser, setCurrentUser] = useState<WritingParticipant | null>(null);
  const [inputText, setInputText] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const vibes = CollaborativeWritingService.getVibes();
  const themes = CollaborativeWritingService.getThemes();
  const prompts = CollaborativeWritingService.getPrompts();

  // CREATE SESSION
  const handleCreateSession = (vibeName: string) => {
    const vibe = vibes.find(v => v.name === vibeName);
    if (!vibe) return;

    const newSession = CollaborativeWritingService.createSession(
      `${vibe.name} Writing Session`,
      `Let's write together in a ${vibe.name} atmosphere`,
      vibe.name as WritingVibe
    );

    // Add current user as creator
    const user: WritingParticipant = {
      id: `user_${Date.now()}`,
      name: 'You',
      avatar: '👤',
      color: '#8b5cf6',
      joinedAt: new Date(),
      isActive: true,
      contributedWords: 0,
      lastActivity: new Date(),
    };

    newSession.currentParticipants = [user];
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    setCurrentUser(user);
    setActiveSection('session');
    toast.success(`Session created: ${newSession.title}`);
  };

  // JOIN SESSION
  const handleJoinSession = (session: WritingSession, userName: string) => {
    const newUser: WritingParticipant = {
      id: `user_${Date.now()}`,
      name: userName,
      avatar: ['👤', '🧑', '👨', '👩'][Math.floor(Math.random() * 4)],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      joinedAt: new Date(),
      isActive: true,
      contributedWords: 0,
      lastActivity: new Date(),
    };

    session.currentParticipants.push(newUser);
    setCurrentSession(session);
    setCurrentUser(newUser);
    setActiveSection('session');
    toast.success(`Joined "${session.title}"`);
  };

  // ADD CONTENT
  const handleAddContent = () => {
    if (!currentSession || !currentUser || !inputText.trim()) return;

    currentSession.content += (currentSession.content ? '\n' : '') + inputText;
    currentUser.contributedWords += inputText.split(/\s+/).length;
    currentUser.lastActivity = new Date();

    setCurrentSession({ ...currentSession });
    setCurrentUser({ ...currentUser });
    setInputText('');
    toast.success('Added to writing session!');
  };

  // LEAVE SESSION
  const handleLeaveSession = () => {
    if (!currentSession || !currentUser) return;

    currentSession.currentParticipants = currentSession.currentParticipants.filter(
      p => p.id !== currentUser.id
    );

    setCurrentSession(null);
    setCurrentUser(null);
    setActiveSection('browse');
    toast.success('Left session');
  };

  // GET STATISTICS
  const getStats = () => {
    if (!currentSession) return null;
    return CollaborativeWritingService.calculateStatistics(currentSession);
  };

  // GET LEADERBOARD
  const getLeaderboard = () => {
    if (!currentSession) return [];
    return CollaborativeWritingService.getLeaderboard(currentSession);
  };

  const stats = getStats();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            💬 Collaborative Writing
          </h1>
          <p className="text-slate-400">Write together, vibe together</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-4">
          <button
            onClick={() => setActiveSection('browse')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeSection === 'browse'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🌍 Browse Sessions
          </button>
          {currentSession && (
            <button
              onClick={() => setActiveSection('session')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeSection === 'session'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              ✏️ Active Session
            </button>
          )}
          <button
            onClick={() => setActiveSection('history')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeSection === 'history'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📚 History ({sessions.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* BROWSE VIBES */}
        {activeSection === 'browse' && !currentSession && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">🎭 Choose Your Writing Vibe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vibes.map(vibe => (
                  <div
                    key={vibe.name}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-indigo-500 transition-colors"
                    style={{ borderLeftWidth: '4px', borderLeftColor: vibe.color }}
                  >
                    <div className="text-3xl mb-2">{vibe.emoji}</div>
                    <h3 className="font-bold text-lg mb-1">{vibe.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{vibe.description}</p>
                    <div className="flex gap-1 mb-3 flex-wrap">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                        {vibe.pace}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                        {vibe.focus}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCreateSession(vibe.name)}
                      className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold text-sm transition-colors"
                    >
                      Start Session
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMPTS */}
            <div>
              <h2 className="text-2xl font-bold mb-4">💡 Writing Prompts</h2>
              <div className="space-y-3">
                {prompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold mb-1">{prompt.title}</h3>
                        <p className="text-sm text-slate-400 mb-2">{prompt.description}</p>
                      </div>
                      <span className="text-2xl">{prompt.emoji}</span>
                    </div>
                    <p className="text-sm italic text-slate-300 mb-3">"{prompt.starter}"</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-800 rounded">
                        📝 {prompt.targetWords} words
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded">
                        ⏱️ {prompt.timeLimit} min
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded">
                        🎯 {prompt.theme}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE SESSION */}
        {activeSection === 'session' && currentSession && currentUser && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left - Sidebar */}
            <div className="col-span-1 space-y-4">
              {/* Session Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h2 className="font-bold mb-3">{currentSession.title}</h2>
                <p className="text-sm text-slate-400 mb-3">{currentSession.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vibe</span>
                    <span className="font-semibold">{currentSession.vibe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Theme</span>
                    <span className="font-semibold">{currentSession.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Participants</span>
                    <span className="font-semibold">
                      {currentSession.currentParticipants.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLeaveSession}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Session
                </button>
              </div>

              {/* Participants */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="font-bold mb-3">👥 Writers ({currentSession.currentParticipants.length})</h3>
                <div className="space-y-2">
                  {currentSession.currentParticipants.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 bg-slate-950 rounded text-sm"
                      style={{ borderLeftWidth: '3px', borderLeftColor: p.color }}
                    >
                      <span className="text-lg">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.contributedWords} words
                        </p>
                      </div>
                      {p.isActive && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="font-bold mb-3">📊 Session Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Words</span>
                      <span className="font-semibold">{stats.totalWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lines</span>
                      <span className="font-semibold">{stats.totalLines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Line</span>
                      <span className="font-semibold">
                        {stats.averageLineLength.toFixed(1)} words
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Readability</span>
                      <span className="font-semibold">{stats.readabilityScore}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
              </button>

              {showLeaderboard && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="font-bold mb-3">🏆 Leaderboard</h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 p-2 bg-slate-950 rounded text-sm"
                      >
                        <span className="font-bold w-6 text-center">#{idx + 1}</span>
                        <span className="text-lg">{entry.avatar}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.name}</p>
                        </div>
                        <span className="font-bold text-indigo-400">
                          {entry.wordCount}w
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center - Editor */}
            <div className="col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col h-96">
                <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-950 rounded border border-slate-700">
                  <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
                    {currentSession.content || 'Start writing...'}
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        handleAddContent();
                      }
                    }}
                    placeholder="Type your contribution (Ctrl+Enter to send)..."
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white resize-none focus:outline-none focus:border-indigo-500 text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleAddContent}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold flex items-center justify-center gap-2 transition-colors h-full"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Word count */}
                <p className="text-xs text-slate-500 mt-2">
                  {currentSession.content.split(/\s+/).length - 1} words
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeSection === 'history' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No sessions yet. Create your first one!</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{session.title}</h3>
                      <p className="text-sm text-slate-400 mb-2">{session.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                          {session.vibe}
                        </span>
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                          {session.theme}
                        </span>
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                          👥 {session.currentParticipants.length}
                        </span>
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                          📝 {session.content.split(/\s+/).length - 1} words
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
