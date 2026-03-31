<?php

namespace App\Http\Controllers;

use App\Models\PrivacyPolicy;
use App\Models\TermsAndConditions;
use App\Models\RefundPolicy;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;
use Illuminate\Support\Facades\DB;


class PolicyController extends Controller
{
    use ApiResponse;

    //Helper to get model class based on type
    private function getModelClass($type)
    {
        return match ($type) {
            'privacy', 'privacy-policy' => PrivacyPolicy::class,
            'terms', 'terms-conditions' => TermsAndConditions::class,
            'refund', 'refund-policy' => RefundPolicy::class,
            default => null,
        };
    }

    private function getReadableName($type)
    {
        return match ($type) {
            'privacy', 'privacy-policy' => 'Privacy Policy',
            'terms', 'terms-conditions' => 'Terms & Conditions',
            'refund', 'refund-policy' => 'Refund Policy',
            default => 'Policy',
        };
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD (SPA)
    // ==========================================

    public function apiIndex(string $type)
    {
        $modelClass = $this->getModelClass($type);
        if (!$modelClass) return $this->error('Invalid policy type', 404);

        $sections = $modelClass::orderBy('order_index')->get();
        return $this->success($sections);
    }


    public function apiStore(Request $request, string $type)
    {
        $modelClass = $this->getModelClass($type);
        if (!$modelClass) return $this->error('Invalid policy type', 404);


        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($modelClass, $request, $type) {
            $section = $modelClass::create([
                'title' => $request->title,
                'content' => Purifier::clean($request->input('content')),
                'order_index' => $request->order_index ?? 0,
            ]);

            return $this->success($section, $this->getReadableName($type) . ' section added successfully.');
        });
    }


    public function apiUpdate(Request $request, string $type, $id)
    {
        $modelClass = $this->getModelClass($type);
        if (!$modelClass) return $this->error('Invalid policy type', 404);


        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($modelClass, $id, $request, $type) {
            $section = $modelClass::findOrFail($id);
            $section->update([
                'title' => $request->title,
                'content' => Purifier::clean($request->input('content')),
                'order_index' => $request->order_index ?? 0,
            ]);

            return $this->success($section, $this->getReadableName($type) . ' section updated successfully.');
        });
    }


    public function apiDestroy(string $type, $id)
    {
        $modelClass = $this->getModelClass($type);
        if (!$modelClass) return $this->error('Invalid policy type', 404);


        return DB::transaction(function () use ($modelClass, $id, $type) {
            $section = $modelClass::findOrFail($id);
            $section->delete();

            return $this->success(null, $this->getReadableName($type) . ' section deleted successfully.');
        });
    }



    // ==========================================
    // LEGACY ADMIN VIEWS (Optional/Backward Compatibility)
    // ==========================================
    // If you strictly use SPA, these might be removable, but keeping for safety as per existing web.php

    public function adminIndex(string $type)
    {
        if (!auth()->check() || auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }

        $modelClass = $this->getModelClass($type);
        if (!$modelClass) abort(404);

        $data = $modelClass::all();
        // Return view based on type - mapped to original view names
        $viewName = match ($type) {
            'privacy' => 'admin.privacy_policy',
            'terms' => 'admin.terms_and_conditions',
            'refund' => 'admin.refund_policy',
            default => abort(404)
        };

        // Pass data with variable name expected by view
        $viewData = match ($type) {
            'privacy' => ['privacyPolicySections' => $data],
            'terms' => ['termsSections' => $data],
            'refund' => ['refundSections' => $data],
            default => []
        };

        return view($viewName, $viewData);
    }
}
