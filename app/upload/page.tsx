import ImageUploadForm from '@/components/ImageDetails/imageUploadForm';

export default function UploadPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload an Image</h1>
      <ImageUploadForm />
    </div>
  );
}
