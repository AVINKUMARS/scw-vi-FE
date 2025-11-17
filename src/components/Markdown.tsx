import React from 'react'

// Very small markdown renderer supporting:
// - Headings: #, ##, ###
// - Lists: -, * (unordered) and 1. 2. (ordered)
// - Paragraphs and line breaks
// - Inline: **bold**, *italic*, `code`
// This avoids adding a dependency and keeps output safe via JSX (no raw HTML).

type Node = { type: 'h1'|'h2'|'h3'|'ul'|'ol'|'p'; content?: string; items?: string[] }

function inlineParts(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let s = text
  // Handle backticks first
  const codeSplit = s.split(/(`[^`]*`)/g)
  for (const part of codeSplit) {
    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(<code key={nodes.length} style={{ background: 'var(--panel)', padding: '0 4px', borderRadius: 4 }}>{part.slice(1, -1)}</code>)
      continue
    }
    // Now handle **bold** and *italic*
    const boldItalicSplit = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    for (const seg of boldItalicSplit) {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        nodes.push(<strong key={nodes.length}>{seg.slice(2, -2)}</strong>)
      } else if (seg.startsWith('*') && seg.endsWith('*')) {
        nodes.push(<em key={nodes.length}>{seg.slice(1, -1)}</em>)
      } else if (seg) {
        nodes.push(<React.Fragment key={nodes.length}>{seg}</React.Fragment>)
      }
    }
  }
  return nodes
}

function parseBlocks(text: string): Node[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const out: Node[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Skip empty lines as paragraph separators
    if (!line.trim()) { i++; continue }
    // Headings
    if (line.startsWith('### ')) { out.push({ type: 'h3', content: line.slice(4) }); i++; continue }
    if (line.startsWith('## '))  { out.push({ type: 'h2', content: line.slice(3) }); i++; continue }
    if (line.startsWith('# '))   { out.push({ type: 'h1', content: line.slice(2) }); i++; continue }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      out.push({ type: 'ol', items })
      continue
    }
    // Unordered list
    if (/^(?:-|\*)\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^(?:-|\*)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^(?:-|\*)\s+/, ''))
        i++
      }
      out.push({ type: 'ul', items })
      continue
    }
    // Paragraph: gather consecutive non-empty, non-list, non-heading lines
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^(?:-|\*)\s+/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push({ type: 'p', content: buf.join('\n') })
  }
  return out
}

export default function Markdown({ children }: { children: string }) {
  const blocks = parseBlocks(children || '')
  return (
    <div className="markdown-lite" style={{ lineHeight: 1.6 }}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case 'h1': return <h1 key={idx} className="text-2xl font-bold mb-1">{inlineParts(b.content || '')}</h1>
          case 'h2': return <h2 key={idx} className="text-xl font-semibold mb-1">{inlineParts(b.content || '')}</h2>
          case 'h3': return <h3 key={idx} className="text-lg font-semibold mb-1">{inlineParts(b.content || '')}</h3>
          case 'ul': return (
            <ul key={idx} className="list-disc ml-6 mb-1">
              {(b.items || []).map((it, i2) => <li key={i2}>{inlineParts(it)}</li>)}
            </ul>
          )
          case 'ol': return (
            <ol key={idx} className="list-decimal ml-6 mb-1">
              {(b.items || []).map((it, i2) => <li key={i2}>{inlineParts(it)}</li>)}
            </ol>
          )
          default: return <p key={idx} className="whitespace-pre-wrap mb-1">{inlineParts(b.content || '')}</p>
        }
      })}
    </div>
  )
}

