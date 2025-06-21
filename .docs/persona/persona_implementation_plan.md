### Overview

This document provides the detailed, step-by-step engineering blueprint for building the "Persona" feature. The plan is designed for a code-generation LLM, ensuring incremental, testable progress. We will build the backend and frontend in parallel before a final integration.

### Part 1: Backend API (`/api/persona`)

This stream focuses on building the server-side logic for rewriting text.

---

#### **Prompt 1.1: Create a Mock API Endpoint for Persona Shifting**

```text
As a senior software engineer on the WordWise project, your first task is to create the backend API for the new "Persona" feature. Start with a mock implementation to define the API contract.

**Project Context:**
- **Framework:** Next.js 15 with App Router, TypeScript
- **Goal:** Create a new API route at `/api/persona` that handles a POST request.

**Requirements:**
1.  Create the file `app/api/persona/route.ts`.
2.  The endpoint must accept a POST request with a JSON body containing `text` and `persona` ("Humorous", "Vivid", or "To the point").
3.  This must be a **mock** endpoint. It should **not** call any external AI service.
4.  It must return a hardcoded JSON response based on the `persona` provided, in the format `{ "rewrittenText": "..." }`.
    - If `persona` is "Humorous", return `{ "rewrittenText": "This is the witty and humorous version of the original text." }`.
    - If `persona` is "Vivid", return `{ "rewrittenText": "This is the vivid and descriptive version with rich sensory details." }`.
    - If `persona` is "To the point", return `{ "rewrittenText": "This is the concise version." }`.
5.  Handle invalid personas with a `400 Bad Request` response.

**Testing:**
Provide a test file for this route that verifies:
- A request with a valid `persona` returns a `200` status and the correct mock text.
- A request with an unrecognized `persona` returns a `400` status.
```

-----

#### **Prompt 1.2: Integrate Live AI for Persona Shifting**

```text
Building on the previous step, replace the mock logic in `/api/persona` with a live call to the OpenAI API.

**Project Context:**
- You have a mock API endpoint at `app/api/persona/route.ts`.
- You will use the OpenAI API (GPT-4o-mini) via Vercel's AI SDK.

**Requirements:**
1.  Modify `app/api/persona/route.ts`.
2.  Construct a specific AI prompt based on the `persona` from the request.
    - **For "Humorous":** "You are an expert editor. Rewrite the following text to be witty and humorous. Do not add commentary."
    - **For "Vivid":** "You are an expert editor. Rewrite the following text to be more descriptive, using strong sensory details to paint a picture. Do not add commentary."
    - **For "To the point":** "You are an expert editor. Rewrite the following text to be as clear and concise as possible, removing any unnecessary words. Do not add commentary."
3.  Pass the user's `text` with the prompt to the AI.
4.  Return the AI's response in the format `{ "rewrittenText": "..." }`.
5.  Add robust error handling for the AI service call.
6.  Implement a 60-second timeout for the AI request to prevent hanging requests.

**Testing:**
Update the test file for `/api/persona`:
- Mock the OpenAI SDK client.
- Test that sending a `persona` of "Humorous" results in a prompt containing the word "humorous".
- Test that a successful AI response is correctly returned.
- Test that an AI service failure results in a `500` error.
- Test that requests timeout after 60 seconds.
```

### Part 2: Frontend UI & Logic (for `PlainTextPlugin`)

This stream focuses on building the custom floating toolbar with modal processing.

-----

#### **Prompt 2.1: Manually Implement the Floating "Persona" Toolbar**

```text
Now for the frontend. Implement a custom floating toolbar that appears on text selection within the existing `PlainTextPlugin` setup.

**Project Context:**
- **Editor:** Lexical, using `PlainTextPlugin`.
- **UI Library:** `shadcn/ui`, `lucide-react`, Tailwind CSS.

**Requirements:**
1.  **Create a Toolbar Component:** Create `FloatingToolbar.tsx`. It will contain a `DropdownMenu` triggered by a button labeled **"Persona"**. The dropdown will have three items: "Humorous", "Vivid", and "To the point".
2.  **Create a Toolbar Plugin:** Create `FloatingToolbarPlugin.tsx` to manage visibility and position.
3.  **Plugin Logic:** Inside the plugin, use `editor.registerUpdateListener` to check for a non-collapsed `RangeSelection`. If found, get its DOM rectangle and update state with the coordinates and `visibility: true`. Otherwise, set `visibility: false`.
4.  **Render and Position:** The plugin must use a React Portal (`createPortal`) to render the toolbar and position it absolutely on the screen using the coordinates from state.
5.  **Integrate:** Add `<FloatingToolbarPlugin />` to your main editor component.
6.  **Mock Action:** A click on a dropdown item should `console.log` the selected persona (e.g., "Selected Persona: Humorous").

**Testing:**
Provide a test (Storybook or Cypress/Playwright) that:
- Selects text and asserts that the toolbar appears.
- Clears the selection and asserts that the toolbar disappears.
```

-----

#### **Prompt 2.2: Implement Processing Modal and API Integration**

```text
Final step: wire up the UI to the backend API with a processing modal.

**Project Context:**
- You have a custom floating toolbar with a "Persona" dropdown.
- You have a live, tested `/api/persona` backend endpoint.

**Requirements:**
1.  **Processing Modal:** Create a modal component that shows when a persona request is processing:
    - Centered on screen with pulsing dots animation
    - Message: "Thinking and Writing..."
    - Subtitle: "Transforming your text with AI"
    - Cancel button to abort the request
2.  **Get Selected Text:** In the dropdown `onSelect` handler, get the currently highlighted text from Lexical (`selection.getTextContent()`).
3.  **Make API Call:**
    - Trigger a `fetch` `POST` request to `/api/persona` with AbortController for cancellation.
    - The request body must be `{ text: selectedText, persona: 'Humorous' }`.
    - Implement a 60-second timeout.
    - Show the processing modal immediately when request starts.
    - Disable the entire editor during processing.
4.  **Replace Text:** On a successful API response, use `selection.insertText()` to replace the highlighted text with the `rewrittenText` from the response.
5.  **Success Feedback:** Show a success toast with message "Persona applied successfully!"
6.  **Error Handling:** 
    - If the API call fails, show a specific error toast (e.g., "Failed to apply Humorous persona. Please try again.").
    - If the request is cancelled, don't show any error message.
    - Re-enable the editor after any outcome.

**Testing:**
Update your tests:
- Mock the `/api/persona` endpoint.
- Simulate the full flow: select text, click "Persona", choose an option.
- Assert that the modal appears and editor is disabled.
- Assert that the text in the editor is correctly updated to match the string from the mock API response.
- Test cancellation flow and verify no error message appears.
- Test timeout scenarios.
```

### Implementation Notes

**Key UX Decisions:**
- Modal appears immediately on persona selection (no delay)
- Editor is fully disabled during processing
- Pulsing dots animation for visual feedback
- Specific error messages for each persona type
- 60-second timeout for API requests
- Clean request cancellation with AbortController
- Success toast confirmation
- Centered modal positioning

**Technical Considerations:**
- Use AbortController for request cancellation
- Implement proper cleanup on component unmount
- Handle edge cases like rapid persona changes
- Ensure accessibility compliance (to be addressed later)
- Consider rate limiting for API calls
