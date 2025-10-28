export interface Theme {
  id: string;
  name: string;
  description: string;
  image: string;
  colors: {
    [key: string]: string;
  };
}

export interface DesktopThemeCardProps {
  theme: Theme;
  index: number;
  isSelected: boolean;
  isApplied: boolean;
  onSelect: (theme: Theme, index: number) => void;
  onApply?: (theme: Theme) => void;
}

export interface DesktopThemeGridProps {
  selectedTheme: Theme;
  appliedTheme?: Theme;
  themeArray: Theme[];
  handleThemeSelect: (theme: Theme, index: number) => void;
  handleThemeApply?: (theme: Theme) => void;
}

export interface MobileThemeNavigationProps {
  currentIndex: number;
  themeCount: number;
  themeArray: any[];
  handleNext: () => void;
  handlePrevious: () => void;
}

export interface MobileThemeCarouselProps {
  selectedTheme: Theme;
  appliedTheme: Theme;
  currentIndex: number;
  themeArray: Theme[];
  handleNext: () => void;
  handlePrevious: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  handleThemeApply: (theme: Theme) => void;
  isDragging: boolean;
}

export interface MobileThemeCardProps {
  theme: Theme;
  appliedTheme: Theme;
  isDragging: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onApply: (theme: Theme) => void;
}

export interface ColorPaletteProps {
  colors: Record<string, string>;
}
