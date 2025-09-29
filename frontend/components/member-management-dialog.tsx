"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Workspace, User } from "@/lib/workspace"
import { Users, Plus, MoreHorizontal, Crown, UserMinus, Mail } from "lucide-react"

interface MemberManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: Workspace
  currentUser: User
  onUpdateWorkspace: (workspace: Workspace) => void
}

export function MemberManagementDialog({
  open,
  onOpenChange,
  workspace,
  currentUser,
  onUpdateWorkspace,
}: MemberManagementDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isOwner = workspace.owner.id === currentUser.id

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !isOwner) return

    setIsLoading(true)

    try {
      // Simulate user lookup by email (in real app, this would be an API call)
      const newUser: User = {
        id: Date.now().toString(),
        name: email.split("@")[0],
        email: email.trim(),
      }

      // Check if user is already a member
      const isAlreadyMember = workspace.members.some((member) => member.email === email.trim())
      if (isAlreadyMember) {
        alert("User is already a member of this workspace")
        return
      }

      const updatedWorkspace: Workspace = {
        ...workspace,
        members: [...workspace.members, newUser],
        updatedAt: new Date(),
      }

      onUpdateWorkspace(updatedWorkspace)
      setEmail("")
    } catch (error) {
      console.error("Failed to invite user:", error)
      alert("Failed to invite user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    if (!isOwner || memberId === workspace.owner.id) return

    const updatedWorkspace: Workspace = {
      ...workspace,
      members: workspace.members.filter((member) => member.id !== memberId),
      updatedAt: new Date(),
    }

    onUpdateWorkspace(updatedWorkspace)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Members
          </DialogTitle>
          <DialogDescription>
            {workspace.isPublic
              ? "Invite new members to collaborate on this public workspace."
              : "Manage members of this private workspace."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section - Only for owners of public workspaces */}
          {isOwner && workspace.isPublic && (
            <div className="space-y-3">
              <Label>Invite New Member</Label>
              <form onSubmit={handleInviteUser} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !email.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? "Inviting..." : "Invite"}
                </Button>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Members ({workspace.members.length})</Label>
              <Badge variant="outline" className="text-xs">
                {workspace.isPublic ? "Public Workspace" : "Private Workspace"}
              </Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspace.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        {member.id === workspace.owner.id && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Actions - Only for owners and not for the owner themselves */}
                  {isOwner && member.id !== workspace.owner.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-destructive">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info for non-owners */}
          {!isOwner && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Member Access</p>
                  <p>You can view and contribute to this workspace. Contact the owner to invite others.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
