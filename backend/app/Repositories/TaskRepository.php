<?php

namespace App\Repositories;

use App\Extra\Repository\AbstractRepository;
use App\Models\Core\Task;

class TaskRepository extends AbstractRepository
{
    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    /**
     * Получить задачи по workspace
     */
    public function getByWorkspace(int $workspaceId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("by_workspace:{$workspaceId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($workspaceId, $columns) {
            return $this->model->newQuery()
                ->whereHas('columns.workspace', function ($query) use ($workspaceId) {
                    $query->where('id', $workspaceId);
                })
                ->with(['columns', 'user'])
                ->get($columns);
        });
    }

    /**
     * Получить задачи по колонке
     */
    public function getByColumn(int $columnId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("by_column:{$columnId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($columnId, $columns) {
            return $this->model->newQuery()
                ->whereHas('columns', function ($query) use ($columnId) {
                    $query->where('columns.id', $columnId);
                })
                ->with(['user'])
                ->get($columns);
        });
    }

    /**
     * Получить задачи пользователя
     */
    public function getByUser(int $userId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("by_user:{$userId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($userId, $columns) {
            return $this->model->newQuery()
                ->where('user_id', $userId)
                ->with(['columns.workspace'])
                ->get($columns);
        });
    }
}
