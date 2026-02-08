<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BroadcastMail extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'target_type',
        'filters_json',
        'manual_recipients',
        'recipient_count',
        'created_by',
    ];

    protected $casts = [
        'filters_json' => 'array',
        'manual_recipients' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the admin user who created this broadcast.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
