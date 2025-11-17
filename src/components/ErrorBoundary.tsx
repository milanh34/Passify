import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}


interface State {
  hasError: boolean;
  error: Error | null;
}


export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }


  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }


  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 Error caught by boundary:', error);
    console.error('🔴 Error info:', errorInfo);
  }


  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };


  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }


      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable onPress={this.handleReset} style={styles.button}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }


    return this.props.children;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
