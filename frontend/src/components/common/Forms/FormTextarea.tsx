import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, className, id, required, rows = 3, ...props }, ref) => {
    const auto = useId()
    const areaId = id ?? auto
    return (
      <div>
        {label && (
          <label htmlFor={areaId} className="label">
            {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <textarea ref={ref} id={areaId} rows={rows} aria-invalid={!!error || undefined} className={clsx('input resize-y', error && 'input-error', className)} {...props} />
        {error ? <p className="field-error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
      </div>
    )
  },
)
FormTextarea.displayName = 'FormTextarea'
