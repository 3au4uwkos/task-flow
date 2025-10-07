<?php

namespace App\Repositories;

use App\Extra\Repository\AbstractRepository;
use App\Models\Core\Column;

class ColumnRepository extends AbstractRepository
{
    public function __construct(Column $model)
    {
        parent::__construct($model);
    }

    /**
     * Получить колонки по workspace
     */
    public function getByWorkspace(int $workspaceId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("by_workspace:{$workspaceId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($workspaceId, $columns) {
            return $this->model->newQuery()
                ->where('workspace_id', $workspaceId)
                ->with(['tasks.user'])
                ->orderBy('created_at')
                ->get($columns);
        });
    }

    /**
     * Получить колонку с задачами
     */
    public function findWithTasks(int $columnId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("with_tasks:{$columnId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($columnId, $columns) {
            return $this->model->newQuery()
                ->with(['tasks.user'])
                ->findOrFail($columnId, $columns);
        });
    }
}
