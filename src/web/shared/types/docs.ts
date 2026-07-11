export interface NavItem {
  name: string;
  path: string;
  children: NavItem[];
  isGroup?: boolean;
  href?: string;
}

export interface SiteBranding {
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface TocHeading {
  level: number;
  id: string;
  text: string;
}

export interface DocPage {
  path: string;
  title: string;
  description?: string;
  groupName?: string;
  html: string;
  headings: TocHeading[];
}

export interface DocsSearchHit {
  title: string;
  href: string;
  snippet: string;
}
