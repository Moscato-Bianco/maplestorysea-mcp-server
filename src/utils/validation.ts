/**
 * Validation utilities for MapleStory API data
 */

import { WORLDS } from '../api/constants';
import {
  SeaCharacterNameError,
  SeaWorldNotFoundError,
  ValidationError as McpValidationError,
} from './errors';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates character name format and content
 */
export function validateCharacterName(characterName: string): void {
  if (!characterName || typeof characterName !== 'string') {
    throw new ValidationError('Character name is required and must be a string');
  }

  const trimmedName = characterName.trim();

  if (trimmedName.length === 0) {
    throw new ValidationError('Character name cannot be empty');
  }

  if (trimmedName.length > 13) {
    throw new ValidationError('Character name cannot exceed 13 characters');
  }

  if (trimmedName.length < 2) {
    throw new ValidationError('Character name must be at least 2 characters');
  }

  // Check for valid characters (English letters and numbers only for SEA)
  const validCharPattern = /^[a-zA-Z0-9]+$/;
  if (!validCharPattern.test(trimmedName)) {
    throw new SeaCharacterNameError(
      trimmedName,
      'Character name can only contain English letters and numbers'
    );
  }

  // Check for invalid character combinations
  const invalidPatterns = [
    /^\d+$/, // Only numbers
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(trimmedName) && trimmedName.length < 4) {
      throw new ValidationError('Character name must be more descriptive');
    }
  }
}

/**
 * Validates world name for SEA region
 */
export function validateWorldName(worldName: string): void {
  if (!worldName || typeof worldName !== 'string') {
    throw new ValidationError('World name is required and must be a string');
  }

  const trimmedWorld = worldName.trim();

  if (!WORLDS.includes(trimmedWorld as any)) {
    throw new SeaWorldNotFoundError(trimmedWorld);
  }
}

/**
 * Validates OCID format
 */
export function validateOcid(ocid: string): void {
  if (!ocid || typeof ocid !== 'string') {
    throw new ValidationError('OCID is required and must be a string');
  }

  const trimmedOcid = ocid.trim();

  if (trimmedOcid.length === 0) {
    throw new ValidationError('OCID cannot be empty');
  }

  // OCID should be a valid format (typically a long string/number)
  if (trimmedOcid.length < 10) {
    throw new ValidationError('OCID format appears to be invalid');
  }
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(date: string): void {
  if (!date || typeof date !== 'string') {
    throw new ValidationError('Date is required and must be a string');
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError('Invalid date provided');
  }

  // Check if the date was auto-corrected by checking if it matches the input
  const dateParts = date.split('-').map(Number);
  if (dateParts.length !== 3) {
    throw new ValidationError('Invalid date format');
  }
  const year = dateParts[0]!;
  const month = dateParts[1]!;
  const day = dateParts[2]!;
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 || // Month is 0-indexed
    parsedDate.getDate() !== day
  ) {
    throw new ValidationError('Invalid date provided');
  }

  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsedDate > today) {
    throw new ValidationError('Date cannot be in the future');
  }

  // Check if date is not too old (e.g., before 2003 when MapleStory launched)
  const minDate = new Date('2003-04-29');
  if (parsedDate < minDate) {
    throw new ValidationError('Date cannot be before MapleStory launch date (2003-04-29)');
  }
}

/**
 * Sanitizes character name by trimming and normalizing
 */
export function sanitizeCharacterName(characterName: string): string {
  if (!characterName || typeof characterName !== 'string') {
    return '';
  }

  return characterName.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Sanitizes guild name for consistent processing
 */
export function sanitizeGuildName(guildName: string): string {
  if (!guildName || typeof guildName !== 'string') {
    return '';
  }

  return guildName.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Sanitizes world name
 */
export function sanitizeWorldName(worldName: string): string {
  if (!worldName || typeof worldName !== 'string') {
    return '';
  }

  return worldName.trim();
}
