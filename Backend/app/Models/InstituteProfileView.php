<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstituteProfileView extends Model
{
    use HasFactory;

    protected $fillable = ['institute_id', 'user_id', 'ip_address', 'viewed_at', 'unique_key'];
    public $timestamps = false;

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
