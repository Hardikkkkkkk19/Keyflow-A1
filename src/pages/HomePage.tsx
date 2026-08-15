import React from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { AnalyticsPreviewSection } from "../components/landing/AnalyticsPreviewSection";
import { IntelligenceSection } from "../components/landing/IntelligenceSection";
import { CoachPreviewSection } from "../components/landing/CoachPreviewSection";
import { ProgressSection } from "../components/landing/ProgressSection";
import { CTASection } from "../components/landing/CTASection";
import { PageTransition } from "../components/common/PageTransition";
import { RoutePath } from "../types";

interface HomePageProps {
  onNavigate: (path: RoutePath) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <PageTransition>
      <HeroSection onNavigate={onNavigate} />
      <FeaturesSection onNavigate={onNavigate} />
      <AnalyticsPreviewSection onNavigate={onNavigate} />
      <IntelligenceSection onNavigate={onNavigate} />
      <CoachPreviewSection onNavigate={onNavigate} />
      <ProgressSection onNavigate={onNavigate} />
      <CTASection onNavigate={onNavigate} />
    </PageTransition>
  );
};
