<?php

namespace App\Http\Controllers;

use App\Models\CareerGuidance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Traits\ApiResponse;

class AdminCareerGuidanceController extends Controller
{
    use ApiResponse;
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
        return $this->successResponse($guidances);
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->all();
            $guidance = CareerGuidance::create($data);
            return $this->success($guidance, 'Career guidance created successfully', 201);
        });
    }


    public function show($id)
    {
        $guidance = CareerGuidance::findOrFail($id);
        return $this->success($guidance);
    }


    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $guidance = CareerGuidance::findOrFail($id);
            $data = $request->all();
            $guidance->update($data);
            return $this->success($guidance);
        });
    }


    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $guidance = CareerGuidance::findOrFail($id);
            $guidance->delete();
            return $this->success(null, 'Deleted successfully');
        });
    }


    public function executeSql(Request $request)
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        $sql = trim($request->input('query'));
        
        // Basic safety check for admin route
        if (stripos($sql, 'drop') !== false || stripos($sql, 'truncate') !== false || stripos($sql, 'alter') !== false) {
             return $this->error('DROP, TRUNCATE, and ALTER commands are disabled for safety.', 403);
        }

        try {
            if (stripos($sql, 'select') === 0 || stripos($sql, 'show') === 0) {
                // Return result set
                $results = DB::select($sql);
                return $this->success(['type' => 'select', 'data' => $results]);
            } else if (stripos($sql, 'insert') === 0) {
                DB::insert($sql);
                // Can't easily get affected rows for plain insert using raw DB facade without extra steps, return success
                return $this->success(['type' => 'execute'], 'INSERT query executed successfully.');
            } else if (stripos($sql, 'delete') === 0) {
                $affected = DB::delete($sql);
                return $this->success(['type' => 'execute', 'affected' => $affected], 'DELETE query executed successfully. Rows affected: ' . $affected);
            } else {
                // Execute UPDATE and return affected rows
                $affected = DB::update($sql);
                return $this->success(['type' => 'execute', 'affected' => $affected], 'UPDATE/Query executed successfully. Rows affected: ' . $affected);
            }
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
