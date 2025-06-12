export interface ImageData {
    _id: string;
    title: string;
    slug: { current: string };
    image: any;
    alt?: string;
    description: string;
    tags: string[];
    likes: number;
    views: number;
  }
  