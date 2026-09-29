import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';

export function VisualDebtGraph({
  members = [],
  debts = [],
  memberStats = {},
  baseCurrency = 'USD',
  onSelectDebt,
  currentUserId,
}) {
  const [hoveredDebtId, setHoveredDebtId] = useState(null);
  const [hoveredMemberId, setHoveredMemberId] = useState(null);

  // SVG Dimensions & Center
  const width = 680;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 135;

  // Calculate circular coordinates for each member node
  const nodePositions = useMemo(() => {
    const count = members.length || 1;
    const positions = {};
    members.forEach((m, idx) => {
      // Angle starting from top (-PI / 2)
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions[m.id] = { x, y, angle, member: m };
    });
    return positions;
  }, [members, centerX, centerY, radius]);

  if (members.length === 0) return null;

  return (
    <div
      className="glass-card animate-fade"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Title & Instructions */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Interactive Debt Network Graph</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Flow vectors represent money moving from debtors to creditors. Click any flow to settle up.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--positive)' }} />
          <span>Creditor (+)</span>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--negative)' }} />
          <span>Debtor (-)</span>
        </div>
      </div>

      {debts.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={40} color="var(--positive)" style={{ margin: '0 auto 10px auto' }} />
          <h5 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Zero Net Debt in Graph</h5>
          <p style={{ fontSize: '0.85rem' }}>All transactions have balanced out!</p>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '680px', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          >
            <defs>
              {/* Arrow Head Marker for Debt Flow */}
              <marker
                id="debt-arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>

              <marker
                id="debt-arrow-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Connecting Flow Lines (Bezier curves with animated flow) */}
            {debts.map((debt) => {
              const fromPos = nodePositions[debt.fromMemberId];
              const toPos = nodePositions[debt.toMemberId];
              if (!fromPos || !toPos) return null;

              const isHovered = hoveredDebtId === debt.id;
              const isMemberConnected =
                hoveredMemberId && (hoveredMemberId === debt.fromMemberId || hoveredMemberId === debt.toMemberId);
              const involvesCurrentUser =
                debt.fromMemberId === currentUserId || debt.toMemberId === currentUserId;

              // Quadratic Bezier curvature bending toward center slightly
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;
              const ctrlX = midX + (centerX - midX) * 0.25;
              const ctrlY = midY + (centerY - midY) * 0.25;

              const pathD = `M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`;

              return (
                <g
                  key={debt.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredDebtId(debt.id)}
                  onMouseLeave={() => setHoveredDebtId(null)}
                  onClick={() => onSelectDebt(debt)}
                >
                  {/* Invisible hit-testing wider path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* Base Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isHovered || isMemberConnected
                        ? '#6366f1'
                        : involvesCurrentUser
                        ? 'rgba(99, 102, 241, 0.6)'
                        : 'rgba(255, 255, 255, 0.18)'
                    }
                    strokeWidth={isHovered ? '4' : '2.5'}
                    markerEnd={isHovered ? 'url(#debt-arrow-active)' : 'url(#debt-arrow)'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />

                  {/* Animated flowing dash line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#818cf8' : '#10b981'}
                    strokeWidth={isHovered ? '4' : '2'}
                    strokeDasharray="8 6"
                    className="debt-flow-animation"
                    opacity={isHovered ? 1 : 0.8}
                  />

                  {/* Amount Pill centered on curve */}
                  <g transform={`translate(${ctrlX}, ${ctrlY})`}>
                    <rect
                      x="-38"
                      y="-13"
                      width="76"
                      height="26"
                      rx="13"
                      fill={isHovered ? '#1e1b4b' : 'var(--bg-card-solid)'}
                      stroke={isHovered ? '#6366f1' : 'var(--border-subtle)'}
                      strokeWidth={isHovered ? 2 : 1}
                      filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.5))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isHovered ? '#ffffff' : '#10b981'}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-display)"
                    >
                      {formatCurrency(debt.amount, baseCurrency)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Member Nodes */}
            {members.map((m) => {
              const pos = nodePositions[m.id];
              if (!pos) return null;

              const stats = memberStats[m.id] || { netBalance: 0 };
              const isPositive = stats.netBalance > 0.005;
              const isNegative = stats.netBalance < -0.005;
              const isMe = m.id === currentUserId;
              const isHovered = hoveredMemberId === m.id;

              return (
                <g
                  key={m.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredMemberId(m.id)}
                  onMouseLeave={() => setHoveredMemberId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer glow ring for current user or hovered */}
                  <circle
                    r={isMe ? 30 : 26}
                    fill="var(--bg-card-solid)"
                    stroke={
                      isMe
                        ? '#6366f1'
                        : isHovered
                        ? '#ffffff'
                        : isPositive
                        ? 'var(--positive-border)'
                        : isNegative
                        ? 'var(--negative-border)'
                        : 'var(--border-subtle)'
                    }
                    strokeWidth={isMe || isHovered ? 3 : 1.5}
                    filter="drop-shadow(0 4px 10px rgba(0,0,0,0.4))"
                  />

                  {/* Inner color badge */}
                  <circle
                    r={isMe ? 24 : 20}
                    fill={m.color || '#3b82f6'}
                    opacity={0.9}
                  />

                  {/* Member initials or emoji */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isMe ? '13' : '11'}
                    fontWeight="800"
                  >
                    {m.avatar || m.name.slice(0, 2).toUpperCase()}
                  </text>

                  {/* Member Name Tag */}
                  <text
                    x="0"
                    y={pos.y > centerY ? 44 : -34}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="11"
                    fontWeight={isMe ? '700' : '600'}
                  >
                    {m.name.split(' ')[0]} {isMe ? '(You)' : ''}
                  </text>

                  {/* Net Balance Pill */}
                  <text
                    x="0"
                    y={pos.y > centerY ? 57 : -21}
                    textAnchor="middle"
                    fill={isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-muted)'}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {isPositive ? `+${formatCurrency(stats.netBalance, baseCurrency)}` : formatCurrency(stats.netBalance, baseCurrency)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Footer Hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <Info size={14} color="var(--primary)" />
        <span>Click on any amount pill or arrow line to record a settlement directly.</span>
      </div>
    </div>
  );
}
