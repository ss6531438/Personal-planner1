import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { AntiqueAnalogClock } from './AntiqueAnalogClock';
import {
  CLOCK_COLOR_PRESETS,
  type AnalogClockStyle,
  type SecondsHandMode,
  type NumeralsStyle,
  type ClockColorPreset,
  type TickingSoundType,
  type AudioNoiseType,
  type TimerDisplayMode,
} from '../types';
import {
  X,
  Volume2,
  Clock,
  Sparkles,
  Check,
  Compass,
  Palette,
} from 'lucide-react';

export const ClockSoundStudioModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    settings,
    updateSettings,
    setTickingSound,
    setTickingVolume,
    testTickingSound,
    setAmbientSound,
    setAmbientVolume,
    setClockStyle,
    setSecondsHandMode,
    setTimerDisplayMode,
    addToast,
  } = usePlannerStore();

  const [activeTab, setActiveTab] = useState<'clock' | 'ticking' | 'relaxing'>('clock');

  if (activeModal !== 'clock-studio') return null;

  const clockStyles: {
    id: AnalogClockStyle;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'grandfather',
      title: 'Grandfather Antique',
      description: 'Ornate Victorian Roman dial with brass pendulum & walnut case',
      badge: 'Victorian 1880',
    },
    {
      id: 'pocket-watch',
      title: 'Vintage Pocket Watch',
      description: 'Winding crown, Breguet hands & antique seconds subdial',
      badge: 'Heirloom 1895',
    },
    {
      id: 'steampunk',
      title: 'Steampunk Escapement',
      description: 'Exposed rotating brass gears, copper rivets & industrial skeleton',
      badge: 'Brass & Cogs',
    },
    {
      id: 'art-deco',
      title: 'Art Deco 1920s',
      description: 'Geometric sunburst rays, Gatsby typography & gold foil luxury',
      badge: 'Gatsby 1925',
    },
    {
      id: 'chronometer',
      title: 'Marine Chronometer',
      description: 'Gimbaled brass casing, nautical compass rose & navigation track',
      badge: 'Naval Admiralty',
    },
    {
      id: 'modern',
      title: 'Minimal Contemporary',
      description: 'Sleek celestial styling for minimalists',
      badge: 'Modern Atelier',
    },
  ];

  const tickingOptions: {
    id: TickingSoundType;
    title: string;
    description: string;
  }[] = [
    {
      id: 'antique-pendulum',
      title: 'Grandfather Pendulum',
      description: 'Alternating tick-tock with acoustic wood chamber resonance',
    },
    {
      id: 'pocket-watch',
      title: 'Vintage Pocket Watch',
      description: 'Crisp, delicate double-pallet jewel escapement click',
    },
    {
      id: 'antique-wooden',
      title: 'Antique Wooden Clock',
      description: 'Warm, organic timber escapement thud',
    },
    {
      id: 'chronometer',
      title: 'Marine Brass Chronometer',
      description: 'Heavy brass escapement with subtle metallic harmonic chime',
    },
    {
      id: 'soft-tick',
      title: 'Whisper Soft Click',
      description: 'Gentle, modern, ultra-quiet focus click',
    },
    {
      id: 'none',
      title: 'Muted (Silent)',
      description: 'No ticking sound during focus timer',
    },
  ];

  const relaxingSoundOptions: {
    id: AudioNoiseType;
    title: string;
    category: string;
    description: string;
  }[] = [
    { id: 'none', title: 'Off / Muted', category: 'None', description: 'Silent focus environment' },
    { id: 'rain', title: 'Gentle Rain', category: 'Nature', description: 'Soothing rain drops on a window pane' },
    { id: 'ocean', title: 'Ocean Surf', category: 'Nature', description: 'Breathing rhythmic ocean swells & shoreline wash' },
    { id: 'campfire', title: 'Hearth Campfire', category: 'Cozy', description: 'Warm crackling fireplace embers & soft rumble' },
    { id: 'stream', title: 'Forest Stream', category: 'Nature', description: 'Clear mountain brook water bubbling over stones' },
    { id: 'zen-bowl', title: 'Tibetan Zen Bowl', category: 'Meditation', description: 'Pure singing bowl harmonic meditation drone' },
    { id: 'birds', title: 'Twilight Birds', category: 'Nature', description: 'Gentle forest breeze & twilight songbirds' },
    { id: 'binaural', title: 'Alpha Wave Flow', category: 'Brainwave', description: '10Hz binaural beats for deep creative focus' },
    { id: 'brown', title: 'Deep Brown Noise', category: 'Noise', description: 'Warm low-frequency rumble for masking distractions' },
    { id: 'white', title: 'Focus White Noise', category: 'Noise', description: 'Smooth balanced static for open office environments' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Antique Clock & Sound Studio
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                  Horology Atelier
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tailor heirloom analog clocks, mechanical ticking escapements, and procedural relaxing soundscapes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 pt-2.5 sm:pt-3 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('clock')}
            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'clock'
                ? 'border-amber-400 text-amber-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Clock Styles</span>
            <span className="hidden sm:inline">& Colors</span>
          </button>

          <button
            onClick={() => setActiveTab('ticking')}
            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'ticking'
                ? 'border-amber-400 text-amber-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Ticking Sounds</span>
          </button>

          <button
            onClick={() => setActiveTab('relaxing')}
            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'relaxing'
                ? 'border-amber-400 text-amber-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Relaxing Sounds</span>
            <span className="hidden sm:inline">(9 Ambiences)</span>
          </button>
        </div>

        {/* Studio Body: Interactive Clock Preview + Customization Controls */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 overflow-y-auto">
          {/* Left Column: Live Interactive Clock Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-inner">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 sm:mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Clock Atelier Preview</span>
            </div>

            {/* Live Clock Component */}
            <div className="my-1 sm:my-2 py-1 sm:py-2 flex justify-center w-full">
              <AntiqueAnalogClock size={230} showControls={false} interactive={false} />
            </div>

            {/* Display Mode Switcher (Analog vs Radial vs Dual) */}
            <div className="w-full mt-4 pt-4 border-t border-slate-800/80">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                HUD Timer Centerpiece Display
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['analog', 'radial', 'dual'] as TimerDisplayMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTimerDisplayMode(mode);
                      addToast(`Display: ${mode} mode`, 'info');
                    }}
                    className={`py-1.5 px-2 rounded-lg font-medium capitalize transition-all cursor-pointer text-center ${
                      settings.timerDisplayMode === mode
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'analog' ? 'Antique Clock' : mode === 'radial' ? 'Radial Ring' : 'Dual Mode'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Test Sound Button */}
            <div className="w-full mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={testTickingSound}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Tick Sound</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls according to active tab */}
          <div className="lg:col-span-7 space-y-6">
            {/* TAB 1: CLOCK STYLES & COLORS */}
            {activeTab === 'clock' && (
              <div className="space-y-6">
                {/* 1. Heirloom Horology Styles */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Select Antique Clock Design</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {clockStyles.map((style) => {
                      const isSelected = settings.clockStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setClockStyle(style.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-950/20 border-amber-500/80 ring-1 ring-amber-500/40 shadow-md'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-100">{style.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                {style.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {style.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>Active Design</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Color Themes / Presets */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Curated Color Palette & Metallic Tones</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CLOCK_COLOR_PRESETS) as ClockColorPreset[])
                      .filter((p) => p !== 'custom')
                      .map((presetKey) => {
                        const preset = CLOCK_COLOR_PRESETS[presetKey];
                        const isSelected = settings.clockColorPreset === presetKey;

                        return (
                          <button
                            key={presetKey}
                            type="button"
                            onClick={() => {
                              updateSettings({ clockColorPreset: presetKey });
                              addToast(`Color: ${preset.name}`, 'info');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/40'
                                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {/* Color swatches */}
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.colors.bezel }}
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.colors.dialBg }}
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.colors.hands }}
                              />
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.colors.secondsHand }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-200 block truncate">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {/* Custom Color Atelier Option */}
                  <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">
                        Custom Atelier Color Palette
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSettings({ clockColorPreset: 'custom' })}
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                          settings.clockColorPreset === 'custom'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {settings.clockColorPreset === 'custom' ? 'Active' : 'Enable Custom Palette'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Bezel Tone</span>
                        <input
                          type="color"
                          value={settings.clockCustomColors.bezel}
                          onChange={(e) =>
                            updateSettings({
                              clockColorPreset: 'custom',
                              clockCustomColors: {
                                ...settings.clockCustomColors,
                                bezel: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Dial Face</span>
                        <input
                          type="color"
                          value={settings.clockCustomColors.dialBg}
                          onChange={(e) =>
                            updateSettings({
                              clockColorPreset: 'custom',
                              clockCustomColors: {
                                ...settings.clockCustomColors,
                                dialBg: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Hands</span>
                        <input
                          type="color"
                          value={settings.clockCustomColors.hands}
                          onChange={(e) =>
                            updateSettings({
                              clockColorPreset: 'custom',
                              clockCustomColors: {
                                ...settings.clockCustomColors,
                                hands: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Seconds Hand</span>
                        <input
                          type="color"
                          value={settings.clockCustomColors.secondsHand}
                          onChange={(e) =>
                            updateSettings({
                              clockColorPreset: 'custom',
                              clockCustomColors: {
                                ...settings.clockCustomColors,
                                secondsHand: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Seconds Hand Motion & Numerals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Seconds Hand Motion */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                      Seconds Hand Motion
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'tick', label: 'Antique Mechanical Step' },
                        { id: 'smooth', label: 'Chronometer Smooth Sweep' },
                        { id: 'subdial', label: 'Vintage 6-o-clock Subdial' },
                        { id: 'none', label: 'Hidden (Calm Zen)' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSecondsHandMode(opt.id as SecondsHandMode)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            settings.secondsHandMode === opt.id
                              ? 'bg-amber-950/30 border-amber-500/70 text-amber-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {settings.secondsHandMode === opt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numerals Style */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                      Numerals Typography
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'roman', label: 'Ornate Roman (XII, I, II, III...)' },
                        { id: 'arabic', label: 'Vintage Serif Arabic (12, 1, 2...)' },
                        { id: 'hash', label: 'Minimalist Antique Hashes (•••)' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateSettings({ numeralsStyle: opt.id as NumeralsStyle })}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            settings.numeralsStyle === opt.id
                              ? 'bg-amber-950/30 border-amber-500/70 text-amber-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {settings.numeralsStyle === opt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      ))}
                    </div>

                    {/* Pendulum & Gears Toggles */}
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
                      <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                        <span>Swinging Brass Pendulum</span>
                        <input
                          type="checkbox"
                          checked={settings.showPendulum}
                          onChange={(e) => updateSettings({ showPendulum: e.target.checked })}
                          className="rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                        <span>Rotating Steampunk Cogs</span>
                        <input
                          type="checkbox"
                          checked={settings.showGears}
                          onChange={(e) => updateSettings({ showGears: e.target.checked })}
                          className="rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLOCK TICKING SOUNDS */}
            {activeTab === 'ticking' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Choose Mechanical Ticking Escapement</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Synthesized in real-time with Web Audio oscillators & physical resonance chambers.
                  </p>

                  <div className="space-y-2">
                    {tickingOptions.map((opt) => {
                      const isSelected = settings.tickingSound === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTickingSound(opt.id)}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/40 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{opt.title}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Volume Slider & Sound Controls */}
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <span>Ticking Sound Volume</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {Math.round(settings.tickingVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={settings.tickingVolume}
                      onChange={(e) => setTickingVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Play Only While Timer is Running
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Automatically silences clock ticks when timer is paused
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.tickingOnlyWhileRunning}
                        onChange={(e) =>
                          updateSettings({ tickingOnlyWhileRunning: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RELAXING FOCUS SOUNDSCAPES */}
            {activeTab === 'relaxing' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Procedural Ambient Focus Soundscapes</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    100% offline procedural audio synthesized with Web Audio oscillators and resonant filters.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {relaxingSoundOptions.map((opt) => {
                      const isSelected = settings.ambientType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAmbientSound(opt.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-950/25 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-white">{opt.title}</span>
                              <span className="text-[10px] text-emerald-300 font-mono">
                                {opt.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {opt.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>Playing Ambiance</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ambient Sound Volume */}
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Ambient Soundscape Volume</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {Math.round(settings.ambientVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={settings.ambientVolume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>
              Heirloom: <strong className="text-white capitalize">{settings.clockStyle.replace('-', ' ')}</strong>
              {' • '}Tick: <strong className="text-white capitalize">{settings.tickingSound.replace('-', ' ')}</strong>
            </span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
          >
            Apply & Enter Flow
          </button>
        </div>
      </div>
    </div>
  );
};
