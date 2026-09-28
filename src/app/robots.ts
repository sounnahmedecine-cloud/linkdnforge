import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/setup/'],
      },
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'Bytespider',
          'PetalBot',
          'DataForSeoBot',
          'ZoominfoBot',
          'MegaIndex',
          'Seekport',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://linkedinforge.fr/sitemap.xml',
  };
}
