<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionHeroImage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['section', 'image_url', 'title', 'is_active'];
    protected $keyType = 'string';
    public $incrementing = false;
}
