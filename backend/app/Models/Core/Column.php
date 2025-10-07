<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Column extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'colour',
        'workspace_id',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(WorkSpace::class);
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_column')
            ->withTimestamps();
    }
}
