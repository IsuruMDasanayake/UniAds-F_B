<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplyCase extends Model
{
    protected $fillable = [
        'user_id',
        'institute_id',
        'post_id',
        'course_title',
        'student_name',
        'student_email',
        'student_phone',
        'message',
        'status',
        'applied_at',
        'viewed_at',
        'contacted_at',
    ];

    public $timestamps = true;

    public function contactedEmails()
    {
        return $this->hasMany(ContactedEmail::class);
    }

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
