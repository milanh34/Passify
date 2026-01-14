// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { errorHandler } from "../utils/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorHandler.captureError(error, {
      severity: "fatal",
      context: {
        source: "ErrorBoundary",
        componentStack: errorInfo.componentStack,
      },
      handled: true,
    });

    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
          </View>

          <Text style={styles.title}>Oops! Something went wrong</Text>

          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>

          {__DEV__ && this.state.error?.stack && (
            <ScrollView style={styles.stackContainer}>
              <Text style={styles.stackTitle}>Stack Trace:</Text>
              <Text style={styles.stackText}>{this.state.error.stack}</Text>
            </ScrollView>
          )}

          <View style={styles.buttonRow}>
            <Pressable onPress={this.handleReset} style={styles.button}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>If this keeps happening, try restarting the app.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stackContainer: {
    maxHeight: 150,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 8,
  },
  stackText: {
    fontSize: 10,
    color: "#666",
    fontFamily: "monospace",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});
