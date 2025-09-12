import { NextResponse } from "next/server"
import { mockPosts } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockPosts)
}
