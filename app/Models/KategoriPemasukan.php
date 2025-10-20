<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriPemasukan extends Model
{
    //
  use HasFactory;

    protected $table = 'kategori_pemasukan';
    protected $fillable = ['nama_kategori'];

    public function transaksiPemasukan()
    {
        return $this->hasMany(TransaksiPemasukan::class, 'kategori_id');
    }

}
