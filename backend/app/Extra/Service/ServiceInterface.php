<?php

namespace App\Extra\Service;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface ServiceInterface
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
     * Пагинация с фильтрами
     */
    public function paginate(array $filters = [], int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Создать запись
     */
    public function create(array $data): Model;

    /**
     * Обновить запись
     */
    public function update(int $id, array $data): Model;

    /**
     * Удалить запись
     */
    public function delete(int $id): bool;

    /**
     * Получить количество записей
     */
    public function count(): int;

    /**
     * Получить количество записей по условию
     */
    public function countWhere(array $conditions): int;

    /**
     * Валидация данных при создании
     */
    public function validateCreate(array $data): array;

    /**
     * Валидация данных при обновлении
     */
    public function validateUpdate(array $data, int $id): array;

    /**
     * Подготовка данных перед созданием
     */
    public function prepareCreateData(array $data): array;

    /**
     * Подготовка данных перед обновлением
     */
    public function prepareUpdateData(array $data, int $id): array;
}
