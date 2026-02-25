<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventRsvp extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = ['event_id', 'name', 'email', 'attendees_count', 'status'];

    protected $keyType = 'string';
    public $incrementing = false;

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
