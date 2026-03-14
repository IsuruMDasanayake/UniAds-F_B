<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;

/**
 * @property string $role
 * @property int|null $institute_id
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'gender',
        'birthday',
        'district',
        'education_level',
        'path_preference',
        'al_stream',
        'main_field',
        'interest',
        'study_preference',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];


    public function institute()
    {
        return $this->hasOne(Institute::class);
    }

    public function likedPosts()
    {
        return $this->belongsToMany(Post::class, 'post_likes')->withTimestamps();
    }

    public function postLikes()
    {
        return $this->hasMany(PostLike::class);
    }

    public function conversations()
    {
        return $this->hasManyThrough(Conversation::class, ConversationParticipant::class, 'user_id', 'id', 'id', 'conversation_id');
    }

    public function conversationParticipations()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function followedInstitutes()
    {
        return $this->hasMany(Follower::class);
    }

    public function declinedEvents()
    {
        return $this->belongsToMany(Event::class, 'event_user_declines')->withTimestamps();
    }


    public function hasExpressedInterest($eventId)
    {
        return DB::table('event_interests')
            ->where('event_id', $eventId)
            ->where('user_id', $this->id)
            ->exists();
    }

    public function savedPosts()
    {
        return $this->belongsToMany(Post::class, 'saved_posts', 'student_id', 'post_id')->withTimestamps();
    }

    public function savedRoadmaps()
    {
        return $this->hasMany(UserSavedRoadmap::class);
    }
}
