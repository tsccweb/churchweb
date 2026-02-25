<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SermonController extends Controller
{
    public function index(Request $request)
    {
        $query = Sermon::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $limit = $request->input('limit', 10);
        $sermons = $query->paginate($limit);

        return response()->json($sermons);
    }

    public function show($id)
    {
        $sermon = Sermon::findOrFail($id);
        return response()->json($sermon);
    }

    public function categories()
    {
        $categories = Sermon::distinct()->pluck('category');
        return response()->json(['categories' => $categories]);
    }

    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json(['data' => []]);
        }

        $sermons = Sermon::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(20)
            ->get();

        return response()->json(['data' => $sermons]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'speaker' => 'required|string|max:255',
            'date' => 'required|date',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'category' => 'nullable|string',
            'transcript' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $sermon = Sermon::create($validated);

        return response()->json($sermon, Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $sermon = Sermon::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'speaker' => 'string|max:255',
            'date' => 'date',
            'video_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'category' => 'nullable|string',
            'transcript' => 'nullable|string',
        ]);

        $validated['updated_by'] = auth()->id();
        $sermon->update($validated);

        return response()->json($sermon);
    }

    public function destroy($id)
    {
        $sermon = Sermon::findOrFail($id);
        $sermon->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
