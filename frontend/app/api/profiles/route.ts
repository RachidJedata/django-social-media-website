import { NextResponse } from "next/server"
import { mockProfiles } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockProfiles)
}
