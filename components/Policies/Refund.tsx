'use client'

import React from 'react'

const RefundPolicy = () => {
  return (
    <section className="min-h-screen bg-white text-gray-800 px-4 py-12 sm:px-6 lg:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>

        <p className="mb-4 text-gray-700">
          At <strong>Powerful</strong>, we are committed to ensuring a fair and transparent experience for all users.
          Please read our refund guidelines carefully before making any purchases on our platform.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Eligibility for Refunds</h2>
        <p className="text-gray-700 mb-4">
          Refunds are only applicable under the following conditions:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
          <li>Duplicate or accidental payments</li>
          <li>Technical errors leading to failed or undelivered services</li>
          <li>Unauthorized or fraudulent transactions reported within 7 days</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. Refund Timeline</h2>
        <p className="text-gray-700 mb-4">
          Once a refund request is approved, the refund process will be initiated immediately. The
          refunded amount will be credited back to your original payment method within <strong>3 to 4 working days</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Non-Refundable Items</h2>
        <p className="text-gray-700 mb-4">
          The following are non-refundable:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
          <li>Used image generation credits or downloads</li>
          <li>Premium digital files (PDFs, ZIPs) already accessed</li>
          <li>Subscription time already consumed</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. How to Request a Refund</h2>
        <p className="text-gray-700 mb-4">
          To request a refund, email us at{' '}
          <a
            href="mailto:contact@visitpowerful.com"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            contact@visitpowerful.com
          </a>{' '}
          with your transaction ID and a brief description of the issue. Our team will get back to you within 24 hours.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Contact</h2>
        <p className="text-gray-700 mb-4">
          For any additional questions regarding refunds or policies, please feel free to reach out to us via email.
        </p>
      </div>
    </section>
  )
}

export default RefundPolicy
