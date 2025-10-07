<?php

namespace App\Services;

use App\Extra\Service\AbstractService;
use App\Models\Core\Column;
use App\Repositories\ColumnRepository;
use Illuminate\Validation\ValidationException;

class ColumnService extends AbstractService
{
    public function __construct(ColumnRepository $repository)
    {
        parent::__construct($repository);
    }

    public function validateCreate(array $data): array
    {
        return $this->validate($data, [
            'name' => 'required|string|max:255',
            'colour' => 'required|string|max:7',
            'workspace_id' => 'required|exists:work_spaces,id',
        ]);
    }

    public function validateUpdate(array $data, int $id): array
    {
        return $this->validate($data, [
            'name' => 'sometimes|string|max:255',
            'colour' => 'sometimes|string|max:7',
            'workspace_id' => 'sometimes|exists:work_spaces,id',
        ]);
    }

    public function prepareCreateData(array $data): array
    {
        return $data;
    }

    public function prepareUpdateData(array $data, int $id): array
    {
        return $data;
    }

    /**
     * Получить колонки по workspace
     */
    public function getByWorkspace(int $workspaceId)
    {
        return $this->repository->getByWorkspace($workspaceId);
    }

    /**
     * Получить колонку с задачами
     */
    public function findWithTasks(int $columnId)
    {
        return $this->repository->findWithTasks($columnId);
    }

    /**
     * Создать колонку с задачами
     */
    public function createWithTasks(array $data, array $taskIds = []): Column
    {
        $column = $this->create($data);

        if (!empty($taskIds)) {
            $column->tasks()->attach($taskIds);
        }

        return $column->load(['tasks', 'workspace']);
    }

    /**
     * Обновить колонку с задачами
     */
    public function updateWithTasks(int $id, array $data, array $taskIds = null): \Illuminate\Database\Eloquent\Model
    {
        $column = $this->update($id, $data);

        if ($taskIds !== null) {
            $column->tasks()->sync($taskIds);
        }

        return $column->load(['tasks', 'workspace']);
    }

    /**
     * Добавить задачу в колонку
     */
    public function addTask(int $columnId, int $taskId): \Illuminate\Database\Eloquent\Model
    {
        $column = $this->findOrFail($columnId);
        $column->tasks()->syncWithoutDetaching([$taskId]);

        return $column->load(['tasks', 'workspace']);
    }

    /**
     * Удалить задачу из колонки
     */
    public function removeTask(int $columnId, int $taskId): \Illuminate\Database\Eloquent\Model
    {
        $column = $this->findOrFail($columnId);
        $column->tasks()->detach($taskId);

        return $column->load(['tasks', 'workspace']);
    }
}
