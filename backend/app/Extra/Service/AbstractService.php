<?php

namespace App\Extra\Service;

use App\Extra\Repository\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

abstract class AbstractService implements ServiceInterface
{
    /**
     * Репозиторий для работы с данными
     */
    protected RepositoryInterface $repository;

    public function __construct(RepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Получить все записи
     */
    public function all(array $columns = ['*']): Collection
    {
        return $this->repository->all($columns);
    }

    /**
     * Получить запись по ID
     */
    public function find(int $id, array $columns = ['*']): ?Model
    {
        return $this->repository->find($id, $columns);
    }

    /**
     * Получить запись по ID или выбросить исключение
     */
    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->repository->findOrFail($id, $columns);
    }

    /**
     * Получить первую запись по условию
     */
    public function firstWhere(array $conditions, array $columns = ['*']): ?Model
    {
        return $this->repository->firstWhere($conditions, $columns);
    }

    /**
     * Получить записи по условию
     */
    public function getWhere(array $conditions, array $columns = ['*']): Collection
    {
        return $this->repository->getWhere($conditions, $columns);
    }

    /**
     * Пагинация с фильтрами
     */
    public function paginate(array $filters = [], int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        // Базовая реализация - можно переопределить в дочерних классах
        return $this->repository->paginate($perPage, $columns);
    }

    /**
     * Создать запись
     */
    public function create(array $data): Model
    {
        // Валидация
        $validatedData = $this->validateCreate($data);

        // Подготовка данных
        $preparedData = $this->prepareCreateData($validatedData);

        // Создание
        return $this->repository->create($preparedData);
    }

    /**
     * Обновить запись
     */
    public function update(int $id, array $data): Model
    {
        $model = $this->findOrFail($id);

        // Валидация
        $validatedData = $this->validateUpdate($data, $id);

        // Подготовка данных
        $preparedData = $this->prepareUpdateData($validatedData, $id);

        // Обновление
        $this->repository->update($model, $preparedData);

        return $model->fresh();
    }

    /**
     * Удалить запись
     */
    public function delete(int $id): bool
    {
        $model = $this->findOrFail($id);
        return $this->repository->delete($model);
    }

    /**
     * Получить количество записей
     */
    public function count(): int
    {
        return $this->repository->count();
    }

    /**
     * Получить количество записей по условию
     */
    public function countWhere(array $conditions): int
    {
        return $this->repository->countWhere($conditions);
    }

    /**
     * Валидация данных при создании
     */
    public function validateCreate(array $data): array
    {
        // Базовая реализация - возвращает данные без валидации
        // Переопределить в дочерних классах
        return $data;
    }

    /**
     * Валидация данных при обновлении
     */
    public function validateUpdate(array $data, int $id): array
    {
        // Базовая реализация - возвращает данные без валидации
        // Переопределить в дочерних классах
        return $data;
    }

    /**
     * Подготовка данных перед созданием
     */
    public function prepareCreateData(array $data): array
    {
        // Базовая реализация - возвращает данные без изменений
        // Переопределить в дочерних классах
        return $data;
    }

    /**
     * Подготовка данных перед обновлением
     */
    public function prepareUpdateData(array $data, int $id): array
    {
        // Базовая реализация - возвращает данные без изменений
        // Переопределить в дочерних классах
        return $data;
    }

    /**
     * Валидация с помощью Validator
     */
    protected function validate(array $data, array $rules, array $messages = []): array
    {
        $validator = Validator::make($data, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }
}
