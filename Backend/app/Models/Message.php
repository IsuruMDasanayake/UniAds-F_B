<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $touches = ['conversation'];

    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'sender_institute_id',
        'message',
        'type',
        'link_preview_data'
    ];

    protected $casts = [
        'link_preview_data' => 'array',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function senderUser()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function senderInstitute()
    {
        return $this->belongsTo(Institute::class, 'sender_institute_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }
}
