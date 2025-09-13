"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { GetFeedDataQuery } from "@/lib/types"
import { useUser } from "../auth/AuthComponent"
import { useEffect, useState } from "react"

type FeedType = GetFeedDataQuery['feed'];

export function PostCard({ post }: { post: NonNullable<FeedType>[number] }) {

  const [liked, setLiked] = useState(false);

  const myProfile = useUser();

  useEffect(() => {
    const exist = post?.likes.filter(u => u.user.username === myProfile?.user.username)
    // console.log("liked ", exist);

    setLiked(!!exist?.length)


  }, [liked])



  const handleLikeClick = () => {

  }

  if (!post) return (<></>)

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.user.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage  src={post.user.profile?.profileimg || "/placeholder.svg"} alt={post.user.username} />
              <AvatarFallback>
                {post.user.firstName}
                {post.user.lastName}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {post.user.firstName} {post.user.lastName}
              </p>
              <p className="text-xs text-gray-500">@{post.user.username}</p>
            </div>
          </Link>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>
        </div>
      </CardHeader>

      <div className="aspect-square relative">
        <Image src={post.image || "/placeholder.svg"} alt="Post" fill className="object-cover" />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent" onClick={handleLikeClick}>
              <svg
                className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </Button>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-sm text-gray-900">{post.likes.length} likes</p>
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{myProfile?.user.username}</span>{" "}
            <span className="text-gray-800">{post.caption}</span>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
