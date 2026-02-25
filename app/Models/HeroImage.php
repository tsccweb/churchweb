<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroImage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['title', 'image_url', 'order', 'is_active'];
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
