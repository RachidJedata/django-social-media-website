"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfilePosts } from "@/components/profile/profile-posts"
import { Navbar } from "@/components/layout/navbar"
import { mockUsers, mockProfiles, mockPosts, mockFollows } from "@/lib/mock-data"
import { useUser } from "@/components/auth/AuthComponent"
import { useLazyQuery } from "@apollo/client"
import { GetProfileQuery } from "@/lib/types"
import { GET_PROFILE } from "@/lib/graphQL/queries"

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {

  const myProfile = useUser()

  const [profile, setProfile] = useState<GetProfileQuery['profile']>();

  const [getUser, { loading }] = useLazyQuery<GetProfileQuery>(GET_PROFILE);

  useEffect(() => {
    const getUserParam = async () => {
      const username = (await params).username;
      const userPrefetch = await getUser({
        variables: {
          username
        }
      })
      if (userPrefetch.error) {
        throw new Error(userPrefetch.error.message || "An error occured")
      }
      if (!userPrefetch.data?.profile)
        return (<NoteFound />);

      setProfile(userPrefetch.data?.profile);
    }
    getUserParam()
  }, [])

  if (loading) return (<>loading...</>)


  const handleFollowToggle = async () => {
  }


  const isOwnProfile = myProfile?.user.username === profile?.user.username

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onFollowToggle={handleFollowToggle}
          />
          <ProfilePosts posts={profile?.user.posts} />
        </div>
      </div>
    </div>
  )
}


function NoteFound() {
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