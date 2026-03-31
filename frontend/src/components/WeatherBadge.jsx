import React, { useState, useEffect, useRef } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, ChevronDown } from 'lucide-react';

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=39.5696&longitude=2.6502&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Europe/Madrid&forecast_days=7';

const getWeatherInfo = function(code) {
  if (code === 0) return { icon: Sun, color: 'text-amber-400' };
  if (code <= 3) return { icon: Cloud, color: 'text-white/60' };
  if (code <= 49) return { icon: Cloud, color: 'text-white/60' };
  if (code <= 59) return { icon: CloudDrizzle, color: 'text-blue-300' };
  if (code <= 69) return { icon: CloudRain, color: 'text-blue-400' };
  if (code <= 79) return { icon: CloudSnow, color: 'text-sky-300' };
  if (code <= 84) return { icon: CloudRain, color: 'text-blue-400' };
  if (code <= 94) return { icon: CloudSnow, color: 'text-sky-300' };
  return { icon: CloudLightning, color: 'text-purple-400' };
};

const getWeatherInfoLight = function(code) {
  if (code === 0) return { icon: Sun, color: 'text-amber-500' };
  if (code <= 3) return { icon: Cloud, color: 'text-stone-400' };
  if (code <= 49) return { icon: Cloud, color: 'text-stone-400' };
  if (code <= 59) return { icon: CloudDrizzle, color: 'text-blue-400' };
  if (code <= 69) return { icon: CloudRain, color: 'text-blue-500' };
  if (code <= 79) return { icon: CloudSnow, color: 'text-sky-400' };
  if (code <= 84) return { icon: CloudRain, color: 'text-blue-500' };
  if (code <= 94) return { icon: CloudSnow, color: 'text-sky-400' };
  return { icon: CloudLightning, color: 'text-purple-500' };
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeatherBadge = function({ isScrolled }) {
  const ref = useRef(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(function() {
    fetch(API_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.current) setWeather(data.current);
        if (data.daily) setForecast(data.daily);
      })
      .catch(function() {});
  }, []);

  const hideTimer = useRef(null);

  const handleEnter = function() {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setOpen(true);
  };
  const handleLeave = function() {
    hideTimer.current = setTimeout(function() { setOpen(false); }, 200);
  };

  if (!weather) return null;

  const info = getWeatherInfo(weather.weather_code);
  const CurrentIcon = info.icon;
  const temp = Math.round(weather.temperature_2m);
  const light = isScrolled;

  const badgeClass = light
    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
    : 'bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 hover:bg-white/20';

  return (
    <div ref={ref} className="relative hidden sm:block" data-testid="weather-badge" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ' + badgeClass}
        data-testid="weather-badge-btn"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="font-semibold">{temp}°C</span>
        <ChevronDown className={'w-3 h-3 transition-transform duration-200 ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && forecast && (
        <ForecastPanel forecast={forecast} weather={weather} light={light} />
      )}
    </div>
  );
};

function ForecastPanel({ forecast, weather, light }) {
  const rows = buildRows(forecast, light);

  const panelClass = light
    ? 'bg-white/90 backdrop-blur-xl border-stone-200/80 shadow-lg'
    : 'bg-white/10 backdrop-blur-xl border-white/15 shadow-2xl';

  const footerBorder = light ? 'border-stone-200/50' : 'border-white/10';
  const footerText = light ? 'text-stone-400' : 'text-white/40';

  return (
    <div
      className={'absolute right-0 top-full mt-2 rounded-2xl border overflow-hidden z-50 w-44 ' + panelClass}
      data-testid="weather-forecast-dropdown"
    >
      <div className="py-1">{rows}</div>

      <div className={'px-3 py-1.5 text-center border-t ' + footerBorder}>
        <div className="flex items-center justify-center gap-1">
          <Wind className={'w-3 h-3 ' + footerText} />
          <span className={'text-[9px] ' + footerText}>
            {Math.round(weather.wind_speed_10m)} km/h
          </span>
        </div>
      </div>
    </div>
  );
}

function buildRows(forecast, light) {
  const result = [];
  const times = forecast.time;
  for (let i = 0; i < times.length; i++) {
    const date = times[i];
    const d = new Date(date + 'T00:00:00');
    const dayName = i === 0 ? 'Today' : DAYS[d.getDay()];
    const wInfo = light ? getWeatherInfoLight(forecast.weather_code[i]) : getWeatherInfo(forecast.weather_code[i]);
    const DayIcon = wInfo.icon;
    const hi = Math.round(forecast.temperature_2m_max[i]);
    const lo = Math.round(forecast.temperature_2m_min[i]);

    const dayClass = light ? 'text-stone-700' : 'text-white/90';
    const hiClass = light ? 'text-stone-800' : 'text-white/90';
    const loClass = light ? 'text-stone-400' : 'text-white/40';
    const rowHover = light ? 'hover:bg-stone-100/50' : 'hover:bg-white/10';

    result.push(
      <div key={date} className={'flex items-center justify-between px-3 py-1.5 transition-colors ' + rowHover} data-testid={'forecast-day-' + i}>
        <div className="flex items-center gap-2">
          <span className={'text-xs font-medium w-8 ' + dayClass}>{dayName}</span>
          <DayIcon className={'w-3.5 h-3.5 ' + wInfo.color} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={'text-xs font-semibold tabular-nums ' + hiClass}>{hi}°</span>
          <span className={'text-[11px] tabular-nums ' + loClass}>{lo}°</span>
        </div>
      </div>
    );
  }
  return result;
}
