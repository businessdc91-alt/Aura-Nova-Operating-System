'use client';

import React, { useState } from 'react';
import { Save, RotateCcw, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AnimationService, AnimationTrack, JointKeyframe } from '@/services/animationService';

interface PoseEditorProps {
  currentPose?: Record<string, JointKeyframe>;
  onSavePose?: (pose: Record<string, JointKeyframe>) => void;
  className?: string;
}

const JOINT_GROUPS = {
  head: {
    label: 'Head',
    joints: ['head', 'neck', 'jaw'],
  },
  spine: {
    label: 'Spine',
    joints: ['pelvis', 'spine', 'chest'],
  },
  leftArm: {
    label: 'Left Arm',
    joints: ['leftShoulder', 'leftElbow', 'leftWrist'],
  },
  rightArm: {
    label: 'Right Arm',
    joints: ['rightShoulder', 'rightElbow', 'rightWrist'],
  },
  leftLeg: {
    label: 'Left Leg',
    joints: ['leftHip', 'leftKnee', 'leftAnkle'],
  },
  rightLeg: {
    label: 'Right Leg',
    joints: ['rightHip', 'rightKnee', 'rightAnkle'],
  },
};

export const PoseEditor: React.FC<PoseEditorProps> = ({
  currentPose = {},
  onSavePose,
  className = '',
}) => {
  const [pose, setPose] = useState<Record<string, JointKeyframe>>(currentPose);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('head');
  const [poseName, setPositionName] = useState('');

  const handleJointRotationChange = (
    jointId: string,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    setPose((prev) => ({
      ...prev,
      [jointId]: {
        ...(prev[jointId] || {}),
        rotation: {
          ...((prev[jointId]?.rotation) || { x: 0, y: 0, z: 0 }),
          [axis]: value,
        },
        time: 0,
      } as JointKeyframe,
    }));
  };

  const handleJointPositionChange = (
    jointId: string,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    setPose((prev) => ({
      ...prev,
      [jointId]: {
        ...(prev[jointId] || {}),
        position: {
          ...((prev[jointId]?.position) || { x: 0, y: 0, z: 0 }),
          [axis]: value,
        },
        time: 0,
      } as JointKeyframe,
    }));
  };

  const resetPose = () => {
    setPose({});
    toast.success('Pose reset to default');
  };

  const savePose = () => {
    if (!poseName.trim()) {
      toast.error('Please enter a pose name');
      return;
    }

    onSavePose?.(pose);
    toast.success(`Pose "${poseName}" saved successfully`);
    setPositionName('');
  };

  const presetPoses = {
    T_pose: () => ({
      leftShoulder: { time: 0, rotation: { x: 90, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      rightShoulder: { time: 0, rotation: { x: 90, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
    }),
    relaxed: () => ({
      pelvis: { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: -5, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      spine: { time: 0, rotation: { x: 5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      leftShoulder: { time: 0, rotation: { x: 45, y: 0, z: -10 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      rightShoulder: { time: 0, rotation: { x: 45, y: 0, z: 10 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
    }),
    thinking: () => ({
      head: { time: 0, rotation: { x: -20, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      leftElbow: { time: 0, rotation: { x: 90, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
      leftWrist: { time: 0, rotation: { x: 45, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } } as JointKeyframe,
    }),
  };

  const applyPreset = (presetKey: keyof typeof presetPoses) => {
    setPose(presetPoses[presetKey]());
    toast.success(`Applied ${presetKey} preset`);
  };

  return (
    <div className={`bg-slate-900 rounded-lg border border-slate-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Pose Editor</h3>

        {/* Preset Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => applyPreset('T_pose')}
            className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            T-Pose
          </button>
          <button
            onClick={() => applyPreset('relaxed')}
            className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Relaxed
          </button>
          <button
            onClick={() => applyPreset('thinking')}
            className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Thinking
          </button>
          <button
            onClick={resetPose}
            className="ml-auto px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Save Section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pose name..."
            value={poseName}
            onChange={(e) => setPositionName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={savePose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center gap-1 text-sm"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Joint Controls */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(JOINT_GROUPS).map(([groupKey, group]) => (
          <div key={groupKey} className="border-b border-slate-800">
            {/* Group Header */}
            <button
              onClick={() =>
                setExpandedGroup(expandedGroup === groupKey ? null : groupKey)
              }
              className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span className="font-semibold text-slate-300">{group.label}</span>
              <span className="text-slate-500">
                {expandedGroup === groupKey ? '−' : '+'}
              </span>
            </button>

            {/* Joint Controls */}
            {expandedGroup === groupKey && (
              <div className="bg-slate-900 p-3 space-y-3">
                {group.joints.map((joint) => {
                  const rotation = pose[joint]?.rotation || { x: 0, y: 0, z: 0 };
                  const position = pose[joint]?.position || { x: 0, y: 0, z: 0 };

                  return (
                    <div key={joint} className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300 capitalize">
                        {joint}
                      </h4>

                      {/* Rotation Controls */}
                      <div className="ml-2 space-y-1">
                        <label className="text-xs text-slate-400">Rotation (°)</label>
                        {(['x', 'y', 'z'] as const).map((axis) => (
                          <div key={axis} className="flex items-center gap-2">
                            <span className="w-5 text-xs font-mono text-slate-500">
                              {axis.toUpperCase()}
                            </span>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={rotation[axis] || 0}
                              onChange={(e) =>
                                handleJointRotationChange(joint, axis, Number(e.target.value))
                              }
                              className="flex-1"
                            />
                            <span className="w-10 text-xs text-right text-slate-400">
                              {rotation[axis] || 0}°
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Position Controls (optional, for IK) */}
                      <div className="ml-2 space-y-1">
                        <label className="text-xs text-slate-400">Position (offset)</label>
                        {(['x', 'y', 'z'] as const).map((axis) => (
                          <div key={axis} className="flex items-center gap-2">
                            <span className="w-5 text-xs font-mono text-slate-500">
                              {axis.toUpperCase()}
                            </span>
                            <input
                              type="range"
                              min="-50"
                              max="50"
                              value={position[axis] || 0}
                              onChange={(e) =>
                                handleJointPositionChange(joint, axis, Number(e.target.value))
                              }
                              className="flex-1"
                            />
                            <span className="w-10 text-xs text-right text-slate-400">
                              {position[axis] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-slate-950 border-t border-slate-800 p-3">
        <p className="text-xs text-slate-400">
          Currently editing <span className="font-mono text-slate-300">{Object.keys(pose).length}</span> joints
        </p>
      </div>
    </div>
  );
};

export default PoseEditor;
