# 📋 **Plain Text Source of Truth: Implementation Plan**

## 🎯 **Project Overview**

Refactor the AI Writing Assistant to use plain text as the primary source of truth instead of complex Lexical JSON state, while keeping the existing suggestions system intact for now.

---

## 📊 **Current vs Future Architecture**

### **Current Flow (Complex)**

```mermaid
Current Architecture - JSON as Source of Truth.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r1dr3{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r1dr3 .error-icon{fill:#552222;}#mermaid-diagram-r1dr3 .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r1dr3 .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r1dr3 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r1dr3 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r1dr3 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r1dr3 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r1dr3 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r1dr3 .marker{fill:#666;stroke:#666;}#mermaid-diagram-r1dr3 .marker.cross{stroke:#666;}#mermaid-diagram-r1dr3 svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r1dr3 p{margin:0;}#mermaid-diagram-r1dr3 .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-r1dr3 .cluster-label text{fill:#333;}#mermaid-diagram-r1dr3 .cluster-label span{color:#333;}#mermaid-diagram-r1dr3 .cluster-label span p{background-color:transparent;}#mermaid-diagram-r1dr3 .label text,#mermaid-diagram-r1dr3 span{fill:#000000;color:#000000;}#mermaid-diagram-r1dr3 .node rect,#mermaid-diagram-r1dr3 .node circle,#mermaid-diagram-r1dr3 .node ellipse,#mermaid-diagram-r1dr3 .node polygon,#mermaid-diagram-r1dr3 .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-r1dr3 .rough-node .label text,#mermaid-diagram-r1dr3 .node .label text{text-anchor:middle;}#mermaid-diagram-r1dr3 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-r1dr3 .node .label{text-align:center;}#mermaid-diagram-r1dr3 .node.clickable{cursor:pointer;}#mermaid-diagram-r1dr3 .arrowheadPath{fill:#333333;}#mermaid-diagram-r1dr3 .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-r1dr3 .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-r1dr3 .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-r1dr3 .edgeLabel p{background-color:white;}#mermaid-diagram-r1dr3 .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-r1dr3 .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-r1dr3 .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-r1dr3 .cluster text{fill:#333;}#mermaid-diagram-r1dr3 .cluster span{color:#333;}#mermaid-diagram-r1dr3 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-r1dr3 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r1dr3 .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r1dr3 .marker,#mermaid-diagram-r1dr3 marker,#mermaid-diagram-r1dr3 marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr3 .label,#mermaid-diagram-r1dr3 text,#mermaid-diagram-r1dr3 text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r1dr3 .background,#mermaid-diagram-r1dr3 rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r1dr3 .entityBox,#mermaid-diagram-r1dr3 .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r1dr3 .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r1dr3 .label-container,#mermaid-diagram-r1dr3 rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr3 line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr3 :root{--mermaid-font-family:var(--font-geist-sans);}User Types in EditorLexical JSON StateExtract Plain TextSend to AI APIGenerate SuggestionsApply Decorations to JSONRender Complex Editor StateSave JSON to DatabaseAuto-save Complex StateLoad DocumentLoad JSON from DBParse JSON StateReconstruct EditorExtract Text for Suggestions
```

### **New Flow (Clean)**

```mermaid
New Architecture - Plain Text as Source of Truth.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r1dr9{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r1dr9 .error-icon{fill:#552222;}#mermaid-diagram-r1dr9 .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r1dr9 .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r1dr9 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r1dr9 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r1dr9 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r1dr9 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r1dr9 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r1dr9 .marker{fill:#666;stroke:#666;}#mermaid-diagram-r1dr9 .marker.cross{stroke:#666;}#mermaid-diagram-r1dr9 svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r1dr9 p{margin:0;}#mermaid-diagram-r1dr9 .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-r1dr9 .cluster-label text{fill:#333;}#mermaid-diagram-r1dr9 .cluster-label span{color:#333;}#mermaid-diagram-r1dr9 .cluster-label span p{background-color:transparent;}#mermaid-diagram-r1dr9 .label text,#mermaid-diagram-r1dr9 span{fill:#000000;color:#000000;}#mermaid-diagram-r1dr9 .node rect,#mermaid-diagram-r1dr9 .node circle,#mermaid-diagram-r1dr9 .node ellipse,#mermaid-diagram-r1dr9 .node polygon,#mermaid-diagram-r1dr9 .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-r1dr9 .rough-node .label text,#mermaid-diagram-r1dr9 .node .label text{text-anchor:middle;}#mermaid-diagram-r1dr9 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-r1dr9 .node .label{text-align:center;}#mermaid-diagram-r1dr9 .node.clickable{cursor:pointer;}#mermaid-diagram-r1dr9 .arrowheadPath{fill:#333333;}#mermaid-diagram-r1dr9 .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-r1dr9 .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-r1dr9 .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-r1dr9 .edgeLabel p{background-color:white;}#mermaid-diagram-r1dr9 .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-r1dr9 .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-r1dr9 .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-r1dr9 .cluster text{fill:#333;}#mermaid-diagram-r1dr9 .cluster span{color:#333;}#mermaid-diagram-r1dr9 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-r1dr9 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r1dr9 .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r1dr9 .marker,#mermaid-diagram-r1dr9 marker,#mermaid-diagram-r1dr9 marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr9 .label,#mermaid-diagram-r1dr9 text,#mermaid-diagram-r1dr9 text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r1dr9 .background,#mermaid-diagram-r1dr9 rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r1dr9 .entityBox,#mermaid-diagram-r1dr9 .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r1dr9 .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r1dr9 .label-container,#mermaid-diagram-r1dr9 rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr9 line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1dr9 :root{--mermaid-font-family:var(--font-geist-sans);}User Types in EditorPlain Text ContentSave Text to DatabaseAuto-save Simple TextSend to AI APIGenerate SuggestionsApply Client-side DecorationsRender Editor with HighlightsLoad DocumentLoad Plain Text from DBInitialize Editor with TextApply Suggestions to TextRender DecorationsAccept SuggestionUpdate Plain TextSave Updated TextRe-render Editor
```

### **Data Model Transformation**

```mermaid
Data Model Transformation.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r1drf{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r1drf .error-icon{fill:#552222;}#mermaid-diagram-r1drf .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r1drf .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r1drf .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r1drf .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r1drf .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r1drf .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r1drf .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r1drf .marker{fill:#666;stroke:#666;}#mermaid-diagram-r1drf .marker.cross{stroke:#666;}#mermaid-diagram-r1drf svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r1drf p{margin:0;}#mermaid-diagram-r1drf .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-r1drf .cluster-label text{fill:#333;}#mermaid-diagram-r1drf .cluster-label span{color:#333;}#mermaid-diagram-r1drf .cluster-label span p{background-color:transparent;}#mermaid-diagram-r1drf .label text,#mermaid-diagram-r1drf span{fill:#000000;color:#000000;}#mermaid-diagram-r1drf .node rect,#mermaid-diagram-r1drf .node circle,#mermaid-diagram-r1drf .node ellipse,#mermaid-diagram-r1drf .node polygon,#mermaid-diagram-r1drf .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-r1drf .rough-node .label text,#mermaid-diagram-r1drf .node .label text{text-anchor:middle;}#mermaid-diagram-r1drf .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-r1drf .node .label{text-align:center;}#mermaid-diagram-r1drf .node.clickable{cursor:pointer;}#mermaid-diagram-r1drf .arrowheadPath{fill:#333333;}#mermaid-diagram-r1drf .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-r1drf .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-r1drf .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-r1drf .edgeLabel p{background-color:white;}#mermaid-diagram-r1drf .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-r1drf .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-r1drf .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-r1drf .cluster text{fill:#333;}#mermaid-diagram-r1drf .cluster span{color:#333;}#mermaid-diagram-r1drf div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-r1drf .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r1drf .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r1drf .marker,#mermaid-diagram-r1drf marker,#mermaid-diagram-r1drf marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1drf .label,#mermaid-diagram-r1drf text,#mermaid-diagram-r1drf text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r1drf .background,#mermaid-diagram-r1drf rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r1drf .entityBox,#mermaid-diagram-r1drf .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r1drf .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r1drf .label-container,#mermaid-diagram-r1drf rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1drf line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r1drf :root{--mermaid-font-family:var(--font-geist-sans);}NEW: SimpleOLD: ComplexRefactorLexical JSONExtract TextApply SuggestionsComplex RenderingPlain TextApply SuggestionsSimple Rendering
```

---

## 🔧 **Implementation Plan**

### **Phase 1: Data Model Refactor** ⭐ *Focus Area*

**Goal**: Make plain text the primary source of truth

#### **Step 1.1: Database Schema Update**

- Add `plain_text_content` column to documents table
- Create migration script to convert existing JSON content to plain text
- Add database indexes for performance
- Update RLS policies if needed


#### **Step 1.2: Data Layer Changes**

- Update document CRUD operations to use plain text
- Modify auto-save logic to save plain text instead of JSON
- Update document loading to fetch plain text
- Simplify change detection (string comparison vs JSON comparison)


#### **Step 1.3: Editor Integration**

- Update Lexical editor initialization to use plain text
- Modify editor change handlers to extract plain text
- Update auto-save triggers to work with plain text
- Ensure PlainTextPlugin is properly configured


#### **Step 1.4: API Updates**

- Update document endpoints to return plain text
- Modify suggestion API to work with plain text input
- Update caching system to cache based on plain text hash


### **Phase 2: Keep Existing** 🔒 *No Changes*

**Goal**: Maintain current functionality while building on new foundation

#### **Unchanged Components**:

- ✅ Suggestion generation logic (client-side)
- ✅ Suggestion highlighting/decoration system
- ✅ Suggestion application UI (sidebar, accept/ignore)
- ✅ Caching system (will work with plain text)
- ✅ User authentication and document management


---

## 📋 **Key Differences Summary**

| **Aspect** | **Current (Complex)** | **New (Clean)**
|-----|-----|-----
| **Source of Truth** | Lexical JSON State | Plain Text String
| **Database Storage** | Complex JSON blob | Simple TEXT field
| **Change Detection** | JSON state comparison | String comparison
| **Auto-save** | Serialize JSON state | Save plain text
| **Suggestion Logic** | Extract text from JSON | Direct text processing
| **Editor Initialization** | Parse complex state | Load simple text
| **Data Flow** | JSON → Text → Suggestions | Text → Suggestions


---

## 💡 **Benefits of New Architecture**

### **🎯 Immediate Benefits**

- **Predictable State Management**: Always know exactly what text you're working with
- **Robust Suggestion Logic**: Text positions are always reliable
- **Clean Separation of Concerns**: Database stores simple text, UI handles presentation
- **Easier Testing & Debugging**: Can test with simple string inputs


### **🚀 Future Benefits**

- **Foundation for Advanced Features**: Version control, collaborative editing, etc.
- **Better Performance**: Simpler serialization and change detection
- **Easier Maintenance**: Clear data flow and fewer edge cases
- **Scalable Architecture**: Simple to extend and modify


---

## 🎯 **Success Criteria**

### **Phase 1 Complete When**:

- All documents store and load plain text as primary content
- Editor works seamlessly with plain text source of truth
- Auto-save functionality works with plain text
- Existing suggestion system continues to work unchanged
- No regression in user experience or performance


### **Ready for Phase 2 When**:

- Plain text architecture is stable and tested
- All edge cases handled (empty documents, special characters, etc.)
- Performance metrics meet or exceed current system
- Team is comfortable with new architecture


---

**Next Step**: Start with database schema update and document CRUD operations. Should I begin implementing the database migration script?