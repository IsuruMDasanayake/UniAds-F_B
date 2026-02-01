<?php

namespace App\Http\Controllers;

use App\Models\TermsAndConditions;
use Illuminate\Http\Request;

class TermsAndConditionsController extends Controller
{
    public function index()
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }

        $termsSections = TermsAndConditions::all();
        return view('admin.terms_and_conditions', compact('termsSections'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $term = TermsAndConditions::findOrFail($id);
        $term->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'Terms & Conditions section updated successfully.');
    }

    public function destroy(string $id)
    {
        $term = TermsAndConditions::findOrFail($id);
        $term->delete();

        return redirect()->back()
            ->with('success', 'Terms & Conditions section deleted successfully.');
    }

    public function show()
    {
        $sections = TermsAndConditions::orderBy('order_index')->get();

        $lastUpdated = TermsAndConditions::orderBy('updated_at', 'desc')->first()?->updated_at;

        return view('frontend.terms_and_conditions', compact('sections', 'lastUpdated'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        TermsAndConditions::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()
            ->with('success', 'New Terms & Conditions section added successfully.');
    }


    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiIndex()
    {
        $termsSections = TermsAndConditions::orderBy('order_index')->get();
        return response()->json($termsSections);
    }

    public function apiStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $term = TermsAndConditions::create([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Terms section added successfully.', 'data' => $term]);
    }

    public function apiUpdate(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_index' => 'nullable|integer',
        ]);

        $term = TermsAndConditions::findOrFail($id);
        $term->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_index' => $request->order_index ?? 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Terms section updated successfully.', 'data' => $term]);
    }

    public function apiDestroy($id)
    {
        $term = TermsAndConditions::findOrFail($id);
        $term->delete();

        return response()->json(['success' => true, 'message' => 'Terms section deleted successfully.']);
    }
}
