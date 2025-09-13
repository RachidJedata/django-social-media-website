"use client"

import { Navbar } from "@/components/layout/navbar"
import { CreatePost } from "@/components/feed/create-post"
import { PostCard } from "@/components/feed/post-card"
import { UserSuggestions } from "@/components/discover/user-suggestions"
import { useQuery } from "@apollo/client";
import { GET_FEED } from "@/lib/graphQL/queries"
import { GetFeedDataQuery } from "@/lib/types"

export default function FeedPage() {

    const { data, loading, error } = useQuery<GetFeedDataQuery>(GET_FEED);

    if (loading) return <p>Loading...</p>;


    if (error) return <p>Error! {error.message}</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <CreatePost />

                        {data?.feed && (
                            data.feed.length === 0 ? (
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
                                data.feed.map((post) => <PostCard key={post?.id} post={post} />)
                            )

                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {data?.suggestions && data.suggestions.length !== 0 && (<UserSuggestions profiles={data.suggestions} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}