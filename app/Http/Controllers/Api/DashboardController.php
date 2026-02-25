<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Event;
use App\Models\Ministry;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function analytics()
    {
        return response()->json([
            'total_donations' => Donation::where('status', 'completed')->sum('amount'),
            'total_events' => Event::count(),
            'total_ministries' => Ministry::count(),
            'new_messages' => ContactMessage::where('status', 'unread')->count(),
        ]);
    }

    public function donations()
    {
        $byMonth = Donation::where('status', 'completed')
            ->select(DB::raw('DATE_TRUNC(\'month\', created_at) as month, SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $topDonors = Donation::where('status', 'completed')
            ->select('donor_name', DB::raw('SUM(amount) as total'))
            ->groupBy('donor_name')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'by_month' => $byMonth,
            'top_donors' => $topDonors,
            'total' => Donation::where('status', 'completed')->sum('amount'),
        ]);
    }

    public function events()
    {
        $upcoming = Event::where('status', 'published')
            ->where('start_date', '>', now())
            ->count();

        $past = Event::where('status', 'published')
            ->where('start_date', '<', now())
            ->count();

        $featured = Event::where('featured', true)->count();

        return response()->json([
            'upcoming' => $upcoming,
            'past' => $past,
            'featured' => $featured,
            'total' => Event::count(),
        ]);
    }

    public function ministries()
    {
        $byCategory = Ministry::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        return response()->json([
            'by_category' => $byCategory,
            'total' => Ministry::count(),
        ]);
    }
}
