"use client";

import { Component, ErrorInfo, ReactNode } from "react";

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
          <div className="section-view surface-container p-8 md:p-12 text-center shadow-2xl animate-in fade-in duration-normal">
            <h2 className="label-mono-small text-accent-2 mb-8">
              System Error
            </h2>
            <p className="app-label lowercase tracking-nav mb-10 leading-loose">
              An unexpected error occurred in this component.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary"
            >
              Try Recovery
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
