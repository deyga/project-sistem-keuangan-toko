<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->decimal('jumlah', 15, 2);
            $table->date('tanggal');
            $table->text('keterangan');
            $table->unsignedBigInteger('kategori_id');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('tanggal_pengajuan');
            $table->dateTime('tanggal_approval')->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();

           //  Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kategori_id')->references('id')->on('kategori_pengeluaran')->onDelete('cascade');
            //tanpa foreign key

            // $table->index('user_id');
            // $table->index('kategori_id');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_requests');
    }
};

