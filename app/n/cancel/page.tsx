// app/cancellation-policy/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Powerful",
  description:
    "Understand how cancellations and refunds work for your digital purchases on Powerful.",
};

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 py-12 sm:px-6 lg:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-6">
          <p className="font-semibold">Important Notice:</p>
          <p>
            All order cancellations must be requested within <strong>24 hours</strong> of purchase. If the image has already been downloaded, cancellations are not allowed due to the digital nature of the product.
          </p>
        </div>

        <p className="mb-4 text-gray-700">
          At <strong>Powerful</strong>, we offer digital services that include image uploads,
          analytics dashboards, and access to creator tools. Please review our policy below before
          purchasing any plan or credits.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Cancellations</h2>
        <p className="text-gray-700 mb-4">
          Users may cancel their subscription or downgrade their plan at any time from their account
          dashboard. Cancellation will take effect at the end of the current billing cycle. No partial
          refunds will be issued for unused time during a billing period.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. Refund Policy</h2>
        <p className="text-gray-700 mb-4">
          Due to the digital nature of our services, all purchases are considered final and
          non-refundable. This includes purchases of image upload credits, subscriptions, or any digital goods
          provided via the platform.
        </p>

        <p className="text-gray-700 mb-4">
          However, in the rare event of accidental double billing or a technical error, please contact
          us within 7 days of the transaction. We will investigate and provide refunds only in cases
          that meet our eligibility criteria.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Unused Credits</h2>
        <p className="text-gray-700 mb-4">
          If a user cancels their subscription, any unused upload credits will remain available until the end
          of the billing cycle. After the cycle ends, unused credits will expire and cannot be refunded or
          carried forward.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          For any questions regarding this policy or specific refund concerns, please contact our
          support team at{" "}
          <a
            href="mailto:support@powerfulapp.in"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            contact@visitpowerful.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
