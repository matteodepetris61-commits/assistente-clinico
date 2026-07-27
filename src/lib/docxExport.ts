import type { StoredThought } from './drive'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })
}

export async function exportThoughtsToWord(
  title: string,
  thoughts: StoredThought[],
): Promise<void> {
  // Import dinamico: la libreria "docx" è pesante e va caricata solo quando serve davvero esportare.
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx')
  const sorted = [...thoughts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({ text: '' }),
  ]

  for (const thought of sorted) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatDate(thought.createdAt), italics: true, color: '888888' })],
        spacing: { before: 240, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: thought.text })],
        spacing: { after: 200 },
      }),
    )
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = title.replace(/[^\p{L}\p{N}\- ]/gu, '').trim() || 'documento'
  a.download = `${safeName}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
