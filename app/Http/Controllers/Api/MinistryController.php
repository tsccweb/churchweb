<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ministry;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MinistryController extends Controller
{
    private function ensureFullUrl($ministry)
    {
        // If thumbnail_url is a relative path, convert to full URL
        if ($ministry->thumbnail_url && strpos($ministry->thumbnail_url, 'http') !== 0 && strpos($ministry->thumbnail_url, '/storage/') === 0) {
            $ministry->thumbnail_url = url($ministry->thumbnail_url);
        }
        return $ministry;
    }

    public function index(Request $request)
    {
        $query = Ministry::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $limit = $request->input('limit', 10);
        $ministries = $query->paginate($limit);

        // Ensure all URLs are full URLs
        $ministries->getCollection()->transform(function ($ministry) {
            return $this->ensureFullUrl($ministry);
        });

        return response()->json($ministries);
    }

    public function show($id)
    {
        $ministry = Ministry::findOrFail($id);
        return response()->json($this->ensureFullUrl($ministry));
    }

    public function categories()
    {
        $categories = Ministry::distinct()->pluck('category');
        return response()->json(['categories' => $categories]);
    }

    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json(['data' => []]);
        }

        $ministries = Ministry::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(20)
            ->get();

        // Ensure all URLs are full URLs
        $ministries = $ministries->map(function ($ministry) {
            return $this->ensureFullUrl($ministry);
        });

        return response()->json(['data' => $ministries]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'speaker' => 'required|string|max:255',
            'sermon_date' => 'required|date',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'thumbnail_url' => 'nullable|url',
            'thumbnail_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'category' => 'nullable|string',
            'transcript' => 'nullable|string',
        ]);

        // Handle file upload
        if ($request->hasFile('thumbnail_file')) {
            $file = $request->file('thumbnail_file');
            $path = $file->store('ministries', 'public');
            $validated['thumbnail_url'] = url('storage/' . $path);
        }

        $validated['created_by'] = auth()->id();
        $ministry = Ministry::create($validated);

        return response()->json($ministry, Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $ministry = Ministry::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'speaker' => 'required|string|max:255',
            'sermon_date' => 'required|date',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'thumbnail_url' => 'nullable|url',
            'thumbnail_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'category' => 'nullable|string',
            'transcript' => 'nullable|string',
        ]);

        // Handle file upload
        if ($request->hasFile('thumbnail_file')) {
            // Delete old file if exists and is from storage
            if ($ministry->thumbnail_url && strpos($ministry->thumbnail_url, '/storage/ministries/') !== false) {
                // Extract relative path from full URL if needed
                $urlPath = $ministry->thumbnail_url;
                if (strpos($urlPath, 'http') === 0) {
                    // It's a full URL, extract the storage path
                    $urlPath = parse_url($urlPath, PHP_URL_PATH);
                }
                $oldPath = str_replace('/storage/', '', $urlPath);
                Storage::disk('public')->delete($oldPath);
            }
            
            $file = $request->file('thumbnail_file');
            $path = $file->store('ministries', 'public');
            $validated['thumbnail_url'] = url('storage/' . $path);
        }

        $validated['updated_by'] = auth()->id();
        $ministry->update($validated);

        return response()->json($ministry);
    }

    public function destroy($id)
    {
        $ministry = Ministry::findOrFail($id);
        $ministry->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
