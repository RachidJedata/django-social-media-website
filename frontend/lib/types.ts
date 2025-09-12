export interface User {
  id: string // UUID
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
}

export interface Profile {
  id: string
  user: string // User ID
  id_user: string // UUID
  bio: string
  profileimg: string
  location: string
}

export interface Post {
  id: string // UUID
  user: string // User ID
  image: string
  caption: string
  created_at: string
  no_of_likes: number
}

export interface LikePost {
  id: string // UUID
  post_id: string // Post ID
  username: string
}

export interface FollowersCount {
  id: string // UUID
  follower: string // Username
  user: string // Username
}
