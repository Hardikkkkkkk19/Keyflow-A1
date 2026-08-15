import React from "react";
import { RoutePath } from "../../types";
import { PracticeRecommendation, RecommendationSummary } from "../../utils/recommendationEngine";
import {
  Sparkles,
  Target,
  Zap,
  Flame,
  Code2,
  Keyboard,
  Play,
  ArrowRight,
  ShieldCheck,
  Activity,
  Bot,
} from "lucide-react";

interface RecommendedPracticeSectionProps {
  recommendationData: RecommendationSummary;
  onNavigate: (path: RoutePath) => void;
  onStartDrill?: (text: string) => void;
}

export const RecommendedPracticeSection: React.FC<RecommendedPracticeSectionProps> = ({
  recommendationData,
  onNavigate,
  onStartDrill,
}) => {
  const { primary, secondary, hasData } = recommendationData;

  const handleAction = (rec: PracticeRecommendation) => {
    if (rec.drillText && onStartDrill) {
      onStartDrill(rec.drillText);
    } else {
      onNavigate(rec.targetPath);
    }
  };

  const renderIcon = (name: PracticeRecommendation["iconName"], className = "w-5 h-5") => {
    switch (name) {
      case "Target":
        return <Target className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Code2":
        return <Code2 className={className} />;
      case "Keyboard":
        return <Keyboard className={className} />;
      case "Play":
      default:
        return <Play className={className} />;
    }
  };

  const getBadgeClasses = (color: PracticeRecommendation["badgeColor"]) => {
    switch (color) {
      case "rose":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "amber":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "cyan":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "indigo":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "emerald":
      default:
        return "bg-[#18C69A]/10 text-[#18C69A] border-[#18C69A]/30";
    }
  };

  return (
    <div className="bg-[#0D1210] p-6 sm:p-8 rounded-2xl border border-[#F3F5F2]/10 space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3F5F2]/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-mono font-bold text-[#18C69A] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#18C69A]" />
            <span>Recommended for You</span>
          </div>
          <h3 className="text-xl font-bold text-[#F3F5F2] tracking-tight flex items-center gap-2">
            Personalized Practice Routine
          </h3>
          <p className="text-xs text-[#A6ADA8]">
            {hasData
              ? "Tailored recommendations computed strictly from your verified typing telemetry."
              : "Calibrate your profile with an initial typing test to generate custom diagnostics."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate("/coach")}
            className="px-3.5 py-2 bg-[#151B18] hover:bg-[#111715] border border-[#F3F5F2]/10 text-[#F3F5F2] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#18C69A]" />
            <span>Ask AI Coach</span>
          </button>
        </div>
      </div>

      {/* Primary Highlighted Recommendation Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#050807] border border-[#18C69A]/30 relative overflow-hidden shadow-xl space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#18C69A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${getBadgeClasses(
                  primary.badgeColor,
                )}`}
              >
                {primary.badge}
              </span>
              <span className="text-xs font-mono text-[#68716C]">{primary.category}</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-[#F3F5F2] tracking-tight">
              {primary.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#A6ADA8] max-w-2xl leading-relaxed">
              {primary.description}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => handleAction(primary)}
            className="px-6 py-3.5 bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#18C69A]/20 shrink-0 self-start md:self-auto"
          >
            {renderIcon(primary.iconName, "w-4 h-4 fill-current")}
            <span>{primary.primaryActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Telemetry Metrics & Diagnosis Rationale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F3F5F2]/10 font-mono text-xs">
          <div className="p-3 bg-[#0D1210] rounded-xl border border-[#F3F5F2]/5 space-y-1">
            <span className="text-[10px] text-[#68716C] block uppercase font-sans">
              {primary.currentMetricLabel}
            </span>
            <span className="text-sm font-bold text-[#F3F5F2]">{primary.currentMetricValue}</span>
          </div>

          <div className="p-3 bg-[#0D1210] rounded-xl border border-[#F3F5F2]/5 space-y-1">
            <span className="text-[10px] text-[#68716C] block uppercase font-sans">
              {primary.targetMetricLabel}
            </span>
            <span className="text-sm font-bold text-[#18C69A]">{primary.targetMetricValue}</span>
          </div>

          <div className="p-3 bg-[#0D1210] rounded-xl border border-[#F3F5F2]/5 space-y-1 sm:col-span-1">
            <span className="text-[10px] text-[#68716C] block uppercase font-sans flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#18C69A]" />
              Telemetry Diagnosis
            </span>
            <p className="text-[11px] font-sans text-[#A6ADA8] leading-tight line-clamp-2">
              {primary.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Companion Recommendations */}
      {secondary.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#68716C] uppercase tracking-wider">
            <Activity className="w-3 h-3 text-[#18C69A]" />
            <span>Additional Focus Areas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secondary.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-xl bg-[#050807] border border-[#F3F5F2]/10 hover:border-[#18C69A]/30 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${getBadgeClasses(
                        rec.badgeColor,
                      )}`}
                    >
                      {rec.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#68716C]">{rec.category}</span>
                  </div>

                  <h5 className="font-bold text-sm text-[#F3F5F2]">{rec.title}</h5>
                  <p className="text-xs text-[#A6ADA8] leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3F5F2]/5 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs">
                    <span className="text-[10px] text-[#68716C] block">
                      {rec.targetMetricLabel}
                    </span>
                    <span className="text-xs font-bold text-[#18C69A]">
                      {rec.targetMetricValue}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAction(rec)}
                    className="px-4 py-2 bg-[#151B18] hover:bg-[#111715] text-[#F3F5F2] border border-[#F3F5F2]/10 hover:border-[#18C69A]/40 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{rec.primaryActionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-[#18C69A]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
