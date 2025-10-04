#!/usr/bin/env python3
"""
Generate required assets (icons, avatars, logo) for the mobile app using Pillow.

Outputs:
- astro-voice-mobile/assets/icons/icon_all.png
- astro-voice-mobile/assets/icons/icon_love.png
- astro-voice-mobile/assets/icons/icon_marriage.png
- astro-voice-mobile/assets/icons/icon_career.png
- astro-voice-mobile/assets/avatars/avatar_tina.png
- astro-voice-mobile/assets/avatars/avatar_mohit.png
- astro-voice-mobile/assets/avatars/avatar_priyanka.png
- astro-voice-mobile/assets/avatars/avatar_harsh.png
- astro-voice-mobile/assets/logo/kundli_logo.png
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Tuple

from PIL import Image, ImageDraw, ImageFont


ASSETS_ROOT = "/Users/nikhil/workplace/voice_v1/astro-voice-mobile/assets"


@dataclass
class BrandColors:
    primary_brown: Tuple[int, int, int] = (0x6B, 0x2C, 0x16)
    golden: Tuple[int, int, int] = (0xD4, 0xA7, 0x6A)
    accent_orange: Tuple[int, int, int] = (0xE6, 0x75, 0x38)
    love_pink: Tuple[int, int, int] = (0xE9, 0x1E, 0x63)
    marriage_purple: Tuple[int, int, int] = (0x9C, 0x27, 0xB0)
    career_blue: Tuple[int, int, int] = (0x21, 0x96, 0xF3)


BRAND = BrandColors()


def ensure_dirs() -> None:
    for sub in ("icons", "avatars", "logo"):
        path = os.path.join(ASSETS_ROOT, sub)
        os.makedirs(path, exist_ok=True)


def radial_gradient(size: int, inner: Tuple[int, int, int], outer: Tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for r in range(size // 2, 0, -1):
        t = 1 - (r / (size / 2))
        color = tuple(int(inner[i] * (1 - t) + outer[i] * t) for i in range(3)) + (255,)
        bbox = [size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r]
        draw.ellipse(bbox, fill=color)
    return img


def save_png(img: Image.Image, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, format="PNG")


def draw_icon_base(color: Tuple[int, int, int]) -> Image.Image:
    size = 120
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gradient = radial_gradient(size, color, (255, 255, 255))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    circle = Image.composite(gradient, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask)
    base.alpha_composite(circle)
    # thin golden stroke
    draw = ImageDraw.Draw(base)
    draw.ellipse((2, 2, size - 2, size - 2), outline=BRAND.golden + (255,), width=2)
    return base


def draw_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: Tuple[int, int, int]) -> None:
    from math import sin, cos, pi
    points = []
    spikes = 8
    r2 = r // 2
    for i in range(spikes * 2):
        ang = i * pi / spikes
        rad = r if i % 2 == 0 else r2
        x = cx + int(cos(ang) * rad)
        y = cy + int(sin(ang) * rad)
        points.append((x, y))
    draw.polygon(points, fill=color + (220,))


def generate_icons() -> None:
    # All
    all_icon = draw_icon_base(BRAND.primary_brown)
    d = ImageDraw.Draw(all_icon)
    draw_star(d, 60, 60, 28, BRAND.golden)
    save_png(all_icon, os.path.join(ASSETS_ROOT, "icons", "icon_all.png"))

    # Love
    love_icon = draw_icon_base(BRAND.love_pink)
    d = ImageDraw.Draw(love_icon)
    # interlocking hearts
    d.ellipse((30, 40, 62, 72), outline=BRAND.golden + (255,), width=6)
    d.ellipse((58, 40, 90, 72), outline=BRAND.golden + (255,), width=6)
    d.polygon([(46, 70), (74, 70), (60, 92)], fill=BRAND.golden + (255,))
    save_png(love_icon, os.path.join(ASSETS_ROOT, "icons", "icon_love.png"))

    # Marriage
    marriage_icon = draw_icon_base(BRAND.marriage_purple)
    d = ImageDraw.Draw(marriage_icon)
    d.ellipse((30, 36, 62, 68), outline=BRAND.golden + (255,), width=6)
    d.ellipse((58, 36, 90, 68), outline=BRAND.golden + (255,), width=6)
    d.rectangle((44, 66, 76, 78), fill=BRAND.golden + (255,))
    save_png(marriage_icon, os.path.join(ASSETS_ROOT, "icons", "icon_marriage.png"))

    # Career
    career_icon = draw_icon_base(BRAND.career_blue)
    d = ImageDraw.Draw(career_icon)
    # briefcase
    d.rectangle((32, 54, 88, 88), outline=BRAND.golden + (255,), width=4, fill=BRAND.golden + (60,))
    d.rectangle((48, 46, 72, 54), fill=BRAND.golden + (255,))
    # upward arrow
    d.line((38, 78, 58, 62, 78, 74), fill=BRAND.accent_orange + (255,), width=6, joint="curve")
    d.polygon([(78, 74), (69, 66), (86, 64)], fill=BRAND.accent_orange + (255,))
    save_png(career_icon, os.path.join(ASSETS_ROOT, "icons", "icon_career.png"))


def linear_gradient(size: Tuple[int, int], top: Tuple[int, int, int], bottom: Tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        ImageDraw.Draw(img).line([(0, y), (w, y)], fill=color)
    return img


def draw_avatar_placeholder(name: str, gradient_top: Tuple[int, int, int], gradient_bottom: Tuple[int, int, int]) -> Image.Image:
    size = 800
    bg = linear_gradient((size, size), gradient_top, gradient_bottom)
    draw = ImageDraw.Draw(bg)
    # simple silhouette circle
    center = (size // 2, size // 2 - 60)
    draw.ellipse((center[0] - 160, center[1] - 160, center[0] + 160, center[1] + 160), fill=(255, 255, 255, 28))
    # shoulders
    draw.ellipse((center[0] - 260, center[1] + 80, center[0] + 260, center[1] + 360), fill=(255, 255, 255, 20))
    # name text
    try:
        font = ImageFont.truetype("Arial.ttf", 56)
    except Exception:
        font = ImageFont.load_default()
    text = name
    # Pillow 10+: use textbbox to measure
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) // 2, size - th - 48), text, fill=(255, 255, 255, 230), font=font)
    # subtle golden border
    draw.rectangle((8, 8, size - 8, size - 8), outline=BRAND.golden + (180,), width=8)
    return bg


def generate_avatars() -> None:
    tina = draw_avatar_placeholder("Tina Kulkarni", BRAND.primary_brown, BRAND.golden)
    save_png(tina, os.path.join(ASSETS_ROOT, "avatars", "avatar_tina.png"))

    mohit = draw_avatar_placeholder("Mohit", BRAND.career_blue, BRAND.primary_brown)
    save_png(mohit, os.path.join(ASSETS_ROOT, "avatars", "avatar_mohit.png"))

    priyanka = draw_avatar_placeholder("Priyanka", BRAND.love_pink, BRAND.golden)
    save_png(priyanka, os.path.join(ASSETS_ROOT, "avatars", "avatar_priyanka.png"))

    harsh = draw_avatar_placeholder("Harsh Dubey", BRAND.primary_brown, BRAND.accent_orange)
    save_png(harsh, os.path.join(ASSETS_ROOT, "avatars", "avatar_harsh.png"))


def generate_kundli_logo() -> None:
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # background subtle gradient square with rounded corners
    bg = radial_gradient(size, BRAND.golden, (255, 255, 255))
    img.alpha_composite(bg)
    # Outer diamond
    margin = 40
    cx, cy = size // 2, size // 2
    pts = [(cx, margin), (size - margin, cy), (cx, size - margin), (margin, cy)]
    draw.polygon(pts, outline=BRAND.primary_brown + (255,), fill=None, width=10)
    # inner diamond
    margin2 = 120
    pts2 = [(cx, margin2), (size - margin2, cy), (cx, size - margin2), (margin2, cy)]
    draw.polygon(pts2, outline=BRAND.primary_brown + (255,), width=8)
    # center dot
    draw.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), fill=BRAND.primary_brown + (255,))
    # label (optional)
    try:
        font = ImageFont.truetype("Arial.ttf", 56)
    except Exception:
        font = ImageFont.load_default()
    title = "Kundli"
    bbox = draw.textbbox((0, 0), title, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw // 2, size - th - 24), title, fill=BRAND.primary_brown + (255,), font=font)

    save_png(img, os.path.join(ASSETS_ROOT, "logo", "kundli_logo.png"))


def main() -> None:
    ensure_dirs()
    generate_icons()
    generate_avatars()
    generate_kundli_logo()
    print("Assets generated successfully in:")
    print(f" - {os.path.join(ASSETS_ROOT, 'icons')}")
    print(f" - {os.path.join(ASSETS_ROOT, 'avatars')}")
    print(f" - {os.path.join(ASSETS_ROOT, 'logo')}")


if __name__ == "__main__":
    main()


