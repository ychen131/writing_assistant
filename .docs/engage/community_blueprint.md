### Overview

This document provides the detailed, step-by-step engineering blueprint for building the "Community Engagement" feature. This feature is designed to be *additive*, providing suggestions that get appended to the user's text. The plan is structured for a code-generation LLM, ensuring incremental and testable progress.

### Key Requirements Summary:
- **Trigger**: Floating toolbar appears only when user selects ALL text in the document (allowing for minor differences)
- **Button**: "Engage" button with chat bubble 💬 icon, only visible when full text is selected
- **Concurrent Usage**: When Engage is loading, disable Persona button and vice versa
- **API**: New `/api/engage` endpoint that calls OpenAI with the selected text
- **Response**: Returns 3 suggestions (Question, Call to Action, Interactive Prompt) in whatever order AI returns them
- **Placement**: Always append suggestions to the very end of the document
- **Architecture**: Completely separate suggestion type from existing Persona/Inspire suggestions
- **Error Handling**: Use existing JSON cleaning functions, show toast on timeout

### Part 1: Backend API (`/api/engage`)

This stream focuses on building the server-side logic for generating engagement suggestions.

---

#### **Prompt 1.1: Create a Mock API Endpoint for Engagement**

```text
As a senior software engineer on the WordWise project, your first task is to create the backend API for the "Community Engagement" feature. Start with a mock implementation to define the API contract.

**Project Context:**
- **Framework:** Next.js 15 with App Router, TypeScript
- **Goal:** Create a new API route at `/api/engage` that handles a POST request.

**Requirements:**
1.  Create the file `app/api/engage/route.ts`.
2.  The endpoint must accept a POST request with a JSON body containing `text` (the user's text for context).
3.  This must be a **mock** endpoint. It should **not** call any external AI service.
4.  It must return a hardcoded JSON response that strictly follows the structure defined in the feature brief.
    - The root object should have a `suggestions` key, which is an array of objects.
    - Each object must have a `type` ("Question", "Call to Action", or "Interactive Prompt") and `content` (the suggested text).
5.  Provide one distinct, hardcoded example for each type.

**Example Hardcoded Response:**
```json
{
  "suggestions": [
    {
      "type": "Question",
      "content": "This is a mock open-ended question based on the text."
    },
    {
      "type": "Call to Action",
      "content": "This is a mock call to action to encourage saves or shares."
    },
    {
      "type": "Interactive Prompt",
      "content": "This is a mock fill-in-the-blank prompt."
    }
  ]
}
```

**Testing:**
Provide a test file for this route that verifies that a `POST` request to `/api/engage` returns a `200` status and the exact mock JSON structure.
```

---

#### **Prompt 1.2: Integrate Live AI for Engagement Suggestions**

```text
Building on the previous step, replace the mock logic in `/api/engage` with a live call to the OpenAI API.

**Project Context:**
- You have a mock API endpoint at `app/api/engage/route.ts`.
- You will use the OpenAI API (GPT-4o-mini) via Vercel's AI SDK.
- Reference the existing `/api/analyze-text` route for JSON cleaning patterns.

**Requirements:**
1.  Modify `app/api/engage/route.ts`.
2.  Use the following detailed AI prompt to generate the suggestions. You will pass the user's text into the `{{USER_TEXT}}` placeholder.

    ---
    **AI PROMPT STARTS**

    **Role:**
    You are an expert social media strategist and community manager. Your specialty is helping content creators write engaging posts that spark conversations and build community.

    **Task:**
    Based on the user's text provided below, you will generate three distinct, context-aware suggestions: one open-ended question, one call to action (CTA), and one interactive prompt (like a poll or fill-in-the-blank).

    **User's Text:**
    `{{USER_TEXT}}`

    **Constraints:**
    * You must generate exactly one of each of the three types.
    * The suggestions must be directly inspired by the content of the user's text.
    * The tone of the suggestions should be friendly, curious, and inviting.
    * You must provide your response in the JSON format specified below.

    **Output Format:**
    Respond with a valid JSON object. The root object should have a single key, "suggestions," which is an array of three objects. Each object must have a "type" and a "content" key.

    ```json
    {
      "suggestions": [
        { "type": "Question", "content": "Your first generated question goes here." },
        { "type": "Call to Action", "content": "Your generated CTA goes here." },
        { "type": "Interactive Prompt", "content": "Your generated poll or fill-in-the-blank idea goes here." }
      ]
    }
    ```
    **AI PROMPT ENDS**
    ---

3.  Ensure you use the AI SDK's JSON mode to get a reliably structured response.
4.  Use the same JSON cleaning functions as `/api/analyze-text` for malformed responses.
5.  Parse the AI's response and send it back to the client.
6.  Add robust error handling for the AI service call and timeout scenarios.

**Testing:**
Update the test file for `/api/engage`:
- Mock the OpenAI SDK client.
- Test that a successful AI response with the correct JSON structure is properly forwarded by your endpoint.
- Test that if the AI call fails or returns malformed JSON, your endpoint uses the cleaning functions.
- Test that timeout scenarios return appropriate error responses.
```

### Part 2: Frontend UI & Logic

This stream focuses on adding the "Engage" button and wiring up the additive suggestion workflow.

-----

#### **Prompt 2.1: Add "Engage" Button and Selection Logic**

```text
Your first frontend task is to update the floating toolbar to support the new "Engage" feature with proper selection detection.

**Project Context:**
- **Editor:** Lexical with a `FloatingToolbarPlugin`.
- **UI Library:** `shadcn/ui`.
- The floating toolbar should only appear when user selects ALL text (allowing for minor differences).

**Requirements:**
1.  **Update Selection Detection:** Modify the floating toolbar logic to detect when the user has selected all text:
    - Compare the length of selected text with the total document length.
    - Allow for minor differences (e.g., whitespace trimming, newline differences).
    - Only show the floating toolbar when full text is selected.
2.  **Add Engage Button:** In `FloatingToolbar.tsx`, add a new button next to the "Persona" button:
    - Label: **"Engage"**
    - Icon: Chat bubble 💬
    - Only visible when full text is selected (same as Persona button).
    - For now, clicking it should only `console.log('Engage button clicked');`.
3.  **Concurrent Usage Prevention:** Implement logic to prevent simultaneous usage:
    - When Engage is loading, disable the Persona button.
    - When Persona is loading, disable the Engage button.
    - Track loading states for both features.

**Testing:**
- Test that the floating toolbar only appears when full text is selected.
- Test that the Engage button is only visible when full text is selected.
- Test that buttons are properly disabled during loading states.
```

-----

#### **Prompt 2.2: Create Separate Engagement Suggestion Components**

```text
Create a completely separate suggestion system for engagement suggestions, distinct from the existing Persona suggestions.

**Project Context:**
- You need a separate type for additive suggestions.
- Engagement suggestions should have "Add" buttons and append content to the end of the document.
- No caching is needed for engagement suggestions.

**Requirements:**
1.  **Create Engagement Suggestion Type:** Define a new type for engagement suggestions:
    ```typescript
    interface EngagementSuggestion {
      id: string;
      type: 'Question' | 'Call to Action' | 'Interactive Prompt';
      content: string;
      timestamp: number;
    }
    ```
2.  **Create Engagement Suggestion Card:** Create a new component `EngagementSuggestionCard.tsx`:
    - Display the suggestion type as a badge/tag.
    - Show the suggestion content.
    - Primary button labeled **"Add"**.
    - Handle the "Add" action (for now, just `console.log`).
3.  **Create Engagement Sidebar:** Create a new component `EngagementSuggestionsSidebar.tsx`:
    - Display a list of engagement suggestions.
    - Handle adding suggestions to the document.
    - Remove suggestions after they're added.
4.  **State Management:** Create hooks for managing engagement suggestions:
    - `useEngagementSuggestions.ts` for state management.
    - `useEngagementAPI.ts` for API calls.

**Testing:**
- Test that engagement suggestions are completely separate from Persona suggestions.
- Test that the "Add" button works correctly.
- Test that suggestions are removed after being added.
```

-----

#### **Prompt 2.3: Implement the Full "Engage" Feature Flow**

```text
Final step: wire up the "Engage" button to the API and handle the additive logic in the engagement sidebar.

**Project Context:**
- The UI components are updated with proper selection detection.
- You have a live `/api/engage` endpoint.
- You have separate engagement suggestion components and state management.

**Requirements:**
1.  **Update Engage Button Logic:** Modify the `onClick` handler for the "Engage" button:
    - Get the selected text for context (`selection.getTextContent()`).
    - Set loading state for Engage feature.
    - Call the `/api/engage` endpoint.
    - On a successful response, iterate through the `suggestions` array from the API.
    - For each suggestion, create a new `EngagementSuggestion` object with a unique `id`, the `type`, `content`, and current timestamp.
    - Add each suggestion to the engagement suggestions state.
    - Clear loading state.
2.  **Implement Add Logic:** In the `EngagementSuggestionCard` component:
    - The `onAdd` handler must get the root node of the Lexical editor.
    - Append the `suggestion.content` to the very end of the document by inserting a new paragraph node.
    - Remove the suggestion from the engagement suggestions state.
3.  **Error Handling:** Implement proper error handling:
    - Show toast notifications for API errors and timeouts.
    - Clear loading state on errors.
    - Allow users to retry failed requests.

**Testing:**
Update your end-to-end tests to:
- Mock the `/api/engage` endpoint.
- Simulate the full flow: select all text, click "Engage", and verify that new engagement suggestion cards appear.
- Simulate clicking an "Add" button and assert that the suggestion content is appended to the end of the editor.
- Test error scenarios and loading states.
- Test concurrent usage prevention between Persona and Engage features.