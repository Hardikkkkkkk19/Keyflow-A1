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
        return "bg-[#F05A9D]/10 text-[#F05A9D] border-[#F05A9D]/30";
      case "amber":
        return "bg-[#F4D35E]/10 text-[#F4D35E] border-[#F4D35E]/30";
      case "cyan":
        return "bg-[#45D6E8]/10 text-[#45D6E8] border-[#45D6E8]/30";
      case "indigo":
        return "bg-[#B85CFF]/10 text-[#B85CFF] border-[#B85CFF]/30";
      case "emerald":
      default:
        return "bg-[#79D88B]/10 text-[#79D88B] border-[#79D88B]/30";
    }
  };

  return (
    <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#B85CFF]/10 border border-[#B85CFF]/30 text-xs font-mono font-bold text-[#B85CFF] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B85CFF]" />
            <span>Recommended for You</span>
          </div>
          <h3 className="text-xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            Personalized Practice Routine
          </h3>
          <p className="text-xs text-[#A0A0A0]">
            {hasData
              ? "Tailored recommendations computed strictly from your verified typing telemetry."
              : "Calibrate your profile with an initial typing test to generate custom diagnostics."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate("/coach")}
            className="px-3.5 py-2 bg-[#181818] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#B85CFF]/40 text-[#F5F5F5] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#B85CFF]" />
            <span>Ask AI Coach</span>
          </button>
        </div>
      </div>

      {/* Primary Highlighted Recommendation Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#181818] border border-[#262626] relative overflow-hidden shadow-xl space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B85CFF]/5 rounded-full blur-3xl pointer-events-none" />

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
              <span className="text-xs font-mono text-[#666666]">{primary.category}</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
              {primary.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#A0A0A0] max-w-2xl leading-relaxed">
              {primary.description}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => handleAction(primary)}
            className="px-6 py-3.5 bg-[#18C69A] hover:bg-[#20B88A] text-[#0A0A0A] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#18C69A]/20 shrink-0 self-start md:self-auto"
          >
            {renderIcon(primary.iconName, "w-4 h-4 fill-current")}
            <span>{primary.primaryActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Telemetry Metrics & Diagnosis Rationale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#262626] font-mono text-xs">
          <div className="p-3 bg-[#151515] rounded-xl border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#666666] block uppercase font-sans">
              {primary.currentMetricLabel}
            </span>
            <span className="text-sm font-bold text-[#F5F5F5]">{primary.currentMetricValue}</span>
          </div>

          <div className="p-3 bg-[#151515] rounded-xl border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#666666] block uppercase font-sans">
              {primary.targetMetricLabel}
            </span>
            <span className="text-sm font-bold text-[#45D6E8]">{primary.targetMetricValue}</span>
          </div>

          <div className="p-3 bg-[#151515] rounded-xl border border-[#262626] space-y-1 sm:col-span-1">
            <span className="text-[10px] text-[#666666] block uppercase font-sans flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#79D88B]" />
              Telemetry Diagnosis
            </span>
            <p className="text-[11px] font-sans text-[#A0A0A0] leading-tight line-clamp-2">
              {primary.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Companion Recommendations */}
      {secondary.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#666666] uppercase tracking-wider">
            <Activity className="w-3 h-3 text-[#45D6E8]" />
            <span>Additional Focus Areas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secondary.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#303030] transition-all flex flex-col justify-between gap-4"
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
                    <span className="text-[11px] font-mono text-[#666666]">{rec.category}</span>
                  </div>

                  <h5 className="font-bold text-sm text-[#F5F5F5]">{rec.title}</h5>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-3">
                  <div className="font-mono text-xs">
                    <span className="text-[10px] text-[#666666] block">
                      {rec.targetMetricLabel}
                    </span>
                    <span className="text-xs font-bold text-[#45D6E8]">
                      {rec.targetMetricValue}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAction(rec)}
                    className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#262626] text-[#F5F5F5] border border-[#262626] hover:border-[#303030] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
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
