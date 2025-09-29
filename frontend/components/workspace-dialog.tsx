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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { type Workspace, createWorkspace } from "@/lib/workspace"
import { useAuth } from "@/lib/auth"

interface WorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (workspace: Workspace) => void
  workspace?: Workspace | null
}

export function WorkspaceDialog({ open, onOpenChange, onSave, workspace }: WorkspaceDialogProps) {
  const { user } = useAuth()
  const [name, setName] = useState(workspace?.name || "")
  const [description, setDescription] = useState(workspace?.description || "")
  const [isPublic, setIsPublic] = useState(workspace?.isPublic || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return

    setIsLoading(true)

    try {
      if (workspace) {
        // Update existing workspace
        const updatedWorkspace: Workspace = {
          ...workspace,
          name: name.trim(),
          description: description.trim(),
          isPublic,
          updatedAt: new Date(),
        }
        onSave(updatedWorkspace)
      } else {
        // Create new workspace
        const newWorkspace = createWorkspace(name.trim(), description.trim(), isPublic, user)
        onSave(newWorkspace)
      }

      // Reset form
      setName("")
      setDescription("")
      setIsPublic(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save workspace:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{workspace ? "Edit Workspace" : "Create New Workspace"}</DialogTitle>
          <DialogDescription>
            {workspace
              ? "Update your workspace settings and preferences."
              : "Create a new workspace to organize your tasks and collaborate with others."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workspace"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public">Make this workspace public</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Saving..." : workspace ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
