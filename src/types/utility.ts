import { LucideIcon } from 'lucide-react';

export interface Utility {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  component: React.ComponentType;
}

export interface UtilityCategory {
  id: string;
  name: string;
  utilities: Utility[];
}

