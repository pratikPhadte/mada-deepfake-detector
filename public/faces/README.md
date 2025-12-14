# Preset Face Assets

This directory should contain face images for the face swap demo.

## Required Files

For each preset face, you need:
- `{id}.jpg` - Full face image (recommended: 512x512 or larger)
- `{id}-thumb.jpg` - Thumbnail image (recommended: 100x100)

## Current Preset IDs

Based on `FaceSwapEngine.ts`, the following face IDs are expected:

1. `generic-male-1` (Alex)
2. `generic-female-1` (Sarah)
3. `generic-male-2` (Marcus)
4. `generic-female-2` (Emma)

## How to Add Face Images

1. Find royalty-free face images from:
   - [This Person Does Not Exist](https://thispersondoesnotexist.com/) - AI-generated faces
   - [Generated Photos](https://generated.photos/) - AI-generated faces
   - [Unsplash](https://unsplash.com/) - Search for "portrait"

2. Crop the image to focus on the face (include some neck/hair)

3. Save as JPEG with the naming convention above

4. For best results:
   - Face should be front-facing
   - Good lighting, no shadows on face
   - Neutral expression works best
   - Image should be at least 512x512 pixels

## Example Directory Structure

```
faces/
├── README.md (this file)
├── generic-male-1.jpg
├── generic-male-1-thumb.jpg
├── generic-female-1.jpg
├── generic-female-1-thumb.jpg
├── generic-male-2.jpg
├── generic-male-2-thumb.jpg
├── generic-female-2.jpg
└── generic-female-2-thumb.jpg
```

## Quick Start (Placeholder)

For quick testing, you can use any face images. The demo will work with any front-facing portrait image.
