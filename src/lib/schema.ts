import { SITE } from './seo';

type SchemaObject = Record<string, unknown>;

export function breadcrumbSchema(items: Array<{ name: string; url?: string }>): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => {
      const entry: Record<string, unknown> = {
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
      };
      if (item.url) {
        entry.item = item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`;
      }
      return entry;
    }),
  };
}

export function techArticleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
  about?: string;
}): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished ?? new Date().toISOString().slice(0, 10),
    dateModified: opts.dateModified ?? new Date().toISOString().slice(0, 10),
    keywords: opts.keywords?.join(', '),
    about: opts.about,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    proficiencyLevel: 'Expert',
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqPageSchema(items: Array<{ q: string; a: string }>): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function softwareSourceCodeSchema(opts: {
  name: string;
  programmingLanguage: string;
  text: string;
}): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: opts.name,
    programmingLanguage: opts.programmingLanguage,
    text: opts.text,
  };
}

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
      })),
    },
  };
}

export function websiteSchema(): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
