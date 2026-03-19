import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind } from 'lucide-react';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=39.5696&longitude=2.6502&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Madrid';

const getWeatherInfo = (code) => {
  if (code === 0) return { icon: Sun, label: 'Clear' };
  if (code <= 3) return { icon: Cloud, label: 'Cloudy' };
  if (code <= 49) return { icon: Cloud, label: 'Foggy' };
  if (code <= 59) return { icon: CloudDrizzle, label: 'Drizzle' };
  if (code <= 69) return { icon: CloudRain, label: 'Rain' };
  if (code <= 79) return { icon: CloudSnow, label: 'Snow' };
  if (code <= 84) return { icon: CloudRain, label: 'Showers' };
  if (code <= 94) return { icon: CloudSnow, label: 'Snow' };
  return { icon: CloudLightning, label: 'Storm' };
};

export const WeatherBadge = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(WEATHER_URL)
      .then(res => res.json())
      .then(data => {
        if (data?.current) setWeather(data.current);
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  const { icon: Icon, label } = getWeatherInfo(weather.weather_code);
  const temp = Math.round(weather.temperature_2m);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs"
      data-testid="weather-badge"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="font-medium">{temp}°C</span>
      <span className="hidden sm:inline text-white/60">Mallorca</span>
    </div>
  );
};
