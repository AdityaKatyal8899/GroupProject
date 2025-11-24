import React from 'react'

export default function LoadingButton({ text, onClick, loading = false, className = '', type = 'button', disabled = false }) {
  const isDisabled = !!loading || !!disabled
  return (
    <button
      type={type}
      onClick={(e) => {
        if (isDisabled) return
        if (onClick) onClick(e)
      }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full primary-button transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20 ${
        isDisabled ? 'opacity-80 pointer-events-none' : ''
      } ${className}`}
      style={{
        // Respect theme tokens
        // Colors come from primary-button class which uses theme variables
        // Keep sizing consistent
        minWidth: 110,
      }}
    >
      {loading ? (
        <span className="loading-dots" aria-label="loading" />
      ) : (
        <span>{text}</span>
      )}
      {/* Minimal in-button loader */}
      <style>{`
        @keyframes lbounce { 0%, 80%, 100% { transform: scale(0); opacity: .5 } 40% { transform: scale(1); opacity: 1 } }
        .loading-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 1em;
        }
        .loading-dots::before, .loading-dots::after, .loading-dots span { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: currentColor; }
        .loading-dots::before { animation: lbounce 1.4s infinite ease-in-out both; }
        .loading-dots span { animation: lbounce 1.4s infinite ease-in-out both; animation-delay: .16s; }
        .loading-dots::after { animation: lbounce 1.4s infinite ease-in-out both; animation-delay: .32s; }
      `}</style>
      {/* middle dot element */}
      {loading ? <span style={{ display: 'none' }} /> : null}
    </button>
  )
}
