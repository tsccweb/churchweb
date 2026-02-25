<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
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

        // Sample events
        $events = [
            [
                'id' => Str::uuid(),
                'title' => 'Sunday Worship Service',
                'description' => 'Join us for our main weekly worship service featuring inspiring music, worship, and teaching from God\'s Word.',
                'location' => 'Main Sanctuary',
                'start_date' => now()->addDays(3)->setTime(10, 0),
                'end_date' => now()->addDays(3)->setTime(11, 30),
                'image_url' => 'https://images.unsplash.com/photo-1516214104703-3d5333f3566b?w=500&h=500&fit=crop',
                'featured' => true,
                'status' => 'published',
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Bible Study & Prayer Meeting',
                'description' => 'Deepen your understanding of Scripture and grow in prayer. All are welcome to join us for this enriching fellowship.',
                'location' => 'Fellowship Room',
                'start_date' => now()->addDays(5)->setTime(19, 0),
                'end_date' => now()->addDays(5)->setTime(20, 30),
                'image_url' => 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
                'featured' => false,
                'status' => 'published',
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Youth Group Gathering',
                'description' => 'Fun activities, games, discussions, and spiritual growth for our young people. Bring your friends!',
                'location' => 'Youth Center',
                'start_date' => now()->addDays(7)->setTime(18, 0),
                'end_date' => now()->addDays(7)->setTime(20, 0),
                'image_url' => 'https://images.unsplash.com/photo-1517994712202-14819c9cb6e3?w=500&h=500&fit=crop',
                'featured' => true,
                'status' => 'published',
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Community Service Day',
                'description' => 'Get involved in serving our community! We\'ll be helping with local needs and making a difference together.',
                'location' => 'Community Center',
                'start_date' => now()->addDays(10)->setTime(9, 0),
                'end_date' => now()->addDays(10)->setTime(12, 0),
                'image_url' => 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=500&fit=crop',
                'featured' => false,
                'status' => 'published',
                'created_by' => $userId,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert into events table
        DB::table('events')->insert($events);
    }
}
