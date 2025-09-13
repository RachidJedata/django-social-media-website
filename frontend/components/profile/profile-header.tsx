"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GetProfileQuery } from "@/lib/types"
import Image from "next/image"
import FollowButton from "./follow-button"

export function ProfileHeader({
  profile,
  isOwnProfile = false,
  onFollowToggle,
}: {
  isOwnProfile: boolean,
  onFollowToggle?: () => void,
  profile: GetProfileQuery['profile']
}) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Image width={10} height={10} className="w-32 h-32" src={`/${profile?.profileimg}` || "/avatar.png"} alt={profile?.user.username || "avatar"} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.user.firstName} {profile?.user.lastName}
                </h1>
                {!isOwnProfile && (
                  <FollowButton isFollowing={profile?.isFollowing || false} username={profile?.user.username} />
                )}
                {isOwnProfile && (
                  <Button variant="outline" className="w-fit bg-transparent">
                    Edit Profile
                  </Button>
                )}
              </div>
              <p className="text-gray-600">@{profile?.user.username}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-800">{profile?.bio}</p>
              {profile?.location && (
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
                <div className="font-semibold text-gray-900">{profile?.user.posts.length}</div>
                <div className="text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{profile?.followersCount}</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{profile?.followingCount}</div>
                <div className="text-gray-600">Following</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Active</Badge>
              <span className="text-sm text-gray-500">
                Joined {new Date(profile?.user.dateJoined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
