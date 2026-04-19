import { notFound } from "next/navigation";
import { BlogPostDetail } from "@/features/blog/components/BlogPostDetail";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getPost(slug: string): Promise<BlogPostDto | null> {
  const res = await fetch(`${API_URL}/blog/${slug}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<BlogPostDto>;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <BlogPostDetail post={post} />;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}
