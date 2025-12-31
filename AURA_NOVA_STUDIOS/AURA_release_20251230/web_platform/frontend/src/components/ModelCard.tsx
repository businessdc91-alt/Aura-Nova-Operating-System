'use client';

import React from 'react';
import { ModelPersonality, compareModels, MODEL_PERSONALITIES } from '@/services/modelPersonality';
import { Heart, Zap, Brain, MessageCircle, Cloud, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

interface ModelCardProps {
  personality: ModelPersonality;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showDetailed?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Zap': <Zap className="w-6 h-6" />,
  'Brain': <Brain className="w-6 h-6" />,
  'MessageCircle': <MessageCircle className="w-6 h-6" />,
  'Cloud': <Cloud className="w-6 h-6" />,
  'Sparkles': <Sparkles className="w-6 h-6" />,
  'Flame': <TrendingUp className="w-6 h-6" />, // Use TrendingUp for Flame temporarily
};

const COLOR_MAP: Record<string, string> = {
  'yellow': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  'blue': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'purple': 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'cyan': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  'orange': 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'red': 'from-red-500/20 to-red-600/10 border-red-500/30',
};

const TEXT_COLOR_MAP: Record<string, string> = {
  'yellow': 'text-yellow-400',
  'blue': 'text-blue-400',
  'purple': 'text-purple-400',
  'cyan': 'text-cyan-400',
  'orange': 'text-orange-400',
  'red': 'text-red-400',
};

export function ModelCard({
  personality,
  isSelected = false,
  onSelect,
  showDetailed = false,
}: ModelCardProps) {
  const colorClass = COLOR_MAP[personality.color] || COLOR_MAP.blue;
  const textColor = TEXT_COLOR_MAP[personality.color] || 'text-blue-400';
  const icon = ICON_MAP[personality.icon] || <Sparkles className="w-6 h-6" />;

  return (
    <div
      onClick={() => onSelect?.(personality.id)}
      className={`p-4 rounded-lg border-2 bg-gradient-to-br ${colorClass} cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-white' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`${textColor} mt-1`}>{icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{personality.friendlyName}</h3>
            <p className="text-xs text-slate-400">{personality.officialName}</p>
            <p className={`text-sm font-semibold ${textColor} mt-1`}>{personality.personality}</p>
          </div>
        </div>
        <span className="text-2xl">{personality.emoji}</span>
      </div>

      {/* Tagline */}
      <p className="text-sm text-slate-300 italic mb-3">"{personality.tagline}"</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-xs text-slate-400">Speed</div>
          <div className="text-sm font-bold text-white capitalize">
            {personality.speedTier.replace('-', ' ')}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-xs text-slate-400">Quality</div>
          <div className="text-sm font-bold text-white capitalize">
            {personality.qualityTier}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-xs text-slate-400">Cost</div>
          <div className="text-sm font-bold text-white capitalize">
            {personality.costProfile}
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 font-semibold mb-1">Strengths:</p>
        <div className="flex flex-wrap gap-1">
          {personality.strengths.slice(0, 3).map((strength) => (
            <span
              key={strength}
              className="inline-block bg-slate-700/50 text-slate-200 text-xs px-2 py-1 rounded"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Best For */}
      {showDetailed && (
        <div className="border-t border-slate-700/50 pt-3">
          <p className="text-xs text-slate-400 font-semibold mb-2">Best For:</p>
          <ul className="space-y-1">
            {personality.bestFor.map((item) => (
              <li key={item} className="text-xs text-slate-300 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${textColor} bg-current`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30 text-xs text-slate-400">
        <span>Platform:</span>
        <span className="font-mono text-slate-300">{personality.platform}</span>
      </div>
    </div>
  );
}

/**
 * Model Gallery - Display all available models
 */
export function ModelGallery() {
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your AI Partners</h2>
        <p className="text-slate-400">
          Each model has unique strengths. Choose the right partner for your task.
        </p>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(MODEL_PERSONALITIES).map((personality) => (
          <ModelCard
            key={personality.id}
            personality={personality}
            isSelected={selectedModel === personality.id}
            onSelect={setSelectedModel}
            showDetailed={selectedModel === personality.id}
          />
        ))}
      </div>

      {/* Comparison */}
      {selectedModel && (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Model Insights</h3>
          <ModelInsights modelId={selectedModel} />
        </div>
      )}
    </div>
  );
}

/**
 * Model Insights - Detailed comparison and recommendations
 */
interface ModelInsightsProps {
  modelId: string;
  compareWithId?: string;
}

export function ModelInsights({ modelId, compareWithId }: ModelInsightsProps) {
  const model = MODEL_PERSONALITIES[modelId];

  if (!model) {
    return <div className="text-slate-400">Model not found</div>;
  }

  const comparison = compareWithId ? compareModels(modelId, compareWithId) : null;

  return (
    <div className="space-y-6">
      {/* Main Model Details */}
      <div>
        <h4 className="font-semibold text-slate-300 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Avg Latency</p>
            <p className="text-lg font-bold text-cyan-400">{model.avgLatencyMs}ms</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Context Window</p>
            <p className="text-lg font-bold text-cyan-400">{(model.contextWindow / 1024).toFixed(1)}K tokens</p>
          </div>
          {model.costPerMInput !== undefined && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Input Cost</p>
              <p className="text-lg font-bold text-cyan-400">${model.costPerMInput}/M tokens</p>
            </div>
          )}
          {model.costPerMOutput !== undefined && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Output Cost</p>
              <p className="text-lg font-bold text-cyan-400">${model.costPerMOutput}/M tokens</p>
            </div>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <h4 className="font-semibold text-slate-300 mb-3">Capabilities</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={model.canStreamOutput ? 'text-green-500' : 'text-red-500'}>
              {model.canStreamOutput ? '✓' : '✗'}
            </span>
            <span className="text-slate-300">Streaming Output</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={model.supportsVision ? 'text-green-500' : 'text-red-500'}>
              {model.supportsVision ? '✓' : '✗'}
            </span>
            <span className="text-slate-300">Vision</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={model.supportsCodeExecution ? 'text-green-500' : 'text-red-500'}>
              {model.supportsCodeExecution ? '✓' : '✗'}
            </span>
            <span className="text-slate-300">Code Execution</span>
          </div>
          <div className="text-sm text-slate-400">
            {model.maxConcurrentRequests} concurrent requests
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      {model.weaknesses && model.weaknesses.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Limitations</h4>
          <ul className="space-y-1">
            {model.weaknesses.map((weakness) => (
              <li key={weakness} className="text-sm text-slate-400 flex items-center gap-2">
                <span className="text-red-500">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Tasks */}
      <div>
        <h4 className="font-semibold text-slate-300 mb-2">Recommended For</h4>
        <div className="flex flex-wrap gap-2">
          {model.recommendedFor.map((task) => (
            <span
              key={task}
              className="inline-block bg-slate-800 border border-slate-600 text-slate-300 text-xs px-3 py-1 rounded-full capitalize"
            >
              {task.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Comparison */}
      {comparison && (
        <div className="border-t border-slate-700 pt-6">
          <h4 className="font-semibold text-slate-300 mb-3">Comparison Results</h4>
          <p className="text-sm text-slate-300 mb-4">{comparison.reasoning}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Speed Winner</p>
              <p className="font-semibold text-white">
                {MODEL_PERSONALITIES[comparison.speedWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Quality Winner</p>
              <p className="font-semibold text-white">
                {MODEL_PERSONALITIES[comparison.qualityWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Cost Winner</p>
              <p className="font-semibold text-white">
                {MODEL_PERSONALITIES[comparison.costWinner]?.friendlyName}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Overall Winner</p>
              <p className="font-semibold text-white">
                {MODEL_PERSONALITIES[comparison.overallWinner]?.friendlyName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelCard;
