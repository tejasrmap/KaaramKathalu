from PIL import Image

def generate_emblem_favicon(input_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size

    # The circular emblem is located on the left portion (x: 0 to height)
    emblem = img.crop((0, 0, height, height))
    
    # Trim white padding around emblem
    pixels = emblem.load()
    w, h = emblem.size
    min_x, min_y = w, h
    max_x, max_y = 0, 0
    found = False
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r < 240 or g < 240 or b < 240:
                found = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if found:
        # Tight crop
        left = max(0, min_x - 2)
        top = max(0, min_y - 2)
        right = min(w, max_x + 2)
        bottom = min(h, max_y + 2)
        
        cropped_emblem = emblem.crop((left, top, right, bottom))
        
        # Transparent background
        transparent_img = Image.new("RGBA", cropped_emblem.size, (0, 0, 0, 0))
        t_pixels = transparent_img.load()
        c_pixels = cropped_emblem.load()

        for y in range(cropped_emblem.height):
            for x in range(cropped_emblem.width):
                r, g, b, a = c_pixels[x, y]
                if r > 240 and g > 240 and b > 240:
                    t_pixels[x, y] = (255, 255, 255, 0)
                else:
                    t_pixels[x, y] = (r, g, b, 255)

        # 1. Save transparent PNG favicon
        transparent_img.save("public/favicon.png", "PNG")

        # 2. Save multi-size favicon.ico (16x16, 32x32, 48x48, 64x64)
        icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
        transparent_img.save("public/favicon.ico", format="ICO", sizes=icon_sizes)

        # 3. Save JPG favicon & logo_icon
        cropped_emblem.convert("RGB").save("public/favicon.jpg", "JPEG", quality=98)
        cropped_emblem.convert("RGB").save("public/logo_icon.jpg", "JPEG", quality=98)

        print(f"Isolated emblem favicon successfully! Size: {cropped_emblem.size}")
    else:
        print("Emblem not found.")

if __name__ == "__main__":
    generate_emblem_favicon("public/logo_full.jpg")
