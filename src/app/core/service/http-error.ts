import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }
  if (error.status === 0) {
    return 'Cannot reach the server. Check that the API is running.';
  }

  const body = error.error;
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed && !trimmed.startsWith('<')) {
      return trimmed;
    }
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const fieldMessage = fieldErrors(record['errors']);
    if (fieldMessage) {
      return fieldMessage;
    }
    const message = readable(record['message']);
    if (message && !message.startsWith('Validation failed')) {
      return message;
    }
    const detail = readable(record['detail']);
    if (detail) {
      return detail;
    }
    if (message) {
      return message;
    }
  }

  if (error.status === 401) {
    return 'Incorrect email or password.';
  }
  if (error.status === 409) {
    return 'An account with this email already exists.';
  }
  return 'Something went wrong. Please try again.';
}

function fieldErrors(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return '';
        }
        const entry = item as Record<string, unknown>;
        return readable(entry['defaultMessage'] ?? entry['message']);
      })
      .filter(Boolean)
      .join(' ');
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => readable(item))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

function readable(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
