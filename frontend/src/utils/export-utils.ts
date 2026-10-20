/** Client-side CSV download (Excel friendly: UTF-8 BOM, quoted cells, formula-injection safe). */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? '' : String(v)
    // Neutralise spreadsheet formulas coming from user-entered text.
    if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`
    return `"${s.replace(/"/g, '""')}"`
  }
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
