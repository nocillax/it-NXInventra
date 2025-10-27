# Backend API Documentation

## Authentication Module

### OAuth2 Endpoints

| Method | Endpoint                | Description                                                                                                       | Permissions | Request DTO | Success Response         |
| ------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- | ----------- | ------------------------ |
| GET    | `/auth/google`          | Redirects the user to the Google OAuth2 consent screen                                                            | -           | -           | Redirect                 |
| GET    | `/auth/github`          | Redirects the user to the GitHub OAuth2 consent screen                                                            | -           | -           | Redirect                 |
| GET    | `/auth/google/callback` | Handles the OAuth callback from Google. Creates/updates the user, signs a JWT, and sets it in an HTTP-only cookie | -           | -           | Redirect to FRONTEND_URL |
| GET    | `/auth/github/callback` | Handles the OAuth callback from GitHub. Creates/updates the user, signs a JWT, and sets it in an HTTP-only cookie | -           | -           | Redirect to FRONTEND_URL |
| GET    | `/auth/me`              | Returns the currently authenticated user's profile from the JWT payload                                           | Protected   | -           | User object              |
| POST   | `/auth/logout`          | Clears the authentication cookie                                                                                  | Protected   | -           | `{ success: true }`      |

## User Management Module

| Method | Endpoint    | Description                                                                                                                                                                                                                    | Permissions | Request DTO | Success Response    |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------- | ------------------- |
| GET    | `/users`    | Returns a list of all users for collaborator selection                                                                                                                                                                         | Protected   | -           | User[]              |
| DELETE | `/users/me` | Deletes the currently authenticated user. **Logic**: If the user is the sole owner of any inventories, those inventories (and all related items, comments, etc.) are deleted. Otherwise, only their access records are removed | Protected   | -           | `{ success: true }` |

## Inventory Management Module

| Method | Endpoint           | Description                                                                                                                                                    | Permissions            | Request DTO        | Success Response                     |
| ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------ | ------------------------------------ |
| GET    | `/inventories`     | Lists all public inventories. Supports pagination (`?page=`, `?limit=`), sorting (`?sort=`), and full-text search (`?search=`) on title, description, and tags | -                      | -                  | Inventory[] with pagination metadata |
| GET    | `/inventories/:id` | Gets a single inventory by its ID, including its customFields and idFormat. Access is checked (must be public or user must have access)                        | Protected              | -                  | Inventory object                     |
| POST   | `/inventories`     | Creates a new inventory. The owner_id is set to the authenticated user                                                                                         | Protected              | CreateInventoryDto | The newly created Inventory object   |
| PUT    | `/inventories/:id` | Updates an inventory's settings (title, description, category, tags, public status, idFormat, customFields)                                                    | Protected (Owner only) | UpdateInventoryDto | The updated Inventory object         |
| DELETE | `/inventories/:id` | Deletes an inventory and all its related entities (items, comments, access records) via cascade delete                                                         | Protected (Owner only) | -                  | `{ success: true }`                  |

## Item Management Module

| Method | Endpoint                 | Description                                                                                                          | Permissions              | Request DTO   | Success Response                |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------- | ------------------------------- |
| GET    | `/inventories/:id/items` | Lists all items for a given inventory. Supports pagination, sorting, and filtering on item fields. Access is checked | Protected                | -             | Item[] with pagination metadata |
| POST   | `/inventories/:id/items` | Creates a new item in an inventory. The backend generates and assigns the custom_id                                  | Protected (Owner/Editor) | CreateItemDto | The newly created Item object   |
| PUT    | `/items/:itemId`         | Updates the fields of a specific item                                                                                | Protected (Owner/Editor) | UpdateItemDto | The updated Item object         |
| DELETE | `/items/:itemId`         | Deletes a specific item                                                                                              | Protected (Owner/Editor) | -             | `{ success: true }`             |

## Comment System Module

| Method | Endpoint                    | Description                                                                              | Permissions                         | Request DTO      | Success Response                 |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- | ---------------- | -------------------------------- |
| GET    | `/inventories/:id/comments` | Fetches all comments for an inventory. Access is checked                                 | Protected                           | -                | Comment[]                        |
| POST   | `/inventories/:id/comments` | Adds a new comment to an inventory. Broadcasts the new comment via the Socket.io gateway | Protected (Owner/Editor)            | CreateCommentDto | The newly created Comment object |
| DELETE | `/comments/:commentId`      | Deletes a specific comment                                                               | Protected (Owner or comment author) | -                | `{ success: true }`              |

## Access Control Module

| Method | Endpoint                          | Description                                               | Permissions            | Request DTO     | Success Response              |
| ------ | --------------------------------- | --------------------------------------------------------- | ---------------------- | --------------- | ----------------------------- |
| GET    | `/inventories/:id/access`         | Lists all users and their roles for a specific inventory  | Protected (Owner only) | -               | Access[] (with user details)  |
| POST   | `/inventories/:id/access`         | Adds a collaborator to an inventory or updates their role | Protected (Owner only) | CreateAccessDto | The new/updated Access object |
| DELETE | `/inventories/:id/access/:userId` | Removes a collaborator's access from an inventory         | Protected (Owner only) | -               | `{ success: true }`           |

## Statistics Module

| Method | Endpoint                 | Description                                                                                                               | Permissions | Request DTO | Success Response  |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------- | ----------------- |
| GET    | `/inventories/:id/stats` | Calculates and returns aggregate data for an inventory (total items, averages of numeric fields, etc.). Access is checked | Protected   | -           | Statistics object |

## Global Search Module

| Method | Endpoint  | Description                                                                                                                                     | Permissions | Request DTO | Success Response |
| ------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------- | ---------------- |
| GET    | `/search` | Performs a global, debounced search across all inventories (title, description, tags) and items (custom ID, fields) that the user has access to | Protected   | -           | `(Inventory`     |

## Real-time Communication (Socket.io)

| Namespace     | Event     | Description                                            | Permissions | Response                |
| ------------- | --------- | ------------------------------------------------------ | ----------- | ----------------------- |
| `/discussion` | `message` | Handles real-time communication for the discussion tab | Protected   | `new_message` broadcast |

---

## Notes

- **Protected**: Requires valid JWT authentication
- **Owner only**: User must be the owner of the inventory
- **Owner/Editor**: User must have owner or editor role for the inventory
- All DTOs include appropriate validation
- All responses include proper error handling and HTTP status codes
- Pagination responses include metadata (total count, current page, total pages, etc.)
