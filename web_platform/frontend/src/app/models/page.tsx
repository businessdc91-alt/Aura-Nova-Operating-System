'use client';

import { useModelRegistry, useModelHealth } from '@/hooks/useModelManagement';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Heart,
  Trash2,
  Radio,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function ModelDashboard() {
  const { models, activeModel, switchModel, toggleFavorite, deleteModel } = useModelRegistry();

  if (models.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">No Partners Yet</h1>
            <p className="text-slate-400">Set up your first local model to get started.</p>
          </div>

          <Link href="/onboarding">
            <Button className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Set Up Your First Model
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Partners</h1>
          <p className="text-slate-400">
            {activeModel && `Currently working with ${activeModel.name}`}
          </p>
        </div>

        {/* Active Model Highlight */}
        {activeModel && (
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 p-6 mb-8">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-blue-300 uppercase tracking-wide">Active Partner</p>
                <h3 className="text-2xl font-bold text-white">{activeModel.name}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {activeModel.modelName} • {activeModel.sizeB}B • {activeModel.platform}
                </p>
              </div>
              <ModelHealthBadge modelId={activeModel.id} />
            </div>
          </Card>
        )}

        {/* Model Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isActive={activeModel?.id === model.id}
              onSwitch={() => switchModel(model.id)}
              onToggleFavorite={() => toggleFavorite(model.id)}
              onDelete={() => deleteModel(model.id)}
            />
          ))}
        </div>

        {/* Add Another Model */}
        <Link href="/onboarding">
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Model
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============== MODEL CARD ==============

function ModelCard({
  model,
  isActive,
  onSwitch,
  onToggleFavorite,
  onDelete,
}: {
  model: any;
  isActive: boolean;
  onSwitch: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const { health } = useModelHealth(model.id);

  return (
    <Card
      className={`bg-slate-800/50 border-slate-700 p-6 transition ${
        isActive ? 'ring-2 ring-blue-500 border-blue-600' : 'hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{model.name}</h3>
            {model.isFavorite && <Heart className="w-4 h-4 text-red-400 fill-red-400" />}
          </div>

          <div className="space-y-2 text-sm text-slate-400">
            <p>
              <span className="text-slate-500">Model:</span> {model.modelName}
            </p>
            <p>
              <span className="text-slate-500">Size:</span> {model.sizeB}B parameters
            </p>
            <p>
              <span className="text-slate-500">Platform:</span>{' '}
              <code className="bg-slate-900 px-2 py-0.5 rounded">{model.platform}</code>
            </p>
            <p>
              <span className="text-slate-500">Endpoint:</span>{' '}
              <code className="bg-slate-900 px-2 py-0.5 rounded text-xs">{model.endpoint}</code>
            </p>

            {/* Stats */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500">Sessions</p>
                <p className="text-lg font-bold text-white">{model.sessionCount}</p>
              </div>
              {model.lastUsed && (
                <div>
                  <p className="text-xs text-slate-500">Last Used</p>
                  <p className="text-sm text-slate-300">
                    {new Date(model.lastUsed).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-end gap-3">
          {/* Health Status */}
          {health && (
            <div className="flex items-center gap-2">
              {health.healthy ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-xs text-slate-400">
                {health.latency ? `${health.latency.toFixed(0)}ms` : 'Checking...'}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isActive && (
              <Button
                size="sm"
                onClick={onSwitch}
                className="flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Activate
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={onToggleFavorite}
            >
              <Heart
                className={`w-4 h-4 ${model.isFavorite ? 'fill-current' : ''}`}
              />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:border-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============== HEALTH BADGE ==============

function ModelHealthBadge({ modelId }: { modelId: string }) {
  const { health, checking } = useModelHealth(modelId);

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-blue-300">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-sm">Checking...</span>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {health.healthy ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-300">Healthy</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-300">Offline</span>
        </>
      )}
      {health.latency && (
        <span className="text-xs text-slate-400">({health.latency.toFixed(0)}ms)</span>
      )}
    </div>
  );
}
