'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModelSetup, useModelRegistry } from '@/hooks/useModelManagement';
import {
  Download,
  Zap,
  Smartphone,
  Monitor,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const { step, setStep, platform, setPlatform, endpoint, setEndpoint, ...setup } = useModelSetup();
  const { activeModel } = useModelRegistry();

  if (step === 'done' || activeModel) {
    return <SetupComplete />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Meet Your Partner</h1>
          <p className="text-slate-400 text-lg">
            Choose a local AI model to run locally. You'll own the relationship.
          </p>
        </div>

        {/* Step 1: Choose Platform */}
        {step === 'choose-platform' && (
          <ChoosePlatformStep setPlatform={setPlatform} setStep={setStep} />
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && platform && (
          <ConfigureStep
            platform={platform}
            guide={setup.guide!}
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            setStep={setStep}
          />
        )}

        {/* Step 3: Test Connection */}
        {step === 'test' && (
          <TestConnectionStep
            endpoint={endpoint}
            testing={setup.testing}
            testError={setup.testError}
            onTest={setup.testConnection}
            setStep={setStep}
          />
        )}

        {/* Step 4: Name Your Model */}
        {step === 'name' && (
          <NameModelStep
            modelName={setup.modelName}
            setModelName={setup.setModelName}
            friendlyName={setup.friendlyName}
            setFriendlyName={setup.setFriendlyName}
            onFinish={setup.finishSetup}
          />
        )}
      </div>
    </div>
  );
}

// ============== STEP COMPONENTS ==============

function ChoosePlatformStep({
  setPlatform,
  setStep,
}: {
  setPlatform: (p: 'lm-studio' | 'ollama') => void;
  setStep: (s: any) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-slate-300 text-center mb-8">
        Where will your model run? Start with a local installation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desktop Models */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-slate-600 cursor-pointer transition"
          onClick={() => {
            setPlatform('lm-studio');
            setStep('configure');
          }}
        >
          <div className="flex items-start gap-4">
            <Monitor className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">LM Studio</h3>
              <p className="text-sm text-slate-400 mb-3">
                Easy UI. Download models. Run locally. Start at 1B for laptops.
              </p>
              <a
                href="https://lmstudio.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Download <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-slate-600 cursor-pointer transition"
          onClick={() => {
            setPlatform('ollama');
            setStep('configure');
          }}
        >
          <div className="flex items-start gap-4">
            <Monitor className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Ollama</h3>
              <p className="text-sm text-slate-400 mb-3">
                Command line. Lightweight. Great for devs. Runs on any hardware.
              </p>
              <a
                href="https://ollama.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Download <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Option */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <Smartphone className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-2">Mobile (Android/iOS)</h3>
            <p className="text-sm text-slate-400 mb-3">
              Run models directly on your phone. Start with 0.5B-2B models. Use Termux or native apps.
            </p>
            <p className="text-xs text-slate-500">
              Coming soon: integrated mobile setup guide
            </p>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="bg-slate-800/30 border-slate-700/50 p-4">
        <p className="text-sm text-slate-400">
          💡 <strong>Tip:</strong> Start with a 2-4B model on your PC. It's fast enough for suggestions
          and doesn't hog resources. Upgrade later if needed.
        </p>
      </Card>
    </div>
  );
}

function ConfigureStep({
  platform,
  guide,
  endpoint,
  setEndpoint,
  setStep,
}: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Set up {guide.name}
        </h3>

        <ol className="space-y-3 text-sm text-slate-300">
          {guide.instructions.map((instruction: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="text-slate-500 flex-shrink-0">{i + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <label className="block text-sm font-medium text-white mb-2">API Endpoint</label>
        <p className="text-xs text-slate-400 mb-3">Usually: {guide.defaultEndpoint}</p>
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder={guide.defaultEndpoint}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('choose-platform')}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={() => setStep('test')}
          disabled={!endpoint}
        >
          Test Connection
        </Button>
      </div>
    </div>
  );
}

function TestConnectionStep({
  endpoint,
  testing,
  testError,
  onTest,
  setStep,
}: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <p className="text-slate-300 mb-4">
          Testing connection to <code className="bg-slate-900 px-2 py-1 rounded text-sm text-blue-300">{endpoint}</code>
        </p>

        <Button
          onClick={onTest}
          disabled={testing}
          className="w-full"
          size="lg"
        >
          {testing ? 'Connecting...' : 'Test Connection'}
        </Button>

        {testError && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
            <p className="font-medium">Connection failed:</p>
            <p className="mt-1">{testError}</p>
            <p className="mt-2 text-xs">Make sure your model is running and the endpoint is correct.</p>
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('configure')}>
          Back
        </Button>
      </div>
    </div>
  );
}

function NameModelStep({
  modelName,
  setModelName,
  friendlyName,
  setFriendlyName,
  onFinish,
}: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4">Name Your Partner</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Model Name</label>
            <p className="text-xs text-slate-400 mb-2">e.g., "gemma-3-4b", "phi-3"</p>
            <Input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g., gemma-3-4b"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Friendly Name</label>
            <p className="text-xs text-slate-400 mb-2">What you'll call them</p>
            <Input
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              placeholder="e.g., My Friend Gemma"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
      </Card>

      <Button
        onClick={onFinish}
        className="w-full"
        size="lg"
        disabled={!modelName || !friendlyName}
      >
        Create Partnership
      </Button>
    </div>
  );
}

function SetupComplete() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="bg-slate-800/50 border-slate-700 p-12 max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Welcome to the Studio</h2>
        <p className="text-slate-300 mb-8">
          Your partner is ready. Let's create something together.
        </p>

        <Link href="/creator-studio">
          <Button className="w-full" size="lg">
            Go to Creator Studio
          </Button>
        </Link>
      </Card>
    </div>
  );
}
