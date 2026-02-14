import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port || (protocol === 'wss:' ? '443' : '80')}/ws/insights/`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setLoading(true);
      ws.send(JSON.stringify({ type: 'get_insights', days }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setInsights(data);
      setLoading(false);
      setError(null);
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setLoading(false);
    };

    ws.onclose = () => {
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, [days]);

  const refresh = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setLoading(true);
      wsRef.current.send(JSON.stringify({ type: 'get_insights', days }));
    }
  };

  return { insights, loading, error, refresh };
};
