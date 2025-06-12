// components/Feed/FeedPage.tsx
import FeedComposer from './PostComposer';

export default function FeedPage() {
  return (
    <div className="max-w-xl mx-auto py-10">
      <FeedComposer />
      {/* FeedList will come next */}
    </div>
  );
}
