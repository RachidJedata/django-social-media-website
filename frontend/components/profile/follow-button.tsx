import { Button } from "../ui/button"
import { useMutation } from "@apollo/client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "../auth/AuthComponent"
import { useEffect, useState } from "react"
import { FOLLOW_USER_MUTATION } from "@/lib/graphQL/queries"


export default function FollowButton({ username, isFollowing, className, ...props }: { isFollowing?: boolean, username: string | undefined, className?: string }) {
    const { toast } = useToast()
    const currentProfile = useUser()
    const [isNowFollowing, setIsNowFollowing] = useState(isFollowing);

    // Use mutation hook. The backend handles the follow/unfollow toggle.
    const [followUser, { loading: loadingFollow }] = useMutation(FOLLOW_USER_MUTATION, {
        variables: { username },
        onCompleted: (data) => {
            // Determine the toast message based on the new follow state.
            const isNowFollowingReceived = data?.followUser?.followed;
            toast({
                title: "Success",
                description: isNowFollowingReceived
                    ? data.followUser.message || "You are now following this user."
                    : data.followUser.message || "You have unfollowed this user.",
            })

            setIsNowFollowing(isNowFollowingReceived)
        },
        onError: (err) => {
            toast({
                title: "Error",
                description: err.message || "Failed to toggle follow status.",
                variant: "destructive",
            })
        },
        // The update function refreshes the data in the Apollo cache.
        update: (cache, { data }) => {
            if (data?.followUser.followed) {
                cache.evict({ id: `UserType:${data.followUser.followed.id}` });
                cache.gc();
            }
        },
    });

    // Handle the button click event. We now only need to call the single mutation.
    const onFollowToggle = () => {
        if (!username) {
            toast({
                title: "Error",
                description: "Username is not provided.",
                variant: "destructive",
            })
            return
        }
        followUser();
    }


    // Do not show the button if it's the current logged-in user's profile.
    if (currentProfile?.user.username === username) return null

    return (
        <Button
            size="sm"
            variant={isNowFollowing ? "destructive" : "default"}
            onClick={onFollowToggle}
            className={`w-fit ${className} cursor-pointer`}
            disabled={loadingFollow}
            {...props}
        >
            {isNowFollowing ? 'Unfollow' : 'Follow'}
            {/* {loadingFollow ? (isNowFollowing ? "Unfollowing..." : "Following...") : (isNowFollowing ? 'Unfollow' : 'Follow')} */}
        </Button>
    )
}

