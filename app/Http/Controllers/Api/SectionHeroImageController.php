<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SectionHeroImage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class SectionHeroImageController extends Controller
{
    public function getBySection($section)
    {
        $heroImage = SectionHeroImage::where('section', $section)
            ->where('is_active', true)
            ->first();

        if ($heroImage && strpos($heroImage->image_url, 'http') !== 0 && strpos($heroImage->image_url, '/storage/') === 0) {
            $heroImage->image_url = url($heroImage->image_url);
        }

        return response()->json($heroImage);
    }

    public function index()
    {
        $images = SectionHeroImage::all()
            ->map(function ($img) {
                if ($img->image_url && strpos($img->image_url, 'http') !== 0 && strpos($img->image_url, '/storage/') === 0) {
                    $img->image_url = url($img->image_url);
                }
                return $img;
            });

        return response()->json(['data' => $images]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'section' => 'required|string',
                'title' => 'nullable|string|max:255',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image_url' => 'nullable|url',
            ]);

            // Ensure at least one image source is provided
            if (empty($validated['image_file']) && empty($validated['image_url'])) {
                return response()->json(['message' => 'Please provide either an image upload or image URL'], 422);
            }

            // Check if section already exists
            $heroImage = SectionHeroImage::where('section', $validated['section'])->first();

            // Handle file upload
            if ($request->hasFile('image_file')) {
                try {
                    $file = $request->file('image_file');
                    $path = $file->store('section-heroes', 'public');
                    $validated['image_url'] = url('storage/' . $path);
                } catch (\Exception $e) {
                    \Log::error('File upload failed: ' . $e->getMessage());
                    // Fall back to URL if file upload fails
                    if (empty($validated['image_url'])) {
                        return response()->json(['message' => 'File upload failed and no URL provided'], 422);
                    }
                }
            }

            if ($heroImage) {
                // Update existing section hero image
                $heroImage->update($validated);
            } else {
                // Create new section hero image
                $heroImage = SectionHeroImage::create($validated);
            }

            return response()->json($heroImage, $heroImage->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
        } catch (\Exception $e) {
            \Log::error('Section hero image upload error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to save hero image: ' . $e->getMessage()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $heroImage = SectionHeroImage::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('image_file')) {
            try {
                $file = $request->file('image_file');
                $path = $file->store('section-heroes', 'public');
                $validated['image_url'] = url('storage/' . $path);
            } catch (\Exception $e) {
                \Log::error('File upload failed in update: ' . $e->getMessage());
                // Don't clear image_url if file upload fails - keep existing image
            }
        }

        $heroImage->update($validated);

        return response()->json($heroImage);
    }

    public function destroy($id)
    {
        $heroImage = SectionHeroImage::findOrFail($id);
        $heroImage->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
