<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Services\WorkSpaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WorkSpaceController extends Controller
{
    public function __construct(
        private WorkSpaceService $workspaceService
    ) {}

    /**
     * Получить все workspace текущего пользователя
     */
    public function index(): JsonResponse
    {
        try {
            $workspaces = $this->workspaceService->getCurrentUserWorkspaces();

            return response()->json([
                'workspaces' => $workspaces
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch workspaces'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить workspace со всеми колонками и задачами
     */
    public function show(int $id): JsonResponse
    {
        try {
            $workspace = $this->workspaceService->findWithDetails($id);

            // Проверяем доступ пользователя
            if (!$this->workspaceService->userHasAccess($id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            return response()->json([
                'workspace' => $workspace
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Workspace not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch workspace'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Создать новый workspace с дефолтными колонками
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $workspace = $this->workspaceService->createWithDefaultColumns($request->all());

            return response()->json([
                'workspace' => $workspace,
                'message' => 'Workspace created successfully'
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create workspace'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Обновить workspace
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            // Проверяем доступ пользователя
            if (!$this->workspaceService->userHasAccess($id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $workspace = $this->workspaceService->update($id, $request->all());

            return response()->json([
                'workspace' => $workspace,
                'message' => 'Workspace updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Workspace not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update workspace'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Удалить workspace
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            // Проверяем доступ пользователя
            if (!$this->workspaceService->userHasAccess($id, auth()->id())) {
                return response()->json([
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }

            $this->workspaceService->delete($id);

            return response()->json([
                'message' => 'Workspace deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Workspace not found'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete workspace'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить публичные workspace
     */
    public function public(): JsonResponse
    {
        try {
            $workspaces = $this->workspaceService->getPublicWorkspaces();

            return response()->json([
                'workspaces' => $workspaces
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch public workspaces'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
