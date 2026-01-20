<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplyCase extends Model
{
    protected $fillable = [
        'user_id',
        'institute_id',
        'course_title',
        'applied_at',
        'post_id',
    ];

    public $timestamps = true;

    public function post()
{
    return $this->belongsTo(Post::class);
}
    public function user()
{
    return $this->belongsTo(User::class);
}

    public function institute()
{
    return $this->belongsTo(Institute::class);
}

}