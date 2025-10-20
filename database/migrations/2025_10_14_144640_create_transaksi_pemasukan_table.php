<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_pemasukan', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal'); 
            $table->unsignedBigInteger('kategori_id');
            $table->decimal('jumlah', 15, 2);
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            
            $table->foreign('kategori_id')->references('id')->on('kategori_pemasukan')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_pemasukan');
    }
};

