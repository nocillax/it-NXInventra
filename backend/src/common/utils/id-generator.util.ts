//--------------------------------------------------------------------------------------------------------------
import { randomBytes, randomUUID } from 'crypto';
import { IdSegment } from 'src/database/entities/inventory.entity';

// ========== TEMPLATE-BASED GENERATION ==========

export function generateCustomId(
  idFormat: IdSegment[],
  nextSequence: number,
): string {
  const template = generateIdTemplate(idFormat);
  const values = generateValuesForTemplate(idFormat, nextSequence);
  return fillTemplate(template, values);
}

function generateValuesForTemplate(
  idFormat: IdSegment[],
  nextSequence: number,
): string[] {
  const values: string[] = [];

  for (const segment of idFormat) {
    switch (segment.type) {
      case 'sequence':
        const seqBaseLength = getSequenceBaseLength(segment.format);
        const seqValue = String(nextSequence).padStart(seqBaseLength, '0');
        values.push(...seqValue.split(''));
        break;

      case 'random_6digit':
        const r6 = String(Math.floor(100000 + Math.random() * 900000));
        values.push(...r6.split(''));
        break;

      case 'random_9digit':
        const r9 = String(Math.floor(100000000 + Math.random() * 900000000));
        values.push(...r9.split(''));
        break;

      case 'random_20bit':
        const r20 = randomBytes(3).readUIntBE(0, 3) & 0xfffff;
        if (segment.format?.startsWith('X')) {
          const hexValue = r20.toString(16).toUpperCase().padStart(5, '0');
          values.push(...hexValue.split(''));
        } else {
          const decValue = r20.toString().padStart(6, '0');
          values.push(...decValue.split(''));
        }
        break;

      case 'random_32bit':
        const r32 = randomBytes(4).readUInt32BE(0);
        if (segment.format?.startsWith('X')) {
          const hexValue = r32.toString(16).toUpperCase().padStart(8, '0');
          values.push(...hexValue.split(''));
        } else {
          const decValue = r32.toString().padStart(10, '0');
          values.push(...decValue.split(''));
        }
        break;

      case 'guid':
        const guid = randomUUID();
        values.push(...guid.split(''));
        break;

      case 'date':
        const now = new Date();
        let dateStr = segment.format || 'yyyy-MM-dd';
        dateStr = dateStr.replace(/yyyy/g, now.getUTCFullYear().toString());
        dateStr = dateStr.replace(
          /mm/g,
          String(now.getUTCMonth() + 1).padStart(2, '0'),
        );
        dateStr = dateStr.replace(
          /ddd/g,
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getUTCDay()],
        );
        dateStr = dateStr.replace(
          /dd/g,
          String(now.getUTCDate()).padStart(2, '0'),
        );
        values.push(...dateStr.split(''));
        break;

      default:
        // For fixed segments, no values to add (they're in the template)
        break;
    }
  }

  return values;
}

function fillTemplate(template: string, values: string[]): string {
  let result = '';
  let valueIndex = 0;

  for (let i = 0; i < template.length; i++) {
    if (template[i] === 'x') {
      result += values[valueIndex];
      valueIndex++;
    } else {
      result += template[i]; // Fixed chars and suffixes
    }
  }

  return result;
}

// ========== TEMPLATE GENERATION ==========

function isValidDateChar(char: string, format?: string): boolean {
  if (!format) return /[0-9]/.test(char);

  if (format === 'ddd') {
    return /[A-Za-z]/.test(char); // Letters for day names
  }

  return /[0-9]/.test(char); // Digits for everything else
}

export function generateIdTemplate(idFormat: IdSegment[]): string {
  return idFormat.map((segment) => generateSegmentTemplate(segment)).join('');
}

function generateSegmentTemplate(segment: IdSegment): string {
  switch (segment.type) {
    case 'fixed':
      return segment.value || '';

    case 'date':
      const dateLength = getDateSegmentLength(segment.format);
      return 'x'.repeat(dateLength);

    case 'sequence':
      const seqBaseLength = getSequenceBaseLength(segment.format);
      return applySuffixToTemplate('x'.repeat(seqBaseLength), segment.format);

    case 'random_6digit':
      return applySuffixToTemplate('x'.repeat(6), segment.format);

    case 'random_9digit':
      return applySuffixToTemplate('x'.repeat(9), segment.format);

    case 'random_20bit':
      const length20 = segment.format?.startsWith('X') ? 5 : 6;
      return applySuffixToTemplate('x'.repeat(length20), segment.format);

    case 'random_32bit':
      const length32 = segment.format?.startsWith('X') ? 8 : 10;
      return applySuffixToTemplate('x'.repeat(length32), segment.format);

    case 'guid':
      return applySuffixToTemplate('x'.repeat(36), segment.format);

    default:
      return '';
  }
}

function applySuffixToTemplate(baseTemplate: string, format?: string): string {
  if (!format) return baseTemplate;

  // Extract suffix (everything after the base pattern like "X5", "D4")
  const baseMatch = format.match(/^[a-zA-Z]*\d*/);
  if (baseMatch) {
    const suffix = format.substring(baseMatch[0].length);
    return baseTemplate + suffix;
  }

  return baseTemplate;
}

// ========== VALIDATION & PARSING ==========

export function getSegmentAtPosition(
  position: number,
  idFormat: IdSegment[],
): { segment: IdSegment; positionInSegment: number } | null {
  let currentPos = 0;
  for (const segment of idFormat) {
    const segmentTemplate = generateSegmentTemplate(segment);
    const segmentLength = segmentTemplate.length;

    if (position >= currentPos && position < currentPos + segmentLength) {
      return {
        segment,
        positionInSegment: position - currentPos,
      };
    }
    currentPos += segmentLength;
  }
  return null;
}

export function isValidEditableChar(
  char: string,
  segmentInfo: { segment: IdSegment; positionInSegment: number },
): boolean {
  const { segment, positionInSegment } = segmentInfo;
  const segmentTemplate = generateSegmentTemplate(segment);

  // Check if this position is editable (not a suffix)
  if (segmentTemplate[positionInSegment] !== 'x') {
    return false; // This is a suffix character, should be handled as fixed
  }

  // Validate based on segment type
  switch (segment.type) {
    case 'sequence':
      return /[0-9]/.test(char);

    case 'random_20bit':
    case 'random_32bit':
      if (segment.format?.startsWith('X')) {
        return /[0-9A-Fa-f]/.test(char);
      }
      return /[0-9]/.test(char);

    case 'random_6digit':
    case 'random_9digit':
      return /[0-9]/.test(char);

    case 'guid':
      // For GUID, all positions in the base are hex except hyphens
      const guidPositions = [8, 13, 18, 23];
      if (guidPositions.includes(positionInSegment)) {
        return char === '-';
      }
      return /[0-9A-Fa-f]/.test(char);

    case 'date':
      return isValidDateChar(char, segment.format);

    default:
      return false;
  }
}

export function extractSequenceNumber(
  customId: string,
  idFormat: IdSegment[],
): number {
  const template = generateIdTemplate(idFormat);
  let sequenceValue = '';
  let currentPos = 0;

  // Find the sequence segment and extract its numeric part
  for (const segment of idFormat) {
    const segmentTemplate = generateSegmentTemplate(segment);
    const segmentLength = segmentTemplate.length;

    if (segment.type === 'sequence') {
      // Extract only the 'x' positions (ignore suffixes)
      for (let i = 0; i < segmentTemplate.length; i++) {
        if (segmentTemplate[i] === 'x') {
          sequenceValue += customId[currentPos + i];
        }
      }
      return parseInt(sequenceValue, 10) || 1;
    }

    currentPos += segmentLength;
  }

  return 1;
}

// ========== HELPER FUNCTIONS ==========

function getDateSegmentLength(format?: string): number {
  const formatMap = {
    yyyy: 4,
    mm: 2,
    dd: 2,
    ddd: 3,
    'yyyy-mm': 7,
    'yyyy-mm-dd': 10,
    yy: 2,
  };
  return format ? formatMap[format] || format.length : 4; // Default to 4 if undefined
}

function getSequenceBaseLength(format?: string): number {
  if (format?.startsWith('D')) {
    return parseInt(format.substring(1), 10);
  }
  return 1;
}
