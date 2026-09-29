import React from 'react';
import { WeatherContext } from '../types';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherContext | null;
  loading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, loading = false }) => {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm animate-pulse flex flex-col gap-3">
        <div className="h-4 bg-stone-100 rounded w-1/3" />
        <div className="h-10 bg-stone-100 rounded w-1/2" />
        <div className="h-4 bg-stone-100 rounded w-full" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-stone-400" />
        Real-time meteorological forecast currently synchronizing...
      </div>
    );
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-6 h-6 text-amber-500" />;
    if (code === 2 || code === 3) return <Cloud className="w-6 h-6 text-stone-500" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (code >= 95) return <CloudLightning className="w-6 h-6 text-purple-500" />;
    return <Sun className="w-6 h-6 text-amber-500" />;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.weatherCode)}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Live Meteorological Context
            </h4>
            <p className="text-[11px] text-stone-500">{weather.condition}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-heritage text-stone-900 leading-none">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Feels like {Math.round(weather.apparentTemperature)}°C
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-stone-100 text-center">
        <div className="p-2 rounded-xl bg-stone-50">
          <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] uppercase">
            <Droplets className="w-3 h-3 text-blue-500" /> Humidity
          </div>
          <div className="text-xs font-bold text-stone-800 mt-0.5">{weather.humidity}%</div>
        </div>

        <div className="p-2 rounded-xl bg-stone-50">
          <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] uppercase">
            <Wind className="w-3 h-3 text-stone-500" /> Wind
          </div>
          <div className="text-xs font-bold text-stone-800 mt-0.5">{weather.windSpeed} km/h</div>
        </div>

        <div className="p-2 rounded-xl bg-stone-50">
          <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] uppercase">
            <CloudRain className="w-3 h-3 text-cyan-600" /> Rain
          </div>
          <div className="text-xs font-bold text-stone-800 mt-0.5">{weather.precipitation} mm</div>
        </div>
      </div>

      {/* 4-Day Forecast strip */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="pt-3">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Regional 4-Day Outlook
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            {weather.forecast.map((day) => {
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={day.date} className="p-1.5 rounded-lg bg-stone-50/70 border border-stone-100">
                  <div className="text-[10px] font-semibold text-stone-600">{dayName}</div>
                  <div className="my-1 flex justify-center">{getWeatherIcon(day.weatherCode)}</div>
                  <div className="text-[11px] font-bold text-stone-800">
                    {Math.round(day.maxTemp)}°
                    <span className="text-[9px] font-normal text-stone-400 ml-0.5">
                      {Math.round(day.minTemp)}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather Alerts if any */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mt-3 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>{weather.alerts[0]}</span>
        </div>
      )}

      {/* Source & Timestamp */}
      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
        <span>Source: {weather.source}</span>
        <span>{new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
