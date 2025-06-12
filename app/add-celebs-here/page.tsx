import { Metadata } from 'next'
import React from 'react'
import { AddCelebritiesPage } from '@/pages/admin/add-celebs'

export const metadata: Metadata = {
    title: 'Add Celebrities Here',
    description: 'Explore beautiful photos with daily updates from portraits to gorgeous girls and shoots.',

    openGraph: {
      images: [
      {
          url: 'https://cdn.sanity.io/images/qwvo1z5j/production/b75f577a5d154e9b2d673928fcebbe1fbff004ce-1080x1350.png',
          width: 550,
          height: 650,
          type: 'image/png | image/jpg | image/jpeg',
      },
      ],
      
  },
  }

const ImagesMain = () => {
  return (
    <AddCelebritiesPage />
  )
}

export default ImagesMain