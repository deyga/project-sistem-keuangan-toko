<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_emails', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_user_id');
            $table->unsignedBigInteger('to_user_id');
            $table->string('subject');
            $table->text('body');
            $table->enum('type', ['approval_request', 'approval_response', 'general'])->default('general');
            $table->unsignedBigInteger('approval_request_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->nullable();
            $table->timestamps();

        
            $table->index('from_user_id');
            $table->index('to_user_id');
            $table->index('approval_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_emails');
    }
};