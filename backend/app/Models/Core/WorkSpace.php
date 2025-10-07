<?php

namespace App\Models\Core;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkSpace extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'access_type_id',
        'author_id',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function columns(): HasMany
    {
        return $this->hasMany(Column::class);
    }

    public function tasks()
    {
        return $this->hasManyThrough(Task::class, Column::class);
    }
}
