import { Button } from "../ui/button"

export default function FollowButton({ username, isFollowing, className, ...props }: { isFollowing?: boolean, username: string | undefined, className?: string }) {
    const onFollowToggle = () => {

    }
    
    return (
        <Button
            size="sm"
            // variant={followingStates[user.username] ? "outline" : "default"}
            variant={isFollowing ? "destructive" : "default"}
            onClick={onFollowToggle}
            // className="ml-2 flex-shrink-0"
            className={`w-fit ${className} cursor-pointer`}
            {...props}
        >
            {isFollowing===true ? 'Unfollow' : 'Follow'}
        </Button>
    )
}
