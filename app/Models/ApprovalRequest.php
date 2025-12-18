<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jumlah',
        'tanggal',
        'keterangan',
        'kategori_id',
        'status',
        'tanggal_pengajuan',
        'tanggal_approval',
        'alasan_penolakan'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tanggal_pengajuan' => 'datetime',
        'tanggal_approval' => 'datetime',
        'jumlah' => 'decimal:2'
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Relasi ke Kategori
    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_id', 'id');
    }
}
