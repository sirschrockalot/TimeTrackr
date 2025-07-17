"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, Filter, BarChart3, TrendingUp, Clock, DollarSign, Users, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { getTimeEntries, TimeEntry } from "../../lib/api/timeEntries";

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    dateRange: 'Last 30 days',
    project: 'All Projects',
    teamMember: 'All Members',
    reportType: 'Time Summary'
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all time entries on mount (or when filters change, if desired)
  useEffect(() => {
    setLoading(true);
    setError(null);
    getTimeEntries()
      .then(res => {
        if (res.success) setTimeEntries(res.data);
        else setError(res.error || 'Failed to fetch time entries');
      })
      .catch(e => setError('Failed to fetch time entries'))
      .finally(() => setLoading(false));
  }, []);

  // --- AGGREGATION HELPERS ---
  // Helper: get day of week index (0=Mon, 6=Sun)
  function getDayIdx(date: Date) {
    return (date.getDay() + 6) % 7;
  }
  // Helper: get month short name
  function getMonthShort(date: Date) {
    return date.toLocaleString('en-US', { month: 'short' });
  }
  // Helper: get YYYY-MM-DD
  function getDateStr(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  // --- AGGREGATE DATA ---
  const weeklyData = useMemo(() => {
    // Aggregate all entries by day of week (Mon-Sun)
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const totals = Array(7).fill(0);
    timeEntries.forEach(entry => {
      const weekStart = new Date(entry.weekStart);
      entry.hours.forEach((h, i) => {
        totals[i] += h;
      });
    });
    return days.map((day, i) => ({ day, hours: +totals[i].toFixed(2), billable: +totals[i].toFixed(2), target: 8 }));
  }, [timeEntries]);

  const projectData = useMemo(() => {
    // If you have project info, aggregate by project. Otherwise, stub.
    // Here, we just show one project for all entries.
    const total = timeEntries.reduce((sum, e) => sum + e.hours.reduce((a, b) => a + b, 0), 0);
    return [
      { name: 'All Projects', hours: +total.toFixed(2), percentage: 100, color: '#4E9CF5' }
    ];
  }, [timeEntries]);

  const monthlyTrendData = useMemo(() => {
    // Aggregate by month
    const map: Record<string, { month: string, hours: number, revenue: number, utilization: number }> = {};
    timeEntries.forEach(entry => {
      const d = new Date(entry.weekStart);
      const month = getMonthShort(d);
      if (!map[month]) map[month] = { month, hours: 0, revenue: 0, utilization: 0 };
      map[month].hours += entry.hours.reduce((a, b) => a + b, 0);
      // Stub revenue/utilization
      map[month].revenue += entry.hours.reduce((a, b) => a + b, 0) * 75;
      map[month].utilization = 85;
    });
    return Object.values(map);
  }, [timeEntries]);

  const teamPerformanceData = useMemo(() => {
    // Aggregate by userId
    const map: Record<string, { name: string, hours: number, efficiency: number, projects: number }> = {};
    timeEntries.forEach(entry => {
      const name = entry.userId || 'Unknown';
      if (!map[name]) map[name] = { name, hours: 0, efficiency: 90, projects: 1 };
      map[name].hours += entry.hours.reduce((a, b) => a + b, 0);
      // Stub efficiency/projects
      map[name].efficiency = 90;
      map[name].projects = 1;
    });
    return Object.values(map);
  }, [timeEntries]);

  // Summary cards
  const totalHours = useMemo(() => timeEntries.reduce((sum, e) => sum + e.hours.reduce((a, b) => a + b, 0), 0), [timeEntries]);
  const billableHours = totalHours; // Stub: all hours billable
  const utilizationRate = 85; // Stub
  const revenue = totalHours * 75; // Stub

  // Detailed table rows
  const detailedRows = useMemo(() => {
    // Flatten all entries into daily rows
    const rows: any[] = [];
    timeEntries.forEach(entry => {
      const weekStart = new Date(entry.weekStart);
      entry.hours.forEach((h, i) => {
        if (h > 0) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          rows.push({
            date: getDateStr(date),
            project: 'All Projects', // Stub
            task: '-', // Stub
            hours: h,
            billable: 'Yes', // Stub
            rate: '$75/h' // Stub
          });
        }
      });
    });
    return rows;
  }, [timeEntries]);

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1E1E2E',
          border: '1px solid #2A2A3A',
          borderRadius: '8px',
          padding: '12px',
          color: '#F3F3F5'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#8E8EA8' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '14px'
            }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie chart tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1E1E2E',
          border: '1px solid #2A2A3A',
          borderRadius: '8px',
          padding: '12px',
          color: '#F3F3F5'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#8E8EA8' }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0', color: payload[0].payload.color }}>
            Hours: {payload[0].value}h ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle export report
  const handleExportReport = () => {
    const reportData = {
      filters,
      summary: {
        totalHours: totalHours,
        billableHours: billableHours,
        utilizationRate: utilizationRate,
        revenue: revenue
      },
      charts: {
        projectDistribution: projectData,
        weeklyTrend: weeklyData,
        monthlyTrend: monthlyTrendData,
        teamPerformance: teamPerformanceData
      }
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetrackr-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <h1 className="title-large">Reports</h1>
        <p className="body-text">Analyze your time tracking data and performance metrics</p>
        <button 
          onClick={handleExportReport}
          className="btn btn-primary" 
          style={{ float: "right", marginTop: -48 }}
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Report Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Filter className="nav-icon" size={20} />
            <h2 className="title-medium">Filters</h2>
          </div>
        </div>
        <div className="card-content">
          <div className="content-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Date Range</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="body-text" 
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Project</label>
              <select 
                value={filters.project}
                onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                className="body-text" 
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              >
                <option>All Projects</option>
                <option>Web Development</option>
                <option>Mobile App</option>
                <option>Design System</option>
              </select>
            </div>
            <div>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Team Member</label>
              <select 
                value={filters.teamMember}
                onChange={(e) => setFilters(prev => ({ ...prev, teamMember: e.target.value }))}
                className="body-text" 
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              >
                <option>All Members</option>
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Mike Johnson</option>
              </select>
            </div>
            <div>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Report Type</label>
              <select 
                value={filters.reportType}
                onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                className="body-text" 
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              >
                <option>Time Summary</option>
                <option>Project Progress</option>
                <option>Team Performance</option>
                <option>Billing Report</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Hours</div>
              <div className="stat-value">{totalHours}h</div>
              <div className="label-text" style={{ color: '#10B981', fontSize: 12 }}>+12% vs last period</div>
            </div>
            <div className="stat-icon">
              <Clock className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Billable Hours</div>
              <div className="stat-value">{billableHours}h</div>
              <div className="label-text" style={{ color: '#10B981', fontSize: 12 }}>+8% vs last period</div>
            </div>
            <div className="stat-icon">
              <DollarSign className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Utilization Rate</div>
              <div className="stat-value">{utilizationRate}%</div>
              <div className="label-text" style={{ color: '#F59E0B', fontSize: 12 }}>-2% vs last period</div>
            </div>
            <div className="stat-icon">
              <Target className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Revenue</div>
              <div className="stat-value">${revenue.toLocaleString()}</div>
              <div className="label-text" style={{ color: '#10B981', fontSize: 12 }}>+15% vs last period</div>
            </div>
            <div className="stat-icon">
              <TrendingUp className="nav-icon" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="content-grid" style={{ marginBottom: 24 }}>
        {/* Project Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 className="nav-icon" size={20} />
              <h3 className="title-medium">Time Distribution by Project</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{
                    color: '#F3F3F5',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Hours Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <TrendingUp className="nav-icon" size={20} />
              <h3 className="title-medium">Weekly Hours Trend</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <YAxis 
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: '#F3F3F5',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="hours" fill="#4E9CF5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="billable" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="content-grid" style={{ marginBottom: 24 }}>
        {/* Monthly Trends Line Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <TrendingUp className="nav-icon" size={20} />
              <h3 className="title-medium">Monthly Performance Trends</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: '#F3F3F5',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#4E9CF5" 
                  strokeWidth={2}
                  dot={{ fill: '#4E9CF5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4E9CF5', strokeWidth: 2 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Area Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Users className="nav-icon" size={20} />
              <h3 className="title-medium">Team Performance Overview</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <YAxis 
                  tick={{ fill: '#8E8EA8', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A3A' }}
                  tickLine={{ stroke: '#2A2A3A' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: '#F3F3F5',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stackId="1"
                  stroke="#4E9CF5" 
                  fill="#4E9CF5" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users className="nav-icon" size={20} />
            <h2 className="title-medium">Detailed Time Report</h2>
          </div>
        </div>
        <div className="card-content" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ background: '#242435' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billable</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#8E8EA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</td>
                  </tr>
                ) : detailedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No time entries found for the selected filters.</td>
                  </tr>
                ) : (
                  detailedRows.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #2A2A3A' }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#C2C2CC' }}>{row.date}</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#F3F3F5' }}>{row.project}</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#C2C2CC' }}>{row.task}</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#4E9CF5' }}>{row.hours}h</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#10B981' }}>{row.billable}</td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', color: '#F3F3F5' }}>{row.rate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 