<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RefundPolicy;

class RefundPolicyController extends Controller
{
    public function index()
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }

        $refundSections = RefundPolicy::all();
        return view('admin.refund_policy', compact('refundSections'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $refund = RefundPolicy::findOrFail($id);
        $refund->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'Refund Policy section updated successfully.');
    }

    public function destroy(string $id)
    {
        $refund = RefundPolicy::findOrFail($id);
        $refund->delete();

        return redirect()->back()
            ->with('success', 'Refund Policy section deleted successfully.');
    }

    public function show()
    {
        $sections = RefundPolicy::orderBy('order_index')->get();
        $lastUpdated = RefundPolicy::orderBy('updated_at', 'desc')->first()?->updated_at;

        return view('frontend.refund_policy', compact('sections', 'lastUpdated'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        RefundPolicy::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'New Refund Policy section added successfully.');
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiIndex()
    {
        $refundSections = RefundPolicy::orderBy('order_index')->get();
        return response()->json($refundSections);
    }

    public function apiStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $refund = RefundPolicy::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Refund policy section added successfully.', 'data' => $refund]);
    }

    public function apiUpdate(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $refund = RefundPolicy::findOrFail($id);
        $refund->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Refund policy section updated successfully.', 'data' => $refund]);
    }

    public function apiDestroy($id)
    {
        $refund = RefundPolicy::findOrFail($id);
        $refund->delete();

        return response()->json(['success' => true, 'message' => 'Refund policy section deleted successfully.']);
    }
}
