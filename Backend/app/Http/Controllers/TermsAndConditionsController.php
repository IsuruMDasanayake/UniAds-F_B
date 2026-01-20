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
            'content' => $request->content,
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
        'content' => $request->content,
        'order_index' => $request->order_index ?? 0,
    ]);

    return redirect()->back()
        ->with('success', 'New Terms & Conditions section added successfully.');
}

}
