<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\User;
use App\Models\Institute;
use Illuminate\Support\Facades\DB;

class ChatConversationController extends Controller
{
    /**
     * Get all conversations for the authenticated user/institute
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $instituteId = $request->user()->institute ? $request->user()->institute->id : null;

        $conversations = Conversation::whereHas('participants', function ($query) use ($userId, $instituteId) {
            $query->where(function ($q) use ($userId, $instituteId) {
                $q->where('user_id', $userId)
                    ->orWhere('institute_id', $instituteId);
            })->whereNull('hidden_at');
        })
            ->with(['participants.user', 'participants.institute', 'messages' => function ($q) {
                $q->latest()->take(1);
            }])
            ->withCount(['messages as unread_count' => function ($query) use ($userId, $instituteId) {
                $query->whereDoesntHave('reads', function ($q) use ($userId, $instituteId) {
                    if ($instituteId) {
                        $q->where('institute_id', $instituteId);
                    } else {
                        $q->where('user_id', $userId);
                    }
                })->where(function ($q) use ($userId, $instituteId) {
                    if ($instituteId) {
                        $q->where('sender_institute_id', '!=', $instituteId)->orWhereNull('sender_institute_id');
                    } else {
                        $q->where('sender_user_id', '!=', $userId)->orWhereNull('sender_user_id');
                    }
                });
            }])
            ->get()
            ->map(function ($conversation) use ($userId, $instituteId) {
                // Determine the "other" participant for easy mapping on frontend
                $otherParticipant = $conversation->participants->first(function ($participant) use ($userId, $instituteId) {
                    if ($instituteId) {
                        return $participant->institute_id !== $instituteId;
                    }
                    return $participant->user_id !== $userId;
                });

                $conversation->other_participant = $otherParticipant;
                $conversation->latest_message = $conversation->messages->first();
                unset($conversation->messages); // remove the relation to keep payload clean

                return $conversation;
            });


        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }

    /**
     * Start a new conversation or return existing one
     */
    public function store(Request $request)
    {
        $request->validate([
            'target_type' => 'required|in:user,institute',
            'target_id' => 'required|integer'
        ]);

        $currentUser = $request->user();
        $currentInstitute = $currentUser->institute;

        $targetType = $request->target_type;
        $targetId = $request->target_id;

        // Premium Check - Only premium institutes or a student chatting with premium institute
        if (!$this->isAuthorizedToChat($currentUser, $currentInstitute, $targetType, $targetId)) {
            return response()->json(['message' => 'Unauthorized or premium required.'], 403);
        }

        // Determine participants
        $participant1 = [
            'user_id' => $currentInstitute ? null : $currentUser->id,
            'institute_id' => $currentInstitute ? $currentInstitute->id : null,
            'role' => $currentInstitute ? 'institute' : 'student'
        ];

        $participant2 = [
            'user_id' => $targetType === 'user' ? $targetId : null,
            'institute_id' => $targetType === 'institute' ? $targetId : null,
            'role' => $targetType === 'institute' ? 'institute' : 'student'
        ];

        // Check if conversation already exists
        $existingConversation = $this->findExistingConversation($participant1, $participant2);

        if ($existingConversation) {
            return response()->json([
                'status' => 'success',
                'data' => $existingConversation->load(['participants.user', 'participants.institute'])
            ]);
        }

        // Create new conversation
        DB::beginTransaction();
        try {
            $type = ($participant1['role'] === 'student' || $participant2['role'] === 'student')
                ? 'student_institute'
                : 'institute_institute';

            $conversation = Conversation::create(['type' => $type]);

            $conversation->participants()->createMany([$participant1, $participant2]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $conversation->load(['participants.user', 'participants.institute'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to start conversation'], 500);
        }
    }

    private function findExistingConversation($p1, $p2)
    {
        return Conversation::whereHas('participants', function ($query) use ($p1) {
            $query->where('user_id', $p1['user_id'])
                ->where('institute_id', $p1['institute_id']);
        })->whereHas('participants', function ($query) use ($p2) {
            $query->where('user_id', $p2['user_id'])
                ->where('institute_id', $p2['institute_id']);
        })->first();
    }

    private function isAuthorizedToChat($user, $institute, $targetType, $targetId)
    {
        // Require initiator institute to be premium if they are the one starting it
        if ($institute && !$institute->is_premium) {
            return false;
        }

        // 1. If initiator is a Student
        if (!$institute) {
            // Student can only chat with Premium Institute
            if ($targetType !== 'institute') return false;

            $targetInstitute = Institute::find($targetId);
            return $targetInstitute && $targetInstitute->is_premium;
        }

        // 2. If initiator is an Institute (already checked initiator is premium above)
        // Can chat with Students
        if ($targetType === 'user') return true;

        // Can chat with other PREMIUM institutes
        if ($targetType === 'institute') {
            $targetInstitute = Institute::find($targetId);
            return $targetInstitute && $targetInstitute->is_premium;
        }

        return false;
    }

    /**
     * Hide a conversation for the current user/institute (one-sided delete)
     */
    public function destroy(Request $request, $conversationId)
    {
        $userId = $request->user()->id;
        $instituteId = $request->user()->institute ? $request->user()->institute->id : null;

        $participant = ConversationParticipant::where('conversation_id', $conversationId)
            ->where(function ($q) use ($userId, $instituteId) {
                if ($instituteId) {
                    $q->where('institute_id', $instituteId);
                } else {
                    $q->where('user_id', $userId);
                }
            })
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $participant->update(['hidden_at' => now()]);

        return response()->json(['status' => 'success', 'message' => 'Conversation hidden']);
    }
}
