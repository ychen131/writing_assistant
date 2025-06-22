## Feature Brief: Smart Promo

### 1. Feature Overview

The "Smart Promo" feature is an AI-powered tool designed to help content creators write more authentic and effective promotional content. When a user highlights text they feel is too "salesy," the feature provides several rewritten versions, each based on a different marketing strategy. Crucially, it also provides an educational explanation for *why* each version works, empowering the user to become a better writer while improving their current text.

### 2. User Experience (UX) & Design

The feature will integrate into the existing sidebar suggestion system, providing a familiar, non-destructive workflow.

* **Interaction Model:** The user highlights text and triggers the feature from the floating toolbar. The suggestions then appear in the sidebar.
* **The "Smart Promo" Button:** A new button labeled **"Smart Promo"** will be added to the floating toolbar.
* **Strategic Suggestions:** Instead of just one rewrite, the AI will generate 2-3 distinct versions in the sidebar. Each suggestion card will include:
    * A **Strategy Label** (e.g., "Storytelling Focus," "Relatable Problem Focus").
    * The **Rewritten Text**.
    * An **Educational Snippet** (e.g., "*Why it works: This version shifts from listing features to telling a personal story...*").
* **Action Buttons:** Each card will have an **"Accept"** button to replace the user's original text with the new version.

### 3. User Flowchart

1.  **Start:** User highlights promotional text in the editor.
    * **-->** Floating Toolbar Appears.
2.  User clicks the **"Smart Promo"** button.
    * **-->** Show Loading State.
3.  Send (Selected Text) to `/api/promo`.
    * **-->** If API call is successful:
        * 2-3 new suggestion cards appear in the sidebar, each with a strategy, rewritten text, an explanation, and an "Accept" button.
        * User clicks "Accept" on one of the suggestions.
        * **-->** The original highlighted text in the editor is replaced.
        * **-->** All related "Smart Promo" suggestion cards are removed from the sidebar.
    * **-->** If API call fails:
        * Show error toast.
4.  **End.**

### 4. Detailed User Flow

1.  **Selection:** The user highlights a paragraph they feel sounds too much like an ad.
2.  **Toolbar Trigger:** The user clicks the **"Smart Promo"** button on the floating toolbar.
3.  **Processing:** The application calls the `/api/promo` endpoint with the selected text.
4.  **Display Suggestions:** The sidebar populates with 2-3 suggestion cards. Each card displays a different strategic rewrite of the text and an explanation of the approach.
5.  **User Action:** The user reviews the different strategic options. They click the **"Accept"** button on the version that best fits their voice.
6.  **Text Replacement:** The user's original highlighted text is replaced with the content from the accepted suggestion card. All "Smart Promo" cards are then cleared from the sidebar.

### 5. AI & API Requirements

* **Endpoint:** A new `POST` endpoint will be created at `/api/promo`.
* **Request Body:**
    ```json
    {
      "text": "The user's original promotional text."
    }
    ```
* **Response Body:**
    ```json
    {
      "suggestions": [
        {
          "strategy": "The name of the strategy (e.g., 'Focus on Storytelling').",
          "rewrittenText": "The first rewritten version of the text.",
          "explanation": "The educational snippet explaining why this strategy works."
        },
        {
          "strategy": "The name of the second strategy (e.g., 'Focus on a Relatable Problem').",
          "rewrittenText": "The second rewritten version of the text.",
          "explanation": "The educational snippet for the second strategy."
        }
      ]
    }
    ```
* **AI Prompt:** The backend will use a detailed prompt instructing the AI to act as a marketing expert, generate multiple strategic rewrites, and provide explanations for each.

