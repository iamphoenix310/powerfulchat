export interface Product {
  _id: string
  title: string
  slug: { current: string }
  mainimage?: any
  price?: number
  isPremium?: boolean
  description?: string
  productImages?: any[]
  // ... add any fields as needed from schema
}
