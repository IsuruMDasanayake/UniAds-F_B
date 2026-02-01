<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Cashier\Billable;

class Institute extends Model
{
    use HasFactory, Billable;

    protected $fillable = [
        'institute_name',
        'location',
        'gov_register_number',
        'email',
        'website',
        'contact_number',
        'profile_photo',
        'cover_photo',
        'bio',
        'password',
        'user_id',
        'is_premium',
        'premium_expires_at',
        'trial_status',
        'trial_expires_at',
        'trial_cancelled_at',
        'followers_enabled',
        'reviews_enabled',
        'profile_views',
    ];

    protected $appends = ['average_rating', 'rating_count'];

    public function getAverageRatingAttribute()
    {
        return round($this->averageRating(), 1);
    }

    public function getRatingCountAttribute()
    {
        return $this->ratingCount();
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function gallery()
    {
        return $this->hasMany(InstituteGallery::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function chats()
    {
        return $this->hasMany(Chat::class, 'user2_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function followers()
    {
        return $this->hasMany(Follower::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function averageRating()
    {
        return $this->ratings()->avg('rating');
    }

    public function ratingCount()
    {
        return $this->ratings()->count();
    }

    protected $casts = [
        'followers_enabled' => 'boolean',
        'reviews_enabled' => 'boolean',
    ];

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
}
