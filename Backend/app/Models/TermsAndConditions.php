<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TermsAndConditions extends Model
{
    protected $table = 'terms_and_conditions';
    protected $fillable = ['title', 'content', 'order_index'];
}
