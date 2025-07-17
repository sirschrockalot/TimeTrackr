"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTimeEntries, TimeEntry } from "../../lib/api/timeEntries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}
function getQuarterStart(date: Date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}
function getQuarterEnd(date: Date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0, 23, 59, 59, 999);
}
function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's submitted timesheets
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    // Admins see all submitted timesheets, others see only their own
    const filters = user.role === 'admin'
      ? { status: 'submitted' }
      : { userId: user.id, status: 'submitted' };
    getTimeEntries(filters)
      .then(res => {
        if (res.success) setTimeEntries(res.data);
        else setError(res.error || 'Failed to fetch timesheets');
      })
      .catch(() => setError('Failed to fetch timesheets'))
      .finally(() => setLoading(false));
  }, [user]);

  // --- AGGREGATION ---
  const now = new Date();
  const monday = getMonday(now);
  const weekStart = monday;
  const weekEnd = new Date(monday); weekEnd.setDate(monday.getDate() + 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const quarterStart = getQuarterStart(now);
  const quarterEnd = getQuarterEnd(now);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  // Filter entries for each period
  const weekEntries = timeEntries.filter(e => {
    const d = new Date(e.weekStart);
    return d <= weekEnd && d >= weekStart;
  });
  const monthEntries = timeEntries.filter(e => {
    const d = new Date(e.weekStart);
    return d <= monthEnd && d >= monthStart;
  });
  const quarterEntries = timeEntries.filter(e => {
    const d = new Date(e.weekStart);
    return d <= quarterEnd && d >= quarterStart;
  });
  const yearEntries = timeEntries.filter(e => {
    const d = new Date(e.weekStart);
    return d <= yearEnd && d >= yearStart;
  });

  // --- WEEK CHART ---
  const weekChartData = useMemo(() => {
    const totals = Array(7).fill(0);
    weekEntries.forEach(e => {
      e.hours.forEach((h, i) => { totals[i] += h; });
    });
    return DAYS.map((day, i) => ({ day, hours: +totals[i].toFixed(2), target: 8 }));
  }, [weekEntries]);
  const weekTotal = weekChartData.reduce((sum, d) => sum + d.hours, 0);
  const weekUtil = Math.round((weekTotal / 40) * 100);

  // --- MONTH CHART ---
  const monthChartData = useMemo(() => {
    // Group by week in month
    const map: Record<string, { label: string, hours: number, target: number }> = {};
    monthEntries.forEach(e => {
      const d = new Date(e.weekStart);
      const weekLabel = `${formatDateShort(d)} - ${formatDateShort(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6))}`;
      if (!map[weekLabel]) map[weekLabel] = { label: weekLabel, hours: 0, target: 40 };
      map[weekLabel].hours += e.hours.reduce((a, b) => a + b, 0);
    });
    return Object.values(map);
  }, [monthEntries]);
  const monthTotal = monthChartData.reduce((sum, d) => sum + d.hours, 0);
  const monthTarget = monthChartData.length * 40;
  const monthUtil = monthTarget ? Math.round((monthTotal / monthTarget) * 100) : 0;

  // --- QUARTER CHART ---
  const quarterChartData = useMemo(() => {
    // Group by month in quarter
    const map: Record<string, { month: string, hours: number, target: number }> = {};
    quarterEntries.forEach(e => {
      const d = new Date(e.weekStart);
      const m = MONTHS[d.getMonth()];
      if (!map[m]) map[m] = { month: m, hours: 0, target: 0 };
      map[m].hours += e.hours.reduce((a, b) => a + b, 0);
      map[m].target = 40 * 4; // Approximate 4 weeks per month
    });
    return Object.values(map);
  }, [quarterEntries]);
  const quarterTotal = quarterChartData.reduce((sum, d) => sum + d.hours, 0);
  const quarterTarget = quarterChartData.length * 40 * 4;
  const quarterUtil = quarterTarget ? Math.round((quarterTotal / quarterTarget) * 100) : 0;

  // --- TOP WORKERS PIE CHART DATA (ADMIN ONLY) ---
  const topWorkersData = useMemo(() => {
    if (user?.role !== 'admin') return null;

    // Helper function to aggregate hours by user
    const aggregateByUser = (entries: TimeEntry[]) => {
      const userHours: Record<string, { name: string; hours: number }> = {};
      
      entries.forEach(entry => {
        const totalHours = entry.hours.reduce((sum, h) => sum + h, 0);
        if (!userHours[entry.userId]) {
          userHours[entry.userId] = { name: `User ${entry.userId.slice(-4)}`, hours: 0 };
        }
        userHours[entry.userId].hours += totalHours;
      });
      
      return Object.values(userHours)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5); // Top 5 workers
    };

    return {
      month: aggregateByUser(monthEntries),
      quarter: aggregateByUser(quarterEntries),
      year: aggregateByUser(yearEntries)
    };
  }, [monthEntries, quarterEntries, yearEntries, user?.role]);

  // Colors for pie chart segments
  const COLORS = ['#4E9CF5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // --- UI ---
  return (
    <div className="app-background" style={{ minHeight: '100vh', padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="title-large" style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
        Dashboard
      </div>
      <div className="body-text" style={{ color: '#C2C2CC', marginBottom: 32 }}>
        {user?.role === 'admin'
          ? 'Admin dashboard: Company-wide time tracking summary.'
          : `Welcome back, ${user?.name}. Here's your time tracking summary.`}
      </div>
      {loading ? (
        <div className="label-text" style={{ color: '#8E8EA8' }}>Loading your timesheet data...</div>
      ) : error ? (
        <div className="label-text" style={{ color: '#DC2626' }}>{error}</div>
      ) : (
        <>
          {/* CHART CARDS HORIZONTAL LAYOUT */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginBottom: 32,
            }}
          >
            {/* Week Card */}
            <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
              <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>This Week</div>
              <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekChartData} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
                      <CartesianGrid stroke="#2A2A3A" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <YAxis tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                      <Legend wrapperStyle={{ color: '#F3F3F5', fontSize: '12px' }} />
                      <Bar dataKey="hours" fill="#4E9CF5" radius={[4, 4, 0, 0]} name="Your Hours" />
                      <Bar dataKey="target" fill="#8E8EA8" radius={[4, 4, 0, 0]} name="Target (8h)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div className="label-text" style={{ color: '#8E8EA8', marginBottom: 8 }}>Total Hours</div>
                  <div className="title-large" style={{ color: '#F3F3F5', fontWeight: 600, fontSize: 28 }}>{weekTotal.toFixed(2)}h</div>
                  <div className="label-text" style={{ color: weekUtil >= 100 ? '#10B981' : '#F59E0B', marginTop: 8 }}>Utilization: {weekUtil}%</div>
                  <div className="label-text" style={{ color: '#8E8EA8', marginTop: 8 }}>Target: 40h</div>
                </div>
              </div>
            </div>
            {/* Month Card */}
            <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
              <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>This Month</div>
              <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                {MONTHS[now.getMonth()]} {now.getFullYear()}
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthChartData} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
                      <CartesianGrid stroke="#2A2A3A" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <YAxis tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                      <Legend wrapperStyle={{ color: '#F3F3F5', fontSize: '12px' }} />
                      <Bar dataKey="hours" fill="#4E9CF5" radius={[4, 4, 0, 0]} name="Your Hours" />
                      <Bar dataKey="target" fill="#8E8EA8" radius={[4, 4, 0, 0]} name="Target (40h)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div className="label-text" style={{ color: '#8E8EA8', marginBottom: 8 }}>Total Hours</div>
                  <div className="title-large" style={{ color: '#F3F3F5', fontWeight: 600, fontSize: 28 }}>{monthTotal.toFixed(2)}h</div>
                  <div className="label-text" style={{ color: monthUtil >= 100 ? '#10B981' : '#F59E0B', marginTop: 8 }}>Utilization: {monthUtil}%</div>
                  <div className="label-text" style={{ color: '#8E8EA8', marginTop: 8 }}>Target: {monthTarget}h</div>
                </div>
              </div>
            </div>
            {/* Quarter Card */}
            <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
              <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>This Quarter</div>
              <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                Q{getQuarter(now)} {now.getFullYear()}
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={quarterChartData} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
                      <CartesianGrid stroke="#2A2A3A" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <YAxis tick={{ fill: '#8E8EA8', fontSize: 13 }} axisLine={{ stroke: '#2A2A3A' }} tickLine={{ stroke: '#2A2A3A' }} />
                      <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                      <Legend wrapperStyle={{ color: '#F3F3F5', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="hours" stroke="#4E9CF5" strokeWidth={2} name="Your Hours" />
                      <Line type="monotone" dataKey="target" stroke="#8E8EA8" strokeWidth={2} name="Target (160h)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div className="label-text" style={{ color: '#8E8EA8', marginBottom: 8 }}>Total Hours</div>
                  <div className="title-large" style={{ color: '#F3F3F5', fontWeight: 600, fontSize: 28 }}>{quarterTotal.toFixed(2)}h</div>
                  <div className="label-text" style={{ color: quarterUtil >= 100 ? '#10B981' : '#F59E0B', marginTop: 8 }}>Utilization: {quarterUtil}%</div>
                  <div className="label-text" style={{ color: '#8E8EA8', marginTop: 8 }}>Target: {quarterTarget}h</div>
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN TOP WORKERS PIE CHARTS */}
          {user?.role === 'admin' && topWorkersData && (
            <div
              style={{
                display: 'flex',
                gap: 32,
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 32,
              }}
            >
              {/* Month Top Workers */}
              <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
                <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>Top Workers - Month</div>
                <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                  {MONTHS[now.getMonth()]} {now.getFullYear()}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                                         <Pie
                       data={topWorkersData.month}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="hours"
                     >
                      {topWorkersData.month.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Quarter Top Workers */}
              <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
                <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>Top Workers - Quarter</div>
                <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                  Q{getQuarter(now)} {now.getFullYear()}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                                         <Pie
                       data={topWorkersData.quarter}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="hours"
                     >
                      {topWorkersData.quarter.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Year Top Workers */}
              <div className="card" style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 370, padding: 24, marginBottom: 0 }}>
                <div className="title-medium" style={{ color: '#F3F3F5', fontWeight: 500, fontSize: 20, marginBottom: 12 }}>Top Workers - Year</div>
                <div className="body-text" style={{ color: '#8E8EA8', marginBottom: 16 }}>
                  {now.getFullYear()}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                                         <Pie
                       data={topWorkersData.year}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="hours"
                     >
                      {topWorkersData.year.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A3A', color: '#F3F3F5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 