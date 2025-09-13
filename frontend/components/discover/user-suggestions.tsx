"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { GetFeedDataQuery } from "@/lib/types"
import FollowButton from "../profile/follow-button"

export function UserSuggestions({ profiles }: { profiles: GetFeedDataQuery['suggestions'] }) {


  if (!profiles || profiles.length === 0) return (<></>);


  return (
    // <Card className="w-full">
    <Card className="w-full fixed right-7 top-28 max-w-xs z-50">
      <CardHeader>
        <CardTitle className="text-lg">Suggested for you</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile?.id} className="flex items-center justify-between">
            <Link
              href={`/profile/${profile?.user.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.profileimg || "/placeholder.svg"} alt={profile?.user.username} />
                <AvatarFallback>
                  {profile?.user.firstName}
                  {profile?.user.lastName}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {profile?.user.firstName} {profile?.user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">@{profile?.user.username}</p>
                {profile?.bio && <p className="text-xs text-gray-600 truncate mt-1">{profile.bio}</p>}
              </div>
            </Link>
            <FollowButton
              isFollowing={profile?.isFollowing || false}
              className=""
              username={profile?.user.username} />

          </div>
        ))}
      </CardContent>
    </Card>
  )
}
