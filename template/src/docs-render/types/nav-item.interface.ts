export interface NavItem {
  name: string;
  path: string;
  children: NavItem[];
  isGroup?: boolean;
  href?: string;
}
