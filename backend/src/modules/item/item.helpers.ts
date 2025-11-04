// item.helpers.ts
// Helper functions for the item module

import { ItemFieldValue } from '../../database/entities/item_field_value.entity';
import {
  generateIdTemplate,
  getSegmentAtPosition,
  isValidEditableChar,
  extractSequenceNumber,
} from '../../common/utils/id-generator.util';
import { IdSegment } from '../../database/entities/inventory.entity';

// This function converts any value to a proper boolean (true/false)
export function toBoolean(value: any): boolean {
  return value === true || value === 'true' || value === 1;
}

// This function creates a quick lookup map from field ID to field object for fast access
export function createFieldMap(customFields: any[]): Map<string, any> {
  return new Map(customFields.map((field) => [field.id.toString(), field]));
}

// This function creates a single field value entity and stores it in the correct column based on type
export function createFieldValue(
  itemId: string,
  fieldId: number,
  value: any,
  fieldType: string,
): ItemFieldValue {
  const fieldValue = new ItemFieldValue();
  fieldValue.itemId = itemId;
  fieldValue.fieldId = fieldId;

  if (fieldType === 'number') fieldValue.valueNumber = Number(value);
  else if (fieldType === 'boolean') fieldValue.valueBoolean = toBoolean(value);
  else fieldValue.valueText = String(value);

  return fieldValue;
}

// This function creates multiple field values at once from a fields object
export function createFieldValues(
  itemId: string,
  fields: any,
  fieldMap: Map<string, any>,
): ItemFieldValue[] {
  return Object.entries(fields)
    .map(([fieldIdStr, value]) => {
      const fieldDef = fieldMap.get(fieldIdStr);
      if (!fieldDef) return null;

      return createFieldValue(
        itemId,
        parseInt(fieldIdStr, 10),
        value,
        fieldDef.type,
      );
    })
    .filter((field): field is ItemFieldValue => field !== null);
}

// This function updates an existing field value by clearing old data and setting the new value in the correct column
export function updateSingleFieldValue(
  fieldValue: ItemFieldValue,
  newValue: any,
  fieldType: string,
): void {
  // Clear all value columns first
  fieldValue.valueText = null as any;
  fieldValue.valueNumber = null as any;
  fieldValue.valueBoolean = null as any;

  // Set the appropriate value column
  if (fieldType === 'number') fieldValue.valueNumber = Number(newValue);
  else if (fieldType === 'boolean')
    fieldValue.valueBoolean = toBoolean(newValue);
  else fieldValue.valueText = String(newValue);
}

// ========== FORMATTING FOR RESPONSE ==========

// This function formats custom field definitions for API response, sorted by display order
export function formatFieldDefinitions(customFields: any[]): any[] {
  return customFields
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((field) => ({
      id: field.id,
      title: field.title,
      type: field.type,
      description: field.description,
      showInTable: field.showInTable,
      orderIndex: field.orderIndex,
    }));
}

// This function extracts the actual value from a field value entity based on its type
export function getFieldValue(fieldValue: any): any {
  if (fieldValue.field.type === 'number') return fieldValue.valueNumber;
  if (fieldValue.field.type === 'boolean') return fieldValue.valueBoolean;
  return fieldValue.valueText;
}

// This function formats a complete item with all its field values for API response
export function formatItemForResponse(item: any): any {
  const fields: any = {};

  if (item.fieldValues) {
    item.fieldValues.forEach((fv) => {
      const key = fv.field.title;
      fields[key] = getFieldValue(fv);
    });
  }

  return {
    id: item.id,
    inventoryId: item.inventoryId,
    customId: item.customId,
    likes: item.likes,
    version: item.version,
    fields,
  };
}

// This function validates whether a custom ID edit is allowed by checking each character position
export function validateCustomIdEdit(
  oldCustomId: string,
  newCustomId: string,
  idFormat: IdSegment[],
): { valid: boolean; message: string } {
  if (!newCustomId || newCustomId.length === 0) {
    return { valid: false, message: 'Custom ID cannot be empty' };
  }

  if (oldCustomId === newCustomId) {
    return { valid: true, message: 'No changes detected' };
  }

  // Generate template to know which positions are editable (marked as 'x')
  const template = generateIdTemplate(idFormat);

  if (template.length !== newCustomId.length) {
    return {
      valid: false,
      message: `Custom ID must be ${template.length} characters`,
    };
  }

  // Validate each character position
  for (let i = 0; i < template.length; i++) {
    const templateChar = template[i];
    const oldChar = oldCustomId[i];
    const newChar = newCustomId[i];

    if (templateChar !== 'x') {
      // Fixed position - must match original
      if (newChar !== oldChar) {
        return {
          valid: false,
          message: `Character at position ${i + 1} cannot be changed`,
        };
      }
    } else {
      // Editable position - validate character type
      const segmentInfo = getSegmentAtPosition(i, idFormat);
      if (!segmentInfo || !isValidEditableChar(newChar, segmentInfo)) {
        return {
          valid: false,
          message: `Invalid character at position ${i + 1}`,
        };
      }
    }
  }

  return { valid: true, message: 'Valid edit' };
}

// This function checks if the sequence number part of the custom ID has changed
export function hasSequenceSegmentChanged(
  oldCustomId: string,
  newCustomId: string,
  idFormat: IdSegment[],
): boolean {
  const template = generateIdTemplate(idFormat);
  const hasSequence = idFormat.some((segment) => segment.type === 'sequence');

  if (!hasSequence) return false;

  // Check if any sequence character changed
  for (let i = 0; i < template.length; i++) {
    if (template[i] === 'x') {
      const segmentInfo = getSegmentAtPosition(i, idFormat);
      if (
        segmentInfo?.segment.type === 'sequence' &&
        oldCustomId[i] !== newCustomId[i]
      ) {
        return true;
      }
    }
  }

  return false;
}

// This function extracts the sequence number value from a custom ID string
export function extractSequenceNumberFromId(
  customId: string,
  idFormat: IdSegment[],
): number {
  return extractSequenceNumber(customId, idFormat);
}

// This function validates if a custom ID matches the inventory's format structure
export function validateCustomIdFormat(
  customId: string,
  idFormat: IdSegment[],
): { valid: boolean; message: string } {
  const template = generateIdTemplate(idFormat);

  if (template.length !== customId.length) {
    return {
      valid: false,
      message: `Custom ID must be ${template.length} characters`,
    };
  }

  // Check format validity using template
  for (let i = 0; i < template.length; i++) {
    if (template[i] === 'x') {
      const segmentInfo = getSegmentAtPosition(i, idFormat);
      if (!segmentInfo || !isValidEditableChar(customId[i], segmentInfo)) {
        return {
          valid: false,
          message: `Invalid character at position ${i + 1}`,
        };
      }
    }
  }

  return { valid: true, message: 'Custom ID format is valid' };
}

// This function formats raw contributor data into clean objects with parsed counts
export function formatTopContributors(contributors: any[]): any[] {
  return contributors.map((c) => ({
    userId: c.userId,
    name: c.userName,
    itemCount: parseInt(c.itemCount),
  }));
}

// This function formats monthly growth statistics with parsed year and count values
export function formatMonthlyGrowth(monthlyData: any[]): any[] {
  return monthlyData.map((m) => ({
    month: m.month,
    year: parseInt(m.year),
    count: parseInt(m.count),
  }));
}

// This function formats numeric field statistics (average, min, max, total) from raw database results
export function formatNumericFieldStats(stats: any): any {
  return {
    avg: parseFloat(stats.avg) || 0,
    min: parseFloat(stats.min) || 0,
    max: parseFloat(stats.max) || 0,
    total: parseFloat(stats.total) || 0,
  };
}
