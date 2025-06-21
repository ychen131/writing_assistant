Feature Brief: Persona
1. Feature Overview

The "Persona" feature is a contextual, AI-powered editing tool that allows users to instantly rewrite any selected portion of their text by adopting a different creative personality. This feature directly addresses the user's need to shape their identity as a writer, enabling them to quickly make their content more humorous, vivid, or direct.
2. User Experience (UX) & Design

The user experience is designed to be fast, intuitive, and contextual, embedding this powerful creative tool directly into the writing flow.

    Interaction Model: A floating toolbar will appear directly above the user's text selection.

    The "Persona" Button: The toolbar will feature a button clearly labeled "Persona", likely accompanied by a creative icon (e.g., a magic wand ✨).

    Dropdown Menu: Clicking the "Persona" button will trigger a dropdown menu with the available persona options:

        "Humorous"

        "Vivid"

        "To the point"

    Feedback & Loading: Upon selecting a persona, the application will provide immediate feedback, such as a subtle loading indicator, to show that the AI is processing the request.

    Error Handling: If the AI rewrite fails, a non-intrusive toast notification will appear to inform the user, allowing them to try again without losing their place.

3. User Flowchart

graph TD
    A[Start: User highlights text in the editor] --> B{Floating Toolbar Appears};
    B --> C[User clicks the "Persona" button];
    C --> D{Dropdown Menu Appears};
    D --> E[User selects a persona <br> e.g., "Humorous"];
    E --> F[Show Loading State];
    F --> G[Send (Selected Text, Persona) to /api/persona];
    G --> H{API call successful?};
    H -- Yes --> I[Replace highlighted text <br> with AI-rewritten text];
    H -- No --> J[Show error toast notification];
    I --> K[End: Toolbar disappears];
    J --> K;

4. Detailed User Flow

    Selection: The user highlights a sentence or paragraph they wish to modify.

    Toolbar Appears: A floating toolbar appears just above the selection.

    Initiate Persona Shift: The user clicks the "Persona" button on the toolbar.

    Choose Persona: A dropdown menu opens with the options: "Humorous", "Vivid", "To the point".

    Submit Request: The user clicks on their desired persona.

    Processing: The application enters a brief loading state, captures the selected text and the chosen persona, and sends this data via a POST request to the /api/persona endpoint.

    Text Replacement: Upon receiving a successful response from the API, the originally highlighted text is seamlessly replaced with the rewritten text.

5. AI & API Requirements

    Endpoint: A new POST endpoint will be created at /api/persona.

    Request Body: The endpoint will expect a JSON object:

    {
      "text": "The string of text selected by the user.",
      "persona": "The chosen persona, e.g., 'Humorous'"
    }

    Response Body: On success, the endpoint will return a JSON object:

    {
      "rewrittenText": "The AI-generated version of the text."
    }

    AI Prompt Logic: The backend will construct a dynamic prompt for the AI model based on the requested persona, instructing it to rewrite the user's text accordingly.