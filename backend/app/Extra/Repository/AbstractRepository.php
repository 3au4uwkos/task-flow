<?php

namespace App\Extra\Repository;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

abstract class AbstractRepository implements RepositoryInterface
{
    protected Model $model;
    protected int $cacheTtl = 3600;
    protected string $cachePrefix;
    protected bool $useCache = true;

    public function __construct(Model $model)
    {
        $this->model = $model;
        $this->cachePrefix = strtolower(class_basename($model)) . ':';
    }

    /**
     * Включить/выключить кэширование
     */
    public function withCache(bool $useCache = true): self
    {
        $this->useCache = $useCache;
        return $this;
    }

    /**
     * Установить время кэширования
     */
    public function setCacheTtl(int $seconds): self
    {
        $this->cacheTtl = $seconds;
        return $this;
    }

    protected function getCacheKey(string $suffix): string
    {
        return $this->cachePrefix . $suffix;
    }

    protected function remember(string $key, \Closure $callback)
    {
        if (!$this->useCache) {
            return $callback();
        }

        return Cache::remember($key, $this->cacheTtl, $callback);
    }

    public function all(array $columns = ['*']): Collection
    {
        $cacheKey = $this->getCacheKey('all:' . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($columns) {
            return $this->model->newQuery()->get($columns);
        });
    }

    public function find(int $id, array $columns = ['*']): ?Model
    {
        $cacheKey = $this->getCacheKey("item:{$id}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($id, $columns) {
            return $this->model->newQuery()->find($id, $columns);
        });
    }

    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        $cacheKey = $this->getCacheKey("item:{$id}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($id, $columns) {
            return $this->model->newQuery()->findOrFail($id, $columns);
        });
    }

    public function firstWhere(array $conditions, array $columns = ['*']): ?Model
    {
        $cacheKey = $this->getCacheKey('first_where:' . md5(serialize([$conditions, $columns])));

        return $this->remember($cacheKey, function () use ($conditions, $columns) {
            return $this->model->newQuery()->where($conditions)->first($columns);
        });
    }

    public function getWhere(array $conditions, array $columns = ['*']): Collection
    {
        $cacheKey = $this->getCacheKey('get_where:' . md5(serialize([$conditions, $columns])));

        return $this->remember($cacheKey, function () use ($conditions, $columns) {
            return $this->model->newQuery()->where($conditions)->get($columns);
        });
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        $cacheKey = $this->getCacheKey("paginate:{$perPage}:" . md5(serialize($columns)));

        return $this->remember($cacheKey, function () use ($perPage, $columns) {
            return $this->model->newQuery()->paginate($perPage, $columns);
        });
    }

    public function create(array $data): Model
    {
        $model = $this->model->newQuery()->create($data);
        $this->invalidateCache();
        return $model;
    }

    public function update(Model $model, array $data): bool
    {
        $result = $model->update($data);

        if ($result) {
            $this->invalidateCache();
            $this->invalidateModelCache($model->id);
        }

        return $result;
    }

    public function delete(Model $model): bool
    {
        $result = $model->delete();

        if ($result) {
            $this->invalidateCache();
            $this->invalidateModelCache($model->id);
        }

        return $result;
    }

    public function deleteById(int $id): bool
    {
        $model = $this->find($id);
        return $model ? $this->delete($model) : false;
    }

    public function count(): int
    {
        $cacheKey = $this->getCacheKey('count');

        return $this->remember($cacheKey, function () {
            return $this->model->newQuery()->count();
        });
    }

    public function countWhere(array $conditions): int
    {
        $cacheKey = $this->getCacheKey('count_where:' . md5(serialize($conditions)));

        return $this->remember($cacheKey, function () use ($conditions) {
            return $this->model->newQuery()->where($conditions)->count();
        });
    }

    public function query(): Builder
    {
        return $this->model->newQuery();
    }

    /**
     * Инвалидировать весь кэш для этой модели
     */
    protected function invalidateCache(): void
    {
        if ($this->useCache) {
            Cache::tags([$this->cachePrefix])->flush();
        }
    }

    /**
     * Инвалидировать кэш конкретной модели
     */
    protected function invalidateModelCache(int $modelId): void
    {
        if ($this->useCache) {
            Cache::forget($this->getCacheKey("item:{$modelId}"));
        }
    }

    /**
     * Очистить весь кэш репозитория
     */
    public function clearCache(): void
    {
        $this->invalidateCache();
    }
}
