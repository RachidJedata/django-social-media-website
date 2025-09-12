import type { User, Profile, Post, LikePost, FollowersCount } from "./types"

export const mockUsers: User[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "johndoe",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    is_active: true,
    date_joined: "2024-01-15T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    username: "janesmith",
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: true,
    date_joined: "2024-01-20T14:20:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    username: "mikejohnson",
    email: "mike@example.com",
    first_name: "Mike",
    last_name: "Johnson",
    is_active: true,
    date_joined: "2024-02-01T09:15:00Z",
  },
]

export const mockProfiles: Profile[] = [
  {
    id: "1",
    user: "550e8400-e29b-41d4-a716-446655440001",
    id_user: "550e8400-e29b-41d4-a716-446655440001",
    bio: "Photography enthusiast and coffee lover ☕",
    profileimg: "/professional-headshot.png",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    user: "550e8400-e29b-41d4-a716-446655440002",
    id_user: "550e8400-e29b-41d4-a716-446655440002",
    bio: "Travel blogger | Adventure seeker 🌍",
    profileimg: "/travel-blogger-portrait.jpg",
    location: "New York, NY",
  },
  {
    id: "3",
    user: "550e8400-e29b-41d4-a716-446655440003",
    id_user: "550e8400-e29b-41d4-a716-446655440003",
    bio: "Tech entrepreneur | Building the future 🚀",
    profileimg: "/tech-entrepreneur-headshot.png",
    location: "Austin, TX",
  },
]

export const mockPosts: Post[] = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    user: "550e8400-e29b-41d4-a716-446655440001",
    image: "/cozy-coffee-shop.png",
    caption: "Perfect morning coffee at my favorite local spot ☕ #coffee #morning",
    created_at: "2024-03-15T08:30:00Z",
    no_of_likes: 24,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    user: "550e8400-e29b-41d4-a716-446655440002",
    image: "/mountain-sunset-vista.png",
    caption: "Incredible sunset from the mountain peak! Nature never fails to amaze me 🌅",
    created_at: "2024-03-14T19:45:00Z",
    no_of_likes: 87,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    user: "550e8400-e29b-41d4-a716-446655440003",
    image: "/modern-office-workspace-setup.jpg",
    caption: "New office setup is finally complete! Ready to build amazing things 💻",
    created_at: "2024-03-13T16:20:00Z",
    no_of_likes: 42,
  },
]

export const mockLikes: LikePost[] = [
  {
    id: "750e8400-e29b-41d4-a716-446655440001",
    post_id: "650e8400-e29b-41d4-a716-446655440001",
    username: "janesmith",
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440002",
    post_id: "650e8400-e29b-41d4-a716-446655440002",
    username: "johndoe",
  },
]

export const mockFollows: FollowersCount[] = [
  {
    id: "850e8400-e29b-41d4-a716-446655440001",
    follower: "johndoe",
    user: "janesmith",
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440002",
    follower: "janesmith",
    user: "mikejohnson",
  },
]
