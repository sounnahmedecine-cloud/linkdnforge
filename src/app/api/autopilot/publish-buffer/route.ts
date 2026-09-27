import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel = 'tiktok', text, mediaUrl, mediaType = 'video' } = body;

    const token = process.env.BUFFER_MCP_TOKEN || '5I7pCkpokAIuLqJX-Mn6o4AK0g41_yq5xBbEjy0EpTS';
    if (!token) {
      return NextResponse.json({ error: 'BUFFER_MCP_TOKEN non configuré.' }, { status: 500 });
    }

    // Channels detected in user's Buffer organization
    const CHANNEL_IDS = {
      tiktok: '6ab0e78aea19ca0bdea2dc3d', // abbi.muslim
      instagram: '6ab9243bea19ca0bde03f525', // aa.mina212
    };

    const channelId = CHANNEL_IDS[channel as keyof typeof CHANNEL_IDS] || CHANNEL_IDS.tiktok;

    // Build assets payload according to Buffer MCP schema
    let assets: any[] = [];
    if (mediaUrl) {
      if (mediaType === 'video') {
        assets.push({ video: { url: mediaUrl } });
      } else {
        assets.push({ image: { url: mediaUrl } });
      }
    }

    const payload = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'create_post',
        arguments: {
          channelId,
          text,
          assets: assets.length > 0 ? assets : undefined,
          schedulingType: 'now',
          mode: 'share_now',
        },
      },
      id: Date.now(),
    };

    console.log(`Envoi de publication vers Buffer MCP (${channel})...`);

    const response = await fetch('https://mcp.buffer.com/mcp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur Buffer MCP HTTP:', response.status, errText);
      return NextResponse.json({ error: `Erreur Buffer (${response.status}): ${errText}` }, { status: 500 });
    }

    const data = await response.json();
    console.log('Réponse Buffer MCP:', JSON.stringify(data));

    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'Erreur Buffer RPC' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      channel,
      result: data.result,
    });
  } catch (error: any) {
    console.error('Erreur publication Buffer:', error);
    return NextResponse.json({ error: error.message || 'Erreur inconnue lors de la publication Buffer.' }, { status: 500 });
  }
}
