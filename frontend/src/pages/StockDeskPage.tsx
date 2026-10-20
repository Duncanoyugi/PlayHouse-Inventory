import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { PageHeader } from '../components/common/PageHeader'
import { Tabs } from '../components/common/Tabs/Tabs'
import { StockActionForm } from '../components/inventory/StockActionForm'
import { MovementTable } from '../components/stock-movements/MovementTable'
import { stockMovementsApi } from '../api/endpoints/stock-movements.api'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

type Tab = 'in' | 'out'

/** The store keeper's workbench: record what comes in and what goes out. */
export default function StockDeskPage() {
  usePageTitle('Stock In / Out')
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('in')

  const recent = useQuery({
    queryKey: ['stock-movements', 'mine', user?.id],
    queryFn: () => stockMovementsApi.getAll({ userId: user!.id, limit: 8 }),
    enabled: !!user,
  })

  return (
    <>
      <PageHeader eyebrow="Store" title="Stock In / Out" description="Record every item that arrives in the shop and every item that leaves it." />

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card card-pad xl:col-span-2">
          <Tabs
            tabs={[
              { id: 'in', label: 'Incoming', icon: <ArrowDownToLine className="h-4 w-4" /> },
              { id: 'out', label: 'Outgoing', icon: <ArrowUpFromLine className="h-4 w-4" /> },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="mt-5">
            {/* key forces a clean form when switching between in and out */}
            <StockActionForm key={tab} mode={tab} />
          </div>
        </section>

        <section className="card overflow-hidden xl:col-span-3">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-fg">My recent entries</h2>
            <p className="text-sm text-muted">The last things you recorded. Mistakes? Tell the manager - corrections are made from their account.</p>
          </div>
          <MovementTable rows={recent.data?.items ?? []} isLoading={recent.isLoading} isError={recent.isError} onRetry={() => void recent.refetch()} compact />
        </section>
      </div>
    </>
  )
}
