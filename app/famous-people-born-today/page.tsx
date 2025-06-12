import { Metadata } from 'next'
import React from 'react'
import BornToday from '@/components/People/FamousPeople/bornToday'

export const metadata: Metadata = {
    title: 'Famous People Born Today',
    description: 'Discover which prominent people were born today! Explore our daily updated list of celebrities and notable figures sharing your birthday.',

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

const People = () => {
  return (
    <BornToday />
  )
}

export default People
