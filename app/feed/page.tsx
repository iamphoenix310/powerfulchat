import FeedComposer from '@/components/Feed/PostComposer';
import FeedList from '@/components/Feed/FeedList';

export default function FeedPage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Feed <span className='text-gray-600 text-xs'>- Beta Version</span></h1>
      <FeedComposer />
      <FeedList />
    </div>
  );
}
