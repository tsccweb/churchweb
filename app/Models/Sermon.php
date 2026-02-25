<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SermonCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug', 'description'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function sermons(): HasMany
    {
        return $this->hasMany(Sermon::class, 'category_id');
    }
}

class Sermon extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

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
        return $this->belongsTo(SermonCategory::class);
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
