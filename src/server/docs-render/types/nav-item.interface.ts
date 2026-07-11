export interface NavItem {
  name: string;
  path: string;
  children: NavItem[];
  isGroup?: boolean;
  href?: string;
  /** When set, controls default open state for collapsible groups. */
  defaultExpanded?: boolean;
}
