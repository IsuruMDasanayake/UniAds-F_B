<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use HasFactory, Searchable;

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
        'share_link',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->share_link)) {
                $post->share_link = (string) Str::uuid();
            }
        });
    }

    public function calculateScore(): float|int
    {
        if ($this->status !== 'active' || !$this->institute) {
            return 0;
        }

        $premiumBonus = $this->institute->is_premium ? 30 : 0;
        $followerBonus = log($this->institute->followers_count + 1) * 10;
        $idBonus = ($this->id % 10) * 0.5;

        return $premiumBonus + $followerBonus + $idBonus;
    }

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'small_description' => $this->small_description,
            'description' => strip_tags($this->description),
            'course_name' => $this->course_name,
            'course_type' => $this->course_type,
            'location' => $this->location,
            'duration' => $this->duration,
            'course_format' => $this->course_format,
            'attendance_type' => $this->attendance_type,
            'status' => $this->status,
            'score_cache' => (int) $this->score_cache,
            'created_at' => $this->created_at ? $this->created_at->timestamp : null,
        ];
    }

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
        return $this->hasMany(PostLike::class);
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
