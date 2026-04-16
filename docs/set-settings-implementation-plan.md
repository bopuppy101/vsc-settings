# Set Settings — Implementation Plan

## Context

Settings Explorer's hierarchy and organization are complete. Users can browse all VS Code settings through a curated tree. The next phase makes settings interactive — users can view descriptions, change values, and get validation feedback without leaving the tree.

## Design Decisions

1. **Use the right control for the data type.** Booleans get checkboxes, enums get dropdowns, numbers get number inputs. No free-text fields for constrained types.
2. **Validate before sending.** Invalid values never reach VS Code's configuration API. Validation happens in the webview.
3. **Respect VS Code's existing constraints.** Honor `minimum`, `maximum`, `enum`, and type from the setting schema.
4. **Show what changed.** Modified settings get a visual indicator. Users can reset to default.
5. **Description on hover.** Every setting's description is accessible via tooltip without cluttering the tree.

## 1. Leaf Rendering by Type

| Setting Type | Control | Notes |
|---|---|---|
| `boolean` | Checkbox | Checked = currentValue |
| `enum` (has `enum[]`) | Dropdown `<select>` | Options from `enum`, descriptions from `enumDescriptions` |
| `number` / `integer` | `<input type="number">` | Respect `minimum` / `maximum` attributes |
| `string` | `<input type="text">` | Free-form text |
| `array` / `object` | `<input type="text">` | JSON string, validated on blur |

Each leaf currently shows: label + type badge. After this change, each leaf shows: label + control + tooltip on hover.

## 2. Tooltips

- Each leaf's `description` field shown on hover as a styled tooltip
- Not just browser `title` attribute — a proper tooltip that can show multiline text
- Tooltip appears near the setting, disappears on mouseout
- Description data already exists in `SettingNode.description`

## 3. Message Passing (Webview → Extension Host)

### Webview sends:
```json
{ "type": "updateSetting", "key": "editor.fontSize", "value": 14 }
```

### Extension host receives and applies:
```typescript
vscode.workspace.getConfiguration().update(key, value, ConfigurationTarget.Global)
```

### Extension host responds:
```json
{ "type": "settingUpdated", "key": "editor.fontSize", "success": true }
```
or
```json
{ "type": "settingError", "key": "editor.fontSize", "error": "message" }
```

## 4. Validation

| Type | Validation |
|---|---|
| `boolean` | None needed (checkbox constrains input) |
| `enum` | None needed (dropdown constrains input) |
| `number` | `isNaN` check, `minimum` / `maximum` range check |
| `integer` | Same as number + `Number.isInteger` check |
| `string` | Accept anything |
| `array` / `object` | `JSON.parse` validation |

- Show inline error message on invalid input (red text below the control)
- Do not send invalid values to the extension host

## 5. Visual Indicators

- **Modified settings**: Blue left border or dot (matches VS Code's native settings UI style)
- **Reset to default**: Small undo/reset icon next to modified settings
- Clicking reset sends `{ type: "updateSetting", key, value: undefined }` which removes the user override

## Files to Modify

| File | Action |
|---|---|
| `src/settings-webview-provider-mvp.ts` | New CSS for controls, tooltips, validation errors, modified indicators. New leaf rendering logic with controls by type. Message posting on value change. |
| `src/extension.ts` | Add `webview.onDidReceiveMessage` handler to apply setting changes via VS Code API. |

## Implementation Order

1. [ ] Add message handler in `extension.ts` for `updateSetting` messages
2. [ ] Redesign leaf rendering in webview — controls by type, replace current label-only display
3. [ ] Add tooltip rendering on hover using `description` field
4. [ ] Add validation logic per type in webview
5. [ ] Add modified indicator (blue border) and reset-to-default button
6. [ ] Test: boolean toggle, enum selection, number input with min/max, string input, JSON input
7. [ ] Test: invalid input shows error, valid input updates setting, reset works
