import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface BetType {
  betTypeId: number;
  betDescription: string;
}

export interface Match {
  matchId: number;
  matchDescription: string;
  resolutionTimestamp: number;
  allowedBetTypes: BetType[];
}

export interface BetCatalogContextType {
  matches: Match[];
  loading: boolean;
  error: string | null;
  getMatchById: (matchId: number) => Match | undefined;
  getBetTypeById: (matchId: number, betTypeId: number) => BetType | undefined;
  getBetDescription: (matchId: number, betTypeId: number) => string;
}

const BetCatalogContext = createContext<BetCatalogContextType | undefined>(undefined);

export function BetCatalogProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBetCatalog() {
      try {
        setLoading(true);
        const response = await fetch('/bet-catalog.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bet catalog: ${response.statusText}`);
        }
        
        const data: Match[] = await response.json();
        setMatches(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching bet catalog:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bet catalog');
      } finally {
        setLoading(false);
      }
    }

    fetchBetCatalog();
  }, []);

  const getMatchById = (matchId: number): Match | undefined => {
    return matches.find(match => match.matchId === matchId);
  };

  const getBetTypeById = (matchId: number, betTypeId: number): BetType | undefined => {
    const match = getMatchById(matchId);
    return match?.allowedBetTypes.find(betType => betType.betTypeId === betTypeId);
  };

  const getBetDescription = (matchId: number, betTypeId: number): string => {
    const match = getMatchById(matchId);
    const betType = getBetTypeById(matchId, betTypeId);
    
    if (!match || !betType) {
      return `Unknown bet (Match: ${matchId}, Type: ${betTypeId})`;
    }
    
    return `${match.matchDescription} - ${betType.betDescription}`;
  };

  const value: BetCatalogContextType = {
    matches,
    loading,
    error,
    getMatchById,
    getBetTypeById,
    getBetDescription,
  };

  return (
    <BetCatalogContext.Provider value={value}>
      {children}
    </BetCatalogContext.Provider>
  );
}

export function useBetCatalog() {
  const context = useContext(BetCatalogContext);
  if (context === undefined) {
    throw new Error('useBetCatalog must be used within a BetCatalogProvider');
  }
  return context;
}
