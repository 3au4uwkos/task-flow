"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { WorkspaceDialog } from "@/components/workspace-dialog"
import { MemberManagementDialog } from "@/components/member-management-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"
import {
  type Workspace,
  loadWorkspacesFromStorage,
  saveWorkspacesToStorage,
  setCurrentWorkspaceId,
  formatDate,
} from "@/lib/workspace"
import { Plus, Search, Users, Lock, Globe, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

export default function KanbansPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([])
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null)
  const [managingWorkspace, setManagingWorkspace] = useState<Workspace | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadedWorkspaces = loadWorkspacesFromStorage()
    setWorkspaces(loadedWorkspaces)
    setFilteredWorkspaces(loadedWorkspaces)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const filtered = workspaces.filter((workspace) => {
      const matchesSearch =
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Show all workspaces user has access to (owned or member of)
      const hasAccess = workspace.members.some((member) => member.id === user?.id)

      return matchesSearch && hasAccess
    })

    setFilteredWorkspaces(filtered)
  }, [workspaces, searchQuery, user])

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
    return null
  }

  const handleCreateWorkspace = () => {
    setEditingWorkspace(null)
    setWorkspaceDialogOpen(true)
  }

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace)
    setWorkspaceDialogOpen(true)
  }

  const handleManageMembers = (workspace: Workspace) => {
    setManagingWorkspace(workspace)
    setMemberDialogOpen(true)
  }

  const handleSaveWorkspace = (workspace: Workspace) => {
    if (editingWorkspace) {
      // Update existing workspace
      const updatedWorkspaces = workspaces.map((w) => (w.id === workspace.id ? workspace : w))
      setWorkspaces(updatedWorkspaces)
      saveWorkspacesToStorage(updatedWorkspaces)
    } else {
      // Create new workspace
      const updatedWorkspaces = [...workspaces, workspace]
      setWorkspaces(updatedWorkspaces)
      saveWorkspacesToStorage(updatedWorkspaces)
    }
  }

  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    const updatedWorkspaces = workspaces.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w))
    setWorkspaces(updatedWorkspaces)
    saveWorkspacesToStorage(updatedWorkspaces)
  }

  const handleDeleteWorkspace = (workspaceId: string) => {
    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspaceId)
    setWorkspaces(updatedWorkspaces)
    saveWorkspacesToStorage(updatedWorkspaces)
  }

  const handleOpenWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceId(workspace.id)
    router.push(`/workspace/${workspace.id}`)
  }

  const getTaskCount = (workspace: Workspace) => {
    return workspace.columns.reduce((total, column) => total + column.tasks.length, 0)
  }

  const publicWorkspaces = filteredWorkspaces.filter((w) => w.isPublic)
  const privateWorkspaces = filteredWorkspaces.filter((w) => !w.isPublic)

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-balance">All Workspaces</h1>
              <p className="text-muted-foreground">Manage and access your collaborative workspaces</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={handleCreateWorkspace}>
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </div>
          </div>

          {/* Private Workspaces */}
          {privateWorkspaces.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Private Workspaces</h2>
                <Badge variant="secondary">{privateWorkspaces.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {privateWorkspaces.map((workspace) => (
                  <Card key={workspace.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-balance leading-tight">{workspace.name}</CardTitle>
                          <CardDescription className="text-pretty mt-1">
                            {workspace.description || "No description"}
                          </CardDescription>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenWorkspace(workspace)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            {workspace.owner.id === user.id && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditWorkspace(workspace)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteWorkspace(workspace.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent onClick={() => handleOpenWorkspace(workspace)}>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{getTaskCount(workspace)} tasks</span>
                          <span>{workspace.columns.length} columns</span>
                        </div>
                        <span>Updated {formatDate(workspace.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Public Workspaces */}
          {publicWorkspaces.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Public Workspaces</h2>
                <Badge variant="secondary">{publicWorkspaces.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicWorkspaces.map((workspace) => (
                  <Card key={workspace.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-balance leading-tight">{workspace.name}</CardTitle>
                          <CardDescription className="text-pretty mt-1">
                            {workspace.description || "No description"}
                          </CardDescription>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenWorkspace(workspace)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageMembers(workspace)}>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Members
                            </DropdownMenuItem>
                            {workspace.owner.id === user.id && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditWorkspace(workspace)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteWorkspace(workspace.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent onClick={() => handleOpenWorkspace(workspace)}>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{getTaskCount(workspace)} tasks</span>
                          <span>{workspace.columns.length} columns</span>
                        </div>
                        <span>Updated {formatDate(workspace.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first workspace to get started"}
              </p>
              <Button onClick={handleCreateWorkspace}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          )}
        </div>

        <WorkspaceDialog
          open={workspaceDialogOpen}
          onOpenChange={setWorkspaceDialogOpen}
          workspace={editingWorkspace}
          onSave={handleSaveWorkspace}
        />

        {managingWorkspace && (
          <MemberManagementDialog
            open={memberDialogOpen}
            onOpenChange={setMemberDialogOpen}
            workspace={managingWorkspace}
            currentUser={user}
            onUpdateWorkspace={handleUpdateWorkspace}
          />
        )}
      </div>
    </div>
  )
}
