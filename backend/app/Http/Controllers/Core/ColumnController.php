<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Services\ColumnService;
use App\Services\WorkSpaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ColumnController extends Controller
{
    public function __construct(
        private ColumnService $columnService,
        private WorkSpaceService $workspaceService
    ) {}

    /**
     * Получить все колонки workspace
     */
    public function index(int $workspaceId): JsonResponse
    {
        try {
            // Проверяем доступ пользователя
            if (!$this->workspaceService->userHasAccess($workspaceId, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $columns = $this->columnService->getByWorkspace($workspaceId);

            return response()->json([
                'columns' => $columns
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch columns'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить колонку с задачами
     */
    public function show(int $id): JsonResponse
    {
        try {
            $column = $this->columnService->findWithTasks($id);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            return response()->json([
                'column' => $column
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Создать колонку в workspace
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Проверяем доступ пользователя к workspace
            if (!$this->workspaceService->userHasAccess($request->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $column = $this->columnService->create($request->all());

            return response()->json([
                'column' => $column,
                'message' => 'Column created successfully'
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Обновить колонку
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $column = $this->columnService->findOrFail($id);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $column = $this->columnService->update($id, $request->all());

            return response()->json([
                'column' => $column,
                'message' => 'Column updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Удалить колонку
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $column = $this->columnService->findOrFail($id);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $this->columnService->delete($id);

            return response()->json([
                'message' => 'Column deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Добавить задачу в колонку
     */
    public function addTask(int $columnId, int $taskId): JsonResponse
    {
        try {
            $column = $this->columnService->findOrFail($columnId);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $column = $this->columnService->addTask($columnId, $taskId);

            return response()->json([
                'column' => $column,
                'message' => 'Task added to column successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column or task not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add task to column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Удалить задачу из колонки
     */
    public function removeTask(int $columnId, int $taskId): JsonResponse
    {
        try {
            $column = $this->columnService->findOrFail($columnId);

            // Проверяем доступ пользователя к workspace колонки
            if (!$this->workspaceService->userHasAccess($column->workspace_id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $column = $this->columnService->removeTask($columnId, $taskId);

            return response()->json([
                'column' => $column,
                'message' => 'Task removed from column successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Column or task not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove task from column'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
