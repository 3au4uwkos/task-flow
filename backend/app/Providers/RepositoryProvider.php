<?php

namespace App\Providers;

use App\Repositories\ColumnRepository;
use App\Repositories\TaskRepository;
use App\Repositories\WorkSpaceRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TaskRepository::class, function ($app) {
            return new TaskRepository($app->make(\App\Models\Core\Task::class));
        });

        $this->app->bind(ColumnRepository::class, function ($app) {
            return new ColumnRepository($app->make(\App\Models\Core\Column::class));
        });

        $this->app->bind(WorkSpaceRepository::class, function ($app) {
            return new WorkSpaceRepository($app->make(\App\Models\Core\WorkSpace::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
