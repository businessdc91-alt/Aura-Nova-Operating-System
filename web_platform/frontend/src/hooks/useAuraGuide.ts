'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auraGuide, GuideResponse, PLATFORM_FEATURES, FeatureGuide, TutorialStep } from '@/services/auraGuideService';

// Alias for backward compatibility
type AuraGuideResponse = GuideResponse;

// ============================================================================
// AURA GUIDE HOOK - Easy access to guide functionality throughout the app
// ============================================================================

export interface UseAuraGuideOptions {
  // Automatically set context based on current route
  autoContext?: boolean;
  // Show guide suggestions for current page
  showSuggestions?: boolean;
}

export interface AuraGuideHookReturn {
  // Chat functionality
  sendMessage: (message: string) => Promise<AuraGuideResponse>;
  isProcessing: boolean;
  lastResponse: AuraGuideResponse | null;

  // Navigation
  navigateToFeature: (featureId: string) => void;
  getCurrentFeature: () => FeatureGuide | null;
  getRelatedFeatures: () => FeatureGuide[];

  // Recommendations
  getRecommendations: () => FeatureGuide[];
  getQuickStart: () => GuideResponse;

  // Context
  currentRoute: string;
  currentSuite: string | null;

  // Feature discovery
  searchFeatures: (query: string) => FeatureGuide[];
  getFeatureById: (id: string) => FeatureGuide | undefined;
  getAllFeatures: () => FeatureGuide[];
  getFeaturesBySuite: (suite: string) => FeatureGuide[];

  // Help triggers
  openGuide: () => void;
  showContextualHelp: (topic: string) => void;
}

export function useAuraGuide(options: UseAuraGuideOptions = {}): AuraGuideHookReturn {
  const { autoContext = true, showSuggestions = true } = options;
  const pathname = usePathname();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<AuraGuideResponse | null>(null);

  // Auto-update context when route changes
  useEffect(() => {
    if (autoContext && pathname) {
      auraGuide.setContext({ currentRoute: pathname });
    }
  }, [autoContext, pathname]);

  // Send message to Aura
  const sendMessage = useCallback(async (message: string): Promise<AuraGuideResponse> => {
    setIsProcessing(true);
    try {
      const response = await auraGuide.processMessage(message);
      setLastResponse(response);
      return response;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Navigate to a feature by ID
  const navigateToFeature = useCallback((featureId: string) => {
    const feature = PLATFORM_FEATURES.find(f => f.id === featureId);
    if (feature) {
      router.push(feature.route);
    }
  }, [router]);

  // Get the current feature based on route
  const getCurrentFeature = useCallback((): FeatureGuide | null => {
    if (!pathname) return null;
    return PLATFORM_FEATURES.find(f => 
      pathname === f.route || pathname.startsWith(f.route + '/')
    ) || null;
  }, [pathname]);

  // Get related features to the current one
  const getRelatedFeatures = useCallback((): FeatureGuide[] => {
    const current = getCurrentFeature();
    if (!current) return [];

    // Find features in the same suite or with overlapping keywords
    return PLATFORM_FEATURES.filter(f => {
      if (f.id === current.id) return false;
      if (f.suite === current.suite) return true;
      
      // Check for keyword overlap
      const overlap = f.keywords.some(k => current.keywords.includes(k));
      return overlap;
    }).slice(0, 5);
  }, [getCurrentFeature]);

  // Get personalized recommendations
  const getRecommendations = useCallback((): FeatureGuide[] => {
    const current = getCurrentFeature();
    
    // If on a specific feature, recommend related ones
    if (current) {
      return getRelatedFeatures();
    }

    // Default recommendations for new users
    const recommended: string[] = [
      'dojo',      // Start with coding
      'os',        // Try the OS
      'art-studio', // Create art
      'challenges', // Earn rewards
      'chat',       // Join community
    ];

    return recommended
      .map(id => PLATFORM_FEATURES.find(f => f.id === id))
      .filter(Boolean) as FeatureGuide[];
  }, [getCurrentFeature, getRelatedFeatures]);

  // Get quick start message
  const getQuickStart = useCallback((): GuideResponse => {
    return auraGuide.getQuickStartGuide();
  }, []);

  // Current suite detection
  const currentSuite = useMemo((): string | null => {
    const feature = getCurrentFeature();
    return feature?.suite || null;
  }, [getCurrentFeature]);

  // Search features
  const searchFeatures = useCallback((query: string): FeatureGuide[] => {
    if (!query) return PLATFORM_FEATURES;
    
    const lowerQuery = query.toLowerCase();
    return PLATFORM_FEATURES.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.keywords.some(k => k.includes(lowerQuery)) ||
      f.capabilities.some(c => c.toLowerCase().includes(lowerQuery))
    );
  }, []);

  // Get feature by ID
  const getFeatureById = useCallback((id: string): FeatureGuide | undefined => {
    return PLATFORM_FEATURES.find(f => f.id === id);
  }, []);

  // Get all features
  const getAllFeatures = useCallback((): FeatureGuide[] => {
    return PLATFORM_FEATURES;
  }, []);

  // Get features by suite
  const getFeaturesBySuite = useCallback((suite: string): FeatureGuide[] => {
    return PLATFORM_FEATURES.filter(f => f.suite === suite);
  }, []);

  // Open the guide
  const openGuide = useCallback(() => {
    // Dispatch event to open floating guide
    window.dispatchEvent(new CustomEvent('aura-guide-open'));
  }, []);

  // Show contextual help
  const showContextualHelp = useCallback((topic: string) => {
    window.dispatchEvent(new CustomEvent('aura-guide-help', { detail: { topic } }));
  }, []);

  return {
    sendMessage,
    isProcessing,
    lastResponse,
    navigateToFeature,
    getCurrentFeature,
    getRelatedFeatures,
    getRecommendations,
    getQuickStart,
    currentRoute: pathname || '/',
    currentSuite,
    searchFeatures,
    getFeatureById,
    getAllFeatures,
    getFeaturesBySuite,
    openGuide,
    showContextualHelp,
  };
}

// ============================================================================
// CONTEXT-AWARE HELP - Provides help based on where user is
// ============================================================================

export interface ContextualHelpItem {
  title: string;
  description: string;
  action?: () => void;
  link?: string;
}

export function useContextualHelp(): {
  helpItems: ContextualHelpItem[];
  currentFeature: FeatureGuide | null;
  tutorials: TutorialStep[];
  externalGuides: { title: string; description: string }[];
} {
  const { getCurrentFeature, getRelatedFeatures } = useAuraGuide();
  
  const currentFeature = getCurrentFeature();
  
  const helpItems = useMemo((): ContextualHelpItem[] => {
    const items: ContextualHelpItem[] = [];

    if (currentFeature) {
      // Add capabilities as help items
      currentFeature.capabilities.forEach(cap => {
        items.push({
          title: cap,
          description: `Learn how to ${cap.toLowerCase()}`,
        });
      });

      // Add related features
      getRelatedFeatures().forEach(related => {
        items.push({
          title: `Try ${related.name}`,
          description: related.description,
          link: related.route,
        });
      });
    }

    return items;
  }, [currentFeature, getRelatedFeatures]);

  const tutorials = useMemo(() => {
    return currentFeature?.tutorials || [];
  }, [currentFeature]);

  const externalGuides = useMemo(() => {
    if (!currentFeature?.externalIntegrations) return [];
    
    return currentFeature.externalIntegrations.map(ext => ({
      title: `Use in ${ext.name}`,
      description: ext.exportFormat 
        ? `Export as ${ext.exportFormat} for ${ext.name}` 
        : `Integrate with ${ext.name}`,
    }));
  }, [currentFeature]);

  return {
    helpItems,
    currentFeature,
    tutorials,
    externalGuides,
  };
}

// ============================================================================
// FEATURE DISCOVERY - Help users find features they might not know about
// ============================================================================

export function useFeatureDiscovery(): {
  randomFeature: () => FeatureGuide;
  dailyFeature: FeatureGuide;
  unexploredFeatures: FeatureGuide[];
  markAsExplored: (featureId: string) => void;
} {
  const [explored, setExplored] = useState<Set<string>>(new Set());

  // Load explored features from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura-explored-features');
      if (saved) {
        setExplored(new Set(JSON.parse(saved)));
      }
    }
  }, []);

  // Get a random feature
  const randomFeature = useCallback((): FeatureGuide => {
    const idx = Math.floor(Math.random() * PLATFORM_FEATURES.length);
    return PLATFORM_FEATURES[idx];
  }, []);

  // Get daily featured (deterministic based on date)
  const dailyFeature = useMemo((): FeatureGuide => {
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const idx = hash % PLATFORM_FEATURES.length;
    return PLATFORM_FEATURES[idx];
  }, []);

  // Get features user hasn't explored yet
  const unexploredFeatures = useMemo((): FeatureGuide[] => {
    return PLATFORM_FEATURES.filter(f => !explored.has(f.id));
  }, [explored]);

  // Mark a feature as explored
  const markAsExplored = useCallback((featureId: string) => {
    setExplored(prev => {
      const next = new Set(prev);
      next.add(featureId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aura-explored-features', JSON.stringify([...next]));
      }
      return next;
    });
  }, []);

  return {
    randomFeature,
    dailyFeature,
    unexploredFeatures,
    markAsExplored,
  };
}

export default useAuraGuide;
