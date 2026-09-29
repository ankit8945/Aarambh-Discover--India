import React, { useState } from 'react';
import { CulturalMemoryGraphData, GraphNode } from '../types';
import { Network, Sparkles, Compass, Info, ArrowRight, Share2 } from 'lucide-react';

interface CulturalGraphProps {
  graphData: CulturalMemoryGraphData;
  placeName: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  PLACE: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', icon: '🏛️' },
  PERSON: { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-300', icon: '👤' },
  STORY: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', icon: '📜' },
  TRADITION: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300', icon: '🪔' },
  CRAFT: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', icon: '🧵' },
  TOOL: { bg: 'bg-stone-200', text: 'text-stone-900', border: 'border-stone-400', icon: '🔨' },
  LANGUAGE: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', icon: '🗣️' },
  FOOD: { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-300', icon: '🍲' },
  FESTIVAL: { bg: 'bg-pink-100', text: 'text-pink-900', border: 'border-pink-300', icon: '🎉' },
  EVENT: { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-300', icon: '🗓️' },
  NEARBY: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300', icon: '📍' },
};

export const CulturalGraph: React.FC<CulturalGraphProps> = ({ graphData, placeName }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(
    graphData.nodes.length > 0 ? graphData.nodes[0] : null
  );

  const nodes = graphData.nodes || [];
  const links = graphData.links || [];

  const connectedLinks = selectedNode
    ? links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
    : [];

  return (
    <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 text-stone-900 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Network className="w-3.5 h-3.5 text-amber-600" />
            Cultural Memory Relationship Graph
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heritage text-stone-900">
            Memory Continuum: {placeName}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xl font-light">
            Connecting: <strong>Place → Stories → Craft → Food → Language → Tradition → Events</strong>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-1.5 max-w-xs text-[10px]">
          {['PLACE', 'TRADITION', 'CRAFT', 'FOOD', 'LANGUAGE', 'FESTIVAL'].map((t) => {
            const c = TYPE_COLORS[t] || TYPE_COLORS.PLACE;
            return (
              <span
                key={t}
                className={`px-2.5 py-0.5 rounded-full ${c.bg} ${c.text} font-medium flex items-center gap-1 border border-stone-200/60`}
              >
                <span>{c.icon}</span> {t}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Interactive Node Matrix Visualizer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-stone-50 border border-stone-200 min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-stone-600 mb-3 flex items-center justify-between">
              <span>Interactive Knowledge Nodes</span>
              <span className="text-[11px] text-amber-700 font-normal">Click any node to inspect relationships</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {nodes.map((node) => {
                const color = TYPE_COLORS[node.type] || TYPE_COLORS.PLACE;
                const isSelected = selectedNode?.id === node.id;
                const isConnected = selectedNode
                  ? links.some(
                      (l) =>
                        (l.source === selectedNode.id && l.target === node.id) ||
                        (l.target === selectedNode.id && l.source === node.id)
                    )
                  : false;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white font-bold border-stone-900 shadow-md scale-105'
                        : isConnected
                        ? 'bg-amber-100/80 text-amber-950 border-amber-300 font-semibold ring-2 ring-amber-400/20'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <span>{color.icon}</span>
                    <span>{node.label}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {node.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sequential Cultural Continuum Diagram */}
          <div className="mt-8 pt-4 border-t border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Living Heritage Sequence
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[11px] scrollbar-none">
              {nodes.slice(0, 6).map((n, idx) => (
                <React.Fragment key={n.id}>
                  <div
                    onClick={() => setSelectedNode(n)}
                    className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-amber-500 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <span>{TYPE_COLORS[n.type]?.icon || '📌'}</span>
                    <span className="font-semibold text-stone-800">{n.label}</span>
                  </div>
                  {idx < Math.min(nodes.length - 1, 5) && (
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Node Details & Relationship Inspector */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
          {selectedNode ? (
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{TYPE_COLORS[selectedNode.type]?.icon || '✨'}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {selectedNode.type}
                  </span>
                  <h4 className="text-lg font-bold text-stone-900 mt-1 font-heritage">
                    {selectedNode.label}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4 font-light">
                {selectedNode.description ||
                  'Active node within the cultural relationship graph grounded in verified historical surveys and regional records.'}
              </p>

              {/* Direct Relationships */}
              <div className="space-y-2 border-t border-stone-200 pt-3">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Associated Linkages ({connectedLinks.length})
                </div>

                {connectedLinks.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    Primary cultural hub linking outward to the regional heritage ecosystem.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {connectedLinks.map((link, idx) => {
                      const isSource = link.source === selectedNode.id;
                      const otherNodeId = isSource ? link.target : link.source;
                      const otherNode = nodes.find((n) => n.id === otherNodeId);

                      return (
                        <div
                          key={idx}
                          onClick={() => otherNode && setSelectedNode(otherNode)}
                          className="p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[10px] text-amber-700 font-medium">
                              {link.relationship}
                            </span>
                            <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="font-semibold text-stone-800 truncate">
                              {otherNode?.label || otherNodeId}
                            </span>
                          </div>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 shrink-0">
                            {otherNode?.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-stone-400">
              Select any node in the graph above to inspect cultural relationships.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-500 flex items-center justify-between">
            <span>Verified Source Grounding</span>
            <span className="text-amber-800 font-bold font-mono">Living Memory Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
