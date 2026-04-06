<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Standard success response.
     *
     * All responses follow a consistent structure:
     *   { "success": true, "message": "...", "data": <payload> }
     *
     * - null data:   { success, message }
     * - List:        { success, message, data: [...] }
     * - Paginator:   { success, message, data: { current_page, data: [...], next_page_url, ... } }
     * - Model/Obj:   { success, message, data: { id, name, ... } }
     */
    protected function success($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        if ($data === null) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ], $code);
        }

        // Convert to array if Arrayable (Models, Collections, Paginators)
        $processedData = ($data instanceof \Illuminate\Contracts\Support\Arrayable) ? $data->toArray() : $data;

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $processedData,
        ], $code);
    }

    /**
     * Standard success response (alias for success)
     */
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return $this->success($data, $message, $code);
    }

    /**
     * Standard error response
     */
    protected function error(string $message = 'Error', int $code = 400, $errors = null, ?string $correlationId = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ];

        if ($correlationId) {
            $response['correlation_id'] = $correlationId;
        }

        return response()->json($response, $code);
    }

    /**
     * Standard validation error response
     */
    protected function validationError($errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->error($message, 422, $errors);
    }
}
