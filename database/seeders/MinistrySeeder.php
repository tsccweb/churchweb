<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MinistrySeeder extends Seeder
{
    public function run(): void
    {
        // Get first user or create test user
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'id' => Str::uuid(),
                'name' => 'Admin User',
                'email' => 'admin@local.test',
                'password' => bcrypt('password'),
            ]);
        }

        $userId = $user->id;

        // Sample ministries (sermons)
        $ministries = [
            [
                'id' => Str::uuid(),
                'title' => 'The Power of Faith',
                'description' => 'Discover how faith can transform your life and overcome any obstacle through trust in God\'s plan.',
                'speaker' => 'Pastor John',
                'category_id' => null,
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'audio_url' => null,
                'sermon_date' => now()->subDays(7)->toDateString(),
                'thumbnail_url' => 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=500&fit=crop',
                'views' => 245,
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Walking in Love',
                'description' => 'Learn how to love others as Jesus commanded and build stronger relationships in your community.',
                'speaker' => 'Pastor Sarah',
                'category_id' => null,
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'audio_url' => null,
                'sermon_date' => now()->subDays(14)->toDateString(),
                'thumbnail_url' => 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500&h=500&fit=crop',
                'views' => 189,
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'God\'s Promises for Today',
                'description' => 'Explore the promises God has made to you and how to stand on them with confidence and faith.',
                'speaker' => 'Pastor Michael',
                'category_id' => null,
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'audio_url' => null,
                'sermon_date' => now()->subDays(21)->toDateString(),
                'thumbnail_url' => 'https://images.unsplash.com/photo-1502224561671-9af43208cde8?w=500&h=500&fit=crop',
                'views' => 312,
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Breaking Free from Bondage',
                'description' => 'Find freedom from the chains that hold you back spiritually and emotionally through Christ\'s power.',
                'speaker' => 'Pastor John',
                'category_id' => null,
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'audio_url' => null,
                'sermon_date' => now()->subDays(28)->toDateString(),
                'thumbnail_url' => 'https://images.unsplash.com/photo-1501881761169-e2113bcd987f?w=500&h=500&fit=crop',
                'views' => 156,
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert into ministries table
        DB::table('ministries')->insert($ministries);
    }
}

