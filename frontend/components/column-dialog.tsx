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
import type { Column } from "@/lib/workspace"

interface ColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (column: Omit<Column, "id" | "tasks"> | Column) => void
  column?: Column | null
  position: number
}

const colorOptions = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#84cc16", label: "Lime" },
]

export function ColumnDialog({ open, onOpenChange, onSave, column, position }: ColumnDialogProps) {
  const [title, setTitle] = useState(column?.title || "")
  const [color, setColor] = useState(column?.color || colorOptions[0].value)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)

    try {
      if (column) {
        // Update existing column
        const updatedColumn: Column = {
          ...column,
          title: title.trim(),
          color,
        }
        onSave(updatedColumn)
      } else {
        // Create new column
        const newColumn: Omit<Column, "id" | "tasks"> = {
          title: title.trim(),
          color,
          position,
        }
        onSave(newColumn)
      }

      // Reset form
      setTitle("")
      setColor(colorOptions[0].value)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save column:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{column ? "Edit Column" : "Create New Column"}</DialogTitle>
          <DialogDescription>
            {column ? "Update your column settings." : "Create a new column to organize your tasks."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Column Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter column title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Column Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    color === option.value ? "border-foreground scale-105" : "border-border"
                  }`}
                  style={{ backgroundColor: option.value }}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Saving..." : column ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
