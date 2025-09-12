"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User, Profile } from "@/lib/types"

interface ProfileHeaderProps {
  user: User
  profile: Profile
  isOwnProfile?: boolean
  isFollowing?: boolean
  onFollowToggle?: () => void
}

export function ProfileHeader({
  user,
  profile,
  isOwnProfile = false,
  isFollowing = false,
  onFollowToggle,
}: ProfileHeaderProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.profileimg || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback className="text-2xl">
                {user.first_name[0]}
                {user.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h1>
                {!isOwnProfile && (
                  <Button onClick={onFollowToggle} variant={isFollowing ? "outline" : "default"} className="w-fit">
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button variant="outline" className="w-fit bg-transparent">
                    Edit Profile
                  </Button>
                )}
              </div>
              <p className="text-gray-600">@{user.username}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-800">{profile.bio}</p>
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">42</div>
                <div className="text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">1.2K</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">324</div>
                <div className="text-gray-600">Following</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Active</Badge>
              <span className="text-sm text-gray-500">
                Joined {new Date(user.date_joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
