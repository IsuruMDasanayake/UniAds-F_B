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
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_trial' => 'boolean',
        'started_at' => 'date',
        'ends_at' => 'date',
        'cancelled_at' => 'date',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
