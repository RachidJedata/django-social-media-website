"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "../auth/AuthComponent"
import Image from "next/image"
import { gql, useMutation } from "@apollo/client"
import { convertToBase64 } from "@/lib/utils"

// GraphQL mutation for creating a post
// The 'image' field is of type 'Upload' to work with `graphene-file-upload`
const CREATE_POST_MUTATION = gql`
  mutation CreatePost($image: String!, $caption: String!) {
    createPost(image: $image, caption: $caption) {
      post {
        id
        caption
        image
        createdAt
        user {
          id
          username
        }
      }
    }
  }
`

export function CreatePost() {
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const currentProfile = useUser()

  // Apollo Client's useMutation hook handles the request and loading state automatically
  const [createPost, { loading, error }] = useMutation(CREATE_POST_MUTATION, {
    // This function runs after a successful mutation
    onCompleted: (data) => {
      toast({
        title: "Post shared!",
        description: "Your post has been shared with your followers.",
      })
      // Reset the form state
      setCaption("")
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    // This function runs if the mutation fails
    onError: (err) => {
      toast({
        title: "Failed to Post",
        description: `Something went wrong: ${err.message}`,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure there is both a caption and an image file
    if (!caption.trim() || !imageFile) {
      toast({
        title: "Validation Error",
        description: "Please write a caption and select an image to post.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(imageFile);
      
      
      
      // Call the mutation with the variables.
      await createPost({ variables: { image: base64Image, caption: caption.trim() } })
    } catch (err) {
      // The onError handler will catch this, but it's good practice to have a catch block.
      console.error(err)
    }
  }

  // Handle file selection from the hidden input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  if (!currentProfile) return null

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Image height={40} width={40} src={currentProfile.profileimg || "avatar.png"} alt={currentProfile.user.username} />
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[80px] resize-none border-none p-0 text-base placeholder:text-gray-500 focus-visible:ring-0"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button type="button" variant="ghost" size="sm" className="h-8 p-2 text-gray-600" onClick={() => fileInputRef.current?.click()}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 p-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a1 1 0 00-1 1v16a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1h-2M7 4h10M9 9h6m-6 4h6m-6 4h6"
                      />
                    </svg>
                  </Button>
                </div>
                <Button type="submit" disabled={!caption.trim() || loading || !imageFile} size="sm">
                  {loading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}