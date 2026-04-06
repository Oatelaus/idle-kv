import React, { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Game data
// ---------------------------------------------------------------------------

interface Building {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseCost: number;
  baseProduction: number; // gold per second
}

const BUILDINGS: Building[] = [
  {
    id: "farm",
    name: "Farm",
    emoji: "🌾",
    description: "Peasants grow crops and trade them for gold.",
    baseCost: 15,
    baseProduction: 0.1,
  },
  {
    id: "mine",
    name: "Mine",
    emoji: "⛏️",
    description: "Miners dig up raw gold from the earth.",
    baseCost: 100,
    baseProduction: 0.5,
  },
  {
    id: "market",
    name: "Market",
    emoji: "🏪",
    description: "Merchants generate steady commerce income.",
    baseCost: 500,
    baseProduction: 2,
  },
  {
    id: "blacksmith",
    name: "Blacksmith",
    emoji: "🔨",
    description: "Crafted goods sell for a premium.",
    baseCost: 2000,
    baseProduction: 8,
  },
  {
    id: "castle",
    name: "Castle",
    emoji: "🏰",
    description: "A grand castle collects taxes from the entire realm.",
    baseCost: 10000,
    baseProduction: 40,
  },
  {
    id: "dragon",
    name: "Dragon",
    emoji: "🐉",
    description: "A tame dragon guards your vault and attracts tourists.",
    baseCost: 75000,
    baseProduction: 250,
  },
];

// Cost of the nth building scales by 1.15 per owned
function buildingCost(building: Building, owned: number): number {
  return Math.floor(building.baseCost * Math.pow(1.15, owned));
}

// Production per second for a single building type
function buildingProduction(building: Building, owned: number): number {
  return building.baseProduction * owned;
}

// Total production per second across all buildings
function totalProduction(owned: Record<string, number>): number {
  return BUILDINGS.reduce(
    (sum, b) => sum + buildingProduction(b, owned[b.id] ?? 0),
    0
  );
}

function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n).toString();
}

// ---------------------------------------------------------------------------
// Styles (inline, no external CSS dependency)
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px",
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    color: "#ffd700",
    textShadow: "0 0 20px rgba(255,215,0,0.5)",
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  layout: {
    display: "flex",
    gap: 24,
    width: "100%",
    maxWidth: 900,
    alignItems: "flex-start",
  },
  leftPanel: {
    flex: "0 0 280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  statsCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: "20px 24px",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255,215,0,0.2)",
  },
  goldDisplay: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
  },
  rateDisplay: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 4,
  },
  clickBtn: {
    fontSize: 72,
    cursor: "pointer",
    background: "none",
    border: "none",
    lineHeight: 1,
    transition: "transform 0.08s",
    userSelect: "none",
    filter: "drop-shadow(0 0 12px rgba(255,215,0,0.4))",
  },
  buildingCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "border-color 0.2s",
    gap: 12,
  },
  buildingInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  buildingEmoji: {
    fontSize: 28,
    flexShrink: 0,
  },
  buildingName: {
    fontWeight: 600,
    fontSize: 15,
    color: "#fff",
  },
  buildingDesc: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  buildingOwned: {
    fontWeight: 700,
    fontSize: 20,
    color: "#ffd700",
    flexShrink: 0,
    width: 32,
    textAlign: "center",
  },
  buyBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.15s, background 0.15s",
  },
  sectionTitle: {
    color: "#ffd700",
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: 1,
  },
  resetBtn: {
    marginTop: 12,
    padding: "6px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,100,100,0.4)",
    background: "rgba(255,50,50,0.1)",
    color: "#ff8080",
    fontSize: 12,
    cursor: "pointer",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const [gold, setGold] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [owned, setOwned] = useState<Record<string, number>>(() =>
    Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]))
  );
  const [clicking, setClicking] = useState(false);

  const goldRef = useRef(0);
  const totalEarnedRef = useRef(0);
  const ownedRef = useRef(owned);

  // Keep refs in sync
  useEffect(() => {
    goldRef.current = gold;
  }, [gold]);
  useEffect(() => {
    ownedRef.current = owned;
  }, [owned]);

  // Passive income tick (every 100ms = 0.1s)
  useEffect(() => {
    const interval = setInterval(() => {
      const perSecond = totalProduction(ownedRef.current);
      const income = perSecond * 0.1;
      if (income > 0) {
        goldRef.current += income;
        totalEarnedRef.current += income;
        setGold(goldRef.current);
        setTotalEarned(totalEarnedRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleClick = useCallback(() => {
    const gain = 1 + Math.floor(totalProduction(ownedRef.current) * 0.01);
    goldRef.current += gain;
    totalEarnedRef.current += gain;
    setGold(goldRef.current);
    setTotalEarned(totalEarnedRef.current);
    setClicking(true);
    setTimeout(() => setClicking(false), 80);
  }, []);

  const handleBuy = useCallback((building: Building) => {
    const count = ownedRef.current[building.id] ?? 0;
    const cost = buildingCost(building, count);
    if (goldRef.current < cost) return;
    goldRef.current -= cost;
    setGold(goldRef.current);
    setOwned((prev) => {
      const next = { ...prev, [building.id]: (prev[building.id] ?? 0) + 1 };
      ownedRef.current = next;
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset all progress?")) return;
    goldRef.current = 0;
    totalEarnedRef.current = 0;
    setGold(0);
    setTotalEarned(0);
    const fresh = Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
    ownedRef.current = fresh;
    setOwned(fresh);
  }, []);

  const perSecond = totalProduction(owned);
  const clickValue = 1 + Math.floor(perSecond * 0.01);

  return (
    <div style={styles.root}>
      <div style={styles.title}>⚔️ Idle Kingdom</div>
      <div style={styles.subtitle}>Build your realm, amass gold, conquer idleness.</div>

      <div style={styles.layout}>
        {/* Left panel: clicker + stats */}
        <div style={styles.leftPanel}>
          <div style={styles.statsCard}>
            <div style={styles.goldDisplay}>🪙 {formatNumber(gold)}</div>
            <div style={styles.rateDisplay}>
              +{formatNumber(perSecond)}/sec &nbsp;·&nbsp; +{clickValue}/click
            </div>
            <div style={{ ...styles.rateDisplay, marginTop: 8 }}>
              All time: {formatNumber(totalEarned)} gold
            </div>
          </div>

          <button
            style={{
              ...styles.clickBtn,
              transform: clicking ? "scale(0.88)" : "scale(1)",
            }}
            onClick={handleClick}
            title="Click for gold!"
            aria-label="Click to earn gold"
          >
            💰
          </button>
          <div style={{ fontSize: 12, color: "#666" }}>Click the coin!</div>

          <button style={styles.resetBtn} onClick={handleReset}>
            🔄 Reset
          </button>
        </div>

        {/* Right panel: buildings */}
        <div style={styles.rightPanel}>
          <div style={styles.sectionTitle}>🏗️ Buildings</div>
          {BUILDINGS.map((building) => {
            const count = owned[building.id] ?? 0;
            const cost = buildingCost(building, count);
            const canAfford = gold >= cost;
            return (
              <div
                key={building.id}
                style={{
                  ...styles.buildingCard,
                  borderColor: canAfford
                    ? "rgba(255,215,0,0.4)"
                    : "rgba(255,255,255,0.08)",
                  opacity: count === 0 && !canAfford ? 0.5 : 1,
                }}
              >
                <div style={styles.buildingInfo}>
                  <span style={styles.buildingEmoji}>{building.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={styles.buildingName}>{building.name}</div>
                    <div style={styles.buildingDesc}>{building.description}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                      {count > 0 ? `${formatNumber(building.baseProduction * count)}/sec total` : `${building.baseProduction}/sec each`}
                      &nbsp;·&nbsp; costs {formatNumber(cost)} 🪙
                    </div>
                  </div>
                </div>
                <div style={styles.buildingOwned}>{count}</div>
                <button
                  style={{
                    ...styles.buyBtn,
                    background: canAfford
                      ? "linear-gradient(135deg, #ffd700, #ff8c00)"
                      : "rgba(255,255,255,0.07)",
                    color: canAfford ? "#1a1a1a" : "#555",
                    cursor: canAfford ? "pointer" : "not-allowed",
                  }}
                  onClick={() => handleBuy(building)}
                  disabled={!canAfford}
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}