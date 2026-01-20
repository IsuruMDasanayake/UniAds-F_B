<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_title',
        'event_image',
        'event_description',
        'event_date',
        'sub_location',
        'main_location',
        'institute_id',
        'interested_count',
        'view_count',
        'is_active', // New field to indicate if the event is active
        'decline_count', // New field to track declined interest
    ];

    // Relationship to Institute
    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    // Cast event_date as a date
    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function declinedByUsers()
    {
        return $this->belongsToMany(User::class, 'event_user_declines')->withTimestamps();
    }

    public function views()
    {
        return $this->hasMany(EventView::class);
    }
}
