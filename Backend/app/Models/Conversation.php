<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ConversationParticipant;
use App\Models\Message;

class Conversation extends Model
{
    protected $fillable = ['type'];

    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
