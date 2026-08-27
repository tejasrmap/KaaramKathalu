from PIL import Image

def generate_all_favicons(input_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # Find bounding box of non-white content (RGB < 240)
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    found = False
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r < 240 or g < 240 or b < 240:
                found = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    if found:
        # Tight crop with 2px margin
        left = max(0, min_x - 2)
        top = max(0, min_y - 2)
        right = min(width, max_x + 2)
        bottom = min(height, max_y + 2)
        
        cropped = img.crop((left, top, right, bottom))

        # Create transparent version where white pixels are transparent
        transparent_img = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
        t_pixels = transparent_img.load()
        c_pixels = cropped.load()

        for y in range(cropped.height):
            for x in range(cropped.width):
                r, g, b, a = c_pixels[x, y]
                if r > 240 and g > 240 and b > 240:
                    t_pixels[x, y] = (255, 255, 255, 0)
                else:
                    t_pixels[x, y] = (r, g, b, 255)

        # 1. Save transparent PNG
        transparent_img.save("public/favicon.png", "PNG")

        # 2. Save favicon.ico with multiple sizes (16, 32, 48, 64)
        icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
        transparent_img.save("public/favicon.ico", format="ICO", sizes=icon_sizes)

        # 3. Save tight JPG favicon
        cropped.convert("RGB").save("public/favicon.jpg", "JPEG", quality=98)

        # 4. Save tight JPG logo_icon
        cropped.convert("RGB").save("public/logo_icon.jpg", "JPEG", quality=98)

        print(f"Generated all favicons successfully! Cropped size: {cropped.size}")
    else:
        print("Emblem not found.")

if __name__ == "__main__":
    generate_all_favicons("public/logo_full.jpg")
