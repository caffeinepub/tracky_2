import { useMemo } from 'react';
import { motivationalQuotes, type Quote } from '../data/motivationalQuotes';

export function useDailyQuote(): Quote {
  return useMemo(() => {
    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use the date as a seed for deterministic selection
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const index = daysSinceEpoch % motivationalQuotes.length;
    
    return motivationalQuotes[index];
  }, []);
}
