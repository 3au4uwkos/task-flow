"use client"

import type { Column } from "./kanban"
import { initialColumns } from "./kanban"

const STORAGE_KEY = "kanban-tasks"

export function loadTasksFromStorage(): Column[] {
  if (typeof window === "undefined") return initialColumns

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return parsed.map((column: Column) => ({
        ...column,
        tasks: column.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })),
      }))
    }
  } catch (error) {
    console.error("Failed to load tasks from storage:", error)
  }

  return initialColumns
}

export function saveTasksToStorage(columns: Column[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  } catch (error) {
    console.error("Failed to save tasks to storage:", error)
  }
}

export function exportTasks(columns: Column[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    columns,
  }
  return JSON.stringify(exportData, null, 2)
}

export function importTasks(jsonData: string): Column[] | null {
  try {
    const parsed = JSON.parse(jsonData)
    if (parsed.columns && Array.isArray(parsed.columns)) {
      return parsed.columns.map((column: Column) => ({
        ...column,
        tasks: column.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })),
      }))
    }
  } catch (error) {
    console.error("Failed to import tasks:", error)
  }
  return null
}
