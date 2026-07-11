export interface DocsConfigGroup {
  group: string;
  pages: string[];
}

export interface DocsConfigTab {
  tab: string;
  groups: DocsConfigGroup[];
}

export interface DocsConfig {
  name?: string;
  logo?: string;
  favicon?: string;
  navigation?: {
    tabs?: DocsConfigTab[];
  };
}

export interface SiteBranding {
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
}
