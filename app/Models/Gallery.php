<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GalleryCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug'];
    protected $keyType = 'string';
    public $incrementing = false;

    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class, 'category_id');
    }
}

class Gallery extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'gallery';

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'section',
        'order',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
