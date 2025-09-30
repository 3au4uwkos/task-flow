<?php

namespace App\Providers;

use App\Services\TaskService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TaskService::class, function ($app) {
            return new TaskService($app->make(TaskRepository::class));
        });

        $this->app->bind(ColumnService::class, function ($app) {
            return new ColumnService($app->make(ColumnRepository::class));
        });

        $this->app->bind(WorkSpaceService::class, function ($app) {
            return new WorkSpaceService($app->make(WorkSpaceRepository::class));
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
