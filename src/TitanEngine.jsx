import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity, Brain, Zap, Target, ChevronRight, ChevronLeft,
  Clock, Calendar, BarChart2, Grid, Dumbbell, BookOpen,
  TrendingUp, Flame, Moon, Sun, Edit3, Check, X, Plus
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const TOTAL_WEEKS = 5200;
const BIRTH_YEAR = 2009;
const BIRTH_MONTH = 0; // Jan – adjust if needed
const BIRTH_DAY = 1;
const BIRTH_DATE = new Date(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY);

const CATEGORIES = [
  { id: "study", label: "Study", color: "#22c55e", icon: BookOpen },
  { id: "strength", label: "Strength", color: "#3b82f6", icon: Dumbbell },
  { id: "break", label: "Break", color: "#f59e0b", icon: Moon },
  { id: "creative", label: "Creative", color: "#a855f7", icon: Brain },
  { id: "other", label: "Other", color: "#6b7280", icon: Activity },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// ── HELPERS ────────────────────────────────────────────────────────────────────
function getWeeksSinceBirth() {
  const now = new Date();
  const ms = now - BIRTH_DATE;
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}

function getStartOfWeek(weeksOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + weeksOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekDays(weekOffset = 0) {
  const start = getStartOfWeek(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isEvenDay(date) {
  return date.getDate() % 2 === 0;
}

function fmtDate(date) {
  return date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

function storageKey(prefix, ...parts) {
  return `titan_${prefix}_${parts.join("_")}`;
}

function loadData(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const GLASS = {
  background: "rgba(10,10,10,0.7)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
};

const PANEL = {
  ...GLASS,
  padding: "1.25rem",
  marginBottom: "1rem",
};

const BTN = (active, color = "#22c55e") => ({
  background: active ? color : "rgba(255,255,255,0.05)",
  border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
  color: active ? "#000" : "#aaa",
  borderRadius: 6,
  padding: "4px 12px",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "'JetBrains Mono', monospace",
  transition: "all 0.15s",
});

// ── CHRONO MATRIX ──────────────────────────────────────────────────────────────
function ChronoMatrix({ currentWeek }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <Grid size={16} color="#22c55e" />
        <span style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 13, letterSpacing: 2 }}>100-YEAR CHRONO-MATRIX</span>
        <span style={{ marginLeft: "auto", color: "#555", fontSize: 11, fontFamily: "monospace" }}>
          WK {currentWeek} / {TOTAL_WEEKS}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 11, fontFamily: "monospace" }}>
        {[["#1a3a2a", "LIVED"], ["#22c55e", "NOW"], ["#1a1f2e", "FUTURE"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#666" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block", border: l === "NOW" ? "1px solid #22c55e" : "none" }} />
            {l}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, maxHeight: 320, overflowY: "auto" }}>
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const isPast = i < currentWeek;
          const isNow = i === currentWeek;
          const isFuture = i > currentWeek;
          const yearMark = i % 52 === 0;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 6, height: 6, borderRadius: 1,
                background: isNow ? "#22c55e" : isPast ? "#1d4a32" : "#0f1520",
                border: isNow ? "1px solid #22c55e" : yearMark ? "1px solid #1a2a1a" : "none",
                boxShadow: isNow ? "0 0 6px #22c55e" : "none",
                cursor: "default",
                flexShrink: 0,
                opacity: hovered === i ? 1 : isFuture ? 0.6 : 1,
                transition: "all 0.1s",
              }}
              title={`Week ${i} · Year ${Math.floor(i / 52)}`}
            />
          );
        })}
      </div>
      {hovered !== null && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>
          WK {hovered} · YR {Math.floor(hovered / 52)} · {hovered < currentWeek ? "LIVED" : hovered === currentWeek ? "NOW" : "AHEAD"}
        </div>
      )}
    </div>
  );
}

// ── HOUR BLOCK ─────────────────────────────────────────────────────────────────
function HourBlock({ hour, date, data, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editLog, setEditLog] = useState(false);
  const [logText, setLogText] = useState(data.log || "");
  const showGripper = isEvenDay(date) && data.category === "strength";
  const cat = CAT_MAP[data.category];

  const handleCat = (id) => {
    onChange({ ...data, category: id });
  };

  const handleGripper = (reps) => {
    onChange({ ...data, gripperReps: reps });
  };

  const handleLogSave = () => {
    onChange({ ...data, log: logText });
    setEditLog(false);
  };

  return (
    <div style={{
      ...GLASS,
      padding: "8px 10px",
      marginBottom: 4,
      borderLeft: `2px solid ${cat?.color || "#222"}`,
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => setExpanded(!expanded)}>
        <span style={{ color: "#555", fontSize: 11, fontFamily: "monospace", minWidth: 36 }}>
          {String(hour).padStart(2, "0")}:00
        </span>
        <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={(e) => { e.stopPropagation(); handleCat(c.id); }}
              style={{ ...BTN(data.category === c.id, c.color), padding: "2px 7px", fontSize: 10 }}
            >
              {c.label}
            </button>
          ))}
        </div>
        {isEvenDay(date) && (
          <span style={{ color: "#3b82f6", fontSize: 10, fontFamily: "monospace" }}>GRIP↑</span>
        )}
        <span style={{ color: "#333", fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {isEvenDay(date) && data.category === "strength" && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "#3b82f6", fontSize: 11, fontFamily: "monospace" }}>GRIPPER REPS: </span>
              <input
                type="number"
                min="0"
                max="500"
                value={data.gripperReps || ""}
                onChange={e => handleGripper(parseInt(e.target.value) || 0)}
                placeholder="0"
                style={{
                  background: "rgba(59,130,246,0.1)", border: "1px solid #3b82f6",
                  color: "#3b82f6", borderRadius: 4, padding: "2px 8px",
                  width: 60, fontSize: 12, fontFamily: "monospace",
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            {editLog ? (
              <>
                <textarea
                  autoFocus
                  value={logText}
                  onChange={e => setLogText(e.target.value)}
                  placeholder="Deep work log..."
                  rows={2}
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ccc", borderRadius: 4, padding: "4px 8px",
                    fontSize: 12, fontFamily: "monospace", resize: "vertical",
                  }}
                />
                <button onClick={handleLogSave} style={{ ...BTN(true), padding: "4px 8px" }}><Check size={12} /></button>
                <button onClick={() => setEditLog(false)} style={{ ...BTN(false), padding: "4px 8px" }}><X size={12} /></button>
              </>
            ) : (
              <div
                onClick={() => setEditLog(true)}
                style={{
                  flex: 1, color: data.log ? "#888" : "#333",
                  fontSize: 11, fontFamily: "monospace",
                  cursor: "text", minHeight: 20,
                  fontStyle: data.log ? "normal" : "italic",
                }}
              >
                {data.log || "// deep work log..."}
                <Edit3 size={10} style={{ marginLeft: 6, opacity: 0.4 }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── WEEKLY VIEW ────────────────────────────────────────────────────────────────
function WeeklyView({ weekOffset, setWeekOffset, currentWeek }) {
  const days = getWeekDays(weekOffset);
  const [activeDay, setActiveDay] = useState(0);
  const [dayData, setDayData] = useState({});

  const weekKey = storageKey("week", currentWeek + weekOffset);

  useEffect(() => {
    const saved = loadData(weekKey, {});
    setDayData(saved);
  }, [weekKey]);

  const handleHourChange = useCallback((dayIdx, hour, val) => {
    setDayData(prev => {
      const next = {
        ...prev,
        [dayIdx]: { ...(prev[dayIdx] || {}), [hour]: val }
      };
      saveData(weekKey, next);
      return next;
    });
  }, [weekKey]);

  const day = days[activeDay];
  const dayHours = dayData[activeDay] || {};

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <Calendar size={16} color="#22c55e" />
        <span style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 13, letterSpacing: 2 }}>
          WEEKLY TRACKER — WK {currentWeek + weekOffset}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setWeekOffset(o => o - 1)} style={BTN(false)}>
            <ChevronLeft size={12} />
          </button>
          <button onClick={() => setWeekOffset(0)} style={BTN(weekOffset === 0)}>NOW</button>
          <button onClick={() => setWeekOffset(o => o + 1)} style={BTN(false)}>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {days.map((d, i) => {
          const even = isEvenDay(d);
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                ...BTN(activeDay === i, "#22c55e"),
                flex: 1, minWidth: 70,
                borderBottom: even ? "2px solid #3b82f6" : undefined,
                position: "relative",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: 10 }}>
                {d.toLocaleDateString("en-IN", { weekday: "short" })}
                {isToday && <span style={{ color: "#22c55e", marginLeft: 4 }}>●</span>}
              </div>
              <div style={{ fontSize: 9, color: activeDay === i ? "#000" : "#555" }}>
                {d.getDate()} {even ? "⚡" : ""}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace", marginBottom: 8 }}>
        {fmtDate(day)} {isEvenDay(day) ? "· GRIPPER DAY ⚡" : ""}
      </div>

      {/* Hours */}
      <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
        {Array.from({ length: 24 }, (_, h) => (
          <HourBlock
            key={h}
            hour={h}
            date={day}
            data={dayHours[h] || {}}
            onChange={(val) => handleHourChange(activeDay, h, val)}
          />
        ))}
      </div>
    </div>
  );
}

// ── ANALYTICS ──────────────────────────────────────────────────────────────────
function Analytics({ currentWeek }) {
  const [analyticsData, setAnalyticsData] = useState({ pie: [], bar: [], heatmap: [] });

  useEffect(() => {
    // Aggregate last 7 weeks
    const catCounts = {};
    const weekBars = [];
    const heatCells = [];

    for (let w = -6; w <= 0; w++) {
      const wk = currentWeek + w;
      const data = loadData(storageKey("week", wk), {});
      let weekTotal = 0;
      const dayCounts = Array(7).fill(0);

      for (let d = 0; d < 7; d++) {
        const dData = data[d] || {};
        for (let h = 0; h < 24; h++) {
          const block = dData[h];
          if (block?.category) {
            catCounts[block.category] = (catCounts[block.category] || 0) + 1;
            weekTotal++;
            dayCounts[d]++;
          }
        }
      }

      weekBars.push({ name: `WK${wk}`, hours: weekTotal });
      dayCounts.forEach((c, di) => heatCells.push({ week: w + 6, day: di, count: c }));
    }

    const pie = Object.entries(catCounts).map(([id, val]) => ({
      name: CAT_MAP[id]?.label || id, value: val, color: CAT_MAP[id]?.color || "#666"
    }));

    setAnalyticsData({ pie, bar: weekBars, heatmap: heatCells });
  }, [currentWeek]);

  const maxHeat = Math.max(...analyticsData.heatmap.map(c => c.count), 1);

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <BarChart2 size={16} color="#22c55e" />
        <span style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 13, letterSpacing: 2 }}>
          ANALYTICS ENGINE
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Pie */}
        <div style={{ ...GLASS, padding: 12 }}>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>DISTRIBUTION</div>
          {analyticsData.pie.length === 0 ? (
            <div style={{ color: "#333", fontSize: 11, fontFamily: "monospace", textAlign: "center", paddingTop: 40 }}>NO DATA YET</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={analyticsData.pie} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={2}>
                  {analyticsData.pie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: "#22c55e" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {analyticsData.pie.map(e => (
              <span key={e.name} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#666", fontFamily: "monospace" }}>
                <span style={{ width: 6, height: 6, borderRadius: 1, background: e.color, display: "inline-block" }} />
                {e.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div style={{ ...GLASS, padding: 12 }}>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 6 }}>VELOCITY (hrs/wk)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={analyticsData.bar} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: "#444", fontSize: 9 }} />
              <YAxis tick={{ fill: "#444", fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 6, fontSize: 11 }}
              />
              <Bar dataKey="hours" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ ...GLASS, padding: 12 }}>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 8 }}>CONSISTENCY HEATMAP (7 WEEKS)</div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: 7 }, (_, w) => (
            <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const cell = analyticsData.heatmap.find(c => c.week === w && c.day === d);
                const intensity = cell ? cell.count / maxHeat : 0;
                return (
                  <div
                    key={d}
                    title={`W${w} D${d}: ${cell?.count || 0} hrs`}
                    style={{
                      height: 12, borderRadius: 2,
                      background: `rgba(34,197,94,${0.05 + intensity * 0.9})`,
                      border: "1px solid rgba(34,197,94,0.1)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "#333", fontFamily: "monospace" }}>
          <span>-6W</span><span>NOW</span>
        </div>
      </div>
    </div>
  );
}

// ── NAV ────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "matrix", label: "MATRIX", icon: Grid },
  { id: "weekly", label: "WEEKLY", icon: Calendar },
  { id: "analytics", label: "ANALYTICS", icon: TrendingUp },
];

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function TitanEngine() {
  const [tab, setTab] = useState("matrix");
  const [weekOffset, setWeekOffset] = useState(0);
  const currentWeek = getWeeksSinceBirth();
  const now = new Date();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      color: "#e5e7eb",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "0 0 2rem",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(34,197,94,0.15)",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(5,5,5,0.95)",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <Flame size={18} color="#22c55e" />
        <div>
          <div style={{ fontSize: 14, color: "#22c55e", letterSpacing: 3 }}>TITAN ENGINE v3</div>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 2 }}>LIFE OS · COMMAND CENTER</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <div style={{ fontSize: 11, color: "#555" }}>
            {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 10, color: "#333" }}>
            WK {currentWeek} · YR {Math.floor(currentWeek / 52)} · {isEvenDay(now) ? <span style={{ color: "#3b82f6" }}>⚡ GRIPPER DAY</span> : "REST DAY"}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1, borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(255,255,255,0.02)",
      }}>
        {[
          ["WEEKS LIVED", currentWeek.toLocaleString()],
          ["WEEKS AHEAD", (TOTAL_WEEKS - currentWeek).toLocaleString()],
          ["LIFE %", ((currentWeek / TOTAL_WEEKS) * 100).toFixed(2) + "%"],
          ["TODAY", isEvenDay(now) ? "GRIPPER ⚡" : "REST"],
        ].map(([label, val]) => (
          <div key={label} style={{ padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 1.5, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, color: "#22c55e" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 1.5rem" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: "none", border: "none",
              borderBottom: tab === id ? "1px solid #22c55e" : "1px solid transparent",
              color: tab === id ? "#22c55e" : "#444",
              padding: "10px 16px", cursor: "pointer",
              fontSize: 11, letterSpacing: 1.5, fontFamily: "monospace",
              display: "flex", alignItems: "center", gap: 6,
              transition: "color 0.15s",
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "1rem 1.5rem" }}>
        {tab === "matrix" && <ChronoMatrix currentWeek={currentWeek} />}
        {tab === "weekly" && (
          <WeeklyView
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            currentWeek={currentWeek}
          />
        )}
        {tab === "analytics" && <Analytics currentWeek={currentWeek} />}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "1rem",
        fontSize: 9, color: "#1a1a1a", letterSpacing: 2,
        fontFamily: "monospace",
      }}>
        TITAN ENGINE v3 · API-READY · GEMINI INTEGRATION PENDING
      </div>
    </div>
  );
}
