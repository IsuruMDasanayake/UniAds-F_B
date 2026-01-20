<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'institute_id'];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    
}