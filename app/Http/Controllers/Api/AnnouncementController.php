<?php

namespace App\Http\Controllers\Api;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AnnouncementController extends Controller
{
    /**
     * Get announcements - Public endpoint
     */
    public function index(Request $request)
    {
        $query = Announcement::active();

        // Filter by featured if requested
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Get limit from query params (default 10)
        $limit = $request->integer('limit', 10);

        $announcements = $query
            ->orderBy('created_at', 'desc')
            ->paginate($limit);

        return response()->json($announcements);
    }

    /**
     * Get single announcement - Public endpoint
     */
    public function show($id)
    {
        $announcement = Announcement::where('active', true)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $announcement
        ]);
    }

    /**
     * Create announcement - Admin only
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|string|url',
            'featured' => 'boolean',
            'active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $validated['created_by'] = auth()->id();

        $announcement = Announcement::create($validated);

        return response()->json([
            'data' => $announcement,
            'message' => 'Announcement created successfully'
        ], 201);
    }

    /**
     * Update announcement - Admin only
     */
    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'image_url' => 'nullable|string|url',
            'featured' => 'boolean',
            'active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $validated['updated_by'] = auth()->id();

        $announcement->update($validated);

        return response()->json([
            'data' => $announcement,
            'message' => 'Announcement updated successfully'
        ]);
    }

    /**
     * Delete announcement - Admin only
     */
    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully'
        ]);
    }
}
