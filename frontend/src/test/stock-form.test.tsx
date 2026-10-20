import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StockActionForm } from '../components/inventory/StockActionForm'
import { renderApp } from './helpers'
import { inventoryApi } from '../api/endpoints/inventory.api'
import { locationsApi } from '../api/endpoints/locations.api'
import { productsApi } from '../api/endpoints/products.api'
import type { Product } from '../types'

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../api/endpoints/inventory.api')
vi.mock('../api/endpoints/locations.api')
vi.mock('../api/endpoints/products.api')

const product = { id: 'p1', sku: 'ORM-PB-10K', name: 'Oraimo Power Bank 10K', reorderLevel: 5, status: 'ACTIVE', availableQuantity: 5 } as Product
const page = <T,>(items: T[]) => ({ items, total: items.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrevious: false })

async function fillCommon(user: ReturnType<typeof userEvent.setup>, quantity: string) {
  await user.click(screen.getByPlaceholderText(/Search product/))
  await user.click(await screen.findByRole('option', { name: /Oraimo Power Bank/ }))
  await user.selectOptions(screen.getByLabelText(/Location/), 'l1')
  await user.type(screen.getByLabelText(/Quantity/), quantity)
  await user.type(screen.getByLabelText(/Reason/), 'Sale')
}

describe('StockActionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(locationsApi.getAll).mockResolvedValue([{ id: 'l1', name: 'Main Store' }, { id: 'l2', name: 'Back Store' }] as never)
    vi.mocked(productsApi.getAll).mockResolvedValue(page([product]) as never)
    vi.mocked(inventoryApi.getAll).mockResolvedValue(page([{ id: 'b1', productId: 'p1', locationId: 'l1', quantity: 5, reservedQuantity: 0, availableQuantity: 5 }]) as never)
    vi.mocked(inventoryApi.stockIn).mockResolvedValue({ message: 'ok' } as never)
    vi.mocked(inventoryApi.stockOut).mockResolvedValue({ message: 'ok' } as never)
  })

  it('records outgoing stock with the right payload', async () => {
    const user = userEvent.setup()
    renderApp(<StockActionForm mode="out" />)
    await fillCommon(user, '3')
    await screen.findByText(/after this/)
    await user.click(screen.getByRole('button', { name: /Record outgoing stock/ }))

    await waitFor(() => expect(inventoryApi.stockOut).toHaveBeenCalledTimes(1))
    expect(inventoryApi.stockOut).toHaveBeenCalledWith({ productId: 'p1', locationId: 'l1', quantity: 3, reason: 'Sale', reference: undefined })
  })

  it('refuses to send more stock out than is available', async () => {
    const user = userEvent.setup()
    renderApp(<StockActionForm mode="out" />)
    await fillCommon(user, '9')

    expect(await screen.findAllByText(/Only 5 available/)).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: /Record outgoing stock/ })).toBeDisabled()
    expect(inventoryApi.stockOut).not.toHaveBeenCalled()
  })

  it('requires a product, a reason and a whole quantity of at least 1', async () => {
    const user = userEvent.setup()
    renderApp(<StockActionForm mode="in" />)
    await user.click(screen.getByRole('button', { name: /Record incoming stock/ }))

    expect(await screen.findByText('Choose a product')).toBeInTheDocument()
    expect(screen.getByText('Choose a location')).toBeInTheDocument()
    expect(screen.getByText(/Give a short reason/)).toBeInTheDocument()
    expect(inventoryApi.stockIn).not.toHaveBeenCalled()
  })

  it('records incoming stock without the stock ceiling', async () => {
    const user = userEvent.setup()
    renderApp(<StockActionForm mode="in" />)
    await fillCommon(user, '50')
    await user.click(screen.getByRole('button', { name: /Record incoming stock/ }))

    await waitFor(() => expect(inventoryApi.stockIn).toHaveBeenCalledWith(expect.objectContaining({ quantity: 50, productId: 'p1' })))
  })
})
