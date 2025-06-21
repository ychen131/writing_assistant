# Floating Toolbar Test Guide

## How to Test the Floating Toolbar

### Prerequisites
1. Make sure the development server is running: `npm run dev`
2. Open your browser and navigate to `http://localhost:3000`
3. Go to the editor page (create or open a document)

### Test Steps

#### 1. Basic Functionality Test
1. **Select text** in the editor by clicking and dragging
2. **Verify toolbar appears** - A floating toolbar should appear above the selected text
3. **Check toolbar content** - The toolbar should show a "Persona" button with a sparkles icon
4. **Click the Persona button** - A dropdown should open with three options:
   - Humorous
   - Vivid  
   - To the point

#### 2. Dropdown Interaction Test
1. **Select any persona option** from the dropdown
2. **Check console** - You should see a log message: "Selected Persona: [persona name]"
3. **Verify dropdown closes** after selection

#### 3. Positioning Test
1. **Select text at different positions** in the document
2. **Verify toolbar positioning** - The toolbar should appear above the selection and be centered horizontally
3. **Test with long selections** - The toolbar should still be properly positioned

#### 4. Visibility Test
1. **Clear selection** by clicking elsewhere in the editor
2. **Verify toolbar disappears** - The toolbar should hide when no text is selected
3. **Select text again** - The toolbar should reappear
4. **Scroll the page** - The toolbar should disappear when scrolling

#### 5. Edge Cases Test
1. **Select text near the top** of the editor - The toolbar should still be visible
2. **Select text near the bottom** - The toolbar should appear above the selection
3. **Select text across multiple lines** - The toolbar should position correctly

### Expected Behavior

#### ✅ What Should Work
- Toolbar appears on text selection
- Toolbar is positioned above the selection
- Toolbar is centered horizontally
- Dropdown opens with three persona options
- Console logs persona selection
- Toolbar disappears when selection is cleared
- Toolbar disappears on scroll

#### ❌ What Should NOT Happen
- Toolbar appearing without text selection
- Toolbar not appearing when text is selected
- Toolbar positioned incorrectly
- Dropdown not opening
- Console errors
- Toolbar staying visible when it should be hidden

### Debugging

If the toolbar doesn't appear:
1. **Check browser console** for JavaScript errors
2. **Verify text selection** - Make sure you're actually selecting text (not just clicking)
3. **Check CSS** - Ensure no CSS is hiding the toolbar
4. **Check z-index** - The toolbar should have a high z-index to appear above other elements

### Console Output
When you select a persona, you should see:
```
Selected Persona: Humorous
```
or
```
Selected Persona: Vivid
```
or
```
Selected Persona: To the point
``` 