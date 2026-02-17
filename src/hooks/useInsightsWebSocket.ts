import { useEffect, useRef, useState } from 'react';
import { safeJsonParse } from '../utils/security';

interface VisitInsights {
  total_visits: number;
  unique_ips: number;
  ipv4_count: number;
  ipv6_count: number;
  top_isps: Array<{ isp: string; count: number; percentage: number }>;
  top_paths: Array<{ path: string; count: number; percentage: number }>;
  top_countries: Array<{ country: string; count: number; percentage: number }>;
  visits_by_date: Array<{ date: string; count: number }>;
}

export const useInsightsWebSocket = (days: number) => {
  const [insights, setInsights] = useState<VisitInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//api.iranicdna.com/ws/insights/`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setLoading(true);
      ws.send(JSON.stringify({ type: 'get_insights', days }));
      
      intervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'get_insights', days }));
        }
      }, 5000);
    };

    ws.onmessage = (event) => {
      const data = safeJsonParse<VisitInsights>(event.data);
      if (data) {
        setInsights(data);
        setLoading(false);
        setError(null);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setLoading(false);
    };

    ws.onclose = () => {
      setLoading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      ws.close();
    };
  }, [days]);

  return { insights, loading, error };
};
