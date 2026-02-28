<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstituteActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'user_id',
        'action_type',
        'description',
        'category',
        'subject_type',
        'subject_id',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
