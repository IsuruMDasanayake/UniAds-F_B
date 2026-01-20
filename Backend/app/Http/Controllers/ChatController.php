<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Models\Institute;

class ChatController extends Controller
{
     // Send a message
     public function sendMessage(Request $request)
     {
         $request->validate([
             'message' => 'required|string|max:255',
             'receiver_id' => 'required|exists:users,id',
         ]);
 
         $sender = Auth::user();
         $receiver = User::find($request->receiver_id);
 
         // Check if a chat session exists between the sender and receiver
         $chat = Chat::where(function($query) use ($sender, $receiver) {
             $query->where('user1_id', $sender->id)
                   ->where('user2_id', $receiver->id);
         })->orWhere(function($query) use ($sender, $receiver) {
             $query->where('user1_id', $receiver->id)
                   ->where('user2_id', $sender->id);
         })->first();
 
         // If no chat session exists, create a new one
         if (!$chat) {
             $chat = Chat::create([
                 'user1_id' => $sender->id,
                 'user2_id' => $receiver->id
             ]);
         }
 
         // Create and store the message
         $message = Message::create([
             'chat_id' => $chat->id,
             'sender_id' => $sender->id,
             'message' => $request->message
         ]);
 
         // Update last_message_at timestamp for the chat
         $chat->update(['last_message_at' => now()]);
 
         return response()->json($message);
     }
 
     // Get messages for a specific chat session
     public function getMessages($receiver_id)
     {
         $sender = Auth::user();
         
         // Get or create the chat session
         $chat = Chat::where(function($query) use ($sender, $receiver_id) {
             $query->where('user1_id', $sender->id)
                   ->where('user2_id', $receiver_id);
         })->orWhere(function($query) use ($sender, $receiver_id) {
             $query->where('user1_id', $receiver_id)
                   ->where('user2_id', $sender->id);
         })->first();
 
         if ($chat) {
             // Retrieve the messages in the chat session
             $messages = Message::where('chat_id', $chat->id)->get();
             return response()->json(['messages' => $messages]);
         }
 
         return response()->json(['messages' => []]);  // No messages if no chat session
     }
}