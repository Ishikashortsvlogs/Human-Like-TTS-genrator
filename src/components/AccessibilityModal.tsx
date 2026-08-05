import React from 'react';
import { X, Accessibility, Type, Eye, Sparkles, Keyboard } from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  reducedMotion,
  setReducedMotion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Accessibility Options</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font Size Scaling */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-400" /> Text Size Scale
            </span>
            <span className="text-indigo-300 font-mono font-bold">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="14"
            max="22"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-semibold text-white">High Contrast UI</div>
              <div className="text-[10px] text-slate-400">Enhance visual contrast for better readability</div>
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              highContrast ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                highContrast ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs font-semibold text-white">Reduce Animations</div>
              <div className="text-[10px] text-slate-400">Minimize motion effects & pulsing waves</div>
            </div>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              reducedMotion ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                reducedMotion ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" /> Keyboard Shortcuts
          </span>
          <div className="space-y-1 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Generate Voice:</span>
              <span className="text-indigo-300">Ctrl + Enter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Toggle Android View:</span>
              <span className="text-indigo-300">Alt + M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Toggle Dark/Light:</span>
              <span className="text-indigo-300">Alt + D</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
