<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactedEmail extends Model
{
    protected $fillable = [
        'apply_case_id',
        'institute_id',
        'student_email',
        'subject',
        'message',
        'sent_at',
    ];

    public function applyCase()
    {
        return $this->belongsTo(ApplyCase::class);
    }

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
