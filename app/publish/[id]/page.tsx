import { generateMetadataFromPrompt } from '@/app/actions/generateMetadataFromPrompt';
import { client } from '@/app/utils/sanityClient';
import ImageUploadForm from '@/components/ImageDetails/imageUploadForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublishPage({ params }: Props) {
  const { id } = await params; // Await params

  let image;
  try {
    image = await client.fetch(
      `*[_type == "imageGeneration" && _id == $id][0]{
        _id,
        prompt,
        "imageUrl": image.asset->url,
        image,
      }`,
      { id }
    );
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return (
      <div className="p-8 text-red-600">
        Error: Failed to fetch image data from Sanity.
      </div>
    );
  }

  if (!image || !image.prompt || !image.image || !image.image.asset) {
    return (
      <div className="p-8 text-red-600">
        Error: This image is missing required data (prompt or image).
      </div>
    );
  }

  let metadata;
  try {
    metadata = await generateMetadataFromPrompt(image.prompt);
  } catch (err) {
    console.error('OpenAI metadata generation failed:', err);
    metadata = {
      title: '',
      description: '',
      tags: [],
      alt: '',
    };
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Publish Your Image</h1>
      <ImageUploadForm
        initialValues={{
          imageUrl: image.imageUrl,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          altText: metadata.alt,
          generatedImageId: image._id,
          prompt: image.prompt,
        }}
      />
    </div>
  );
}