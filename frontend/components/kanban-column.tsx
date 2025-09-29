"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskCard } from "./task-card"
import type { Column, Task } from "@/lib/kanban"

interface KanbanColumnProps {
  column: Column
  onAddTask?: (status: Task["status"]) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onMoveTask?: (taskId: string, newStatus: Task["status"]) => void
}

export function KanbanColumn({ column, onAddTask, onEditTask, onDeleteTask, onMoveTask }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId && onMoveTask) {
      onMoveTask(taskId, column.status)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card
        className={`bg-card/30 backdrop-blur-sm border-border/50 flex-1 flex flex-col transition-colors ${
          isDragOver ? "border-primary/50 bg-primary/5" : ""
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onAddTask?.(column.status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent
          className="flex-1 pt-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
            ))}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No tasks yet</p>
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => onAddTask?.(column.status)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add first task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
