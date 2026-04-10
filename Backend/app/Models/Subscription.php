<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subscription extends Model
{
    use HasFactory;

    protected $table = 'subscriptions';

    protected $fillable = [
        'institute_id',
        'gateway_subscription_id',
        'plan',
        'is_trial',
        'status',
        'started_at',
        'ends_at',
        'cancelled_at',
        'cancel_reason',
        'note',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_trial' => 'boolean',
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
