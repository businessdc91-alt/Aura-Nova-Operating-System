'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ModelGallery, ModelCard, ModelInsights } from '@/components/ModelCard';
import { recommendModel, compareModels, TaskProfile, MODEL_PERSONALITIES } from '@/services/modelPersonality';
import {
  ArrowLeft,
  Zap,
  Brain,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModelPersonalitiesPage() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'recommend' | 'compare'>('gallery');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/creator-studio">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your AI Partners</h1>
          <p className="text-slate-400">
            Meet your models, understand their strengths, and choose the right partner for each task.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'gallery', label: '🤖 All Models', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'recommend', label: '🎯 Get Recommendation', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'compare', label: '⚖️ Compare Models', icon: <Brain className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <ModelGallery />
        )}

        {/* Recommendation Tab */}
        {activeTab === 'recommend' && (
          <RecommendationTool />
        )}

        {/* Comparison Tab */}
        {activeTab === 'compare' && (
          <ComparisonTool />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Speed Matters
              </h3>
              <p className="text-sm text-slate-400">
                Choose fast models for quick iterations and prototyping, premium models for complex tasks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                Cost Efficient
              </h3>
              <p className="text-sm text-slate-400">
                Use free local models when possible, cloud services for when you need extra power.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Best Practices
              </h3>
              <p className="text-sm text-slate-400">
                Mix and match models based on task complexity. No one model is perfect for everything.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendation Tool Component
 */
function RecommendationTool() {
  const [task, setTask] = useState<TaskProfile>({
    complexity: 'moderate',
    urgency: 'medium',
    type: 'code',
    budget: 'flexible',
  });

  const recommendation = recommendModel(task);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Profile Form */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Describe Your Task</h2>

          <div className="space-y-4">
            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Task Type</label>
              <select
                value={task.type}
                onChange={(e) => setTask({ ...task, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="code">Writing Code</option>
                <option value="writing">Writing & Documentation</option>
                <option value="analysis">Analysis & Reasoning</option>
                <option value="chat">Chat & Conversation</option>
              </select>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Complexity</label>
              <div className="space-y-2">
                {['simple', 'moderate', 'complex'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="complexity"
                      value={level}
                      checked={task.complexity === level}
                      onChange={(e) => setTask({ ...task, complexity: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-300 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How Urgent?</label>
              <div className="space-y-2">
                {['low', 'medium', 'high'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={task.urgency === level}
                      onChange={(e) => setTask({ ...task, urgency: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-300 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Budget</label>
              <div className="space-y-2">
                {['free-only', 'low-budget', 'flexible'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="budget"
                      value={option}
                      checked={task.budget === option}
                      onChange={(e) => setTask({ ...task, budget: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-300 capitalize">
                      {option.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Result */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-4">Recommended Model</h2>
          <div className="space-y-4">
            {/* Get the recommended model and display it */}
            <ModelRecommendationCard modelId={recommendation} task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Display Recommended Model
 */
function ModelRecommendationCard({
  modelId,
  task,
}: {
  modelId: string;
  task: TaskProfile;
}) {
  const model = MODEL_PERSONALITIES[modelId];

  if (!model) {
    return (
      <div className="text-slate-400">
        Model not found for the given criteria
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{model.emoji}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{model.friendlyName}</h3>
          <p className="text-slate-400 text-sm">{model.tagline}</p>
          <p className="text-xs text-slate-500 mt-1">{model.personality}</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded p-4 mb-4">
        <p className="text-sm text-slate-300 mb-3">
          <span className="font-semibold">Why this model?</span> It matches your task profile:
        </p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {task.urgency === 'high' ? 'Fast execution' : 'Balanced speed and quality'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {model.costProfile === 'free' ? 'No cost' : 'Reasonable pricing'}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {model.bestFor.slice(0, 2).join(', ')}
          </li>
        </ul>
      </div>

      <div className="text-xs text-slate-500">
        <p className="mb-2">
          <span className="font-semibold">Latency:</span> {model.avgLatencyMs}ms
        </p>
        <p>
          <span className="font-semibold">Quality:</span> {model.qualityTier}
        </p>
      </div>
    </div>
  );
}

/**
 * Model Comparison Tool
 */
function ComparisonTool() {
  const [model1Id, setModel1Id] = useState<string>('phi');
  const [model2Id, setModel2Id] = useState<string>('mistral');

  const comparisonResult = compareModels(model1Id, model2Id);

  if (!comparisonResult) {
    return (
      <div className="text-slate-400">
        Unable to compare selected models
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1 Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">First Model</label>
          <select
            value={model1Id}
            onChange={(e) => setModel1Id(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.values(MODEL_PERSONALITIES).map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.friendlyName} ({m.platform})
              </option>
            ))}
          </select>
        </div>

        {/* Model 2 Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Second Model</label>
          <select
            value={model2Id}
            onChange={(e) => setModel2Id(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.values(MODEL_PERSONALITIES).map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.friendlyName} ({m.platform})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1 Card */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{comparisonResult.model1.emoji}</span>
            <div>
              <h3 className="font-bold text-white">{comparisonResult.model1.friendlyName}</h3>
              <p className="text-xs text-slate-400">{comparisonResult.model1.tagline}</p>
            </div>
          </div>
          <ModelInsights modelId={model1Id} />
        </div>

        {/* Model 2 Card */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{comparisonResult.model2.emoji}</span>
            <div>
              <h3 className="font-bold text-white">{comparisonResult.model2.friendlyName}</h3>
              <p className="text-xs text-slate-400">{comparisonResult.model2.tagline}</p>
            </div>
          </div>
          <ModelInsights modelId={model2Id} />
        </div>
      </div>

      {/* Verdict */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-3">The Verdict</h3>
        <div className="space-y-3">
          <p className="text-slate-300">{comparisonResult.reasoning}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">⚡ Speed</p>
              <p className="text-sm font-semibold text-slate-200">
                {MODEL_PERSONALITIES[comparisonResult.speedWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">✨ Quality</p>
              <p className="text-sm font-semibold text-slate-200">
                {MODEL_PERSONALITIES[comparisonResult.qualityWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">💰 Cost</p>
              <p className="text-sm font-semibold text-slate-200">
                {MODEL_PERSONALITIES[comparisonResult.costWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">🏆 Overall</p>
              <p className="text-sm font-semibold text-slate-200">
                {MODEL_PERSONALITIES[comparisonResult.overallWinner]?.friendlyName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
