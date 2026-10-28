export interface UserResponse {
  id: number | null;
  email: string;
  firstname: string;
  lastname: string;
  profileImage: string | null;
  role: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstname: string;
  lastname: string;
}

export function normalizeUser(raw: unknown): UserResponse {
  const data = asRecord(raw);
  const nested = data['user'] ?? data['User'];
  const source =
    nested && !data['email'] && !data['Email'] && !data['firstname'] && !data['firstName']
      ? asRecord(nested)
      : data;

  return {
    id: numberOrNull(source['id'] ?? source['Id']),
    email: text(source['email'] ?? source['Email']),
    firstname: text(source['firstname'] ?? source['firstName'] ?? source['Firstname']),
    lastname: text(source['lastname'] ?? source['lastName'] ?? source['Lastname']),
    profileImage: nullableText(source['profileImage'] ?? source['ProfileImage']),
    role: text(source['role'] ?? source['Role']),
    createdAt: createdAtText(source['createdAt'] ?? source['CreatedAt']),
  };
}

export function formatJoined(value: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  return raw as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function nullableText(value: unknown): string | null {
  const result = text(value).trim();
  return result ? result : null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function createdAtText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
  return '';
}
