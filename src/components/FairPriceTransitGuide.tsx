import React, { useState, useEffect } from 'react';
import {
  Car,
  AlertTriangle,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Info,
  DollarSign,
  Loader2,
  X,
  Compass,
  FileText,
  Search,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { fetchTransitFares, reportTransitFare, calculateTransitFare } from '../services/api';
import { TransitFareGuide, TransitFareRoute } from '../types';

interface FairPriceTransitGuideProps {
  cityName?: string;
  monumentName?: string;
}

export const FairPriceTransitGuide: React.FC<FairPriceTransitGuideProps> = ({
  cityName = 'Agra',
  monumentName = 'Taj Mahal',
}) => {
  const [guide, setGuide] = useState<TransitFareGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Custom Route Search & Fare Calculator state
  const [customFrom, setCustomFrom] = useState(`${cityName} Railway Station`);
  const [customTo, setCustomTo] = useState(monumentName || `${cityName} Heritage Center`);
  const [calculating, setCalculating] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Fare report form state
  const [reportRoute, setReportRoute] = useState('');
  const [reportMode, setReportMode] = useState('Auto Rickshaw');
  const [reportPaid, setReportPaid] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadFares = async () => {
    try {
      setLoading(true);
      const data = await fetchTransitFares(cityName);
      setGuide(data);
      if (data.routes && data.routes.length > 0) {
        setReportRoute(`${data.routes[0].from} → ${data.routes[0].to}`);
      }
    } catch (err) {
      console.error('Failed to load transit fares', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFares();
    setCustomFrom(`${cityName} Railway Station`);
    setCustomTo(monumentName || `${cityName} Heritage Center`);
    setCustomResult(null);
  }, [cityName, monumentName]);

  const activeRoute: TransitFareRoute | undefined = guide?.routes?.[selectedRouteIndex];

  const handleCopyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    setCopiedPhrase(true);
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  const handleCalculateCustomFare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFrom.trim() || !customTo.trim()) return;

    setCalculating(true);
    setCalcError(null);
    try {
      const res = await calculateTransitFare({
        from: customFrom.trim(),
        to: customTo.trim(),
        city: cityName,
      });
      setCustomResult(res);
    } catch (err: any) {
      setCalcError('Could not calculate fare for this route. Please check location names.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportRoute || !reportPaid) return;

    try {
      setSubmittingReport(true);
      await reportTransitFare({
        city: cityName,
        route: reportRoute,
        mode: reportMode,
        paid: parseInt(reportPaid, 10),
        note: reportNote.trim() || 'Verified fair rate paid by traveler',
      });
      setReportSuccess(true);
      setReportPaid('');
      setReportNote('');
      await loadFares();
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center text-xl shadow-xs">
            🛺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                Fair Auto & Transit Tariff Guide (Anti-Overcharge)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                VERIFIED TARIFFS
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Official meter rates, custom route calculator & active scam warnings for{' '}
              <span className="font-semibold text-stone-800">{cityName}</span>
            </p>
          </div>
        </div>

        {/* Report Fare Button */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2.5 rounded-full border border-stone-300 hover:border-amber-500 bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-900 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Report What You Paid</span>
        </button>
      </div>

      {/* CUSTOM ROUTE & AUTO FARE SEARCH CALCULATOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white shadow-md border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider">
              Search & Calculate Auto Fare Between Any 2 Points:
            </h4>
          </div>
          <span className="text-[10px] text-stone-400 hidden sm:inline">
            In {cityName} & surrounding region
          </span>
        </div>

        <form onSubmit={handleCalculateCustomFare} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] text-stone-300 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>From (Station, Airport, Hotel):</span>
            </label>
            <input
              type="text"
              required
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              placeholder="e.g. Railway Station, Bus Stand, Airport"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] text-stone-300 font-semibold flex items-center gap-1">
              <Navigation className="w-3 h-3 text-amber-400" />
              <span>To (Monument, Market, Ghat):</span>
            </label>
            <input
              type="text"
              required
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              placeholder="e.g. Monument Gate, Temple, Main Market"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={calculating}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {calculating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
              ) : (
                <Search className="w-3.5 h-3.5 text-stone-950" />
              )}
              <span>Calculate</span>
            </button>
          </div>
        </form>

        {calcError && (
          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
            {calcError}
          </div>
        )}

        {/* Custom Calculation Result Card */}
        {customResult && (
          <div className="p-4 rounded-xl bg-stone-800/90 border border-amber-500/40 text-stone-100 space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700 pb-2">
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <span>📍 {customResult.from}</span>
                <ArrowRight className="w-3 h-3 text-stone-400" />
                <span>{customResult.to}</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-bold">
                {customResult.distanceKm} km • ~{customResult.durationMinutes} mins drive
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Auto Fare */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700">
                <div className="text-[10px] text-stone-400 font-medium">Auto Rickshaw</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{customResult.autoRickshawFare}</div>
                <div className="text-[9px] text-stone-400 mt-0.5">Govt Meter Tariff</div>
              </div>

              {/* E-Rickshaw */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700">
                <div className="text-[10px] text-stone-400 font-medium">E-Rickshaw (Shared/Private)</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 leading-snug">{customResult.eRickshawFare}</div>
                <div className="text-[9px] text-stone-400 mt-0.5">Eco Battery</div>
              </div>

              {/* Taxi / Cab */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700">
                <div className="text-[10px] text-stone-400 font-medium">App Cab (Uber/Ola)</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{customResult.appTaxiFare}</div>
                <div className="text-[9px] text-stone-400 mt-0.5">Sedan / Mini AC</div>
              </div>

              {/* Prepaid Taxi */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700">
                <div className="text-[10px] text-stone-400 font-medium">Prepaid Taxi Counter</div>
                <div className="text-sm font-bold text-stone-200 mt-0.5">{customResult.prepaidTaxiFare}</div>
                <div className="text-[9px] text-stone-400 mt-0.5">Station Booth</div>
              </div>
            </div>

            {/* Negotiation Phrase */}
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-700 text-xs text-amber-200 flex items-center justify-between gap-2">
              <span className="italic text-[11px] leading-relaxed">🗣️ "{customResult.negotiationPhrase}"</span>
              <button
                type="button"
                onClick={() => handleCopyPhrase(customResult.negotiationPhrase)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[10px] text-amber-300 font-bold shrink-0 cursor-pointer"
              >
                {copiedPhrase ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Route Selector Chips */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Select Popular Route in {cityName}:
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {guide?.routes?.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setSelectedRouteIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                selectedRouteIndex === idx
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm font-semibold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <span>📍 {(r.from || '').split('(')[0]} → {(r.to || '').split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Route Fair Price Card */}
      {activeRoute && (
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
            <div>
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                Route Distance & Duration
              </div>
              <div className="text-base font-bold text-stone-900 mt-0.5">
                {activeRoute.from} <span className="text-amber-600">→</span> {activeRoute.to}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                🛣️ {activeRoute.distanceKm} km
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                ⏱️ ~{activeRoute.travelTimeMinutes} mins
              </span>
            </div>
          </div>

          {/* 4 Mode Price Comparisons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Auto Rickshaw */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <div className="text-lg">🛺</div>
              <div className="text-xs font-bold text-stone-800">Auto Rickshaw</div>
              <div className="text-base font-extrabold text-amber-700">
                {activeRoute.autoRickshawFare}
              </div>
              <div className="text-[10px] text-stone-500">Fair day rate / meter</div>
            </div>

            {/* E-Rickshaw */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <div className="text-lg">🔋</div>
              <div className="text-xs font-bold text-stone-800">E-Rickshaw</div>
              <div className="text-base font-extrabold text-emerald-700">
                {activeRoute.eRickshawFare}
              </div>
              <div className="text-[10px] text-stone-500">Eco-zone authorized</div>
            </div>

            {/* App Taxi */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <div className="text-lg">📱</div>
              <div className="text-xs font-bold text-stone-800">Ola / Uber</div>
              <div className="text-base font-extrabold text-sky-700">
                {activeRoute.appTaxiFare}
              </div>
              <div className="text-[10px] text-stone-500">App estimate with AC</div>
            </div>

            {/* Govt Prepaid Counter */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <div className="text-lg">🎫</div>
              <div className="text-xs font-bold text-stone-800">Pre-Paid Booth</div>
              <div className="text-base font-extrabold text-indigo-700">
                {activeRoute.prepaidTaxiFare}
              </div>
              <div className="text-[10px] text-stone-500">Platform 1 Exit booth</div>
            </div>
          </div>

          {/* Practical Transit Advice & Eco Zone rules */}
          <div className="p-3 rounded-xl bg-white/90 border border-amber-200/60 text-xs text-stone-700 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Transit Rule & Eco-Zone Warning:</span>
            </div>
            <p className="leading-relaxed">{activeRoute.practicalTips}</p>
          </div>

          {/* Local Bargaining Phrase Helper */}
          <div className="p-3.5 rounded-xl bg-stone-900 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>🗣️ What to tell the driver (Fair Fare Script)</span>
              </div>
              <div className="text-xs font-medium text-stone-200 mt-1 italic">
                "{activeRoute.localHindiPhrase}"
              </div>
            </div>
            <button
              onClick={() => handleCopyPhrase(activeRoute.localHindiPhrase)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPhrase ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPhrase ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Scam Alerts & Red Flags Board */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Active Tourist Scam Warnings & Red Flags</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guide?.scamAlerts?.map((scam) => (
            <div
              key={scam.id}
              className={`p-4 rounded-2xl border transition-all space-y-2 shadow-2xs ${
                scam.severity === 'HIGH'
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>{scam.title}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                    scam.severity === 'HIGH'
                      ? 'bg-red-200 text-red-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {scam.severity} ALERT
                </span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {scam.description}
              </p>

              <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-800 font-medium flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Rule:</strong> {scam.howToAvoid}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Crowdsourced Fare Reports */}
      {guide?.recentReports && guide.recentReports.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Recent Traveler-Reported Fares
            </h4>
            <span className="text-[11px] text-stone-400">Crowdsourced transparency</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {guide.recentReports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="text-[11px] text-stone-600">{r.mode}</span>
                  <span className="text-emerald-700 font-extrabold">₹{r.paid}</span>
                </div>
                <div className="text-[11px] font-medium text-stone-800 truncate">{r.route}</div>
                <div className="text-[10px] text-stone-500 italic truncate">"{r.note}"</div>
                <div className="text-[9px] text-stone-400 text-right">{r.reportedAgo}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report What You Paid Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🛺
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Report Fare You Paid</h3>
                  <p className="text-xs text-stone-500">Help protect fellow travelers from overcharging</p>
                </div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                <h4 className="font-bold text-stone-900 text-base">Fare Report Saved!</h4>
                <p className="text-xs text-stone-500">
                  Thank you for contributing to fair travel tariffs in {cityName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Route Taken *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportRoute}
                    onChange={(e) => setReportRoute(e.target.value)}
                    placeholder="e.g. Agra Cantt Station → Taj Mahal East Gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mode of Transport
                    </label>
                    <select
                      value={reportMode}
                      onChange={(e) => setReportMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Auto Rickshaw">Auto Rickshaw 🛺</option>
                      <option value="E-Rickshaw">E-Rickshaw 🔋</option>
                      <option value="Pre-Paid Taxi">Pre-Paid Taxi 🚕</option>
                      <option value="Uber / Ola">Uber / Ola 📱</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={10000}
                      value={reportPaid}
                      onChange={(e) => setReportPaid(e.target.value)}
                      placeholder="e.g. 110"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Short Note / Experience
                  </label>
                  <textarea
                    rows={2}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="e.g. Took 20 mins, driver was polite and did not divert to shops."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport || !reportRoute.trim() || !reportPaid}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {submittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Fare Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
