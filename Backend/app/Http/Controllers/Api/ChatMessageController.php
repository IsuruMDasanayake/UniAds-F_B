<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageRead;
use Illuminate\Support\Facades\DB;
use App\Events\MessageSent;
use App\Jobs\FetchLinkPreviewJob;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;

class ChatMessageController extends Controller
{
    use ApiResponse;

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
            return $this->error('Unauthorized access to conversation', 403);
        }

        $messages = $conversation->messages()
            ->with(['senderUser', 'senderInstitute', 'reads'])
            ->latest()
            ->paginate(50);

        return $this->success($messages);
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
            return $this->error('Unauthorized', 403);
        }

        // Sanitize message content for XSS using the 'chat' profile (no auto-p)
        $messageContent = Purifier::clean($request->message, 'chat');

        // Basic URL detection
        $type = 'text';
        $linkPreviewData = null;

        // First check for internal post links: http(s)://.../post/{uuid}
        if (preg_match('/https?:\/\/[^\s]+\/post\/([a-fA-F0-9\-]+)/', $messageContent, $postMatch)) {
            $postUuid = $postMatch[1];
            $post = \App\Models\Post::where('share_link', $postUuid)->first();

            if (!$post) {
                return $this->error('Invalid post link.', 422);
            }

            $type = 'link';

            $linkPreviewData = [
                'is_internal_post' => true,
                'url' => $postMatch[0],
                'title' => $post->title,
                'description' => $post->small_description,
                'image' => $post->image ? url('storage/' . $post->image) : null,
                'post_id' => $post->id,
                'institute_id' => $post->institute_id,
            ];

            // Clear the actual text so the bubble ONLY shows the preview card
            $messageContent = '';
        } else {
            // General external link: detect only — preview fetched asynchronously.
            // The job performs SSRF validation before making any outbound request.
            preg_match_all('/https?:\/\/[^\s]+/', $messageContent, $matches);
            if (!empty($matches[0])) {
                $type = 'link';
                // link_preview_data starts null; the job fills it in after save.
            }
        }

        // Capture detected URL outside the closure for post-transaction dispatch
        $externalUrl = (!empty($matches[0]) && $type === 'link' && $linkPreviewData === null)
            ? $matches[0][0]
            : null;

        return DB::transaction(function () use ($conversation, $institute, $user, $messageContent, $type, $linkPreviewData, $externalUrl) {
            $message = $conversation->messages()->create([
                'sender_user_id'     => $institute ? null : $user->id,
                'sender_institute_id' => $institute ? $institute->id : null,
                'message'            => $messageContent,
                'type'               => $type,
                'link_preview_data'  => $linkPreviewData   // null for external links initially
            ]);

            $message->load(['senderUser', 'senderInstitute']);

            // Broadcast immediately so the sender sees the message right away
            broadcast(new MessageSent($message))->toOthers();

            // Dispatch the preview job AFTER the transaction commits so the
            // worker can find the message row. SSRF validation happens inside.
            if ($externalUrl) {
                FetchLinkPreviewJob::dispatch($message->id, $externalUrl);
            }

            return $this->success($message, 'Message sent successfully', 201);
        });
    }

    /**
     * Mark conversation messages as read
     */
    public function markRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $institute = $user->institute;

        return DB::transaction(function () use ($user, $institute, $conversation) {
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

            return $this->success(null, count($readData) . ' messages marked as read.');
        });
    }

}



