import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, TriangleAlert } from 'lucide-react'

export type StockMode = 'in' | 'out' | 'adjust' | 'damage'

export const MODE_META: Record<StockMode, { title: string; verb: string; tone: 'success' | 'primary' | 'warning' | 'danger'; icon: typeof ArrowDownToLine; presets: string[]; help: string }> = {
  in: { title: 'Incoming stock', verb: 'Record incoming stock', tone: 'success', icon: ArrowDownToLine, help: 'Goods arriving in the shop: deliveries, returns, transfers in.', presets: ['Supplier delivery', 'Customer return', 'Transfer in', 'Opening stock'] },
  out: { title: 'Outgoing stock', verb: 'Record outgoing stock', tone: 'primary', icon: ArrowUpFromLine, help: 'Goods leaving the shop: sales, transfers, internal use.', presets: ['Sale', 'Transfer out', 'Internal use', 'Sample / demo'] },
  adjust: { title: 'Stock correction', verb: 'Apply correction', tone: 'warning', icon: ClipboardCheck, help: 'Fix the recorded quantity after a physical count. Manager only.', presets: ['Stock count correction', 'Found stock', 'Data entry error'] },
  damage: { title: 'Damaged stock', verb: 'Write off damaged stock', tone: 'danger', icon: TriangleAlert, help: 'Remove stock that is broken or unsellable. Manager only.', presets: ['Damaged in store', 'Damaged in transit', 'Defective / faulty'] },
}
