import BgRemover from "@/components/Tools/BgRemover/BgRemover"
import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <BgRemover />

      <div className="max-w-4xl mx-auto mt-16 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Free Online Background Remover Tool
        </h2>

        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed">
              Need to remove the background from a photo? Our 100% free and AI-powered background remover lets you
              remove backgrounds from any image instantly, with no watermark or software needed. Upload your image and
              get a clean, transparent PNG in seconds.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600 dark:text-purple-400 mr-2"
                >
                  <rect width="14" height="20" x="5" y="2" rx="2"></rect>
                  <path d="M12 18h.01"></path>
                </svg>
                Works On All Devices
              </h3>
              <p>
                Whether you are on desktop or mobile, our background remover tool is optimized for fast, high-quality
                results. Perfect for product photos, profile pictures, creative projects, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600 dark:text-purple-400 mr-2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                Why Choose Powerful?
              </h3>
              <p>
                With blazing-fast performance powered by cutting-edge AI, Powerful background remover delivers
                studio-quality results for free. No hidden fees. No limits. Just pure image magic.
              </p>
            </CardContent>
          </Card>
        </div>

        <Accordion type="single" collapsible className="mb-12">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-semibold">How does the background remover work?</AccordionTrigger>
            <AccordionContent>
              Our background remover uses advanced AI technology to identify the main subject in your image and separate
              it from the background. The AI has been trained on millions of images to accurately detect edges and
              complex details like hair and transparent objects.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-xl font-semibold">What file formats are supported?</AccordionTrigger>
            <AccordionContent>
              Our tool supports common image formats including JPG, PNG, and WEBP. The output is always a transparent
              PNG file, which is ideal for using in designs, presentations, or online stores.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-xl font-semibold">Is there a file size limit?</AccordionTrigger>
            <AccordionContent>
              Yes, the maximum file size is 10MB. For best results, we recommend using images with good lighting and a
              clear subject that stands out from the background.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-xl font-semibold">
              What can I use the removed background images for?
            </AccordionTrigger>
            <AccordionContent>
              You can use your background-removed images for e-commerce product photos, social media profiles, digital
              art, presentations, marketing materials, and much more. The transparent PNG format makes it easy to place
              your subject on any new background.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Remove Background From Image Free Online",
  description:
    "Instantly remove background from any image with our free online background remover. High precision. Free Signup required. Works on all devices.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Remove Background From Image Free Online",
    description:
      "Instantly remove background from any image with our free online background remover. High precision. Free sign-up required.",
    url: "https://visitpowerful.com/tools/bg-remover",
    type: "website",
    siteName: "Powerful",
    images: [
      {
        url: "https://visitpowerful.com/main-pics/bg-remover.jpg",
        width: 1000,
        height: 590,
        alt: "Free Background Remover Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background From Image Free Online",
    description:
      "Remove image backgrounds instantly and free. No credit card, no software — just pure AI-powered background removal.",
    site: "@powerfulcreat",
    images: ["https://visitpowerful.com/main-pics/bg-remover.jpg"],
  },
}
