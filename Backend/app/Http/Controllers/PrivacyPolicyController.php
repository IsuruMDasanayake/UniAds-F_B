<?php

namespace App\Http\Controllers;

use App\Models\PrivacyPolicy;

use Illuminate\Http\Request;

class PrivacyPolicyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Redirect to login if not logged in
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }

        // Fetch all privacy policy sections
        $privacyPolicySections = PrivacyPolicy::all();

        // Return the view with the privacy policy data
        return view('admin.privacy_policy', compact('privacyPolicySections'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        PrivacyPolicy::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'Privacy policy section added successfully.');
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $policy = PrivacyPolicy::findOrFail($id);
        $policy->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'Privacy policy section updated successfully.');
    }


    public function destroy(string $id)
    {
        $policy = PrivacyPolicy::findOrFail($id);
        $policy->delete();

        return redirect()->back()
            ->with('success', 'Privacy policy section deleted successfully.');
    }


    public function show()
    {
        // Fetch all sections in order
        $sections = PrivacyPolicy::orderBy('order_index')->get();

        $lastUpdated = PrivacyPolicy::orderBy('updated_at', 'desc')->first()?->updated_at;

        // Return frontend view
        return view('frontend.privacy_policy', compact('sections', 'lastUpdated'));
    }



    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiIndex()
    {
        $privacyPolicySections = PrivacyPolicy::orderBy('order_index')->get();
        return response()->json($privacyPolicySections);
    }

    public function apiStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $policy = PrivacyPolicy::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Privacy policy section added successfully.', 'data' => $policy]);
    }

    public function apiUpdate(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $policy = PrivacyPolicy::findOrFail($id);
        $policy->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Privacy policy section updated successfully.', 'data' => $policy]);
    }

    public function apiDestroy($id)
    {
        $policy = PrivacyPolicy::findOrFail($id);
        $policy->delete();

        return response()->json(['success' => true, 'message' => 'Privacy policy section deleted successfully.']);
    }
}
