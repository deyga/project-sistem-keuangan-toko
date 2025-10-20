<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class TransaksiPemasukan extends Model
{
    //
     use HasFactory;

    protected $table = 'transaksi_pemasukan';
    protected $fillable = ['tanggal', 'kategori_id', 'jumlah', 'keterangan', 'user_id'];

    public function kategori()
    {
        return $this->belongsTo(KategoriPemasukan::class, 'kategori_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
