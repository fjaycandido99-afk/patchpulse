# PatchPulse Visual System Setup Guide

This guide walks you through setting up the AI image generation, game branding, and platform icons system.

---

## Quick Start Checklist

- [ ] Run SQL migration in Supabase
- [ ] Platform icons are already created at `/public/icons/platforms/`
- [ ] Add game logos to your games
- [ ] Link platforms to games
- [ ] (Optional) Set up visual profiles for AI image generation

---

## Step 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase-visual-system.sql`
5. Click **Run**

This creates:
- `platforms` table (pre-populated with PC, PS5, Xbox, Switch, Mobile, Steam, Epic)
- `game_platforms` junction table
- `game_visual_profiles` for AI image settings
- `patch_images` and `news_images` for rotatable images
- `image_generation_queue` for batch processing

---

## Step 2: Platform Icons (Already Done!)

Platform icons are already created at:
```
public/icons/platforms/
├── pc.svg
├── playstation.svg
├── xbox.svg
├── switch.svg
├── mobile.svg
├── steam.svg
└── epic.svg
```

---

## Step 3: Link Platforms to Games

Run this SQL in Supabase to link platforms to your games:

```sql
-- Example: Link Fortnite to multiple platforms
-- First, get your game's ID
SELECT id, name FROM games WHERE name ILIKE '%fortnite%';

-- Then insert platform links (replace YOUR_GAME_ID)
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('YOUR_GAME_ID', 'pc'),
  ('YOUR_GAME_ID', 'ps5'),
  ('YOUR_GAME_ID', 'xbox_series'),
  ('YOUR_GAME_ID', 'switch'),
  ('YOUR_GAME_ID', 'mobile');
```

Or do it for multiple games at once:

```sql
-- Link all games to PC by default
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'pc' FROM games
ON CONFLICT DO NOTHING;
```

---

## Step 4: Add Game Logos (Optional but Recommended)

Update games with logo URLs:

```sql
-- Update a single game
UPDATE games
SET
  logo_url = 'https://your-storage.com/logos/fortnite.png',
  brand_color = '#9d4edd'
WHERE name ILIKE '%fortnite%';

-- Or update from your admin panel
```

**Logo Requirements:**
- Transparent PNG or SVG
- Horizontal orientation (logo, not icon)
- White or light colored (will be displayed on dark backgrounds)
- Recommended size: 200-400px wide

**Where to get logos:**
- Official press kits (best)
- Game's official website
- Use text fallback if unsure about licensing

---

## Step 5: Set Up Visual Profiles (For AI Image Generation)

Create visual profiles to control how AI generates images for each game:

```sql
-- Example: Create a visual profile for Fortnite
INSERT INTO game_visual_profiles (
  game_id,
  style_preset,
  color_palette,
  mood,
  prompt_tokens,
  identity_cues
)
SELECT
  id,
  'vibrant_action',
  ARRAY['#9d4edd', '#7b2cbf', '#3c096c', '#ffd700'],
  'fun',
  ARRAY['dark premium UI background', 'consistent lighting', 'crisp edges', 'no clutter', 'no text', 'subtle vignette'],
  ARRAY['colorful battle royale aesthetic', 'building mechanics implied', 'storm approaching']
FROM games
WHERE name ILIKE '%fortnite%';
```

**Available Style Presets:**
| Preset | Best For |
|--------|----------|
| `noir_cyber` | Cyberpunk, sci-fi shooters |
| `clean_gradient` | Minimal, modern games |
| `comic_ink` | Stylized games |
| `dark_realism` | Realistic shooters (default) |
| `vibrant_action` | Colorful action games |
| `tactical_mil` | Military games |
| `fantasy_epic` | RPGs, fantasy games |
| `retro_pixel` | Indie, retro games |
| `minimal_modern` | Clean, professional |

**Available Moods:**
`tense`, `competitive`, `fun`, `dramatic`, `mysterious`, `action`, `calm`

---

## Step 6: Generate AI Images (Manual for Now)

Until you integrate with an AI image API, you can manually add images:

```sql
-- Add a hero image for a patch
INSERT INTO patch_images (
  patch_id,
  variant,
  image_url,
  seed,
  rotation_index,
  is_active
) VALUES (
  'YOUR_PATCH_ID',
  'hero',
  'https://your-storage.com/images/patch-hero-1.jpg',
  12345,
  0,
  true
);

-- Add multiple images for rotation
INSERT INTO patch_images (patch_id, variant, image_url, seed, rotation_index, is_active)
VALUES
  ('YOUR_PATCH_ID', 'hero', 'https://...image1.jpg', 12345, 0, true),
  ('YOUR_PATCH_ID', 'hero', 'https://...image2.jpg', 12346, 1, true),
  ('YOUR_PATCH_ID', 'hero', 'https://...image3.jpg', 12347, 2, true);
-- These will rotate daily!
```

---

## Step 7: Test the Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to the home page and check:
   - [ ] Platform icons appear next to game names
   - [ ] Game logos display (or text fallback)
   - [ ] Hero card shows all new elements

3. Check the Supabase dashboard:
   - [ ] `platforms` table has 9 entries
   - [ ] `game_platforms` has your game-platform links

---

## Future: Integrate AI Image Generation

To fully automate image generation, you'll need to:

1. **Choose an AI provider:**
   - Stable Diffusion (self-hosted or API)
   - DALL-E 3 (OpenAI)
   - Midjourney (via API)

2. **Create an API route:**
   ```typescript
   // app/api/generate-image/route.ts
   import { buildPrompt } from '@/lib/images/prompt-builder'

   export async function POST(req: Request) {
     const { patchId, gameId, variant } = await req.json()

     // Get visual profile
     // Build prompt
     // Call AI API
     // Store result in patch_images
   }
   ```

3. **Set up a cron job to pre-generate:**
   - When a patch is published, generate 5-10 variants
   - Store in `patch_images` table
   - They'll automatically rotate daily

---

## Troubleshooting

**Icons not showing?**
- Check the icon path: `/icons/platforms/pc.svg`
- Make sure the SVG files are in `public/icons/platforms/`

**Game logo not displaying?**
- Check `logo_url` in the games table
- Ensure it's a valid URL
- Text fallback will show if logo fails

**Platforms not linking?**
- Verify `game_id` exists in `games` table
- Check `platform_id` matches exactly (e.g., `ps5` not `playstation5`)

**Images not rotating?**
- Ensure `is_active = true` on images
- Check `rotation_index` is sequential (0, 1, 2...)
- Rotation is based on current date + patch ID hash

---

## File Structure Reference

```
lib/images/
├── types.ts           # Types, style configs
├── prompt-builder.ts  # Template prompt generation
└── image-service.ts   # Fetch images, platforms

components/ui/
├── GameLogo.tsx       # Game logo component
└── PlatformIcons.tsx  # Platform icons component

public/icons/platforms/
├── pc.svg
├── playstation.svg
├── xbox.svg
├── switch.svg
├── mobile.svg
├── steam.svg
└── epic.svg
```

---

## Next Steps

1. **Run the SQL migration** (Step 1)
2. **Link platforms to your games** (Step 3)
3. **Add game logos** if you have them (Step 4)
4. **Deploy to Vercel** to see it live

The visual system will enhance your UI immediately, even without AI images!
