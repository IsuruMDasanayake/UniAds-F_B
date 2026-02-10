<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomingEmail extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'from_email',
        'from_name',
        'body',
        'received_at',
        'is_read'
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'is_read' => 'boolean'
    ];
}
