<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'title',
        'small_description',
        'description',
        'image',
        'course_name',
        'course_type',
        'location',
        'duration',
        'course_format',
        'attendance_type',
        'institute_id',
        'view_count',
        'status',
        'is_boosted',
        'boost_expires_at',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    /**
     * Increment the like count.
     */
    public function incrementLikes()
    {
        $this->increment('likes_count');
    }

    /**
     * Increment the views count.
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function views()
    {
        return $this->hasMany(PostView::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function followers()
    {
        return $this->hasMany(Follower::class);
    }

    public function applyCases()
    {
        return $this->hasMany(ApplyCase::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }


    public function savedBy()
    {
        return $this->belongsToMany(User::class, 'saved_posts', 'post_id', 'student_id')->withTimestamps();
    }


}

