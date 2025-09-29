"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { WorkspaceKanbanColumn } from "@/components/workspace-kanban-column"
import { WorkspaceTaskDialog } from "@/components/workspace-task-dialog"
import { ColumnDialog } from "@/components/column-dialog"
import { MemberManagementDialog } from "@/components/member-management-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import {
  type Workspace,
  type Column,
  type Task,
  loadWorkspacesFromStorage,
  saveWorkspacesToStorage,
  setCurrentWorkspaceId,
} from "@/lib/workspace"
import { Plus, Search, Users, Lock, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WorkspacePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.id as string

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)
  const [defaultColumnId, setDefaultColumnId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    const loadedWorkspaces = loadWorkspacesFromStorage()
    setWorkspaces(loadedWorkspaces)

    const workspace = loadedWorkspaces.find((w) => w.id === workspaceId)
    if (workspace) {
      // Check if user has access
      const hasAccess = workspace.members.some((member) => member.id === user?.id)
      if (hasAccess) {
        setCurrentWorkspace(workspace)
        setCurrentWorkspaceId(workspace.id)
      } else {
        router.push("/kanbans")
      }
    } else {
      router.push("/kanbans")
    }
  }, [workspaceId, user, router])

  useEffect(() => {
    if (workspaces.length > 0 && currentWorkspace) {
      saveWorkspacesToStorage(workspaces)
    }
  }, [workspaces, currentWorkspace])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
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

  if (!user || !currentWorkspace) {
    return null
  }

  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  const handleAddTask = (columnId: string) => {
    setEditingTask(null)
    setDefaultColumnId(columnId)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedWorkspace = {
      ...currentWorkspace,
      columns: currentWorkspace.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
      updatedAt: new Date(),
    }

    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> | Task) => {
    let updatedWorkspace: Workspace

    if ("id" in taskData) {
      // Editing existing task
      updatedWorkspace = {
        ...currentWorkspace,
        columns: currentWorkspace.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskData.id),
        })),
        updatedAt: new Date(),
      }

      // Add task to new column
      updatedWorkspace = {
        ...updatedWorkspace,
        columns: updatedWorkspace.columns.map((column) =>
          column.id === taskData.columnId
            ? {
                ...column,
                tasks: [...column.tasks, { ...taskData, updatedAt: new Date() }],
              }
            : column,
        ),
      }
    } else {
      // Creating new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      updatedWorkspace = {
        ...currentWorkspace,
        columns: currentWorkspace.columns.map((column) =>
          column.id === taskData.columnId ? { ...column, tasks: [...column.tasks, newTask] } : column,
        ),
        updatedAt: new Date(),
      }
    }

    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  const handleMoveTask = (taskId: string, newColumnId: string) => {
    let taskToMove: Task | null = null
    let updatedWorkspace = {
      ...currentWorkspace,
      columns: currentWorkspace.columns.map((column) => {
        const taskIndex = column.tasks.findIndex((task) => task.id === taskId)
        if (taskIndex !== -1) {
          taskToMove = { ...column.tasks[taskIndex], columnId: newColumnId, updatedAt: new Date() }
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }
        }
        return column
      }),
      updatedAt: new Date(),
    }

    if (taskToMove) {
      updatedWorkspace = {
        ...updatedWorkspace,
        columns: updatedWorkspace.columns.map((column) =>
          column.id === newColumnId ? { ...column, tasks: [...column.tasks, taskToMove] } : column,
        ),
      }
    }

    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  const handleAddColumn = () => {
    setEditingColumn(null)
    setColumnDialogOpen(true)
  }

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column)
    setColumnDialogOpen(true)
  }

  const handleSaveColumn = (columnData: Omit<Column, "id" | "tasks"> | Column) => {
    let updatedWorkspace: Workspace

    if ("id" in columnData) {
      // Editing existing column
      updatedWorkspace = {
        ...currentWorkspace,
        columns: currentWorkspace.columns.map((column) =>
          column.id === columnData.id ? { ...column, ...columnData } : column,
        ),
        updatedAt: new Date(),
      }
    } else {
      // Creating new column
      const newColumn: Column = {
        ...columnData,
        id: Date.now().toString(),
        tasks: [],
      }

      updatedWorkspace = {
        ...currentWorkspace,
        columns: [...currentWorkspace.columns, newColumn],
        updatedAt: new Date(),
      }
    }

    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  const handleDeleteColumn = (columnId: string) => {
    const updatedWorkspace = {
      ...currentWorkspace,
      columns: currentWorkspace.columns.filter((column) => column.id !== columnId),
      updatedAt: new Date(),
    }

    setCurrentWorkspace(updatedWorkspace)
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)))
  }

  // Filter tasks based on search query and priority
  const filteredColumns = currentWorkspace.columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

      return matchesSearch && matchesPriority
    }),
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/kanbans">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Kanbans
                  </Button>
                </Link>
                <Badge variant="outline" className="text-xs">
                  {currentWorkspace.isPublic ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-balance">{currentWorkspace.name}</h1>
              <p className="text-muted-foreground">{currentWorkspace.description || "Collaborative workspace"}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4" />
                {currentWorkspace.members.length} member{currentWorkspace.members.length !== 1 ? "s" : ""}
              </div>
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
              {currentWorkspace.isPublic && (
                <Button variant="outline" onClick={() => setMemberDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </Button>
              )}
              <Button variant="outline" onClick={handleAddColumn}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              <Button onClick={() => handleAddTask(currentWorkspace.columns[0]?.id || "")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          <div
            className="grid gap-6 h-[calc(100vh-250px)]"
            style={{ gridTemplateColumns: `repeat(${filteredColumns.length}, minmax(300px, 1fr))` }}
          >
            {filteredColumns.map((column) => (
              <WorkspaceKanbanColumn
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </div>
        </div>

        <WorkspaceTaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          task={editingTask}
          defaultColumnId={defaultColumnId}
          columns={currentWorkspace.columns}
          members={currentWorkspace.members}
          onSave={handleSaveTask}
        />

        <ColumnDialog
          open={columnDialogOpen}
          onOpenChange={setColumnDialogOpen}
          column={editingColumn}
          position={currentWorkspace.columns.length}
          onSave={handleSaveColumn}
        />

        <MemberManagementDialog
          open={memberDialogOpen}
          onOpenChange={setMemberDialogOpen}
          workspace={currentWorkspace}
          currentUser={user}
          onUpdateWorkspace={handleUpdateWorkspace}
        />
      </div>
    </div>
  )
}
