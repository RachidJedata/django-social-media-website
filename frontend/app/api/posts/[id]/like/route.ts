import { type NextRequest, NextResponse } from "next/server"
import { mockLikes, mockPosts } from "@/lib/mock-data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = params.id
  const { username } = await request.json()

  // Check if already liked
  const existingLike = mockLikes.find((like) => like.post_id === postId && like.username === username)

  if (existingLike) {
    return NextResponse.json({ error: "Already liked" }, { status: 400 })
  }

  // Add like
  const newLike = {
    id: `like-${Date.now()}`,
    post_id: postId,
    username,
  }
  mockLikes.push(newLike)

  // Update post like count
  const post = mockPosts.find((p) => p.id === postId)
  if (post) {
    post.no_of_likes += 1
  }

  return NextResponse.json({ success: true, likes: post?.no_of_likes })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const postId = params.id
  const { username } = await request.json()

  // Find and remove like
  const likeIndex = mockLikes.findIndex((like) => like.post_id === postId && like.username === username)

  if (likeIndex === -1) {
    return NextResponse.json({ error: "Like not found" }, { status: 404 })
  }

  mockLikes.splice(likeIndex, 1)

  // Update post like count
  const post = mockPosts.find((p) => p.id === postId)
  if (post) {
    post.no_of_likes = Math.max(0, post.no_of_likes - 1)
  }

  return NextResponse.json({ success: true, likes: post?.no_of_likes })
}
