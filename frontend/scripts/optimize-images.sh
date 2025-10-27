#!/bin/bash

set -e

cd "$(dirname "$0")/../public"

echo "🖼️  Image optimization script"
echo "==============================="
echo ""

# Function to convert SVG to PNG and WebP
convert_og_image() {
  local svg_file=$1
  local base_name=$(basename "$svg_file" .svg)

  echo "📸 Converting $svg_file..."

  # Remove symlink if exists
  rm -f "${base_name}.png"

  # Convert SVG to PNG 1200x630
  ffmpeg -i "$svg_file" \
    -vf "scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2" \
    -y "${base_name}.png" 2>&1 | grep -v "deprecated" | tail -2 || true

  # Convert PNG to WebP (quality 85)
  ffmpeg -i "${base_name}.png" \
    -c:v libwebp -quality 85 \
    -y "${base_name}.webp" 2>&1 | grep -v "deprecated" | tail -2 || true

  local png_size=$(du -h "${base_name}.png" | cut -f1)
  local webp_size=$(du -h "${base_name}.webp" | cut -f1)

  echo "  ✅ ${base_name}.png: $png_size"
  echo "  ✅ ${base_name}.webp: $webp_size"
  echo ""
}

# Convert all OG images
echo "🔄 Converting OpenGraph images..."
echo ""

convert_og_image "og-homepage.svg"
convert_og_image "og-countries.svg"
convert_og_image "og-tools.svg"
convert_og_image "og-blog.svg"

# Optimize ultimo-card.png
echo "🎴 Optimizing ultimo-card.png..."

if [ -f "cards/ultimo-card.png" ]; then
  original_size=$(du -h "cards/ultimo-card.png" | cut -f1)
  echo "  Original: $original_size"

  # Create WebP version (quality 85)
  ffmpeg -i "cards/ultimo-card.png" \
    -c:v libwebp -quality 85 \
    -y "cards/ultimo-card.webp" 2>&1 | grep -v "deprecated" | tail -2 || true

  # Create optimized PNG with lower compression
  ffmpeg -i "cards/ultimo-card.png" \
    -compression_level 9 \
    -y "cards/ultimo-card-optimized.png" 2>&1 | grep -v "deprecated" | tail -2 || true

  # Replace original with optimized version
  mv "cards/ultimo-card-optimized.png" "cards/ultimo-card.png"

  optimized_size=$(du -h "cards/ultimo-card.png" | cut -f1)
  webp_size=$(du -h "cards/ultimo-card.webp" | cut -f1)

  echo "  ✅ ultimo-card.png: $optimized_size"
  echo "  ✅ ultimo-card.webp: $webp_size"
  echo ""
fi

# Remove temp file if exists
rm -f og-homepage-temp.png

echo "✨ Image optimization complete!"
echo ""
echo "📊 Summary:"
ls -lh og-*.png og-*.webp cards/*.png cards/*.webp 2>/dev/null | awk '{print "  " $9 ": " $5}'
