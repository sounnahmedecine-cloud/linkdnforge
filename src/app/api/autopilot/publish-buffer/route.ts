import { NextRequest, NextResponse } from 'next/server';
import adminsConfig from '@/config/admins.json';

const ADMIN_EMAILS = [
  'sounnahmedecine@gmail.com',
  'abderelmalki@gmail.com',
  'contact@woosenteur.fr',
  'baba@woosenteur.fr',
  ...(adminsConfig?.admins?.map((a: any) => a.email.toLowerCase()) || [])
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      channel = 'tiktok', 
      text, 
      mediaUrl, 
      mediaType = 'video',
      customBufferToken,
      customChannelId 
    } = body;

    // Check user authentication from cookie
    const authToken = request.cookies.get('auth_token');
    let isAdmin = false;
    let userEmail = '';

    if (authToken?.value) {
      try {
        const user = JSON.parse(decodeURIComponent(authToken.value));
        userEmail = (user.email || '').toLowerCase();
        isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(userEmail);
      } catch (e) {
        // Fallback to plain JSON parse if decodeURIComponent fails
        try {
          const user = JSON.parse(authToken.value);
          userEmail = (user.email || '').toLowerCase();
          isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(userEmail);
        } catch {
          // Token parsing error
        }
      }
    }

    // MULTI-TENANT ISOLATION:
    // If not admin and no personal customBufferToken provided, forbid publication
    if (!isAdmin && !customBufferToken) {
      return NextResponse.json(
        { 
          error: "Action réservée à l'administrateur. Pour publier automatiquement sur vos propres réseaux sociaux, veuillez renseigner votre token Buffer personnel dans vos paramètres." 
        }, 
        { status: 403 }
      );
    }

    // Token: use custom token if provided, or founder's token if admin
    const token = customBufferToken || (isAdmin ? (process.env.BUFFER_MCP_TOKEN || '5I7pCkpokAIuLqJX-Mn6o4AK0g41_yq5xBbEjy0EpTS') : null);
    if (!token) {
      return NextResponse.json({ error: 'Token Buffer non configuré.' }, { status: 400 });
    }

    // Default founder channels (ONLY used if user is admin)
    const FOUNDER_CHANNELS = {
      tiktok: '6ab0e78aea19ca0bdea2dc3d', // abbi.muslim
      instagram: '6ab9243bea19ca0bde03f525', // aa.mina212
    };

    const channelId = customChannelId || (isAdmin ? FOUNDER_CHANNELS[channel as keyof typeof FOUNDER_CHANNELS] : null);
    if (!channelId) {
      return NextResponse.json({ error: 'Identifiant de chaîne Buffer manquant.' }, { status: 400 });
    }

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
