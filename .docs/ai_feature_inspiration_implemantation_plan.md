### High-Level Blueprint & Philosophy

Our approach will be to build the feature from the outside in, but in two separate streams: **Backend API** and **Frontend UI**. We will first build a "dumb" but functional UI and a "hardcoded" but responsive API. This allows us to work in parallel and test both pieces independently before wiring them together at the very end.

1.  **Backend Development (API Stream):** We will create a new, testable API endpoint. It will initially return hardcoded data, then we'll add the live AI call. This ensures the contract between frontend and backend is solid before introducing AI complexity.
2.  **Frontend Development (UI Stream):** We will build the complete user flow within the modal using mock data. The user will be able to click through every step, see every view, and all the state transitions will work perfectly *before* we ever make a real API call.
3.  **Integration (Final Step):** Once we have a working UI and a working API, the final step is to connect them. This will be a small, low-risk change because both sides are already tested and proven to work independently.

This methodology ensures that at every point, we have a working, testable piece of the application.

-----

### Part 1: Backend API (`/api/inspire`)

This part focuses exclusively on creating the new server-side endpoint.

-----

#### **Prompt 1.1: Create a Mock API Endpoint**

````text
As a senior software engineer building the WordWise app, your first task is to create a new API endpoint for the "I Need Inspiration" feature.

**Project Context:**
- **Framework:** Next.js 15 with App Router
- **Technology:** TypeScript
- **Goal:** Create a new API route at `/api/inspire` that accepts a POST request.

**Requirements:**
1.  Create the file `app/api/inspire/route.ts`.
2.  The endpoint must handle POST requests.
3.  For this initial step, it should **not** call any external services.
4.  It should read the `topic` from the incoming JSON body but do nothing with it for now.
5.  It must return a **hardcoded, mock JSON response** that strictly follows the structure we designed. The response should have a `200 OK` status.
6.  The mock content should be clearly identifiable as a placeholder.

**Example Hardcoded Response:**
```json
{
  "angles": [
    {
      "angle_type": "Personal Anecdote",
      "content": "This is a mock personal anecdote about the user's topic."
    },
    {
      "angle_type": "Informative/Tips",
      "content": "This is a mock informative paragraph with tips about the topic."
    },
    {
      "angle_type": "Descriptive/Sensory",
      "content": "This is a mock descriptive paragraph focusing on sensory details."
    }
  ]
}
````

**Testing:**
Along with the route handler, provide a basic test using a tool like Jest or the built-in Next.js testing utilities. The test should:

  - Mock a `POST` request to `/api/inspire` with a sample `{ "topic": "testing" }` body.
  - Assert that the response status is `200`.
  - Assert that the response body matches the hardcoded JSON structure exactly.

<!-- end list -->

````

---

#### **Prompt 1.2: Integrate the Live AI Service**

```text
Building on the previous step, you will now replace the hardcoded mock response in the `/api/inspire` endpoint with a live call to the OpenAI API.

**Project Context:**
- You have an existing mock API endpoint at `app/api/inspire/route.ts`.
- You will use Vercel's AI SDK and OpenAI's GPT-4o-mini, consistent with the existing `/api/analyze-text` endpoint.
- The full, tested AI prompt is available in the feature brief.

**Requirements:**
1.  Modify `app/api/inspire/route.ts`.
2.  Securely retrieve the `OPENAI_API_KEY` from environment variables.
3.  Use the `topic` from the request body to construct the detailed prompt we designed for the AI.
4.  Make a call to the OpenAI API to generate the content.
5.  Enable `response_mode: 'json'` or a similar setting in the AI SDK to ensure you get a parsable JSON object back, as per our prompt's instructions.
6.  Parse the AI's response and send it back to the client.
7.  Add basic error handling. If the AI call fails or the response is not valid JSON, return a `500 Internal Server Error` with a descriptive error message.

**Testing:**
Update the existing test file for this endpoint:
- Mock the OpenAI SDK client.
- Create a test case where the mocked client returns a successful, valid JSON response. Assert that your endpoint correctly forwards this response.
- Create another test case where the mocked client throws an error. Assert that your endpoint correctly catches this and returns a `500` status code.
````

-----

### Part 2: Frontend UI & Logic

This part focuses on building the entire modal experience with mock data. We will not touch the API yet.

-----

#### **Prompt 2.1: Create the Reusable Modal Component and Initial State**

```text
Now, let's start the frontend. The first step is to create the foundational UI components and manage the initial state transition.

**Project Context:**
- **Framework:** Next.js 15, React 19, TypeScript
- **UI Library:** `shadcn/ui` and Tailwind CSS are already installed and configured.

**Requirements:**
1.  **Create a Reusable Modal:** In your components directory, create a new generic `Modal.tsx` component using `shadcn/ui`'s `Dialog` component (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`). It should accept `isOpen`, `onClose`, `title`, and `children` as props.
2.  **Create the Inspiration Modal Component:** Create `InspirationModal.tsx`. This component will house all the logic for our feature. For now, it should:
    - Manage its own open/closed state.
    - Render the reusable `Modal` component.
    - Contain a view for the initial decision: two buttons, "I need inspiration" and "Continue," styled with `shadcn/ui`'s `Button` component.
3.  **Modify the Dashboard:** In the `Dashboard` page component (where the "+ New Document" button lives), import and render the `InspirationModal`. Clicking "+ New Document" should now open this modal instead of immediately creating a new document.

**Testing:**
Provide a Storybook story or a simple test file for the `InspirationModal` that:
- Renders the component in its initial state.
- Simulates a click on the button that opens it.
- Verifies that the modal becomes visible and displays the "I need inspiration" and "Continue" buttons.
```

-----

#### **Prompt 2.2: Build All Modal Views and State Transitions**

```text
Based on the previous step, you will now build the UI for all the different views within the `InspirationModal` and manage the transitions between them. We will still use mock data and no API calls.

**Project Context:**
- You have an `InspirationModal.tsx` component that opens to an initial decision view.

**Requirements:**
1.  **Implement a State Machine:** Inside `InspirationModal.tsx`, use a React hook (`useState` or `useReducer`) to manage the current view state. The possible states are: `'decision'`, `'input_topic'`, `'loading'`, `'display_angles'`, `'error'`.
2.  **Build the "Topic Input" View:**
    - Create the UI for this view, including a `textarea` for the topic, a "Continue" button, and a "Back" button.
    - Clicking "Back" should set the view state back to `'decision'`.
    - Clicking "Continue" should set the view state to `'loading'`.
3.  **Build the "Loading" View:**
    - Create a simple UI for this view, perhaps with a `lucide-react` spinner icon and the text "Generating ideas...".
4.  **Build the "Display Angles" View:**
    - Create the UI to display three "angle" cards using mock data. Each card should show the `angle_type` and `content`.
    - Include a "Rethink" button and a "Back" button.
    - Clicking "Back" should set the view state to `'input_topic'`.
    - Clicking "Rethink" should set the view state to `'loading'`.
5.  **Build the "Error" View:**
    - Create an error view that displays an error message and offers a "Retry" button.
    - The "Retry" button should attempt the same operation again.
6.  **Simulate the Flow:** Use `setTimeout` to automatically transition from the `'loading'` state to the `'display_angles'` state after 2 seconds to simulate an API call.

**Testing:**
Update the tests for `InspirationModal.tsx`:
- Write tests for each view to ensure it renders correctly based on the current state.
- Write tests to verify that clicking the buttons (`Back`, `Continue`, `Rethink`, `Retry`) correctly transitions the component to the expected view state.
```

-----

### Part 3: Integration

This is the final phase where we connect the tested frontend to the tested backend.

-----

#### **Prompt 3.1: Wire Up the Frontend and Backend**

```text
You have a fully functional frontend modal that uses mock data, and a fully functional backend API that connects to the AI. The final task is to wire them together.

**Project Context:**
- The `InspirationModal.tsx` component handles all view states.
- The `/api/inspire` endpoint is live and tested.

**Requirements:**
1.  **Remove Mock Data Logic:** In `InspirationModal.tsx`, remove the `setTimeout` and any hardcoded angle data.
2.  **Implement API Call:**
    - When the "Continue" button in the `'input_topic'` view is clicked, trigger a `fetch` `POST` request to your `/api/inspire` endpoint. The `topic` from the state should be sent in the request body.
    - While the request is pending, the modal must be in the `'loading'` state.
    - On a successful response, parse the JSON, store the `angles` array in your component's state, and switch the view to `'display_angles'`.
    - On a failed response, switch to the `'error'` view and display an appropriate error message.
3.  **Implement "Rethink" Logic:** Wire the "Rethink" button to perform the exact same API call.
4.  **Implement "Retry" Logic:** Wire the "Retry" button in the error view to perform the same API call.
5.  **Implement Final Navigation:**
    - When a user clicks on one of the angle cards in the `'display_angles'` view, the modal should close.
    - The application should then navigate to a new document in the main editor page.
    - **Crucially, the content of the selected angle must be passed to the editor page**, so it appears as the starting text. You can achieve this via router state or query parameters.

**Testing:**
Update your tests one last time:
- Use a library like `msw` (Mock Service Worker) or Jest's fetch mock to mock the `/api/inspire` endpoint.
- Test the full successful flow: a user types a topic, clicks continue, the mocked API returns success, and the angles are displayed.
- Test the error flow: the mocked API returns an error, and the modal displays an appropriate error message with retry functionality.
```

-----

### Clarified Requirements

Based on user feedback, the following details have been clarified:

1. **AI Prompt**: The complete AI prompt is provided in the feature brief document and should generate exactly three angle types: "Personal Anecdote", "Informative/Tips", and "Descriptive/Sensory".

2. **Error Handling**: When the API fails, the modal should show an error message and offer a "Retry" button to attempt the same operation again.

3. **Navigation**: When a user selects an angle, they should be taken to a new document with the selected angle content pre-filled as the starting text.

4. **Codebase Integration**: The new document creation should follow the same pattern as the existing document creation flow in the codebase.

5. **Styling**: The modal and angle cards should follow the same design patterns as existing components using shadcn/ui.

6. **Response Structure**: The API should always return exactly three angles with the specified types: "Personal Anecdote", "Informative/Tips", and "Descriptive/Sensory".