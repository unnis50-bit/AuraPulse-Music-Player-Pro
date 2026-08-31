import React, { useState, useEffect } from 'react';
import { Timer, X, Check, StopCircle, Moon } from 'lucide-react';
import { ThemeConfig } from '../types';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMinutesRemaining: number | null;
  onStartTimer: (minutes: number) => void;
  onCancelTimer: () => void;
  theme: ThemeConfig;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  timerMinutesRemaining,
  onStartTimer,
  onCancelTimer,
  theme,
}) => {
  const [customMinutes, setCustomMinutes] = useState<string>('45');

  if (!isOpen) return null;

  const quickPresets = [10, 15, 30, 45, 60, 90];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-sleep-timer-modal"
        className="w-full max-w-sm rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] border border-white/15 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}e6` }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Moon className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sleep Timer</h3>
              <p className="text-xs text-neutral-400">Stop playback automatically</p>
            </div>
          </div>

          <button
            id="sleep-timer-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Status */}
        {timerMinutesRemaining !== null && timerMinutesRemaining > 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-5 text-center">
            <p className="text-xs text-neutral-300">Playback will pause in</p>
            <p className="text-2xl font-bold font-mono-numbers text-emerald-400 my-1">
              {Math.ceil(timerMinutesRemaining)} minutes
            </p>
            <button
              id="cancel-sleep-timer-btn"
              onClick={() => {
                onCancelTimer();
                onClose();
              }}
              className="mt-2 flex items-center gap-1.5 mx-auto px-4 py-1.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Turn Off Timer</span>
            </button>
          </div>
        ) : null}

        {/* Quick presets */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-300">Select Minutes</label>
          <div className="grid grid-cols-3 gap-2">
            {quickPresets.map((mins) => (
              <button
                key={mins}
                id={`sleep-preset-${mins}`}
                onClick={() => {
                  onStartTimer(mins);
                  onClose();
                }}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold font-mono-numbers text-white transition-all hover:scale-105 active:scale-95"
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Custom Minutes Input */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">Custom Duration</label>
            <div className="flex items-center gap-2">
              <input
                id="sleep-timer-custom-input"
                type="number"
                min="1"
                max="240"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Minutes"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
              />
              <button
                id="sleep-timer-custom-set-btn"
                onClick={() => {
                  const val = parseInt(customMinutes);
                  if (val > 0) {
                    onStartTimer(val);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
