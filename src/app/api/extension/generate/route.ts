import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeUrlContent } from '@/lib/services/url-scraper';
import { buildForgePostPrompt } from '@/lib/prompts/forge-post';

export const dynamic = 'force-dynamic';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders();

  try {
    const body = await request.json();
    const { url, title, selectedText, tone = 'expert', locale = 'fr' } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Scrape target URL in-process if URL is provided
    let targetUrlContent = '';
    let scrapedTitle = title || '';
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      try {
        const scrapeData = await scrapeUrlContent(url);
        if (scrapeData.content) {
          targetUrlContent = scrapeData.content;
        }
        if (scrapeData.title && !scrapedTitle) {
          scrapedTitle = scrapeData.title;
        }
      } catch (scrapeErr) {
        console.warn('Extension URL Scraper error:', scrapeErr);
      }
    }

    if (!apiKey) {
      const mockResult = generateHighQualityFallback({
        url,
        title: scrapedTitle || title,
        selectedText,
        targetUrlContent,
        tone,
        locale,
      });
      return NextResponse.json(mockResult, { headers: corsHeaders });
    }

    const result = await generateExtensionPostWithEngine({
      url,
      title: scrapedTitle || title,
      selectedText,
      targetUrlContent,
      tone,
      locale,
      apiKey,
    });

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Extension Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du post' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function generateExtensionPostWithEngine(data: {
  url?: string;
  title?: string;
  selectedText?: string;
  targetUrlContent?: string;
  tone?: string;
  locale?: string;
  apiKey: string;
}): Promise<{ post: string; hooks: string[]; title: string }> {
  const toneMap: Record<string, string> = {
    authority: 'expert',
    autorite: 'expert',
    expert: 'expert',
    storytelling: 'story',
    story: 'story',
    educational: 'peda',
    educatif: 'peda',
    peda: 'peda',
    direct: 'expert',
    conversational: 'inspirant',
    conversationnel: 'inspirant',
  };

  const resolvedTone = toneMap[data.tone || 'authority'] || 'expert';

  // Build the prompt using LinkedInForge's dedicated copywriting system
  const prompt = `Tu es le Ghostwriter IA de LinkedInForge, expert mondial en copywriting LinkedIn organique et viral.
Ta mission est de forger un post LinkedIn percutant, humain, concret et prêt à publier à partir de la matière première fournie.

MATIÈRE PREMIÈRE :
${data.url ? `- URL Source : ${data.url}` : ''}
${data.title ? `- Titre : ${data.title}` : ''}
${data.selectedText ? `- Extrait clé surligné par l'utilisateur : "${data.selectedText}"` : ''}
${data.targetUrlContent ? `- Contenu extrait de la page :\n${data.targetUrlContent.slice(0, 3000)}` : ''}

DIRECTIVES DE RÉDACTION :
- Langue : ${data.locale === 'en' ? 'Anglais' : data.locale === 'es' ? 'Espagnol' : 'Français'}
- Style & Tonalité : ${resolvedTone === 'story' ? 'Storytelling percutant et immersif' : resolvedTone === 'peda' ? 'Pédagogique, clair et structuré' : 'Expert, direct, percutant, sans fioritures'}
- RÈGLES ABSOLUES DU COPYWRITING LINKEDIN :
  1. Écris à la 1ère personne ("Je", "J'ai", "Mon retour").
  2. BANNIS ABSOLUMENT le jargon IA cliché : JAMAIS de "Bonjour 👋", "J'ai lu ceci récemment et impossible de ne pas le partager", "Après plusieurs années d'expérience", "En tant que...", "Ce qui semblait complexe devient un levier...".
  3. Sois ultra-spécifique : mentionne directement de quoi il s'agit (le produit, le problème concret, la méthode, les chiffres, ce qui change la donne).
  4. Structure aérée : lignes courtes, sauts de ligne réguliers, rythme dynamique.
  5. Finis par un Call to Action (CTA) clair et engageant${data.url ? ` avec le lien : ${data.url}` : ''}.
  6. 2 à 4 hashtags pertinents à la fin.

GÉNÈRE AUSSI 3 VARIANTES DE HOOKS (accroches de 1ère ligne) :
- Hook 1 : Chiffre / Contre-intuitif
- Hook 2 : Question / Défi d'opinion
- Hook 3 : Bénéfice direct

FORMAT DE RÉPONSE OBLIGATOIRE (JSON STRICT uniquement, aucun markdown autour) :
{
  "post": "Le post complet...",
  "hooks": [
    "Hook 1...",
    "Hook 2...",
    "Hook 3..."
  ],
  "title": "${(data.title || 'Post Forgé').replace(/"/g, "'")}"
}`;

  try {
    const genAI = new GoogleGenerativeAI(data.apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 2500,
        temperature: 0.85,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const parsed = JSON.parse(text);
    return {
      post: parsed.post || text,
      hooks: Array.isArray(parsed.hooks) && parsed.hooks.length > 0 ? parsed.hooks : [
        `Voici ce qui change vraiment la donne avec ${data.title || 'cette approche'} :`,
        `90% des créateurs font encore l'erreur. Voici la méthode :`,
        `Si vous devez retenir une seule chose aujourd'hui :`
      ],
      title: parsed.title || data.title || 'Brouillon capturé',
    };
  } catch (err: any) {
    console.warn('Gemini generate error, using high quality fallback:', err?.message || err);
    return generateHighQualityFallback(data);
  }
}

function generateHighQualityFallback(data: {
  url?: string;
  title?: string;
  selectedText?: string;
  targetUrlContent?: string;
  tone?: string;
  locale?: string;
}) {
  const mainSubject = data.selectedText || data.title || 'ce contenu';
  const cleanTitle = (data.title || 'cette solution').replace(/—.*$/, '').trim();

  return {
    title: data.title || 'Brouillon capturé',
    post: `La plupart des gens passent des heures à créer du contenu sans jamais obtenir les résultats espérés.

Le problème ? Ils réinventent la roue à chaque fois.

Avec ${cleanTitle} :

→ Vous partez d'une matière première existante (idée, lien, vidéo)
→ Vous transformez ce contenu en formats optimisés pour l'algorithme
→ Vous gagnez un temps précieux sans sacrifier votre touche personnelle

${data.selectedText ? `« ${data.selectedText} »\n\n` : ''}Ce n'est pas une question de publier plus.
C'est une question de publier plus intelligemment.

Et vous, quel est votre plus grand frein dans votre régularité de publication ?

${data.url ? `🔗 Découvrir ici : ${data.url}\n\n` : ''}#CréationDeContenu #Productivité #LinkedIn #Croissance`,
    hooks: [
      `La plupart des créateurs réinventent la roue à chaque post. Voici comment faire :`,
      `Comment transformer une simple idée en post à fort impact en 2 minutes :`,
      `Le secret de la régularité sur LinkedIn ne dépend pas du temps passé :`
    ]
  };
}

