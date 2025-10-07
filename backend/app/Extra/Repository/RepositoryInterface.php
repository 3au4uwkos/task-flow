<?php

namespace App\Extra\Repository;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface RepositoryInterface
{
    /**
     * Получить все записи
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Получить запись по ID
     */
    public function find(int $id, array $columns = ['*']): ?Model;

    /**
     * Получить запись по ID или выбросить исключение
     */
    public function findOrFail(int $id, array $columns = ['*']): Model;

    /**
     * Получить первую запись по условию
     */
    public function firstWhere(array $conditions, array $columns = ['*']): ?Model;

    /**
     * Получить записи по условию
     */
    public function getWhere(array $conditions, array $columns = ['*']): Collection;

    /**
     * Пагинация
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Создать запись
     */
    public function create(array $data): Model;

    /**
     * Обновить запись
     */
    public function update(Model $model, array $data): bool;

    /**
     * Удалить запись
     */
    public function delete(Model $model): bool;

    /**
     * Удалить запись по ID
     */
    public function deleteById(int $id): bool;

    /**
     * Получить количество записей
     */
    public function count(): int;

    /**
     * Получить количество записей по условию
     */
    public function countWhere(array $conditions): int;
}
