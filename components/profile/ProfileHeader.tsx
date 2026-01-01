'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Pencil, Check, X, Loader2 } from 'lucide-react'
import { updateProfile, uploadAvatar } from '@/app/(main)/profile/actions'
import { useToastUI } from '@/components/ui/toast'

type ProfileHeaderProps = {
  userId: string
  email: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  memberSince: string | null
}

export function ProfileHeader({
  userId,
  email,
  username,
  displayName,
  avatarUrl,
  bio,
  memberSince,
}: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [nameValue, setNameValue] = useState(displayName || username || '')
  const [bioValue, setBioValue] = useState(bio || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToastUI()

  const displayedName = displayName || username || email?.split('@')[0] || 'User'
  const initials = displayedName[0]?.toUpperCase() || '?'

  async function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadAvatar(formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.url) {
        setCurrentAvatarUrl(result.url)
        toast.success('Avatar updated')
      }
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSaveName() {
    if (!nameValue.trim()) return

    setIsSaving(true)
    try {
      const result = await updateProfile({ displayName: nameValue.trim() })
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsEditingName(false)
        toast.success('Name updated')
      }
    } catch {
      toast.error('Failed to save name')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveBio() {
    setIsSaving(true)
    try {
      const result = await updateProfile({ bio: bioValue.trim() || null })
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsEditingBio(false)
        toast.success('Bio updated')
      }
    } catch {
      toast.error('Failed to save bio')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0 self-center sm:self-start">
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="relative h-24 w-24 rounded-full overflow-hidden group"
          >
            {currentAvatarUrl ? (
              <Image
                src={currentAvatarUrl}
                alt={displayedName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Display name"
                  maxLength={50}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving || !nameValue.trim()}
                  className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setNameValue(displayName || username || '')
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold truncate">{displayedName}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Email */}
          <p className="text-sm text-muted-foreground">{email}</p>

          {/* Bio */}
          <div className="pt-2">
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Write a short bio..."
                  rows={3}
                  maxLength={200}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {bioValue.length}/200
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingBio(false)
                        setBioValue(bio || '')
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group">
                {bio ? (
                  <p className="text-sm text-muted-foreground">{bio}</p>
                ) : (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + Add a bio
                  </button>
                )}
                {bio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Member since */}
          {memberSince && (
            <p className="text-xs text-muted-foreground pt-1">
              Member since {new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
