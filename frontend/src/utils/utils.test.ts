import { describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import { getErrorMessage } from './error-utils'
import { compactObject, formatMoney, initials, titleCase } from './format-utils'
import { movementDelta } from './movement-utils'
import type { StockMovement } from '../types'

describe('error messages', () => {
  it('uses the API message, including the first of several validation messages', () => {
    const err = new AxiosError('x', '400', undefined, undefined, { status: 400, data: { message: ['Quantity must be at least 1', 'other'] } } as never)
    expect(getErrorMessage(err)).toBe('Quantity must be at least 1')
  })
  it('explains network failures in plain language', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toMatch(/Cannot reach the server/)
  })
  it('never leaks raw server errors for 5xx', () => {
    const err = new AxiosError('x', '500', undefined, undefined, { status: 500, data: {} } as never)
    expect(getErrorMessage(err)).toMatch(/server ran into a problem/)
  })
})

describe('formatting helpers', () => {
  it('formats Kenyan shillings', () => expect(formatMoney('1250.5')).toMatch(/1,250\.50/))
  it('title-cases enum values', () => expect(titleCase('PARTIALLY_RECEIVED')).toBe('Partially Received'))
  it('builds initials', () => expect(initials('Jane Wanjiku Kamau')).toBe('JW'))
  it('drops empty optional fields', () => expect(compactObject({ a: 'x', b: '', c: undefined, d: 0 })).toEqual({ a: 'x', d: 0 }))
})

describe('movement delta', () => {
  const m = (type: StockMovement['type'], quantity: number, previousQuantity: number, newQuantity: number) =>
    ({ type, quantity, previousQuantity, newQuantity }) as StockMovement
  it('signs outgoing movements negative', () => {
    expect(movementDelta(m('STOCK_OUT', 4, 10, 6))).toBe(-4)
    expect(movementDelta(m('DAMAGE', 1, 6, 5))).toBe(-1)
    expect(movementDelta(m('STOCK_IN', 5, 0, 5))).toBe(5)
  })
  it('uses the real difference for adjustments', () => {
    expect(movementDelta(m('ADJUSTMENT', 3, 10, 7))).toBe(-3)
    expect(movementDelta(m('ADJUSTMENT', 3, 10, 13))).toBe(3)
  })
})
