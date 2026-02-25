<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MinistryCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug', 'description'];
    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'sermon_categories';

    public function ministries(): HasMany
    {
        return $this->hasMany(Ministry::class, 'category_id');
    }
}

class Ministry extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'ministries';
    protected $fillable = [
        'title', 'description', 'speaker', 'category_id',
        'video_url', 'audio_url', 'sermon_date', 'thumbnail_url', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'sermon_date' => 'date',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function category(): BelongsTo
    {
        return $this->belongsTo(MinistryCategory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
