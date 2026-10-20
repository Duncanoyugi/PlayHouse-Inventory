import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  suffix?: ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, suffix, className, id, required, ...props }, ref) => {
    const auto = useId()
    const inputId = id ?? auto
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${inputId}-err` : undefined}
            className={clsx('input', error && 'input-error', suffix && 'pr-12', className)}
            {...props}
          />
          {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">{suffix}</span>}
        </div>
        {error ? <p id={`${inputId}-err`} className="field-error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
      </div>
    )
  },
)
FormInput.displayName = 'FormInput'
