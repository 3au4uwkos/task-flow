export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
}

export interface Column {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
  tasks: Task[]
}

export const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    tasks: [
      {
        id: "1",
        title: "Design new landing page",
        description: "Create wireframes and mockups for the new landing page design",
        status: "todo",
        priority: "high",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        title: "Set up database schema",
        description: "Define the database structure for user management and task storage",
        status: "todo",
        priority: "medium",
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-16"),
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    status: "in-progress",
    tasks: [
      {
        id: "3",
        title: "Implement authentication",
        description: "Add user login and registration functionality with proper security",
        status: "in-progress",
        priority: "high",
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-17"),
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    tasks: [
      {
        id: "4",
        title: "Project setup",
        description: "Initialize the project with Next.js, TypeScript, and Tailwind CSS",
        status: "done",
        priority: "medium",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-12"),
      },
      {
        id: "5",
        title: "UI component library",
        description: "Set up shadcn/ui components for consistent design system",
        status: "done",
        priority: "low",
        createdAt: new Date("2024-01-11"),
        updatedAt: new Date("2024-01-13"),
      },
    ],
  },
]

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
