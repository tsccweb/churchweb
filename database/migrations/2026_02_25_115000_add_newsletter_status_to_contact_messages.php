<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            // Drop the old enum column and recreate with additional status
            $table->dropColumn('status');
        });

        Schema::table('contact_messages', function (Blueprint $table) {
            $table->enum('status', ['new', 'read', 'replied', 'archived', 'newsletter'])->default('new')->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('contact_messages', function (Blueprint $table) {
            $table->enum('status', ['new', 'read', 'replied', 'archived'])->default('new')->after('message');
        });
    }
};
