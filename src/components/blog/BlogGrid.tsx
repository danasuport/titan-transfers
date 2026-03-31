import { BlogCard } from './BlogCard'

interface BlogGridProps {
  posts: Array<{
    _id: string
    title: string
    slug: { current: string }
    category?: string
    excerpt?: string
    publishDate?: string
    featuredImage?: { asset: { url: string } }
    translations?: Record<string, { title?: string; slug?: { current: string }; excerpt?: string }>
  }>
  columns?: 2 | 3 | 4
}

export function BlogGrid({ posts, columns = 3 }: BlogGridProps) {
  if (!posts || posts.length === 0) return null

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  )
}
