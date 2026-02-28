<?php

namespace App\Exports\Institute;

use App\Models\Post;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PostsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $instituteId;
    protected $start;
    protected $end;

    public function __construct($instituteId, $start, $end)
    {
        $this->instituteId = $instituteId;
        $this->start = $start;
        $this->end = $end;
    }

    public function collection()
    {
        return Post::where('institute_id', $this->instituteId)
            ->whereBetween('created_at', [$this->start, $this->end])
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        return [
            'Post Title',
            'Course Name',
            'Course Type',
            'Location',
            'Views',
            'Status',
            'Created Date',
        ];
    }

    public function map($post): array
    {
        return [
            $post->title,
            $post->course_name,
            $post->course_type,
            $post->location,
            $post->view_count,
            $post->status,
            $post->created_at->format('Y-m-d'),
        ];
    }
}
