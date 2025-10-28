> Please update the backend Custom ID generation logic according to the following clarified and finalized project specification:
>
> ---
>
> ### 🎯 **Goal**
>
> Implement a robust, format-aware **Custom ID generator** that supports a predefined list of segment types and allows optional Unicode suffixes or symbols after each segment format.
>
> Custom IDs are generated server-side at item creation and are **unique per inventory** (enforced by a composite unique constraint on `inventory_id + custom_id`).
>
> ---
>
> ### 🔤 **Supported Segment Types**
>
> 1. **Fixed Text**
>    - Type: `"fixed"`
>    - Accepts any Unicode string, including emoji.
>    - Example: `"📚-"` or `"INV_"`
>
> 2. **20-bit Random Number**
>    - Type: `"random_20bit"`
>    - Always generates a random number from `0–1,048,575`.
>    - Optional format suffix:
>      - `"D6-"` → Decimal padded to 6 digits with hyphen (e.g., `042137-`)
>      - `"X5_"` → 5-character uppercase hex + underscore (e.g., `AF21C_`)
>
> 3. **32-bit Random Number**
>    - Type: `"random_32bit"`
>    - Range: `0–4,294,967,295`
>    - Optional format suffix:
>      - `"D10_"` → Decimal, 10 digits (e.g., `0001234567_`)
>      - `"X8-"` → 8-character hex, then hyphen (e.g., `4F2A0BC1-`)
>
> 4. **6-Digit Random Number**
>    - Type: `"random_6digit"`
>    - Always 6-digit zero-padded number (e.g., `031542`)
>    - Optional suffix allowed (e.g., `"031542-"`)
>
> 5. **9-Digit Random Number**
>    - Type: `"random_9digit"`
>    - Always 9-digit zero-padded number (e.g., `005312987`)
>    - Optional suffix allowed (e.g., `"005312987_"`)
>
> 6. **GUID**
>    - Type: `"guid"`
>    - Generates a standard UUID v4 string.
>    - Optional suffix allowed (e.g., `"550e8400-e29b-41d4-a716-446655440000_"`)
>
> 7. **Date/Time**
>    - Type: `"date"`
>    - Supports the following tokens in `format`:
>      - `yyyy` → 4-digit year
>      - `mm` → 2-digit month
>      - `dd` → 2-digit day
>      - `ddd` → abbreviated weekday (`Mon`, `Tue`, etc.)
>
>    - Example: `yyyy-mm-dd`, `ddd-yyyy📅`
>
> 8. **Sequence**
>    - Type: `"sequence"`
>    - Value = (highest sequence number in the inventory + 1)
>    - Format: `D` (no padding) or `D3`, `D4` (zero-padded)
>    - Optional suffix allowed (e.g., `D3-` → `007-`)
>
> ---
>
> ### ⚙️ **Implementation Rules**
>
> - Each element in the `idFormat` array corresponds to one segment.
> - Each segment may contain:
>
>   ```json
>   { "id": "seg-1-1", "type": "random_32bit", "format": "X8-", "value": null }
>   ```
>
> - The backend generates each part based on its `type` and `format` and concatenates them sequentially.
> - The backend must ensure:
>   - IDs remain unique within each inventory (composite unique constraint)
>   - Duplicate custom IDs (on conflict) retry generation **only for random-based IDs**
>     If conflict persists, return 409 Conflict.
>
> - When ID format changes later, existing IDs remain unchanged.
>   Only newly created or edited items follow the new format.
>
> ---
>
> ### 🧪 **Example**
>
> Input `idFormat`:
>
> ```json
> [
>   { "type": "fixed", "value": "📚-" },
>   { "type": "date", "format": "yyyy" },
>   { "type": "fixed", "value": "-" },
>   { "type": "random_20bit", "format": "D6_" },
>   { "type": "sequence", "format": "D3" }
> ]
> ```
>
> Output:
>
> ```
> 📚-2025-042137_007
> ```
>
> ---
>
> ### 🛠️ **Backend Notes**
>
> - Keep all generation logic in the backend (`generateCustomId()` helper).
> - Don’t move any of this logic to the frontend.
> - Make each segment generator modular:
>   - `generateFixed()`
>   - `generateRandom20Bit()`
>   - `generateRandom32Bit()`
>   - `generateRandom6Digit()`
>   - `generateRandom9Digit()`
>   - `generateGuid()`
>   - `generateDate()`
>   - `generateSequence()`
>
> - Store `idFormat` as JSONB in the Inventory table.
> - Reuse existing retry logic for handling DB uniqueness errors.

---
