class ErrorHandler {
  static logError(error: Error, context: string) {
    console.error(`[${context}] ${error.message}`, error);
    // In production, send to monitoring service
  }

  static handleAPIError(error: any, fallbackMessage: string = 'Service temporarily unavailable') {
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return 'Authentication required';
    }
    
    if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || fallbackMessage;
  }

  static validateInput(input: string, type: 'email' | 'phone' | 'text'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'phone':
        return /^\d{10}$/.test(input.replace(/\D/g, ''));
      case 'text':
        return input.trim().length > 0;
      default:
        return false;
    }
  }
}

export { ErrorHandler };