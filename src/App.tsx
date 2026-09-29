import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { IntroOnboarding } from './components/IntroOnboarding';
import { AuthModal } from './components/AuthModal';
import { SaveMemoryModal } from './components/SaveMemoryModal';
import { ItineraryDrawer } from './components/ItineraryDrawer';
import { ExploreView } from './views/ExploreView';
import { HeritageView } from './views/HeritageView';
import { LivingHeritageView } from './views/LivingHeritageView';
import { MemoryView } from './views/MemoryView';
import { MapsView } from './views/MapsView';
import { MemoryTrailsView } from './views/MemoryTrailsView';
import { PlanTripView } from './views/PlanTripView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CreatorDashboardView } from './views/CreatorDashboardView';
import { EVisitView } from './views/EVisitView';
import { BlockchainCertificateView } from './views/BlockchainCertificateView';
import { DigitalPassportView } from './views/DigitalPassportView';
import { AncientGamesAndCanvasView } from './views/AncientGamesAndCanvasView';
import { TravelerHubView } from './views/TravelerHubView';
import { HeritageScannerView } from './views/HeritageScannerView';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SavedItineraryItem } from './types';
import { Sparkles, Compass, ShieldCheck, Heart, Camera } from 'lucide-react';

function AppContent() {
  const { user, openAdminAuthModal } = useAuth();

  useEffect(() => {
    const handleOpenAdmin = () => {
      openAdminAuthModal();
    };
    const handleNavigateTab = (e: any) => {
      if (e.detail) setCurrentTab(e.detail);
    };
    document.addEventListener('open-admin-auth', handleOpenAdmin);
    document.addEventListener('navigate-tab', handleNavigateTab);
    return () => {
      document.removeEventListener('open-admin-auth', handleOpenAdmin);
      document.removeEventListener('navigate-tab', handleNavigateTab);
    };
  }, [openAdminAuthModal]);

  // Onboarding sequence (accessible via App Tour)
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('sihIntroSeen') !== 'true';
  });

  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [selectedExplorePlace, setSelectedExplorePlace] = useState<string | undefined>(undefined);

  // Save Memory Modal State
  const [saveMemoryOpen, setSaveMemoryOpen] = useState(false);
  const [saveMemoryDefaults, setSaveMemoryDefaults] = useState<{
    placeName?: string;
    lat?: number;
    lon?: number;
    address?: string;
  }>({});

  // Saved Itinerary state
  const [savedItinerary, setSavedItinerary] = useState<SavedItineraryItem[]>(() => {
    const saved = localStorage.getItem('aarambh_saved_itinerary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'init-1',
        title: 'Assi Ghat Morning Vedic Chanting',
        location: 'Varanasi, Uttar Pradesh',
        day: 1,
        addedAt: new Date().toISOString(),
      },
    ];
  });

  const [itineraryDrawerOpen, setItineraryDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aarambh_saved_itinerary', JSON.stringify(savedItinerary));
  }, [savedItinerary]);

  const handleOpenSaveMemory = (
    placeName?: string,
    lat?: number,
    lon?: number,
    address?: string
  ) => {
    setSaveMemoryDefaults({ placeName, lat, lon, address });
    setSaveMemoryOpen(true);
  };

  const handleSaveItineraryStop = (stop: { title: string; location: string; day: number }) => {
    const newItem: SavedItineraryItem = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: stop.title,
      location: stop.location,
      day: stop.day || 1,
      addedAt: new Date().toISOString(),
    };
    setSavedItinerary((prev) => [...prev, newItem]);
  };

  const handleRemoveItineraryItem = (id: string) => {
    setSavedItinerary((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllItinerary = () => {
    setSavedItinerary([]);
  };

  const handleNavigateToPlace = (placeName: string) => {
    setSelectedExplorePlace(placeName);
    setCurrentTab('explore');
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-950">
      {/* SIH 2026 2-Page Onboarding Intro (Dismissible / Re-playable) */}
      {showIntro && (
        <IntroOnboarding
          onComplete={(targetTab?: string) => {
            setShowIntro(false);
            localStorage.setItem('sihIntroSeen', 'true');
            if (targetTab) {
              setCurrentTab(targetTab);
            }
          }}
        />
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'explore') {
            setSelectedExplorePlace(undefined);
          }
        }}
        onOpenSaveMemory={() => handleOpenSaveMemory()}
        onOpenItinerary={() => setItineraryDrawerOpen(true)}
        onReopenIntro={() => setShowIntro(true)}
        savedItineraryCount={savedItinerary.length}
      />

      {/* Main Routed Content Views */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentTab === 'explore' && (
          <ExploreView
            initialPlace={selectedExplorePlace}
            onOpenSaveMemory={handleOpenSaveMemory}
            onSaveItineraryStop={handleSaveItineraryStop}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'heritage' && (
          <HeritageView
            onSelectPlace={handleNavigateToPlace}
            onOpenSaveMemory={handleOpenSaveMemory}
          />
        )}

        {currentTab === 'living-heritage' && (
          <LivingHeritageView
            onSelectPlace={handleNavigateToPlace}
            onOpenSaveMemory={() => handleOpenSaveMemory()}
          />
        )}

        {currentTab === 'evisit' && <EVisitView />}

        {currentTab === 'passport' && (
          <DigitalPassportView
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenSaveMemory={() => handleOpenSaveMemory()}
          />
        )}

        {currentTab === 'scanner' && (
          <ErrorBoundary fallbackTitle="Heritage Scanner">
            <HeritageScannerView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onExplorePlace={handleNavigateToPlace}
              onSaveItineraryStop={handleSaveItineraryStop}
            />
          </ErrorBoundary>
        )}

        {(currentTab === 'games' || currentTab === 'canvas' || currentTab === 'games-canvas') && (
          <AncientGamesAndCanvasView />
        )}

        {(currentTab === 'certificate' || currentTab === 'blockchain') && (
          <BlockchainCertificateView />
        )}

        {(currentTab === 'memory' || currentTab === 'community') && (
          <MemoryView
            onSelectPlace={handleNavigateToPlace}
            onOpenSaveMemory={handleOpenSaveMemory}
          />
        )}

        {currentTab === 'maps' && (
          <MapsView
            onSelectPlace={handleNavigateToPlace}
            initialQuery={selectedExplorePlace || ''}
          />
        )}

        {currentTab === 'memory-trails' && (
          <MemoryTrailsView
            onSelectPlace={handleNavigateToPlace}
            onSaveItineraryStop={handleSaveItineraryStop}
          />
        )}

        {currentTab === 'plan-trip' && (
          <PlanTripView
            onSelectPlace={handleNavigateToPlace}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {(currentTab === 'traveler-hub' || currentTab === 'radar' || currentTab === 'bazaar' || currentTab === 'chat' || currentTab === 'fares') && (
          <ErrorBoundary fallbackTitle="Traveler Hub & Marketplace">
            <TravelerHubView
              initialTab={
                currentTab === 'fares' ? 'fares' : currentTab === 'bazaar' ? 'bazaar' : currentTab === 'chat' ? 'chat' : 'radar'
              }
            />
          </ErrorBoundary>
        )}

        {currentTab === 'admin' && user?.role === 'ADMIN' && <AdminDashboardView />}

        {currentTab === 'creator' && (
          <CreatorDashboardView onOpenSaveMemory={() => handleOpenSaveMemory()} />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <AuthModal />
      <AdminAuthModal />

      <SaveMemoryModal
        isOpen={saveMemoryOpen}
        onClose={() => setSaveMemoryOpen(false)}
        defaultPlaceName={saveMemoryDefaults.placeName}
        defaultLat={saveMemoryDefaults.lat}
        defaultLon={saveMemoryDefaults.lon}
        defaultAddress={saveMemoryDefaults.address}
      />

      <ItineraryDrawer
        isOpen={itineraryDrawerOpen}
        onClose={() => setItineraryDrawerOpen(false)}
        items={savedItinerary}
        onRemoveItem={handleRemoveItineraryItem}
        onClearAll={handleClearAllItinerary}
        onExplorePlace={handleNavigateToPlace}
      />

      {/* Modular Comprehensive Footer */}
      <Footer
        onTabChange={setCurrentTab}
        onOpenSaveMemory={() => handleOpenSaveMemory()}
        onReopenIntro={() => setShowIntro(true)}
        savedItinerary={savedItinerary}
        onOpenItinerary={() => setItineraryDrawerOpen(true)}
        onRemoveItineraryItem={handleRemoveItineraryItem}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
