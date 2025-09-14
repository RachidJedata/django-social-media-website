"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useMutation } from "@apollo/client"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "../ui/use-toast"
import { GetFeedDataQuery } from "@/lib/types"
import { useUser } from "../auth/AuthComponent"
import { LIKE_POST } from "@/lib/graphQL/queries"
import { BookmarkIcon, CommentIcon, HeartIcon, MoreOptionsIcon, ShareIcon } from "../svg"

type FeedType = GetFeedDataQuery['feed']

interface PostCardProps {
  post: NonNullable<FeedType>[number]
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [nbreOfLikes, setNbreOfLikes] = useState(0)

  const [isImageLoading, setIsImageLoading] = useState(true)
  const myProfile = useUser()

  // Memoize the initial like state to avoid unnecessary effects
  useMemo(() => {
    if (myProfile && post?.likes) {
      const hasLiked = post.likes.some(like => like.user.username === myProfile.user.username)
      setIsLiked(hasLiked)
    }
  }, [myProfile, post?.likes])

  // Like post mutation
  const [likePost, { loading: isLikeLoading }] = useMutation(LIKE_POST, {
    variables: { postId: post?.id },
    onCompleted: (data) => {
      const isNowLiked = data?.likePost?.liked
      setIsLiked(isNowLiked)
      setNbreOfLikes(prev => {
        return prev + isNowLiked
      })

      toast({
        title: "Success",
        description: isNowLiked
          ? "You liked this post."
          : "You unliked this post.",
      })
    },
    onError: (error) => {
      // Revert the UI state on error
      setIsLiked(prev => !prev)
      toast({
        title: "Error",
        description: error.message || "Failed to update like status.",
        variant: "destructive",
      })
    },
  })

  const handleLikeClick = useCallback(() => {
    if (!myProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts.",
        variant: "default",
      })
      return
    }

    // Optimistic UI update
    setIsLiked(prev => !prev)
    likePost()
  }, [likePost, myProfile])

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false)
  }, [])

  // Format date once using useMemo
  const formattedDate = useMemo(() => {
    if (!post?.createdAt) return ""
    return new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })
  }, [post?.createdAt])

  useEffect(() => {
    setNbreOfLikes(post?.likes.length || 0)
  }, [isLiked])

  if (!post) return null

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.user.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label={`Visit ${post.user.username}'s profile`}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={post.user.profile?.profileimg || "/placeholder.svg"}
                alt={post.user.username}
              />
              <AvatarFallback>
                {post.user.firstName?.[0]}
                {post.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                {post.user.firstName} {post.user.lastName}
              </p>
              <p className="text-xs text-gray-500">@{post.user.username}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Post options"
          >
            <MoreOptionsIcon />
          </Button>
        </div>
      </CardHeader>

      <div className="aspect-square relative">
        <Image
          src={post.image || "/placeholder.svg"}
          alt="Post"
          fill
          className={`object-cover ${isImageLoading ? 'blur-sm' : 'blur-0'}`}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              disabled={isLikeLoading || !myProfile}
              variant="ghost"
              size="sm"
              className="h-8 p-0 hover:bg-transparent"
              onClick={handleLikeClick}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <HeartIcon isLiked={isLiked} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 hover:bg-transparent"
              aria-label="Comment on post"
            >
              <CommentIcon />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 hover:bg-transparent"
              aria-label="Share post"
            >
              <ShareIcon />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 hover:bg-transparent"
            aria-label="Save post"
          >
            <BookmarkIcon />
          </Button>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-sm text-gray-900">
            {nbreOfLikes} {nbreOfLikes === 1 ? 'like' : 'likes'}
          </p>
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{myProfile?.user.username}</span>{" "}
            <span className="text-gray-800">{post.caption}</span>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {formattedDate}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
