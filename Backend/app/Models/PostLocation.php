<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostLocation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'post_id',
        'location',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
