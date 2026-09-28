import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      post,
      title,
      mediaUrl,
      targetUrl,
      networks = ['linkedin', 'facebook', 'x', 'reddit'],
      customWebhookUrl,
      isTestPing = false,
    } = body;

    const webhookUrl = customWebhookUrl?.trim() || process.env.MAKE_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            'URL du Webhook Make.com non configurée. Collez votre URL de Webhook dans vos réglages ou dans le fichier d’environnement.',
        },
        { status: 400 }
      );
    }

    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: 'L’URL du Webhook Make.com est invalide (doit commencer par https://).' },
        { status: 400 }
      );
    }

    let payload: any;

    if (isTestPing) {
      payload = {
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        source: 'LinkedInForge',
        message: 'Ping de test réussi ! Votre Webhook Make.com est parfaitement connecté.',
        status: 'connected',
      };
    } else {
      if (!post || typeof post !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Le contenu du post est vide ou invalide.' },
          { status: 400 }
        );
      }

      const extractedTitle =
        title ||
        post
          .split('\n')[0]
          .replace(/^[#* \-_]+/, '')
          .slice(0, 100)
          .trim() ||
        'Nouveau Post LinkedInForge';

      payload = {
        event: 'broadcast_post',
        timestamp: new Date().toISOString(),
        source: 'LinkedInForge',
        content: {
          text: post,
          title: extractedTitle,
          mediaUrl: mediaUrl || null,
          targetUrl: targetUrl || null,
          hasMedia: !!mediaUrl,
        },
        channels: {
          linkedin: networks.includes('linkedin'),
          facebook: networks.includes('facebook'),
          x: networks.includes('x'),
          reddit: networks.includes('reddit'),
        },
      };
    }

    // Call Make.com Webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const makeResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LinkedInForge-Broadcaster/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!makeResponse.ok) {
      const responseText = await makeResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Erreur retournée par Make.com (${makeResponse.status}) : ${responseText || 'Vérifiez votre scénario Make.'}`,
        },
        { status: makeResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: isTestPing
        ? 'Ping de test reçu avec succès par Make.com !'
        : 'Post transmis avec succès à Make.com pour diffusion automatique !',
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Délai d’attente dépassé (15s) lors de la communication avec Make.com.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne lors de l’envoi à Make.com.' },
      { status: 500 }
    );
  }
}
