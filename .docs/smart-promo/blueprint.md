### Overview

This document provides the detailed, step-by-step engineering blueprint for building the "Smart Promo" feature. The plan follows our established methodology of building and testing the backend and frontend in parallel before a final integration.

### Part 1: Backend API (`/api/promo`)

This stream focuses on building the server-side logic for generating strategic promotional suggestions.

---

#### **Prompt 1.1: Create a Mock API Endpoint for Smart Promo**

```text
As a senior software engineer, your first task is to create the backend API for the "Smart Promo" feature. Start with a mock implementation to define the complex API contract.

**Project Context:**
- **Framework:** Next.js 15 with App Router, TypeScript.
- **Goal:** Create a new API route at `/api/promo` that handles a POST request.

**Requirements:**
1.  Create the file `app/api/promo/route.ts`.
2.  The endpoint must accept a POST request with a JSON body containing `text`.
3.  This must be a **mock** endpoint.
4.  It must return a hardcoded JSON response that strictly follows the structure from the feature brief, including a `suggestions` array where each object has `strategy`, `rewrittenText`, and `explanation`. Provide three different mock suggestions.

**Example Hardcoded Response:**
```json
{
  "suggestions": [
    {
      "strategy": "Focus on Storytelling",
      "rewrittenText": "This is a mock rewrite focused on telling a personal story.",
      "explanation": "Mock explanation: This version works by connecting with the audience emotionally."
    },
    {
      "strategy": "Focus on a Relatable Problem",
      "rewrittenText": "This is a mock rewrite focused on solving a common problem.",
      "explanation": "Mock explanation: This version builds trust by showing empathy for a user's pain point."
    },
    {
      "strategy": "Focus on Transformation",
      "rewrittenText": "This is a mock rewrite focused on an aspirational outcome.",
      "explanation": "Mock explanation: This version sells the lifestyle the product enables, not just the product itself."
    }
  ]
}
```

Testing:
Provide a test file for this route that verifies that a POST request returns a 200 status and the exact mock JSON structure.


---

#### **Prompt 1.2: Integrate Live AI for Smart Promo Suggestions**

```text
Building on the previous step, replace the mock logic in `/api/promo` with a live call to the OpenAI API.

**Project Context:**
- You have a mock API endpoint at `/api/promo`.
- You will use the OpenAI API (GPT-4o-mini) and the Vercel AI SDK's JSON mode.

**Requirements:**
1.  Modify `app/api/promo/route.ts`.
2.  Use the following detailed AI prompt to generate the suggestions. You will pass the user's text into the `{{USER_TEXT}}` placeholder.

    ---
    **AI PROMPT STARTS**

    **Role:**
    You are an expert content marketing strategist who specializes in helping creators talk about products in an authentic, natural way. Your goal is to rewrite pushy, ad-like text into compelling, trust-building recommendations.

    **Task:**
    Analyze the user's promotional text provided below. Rewrite it in three different, more authentic ways, each based on a distinct marketing strategy. For each rewritten version, you must also provide a short, educational explanation of the strategy you used.

    **User's Text:**
    `{{USER_TEXT}}`

    **Strategies to Use:**
    1.  **Focus on Storytelling:** Rewrite the text by telling a personal story about using the product and the benefit it provided.
    2.  **Focus on a Relatable Problem:** Rewrite the text by highlighting a common, relatable problem that the product solves.
    3.  **Focus on Transformation:** Rewrite the text to focus on the aspirational outcome or the better lifestyle the product helps the user achieve.

    **Constraints:**
    * Do not invent product features that don't exist in the original text.
    * The explanations should be concise (1-2 sentences) and focused on *why* the strategy is effective.

    **Output Format:**
    Respond with a valid JSON object. The root object should have a single key, "suggestions," which is an array of exactly three objects. Each object must have the keys "strategy", "rewrittenText", and "explanation".

    ```json
    {
      "suggestions": [
        {
          "strategy": "Focus on Storytelling",
          "rewrittenText": "Your rewritten version based on the storytelling strategy.",
          "explanation": "Your explanation of why the storytelling approach is effective."
        },
        {
          "strategy": "Focus on a Relatable Problem",
          "rewrittenText": "Your rewritten version based on the relatable problem strategy.",
          "explanation": "Your explanation of why the relatable problem approach is effective."
        },
        {
          "strategy": "Focus on Transformation",
          "rewrittenText": "Your rewritten version based on the transformation strategy.",
          "explanation": "Your explanation of why the transformation approach is effective."
        }
      ]
    }
    ```
    **AI PROMPT ENDS**
    ---

3.  Parse the AI's response and send it back to the client. Add robust error handling.

**Testing:**
Update the test file for `/api/promo`. Mock the OpenAI SDK client and test for both successful and failed AI responses.

### Part 2: Frontend UI & Logic

#### **Prompt 2.1: Add "Smart Promo" Button and Strategic Suggestion Card**

Your first frontend task is to update the UI to support the "Smart Promo" feature.

**Project Context:**
- **Editor:** Lexical with a `FloatingToolbarPlugin`.
- **UI Library:** `shadcn/ui`.
- You have an existing `SuggestionsSidebar` component.

**Requirements:**
1.  **Update Floating Toolbar:** In `FloatingToolbar.tsx`, add a new button labeled **"Smart Promo"** with a `Megaphone` icon. The button should only be enabled when full text is selected (similar to Engage feature). For now, clicking it should only `console.log('Smart Promo clicked');`.
2.  **Update Types:** Extend the `AISuggestion` interface in `lib/types.ts` to include:
    - Add `"smart-promo"` to the type union
    - Add optional `strategy?: string` field
    - Add optional `explanation?: string` field
3.  **Update Suggestions Sidebar:** Modify `SuggestionsSidebar.tsx` to display Smart Promo suggestions with:
    - Purple background styling: `bg-purple-50 border-purple-200`
    - Strategy displayed as a badge similar to existing type badges
    - Explanation displayed in italicized text below the main content
    - "Accept" button for replacing original text

**Testing:**
- Update the tests for `FloatingToolbar.tsx` to verify the "Smart Promo" button is present and properly disabled/enabled based on text selection.
- Update the tests for `SuggestionsSidebar.tsx` to verify that it correctly displays the new `strategy` and `explanation` text when the props are passed in.

#### **Prompt 2.2: Implement the Full "Smart Promo" Feature Flow**

Final step: wire up the "Smart Promo" button to the API and handle the replacement logic in the suggestion sidebar.

**Project Context:**
- The UI components are updated for strategic suggestions.
- You have a live `/api/promo` endpoint.
- You have a centralized state management system for suggestions.

**Requirements:**
1.  **Update Floating Toolbar Logic:** Modify the `onClick` handler for the "Smart Promo" button.
    - Validate that full text is selected (similar to Engage feature).
    - Save the current Lexical `Selection` object.
    - Show loading spinner on the button itself (consistent with Engage feature).
    - Call the `/api/promo` endpoint with the selected text.
    - On a successful response, iterate through the `suggestions` array from the API. For each one, create a new suggestion object with:
      - Unique `id` (using `Date.now() + index`)
      - `type: "smart-promo"`
      - `originalSelection` (saved selection)
      - `strategy`, `rewrittenText`, `explanation` from API response
      - `status: "proposed"`
    - Call `addSuggestions` for each object to populate the sidebar.
    - Clear loading state.
2.  **Implement `onAccept` Logic:** The `onPrimaryAction` handler (which handles the 'replace' `actionType`) needs no major changes. It should already be set up to replace the `originalSelection` with the `rewrittenText`.
3.  **Clear Related Suggestions:** When a user accepts one "Smart Promo" suggestion, all other "Smart Promo" suggestions should also be removed from the sidebar to avoid clutter. This is done by filtering out all suggestions with `type === "smart-promo"`.
4.  **Error Handling:** Show toast notification on API failure with "retry" mentioned in the message. User can click "Smart Promo" again to retry.

**Testing:**
Update your end-to-end tests to:
- Mock the `/api/promo` endpoint.
- Simulate the full flow: select full text, click "Smart Promo," and verify that three strategic suggestion cards appear in the sidebar with purple styling.
- Simulate a click on an "Accept" button and assert that the text in the editor is correctly updated and that *all* Smart Promo cards disappear while other suggestion types remain.
- Test error scenarios and loading states.
- Test that the button is properly disabled when full text is not selected.

