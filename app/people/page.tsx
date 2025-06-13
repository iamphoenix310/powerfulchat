import PeoplePage from '@/components/People/mainPeople'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'People',
  description: 'See information about prominent people from around the world.',
  openGraph: {
    images: [
      {
        url: 'https://cdn.sanity.io/images/qwvo1z5j/production/b75f577a5d154e9b2d673928fcebbe1fbff004ce-1080x1350.png',
        width: 550,
        height: 650,
        type: 'image/png',
      },
    ],
  },
}

export default function People() {
  return (
    <Suspense fallback={<div>Loading People...</div>}>
      <PeoplePage />
    </Suspense>
  )
}
