'use client'

const filters = ['ALL', 'APPROVED', 'DENIED', 'RISK'] as const
export type Filter = typeof filters[number]

/** Ledger filter chips. Full keyboard operability with aria-pressed. */
export function FilterChips({ value, onChange }: { value: Filter; onChange: (filter: Filter) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Ledger filters">
      {filters.map((filter) => (
        <button key={filter} type="button" aria-pressed={value === filter} onClick={() => onChange(filter)}
          className={`shrink-0 font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 border rounded-sm transition-colors duration-[120ms] ${value === filter ? 'border-phosphor text-phosphor' : 'border-[var(--border-default)] text-text-secondary hover:text-phosphor'}`}>
          {filter}
        </button>
      ))}
    </div>
  )
}
