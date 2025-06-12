// components/Tools/ResumeGenerator/Resumes/BlueResumePdfDocument.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";
import type { ResumeData } from "./BlueResumeLayout";

// Use a modern neutral gray for sidebar, blue for section headers
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  sidebar: {
    backgroundColor: "#27272A", // Tailwind zinc-800 (gray)
    color: "#fff",
    width: "32%",
    padding: 24,
    flexDirection: "column",
    gap: 20,
    minHeight: "100%",
  },
  main: {
    width: "68%",
    padding: 32,
    flexDirection: "column",
    gap: 16,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#fff"
  },
  title: {
    textTransform: "uppercase",
    fontSize: 11,
    color: "#D1D5DB", // Tailwind gray-300
    marginTop: 3,
    fontWeight: 600
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#71717A", // Tailwind zinc-500 for accent headers
    fontWeight: 700,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 3,
  },
  contactText: {
    fontSize: 10,
    marginBottom: 2,
    color: "#D1D5DB", // lighter gray for contact
  },
});

export default function BlueResumePdfDocument({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
          <View>
            {data.contact.email && <Text style={styles.contactText}>Email: {data.contact.email}</Text>}
            {data.contact.phone && <Text style={styles.contactText}>Phone: {data.contact.phone}</Text>}
            {data.contact.address && <Text style={styles.contactText}>Address: {data.contact.address}</Text>}
            {data.contact.website && <Text style={styles.contactText}>Website: {data.contact.website}</Text>}
          </View>
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {data.skills.map((skill, i) => (
              <Text style={styles.listItem} key={i}>• {skill}</Text>
            ))}
          </View>
          <View>
            <Text style={styles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, i) => (
              <Text style={styles.listItem} key={i}>• {lang}</Text>
            ))}
          </View>
        </View>
        {/* Main Content */}
        <View style={styles.main}>
          {/* Profile */}
          <View>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text>{data.profile}</Text>
          </View>
          {/* Experience */}
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience.map((job, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 700, color: "#18181B" }}>{job.title}, {job.company}</Text>
                <Text style={{ fontSize: 10, color: "#71717A", marginBottom: 2 }}>
                  {job.start} - {job.end}
                </Text>
                <View>
                  {job.details.map((d, j) => (
                    <Text key={j} style={styles.listItem}>• {d}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
          {/* Education */}
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 700, color: "#18181B" }}>{edu.degree}, {edu.institution}</Text>
                <Text style={{ fontSize: 10, color: "#71717A" }}>
                  {edu.start} - {edu.end} {edu.gpa && `(GPA: ${edu.gpa})`}
                </Text>
              </View>
            ))}
          </View>
          {/* References */}
          {data.references && data.references.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Reference</Text>
              {data.references.map((ref, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={{ fontWeight: 700, color: "#18181B" }}>{ref.name}, {ref.company}</Text>
                  {ref.phone && <Text style={styles.contactText}>Phone: {ref.phone}</Text>}
                  {ref.email && <Text style={styles.contactText}>Email: {ref.email}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
