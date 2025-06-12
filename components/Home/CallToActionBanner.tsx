export default function CallToActionBanner() {
    return (
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-center text-white px-4">
        <h2 className="text-3xl font-bold mb-2">Start Creating or Exploring Now</h2>
        <p className="mb-6 text-white/90">Join a vibrant community of creators and art lovers.</p>
        <a href="/auth?mode=signup" className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
          Get Started Free
        </a>
      </section>
    )
  }
  