import { Metadata } from 'next'
import React from 'react'
import Stories from '@/components/Stories/storiesReuseFull'

export const metadata: Metadata = {
  title: 'Best Short Stories Online',
  description: 'Explore best short stories available online. Covering topics of Sci-Fi, Romance, Action and much more. These stories are published with amazing relative graphics. Enjoy reading!',
}


const StoriesMain = () => {
  return (
    <Stories />
  )
}

export default StoriesMain