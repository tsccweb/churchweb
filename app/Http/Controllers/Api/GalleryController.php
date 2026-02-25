<?php

namespace App\Http\Controllers\Api;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController
{
    /**
     * Get gallery images by section
     */
    public function getBySection($section)
    {
        $images = Gallery::where('section', $section)
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($image) {
                $image->image_url = $this->ensureFullUrl($image->image_url);
                return $image;
            });

        return response()->json(['data' => $images]);
    }

    /**
     * Get all gallery images (admin)
     */
    public function index()
    {
        $images = Gallery::orderBy('section')->orderBy('order')->get()
            ->map(function ($image) {
                $image->image_url = $this->ensureFullUrl($image->image_url);
                return $image;
            });

        return response()->json(['data' => $images]);
    }

    /**
     * Store a new gallery image
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|max:5120',
            'title' => 'nullable|string|max:255',
            'section' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $file = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('gallery/' . $validated['section'], $filename, 'public');

        $gallery = Gallery::create([
            'title' => $validated['title'] ?? null,
            'image_url' => Storage::url($path),
            'section' => $validated['section'],
            'order' => $validated['order'] ?? 0,
            'is_active' => true,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Gallery image uploaded successfully',
            'data' => $this->formatImage($gallery)
        ], 201);
    }

    /**
     * Update gallery image
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'image' => 'nullable|image|max:5120',
            'title' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old file
            if ($gallery->image_url) {
                $oldPath = str_replace(Storage::url(''), '', $gallery->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('gallery/' . $gallery->section, $filename, 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $validated['updated_by'] = auth()->id();
        $gallery->update($validated);

        return response()->json([
            'message' => 'Gallery image updated successfully',
            'data' => $this->formatImage($gallery)
        ]);
    }

    /**
     * Delete gallery image
     */
    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);

        // Delete file
        if ($gallery->image_url) {
            $path = str_replace(Storage::url(''), '', $gallery->image_url);
            Storage::disk('public')->delete($path);
        }

        $gallery->delete();

        return response()->json(['message' => 'Gallery image deleted successfully']);
    }

    /**
     * Helper: Format image URL
     */
    private function formatImage($image)
    {
        $image->image_url = $this->ensureFullUrl($image->image_url);
        return $image;
    }

    /**
     * Helper: Ensure full URL for images
     */
    private function ensureFullUrl($imageUrl)
    {
        if (!$imageUrl) return null;
        if (filter_var($imageUrl, FILTER_VALIDATE_URL)) return $imageUrl;
        return url($imageUrl);
    }
}
