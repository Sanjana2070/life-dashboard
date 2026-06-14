import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { TRACKERS } from '../lib/trackers'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂', exact: true },
  ...TRACKERS.map(({ to, label, icon }) => ({ to, label, icon, exact: false })),
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 12px' : '20px 16px',
          borderBottom: '1px solid var(--border)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed ? (
          <span style={{ fontSize: 20 }}>✦</span>
        ) : (
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)', letterSpacing: 0.5 }}>
            Life Dashboard
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '9px 16px' : '9px 16px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'color 0.15s, background 0.15s',
            })}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          background: 'none',
          border: 'none',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '12px',
          fontSize: 16,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  )
}
