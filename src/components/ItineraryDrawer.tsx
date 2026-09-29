import React from 'react';
import { SavedItineraryItem } from '../types';
import { Bookmark, X, Trash2, MapPin, Calendar, Printer, Share2, Compass } from 'lucide-react';
import { handlePrintSection } from '../utils/print';

interface ItineraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedItineraryItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onExplorePlace: (placeName: string) => void;
}

export const ItineraryDrawer: React.FC<ItineraryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onExplorePlace,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold font-heritage text-amber-100">
              My Saved Heritage Stops
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div id="printable-saved-stops" className="flex-1 p-5 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-2">
              <Compass className="w-10 h-10 text-stone-700 mx-auto stroke-1" />
              <p className="text-xs">No stops bookmarked yet.</p>
              <p className="text-[11px] text-stone-600">
                While exploring heritage sites or memory trails, click "Save to Itinerary" to curate your journey.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/90 flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      Day {item.day}
                    </span>
                    <span className="text-xs text-stone-400 truncate">{item.location}</span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-200 truncate">{item.title}</h4>

                  <button
                    onClick={() => {
                      onExplorePlace(item.location || item.title);
                      onClose();
                    }}
                    className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>View Heritage Records</span>
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-colors"
                  title="Remove from itinerary"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={() => handlePrintSection('printable-saved-stops', 'portrait')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer hide-on-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Itinerary</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
