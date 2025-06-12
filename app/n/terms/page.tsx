import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { termsContent } from '@/components/terms'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Review the legal terms and usage policy for Powerful.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6 text-black">📜 Terms and Conditions</h1>

      <article className="prose prose-invert max-w-none text-sm leading-relaxed">
        <ReactMarkdown
          skipHtml={false}
          components={{
            br: () => <br />,
            p: ({ children }) => <p className="mb-4">{children}</p>,
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-10 mb-3">{children}</h3>
            ),
            hr: () => <hr className="my-8 border-gray-700" />,
          }}
        >
          {termsContent}
        </ReactMarkdown>
      </article>
    </div>
  )
}
