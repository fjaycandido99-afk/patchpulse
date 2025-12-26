-- Add image_url column to news_items for OG images
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_news_items_image_url ON news_items(image_url) WHERE image_url IS NOT NULL;
