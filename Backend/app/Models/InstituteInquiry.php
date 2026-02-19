<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstituteInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'name',
        'email',
        'subject',
        'message',
        'status',
        'viewed_at',
        'contacted_at'
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
