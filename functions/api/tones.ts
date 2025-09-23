export const onRequestGet: PagesFunction = async () => {
  const tones = [
    'conservative', 'modern', 'playful', 'premium', 'eco', 'trustworthy',
    'energetic', 'minimal', 'artisan', 'techie', 'healthcare', 'finance',
    'hospitality', 'education', 'construction', 'legal', 'nonprofit',
    'restaurant', 'retail', 'beauty', 'fitness', 'automotive', 'real_estate'
  ]
  return new Response(JSON.stringify({ tones }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400' }
  })
}


