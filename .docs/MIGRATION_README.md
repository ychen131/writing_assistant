# 🔄 Plain Text Architecture Migration

This document describes the migration from JSON-based Lexical state to plain text as the primary source of truth.

## 🎯 What Changed

### **Database Schema**
- Added `plain_text_content` column to `documents` table
- Added `plain_text_content` column to `document_versions` table
- Created migration functions to extract plain text from existing JSON content
- Updated indexes and triggers for better performance

### **Data Model**
- **Before**: Documents stored complex Lexical JSON state in `content` column
- **After**: Documents store simple plain text in `plain_text_content` column
- Legacy `content` column remains for backward compatibility (optional)

### **Editor Integration**
- Lexical editor now initializes with plain text instead of JSON state
- Text changes are captured directly as strings
- Auto-save works with plain text instead of serializing JSON
- Suggestion application works directly with text manipulation

### **Version History**
- Document versions now store plain text instead of JSON state
- Version restoration works with plain text
- Cleaner, more predictable version management

## 🚀 Migration Process

### **Step 1: Run Database Migration**
```bash
# Option 1: Run via Supabase CLI
supabase db reset

# Option 2: Run manually in Supabase SQL editor
# Copy and paste the contents of scripts/004-migrate-to-plain-text.sql
```

### **Step 2: Deploy Updated Code**
The application code has been updated to work with the new architecture:

- ✅ Editor page uses `plain_text_content`
- ✅ Document creation uses plain text
- ✅ Version management uses plain text
- ✅ Suggestion system works with plain text
- ✅ Auto-save uses plain text

### **Step 3: Verify Migration**
1. Create a new document - should work with plain text
2. Edit existing documents - should load and save plain text
3. Check version history - should show plain text versions
4. Test suggestions - should work with plain text

## 📊 Benefits Achieved

### **Immediate Benefits**
- **Simplified State Management**: No more complex JSON parsing
- **Predictable Data Flow**: Always know exactly what text you're working with
- **Better Performance**: Simpler serialization and change detection
- **Easier Debugging**: Can inspect plain text directly

### **Future Benefits**
- **Foundation for Advanced Features**: Version control, collaborative editing
- **Better Testing**: Can test with simple string inputs
- **Scalable Architecture**: Easy to extend and modify
- **Cleaner Codebase**: Reduced complexity in data handling

## 🔧 Technical Details

### **Database Functions Created**
- `extract_plain_text_from_lexical(json_content JSONB)` - Extracts text from Lexical JSON
- `extract_text_from_node(node JSONB)` - Recursively extracts text from nodes
- `update_document_timestamps()` - Updated trigger for plain text changes

### **Key Code Changes**
- `app/editor/[id]/page.tsx` - Updated to use `plain_text_content`
- `components/editor/lexical-editor.tsx` - Added `TextInitializer` for plain text
- `hooks/use-document-versions.ts` - Updated for plain text versions
- `components/editor/suggestion-plugin.tsx` - Simplified for plain text
- `lib/types.ts` - Updated interfaces for plain text

### **Migration Safety**
- Existing JSON content is preserved in `content` column
- Migration is reversible (can restore from JSON if needed)
- No data loss during migration
- Backward compatibility maintained during transition

## 🎯 Success Criteria

The migration is complete when:

- ✅ All documents load and save using `plain_text_content`
- ✅ Editor initializes correctly with plain text
- ✅ Auto-save works with plain text
- ✅ Version history works with plain text
- ✅ Suggestion system works with plain text
- ✅ No regression in user experience
- ✅ Performance meets or exceeds previous system

## 🚨 Rollback Plan

If issues arise, you can rollback by:

1. **Database**: Restore from backup before migration
2. **Code**: Revert to previous commit before migration
3. **Data**: Use the legacy `content` column if needed

## 📝 Post-Migration Cleanup

After confirming everything works:

1. **Remove Legacy Code**: Clean up JSON-related code
2. **Drop Legacy Columns**: Remove `content` columns (optional)
3. **Clean Up Functions**: Remove migration functions
4. **Update Documentation**: Update any remaining references

---

**Migration completed successfully!** 🎉

The application now uses plain text as the primary source of truth, providing a cleaner, more maintainable architecture for future development. 