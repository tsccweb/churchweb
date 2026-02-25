<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$count = DB::table('contact_messages')->where('status', 'newsletter')->count();
echo "Total newsletter subscribers: $count\n";

$subscribers = DB::table('contact_messages')->where('status', 'newsletter')->get(['email', 'status', 'created_at']);

foreach ($subscribers as $subscriber) {
    echo "- {$subscriber->email} (created: {$subscriber->created_at})\n";
}
