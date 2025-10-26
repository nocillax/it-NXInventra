# Toast Notification TODO List

This document outlines all the places where toast notifications (for both success and error states) should be implemented to provide clear user feedback for various actions.

## Inventory Management

### 1. Inventory Creation

- **File**: `components/inventory/InventoryToolbar.tsx` (or the component handling new inventory creation)
- **Action**: `CREATE`
- **Toast**: Show a "Inventory created successfully" toast on success and a failure message on error.

### 2. Inventory Deletion

- **File**: `components/inventory/InventoryToolbar.tsx` (or wherever deletion is handled)
- **Action**: `DELETE`
- **Toast**: Show a "Inventory deleted" toast on success and a failure message on error.

### 3. Inventory Settings Update

- **File**: `components/settings/InventorySettingsForm.tsx`
- **Action**: `UPDATE`
- **Toast**: Show "Settings saved" on success. (Already implemented)

### 4. Custom Field Management

- **File**: `components/fields/CustomFieldsEditor.tsx`
- **Action**: `CREATE` (Add Field)
- **Toast**: Show "Field added successfully" on success.
- **File**: `components/fields/FieldList.tsx`
- **Action**: `UPDATE` (Reorder Fields)
- **Toast**: Show "Field order updated" on success. (Already implemented)
- **File**: `components/fields/FieldDeleteDialog.tsx`
- **Action**: `DELETE`
- **Toast**: Show "Field deleted" on success. (Already implemented)

### 5. Custom ID Format

- **File**: `components/customId/IDBuilder.tsx`
- **Action**: `UPDATE`
- **Toast**: Show "ID format updated" on success. (Already implemented)

## Item Management

### 1. Item CRUD

- **File**: `components/item/ItemCreateDialog.tsx` -> `CREATE` (Already implemented)
- **File**: `components/item/ItemEditDialog.tsx` -> `UPDATE` (Already implemented)
- **File**: `components/item/ItemDeleteDialog.tsx` -> `DELETE` (Bulk and single) (Already implemented)

## Access & Permissions

### 1. Collaborator Management

- **File**: `components/access/AccessList.tsx`
- **Action**: `UPDATE` (Change user role)
- **Toast**: Show "User role updated" on success. (Already implemented)
- **Action**: `DELETE` (Remove user)
- **Toast**: Show "User removed from inventory" on success.
- **File**: `components/access/AccessInvite.tsx` (or equivalent)
- **Action**: `CREATE` (Invite user)
- **Toast**: Show "Invitation sent" on success.

### 2. Visibility Toggle

- **File**: `components/access/VisibilityToggle.tsx`
- **Action**: `UPDATE` (Toggle public/private)
- **Toast**: Show "Inventory is now Public/Private" on success. (Already implemented)

## User Profile

- **File**: `app/[locale]/profile/page.tsx` (or `components/profile/ProfileForm.tsx`)
- **Action**: `UPDATE` (Save user name)
- **Toast**: Show "Profile updated successfully" on success.
- **Action**: `DELETE` (Delete account)
- **Toast**: Show "Account deleted successfully" on success.
