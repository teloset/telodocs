export interface DocsConfigNestedGroup {
  group: string;
  pages: DocsConfigPageEntry[];
  expanded?: boolean;
  root?: string;
}

export type DocsConfigPageEntry = string | DocsConfigNestedGroup;

export interface DocsConfigGroup {
  group: string;
  pages: DocsConfigPageEntry[];
  expanded?: boolean;
  root?: string;
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
