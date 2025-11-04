// inventory.helpers.ts
// Helper functions for the inventory module

import {
  CustomFieldType,
  CustomField,
} from '../../database/entities/custom_field.entity';
import { IdSegment, Inventory } from '../../database/entities/inventory.entity';
import { Tag } from '../../database/entities/tag.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';

// This function maps DTO field types to database custom field types
export function mapCustomFieldType(dtoType: string): CustomFieldType {
  const typeMap = {
    longtext: 'textarea' as CustomFieldType,
    url: 'link' as CustomFieldType,
    text: 'text' as CustomFieldType,
    number: 'number' as CustomFieldType,
    boolean: 'boolean' as CustomFieldType,
  };
  return typeMap[dtoType] || 'text';
}

// This function extracts valid numeric field IDs from custom fields array
export function extractCustomFieldIds(customFields: any[]): Set<number> {
  return new Set(
    customFields.map((f) => parseInt(f.id, 10)).filter((id) => !isNaN(id)),
  );
}

// This function creates a custom field entity with proper ordering and type mapping
export function createCustomFieldEntity(
  fieldDto: any,
  inventoryId: string,
  index: number,
): any {
  return {
    id: fieldDto.id ? parseInt(fieldDto.id, 10) : undefined,
    inventoryId,
    orderIndex: index,
    title: fieldDto.title,
    type: mapCustomFieldType(fieldDto.type),
    showInTable: fieldDto.showInTable,
    description: fieldDto.description,
  };
}

// This function creates an inventory entity with default ID format and prepared data
export function createInventoryEntityData(
  createInventoryDto: CreateInventoryDto,
  userId: string,
): Partial<Inventory> {
  const { tags, ...dtoWithoutTags } = createInventoryDto;

  return {
    ...dtoWithoutTags,
    createdBy: userId,
    idFormat: [
      { id: 'seg1', type: 'fixed', value: 'ITEM-' },
      { id: 'seg2', type: 'sequence', format: 'D3' },
    ],
  };
}

// This function checks for duplicate field titles in an array
export function validateNoDuplicateTitles(fields: Array<{ title: string }>): {
  valid: boolean;
  duplicates: string[];
} {
  const fieldTitles = fields.map((f) => f.title.toLowerCase());
  const duplicateTitles = fieldTitles.filter(
    (title, index) => fieldTitles.indexOf(title) !== index,
  );

  return {
    valid: duplicateTitles.length === 0,
    duplicates: duplicateTitles,
  };
}

// This function formats access records for API response with user details
export function formatAccessList(accessList: any[]): any[] {
  return accessList.map((access) => ({
    userId: access.userId,
    userName: access.user.name,
    userEmail: access.user.email,
    role: access.role,
    createdAt: access.createdAt,
  }));
}

// This function converts ID format segments array to a readable string pattern
export function generateIdFormatString(idFormat: IdSegment[]): string {
  const formatParts = idFormat.map((segment) => {
    if (segment.type === 'fixed') {
      return segment.value || '';
    } else if (segment.type === 'sequence') {
      // Extract format like "D3" -> "###"
      const format = segment.format || 'D3';
      const length = parseInt(format.substring(1)) || 3;
      return '#'.repeat(length);
    } else if (segment.type === 'random_6digit') {
      return 'rand6';
    } else if (segment.type === 'random_9digit') {
      return 'rand9';
    } else {
      // For all other types (date, random_20bit, random_32bit, guid)
      return segment.format || segment.type;
    }
  });

  return formatParts.join('');
}

// This function creates a standardized pagination response object
export function createPaginationResponse(
  data: any[],
  page: number,
  limit: number,
  total: number,
  dataKey: string = 'items',
): any {
  return {
    [dataKey]: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// This function separates tag names into existing and new tags
export function categorizeTagNames(
  tagNames: string[],
  existingTags: Tag[],
): { newTagNames: string[]; existingTagNames: Set<string> } {
  const existingTagNames = new Set(existingTags.map((tag) => tag.name));
  const newTagNames = tagNames.filter((name) => !existingTagNames.has(name));

  return { newTagNames, existingTagNames };
}

// This function creates tag entities from tag name strings
export function createTagEntities(tagNames: string[]): Tag[] {
  return tagNames.map((name) => {
    const tag = new Tag();
    tag.name = name;
    return tag;
  });
}

// This function identifies which custom fields need to be deleted during an update
export function identifyFieldsToDelete(
  existingFields: CustomField[],
  incomingFieldIds: Set<number>,
): CustomField[] {
  return existingFields.filter((f) => !incomingFieldIds.has(f.id));
}

// This function calculates the next orderIndex for new custom fields
export function calculateNextOrderIndex(existingFields: CustomField[]): number {
  if (existingFields.length === 0) return 0;
  const highestOrderIndex = Math.max(
    ...existingFields.map((f) => f.orderIndex || 0),
  );
  return highestOrderIndex + 1;
}

// This function creates multiple custom field entities with calculated order indices
export function createCustomFieldEntities(
  fields: any[],
  inventoryId: string,
  startingOrderIndex: number,
): Partial<CustomField>[] {
  return fields.map((fieldDto, index) => {
    const orderIndex =
      fieldDto.orderIndex !== undefined
        ? fieldDto.orderIndex
        : startingOrderIndex + index;

    return createCustomFieldEntity(
      { ...fieldDto, orderIndex },
      inventoryId,
      orderIndex,
    );
  });
}

// This function calculates the skip value for pagination queries
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

// This function builds the NOT EXISTS subquery to exclude inventories where user is owner
export function buildNotOwnerSubQuery(qb: any): string {
  const subQuery = qb
    .subQuery()
    .select('1')
    .from('access', 'access')
    .where('access.inventoryId = inventory.id')
    .andWhere('access.userId = :userId')
    .andWhere('access.role = :role')
    .getQuery();
  return `NOT EXISTS (${subQuery})`;
}

// This function builds the tag filter subquery for inventory search
export function buildTagFilterSubQuery(qb: any): string {
  const subQuery = qb
    .subQuery()
    .select('1')
    .from('inventory_tags', 'it')
    .innerJoin('tags', 't', 't.id = it.tag_id')
    .where('it.inventory_id = inventory.id')
    .andWhere('t.name IN (:...tags)')
    .getQuery();
  return `EXISTS (${subQuery})`;
}
