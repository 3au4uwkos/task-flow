<?php

namespace App\Services;

use App\Extra\Service\AbstractService;
use App\Models\Core\WorkSpace;
use App\Repositories\WorkSpaceRepository;
use Illuminate\Validation\ValidationException;

class WorkSpaceService extends AbstractService
{
    public function __construct(WorkSpaceRepository $repository)
    {
        parent::__construct($repository);
    }

    public function validateCreate(array $data): array
    {
        return $this->validate($data, [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'access_type_id' => 'required|exists:access_types,id',
            'author_id' => 'required|exists:users,id',
        ]);
    }

    public function validateUpdate(array $data, int $id): array
    {
        return $this->validate($data, [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'access_type_id' => 'sometimes|exists:access_types,id',
        ]);
    }

    public function prepareCreateData(array $data): array
    {
        // Автоматически устанавливаем текущего пользователя, если не указан
        if (!isset($data['author_id']) && auth()->check()) {
            $data['author_id'] = auth()->id();
        }

        return $data;
    }

    public function prepareUpdateData(array $data, int $id): array
    {
        return $data;
    }

    /**
     * Получить workspace по автору
     */
    public function getByAuthor(int $authorId)
    {
        return $this->repository->getByAuthor($authorId);
    }

    /**
     * Получить публичные workspace
     */
    public function getPublicWorkspaces()
    {
        return $this->repository->getPublicWorkspaces();
    }

    /**
     * Получить workspace с полной информацией
     */
    public function findWithDetails(int $workspaceId)
    {
        return $this->repository->findWithDetails($workspaceId);
    }

    /**
     * Создать workspace с дефолтными колонками
     */
    public function createWithDefaultColumns(array $data): \Illuminate\Database\Eloquent\Model
    {
        $workspace = $this->create($data);

        // Создаем дефолтные колонки
        $defaultColumns = [
            ['name' => 'To Do', 'colour' => '#6366f1'],
            ['name' => 'In Progress', 'colour' => '#f59e0b'],
            ['name' => 'Done', 'colour' => '#10b981'],
        ];

        foreach ($defaultColumns as $columnData) {
            $workspace->columns()->create($columnData);
        }

        return $workspace->load(['columns', 'author', 'accessType']);
    }

    /**
     * Получить workspace текущего пользователя
     */
    public function getCurrentUserWorkspaces()
    {
        if (!auth()->check()) {
            return collect();
        }

        return $this->getByAuthor(auth()->id());
    }

    /**
     * Проверить доступ пользователя к workspace
     */
    public function userHasAccess(int $workspaceId, int $userId): bool
    {
        $workspace = $this->find($workspaceId);

        if (!$workspace) {
            return false;
        }

        // Автор имеет доступ
        if ($workspace->author_id === $userId) {
            return true;
        }

//        // Для публичных workspace любой пользователь имеет доступ
//        if ($workspace->accessType->name === 'public') {
//            return true;
//        }

        return false;
    }
}
