## Feature Brief: Community Engagement

### 1. Feature Overview

The "Community Engagement" feature is an AI-powered tool designed to help content creators increase audience interaction. By analyzing the user's text, the feature generates context-aware suggestions—such as open-ended questions, calls to action (CTAs), and interactive prompts (like polls or fill-in-the-blanks)—that can be added to the post to spark conversation and build a more active community.

### 2. User Experience (UX) & Design

The feature is designed to be additive and non-intrusive, integrating seamlessly into the existing UI.

* **Interaction Model:** The user selects a portion of their text (or the entire document) to provide context, then triggers the feature from a new button on the floating toolbar.
* **The "Engage" Button:** The floating toolbar will feature a new button, likely labeled **"Engage"** or represented by an icon (e.g., a question mark or sparkle ✨).
* **Additive Suggestions:** Unlike the "Persona" feature, these suggestions are meant to be *added* to the text, not to replace it. They will appear as new cards in the existing "Suggestions" sidebar.
* **Suggestion Cards:** Each card in the sidebar will be clearly tagged with its type (e.g., "Question," "Call to Action", "Interactive Prompt"). Instead of "Accept/Reject," each card will have a primary button labeled **"Add"**.
* **Action:** Clicking "Add" will append the suggested text to the end of the user's document.

### 3. User Flowchart

1.  **Start:** User highlights text for context.
    * **-->** Floating Toolbar Appears.
2.  User clicks the **"Engage"** button.
    * **-->** Show Loading State.
3.  Send (Selected Text) to `/api/engage`.
    * **-->** If API call is successful:
        * New suggestion cards appear in the sidebar with "Add" buttons.
        * User clicks "Add" on a suggestion.
        * **-->** Append suggestion text to the end of the document.
        * **-->** Suggestion card is removed.
    * **-->** If API call fails:
        * Show error toast.
4.  **End.**

### 4. Detailed User Flow

1.  **Selection for Context:** The user highlights a paragraph or the entire post to give the AI context about the topic.
2.  **Toolbar Trigger:** The floating toolbar appears. The user clicks the new **"Engage"** button.
3.  **Processing:** The application enters a brief loading state while it calls the `/api/engage` endpoint with the selected text.
4.  **Display Suggestions:** A list of suggestion cards populates the sidebar on the right. Each card is tagged (e.g., "Question") and contains a text suggestion with an "Add" button.
5.  **User Action:** The user reviews the suggestions and finds one they like. They click the **"Add"** button on that card.
6.  **Append Text:** The text from the suggestion card is appended to the end of the user's document. The card is then removed from the sidebar.

### 5. AI & API Requirements

* **Endpoint:** A new `POST` endpoint will be created at `/api/engage`.
* **Request Body:** The endpoint will expect a JSON object with the user's selected text:
    ```json
    {
      "text": "The string of text selected by the user for context."
    }
    ```
* **Response Body:** On success, the endpoint will return a structured JSON object with a variety of suggestions:
    ```json
    {
      "suggestions": [
        { "type": "Question", "content": "Your first generated question goes here." },
        { "type": "Call to Action", "content": "Your generated CTA goes here." },
        { "type": "Interactive Prompt", "content": "Your generated poll or fill-in-the-blank idea goes here." }
      ]
    }
    ```
* **AI Prompt:** The backend will use a prompt instructing the AI to act as a social media strategist and generate three distinct types of engaging content (questions, CTAs, interactive prompts) based on the user's text.

