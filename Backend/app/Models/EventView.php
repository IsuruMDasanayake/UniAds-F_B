<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventView extends Model
{
    protected $fillable = ['user_id', 'event_id', 'viewed_at', 'ip_address', 'unique_key'];
    public $timestamps = true;

    public function event()
    {
        return $this->belongsTo(\App\Models\Event::class);
    }
}
