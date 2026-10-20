import type { ComponentProps } from 'react'
import { StockActionForm } from './StockActionForm'

/** Kept for backwards compatibility: all stock forms now share one implementation. */
export function StockOutForm(props: Omit<ComponentProps<typeof StockActionForm>, 'mode'>) {
  return <StockActionForm mode="out" {...props} />
}
