import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ResumeFormFields } from './ResumeGenerator'
import { parseResumeSections } from '@/utils/parseResumeSections'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  section: { marginBottom: 12 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#003366' },
  subHeader: { fontSize: 14, fontWeight: 600, marginBottom: 4, marginTop: 12, color: '#222' },
  text: { marginBottom: 2 },
})

interface ResumePdfDocumentProps {
  data: ResumeFormFields
  content: string
  template?: string
}

export function ResumePdfDocument({ data, content, template }: ResumePdfDocumentProps) {
  const sections = parseResumeSections(content)
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{data.name}</Text>
          <Text style={styles.text}>{data.email}</Text>
        </View>
        {sections.map(sec => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.subHeader}>{sec.title}</Text>
            {sec.content.map((line, idx) => (
              <Text style={styles.text} key={idx}>{line}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}
