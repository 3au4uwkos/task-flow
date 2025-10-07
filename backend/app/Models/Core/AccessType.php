<?php

namespace App\Models\Core;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

enum AccessType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';

    /**
     * Получить ID типа доступа из базы данных
     */
    public function getId(): ?int
    {
        return Cache::remember("access_type:{$this->value}", 3600, function () {
            return DB::table('access_types')
                ->where('name', $this->value)
                ->value('id');
        });
    }

    /**
     * Получить ID типа доступа по строковому значению
     */
    public static function getIdByName(string $name): ?int
    {
        $type = self::tryFrom($name);
        return $type?->getId();
    }

    /**
     * Получить описание типа доступа
     */
    public function description(): string
    {
        return match($this) {
            self::PUBLIC => 'Public access - visible to everyone',
            self::PRIVATE => 'Private access - visible only to owner',
        };
    }

    /**
     * Очистить кеш для этого типа доступа
     */
    public function clearCache(): void
    {
        Cache::forget("access_type:{$this->value}");
    }

    /**
     * Очистить весь кеш типов доступа
     */
    public static function clearAllCache(): void
    {
        foreach (self::cases() as $case) {
            $case->clearCache();
        }
    }
}
