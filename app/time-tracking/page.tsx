"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveDraft, submitTimesheet, getTimeEntryForWeek, updateTimeEntry, getTimeEntries } from "../../lib/api/timeEntries";
import ConfirmationModal from "../components/modals/ConfirmationModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getWeekRange = (date: Date) => {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday, sunday];
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const TimesheetEntry = () => {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get the current week's Friday
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Calculate how many days to add to get to Friday (5)
    const daysToFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysToFriday);
    return friday;
  });
  const [rows, setRows] = useState([
    {
      hours: [0, 0, 0, 0, 0, 0, 0],
      notes: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingTimeEntryId, setExistingTimeEntryId] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState("");
  const [searchedEntry, setSearchedEntry] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMonth, setSearchMonth] = useState("");
  const [monthResults, setMonthResults] = useState<any[]>([]);
  const [monthSearchLoading, setMonthSearchLoading] = useState(false);
  const [monthSearchError, setMonthSearchError] = useState<string | null>(null);

  const [monday, sunday] = getWeekRange(weekStart);
  const isSubmittedOrSaved = !!existingTimeEntryId && !isDraft;

  // Load existing time entry when week changes or user changes
  useEffect(() => {
    if (user) {
      loadTimeEntry();
    }
  }, [user, weekStart]);

  const loadTimeEntry = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getTimeEntryForWeek(user.id, monday.toISOString());
      
      if (result.success && result.data) {
        // Load existing data
        setRows([{
          hours: result.data.hours,
          notes: result.data.notes || "",
        }]);
        setIsDraft(result.data.status === 'draft');
        setExistingTimeEntryId(result.data._id || null);
      } else {
        // Reset to empty form
        setRows([{
          hours: [0, 0, 0, 0, 0, 0, 0],
          notes: "",
        }]);
        setIsDraft(false);
        setExistingTimeEntryId(null);
      }
    } catch (err) {
      console.error('Error loading time entry:', err);
      setError('Failed to load existing timesheet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setWeekStart(date);
  };

  const handleHoursChange = (rowIdx: number, dayIdx: number, value: string) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 24) num = 24;
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIdx].hours[dayIdx] = num;
      return updated;
    });
  };

  const handleNotesChange = (rowIdx: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIdx].notes = value;
      return updated;
    });
  };

  const totalHours = rows.reduce(
    (sum, row) => sum + row.hours.reduce((a, b) => a + b, 0),
    0
  );

  const canSubmit = rows.some((row) => row.hours.some((h) => h > 0));

  const handleSaveDraft = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let result;
      
      if (existingTimeEntryId) {
        // Update existing entry
        result = await updateTimeEntry(existingTimeEntryId, {
          hours: rows[0].hours,
          notes: rows[0].notes,
          status: 'draft'
        });
      } else {
        // Create new entry
        result = await saveDraft(
          user.id,
          monday.toISOString(),
          sunday.toISOString(),
          rows[0].hours,
          rows[0].notes
        );
        
        // Store the new entry ID
        if (result.success && result.data) {
          setExistingTimeEntryId(result.data._id || null);
        }
      }

      if (result.success) {
        setSuccess('Draft saved successfully!');
        setIsDraft(true);
      } else {
        setError(result.error || 'Failed to save draft');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let result;
      
      if (existingTimeEntryId) {
        // Update existing entry to submitted status
        result = await updateTimeEntry(existingTimeEntryId, {
          hours: rows[0].hours,
          notes: rows[0].notes,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        });
      } else {
        // Create new entry as submitted
        result = await submitTimesheet(
          user.id,
          monday.toISOString(),
          sunday.toISOString(),
          rows[0].hours,
          rows[0].notes
        );
        
        // Store the new entry ID
        if (result.success && result.data) {
          setExistingTimeEntryId(result.data._id || null);
        }
      }

      if (result.success) {
        setSuccess('Timesheet submitted successfully!');
        setIsDraft(false);
      } else {
        setError(result.error || 'Failed to submit timesheet');
      }
    } catch (err) {
      console.error('Error submitting timesheet:', err);
      setError('Failed to submit timesheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithConfirm = async () => {
    if (window.confirm('Are you sure you want to submit this timesheet? You will not be able to make changes after submitting.')) {
      await handleSubmit();
    }
  };

  // Search handler
  const handleSearch = async () => {
    if (!user || !searchDate) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchedEntry(null);
    try {
      // Find the week for the searched date
      const date = new Date(searchDate);
      const [monday, sunday] = getWeekRange(date);
      // Query for submitted timesheet for that week
      const res = await getTimeEntries({
        userId: user.id,
        status: 'submitted',
        weekStart: monday.toISOString(),
        weekEnd: monday.toISOString()
      });
      if (res.success && res.data.length > 0) {
        setSearchedEntry(res.data[0]);
      } else {
        setSearchError("No submitted timesheet found for that week.");
      }
    } catch (err) {
      setSearchError("Error searching for timesheet.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Month search handler
  const handleMonthSearch = async () => {
    if (!user || !searchMonth) return;
    setMonthSearchLoading(true);
    setMonthSearchError(null);
    setMonthResults([]);
    setSearchedEntry(null);
    try {
      // Get first and last day of the month
      const [year, month] = searchMonth.split("-").map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0, 23, 59, 59, 999);
      // Query for all submitted timesheets for that month
      const res = await getTimeEntries({
        userId: user.id,
        status: 'submitted',
        weekStart: firstDay.toISOString(),
        weekEnd: lastDay.toISOString()
      });
      if (res.success && res.data.length > 0) {
        setMonthResults(res.data);
      } else {
        setMonthSearchError("No submitted timesheets found for that month.");
      }
    } catch (err) {
      setMonthSearchError("Error searching for timesheets.");
    } finally {
      setMonthSearchLoading(false);
    }
  };

  return (
    <>
      <div
        className="app-background"
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 24px",
          minHeight: "100vh",
        }}
      >
        {/* Search Card */}
        <div className="card" style={{ marginBottom: 32, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <div className="label-text" style={{ marginBottom: 8, color: '#8E8EA8', fontSize: 16, fontWeight: 500 }}>
            Search Submitted Timesheets
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, width: '100%' }}>
            {/* Date Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
              <label className="label-text" htmlFor="search-date" style={{ color: '#8E8EA8', marginBottom: 2 }}>By Date</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="search-date"
                  type="date"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  className="body-text"
                  style={{
                    width: 140,
                    height: 40,
                    border: "1px solid #3E3E50",
                    borderRadius: 4,
                    padding: "8px 12px",
                    fontSize: 14,
                    color: "#C2C2CC",
                    background: "#1E1E2E",
                    outline: 'none',
                  }}
                  aria-label="Search by date"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchDate || searchLoading}
                  className="btn-secondary"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #3E3E50",
                    background: searchLoading ? '#2A2A3A' : '#2A2A3A',
                    color: searchLoading ? '#7A7A8A' : '#F3F3F5',
                    cursor: searchLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
            {/* Month Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
              <label className="label-text" htmlFor="search-month" style={{ color: '#8E8EA8', marginBottom: 2 }}>By Month</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="search-month"
                  type="month"
                  value={searchMonth}
                  onChange={e => setSearchMonth(e.target.value)}
                  className="body-text"
                  style={{
                    width: 120,
                    height: 40,
                    border: "1px solid #3E3E50",
                    borderRadius: 4,
                    padding: "8px 12px",
                    fontSize: 14,
                    color: "#C2C2CC",
                    background: "#1E1E2E",
                    outline: 'none',
                  }}
                  aria-label="Search by month"
                />
                <button
                  type="button"
                  onClick={handleMonthSearch}
                  disabled={!searchMonth || monthSearchLoading}
                  className="btn-secondary"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #3E3E50",
                    background: monthSearchLoading ? '#2A2A3A' : '#2A2A3A',
                    color: monthSearchLoading ? '#7A7A8A' : '#F3F3F5',
                    cursor: monthSearchLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {monthSearchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
            {(searchedEntry || monthResults.length > 0) && (
              <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => { setSearchedEntry(null); setSearchDate(""); setSearchError(null); setMonthResults([]); setSearchMonth(""); setMonthSearchError(null); }}
                  className="btn-secondary"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #3E3E50",
                    background: '#2A2A3A',
                    color: '#F3F3F5',
                  }}
                >
                  Return to Current Week
                </button>
              </div>
            )}
          </div>
          {searchError && <div className="label-text" style={{ color: '#DC2626', marginTop: 8 }}>{searchError}</div>}
          {monthSearchError && <div className="label-text" style={{ color: '#DC2626', marginTop: 8 }}>{monthSearchError}</div>}
        </div>
        {/* If a month search result is present, show the list */}
        {monthResults.length > 0 && (
          <div className="card" style={{ padding: 24, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", marginBottom: 32 }}>
            <div className="title-large" style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF", marginBottom: 16 }}>
              Submitted Timesheets for {searchMonth}
            </div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14, color: "#C2C2CC", marginBottom: 24 }}>
              <thead>
                <tr>
                  <th className="label-text" style={{ color: '#8E8EA8', fontWeight: 500, background: "#181822", border: `1px solid #2A2A3A`, borderBottom: `2px solid #2A2A3A`, height: 40 }}>Week</th>
                  <th className="label-text" style={{ color: '#8E8EA8', fontWeight: 500, background: "#181822", border: `1px solid #2A2A3A`, borderBottom: `2px solid #2A2A3A`, height: 40 }}>Status</th>
                  <th className="label-text" style={{ color: '#8E8EA8', fontWeight: 500, background: "#181822", border: `1px solid #2A2A3A`, borderBottom: `2px solid #2A2A3A`, height: 40 }}>Total Hours</th>
                  <th className="label-text" style={{ color: '#8E8EA8', fontWeight: 500, background: "#181822", border: `1px solid #2A2A3A`, borderBottom: `2px solid #2A2A3A`, height: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {monthResults.map((entry, idx) => (
                  <tr key={entry._id || idx} style={{ borderBottom: '1px solid #2A2A3A' }}>
                    <td style={{ padding: '12px 16px', color: '#F3F3F5' }}>{formatDate(new Date(entry.weekStart))} – {formatDate(new Date(entry.weekEnd))}</td>
                    <td style={{ padding: '12px 16px', color: '#C2C2CC', textTransform: 'capitalize' }}>{entry.status}</td>
                    <td style={{ padding: '12px 16px', color: '#4E9CF5' }}>{entry.hours.reduce((a: number, b: number) => a + b, 0).toFixed(2)} hrs</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: 14, fontWeight: 500, padding: "6px 14px", borderRadius: 6, border: "1px solid #3E3E50", background: '#2A2A3A', color: '#F3F3F5' }}
                        onClick={() => { setSearchedEntry(entry); setMonthResults([]); }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* If a search result is present, show it read-only */}
        {searchedEntry ? (
          <div className="card" style={{ padding: 24, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", marginBottom: 32 }}>
            <div className="title-large" style={{ fontSize: 24, fontWeight: 600, color: "#FFFFFF", marginBottom: 8 }}>
              Submitted Timesheet for Week: {formatDate(new Date(searchedEntry.weekStart))} – {formatDate(new Date(searchedEntry.weekEnd))}
            </div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14, color: "#C2C2CC", marginBottom: 24 }}>
              <thead>
                <tr>
                  {DAYS.map((day) => (
                    <th key={day} className="label-text" style={{ width: 110, fontWeight: 500, background: "#181822", border: `1px solid #2A2A3A`, borderBottom: `2px solid #2A2A3A`, height: 48, color: "#F3F3F5" }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: 48 }}>
                  {searchedEntry.hours.map((h: number, i: number) => (
                    <td key={i} style={{ border: `1px solid #2A2A3A`, background: "#1E1E2E", padding: 0 }}>
                      <input type="number" value={h} disabled className="body-text" style={{ width: "100%", height: 40, borderRadius: 4, border: "1px solid #3E3E50", padding: 8, background: "#242435", fontSize: 14, color: "#C2C2CC", outline: "none", opacity: 0.7 }} aria-label={`${DAYS[i]} hours`} />
                    </td>
                  ))}
                </tr>
                <tr style={{ height: 48 }}>
                  <td colSpan={7} style={{ border: `1px solid #2A2A3A`, background: "#181822", padding: 0 }}>
                    <textarea value={searchedEntry.notes} disabled rows={3} className="body-text" style={{ width: "100%", fontSize: 14, border: "1px solid #3E3E50", padding: "10px 12px", resize: "vertical", borderRadius: 4, background: "#181822", color: "#C2C2CC", outline: "none", opacity: 0.7 }} aria-label="Notes" />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="title-medium" style={{ fontSize: 16, fontWeight: 600, color: "#F3F3F5", marginTop: 16, marginBottom: 32 }}>
              Total: {searchedEntry.hours.reduce((a: number, b: number) => a + b, 0).toFixed(2)} hrs
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: 24,
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                className="title-large"
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Timesheet for Week: {formatDate(monday)} – {formatDate(sunday)}
              </div>
              <input
                type="date"
                value={monday.toISOString().slice(0, 10)}
                onChange={handleWeekChange}
                style={{
                  width: 240,
                  height: 40,
                  border: "1px solid #3E3E50",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "#F3F3F5",
                  background: "#1E1E2E",
                  marginTop: 8,
                }}
                aria-label="Select week start"
                className="body-text"
              />
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: 16,
                  borderRadius: 6,
                  background: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: 16,
                  borderRadius: 6,
                  background: "#059669",
                  color: "#FFFFFF",
                  fontSize: 14,
                }}
              >
                {success}
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  fontSize: 14,
                  color: "#C2C2CC",
                  marginBottom: 24,
                }}
              >
                <thead>
                  <tr>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        style={{
                          width: 110,
                          fontWeight: 500,
                          background: "#181822",
                          border: `1px solid #2A2A3A`,
                          borderBottom: `2px solid #2A2A3A`,
                          height: 48,
                          color: "#F3F3F5",
                        }}
                        className="label-text"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ height: 48 }}>
                      {DAYS.map((_, dayIdx) => (
                        <td
                          key={dayIdx}
                          style={{
                            border: `1px solid #2A2A3A`,
                            background: "#1E1E2E",
                            padding: 0,
                          }}
                        >
                          <input
                            type="number"
                            min={0}
                            max={24}
                            step={0.25}
                            value={row.hours[dayIdx]}
                            onChange={(e) => handleHoursChange(rowIdx, dayIdx, e.target.value)}
                            disabled={isLoading}
                            style={{
                              width: "100%",
                              height: 40,
                              borderRadius: 6,
                              border: "1px solid #3E3E50",
                              padding: 8,
                              background: "#242435",
                              fontSize: 14,
                              color: "#F3F3F5",
                              outline: "none",
                              ...(isLoading && { opacity: 0.5, cursor: "not-allowed" }),
                            }}
                            aria-label={`${DAYS[dayIdx]} hours`}
                            className="body-text"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Notes row for each timesheet row */}
                  {rows.map((row, rowIdx) => (
                    <tr key={`notes-${rowIdx}`} style={{ height: 48 }}>
                      <td
                        colSpan={7}
                        style={{
                          border: `1px solid #2A2A3A`,
                          background: "#181822",
                          padding: 0,
                        }}
                      >
                        <textarea
                          value={row.notes}
                          onChange={(e) => handleNotesChange(rowIdx, e.target.value)}
                          disabled={isLoading}
                          rows={3}
                          placeholder="Optional notes"
                          style={{
                            width: "100%",
                            fontSize: 14,
                            border: "1px solid #3E3E50",
                            padding: "10px 12px",
                            resize: "vertical",
                            borderRadius: 6,
                            background: "#181822",
                            color: "#C2C2CC",
                            outline: "none",
                            ...(isLoading && { opacity: 0.5, cursor: "not-allowed" }),
                          }}
                          aria-label="Notes"
                          className="body-text"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F3F3F5",
                marginTop: 16,
                marginBottom: 32,
              }}
              className="title-medium"
            >
              Total: {totalHours.toFixed(2)} hrs
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isLoading}
                className="btn-secondary"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "10px 20px",
                  borderRadius: 6,
                  cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
                  ...(isSubmitting || isLoading ? { opacity: 0.5 } : {}),
                }}
              >
                {isSubmitting ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={handleSubmitWithConfirm}
                disabled={isSubmitting || !canSubmit || isLoading || isSubmittedOrSaved}
                className="btn-primary"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "none",
                  cursor: isSubmitting || !canSubmit || isLoading || isSubmittedOrSaved ? "not-allowed" : "pointer",
                  ...(isSubmitting || !canSubmit || isLoading || isSubmittedOrSaved ? { opacity: 0.5 } : {}),
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Timesheet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TimesheetEntry; 