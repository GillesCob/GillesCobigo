import axios from 'axios'

export interface IArticle {
  id: number
  title: string
  excerpt: string
  date: string
  link: string
  featuredImage: string | null
}

interface IWPPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  link: string
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
    }>
  }
}

export async function fetchArticles(page = 1, perPage = 6): Promise<IArticle[]> {
  const res = await axios.get<IWPPost[]>(
    `https://gillescobigo.com/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`,
  )
  return res.data.map((post) => ({
    id: post.id,
    title: post.title.rendered,
    excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 200),
    date: post.date,
    link: post.link,
    featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
  }))
}
