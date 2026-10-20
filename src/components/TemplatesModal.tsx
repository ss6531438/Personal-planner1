import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { BUILT_IN_TEMPLATES } from '../utils/templates';
import type { DayTemplate } from '../types';
import { ENERGY_CONFIG } from '../types';
import { formatDuration } from '../utils/timeEngine';
import {
  X,
  FileText,
  Brain,
  Briefcase,
  Sun,
  Zap,
  BookmarkPlus,
  Play,
  Trash2,
} from 'lucide-react';

export const TemplatesModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    customTemplates,
    loadTemplate,
    saveCurrentAsTemplate,
    deleteCustomTemplate,
    tasks,
    addToast,
  } = usePlannerStore();

  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate>(BUILT_IN_TEMPLATES[0]);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [startFromNow, setStartFromNow] = useState(true);

  if (activeModal !== 'templates') return null;

  const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];

  const handleSaveCurrent = () => {
    if (!customName.trim()) {
      addToast('Please enter a template name', 'warning');
      return;
    }
    saveCurrentAsTemplate(customName.trim(), customDescription.trim(), 'Bookmark');
    setIsSavingCustom(false);
    setCustomName('');
    setCustomDescription('');
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-5 h-5 text-violet-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  const selectedTotalDuration = selectedTemplate.blocks.reduce(
    (acc, b) => acc + b.durationMinutes,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Routine Presets & Templates</h3>
              <p className="text-xs text-slate-400">Jumpstart your day with proven fluid focus architectures.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSavingCustom(!isSavingCustom)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-violet-400" />
              <span>Save Today <span className="hidden sm:inline">as Template</span></span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Current Day Banner */}
        {isSavingCustom && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Save Current {tasks.length} Blocks as Custom Template</span>
              <button
                onClick={() => setIsSavingCustom(false)}
                className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Template Name (e.g., Deep Focus & Client Afternoon)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <input
                type="text"
                placeholder="Short Description (optional)"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={handleSaveCurrent}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              Save Template
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 overflow-y-auto">
          {/* Templates List */}
          <div className="md:col-span-5 space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Preset
            </label>
            <div className="space-y-2">
              {allTemplates.map((template) => {
                const isSelected = selectedTemplate.id === template.id;
                const isCustom = customTemplates.some((c) => c.id === template.id);

                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-violet-500/80 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {getTemplateIcon(template.icon)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-sm text-white truncate">{template.name}</h4>
                          {isCustom && (
                            <span className="text-[9px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{template.description}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">
                          {template.blocks.length} blocks • {formatDuration(template.blocks.reduce((a, b) => a + b.durationMinutes, 0))}
                        </p>
                      </div>
                    </div>

                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomTemplate(template.id);
                        }}
                        title="Delete custom template"
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Details & Block Breakdown */}
          <div className="md:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Preset Breakdown
              </label>
              <span className="text-xs font-mono text-slate-400">
                Total: <strong className="text-white">{formatDuration(selectedTotalDuration)}</strong>
              </span>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[380px] space-y-2">
              <div className="pb-3 mb-2 border-b border-slate-800/80">
                <h4 className="font-bold text-white text-base">{selectedTemplate.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{selectedTemplate.description}</p>
              </div>

              {selectedTemplate.blocks.map((block, idx) => {
                const energy = ENERGY_CONFIG[block.energyLevel];
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500 font-mono text-[11px] w-4">{idx + 1}.</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{block.title}</p>
                        {block.notes && <p className="text-[11px] text-slate-500 truncate">{block.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${energy.badgeBg}`}>
                        {energy.label}
                      </span>
                      <span className="font-mono text-slate-300 text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                        {formatDuration(block.durationMinutes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Timing Option */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={startFromNow}
                  onChange={(e) => setStartFromNow(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span>Anchor first block to current time ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={() => loadTemplate(selectedTemplate, startFromNow)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Load Routine ({selectedTemplate.blocks.length} Blocks)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
