export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  isPublic: boolean
  owner: User
  members: User[]
  columns: Column[]
  createdAt: Date
  updatedAt: Date
}

export interface Column {
  id: string
  title: string
  color: string
  position: number
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  priority: "low" | "medium" | "high"
  assignedTo?: User
  createdAt: Date
  updatedAt: Date
}

// Default columns for new workspaces
export const defaultColumns: Omit<Column, "tasks">[] = [
  { id: "todo", title: "To Do", color: "#6366f1", position: 0 },
  { id: "in-progress", title: "In Progress", color: "#f59e0b", position: 1 },
  { id: "done", title: "Done", color: "#10b981", position: 2 },
]

// Storage keys
const WORKSPACES_KEY = "kanban_workspaces"
const CURRENT_WORKSPACE_KEY = "current_workspace"

export function loadWorkspacesFromStorage(): Workspace[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(WORKSPACES_KEY)
    if (!stored) return []

    const workspaces = JSON.parse(stored)
    return workspaces.map((workspace: any) => ({
      ...workspace,
      createdAt: new Date(workspace.createdAt),
      updatedAt: new Date(workspace.updatedAt),
      columns: workspace.columns.map((column: any) => ({
        ...column,
        tasks: column.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })),
      })),
    }))
  } catch (error) {
    console.error("Failed to load workspaces:", error)
    return []
  }
}

export function saveWorkspacesToStorage(workspaces: Workspace[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces))
  } catch (error) {
    console.error("Failed to save workspaces:", error)
  }
}

export function getCurrentWorkspaceId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_WORKSPACE_KEY)
}

export function setCurrentWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId)
}

export function createWorkspace(name: string, description: string, isPublic: boolean, owner: User): Workspace {
  const workspace: Workspace = {
    id: Date.now().toString(),
    name,
    description,
    isPublic,
    owner,
    members: [owner],
    columns: defaultColumns.map((col) => ({
      ...col,
      tasks: [],
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return workspace
}

export function getPriorityColor(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
