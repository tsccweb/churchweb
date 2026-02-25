<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Ministries Information ===\n\n";

$ministries = DB::table('ministries')
    ->select('id', 'title', 'thumbnail_url', 'updated_at')
    ->get();

foreach ($ministries as $ministry) {
    echo "Title: {$ministry->title}\n";
    echo "Thumbnail URL: {$ministry->thumbnail_url}\n";
    echo "Updated: {$ministry->updated_at}\n";
    echo "---\n";
}

echo "\n=== Walking in Love Specifically ===\n";
$walking = DB::table('ministries')
    ->where('title', 'like', '%Walking%')
    ->first();

if ($walking) {
    echo "Found: {$walking->title}\n";
    echo "Thumbnail URL: {$walking->thumbnail_url}\n";
    echo "ID: {$walking->id}\n";
} else {
    echo "Not found\n";
}
