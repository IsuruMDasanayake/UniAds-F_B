<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $institute = $user->institute;

    return \App\Models\ConversationParticipant::where('conversation_id', $id)
        ->where(function ($query) use ($user, $institute) {
            $query->where('user_id', $user->id);
            if ($institute) {
                $query->orWhere('institute_id', $institute->id);
            }
        })
        ->exists();
});
