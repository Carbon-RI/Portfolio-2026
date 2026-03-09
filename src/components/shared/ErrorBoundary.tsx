"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/shared/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      JSON.stringify(this.props.resetKeys) !==
        JSON.stringify(prevProps.resetKeys)
    ) {
      this.setState({ hasError: false });
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col justify-center items-center text-center transition-all duration-normal surface-container p-8 md:p-12 shadow-2xl animate-in fade-in lg:min-h-(--content-height-no-footer)">
            <h2 className="label-mono-small text-accent-2 mb-8">
              System Error
            </h2>
            <p className="app-label lowercase tracking-nav mb-10 leading-loose">
              An unexpected error occurred in this component.
            </p>
            <Button
              variant="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Recovery
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
