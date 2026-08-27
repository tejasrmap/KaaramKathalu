from PIL import Image

def trim_whitespace(image_path, output_path):
    img = Image.open(image_path).convert("RGB")
    pixels = img.load()
    
    width, height = img.size
    
    # Find bounding box of non-white pixels (RGB < 245)
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    found = False
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if r < 245 or g < 245 or b < 245:
                found = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if found:
        # Add 6px breathing room padding
        left = max(0, min_x - 6)
        top = max(0, min_y - 6)
        right = min(width, max_x + 6)
        bottom = min(height, max_y + 6)
        
        cropped_img = img.crop((left, top, right, bottom))
        cropped_img.save(output_path, quality=98)
        print(f"Original size: {img.size}, Cropped size: {cropped_img.size}, Bounding box: {(left, top, right, bottom)}")
    else:
        print("No content found to crop.")

if __name__ == "__main__":
    trim_whitespace("public/logo_full.jpg", "public/logo_full.jpg")
