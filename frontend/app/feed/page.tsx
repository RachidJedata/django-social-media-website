"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { CreatePost } from "@/components/feed/create-post"
import { PostCard } from "@/components/feed/post-card"
import { UserSuggestions } from "@/components/discover/user-suggestions"
import { mockUsers, mockProfiles, mockPosts, mockLikes } from "@/lib/mock-data"
import type { Post, User, Profile } from "@/lib/types"

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [feedPosts, setFeedPosts] = useState<Array<{ post: Post; user: User; profile: Profile }>>([])
  const [userSuggestions, setUserSuggestions] = useState<Array<{ user: User; profile: Profile }>>([])
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Get current user
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }

    // Prepare feed data by combining posts with user and profile info
    const postsWithUserData = mockPosts.map((post) => {
      const user = mockUsers.find((u) => u.id === post.user)!
      const profile = mockProfiles.find((p) => p.user === post.user)!
      return { post, user, profile }
    })

    // Sort by creation date (newest first)
    postsWithUserData.sort((a, b) => new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime())

    setFeedPosts(postsWithUserData)

    // Prepare user suggestions
    const suggestions = mockUsers.map((user) => {
      const profile = mockProfiles.find((p) => p.user === user.id)!
      return { user, profile }
    })
    setUserSuggestions(suggestions)
  }, [router])

  const handleLikeToggle = async (postId: string) => {
    if (!currentUser) return

    const isLiked = mockLikes.some((like) => like.post_id === postId && like.username === currentUser.username)

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        setFeedPosts((prev) =>
          prev.map((item) =>
            item.post.id === postId ? { ...item, post: { ...item.post, no_of_likes: data.likes } } : item,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost currentUser={currentUser} />

            {feedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Follow some users to see their posts in your feed.</p>
              </div>
            ) : (
              feedPosts.map(({ post, user, profile }) => {
                const isLiked = mockLikes.some(
                  (like) => like.post_id === post.id && like.username === currentUser.username,
                )
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    profile={profile}
                    isLiked={isLiked}
                    onLikeToggle={() => handleLikeToggle(post.id)}
                  />
                )
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserSuggestions users={userSuggestions} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  )
}
