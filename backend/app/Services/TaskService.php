<?php

namespace App\Services;

use App\Extra\Service\AbstractService;
use App\Models\Core\Task;
use App\Repositories\TaskRepository;
use Illuminate\Validation\ValidationException;

class TaskService extends AbstractService
{
    public function __construct(TaskRepository $repository)
    {
        parent::__construct($repository);
    }

    public function validateCreate(array $data): array
    {
        return $this->validate($data, [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'user_id' => 'required|exists:users,id',
            'column_ids' => 'required|array',
            'column_ids.*' => 'exists:columns,id',
        ]);
    }

    public function validateUpdate(array $data, int $id): array
    {
        return $this->validate($data, [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high',
            'column_ids' => 'sometimes|array',
            'column_ids.*' => 'exists:columns,id',
        ]);
    }

    public function prepareCreateData(array $data): array
    {
        // Автоматически устанавливаем текущего пользователя, если не указан
        if (!isset($data['user_id']) && auth()->check()) {
            $data['user_id'] = auth()->id();
        }

        return $data;
    }

    /**
     * Создать задачу с привязкой к колонкам
     */
    public function createWithColumns(array $data): \Illuminate\Database\Eloquent\Model
    {
        $columnIds = $data['column_ids'] ?? [];
        unset($data['column_ids']);

        $task = $this->create($data);

        // Привязываем к колонкам
        if (!empty($columnIds)) {
            $task->columns()->attach($columnIds);
        }

        return $task->load(['columns', 'user']);
    }

    /**
     * Обновить задачу с колонками
     */
    public function updateWithColumns(int $id, array $data): \Illuminate\Database\Eloquent\Model
    {
        $columnIds = $data['column_ids'] ?? null;
        if (isset($data['column_ids'])) {
            unset($data['column_ids']);
        }

        $task = $this->update($id, $data);

        // Обновляем колонки если переданы
        if ($columnIds !== null) {
            $task->columns()->sync($columnIds);
        }

        return $task->load(['columns', 'user']);
    }

    /**
     * Получить задачи по workspace
     */
    public function getByWorkspace(int $workspaceId)
    {
        return $this->repository->getByWorkspace($workspaceId);
    }

    /**
     * Получить задачи по колонке
     */
    public function getByColumn(int $columnId)
    {
        return $this->repository->getByColumn($columnId);
    }

    /**
     * Получить задачи пользователя
     */
    public function getByUser(int $userId)
    {
        return $this->repository->getByUser($userId);
    }

    /**
     * Переместить задачу в другую колонку
     */
    public function moveToColumn(int $taskId, int $columnId): \Illuminate\Database\Eloquent\Model
    {
        $task = $this->findOrFail($taskId);
        $task->columns()->sync([$columnId]);

        return $task->load(['columns', 'user']);
    }
}
