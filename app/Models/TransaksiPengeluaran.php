<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiPengeluaran extends Model
{
    //
     use HasFactory;

    protected $table = 'transaksi_pengeluaran';
    protected $fillable = ['tanggal', 'kategori_id', 'jumlah', 'keterangan', 'bukti_file', 'user_id'];

    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


}
