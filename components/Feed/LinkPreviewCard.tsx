import Image from "next/image"

interface Props {
  title: string
  description: string
  image: string
  url: string
}

export default function LinkPreviewCard({ title, description, image, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className="flex border rounded-lg overflow-hidden hover:shadow-md transition bg-white"
    >
      {image && (
        <div className="relative w-48 min-w-48 h-auto aspect-[3/4] sm:aspect-square bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-top rounded-l-lg"
          />
        </div>
      )}

      <div className="p-4 flex flex-col justify-center">
        <h4 className="text-base font-semibold line-clamp-2 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        <p className="text-sm text-gray-600 mt-2">{new URL(url).hostname}</p>
      </div>
    </a>
  )
}
