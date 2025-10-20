<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriPengeluaran extends Model
{
    //
  use HasFactory;

    protected $table = 'kategori_pengeluaran';
    protected $fillable = ['nama_kategori'];

    public function transaksiPengeluaran()
    {
        return $this->hasMany(TransaksiPengeluaran::class, 'kategori_id');
    }

}
