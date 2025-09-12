"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User, Profile } from "@/lib/types"
import Link from "next/link"

interface UserSuggestionsProps {
  users: Array<{ user: User; profile: Profile }>
  currentUser?: User
}

export function UserSuggestions({ users, currentUser }: UserSuggestionsProps) {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})

  const handleFollowToggle = async (username: string) => {
    if (!currentUser) return

    const isCurrentlyFollowing = followingStates[username]

    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUsername: currentUser.username }),
      })

      if (response.ok) {
        setFollowingStates((prev) => ({
          ...prev,
          [username]: !isCurrentlyFollowing,
        }))
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  // Filter out current user from suggestions
  const filteredUsers = users.filter((item) => item.user.username !== currentUser?.username)

  if (filteredUsers.length === 0) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Suggested for you</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredUsers.slice(0, 5).map(({ user, profile }) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile.profileimg || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                {profile.bio && <p className="text-xs text-gray-600 truncate mt-1">{profile.bio}</p>}
              </div>
            </Link>
            <Button
              size="sm"
              variant={followingStates[user.username] ? "outline" : "default"}
              onClick={() => handleFollowToggle(user.username)}
              className="ml-2 flex-shrink-0"
            >
              {followingStates[user.username] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
