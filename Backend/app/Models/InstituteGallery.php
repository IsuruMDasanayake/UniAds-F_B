<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstituteGallery extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'institute_gallery';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'institute_id',
        'image_path',
    ];

    /**
     * Get the institute that owns the gallery image.
     */
    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}

