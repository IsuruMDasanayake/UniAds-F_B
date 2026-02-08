<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'body',
        'target_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
