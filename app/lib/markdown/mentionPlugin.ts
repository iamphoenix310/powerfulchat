import { visit } from 'unist-util-visit'

export function mentionPlugin() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      const mentionRegex = /@(\w+)/g
      const matches = [...node.value.matchAll(mentionRegex)]

      if (matches.length === 0) return

      const children = []
      let lastIndex = 0

      for (const match of matches) {
        const start = match.index!
        const end = start + match[0].length

        // Add preceding text
        if (start > lastIndex) {
          children.push({ type: 'text', value: node.value.slice(lastIndex, start) })
        }

        // Add mention as link
        children.push({
          type: 'link',
          url: `/${match[1]}`,
          children: [{ type: 'text', value: match[0] }],
        })

        lastIndex = end
      }

      if (lastIndex < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...children)
    })
  }
}
