<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageRead;
use Illuminate\Support\Facades\DB;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Http;

class ChatMessageController extends Controller
{
    /**
     * Get paginated messages for a conversation
     */
    public function index(Request $request, Conversation $conversation)
    {
        // Simple authorization check
        $userId = $request->user()->id;
        $instituteId = $request->user()->institute ? $request->user()->institute->id : null;

        $isParticipant = $conversation->participants()->where(function ($q) use ($userId, $instituteId) {
            $q->where('user_id', $userId)->orWhere('institute_id', $instituteId);
        })->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Unauthorized access to conversation'], 403);
        }

        $messages = $conversation->messages()
            ->with(['senderUser', 'senderInstitute', 'reads'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    /**
     * Send a new message
     */
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $user = $request->user();
        $institute = $user->institute;

        $isParticipant = $conversation->participants()->where(function ($q) use ($user, $institute) {
            $q->where('user_id', $user->id)->orWhere('institute_id', $institute ? $institute->id : null);
        })->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messageContent = $request->message;

        // Basic URL detection
        $type = 'text';
        $linkPreviewData = null;

        preg_match_all('/https?:\/\/[^\s]+/', $messageContent, $matches);
        if (!empty($matches[0])) {
            $type = 'link';
            // Extract metadata for the first link found
            $linkPreviewData = $this->extractLinkMetadata($matches[0][0]);
        }

        $message = $conversation->messages()->create([
            'sender_user_id' => $institute ? null : $user->id,
            'sender_institute_id' => $institute ? $institute->id : null,
            'message' => $messageContent,
            'type' => $type,
            'link_preview_data' => $linkPreviewData
        ]);

        $message->load(['senderUser', 'senderInstitute']);

        // Broadcast the event
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'data' => $message
        ]);
    }

    /**
     * Mark conversation messages as read
     */
    public function markRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $institute = $user->institute;

        // Find unread messages not sent by the current user
        $unreadMessages = $conversation->messages()
            ->where(function ($q) use ($user, $institute) {
                if ($institute) {
                    $q->where('sender_institute_id', '!=', $institute->id)->orWhereNull('sender_institute_id');
                } else {
                    $q->where('sender_user_id', '!=', $user->id)->orWhereNull('sender_user_id');
                }
            })
            ->whereDoesntHave('reads', function ($query) use ($user, $institute) {
                if ($institute) {
                    $query->where('institute_id', $institute->id);
                } else {
                    $query->where('user_id', $user->id);
                }
            })
            ->get();

        $readData = [];
        $now = now();
        foreach ($unreadMessages as $message) {
            $readData[] = [
                'message_id' => $message->id,
                'user_id' => $institute ? null : $user->id,
                'institute_id' => $institute ? $institute->id : null,
                'read_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($readData)) {
            MessageRead::insert($readData);
        }

        return response()->json([
            'status' => 'success',
            'message' => count($readData) . ' messages marked as read.'
        ]);
    }

    /**
     * Helper to extract basic OpenGraph metadata from a URL
     */
    private function extractLinkMetadata($url)
    {
        try {
            $response = Http::timeout(3)->get($url);
            if ($response->successful()) {
                $html = $response->body();

                $title = '';
                $description = '';
                $image = '';

                // Extract Open Graph tags
                if (preg_match('/<meta property="?og:title"? content="([^"]+)"/i', $html, $match)) {
                    $title = $match[1];
                } elseif (preg_match('/<title>([^<]+)<\/title>/i', $html, $match)) {
                    $title = $match[1];
                }

                if (preg_match('/<meta property="?og:description"? content="([^"]+)"/i', $html, $match)) {
                    $description = $match[1];
                } elseif (preg_match('/<meta name="?description"? content="([^"]+)"/i', $html, $match)) {
                    $description = $match[1];
                }

                if (preg_match('/<meta property="?og:image"? content="([^"]+)"/i', $html, $match)) {
                    $image = $match[1];
                }

                return [
                    'url' => $url,
                    'title' => html_entity_decode($title),
                    'description' => html_entity_decode($description),
                    'image' => $image,
                ];
            }
        } catch (\Exception $e) {
            // Silently fail and return minimal data
        }

        return ['url' => $url, 'title' => parse_url($url, PHP_URL_HOST)];
    }
}
