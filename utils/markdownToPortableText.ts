import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { Node } from 'unist'
import { nanoid } from 'nanoid'

export type PortableTextBlock = {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3'
  markDefs: any[]
  children: Array<{
    _type: 'span'
    _key: string
    marks: string[]
    text: string
  }>
}

export async function markdownToPortableText(markdown: string): Promise<PortableTextBlock[]> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const blocks: PortableTextBlock[] = []

  for (const node of (tree as any).children) {
    const block = parseBlock(node)
    if (block) blocks.push(block)
  }

  return blocks
}

function parseBlock(node: any): PortableTextBlock | null {
  if (node.type !== 'paragraph' && node.type !== 'heading') return null

  const children: PortableTextBlock['children'] = []
  const markDefs: PortableTextBlock['markDefs'] = []

  let style: PortableTextBlock['style'] = 'normal'
  if (node.type === 'heading') {
    if (node.depth === 2) style = 'h2'
    else if (node.depth === 3) style = 'h3'
    else style = 'normal' // fallback
  }

  for (const child of node.children || []) {
    if (child.type === 'text') {
      children.push({
        _type: 'span',
        _key: nanoid(),
        text: child.value,
        marks: [],
      })
    }

    if (child.type === 'strong') {
      for (const gchild of child.children) {
        children.push({
          _type: 'span',
          _key: nanoid(),
          text: gchild.value,
          marks: ['strong'],
        })
      }
    }

    if (child.type === 'emphasis') {
      for (const gchild of child.children) {
        children.push({
          _type: 'span',
          _key: nanoid(),
          text: gchild.value,
          marks: ['em'],
        })
      }
    }

    if (child.type === 'inlineCode') {
      children.push({
        _type: 'span',
        _key: nanoid(),
        text: child.value,
        marks: ['code'],
      })
    }

    if (child.type === 'link') {
      const markKey = nanoid()
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href: child.url,
      })

      for (const gchild of child.children) {
        children.push({
          _type: 'span',
          _key: nanoid(),
          text: gchild.value,
          marks: [markKey],
        })
      }
    }
  }

  if (!children.length) return null

  return {
    _type: 'block',
    _key: nanoid(),
    style,
    markDefs,
    children,
  }
}
