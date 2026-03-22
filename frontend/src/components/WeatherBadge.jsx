import React, { useState, useEffect, useRef } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, ChevronDown } from 'lucide-react';

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=39.5696&longitude=2.6502&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Europe/Madrid&forecast_days=7';

const getWeatherInfo = (code) => {
  if (code === 0) return { icon: Sun, label: 'Clear', color: 'text-amber-400' };
  if (code <= 3) return { icon: Cloud, label: 'Cloudy', color: 'text-stone-400' };
  if (code <= 49) return { icon: Cloud, label: 'Foggy', color: 'text-stone-400' };
  if (code <= 59) return { icon: CloudDrizzle, label: 'Drizzle', color: 'text-blue-400' };
  if (code <= 69) return { icon: CloudRain, label: 'Rain', color: 'text-blue-500' };
  if (code <= 79) return { icon: CloudSnow, label: 'Snow', color: 'text-sky-300' };
  if (code <= 84) return { icon: CloudRain, label: 'Showers', color: 'text-blue-500' };
  if (code <= 94) return { icon: CloudSnow, label: 'Snow', color: 'text-sky-300' };
  return { icon: CloudLightning, label: 'Storm', color: 'text-purple-400' };
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeatherBadge = ({ isScrolled }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetch(API_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.current) setWeather(data.current);
        if (data.daily) setForecast(data.daily);
      })
      .catch(function() {});
  }, []);

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return function() { document.removeEventListener('mousedown', close); };
  }, []);

  if (!weather) return null;

  var info = getWeatherInfo(weather.weather_code);
  var CurrentIcon = info.icon;
  var temp = Math.round(weather.temperature_2m);
  var light = isScrolled;

  var badgeClass = light
    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
    : 'bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 hover:bg-white/20';

  var dropdownClass = light
    ? 'bg-white border-stone-200'
    : 'bg-stone-900/95 backdrop-blur-xl border-white/10';

  var headerClass = light
    ? 'border-stone-100 bg-stone-50'
    : 'border-white/10';

  var titleClass = light ? 'text-stone-400' : 'text-white/50';
  var footerClass = light ? 'bg-stone-50 border-stone-100' : 'border-white/10';
  var windClass = light ? 'text-stone-400' : 'text-white/40';

  return (
    <div ref={ref} className="relative hidden sm:block" data-testid="weather-badge">
      <button
        onClick={function() { setOpen(function(p) { return !p; }); }}
        className={'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ' + badgeClass}
        data-testid="weather-badge-btn"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="font-semibold">{temp}°C</span>
        <ChevronDown className={'w-3 h-3 transition-transform duration-200 ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && forecast && (
        <ForecastDropdown
          forecast={forecast}
          weather={weather}
          light={light}
          dropdownClass={dropdownClass}
          headerClass={headerClass}
          titleClass={titleClass}
          footerClass={footerClass}
          windClass={windClass}
        />
      )}
    </div>
  );
};

function ForecastDropdown({ forecast, weather, light, dropdownClass, headerClass, titleClass, footerClass, windClass }) {
  var rows = buildRows(forecast, light);

  return (
    <div
      className={'absolute right-0 top-full mt-2 rounded-xl shadow-2xl border overflow-hidden z-50 w-64 ' + dropdownClass}
      data-testid="weather-forecast-dropdown"
    >
      <div className={'px-4 py-3 border-b ' + headerClass}>
        <p className={'text-xs font-medium uppercase tracking-wider ' + titleClass}>
          Mallorca 7-Day Forecast
        </p>
      </div>

      <div>{rows}</div>

      <div className={'px-4 py-2 text-center border-t ' + footerClass}>
        <div className="flex items-center justify-center gap-1.5">
          <Wind className={'w-3 h-3 ' + windClass} />
          <span className={'text-[10px] ' + windClass}>
            Wind {Math.round(weather.wind_speed_10m)} km/h now
          </span>
        </div>
      </div>
    </div>
  );
}

function buildRows(forecast, light) {
  var result = [];
  var times = forecast.time;
  for (var i = 0; i < times.length; i++) {
    var date = times[i];
    var d = new Date(date + 'T00:00:00');
    var dayName = i === 0 ? 'Today' : DAYS[d.getDay()];
    var wInfo = getWeatherInfo(forecast.weather_code[i]);
    var DayIcon = wInfo.icon;
    var hi = Math.round(forecast.temperature_2m_max[i]);
    var lo = Math.round(forecast.temperature_2m_min[i]);
    var rain = forecast.precipitation_probability_max ? forecast.precipitation_probability_max[i] : 0;

    var dayClass = light ? 'text-stone-700' : 'text-white/90';
    var labelClass = light ? 'text-stone-400' : 'text-white/40';
    var hiClass = light ? 'text-stone-800' : 'text-white/90';
    var loClass = light ? 'text-stone-400' : 'text-white/40';
    var rowHover = light ? 'hover:bg-stone-50' : 'hover:bg-white/5';

    result.push(
      <div key={date} className={'flex items-center justify-between px-4 py-2.5 transition-colors ' + rowHover} data-testid={'forecast-day-' + i}>
        <div className="flex items-center gap-3">
          <span className={'text-sm font-medium w-10 ' + dayClass}>{dayName}</span>
          <DayIcon className={'w-4 h-4 ' + wInfo.color} />
          <span className={'text-xs ' + labelClass}>{wInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {rain > 20 && <span className="text-[10px] text-blue-400 font-medium">{rain}%</span>}
          <span className={'text-sm font-semibold tabular-nums ' + hiClass}>{hi}°</span>
          <span className={'text-sm tabular-nums ' + loClass}>{lo}°</span>
        </div>
      </div>
    );
  }
  return result;
}
