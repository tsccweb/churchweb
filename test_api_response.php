<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ContactMessage;

// Simulate the getSubscribers controller method
$limit = 20;
$subscribers = ContactMessage::where('status', 'newsletter')
    ->orderBy('created_at', 'desc')
    ->paginate($limit);

echo "Response structure:\n";
echo json_encode($subscribers, JSON_PRETTY_PRINT) . "\n";
