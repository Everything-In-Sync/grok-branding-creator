export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = await request.json()
    // TODO: Wire to an email service (SendGrid/MailChannels/etc.)
    // For now, just acknowledge to unblock UI
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
}


