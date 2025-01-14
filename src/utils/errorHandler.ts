// src/utils/errorHandler.ts

import { Platform } from "react-native";

export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  context?: Record<string, any>;
  handled: boolean;
}

type ErrorCallback = (error: AppError) => void;

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private readonly maxLogSize = 100;
  private listeners: Set<ErrorCallback> = new Set();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;

    this.setupGlobalHandlers();
    this.isInitialized = true;
    console.log("🛡️ Global error handler initialized");
  }

  private setupGlobalHandlers(): void {
    const RNGlobal = global as typeof globalThis & {
      ErrorUtils?: {
        setGlobalHandler?: (callback: (error: Error, isFatal?: boolean) => void) => void;
        getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | null;
      };
      onunhandledrejection?: (event: any) => void;
    };

    const originalHandler = RNGlobal.ErrorUtils?.getGlobalHandler?.();

    RNGlobal.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
      this.captureError(error, {
        severity: isFatal ? "fatal" : "error",
        context: { source: "globalHandler", isFatal },
      });

      if (__DEV__ && originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    const originalRejectionHandler = RNGlobal.onunhandledrejection;

    RNGlobal.onunhandledrejection = (event: any) => {
      const error = event?.reason || new Error("Unhandled Promise Rejection");
      this.captureError(error, {
        severity: "error",
        context: { source: "unhandledRejection" },
      });

      if (originalRejectionHandler) {
        originalRejectionHandler(event);
      }
    };
  }

  captureError(
    error: Error | string,
    options: {
      severity?: ErrorSeverity;
      code?: string;
      context?: Record<string, any>;
      handled?: boolean;
    } = {}
  ): AppError {
    const appError: AppError = {
      message: error instanceof Error ? error.message : String(error),
      code: options.code,
      severity: options.severity || "error",
      timestamp: Date.now(),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        platform: Platform.OS,
        ...options.context,
      },
      handled: options.handled ?? false,
    };

    this.logError(appError);
    this.notifyListeners(appError);

    return appError;
  }

  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    const logPrefix = `[${error.severity.toUpperCase()}]`;
    const logMessage = `${logPrefix} ${error.message}`;

    switch (error.severity) {
      case "info":
        console.info(logMessage, error.context);
        break;
      case "warning":
        console.warn(logMessage, error.context);
        break;
      case "error":
      case "fatal":
        console.error(logMessage, error.stack || error.context);
        break;
    }
  }

  private notifyListeners(error: AppError): void {
    this.listeners.forEach((callback) => {
      try {
        callback(error);
      } catch (e) {
        console.error("Error in error listener:", e);
      }
    });
  }

  addListener(callback: ErrorCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  clearErrors(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

export async function safeAsync<T>(
  operation: () => Promise<T>,
  options: {
    fallback?: T;
    context?: string;
    rethrow?: boolean;
    onError?: (error: Error) => void;
  } = {}
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error: any) {
    errorHandler.captureError(error, {
      severity: "error",
      context: { operation: options.context },
      handled: true,
    });

    if (options.onError) {
      options.onError(error);
    }

    if (options.rethrow) {
      throw error;
    }

    return options.fallback;
  }
}

export function safeSync<T>(
  operation: () => T,
  options: {
    fallback?: T;
    context?: string;
    rethrow?: boolean;
  } = {}
): T | undefined {
  try {
    return operation();
  } catch (error: any) {
    errorHandler.captureError(error, {
      severity: "error",
      context: { operation: options.context },
      handled: true,
    });

    if (options.rethrow) {
      throw error;
    }

    return options.fallback;
  }
}

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      errorHandler.captureError(error, {
        severity: "error",
        context: { handler: context },
        handled: true,
      });
    }
  }) as T;
}
