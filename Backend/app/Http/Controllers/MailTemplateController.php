<?php

namespace App\Http\Controllers;

use App\Models\MailTemplate;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class MailTemplateController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MailTemplate::where('is_active', true);

        if ($request->has('target_type') && in_array($request->target_type, ['users', 'institutes'])) {
            $query->where('target_type', $request->target_type);
        }

        $templates = $query->get();

        return $this->success($templates);
    }
}

