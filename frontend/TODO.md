# Toast Notification TODO List

This document outlines all the places where toast notifications (for both success and error states) should be implemented to provide clear user feedback for various actions.

## Inventory Management

### 3. Inventory Settings Update

- **File**: `components/settings/InventorySettingsForm.tsx`
- **Action**: `UPDATE`
- **Toast**: Show "Settings saved" on success. **(VERIFIED - Implemented)**

### 4. Custom Field Management

- **File**: `components/fields/CustomFieldsEditor.tsx`
- **Action**: `CREATE` (Add Field)
- **Toast**: Show "Field added successfully" on success.
- **File**: `components/fields/FieldList.tsx`
- **Action**: `UPDATE` (Reorder Fields)
- **Toast**: Show "Field order updated" on success. **(VERIFIED - Implemented)**
- **File**: `components/fields/FieldDeleteDialog.tsx`
- **Action**: `DELETE`
- **Toast**: Show "Field deleted" on success. **(VERIFIED - Implemented)**

### 5. Custom ID Format

- **File**: `components/customId/IDBuilder.tsx`
- **Action**: `UPDATE`
- **Toast**: Show "ID format updated" on success. **(VERIFIED - Implemented)**

## Item Management

### 1. Item CRUD

- **File**: `components/item/ItemCreateDialog.tsx` -> `CREATE` **(VERIFIED - Implemented)**
- **File**: `components/item/ItemEditDialog.tsx` -> `UPDATE` **(VERIFIED - Implemented)**
- **File**: `components/item/ItemDeleteDialog.tsx` -> `DELETE` (Bulk and single) **(VERIFIED - Implemented)**

## Access & Permissions

### 1. Collaborator Management

- **File**: `components/access/AccessList.tsx`
- **Action**: `UPDATE` (Change user role)
- **Toast**: Show "User role updated" on success. **(VERIFIED - Implemented)**
- **Action**: `DELETE` (Remove user)
- **Toast**: Show "User removed from inventory" on success.
- **File**: `components/access/AccessInvite.tsx` (or equivalent)
- **Action**: `CREATE` (Invite user)
- **Toast**: Show "Invitation sent" on success.

### 2. Visibility Toggle

- **File**: `components/access/VisibilityToggle.tsx`
- **Action**: `UPDATE` (Toggle public/private)
- **Toast**: Show "Inventory is now Public/Private" on success. **(VERIFIED - Implemented)**

## User Profile

- **File**: `app/[locale]/profile/page.tsx` (or `components/profile/ProfileForm.tsx`)
- **Action**: `UPDATE` (Save user name)
- **Toast**: Show "Profile updated successfully" on success.
- **Action**: `DELETE` (Delete account)
- **Toast**: Show "Account deleted successfully" on success.

## Discussion

- **File**: `components/discussion/CommentForm.tsx`
- **Action**: `CREATE` (Post comment)
- **Toast**: Show "Comment posted" on success. **(VERIFIED - Implemented)**
