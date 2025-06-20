# ✅ Two-Tiered Text Analysis Implementation To-Do List

## 🔧 Backend Infrastructure

### **Retext Analysis System**

- Install retext dependencies (`retext`, `retext-english`, `retext-spell`, etc.)
- Create `lib/text-analysis/retext-analyzer.ts` with unified processor
- Configure retext plugins (spell, repeated-words, passive, equality, contractions)
- **Focus on grammar and spelling only** - exclude style suggestions from retext
- Implement message-to-suggestion conversion logic
- Add error handling with retry mechanism (show error message and retry)
- Test retext analyzer with sample texts
- **Set 4-character minimum threshold** for analysis


### **API Routes**

- Create `/api/analyze-basic` endpoint for retext analysis
- **Rename existing `/api/analyze-text` to `/api/analyze-advanced`** for OpenAI analysis
- Implement separate caching strategies for each tier
- Add authentication checks to both endpoints
- Add input validation and sanitization (4-character minimum)
- **Remove rate limiting** for basic analysis (it's free)
- Implement rate limiting for advanced analysis only
- Add comprehensive error handling and logging


### **Caching Enhancements**

- Update cache keys to support `basic_${text}` and `advanced_${text}` formats
- Modify `SuggestionCacheManager` to handle tier-specific caching
- **Use existing cache expiration policy** (no changes needed)
- Implement cache cleanup for expired entries
- **Add cache invalidation logic** - clear both caches when text changes significantly
- Add cache statistics tracking by tier


## 🎨 Frontend Components

### **Analysis Hooks**

- Create `hooks/use-text-analysis.ts` with dual-tier support
- Implement `useDebouncedBasicAnalysis` hook with **300ms debounce**
- **Add document load trigger** - run basic analysis immediately if no cache
- Add suggestion merging logic to prevent overlaps
- Implement error handling and retry mechanisms
- Add loading states for both analysis types
- **Implement conflict resolution** - clear conflicting suggestions when accepting from either tier


### **UI Components**

- Create `components/editor/analysis-toolbar.tsx`
- Add status indicators for both analysis tiers
- Implement "Analyze Text" button for advanced analysis
- Add clear controls (Clear Basic, Clear Advanced, Clear All)
- Create loading spinners and progress indicators
- **Add purple color coding** for advanced suggestions


### **Suggestion Display**

- Update suggestion color coding (Red/Blue/Orange for basic, **Purple for advanced**)
- Enhance `SuggestionsSidebar` to show suggestion tiers
- Add tier badges to distinguish basic vs advanced suggestions
- Implement suggestion type icons and labels
- Add hover tooltips with detailed explanations


## 🔄 Editor Integration

### **Lexical Editor Updates**

- Update `SuggestionPlugin` to handle multiple suggestion sources
- Implement tier-based suggestion rendering
- **Add purple background color** (`bg-purple-200`) for advanced suggestions
- Update suggestion acceptance/rejection logic
- **Implement conflict resolution** - clear conflicting suggestions when accepting
- Ensure proper cleanup when suggestions are resolved


### **Editor Workspace**

- Integrate `AnalysisToolbar` into editor layout
- Update `EditorWorkspace` to handle dual-tier suggestions
- **Implement suggestion conflict resolution** as specified in plan
- Add keyboard shortcuts for common actions
- Ensure responsive design for different screen sizes


## 📊 Data & State Management

### **Type Definitions**

- Update `AISuggestion` interface to include tier information
- Add analysis result types for both tiers
- Create cache result interfaces with version support
- Add error types for different failure scenarios
- **Add tier field** to distinguish basic vs advanced suggestions


### **State Management**

- Update editor page to use new analysis hooks
- Implement proper state synchronization between tiers
- Add loading and error states management
- **Implement document load analysis trigger**
- Ensure proper cleanup on component unmount


## 🎯 User Experience

### **Performance Optimization**

- **Target <100ms response time** for basic analysis
- **Target 2-5 seconds** for advanced analysis
- Implement suggestion virtualization for large documents
- Add debouncing to prevent excessive API calls
- Optimize cache hit rates with smart key generation
- Add request deduplication for identical analyses
- Implement progressive loading for large suggestion sets


### **User Controls**

- **Remove user preferences for suggestion types** (not needed for initial implementation)
- Implement suggestion filtering options
- Add bulk accept/reject functionality
- Create suggestion history tracking
- Add undo/redo for suggestion applications


## 🧪 Testing & Quality

### **Unit Tests**

- Test retext analyzer with various text samples
- **Test grammar and spelling focus** - ensure style suggestions are excluded from basic tier
- Test API endpoints with different input scenarios
- Test caching mechanisms and cache invalidation
- **Test conflict resolution** when accepting suggestions
- Test error handling and edge cases
- **Test 4-character minimum threshold**


### **Integration Tests**

- Test end-to-end analysis workflow
- **Test document load analysis trigger**
- Test real-time basic analysis with typing (300ms debounce)
- Test advanced analysis trigger and results
- Test suggestion acceptance and text updates
- **Test cache invalidation** when text changes significantly
- Test cache performance and hit rates


### **Performance Testing**

- **Benchmark basic analysis response times (<100ms target)**
- Test advanced analysis under load (2-5 seconds target)
- Monitor memory usage with large documents
- Test cache storage limits and cleanup
- Validate API rate limiting effectiveness


## 🔧 Configuration & Deployment

### **Environment Setup**

- Add required environment variables documentation
- Update package.json with new retext dependencies
- Configure TypeScript types for new libraries
- Update build scripts if needed
- Add development vs production configurations


### **Documentation**

- Document API endpoints and parameters
- Create user guide for two-tier analysis
- **Document role separation** - basic for grammar/spelling, advanced for style/tone
- Document caching strategy and configuration
- Add troubleshooting guide
- Create developer setup instructions


## 🚀 Final Integration

### **System Integration**

- Integrate all components into main editor page
- **Test complete user workflow**: document load → basic analysis → typing → debounced updates → manual advanced analysis
- Verify proper cleanup and memory management
- Ensure graceful degradation when services are unavailable
- Add monitoring and analytics tracking


### **Polish & Refinement**

- **Fine-tune 300ms debounce timing**
- Optimize suggestion display performance
- Add accessibility features (ARIA labels, keyboard navigation)
- Implement responsive design improvements
- Add user onboarding and help tooltips


## 🎯 Implementation Phases

### **Phase 1: Basic Analysis Foundation**
- Install retext dependencies
- Create retext analyzer with grammar/spelling focus
- Implement `/api/analyze-basic` endpoint
- Create `useDebouncedBasicAnalysis` hook
- Update suggestion types and UI for basic tier

### **Phase 2: Advanced Analysis Integration**
- Rename existing API to `/api/analyze-advanced`
- Update caching for tier separation
- Implement conflict resolution logic
- Add purple color coding for advanced suggestions

### **Phase 3: UI Enhancement**
- Create analysis toolbar
- Enhance suggestion sidebar with tier badges
- Implement document load analysis trigger
- Add error handling and retry mechanisms

### **Phase 4: Testing & Optimization**
- Comprehensive testing of both tiers
- Performance optimization
- Cache invalidation testing
- User experience refinement

---

**Total Tasks: ~70 items**

**Estimated Effort: 3-4 weeks for full implementation**

**Key Alignment Points:**
- ✅ Role separation: Retext for grammar/spelling only, LLM for advanced analysis
- ✅ Triggers: Document load + 300ms debounce for basic, manual for advanced
- ✅ Error handling: Show error message and retry for basic analysis
- ✅ Cache management: Clear both caches when text changes significantly
- ✅ Conflict resolution: Clear conflicting suggestions when accepting from either tier
- ✅ Performance targets: <100ms basic, 2-5 seconds advanced
- ✅ Text threshold: 4 characters minimum for both tiers

This comprehensive to-do list is now fully aligned with the finalized implementation plan! 🎯