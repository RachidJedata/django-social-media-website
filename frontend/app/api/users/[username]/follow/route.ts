import { type NextRequest, NextResponse } from "next/server"
import { mockFollows } from "@/lib/mock-data"

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  const targetUsername = params.username
  const { followerUsername } = await request.json()

  // Check if already following
  const existingFollow = mockFollows.find(
    (follow) => follow.follower === followerUsername && follow.user === targetUsername,
  )

  if (existingFollow) {
    return NextResponse.json({ error: "Already following" }, { status: 400 })
  }

  // Add follow
  const newFollow = {
    id: `follow-${Date.now()}`,
    follower: followerUsername,
    user: targetUsername,
  }
  mockFollows.push(newFollow)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { username: string } }) {
  const targetUsername = params.username
  const { followerUsername } = await request.json()

  // Find and remove follow
  const followIndex = mockFollows.findIndex(
    (follow) => follow.follower === followerUsername && follow.user === targetUsername,
  )

  if (followIndex === -1) {
    return NextResponse.json({ error: "Follow not found" }, { status: 404 })
  }

  mockFollows.splice(followIndex, 1)

  return NextResponse.json({ success: true })
}
