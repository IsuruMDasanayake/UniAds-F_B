<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_name',
        'slug',
        'institute_type',
        'location',
        'gov_register_number',
        'email',
        'website',
        'contact_number',
        'profile_photo',
        'cover_photo',
        'logo',
        'bio',
        'password',
        'user_id',
        'is_premium',
        'premium_expires_at',
        'trial_status',
        'trial_expires_at',
        'trial_cancelled_at',
        'trial_cancel_reason',
        'followers_enabled',
        'reviews_enabled',
        'chat_enabled',
        'inquiries_enabled',
        'applications_enabled',
        'latitude',
        'longitude',
        'profile_views',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($institute) {
            if (empty($institute->slug)) {
                $institute->slug = \Illuminate\Support\Str::slug($institute->institute_name);
            }
        });

        static::updating(function ($institute) {
            if (empty($institute->slug)) {
                $institute->slug = \Illuminate\Support\Str::slug($institute->institute_name);
            }
        });
    }

    protected $appends = ['average_rating', 'rating_count', 'logo_url'];

    public function getAverageRatingAttribute()
    {
        return round($this->averageRating(), 1);
    }

    public function getRatingCountAttribute()
    {
        return $this->ratingCount();
    }
    
    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
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

    public function conversations()
    {
        return $this->hasManyThrough(Conversation::class, ConversationParticipant::class, 'institute_id', 'id', 'id', 'conversation_id');
    }

    public function conversationParticipations()
    {
        return $this->hasMany(ConversationParticipant::class);
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
        'is_premium' => 'boolean',
        'followers_enabled' => 'boolean',
        'reviews_enabled' => 'boolean',
        'chat_enabled' => 'boolean',
        'inquiries_enabled' => 'boolean',
        'applications_enabled' => 'boolean',
    ];

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
}
