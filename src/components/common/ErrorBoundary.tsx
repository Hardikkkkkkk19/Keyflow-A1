import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[KEYFLOW Error Boundary Caught Error]:", error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  handleReload = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] bg-radial-atmosphere flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-[#151515] border border-[#18C69A]/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#18C69A]/10 border border-[#18C69A]/20 text-[#18C69A] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif italic tracking-wide text-[#F5F5F5]">
                KEYFLOW Workspace Notice
              </h1>
              <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">
                KEYFLOW encountered an unexpected view issue. Your session and progression remain
                completely safe.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#18C69A] hover:bg-[#18C69A]/90 text-[#0A0A0A] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#181818] hover:bg-[#1C1C1C] text-[#F5F5F5] border border-[#262626] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
