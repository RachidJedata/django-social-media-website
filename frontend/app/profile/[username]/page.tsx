"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfilePosts } from "@/components/profile/profile-posts"
import { Navbar } from "@/components/layout/navbar"
import { mockUsers, mockProfiles, mockPosts, mockFollows } from "@/lib/mock-data"
import type { User, Profile, Post } from "@/lib/types"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Get current user from localStorage
    const currentUserData = localStorage.getItem("currentUser")
    if (currentUserData) {
      const userData = JSON.parse(currentUserData)
      setCurrentUser(userData)

      // Check if current user is following this profile
      const followExists = mockFollows.some(
        (follow) => follow.follower === userData.username && follow.user === username,
      )
      setIsFollowing(followExists)
    }

    // Find user by username
    const foundUser = mockUsers.find((u) => u.username === username)
    if (foundUser) {
      setUser(foundUser)

      // Find profile for this user
      const foundProfile = mockProfiles.find((p) => p.user === foundUser.id)
      if (foundProfile) {
        setProfile(foundProfile)
      }

      // Find posts for this user
      const userPosts = mockPosts.filter((p) => p.user === foundUser.id)
      setPosts(userPosts)
    }
  }, [username])

  const handleFollowToggle = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUsername: currentUser.username }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
            <p className="text-gray-600 mt-2">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === username

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <ProfileHeader
            user={user}
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
          />
          <ProfilePosts posts={posts} />
        </div>
      </div>
    </div>
  )
}
