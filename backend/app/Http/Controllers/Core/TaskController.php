<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Services\ColumnService;
use App\Services\TaskService;
use App\Services\WorkSpaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private WorkSpaceService $workspaceService,
        private ColumnService $columnService
    ) {}

    /**
     * Получить все задачи пользователя
     */
    public function index(): JsonResponse
    {
        try {
            $tasks = $this->taskService->getByUser(auth()->id());

            return response()->json([
                'tasks' => $tasks
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch tasks'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить задачу
     */
    public function show(int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findOrFail($id);

            // Проверяем доступ пользователя к задаче
            if (!$this->hasTaskAccess($task)) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            return response()->json([
                'task' => $task->load(['columns.workspace', 'user'])
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch task'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Создать задачу с привязкой к колонкам
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Проверяем доступ пользователя ко всем колонкам
            if (isset($request->column_ids)) {
                foreach ($request->column_ids as $columnId) {
                    $column = $this->columnService->findOrFail($columnId);
                    if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                        return response()->json([
                            'message' => 'Access denied to one or more columns'
                        ], Response::HTTP_FORBIDDEN);
                    }
                }
            }

            $task = $this->taskService->createWithColumns($request->all());

            return response()->json([
                'task' => $task,
                'message' => 'Task created successfully'
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create task'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Обновить задачу
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findOrFail($id);

            // Проверяем доступ пользователя к задаче
            if (!$this->hasTaskAccess($task)) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            // Проверяем доступ пользователя к новым колонкам
            if (isset($request->column_ids)) {
                foreach ($request->column_ids as $columnId) {
                    $column = $this->columnService->findOrFail($columnId);
                    if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                        return response()->json([
                            'message' => 'Access denied to one or more columns'
                        ], Response::HTTP_FORBIDDEN);
                    }
                }
            }

            $task = $this->taskService->updateWithColumns($id, $request->all());

            return response()->json([
                'task' => $task,
                'message' => 'Task updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update task'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Удалить задачу
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findOrFail($id);

            // Проверяем доступ пользователя к задаче
            if (!$this->hasTaskAccess($task)) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $this->taskService->delete($id);

            return response()->json([
                'message' => 'Task deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete task'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Переместить задачу в другую колонку
     */
    public function move(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'column_id' => 'required|exists:columns,id'
            ]);

            $task = $this->taskService->findOrFail($id);
            $column = $this->columnService->findOrFail($request->column_id);

            // Проверяем доступ пользователя к задаче и колонке
            if (!$this->hasTaskAccess($task) ||
                !$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $task = $this->taskService->moveToColumn($id, $request->column_id);

            return response()->json([
                'task' => $task,
                'message' => 'Task moved successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task or column not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to move task'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить задачи по workspace
     */
    public function byWorkspace(int $workspaceId): JsonResponse
    {
        try {
            // Проверяем доступ пользователя к workspace
            if (!$this->workspaceService->userHasAccess($workspaceId, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $tasks = $this->taskService->getByWorkspace($workspaceId);

            return response()->json([
                'tasks' => $tasks
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch tasks'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить задачи по колонке
     */
    public function byColumn(int $columnId): JsonResponse
    {
        try {
            $column = $this->columnService->findOrFail($columnId);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $tasks = $this->taskService->getByColumn($columnId);

            return response()->json([
                'tasks' => $tasks
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch tasks'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Проверить доступ пользователя к задаче
     */
    private function hasTaskAccess($task): bool
    {
        // Владелец задачи имеет доступ
        if ($task->user_id === auth()->id()) {
            return true;
        }

        // Проверяем доступ через workspace колонок задачи
        foreach ($task->columns as $column) {
            if ($this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return true;
            }
        }

        return false;
    }
}
