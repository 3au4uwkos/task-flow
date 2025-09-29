"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { KanbanColumn } from "@/components/kanban-column"
import { TaskDialog } from "@/components/task-dialog"
import { TaskActions } from "@/components/task-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { initialColumns, type Column, type Task } from "@/lib/kanban"
import { loadTasksFromStorage, saveTasksToStorage } from "@/lib/task-storage"
import { Plus, Search } from "lucide-react"

export default function KanbanPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [columns, setColumns] = useState<Column[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Task["status"]>("todo")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Load tasks from storage on mount
  useEffect(() => {
    const loadedColumns = loadTasksFromStorage()
    setColumns(loadedColumns)
  }, [])

  // Save tasks to storage whenever columns change
  useEffect(() => {
    if (columns.length > 0) {
      saveTasksToStorage(columns)
    }
  }, [columns])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  const handleAddTask = (status: Task["status"]) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    )
  }

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> | Task) => {
    if ("id" in taskData) {
      // Editing existing task
      setColumns((prev) => {
        const newColumns = prev.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskData.id),
        }))

        return newColumns.map((column) =>
          column.status === taskData.status
            ? {
                ...column,
                tasks: [...column.tasks, { ...taskData, updatedAt: new Date() }],
              }
            : column,
        )
      })
    } else {
      // Creating new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setColumns((prev) =>
        prev.map((column) =>
          column.status === taskData.status ? { ...column, tasks: [...column.tasks, newTask] } : column,
        ),
      )
    }
  }

  const handleImportTasks = (importedColumns: Column[]) => {
    setColumns(importedColumns)
  }

  const handleResetTasks = () => {
    setColumns(initialColumns)
  }

  // Filter tasks based on search query and priority
  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      return matchesSearch && matchesPriority
    }),
  }))

  const handleMoveTask = (taskId: string, newStatus: Task["status"]) => {
    setColumns((prev) => {
      // Find the task in any column
      let taskToMove: Task | null = null
      const updatedColumns = prev.map((column) => {
        const taskIndex = column.tasks.findIndex((task) => task.id === taskId)
        if (taskIndex !== -1) {
          taskToMove = { ...column.tasks[taskIndex], status: newStatus, updatedAt: new Date() }
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }
        }
        return column
      })

      // Add the task to the new column
      if (taskToMove) {
        return updatedColumns.map((column) =>
          column.status === newStatus ? { ...column, tasks: [...column.tasks, taskToMove] } : column,
        )
      }

      return updatedColumns
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-balance">Legacy Task Board</h1>
              <p className="text-muted-foreground">Simple task management with basic Kanban functionality</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <TaskActions columns={columns} onImport={handleImportTasks} onReset={handleResetTasks} />
              <Button onClick={() => handleAddTask("todo")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {filteredColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
              />
            ))}
          </div>
        </div>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          defaultStatus={defaultStatus}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  )
}
