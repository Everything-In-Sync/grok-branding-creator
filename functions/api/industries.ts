export const onRequestGet: PagesFunction = async () => {
  const industries = [
    'healthcare', 'construction', 'legal', 'finance', 'beauty', 'restaurant',
    'technology', 'education', 'real estate', 'nonprofit', 'hospitality',
    'retail', 'fitness', 'automotive'
  ]
  return new Response(JSON.stringify({ industries }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400' }
  })
}


