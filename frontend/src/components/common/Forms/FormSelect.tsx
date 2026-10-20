import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Option[]
  placeholder?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, options, placeholder, className, id, required, ...props }, ref) => {
    const auto = useId()
    const selectId = id ?? auto
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          className={clsx('input appearance-none bg-no-repeat pr-9', error && 'input-error', className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
            backgroundPosition: 'right 0.85rem center',
          }}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {error ? <p className="field-error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
      </div>
    )
  },
)
FormSelect.displayName = 'FormSelect'
