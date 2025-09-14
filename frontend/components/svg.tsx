
// Extracted SVG components for better readability
export function MoreOptionsIcon() {
    return (
        <svg className= "w-4 h-4" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
            <path
        strokeLinecap="round"
    strokeLinejoin = "round"
    strokeWidth = { 2}
    d = "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
        </svg>
  )
}

export function HeartIcon({ isLiked }: { isLiked: boolean }) {
    return (
        <svg
      className= {`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`
}
fill = { isLiked? "currentColor": "none" }
stroke = "currentColor"
viewBox = "0 0 24 24"
    >
    <path
        strokeLinecap="round"
strokeLinejoin = "round"
strokeWidth = { 2}
d = "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
    </svg>
  )
}

export function CommentIcon() {
    return (
        <svg className= "w-6 h-6 text-gray-700" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
            <path
        strokeLinecap="round"
    strokeLinejoin = "round"
    strokeWidth = { 2}
    d = "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
        </svg>
  )
}

export function ShareIcon() {
    return (
        <svg className= "w-6 h-6 text-gray-700" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
            <path
        strokeLinecap="round"
    strokeLinejoin = "round"
    strokeWidth = { 2}
    d = "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
        </svg>
  )
}

export function BookmarkIcon() {
    return (
        <svg className= "w-6 h-6 text-gray-700" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
            <path
        strokeLinecap="round"
    strokeLinejoin = "round"
    strokeWidth = { 2}
    d = "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
        </svg>
  )
}