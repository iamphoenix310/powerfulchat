export interface FeedPost {
    _id: string
    text?: string
    createdAt: string
    visibility: "public" | "followers"
    image?: any
    initiallyLiked: boolean
    likes: number
    author: {
      _id: string
      username: string
      profileImage?: any
    }
  }
  