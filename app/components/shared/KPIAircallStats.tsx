"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useCombinedAuth } from "../../hooks/useCombinedAuth";
import { useData } from "../../contexts/DataContext";

const TIMEFRAMES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

const KPIAircallStats: React.FC = () => {
  const { user } = useCombinedAuth();
  const { users } = useData();
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("day");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [kpiData, setKpiData] = useState({ totalDials: 0, totalTalkTimeMinutes: 0, inboundCalls: 0 });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKpiData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        timeframe,
        ...(timeframe === "custom" && { start: customStart, end: customEnd }),
        ...(selectedUserId !== "all" && { userId: selectedUserId }),
      });
      const response = await fetch(`/api/kpi/stats?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch KPI data.");
      const data = await response.json();
      setKpiData(data.kpis);
      setChartData(data.chartData);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, timeframe, customStart, customEnd]);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/kpi/sync", { method: "POST" });
      if (!response.ok) throw new Error("Failed to sync data.");
      // Optionally, refetch data after sync
      await fetchKpiData();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [fetchKpiData]);

  // Find selected user object
  const selectedUser = selectedUserId === "all" ? null : users.find(u => u.id === selectedUserId);

  // Helper for custom range label
  const customLabel = customStart && customEnd ? `${customStart} to ${customEnd}` : "Select date range";

  return (
    <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h1 className="main-title" style={{ fontSize: '2rem', fontWeight: 600, color: '#F3F3F5' }}>User KPIs</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={handleSync}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#4E9CF5',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Sync Data
            </button>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, background: '#232336', color: '#F3F3F5', border: '1px solid #2A2A3A' }}
              disabled={isLoading}
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
            {timeframe === "custom" && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, background: '#232336', color: '#F3F3F5', border: '1px solid #2A2A3A' }}
                  max={customEnd || undefined}
                  disabled={isLoading}
                />
                <span style={{ color: '#8E8EA8' }}>to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, background: '#232336', color: '#F3F3F5', border: '1px solid #2A2A3A' }}
                  min={customStart || undefined}
                  disabled={isLoading}
                />
              </>
            )}
            {user?.role === 'admin' && (
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, background: '#232336', color: '#F3F3F5', border: '1px solid #2A2A3A' }}
                disabled={isLoading}
              >
                <option value="all">All Users</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        {error && <div style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 6 }}>{error}</div>}

        <div style={{ color: '#8E8EA8', fontSize: 16, marginBottom: 8 }}>
          {selectedUserId === "all"
            ? `Showing KPIs for all users (${timeframe === "custom" ? customLabel : TIMEFRAMES.find(tf => tf.value === timeframe)?.label})`
            : `Showing KPIs for ${selectedUser?.name} (${timeframe === "custom" ? customLabel : TIMEFRAMES.find(tf => tf.value === timeframe)?.label})`}
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8E8EA8' }}>Loading KPI data...</div>
        ) : (
          <>
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div className="kpi-card" style={{ background: 'linear-gradient(to bottom, #1E1E2E, #121217)', border: '1px solid #2A2A3A', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                <div className="kpi-icon" style={{ padding: 8, color: 'white', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</div>
                <div className="kpi-content" style={{ flex: 1 }}>
                  <p className="kpi-label" style={{ color: '#8E8EA8', fontSize: '0.875rem', marginBottom: 4 }}>Total Dials</p>
                  <h3 className="kpi-value" style={{ color: '#F3F3F5', fontSize: '1.25rem', fontWeight: 600 }}>{kpiData.totalDials}</h3>
                </div>
              </div>
              <div className="kpi-card" style={{ background: 'linear-gradient(to bottom, #1E1E2E, #121217)', border: '1px solid #2A2A3A', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                <div className="kpi-icon" style={{ padding: 8, color: 'white', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕐</div>
                <div className="kpi-content" style={{ flex: 1 }}>
                  <p className="kpi-label" style={{ color: '#8E8EA8', fontSize: '0.875rem', marginBottom: 4 }}>Total Talk Time (min)</p>
                  <h3 className="kpi-value" style={{ color: '#F3F3F5', fontSize: '1.25rem', fontWeight: 600 }}>{kpiData.totalTalkTimeMinutes}</h3>
                </div>
              </div>
              <div className="kpi-card" style={{ background: 'linear-gradient(to bottom, #1E1E2E, #121217)', border: '1px solid #2A2A3A', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                <div className="kpi-icon" style={{ padding: 8, color: 'white', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📲</div>
                <div className="kpi-content" style={{ flex: 1 }}>
                  <p className="kpi-label" style={{ color: '#8E8EA8', fontSize: '0.875rem', marginBottom: 4 }}>Inbound Calls Answered</p>
                  <h3 className="kpi-value" style={{ color: '#F3F3F5', fontSize: '1.25rem', fontWeight: 600 }}>{kpiData.inboundCalls}</h3>
                </div>
              </div>
            </div>
            <div className="chart-container" style={{ background: 'linear-gradient(to bottom, #1E1E2E, #121217)', border: '1px solid #2A2A3A', borderRadius: 12, padding: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
              <h2 className="chart-title" style={{ color: '#F3F3F5', fontSize: '1.125rem', fontWeight: 500, marginBottom: 16 }}>Daily Performance</h2>
              <div className="chart-wrapper" style={{ width: '100%', height: 300, position: 'relative' }}>
                <div className="simple-chart" style={{ display: 'flex', alignItems: 'end', height: 250, gap: 12, padding: '20px 0' }}>
                  {chartData.map(({ day, dials, inbound }) => (
                    <div className="chart-day" key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div className="chart-bars" style={{ display: 'flex', alignItems: 'end', gap: 4, height: 200 }}>
                        <div className="chart-bar dials" style={{ width: 20, borderRadius: '4px 4px 0 0', backgroundColor: '#4E9CF5', height: `${dials}%` }} />
                        <div className="chart-bar inbound" style={{ width: 20, borderRadius: '4px 4px 0 0', backgroundColor: '#8E8EA8', height: `${inbound}%` }} />
                      </div>
                      <div className="chart-label" style={{ color: '#8E8EA8', fontSize: '0.875rem' }}>{day}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend" style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8E8EA8', fontSize: '0.875rem' }}>
                    <div className="legend-color dials" style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#4E9CF5' }} />
                    <span>Dials</span>
                  </div>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8E8EA8', fontSize: '0.875rem' }}>
                    <div className="legend-color inbound" style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#8E8EA8' }} />
                    <span>Inbound</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KPIAircallStats; 