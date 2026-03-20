<?php

namespace App\Http\Controllers;

use App\Models\CareerGuidance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class AdminCareerGuidanceController extends Controller
{
    public function index(Request $request)
    {
        $query = CareerGuidance::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('career_field', 'LIKE', "%{$search}%")
                  ->orWhere('career_category', 'LIKE', "%{$search}%")
                  ->orWhere('education_level', 'LIKE', "%{$search}%");
        }

        $guidances = $query->orderBy('id', 'desc')->get();
        return response()->json($guidances);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $guidance = CareerGuidance::create($data);
        return response()->json($guidance, 201);
    }

    public function show($id)
    {
        $guidance = CareerGuidance::findOrFail($id);
        return response()->json($guidance);
    }

    public function update(Request $request, $id)
    {
        $guidance = CareerGuidance::findOrFail($id);
        $data = $request->all();
        $guidance->update($data);
        return response()->json($guidance);
    }

    public function destroy($id)
    {
        $guidance = CareerGuidance::findOrFail($id);
        $guidance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function executeSql(Request $request)
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        $sql = trim($request->input('query'));
        
        // Basic safety check for admin route
        if (stripos($sql, 'drop') !== false || stripos($sql, 'truncate') !== false || stripos($sql, 'alter') !== false) {
             return response()->json(['error' => 'DROP, TRUNCATE, and ALTER commands are disabled for safety.'], 403);
        }

        try {
            if (stripos($sql, 'select') === 0 || stripos($sql, 'show') === 0) {
                // Return result set
                $results = DB::select($sql);
                return response()->json(['type' => 'select', 'data' => $results]);
            } else if (stripos($sql, 'insert') === 0) {
                DB::insert($sql);
                // Can't easily get affected rows for plain insert using raw DB facade without extra steps, return success
                return response()->json(['type' => 'execute', 'message' => 'INSERT query executed successfully.']);
            } else if (stripos($sql, 'delete') === 0) {
                $affected = DB::delete($sql);
                return response()->json(['type' => 'execute', 'affected' => $affected, 'message' => 'DELETE query executed successfully. Rows affected: ' . $affected]);
            } else {
                // Execute UPDATE and return affected rows
                $affected = DB::update($sql);
                return response()->json(['type' => 'execute', 'affected' => $affected, 'message' => 'UPDATE/Query executed successfully. Rows affected: ' . $affected]);
            }
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
