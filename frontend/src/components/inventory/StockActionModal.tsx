import { Modal } from '../common/Modal/Modal'
import { StockActionForm } from './StockActionForm'
import { MODE_META, type StockMode } from './stock-modes'
import type { Product } from '../../types'

export function StockActionModal({ mode, product, locationId, onClose }: { mode: StockMode | null; product: Product | null; locationId?: string; onClose: () => void }) {
  return (
    <Modal isOpen={!!mode} onClose={onClose} size="lg" title={mode ? MODE_META[mode].title : ''} description={product?.name}>
      {mode && <StockActionForm mode={mode} defaultProduct={product} defaultLocationId={locationId} lockProduct={!!product} onDone={onClose} onCancel={onClose} />}
    </Modal>
  )
}
