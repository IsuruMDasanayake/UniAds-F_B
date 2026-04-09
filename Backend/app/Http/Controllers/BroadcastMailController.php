<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BroadcastMail;
use App\Models\User;
use App\Models\Institute;
use App\Jobs\SendBroadcastMailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Services\AdminActivityLogger;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;
use Illuminate\Support\Facades\DB;


class BroadcastMailController extends Controller
{
    use ApiResponse;

    /**
     * Get available filter options for users and institutes
     */
    public function getFilterOptions()
    {
        return $this->success([
            'users' => [
                'districts' => [
                    "Colombo",
                    "Gampaha",
                    "Kalutara",
                    "Kandy",
                    "Matale",
                    "Nuwara Eliya",
                    "Galle",
                    "Matara",
                    "Hambantota",
                    "Jaffna",
                    "Kilinochchi",
                    "Mannar",
                    "Vavuniya",
                    "Mullaitivu",
                    "Batticaloa",
                    "Ampara",
                    "Trincomalee",
                    "Kurunegala",
                    "Puttalam",
                    "Anuradhapura",
                    "Polonnaruwa",
                    "Badulla",
                    "Monaragala",
                    "Ratnapura",
                    "Kegalle"
                ],
                'education_levels' => [
                    "O/L Student",
                    "A/L Student",
                    "Undergraduate",
                    "Postgraduate",
                    "Other"
                ],
                'age_groups' => [
                    "Under 18",
                    "18-22",
                    "23-30",
                    "30+"
                ],
                'genders' => ['Male', 'Female', 'Other']
            ],
            'institutes' => [
                'statuses' => ['Approved', 'Unapproved'],
                'premium_options' => ['Premium', 'Non-premium']
            ]
        ]);
    }

    /**
     * Get basic institute list for selection
     */
    public function getInstituteList()
    {
        $institutes = Institute::select('id', 'institute_name as name', 'email', 'status', 'is_premium', 'profile_photo')
            ->orderBy('institute_name')
            ->get()
            ->map(function ($inst) {
                if ($inst->profile_photo) {
                    $inst->profile_photo = url('/storage/' . $inst->profile_photo);
                }
                return $inst;
            });

        return $this->successResponse($institutes);
    }

    /**
     * Get recipient count based on filters
     */
    public function getRecipientCount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'target_type' => 'required|in:users,institutes',
            'recipient_email' => 'nullable|email',
            'filters' => 'nullable|array',
            'selected_institutes' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }


        $targetType = $request->target_type;
        $recipientEmail = $request->recipient_email;
        $filters = $request->filters ?? [];
        $selectedInstitutes = $request->selected_institutes ?? [];

        $count = $this->getRecipientsCount($targetType, $recipientEmail, $filters, $selectedInstitutes);

        return $this->success(['count' => $count]);
    }

    /**
     * Preview recipients based on filters
     */
    public function previewRecipients(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'target_type' => 'required|in:users,institutes',
            'recipient_email' => 'nullable|email',
            'filters' => 'nullable|array',
            'selected_institutes' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }


        $targetType = $request->target_type;
        $recipientEmail = $request->recipient_email;
        $filters = $request->filters ?? [];
        $selectedInstitutes = $request->selected_institutes ?? [];

        // Priority 1: Single email
        if (!empty($recipientEmail)) {
            if ($targetType === 'users') {
                $user = User::where('email', $recipientEmail)->first();
                if ($user) {
                    return $this->success([
                        'count' => 1,
                        'sample' => [[
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'district' => $user->district,
                            'avatar' => $user->profile_picture ? url('/storage/' . $user->profile_picture) : null
                        ]]
                    ]);
                }
            }
            return $this->success(['count' => 0, 'sample' => []]);
        }


        // Priority 2: Selected institutes
        if ($targetType === 'institutes' && !empty($selectedInstitutes)) {
            $institutes = Institute::whereIn('id', $selectedInstitutes)->get();
            $count = $institutes->count();
            $sample = $institutes->take(10)->map(function ($inst) {
                return [
                    'id' => $inst->id,
                    'name' => $inst->institute_name,
                    'email' => $inst->email,
                    'location' => $inst->location,
                    'avatar' => $inst->profile_photo ? url('/storage/' . $inst->profile_photo) : null
                ];
            });

            return $this->success([
                'count' => $count,
                'sample' => $sample
            ]);
        }


        // Priority 3: Apply filters
        $query = $this->buildRecipientQuery($targetType, $filters, $selectedInstitutes);

        $count = $query->count();
        $sample = $query->limit(10)->get()->map(function ($recipient) use ($targetType) {
            if ($targetType === 'users') {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->name,
                    'email' => $recipient->email,
                    'district' => $recipient->district,
                    'avatar' => $recipient->profile_picture ? url('/storage/' . $recipient->profile_picture) : null
                ];
            } else {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->institute_name,
                    'email' => $recipient->email,
                    'location' => $recipient->location,
                    'avatar' => $recipient->profile_photo ? url('/storage/' . $recipient->profile_photo) : null
                ];
            }
        });

        return $this->success([
            'count' => $count,
            'sample' => $sample
        ]);
    }

    /**
     * Send broadcast mail
     */
    public function sendMail(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'target_type' => 'required|in:users,institutes',
                'recipient_email' => 'nullable|email',
                'filters' => 'nullable|array',
                'selected_institutes' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $targetType = $request->target_type;
            $recipientEmail = $request->recipient_email;
            $filters = $request->filters ?? [];
            $selectedInstitutes = $request->selected_institutes ?? [];

            // Count first using the lightweight COUNT query — no collection loaded.
            $recipientCount = $this->getRecipientsCount($targetType, $recipientEmail, $filters, $selectedInstitutes);

            if ($recipientCount === 0) {
                return $this->error('No recipients found matching the criteria', 400);
            }

            $sanitizedTitle = Purifier::clean($request->title);
            $sanitizedMessage = Purifier::clean($request->message);

            // Create broadcast mail record
            $broadcastMail = BroadcastMail::create([
                'title' => $sanitizedTitle,
                'message' => $sanitizedMessage,
                'target_type' => $targetType,
                'recipient_count' => $recipientCount,
                'created_by' => auth()->id()
            ]);

            // Stream recipients via query-builder chunk() — only 200 rows in RAM at a time.
            // This replaces the old getRecipients()->get() call that loaded the entire
            // collection into the PHP heap before iterating.
            if (!empty($recipientEmail) && $targetType === 'users') {
                // Single-address path: one direct query, no chunking needed.
                $recipient = User::where('email', $recipientEmail)->first();
                if ($recipient) {
                    SendBroadcastMailJob::dispatch(
                        $sanitizedTitle,
                        $sanitizedMessage,
                        $recipient->email,
                        $recipient->name
                    );
                }
            } else {
                // Bulk path: use query-builder chunk() so Laravel issues
                // SELECT ... LIMIT 200 OFFSET n queries instead of one giant SELECT.
                $this->buildRecipientQuery($targetType, $filters, $selectedInstitutes)
                    ->chunk(200, function ($chunk) use ($sanitizedTitle, $sanitizedMessage, $targetType) {
                        foreach ($chunk as $recipient) {
                            $name = $targetType === 'users'
                                ? $recipient->name
                                : $recipient->institute_name;

                            SendBroadcastMailJob::dispatch(
                                $sanitizedTitle,
                                $sanitizedMessage,
                                $recipient->email,
                                $name
                            );
                        }
                    });
            }

            AdminActivityLogger::log(
                'Sent Broadcast Mail',
                'BroadcastMail',
                $broadcastMail->id,
                auth()->user()->name . " sent a broadcast email \"{$sanitizedTitle}\" to {$recipientCount} recipients"
            );

            return $this->success([
                'broadcast_id' => $broadcastMail->id,
                'recipient_count' => $recipientCount
            ], "Broadcast email queued successfully! Sending to {$recipientCount} recipients.");
        });
    }


    /**
     * Get broadcast mail history
     */
    public function getHistory()
    {
        $history = BroadcastMail::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return $this->successResponse($history);
    }

    /**
     * Get recipients count
     */
    private function getRecipientsCount($targetType, $recipientEmail, $filters, $selectedInstitutes)
    {
        // Priority 1: Single email
        if (!empty($recipientEmail)) {
            if ($targetType === 'users') {
                return User::where('email', $recipientEmail)->exists() ? 1 : 0;
            }
            return 0;
        }

        // Priority 2: Selected institutes
        if ($targetType === 'institutes' && !empty($selectedInstitutes)) {
            return Institute::whereIn('id', $selectedInstitutes)->count();
        }

        // Priority 3: Apply filters
        $query = $this->buildRecipientQuery($targetType, $filters, $selectedInstitutes);
        return $query->count();
    }

    /**
     * Build recipient query based on target type and filters
     */
    private function buildRecipientQuery($targetType, $filters, $selectedInstitutes)
    {
        if ($targetType === 'users') {
            $query = User::query()->where('role', '!=', 'Admin');

            // Districts filter (checkbox multi-select)
            if (!empty($filters['districts'])) {
                $query->whereIn('district', $filters['districts']);
            }

            // Education level filter (checkbox multi-select)
            if (!empty($filters['education_levels'])) {
                $query->whereIn('education_level', $filters['education_levels']);
            }

            // Gender filter (checkbox multi-select)
            if (!empty($filters['genders'])) {
                $query->whereIn('gender', $filters['genders']);
            }

            // Age group filter (checkbox multi-select)
            if (!empty($filters['age_groups'])) {
                $query->where(function ($q) use ($filters) {
                    foreach ($filters['age_groups'] as $ageGroup) {
                        $ageRange = $this->getAgeRange($ageGroup);
                        if ($ageRange) {
                            $q->orWhereBetween('birthday', [$ageRange['start'], $ageRange['end']]);
                        }
                    }
                });
            }
        } else { // institutes
            $query = Institute::query();

            // Status filter (checkbox multi-select)
            if (!empty($filters['statuses'])) {
                $statuses = [];
                foreach ($filters['statuses'] as $status) {
                    if ($status === 'Approved') {
                        $statuses[] = 'approved';
                    } elseif ($status === 'Unapproved') {
                        $statuses[] = 'pending';
                        $statuses[] = 'rejected';
                    }
                }
                if (!empty($statuses)) {
                    $query->whereIn('status', $statuses);
                }
            }

            // Premium filter (checkbox multi-select)
            if (!empty($filters['premium_options'])) {
                $query->where(function ($q) use ($filters) {
                    foreach ($filters['premium_options'] as $option) {
                        if ($option === 'Premium') {
                            $q->orWhere('is_premium', true);
                        } elseif ($option === 'Non-premium') {
                            $q->orWhere('is_premium', false);
                        }
                    }
                });
            }
        }

        return $query;
    }

    /**
     * Convert age group string to date range
     */
    private function getAgeRange($ageGroup)
    {
        $now = Carbon::now();

        switch ($ageGroup) {
            case 'Under 18':
                return [
                    'start' => $now->copy()->subYears(18)->startOfYear(),
                    'end' => $now->copy()->subYears(0)->endOfYear()
                ];
            case '18-22':
                return [
                    'start' => $now->copy()->subYears(22)->startOfYear(),
                    'end' => $now->copy()->subYears(18)->endOfYear()
                ];
            case '23-30':
                return [
                    'start' => $now->copy()->subYears(30)->startOfYear(),
                    'end' => $now->copy()->subYears(23)->endOfYear()
                ];
            case '30+':
                return [
                    'start' => $now->copy()->subYears(100)->startOfYear(),
                    'end' => $now->copy()->subYears(30)->endOfYear()
                ];
            default:
                return null;
        }
    }
}
