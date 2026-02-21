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
            $query->where('user_id', $userId)
                ->orWhere('institute_id', $instituteId);
        })
            ->with(['participants.user', 'participants.institute', 'messages' => function ($q) {
                $q->latest()->take(1);
            }])
            ->get()
            ->map(function ($conversation) use ($userId, $instituteId) {
                // Determine the "other" participant for easy mapping on frontend
                $otherParticipant = $conversation->participants->first(function ($participant) use ($userId, $instituteId) {
                    return $participant->user_id !== $userId && $participant->institute_id !== $instituteId;
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
        // Add premium/authorization logic here based on requirements
        // E.g. Check if either side is a premium institute
        $isInitiatorPremium = $institute && $institute->is_premium && $institute->premium_expires_at > now();

        $targetInstitute = $targetType === 'institute' ? Institute::find($targetId) : null;
        $isTargetPremium = $targetInstitute && $targetInstitute->is_premium && $targetInstitute->premium_expires_at > now();

        // Allow if at least one side is a premium institute
        // (Assuming student-to-student is not allowed based on structure)
        return $isInitiatorPremium || $isTargetPremium;
    }
}
