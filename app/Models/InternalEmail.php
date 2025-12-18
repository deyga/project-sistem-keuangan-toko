<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalEmail extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'subject',
        'body',
        'type',
        'approval_request_id',
        'is_read',
        'status',
        'deleted_by_sender',    
        'deleted_by_receiver' 
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'deleted_by_sender' => 'boolean',    
        'deleted_by_receiver' => 'boolean'
    ];

    // Relasi ke User 
    public function sender()
    {
        return $this->belongsTo(User::class, 'from_user_id', 'id');
    }

    // Relasi ke kasir
    public function receiver()
    {
        return $this->belongsTo(User::class, 'to_user_id', 'id');
    }

    // Relasi ke ApprovalRequest
    public function approvalRequest()
    {
        return $this->belongsTo(ApprovalRequest::class, 'approval_request_id');
    }
}