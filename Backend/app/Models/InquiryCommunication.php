<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryCommunication extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'institute_inquiry_id',
        'subject',
        'message',
        'sent_at',
    ];

    public function inquiry()
    {
        return $this->belongsTo(InstituteInquiry::class, 'institute_inquiry_id');
    }

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
