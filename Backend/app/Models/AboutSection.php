<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'institute_overview',
        'mission',
        'vision',
        'history',
        'chancellor_intro',
        'chancellor_photo',
        'vice_chancellor_intro',
        'vice_chancellor_photo',
        'academic_excellence',
        'academic_images',
        'programs_offered',
        'programs_images',
        'global_partnerships',
        'partnerships_images',
        'life_at_institute',
        'life_images',
        'sports_recreation',
        'sports_images',
        'upcoming_programs',
        'upcoming_images',
        'campus_images',
    ];
    
    
}