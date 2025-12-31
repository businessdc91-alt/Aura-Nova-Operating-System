'use client';

import React, { useState } from 'react';
import { Music, Plus, Play, Pause, Save, Download, Trash2, Zap, Settings } from 'lucide-react';
import { MusicComposerService, MusicComposition, MusicalTrack } from '@/services/musicComposerService';
import toast from 'react-hot-toast';

export default function MusicComposerPage() {
  const [composition, setComposition] = useState<MusicComposition>(
    MusicComposerService.createComposition('Untitled Composition', 'You', 'Electronic', 'Peaceful')
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicalTrack | null>(null);
  const [showTrackSettings, setShowTrackSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'settings' | 'scales'>('tracks');

  const allScales = MusicComposerService.getScales();
  const allInstruments = MusicComposerService.getInstruments();
  const allMoods = MusicComposerService.getMoods();
  const allGenres = MusicComposerService.getGenres();

  const handleAddTrack = () => {
    const newTrack = MusicComposerService.createTrack(
      `Track ${composition.tracks.length + 1}`,
      'piano'
    );
    setComposition({
      ...composition,
      tracks: [...composition.tracks, newTrack],
    });
    toast.success('Track added!');
  };

  const handleDeleteTrack = (trackId: string) => {
    setComposition({
      ...composition,
      tracks: composition.tracks.filter(t => t.id !== trackId),
    });
    setSelectedTrack(null);
    toast.success('Track deleted');
  };

  const handleUpdateTrackVolume = (trackId: string, volume: number) => {
    setComposition({
      ...composition,
      tracks: composition.tracks.map(t =>
        t.id === trackId ? MusicComposerService.setVolume(t, volume) : t
      ),
    });
  };

  const handleToggleMute = (trackId: string) => {
    setComposition({
      ...composition,
      tracks: composition.tracks.map(t =>
        t.id === trackId ? MusicComposerService.toggleMute(t) : t
      ),
    });
  };

  const handleApplyEffect = (trackId: string, effectType: 'reverb' | 'delay' | 'chorus' | 'distortion', value: number) => {
    const track = composition.tracks.find(t => t.id === trackId);
    if (track) {
      const updated = MusicComposerService.applyEffect(track, effectType, value);
      setComposition({
        ...composition,
        tracks: composition.tracks.map(t => (t.id === trackId ? updated : t)),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold">🎵 Music Composer</h1>
                <p className="text-slate-400">Create, arrange, and produce music collaboratively</p>
              </div>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar - Composition Info */}
        <div className="col-span-3 space-y-4">
          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4">📋 Composition</h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={composition.title}
                  onChange={(e) => setComposition({ ...composition, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Artist</label>
                <input
                  type="text"
                  value={composition.artist}
                  onChange={(e) => setComposition({ ...composition, artist: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">BPM: {composition.bpm}</label>
                <input
                  type="range"
                  min="40"
                  max="300"
                  value={composition.bpm}
                  onChange={(e) =>
                    setComposition(
                      MusicComposerService.setTempo(composition, parseInt(e.target.value))
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Genre</label>
                <select
                  value={composition.genre}
                  onChange={(e) => setComposition({ ...composition, genre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                >
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {allMoods.slice(0, 4).map(mood => (
                    <button
                      key={mood.name}
                      onClick={() => setComposition({ ...composition, mood: mood.name })}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        composition.mood === mood.name
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mood.emoji} {mood.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">📊 Stats</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>
                <span className="font-semibold">Tracks:</span> {composition.tracks.length}
              </p>
              <p>
                <span className="font-semibold">Instruments:</span>{' '}
                {new Set(composition.tracks.map(t => t.instrument)).size}
              </p>
              <p>
                <span className="font-semibold">Duration:</span>{' '}
                {Math.round(composition.bpm)} BPM
              </p>
            </div>
          </div>
        </div>

        {/* Center - DAW Mixer */}
        <div className="col-span-6 space-y-4">
          {/* Tracks */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🎚️ Mixer</h2>
              <button
                onClick={handleAddTrack}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Track
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {composition.tracks.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">
                  No tracks yet. Click "Add Track" to start composing!
                </p>
              ) : (
                composition.tracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`p-3 rounded border transition-all cursor-pointer ${
                      selectedTrack?.id === track.id
                        ? 'bg-purple-900 border-purple-500'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{track.name}</h4>
                        <p className="text-xs text-slate-400">{track.instrument}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrack(track.id);
                        }}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs w-8">Vol</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) =>
                          handleUpdateTrackVolume(track.id, parseInt(e.target.value))
                        }
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-right">{track.volume}%</span>
                    </div>

                    {/* Mute Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMute(track.id);
                      }}
                      className={`w-full px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        track.muted
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {track.muted ? '🔇 Muted' : '🔊 Unmuted'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Piano Roll / Note Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4">⌨️ Piano Roll</h2>
            {selectedTrack ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Edit notes for: <span className="font-semibold">{selectedTrack.name}</span>
                </p>
                <div className="bg-slate-950 rounded p-4 h-48 flex items-center justify-center border border-slate-700">
                  <p className="text-slate-500 text-center">
                    Piano roll interface coming soon! 🎹
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 rounded p-4 h-48 flex items-center justify-center border border-slate-700">
                <p className="text-slate-500">Select a track to edit notes</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings & Tools */}
        <div className="col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('tracks')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'tracks'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Tracks
            </button>
            <button
              onClick={() => setActiveTab('scales')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'scales'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Scales
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Effects
            </button>
          </div>

          {/* Track Settings */}
          {activeTab === 'tracks' && selectedTrack && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold">🎵 {selectedTrack.name}</h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Instrument</label>
                <select
                  value={selectedTrack.instrument}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                >
                  {allInstruments.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Pan</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedTrack.pan}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Scales & Theory */}
          {activeTab === 'scales' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold">🎼 Scales</h3>
              <div className="space-y-2">
                {allScales.map(scale => (
                  <button
                    key={scale.name}
                    className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    <p className="font-semibold text-sm">{scale.name}</p>
                    <p className="text-xs text-slate-400">{scale.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {scale.notes.join(' - ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Effects */}
          {activeTab === 'settings' && selectedTrack && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Effects
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Reverb: {selectedTrack.effects.reverb}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTrack.effects.reverb}
                  onChange={(e) =>
                    handleApplyEffect(selectedTrack.id, 'reverb', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Delay: {selectedTrack.effects.delay}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTrack.effects.delay}
                  onChange={(e) =>
                    handleApplyEffect(selectedTrack.id, 'delay', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Chorus: {selectedTrack.effects.chorus}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTrack.effects.chorus}
                  onChange={(e) =>
                    handleApplyEffect(selectedTrack.id, 'chorus', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Distortion: {selectedTrack.effects.distortion}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTrack.effects.distortion}
                  onChange={(e) =>
                    handleApplyEffect(selectedTrack.id, 'distortion', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Instruments */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">🎸 Instruments</h3>
            <div className="grid grid-cols-2 gap-2">
              {allInstruments.slice(0, 6).map(inst => (
                <button
                  key={inst.id}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors"
                  onClick={() => {
                    if (selectedTrack) {
                      const updated = { ...selectedTrack, instrument: inst.id };
                      setComposition({
                        ...composition,
                        tracks: composition.tracks.map(t =>
                          t.id === selectedTrack.id ? updated : t
                        ),
                      });
                      setSelectedTrack(updated);
                    }
                  }}
                >
                  {inst.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
