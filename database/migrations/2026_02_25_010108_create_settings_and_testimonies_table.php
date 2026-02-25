<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('description')->nullable();
            $table->enum('group', ['general', 'email', 'payment', 'appearance', 'security'])->default('general');
            $table->timestamps();
        });

        Schema::create('testimonies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('author_name');
            $table->text('content');
            $table->string('author_image')->nullable();
            $table->string('position')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('active')->default(true);
            $table->uuid('created_by');
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonies');
        Schema::dropIfExists('settings');
    }
};
