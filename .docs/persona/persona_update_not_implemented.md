### Overview

This document provides the updated, step-by-step engineering blueprint for building the "Persona" feature with the new **Accept/Reject** workflow. This plan replaces the previous one. We will build the backend and frontend in parallel before a final integration.

### Part 1: Backend API (`/api/persona`)

*(This part remains unchanged from the previous blueprint, as the API's contract is the same. The prompts for creating the mock and live endpoints are still valid.)*

* **Prompt 1.1: Create a Mock API Endpoint for Persona Shifting**
* **Prompt 1.2: Integrate Live AI for Persona Shifting**

### Part 2: Frontend UI & Logic (Revised for Accept/Reject Flow)

This stream is completely revised to build the new non-destructive suggestion workflow.

---

#### **Prompt 2.1: Create the Reusable Suggestion Card Component**

```text
As a senior software engineer, your first frontend task is to create a reusable UI component for displaying AI suggestions in the sidebar.

**Project Context:**
- **UI Library:** `shadcn/ui`, `lucide-react`, Tailwind CSS.
- **Goal:** Create a `SuggestionCard.tsx` component that is responsible for displaying one suggestion.

**Requirements:**
1.  Create a new file: `components/SuggestionCard.tsx`.
2.  The component should accept the following props: `personaType` (string), `rewrittenText` (string), `onAccept` (function), and `onReject` (function).
3.  The card's UI should display the `personaType` as a small labeled tag (e.g., "Humorous").
4.  It must display the `rewrittenText`.
5.  It must have two buttons, "Accept" and "Reject", styled with `shadcn/ui`.
6.  Clicking the "Accept" button should call the `onAccept` prop function.
7.  Clicking the "Reject" button should call the `onReject` prop function.

**Testing:**
Provide a Storybook story for the `SuggestionCard` that:
- Renders the component with sample text.
- Uses mock functions for `onAccept` and `onReject`.
- Verifies that clicking the buttons correctly calls the corresponding mock functions.

Prompt 2.2: Implement State Management for Suggestions

Next, you need to set up a centralized state management system to handle the list of active persona suggestions.

**Project Context:**
- **Framework:** React 19, TypeScript
- **Goal:** Create a state management solution (e.g., using React Context or Zustand) to manage an array of suggestions.

**Requirements:**
1.  **Define the Suggestion Type:** Create a TypeScript type for a suggestion object. It must include:
    - `id`: A unique identifier (e.g., `crypto.randomUUID()`).
    - `originalSelection`: The Lexical `Selection` object to know which text to replace.
    - `personaType`: The string of the persona used (e.g., "Humorous").
    - `rewrittenText`: The new text from the AI.
2.  **Create a Suggestions Store/Context:**
    - Implement a store or context that holds an array of these suggestion objects (`suggestions`).
    - It must expose functions to `addSuggestion(suggestion)` and `removeSuggestion(id)`.
3.  **Integrate the Provider:** Wrap your main editor layout component with this new suggestions provider so that both the editor and the sidebar can access the state.

**Testing:**
Provide unit tests for your state management logic that:
- Verify that `addSuggestion` correctly adds a new suggestion to the state.
- Verify that `removeSuggestion` correctly removes a suggestion by its ID.

Prompt 2.3: Wire Up the Full "Persona" Feature Flow

This is the final integration step. You will connect the floating toolbar, the API call, the state management, and the suggestion card to create the complete feature experience.

**Project Context:**
- You have a `FloatingToolbarPlugin`.
- You have a `SuggestionCard` component.
- You have a suggestions state management system.
- You have a live `/api/persona` endpoint.

**Requirements:**
1.  **Update the Suggestions Sidebar:** Modify your main "Suggestions" sidebar component to:
    - Read the `suggestions` array from your state management store/context.
    - Map over the array and render a `SuggestionCard` for each suggestion object.
2.  **Update the Floating Toolbar:** Modify the `onSelect` handler for the "Persona" dropdown in your `FloatingToolbarPlugin`. When a user clicks a persona:
    - Get the current Lexical `Selection` object (`$getSelection()`). **This is critical.**
    - Call the `/api/persona` endpoint with the selected text and persona.
    - On a successful response, create a new suggestion object containing the `id`, the saved `originalSelection`, the `personaType`, and the `rewrittenText`.
    - Call the `addSuggestion` function from your state management to add this new object to the global state. The sidebar will now update automatically.
3.  **Implement `onAccept`:** The `onAccept` prop passed to the `SuggestionCard` should:
    - Receive the `suggestion` object as an argument.
    - Use `editor.update()` and the `suggestion.originalSelection` to replace the text in the editor with `suggestion.rewrittenText`.
    - Call `removeSuggestion(suggestion.id)` to remove the card from the UI.
4.  **Implement `onReject`:** The `onReject` prop should simply call `removeSuggestion(suggestion.id)`.

**Testing:**
Update your end-to-end tests (Cypress/Playwright) to:
- Mock the `/api/persona` endpoint.
- Simulate the full flow: select text, click a persona, and verify that a `SuggestionCard` appears in the sidebar.
- Simulate a click on the "Accept" button and assert that the text in the editor is correctly updated and the card disappears.
- Run a separate test for the "Reject" button, asserting that the card disappears and the text remains unchanged.
