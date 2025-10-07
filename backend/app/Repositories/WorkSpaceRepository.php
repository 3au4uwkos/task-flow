<?php

namespace App\Repositories;

use App\Extra\Repository\AbstractRepository;
use App\Models\Core\WorkSpace;

class WorkSpaceRepository extends AbstractRepository
{
    public function __construct(WorkSpace $model)
    {
        parent::__construct($model);
    }

    /**
     * Получить workspace по автору
     */
    public function getByAuthor(int $authorId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("by_author:{$authorId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($authorId, $columns) {
            return $this->model->newQuery()
                ->where('author_id', $authorId)
                ->with(['columns.tasks'])
                ->get($columns);
        });
    }

    /**
     * Получить публичные workspace
     */
    public function getPublicWorkspaces(array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey('public:' . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($columns) {
            return $this->model->newQuery()
                ->whereHas('accessType', function ($query) {
                    $query->where('name', 'public');
                })
                ->with(['author', 'columns.tasks'])
                ->get($columns);
        });
    }

    /**
     * Получить workspace с полной информацией
     */
    public function findWithDetails(int $workspaceId, array $columns = ['*'])
    {
        $cacheKey = $this->getCacheKey("with_details:{$workspaceId}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($workspaceId, $columns) {
            return $this->model->newQuery()
                ->with([
                    'author',
                    'accessType',
                    'columns.tasks.user'
                ])
                ->findOrFail($workspaceId, $columns);
        });
    }
}
