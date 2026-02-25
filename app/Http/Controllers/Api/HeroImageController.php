<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroImage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class HeroImageController extends Controller
{
    private function ensureFullUrl($heroImage)
    {
        if ($heroImage->image_url && strpos($heroImage->image_url, 'http') !== 0 && strpos($heroImage->image_url, '/storage/') === 0) {
            $heroImage->image_url = url($heroImage->image_url);
        }
        return $heroImage;
    }

    public function index()
    {
        $images = HeroImage::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(fn($img) => $this->ensureFullUrl($img));
        
        return response()->json(['data' => $images]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $path = $file->store('hero', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        $validated['order'] = $validated['order'] ?? HeroImage::max('order') + 1 ?? 0;

        $heroImage = HeroImage::create($validated);

        return response()->json($this->ensureFullUrl($heroImage), Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $heroImage = HeroImage::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image_file')) {
            if ($heroImage->image_url && strpos($heroImage->image_url, '/storage/hero/') !== false) {
                $urlPath = $heroImage->image_url;
                if (strpos($urlPath, 'http') === 0) {
                    $urlPath = parse_url($urlPath, PHP_URL_PATH);
                }
                $oldPath = str_replace('/storage/', '', $urlPath);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('image_file');
            $path = $file->store('hero', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        $heroImage->update($validated);

        return response()->json($this->ensureFullUrl($heroImage));
    }

    public function destroy($id)
    {
        $heroImage = HeroImage::findOrFail($id);

        if ($heroImage->image_url && strpos($heroImage->image_url, '/storage/hero/') !== false) {
            $urlPath = $heroImage->image_url;
            if (strpos($urlPath, 'http') === 0) {
                $urlPath = parse_url($urlPath, PHP_URL_PATH);
            }
            $oldPath = str_replace('/storage/', '', $urlPath);
            Storage::disk('public')->delete($oldPath);
        }

        $heroImage->delete();

        return response()->json(['message' => 'Hero image deleted successfully']);
    }
}
