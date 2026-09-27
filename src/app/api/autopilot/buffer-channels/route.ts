import { NextRequest, NextResponse } from 'next/server';
import adminsConfig from '@/config/admins.json';

const ADMIN_EMAILS = [
  'sounnahmedecine@gmail.com',
  'abderelmalki@gmail.com',
  'contact@woosenteur.fr',
  'baba@woosenteur.fr',
  ...(adminsConfig?.admins?.map((a: any) => a.email.toLowerCase()) || []),
];

const DEFAULT_BUFFER_TOKEN = process.env.BUFFER_MCP_TOKEN || '5I7pCkpokAIuLqJX-Mn6o4AK0g41_yq5xBbEjy0EpTS';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customBufferToken } = body;

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
        try {
          const user = JSON.parse(authToken.value);
          userEmail = (user.email || '').toLowerCase();
          isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(userEmail);
        } catch {
          // Token parse error
        }
      }
    }

    const token = customBufferToken || (isAdmin ? DEFAULT_BUFFER_TOKEN : null);

    if (!token) {
      return NextResponse.json(
        { error: 'Aucun token Buffer fourni.' },
        { status: 400 }
      );
    }

    // 1. Fetch account info to obtain organizationId
    const accountRes = await fetch('https://mcp.buffer.com/mcp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_account',
          arguments: {},
        },
        id: Date.now(),
      }),
    });

    if (!accountRes.ok) {
      const errText = await accountRes.text();
      return NextResponse.json(
        { error: `Erreur d'authentification Buffer (${accountRes.status}): Token invalide.` },
        { status: accountRes.status }
      );
    }

    const accountData = await accountRes.json();
    if (accountData.error) {
      return NextResponse.json(
        { error: accountData.error.message || 'Token Buffer non reconnu.' },
        { status: 401 }
      );
    }

    const rawAccountText = accountData?.result?.content?.[0]?.text;
    if (!rawAccountText) {
      return NextResponse.json(
        { error: 'Format de réponse Buffer inattendu.' },
        { status: 500 }
      );
    }

    const accountObj = JSON.parse(rawAccountText);
    const orgId = accountObj?.organizations?.[0]?.id;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Aucune organisation Buffer trouvée pour ce compte.' },
        { status: 404 }
      );
    }

    // 2. Fetch channels for this organization
    const channelsRes = await fetch('https://mcp.buffer.com/mcp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'list_channels',
          arguments: {
            organizationId: orgId,
          },
        },
        id: Date.now() + 1,
      }),
    });

    if (!channelsRes.ok) {
      return NextResponse.json(
        { error: 'Impossible de récupérer la liste des chaînes Buffer.' },
        { status: 500 }
      );
    }

    const channelsData = await channelsRes.json();
    const rawChannelsText = channelsData?.result?.content?.[0]?.text;
    const channels = rawChannelsText ? JSON.parse(rawChannelsText) : [];

    return NextResponse.json({
      success: true,
      account: {
        id: accountObj.id,
        name: accountObj.name,
        email: accountObj.email,
        organizationId: orgId,
      },
      channels: channels.map((c: any) => ({
        id: c.id,
        name: c.name,
        displayName: c.displayName,
        service: c.service, // 'linkedin', 'facebook', 'tiktok', 'instagram', 'twitter', etc.
        type: c.type, // 'profile', 'page', 'account', 'business'
        avatar: c.avatar,
        isDisconnected: !!c.isDisconnected,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching Buffer channels:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du compte Buffer.' },
      { status: 500 }
    );
  }
}
