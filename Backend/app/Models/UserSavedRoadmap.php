<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSavedRoadmap extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'career_goal',
        'interest',
        'education_level',
        'recommendation_text',
        'real_posts_json'
    ];

    protected $casts = [
        'real_posts_json' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
