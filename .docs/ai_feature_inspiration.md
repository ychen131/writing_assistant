## Feature Brief: I Need Inspiration

### 1\. Feature Overview

The "I Need Inspiration" feature is designed to help lifestyle content creators overcome writer's block. When creating a new document, the user can opt to receive AI-generated starting points for their chosen topic. This feature provides three distinct, creative angles, allowing the user to select one and begin writing immediately, ensuring they start with a strong, focused idea.

### 2\. User Flowchart

```mermaid
graph TD
    A[Start: User clicks "+ New Document"] --> B{New Document Dialog};
    B --> C["Continue"];
    B --> D["I need inspiration"];
    C --> E[Main Editor (Blank Canvas)];
    D --> F[Inspiration Modal - Step 1: <br> User inputs topic sentence];
    F --> G{User clicks "Continue"};
    G --> H[Inspiration Modal - Step 2: <br> AI displays 3 angles];
    H --> I{Select an Angle};
    H --> J{Click "Rethink"};
    H --> K{Click "Back"};
    I --> L[Main Editor (Pre-filled with selection)];
    J --> H;
    K --> F;
```

### 3\. Detailed User Flow

1.  **Initiation:** The user clicks the **"+ New Document"** button on the main dashboard.
2.  **Decision:** A dialog box appears, offering two choices:
      * **"Continue":** Takes the user directly to the main editor with a blank canvas.
      * **"I need inspiration":** Proceeds to the inspiration flow.
3.  **Step 1: Topic Input**
      * An "Inspiration Modal" appears.
      * The user is prompted with instructional text (e.g., "What's on your mind?") to enter a short sentence describing their topic.
      * The user clicks "Continue" to submit their topic.
4.  **Step 2: Review & Decide**
      * The user remains in the modal, which updates its view to display three distinct, AI-generated paragraphs ("angles").
      * From here, the user has three options:
        1.  **Select an Angle:** The user clicks on the paragraph they like best. This closes the modal and loads the main editor, pre-filled with the selected paragraph.
        2.  **Click "Rethink":** The user clicks a refresh/rethink icon. The AI generates three new angles based on the *same* initial topic, and the modal view updates.
        3.  **Click "Back":** The user clicks a "Back" button to return to the topic input screen (Step 1) to edit or "fine-tune their ask."

### 4\. AI Behavior and Logic

  * **Goal:** To generate three distinct content angles based on the user's topic sentence.
  * **Generated Angles:** The AI will always generate one of each of the following:
    1.  **A Personal Anecdote:** A short, first-person story.
    2.  **An Informative/Tips Angle:** A practical, helpful paragraph.
    3.  **A Descriptive/Sensory Angle:** A vivid paragraph focusing on atmosphere and senses.
  * **Constraints:** Each generated paragraph must be under 150 words and written in an engaging, accessible tone suitable for a blog or social media.

### 5\. Final AI Prompt

The following prompt will be sent to the AI to power the feature. It is designed to produce a structured JSON output for reliable integration.

```text
**Role:**
You are an expert writing assistant named WordWise, specializing in helping lifestyle content creators (especially in food and travel) brainstorm engaging ideas. Your tone is creative, helpful, and encouraging.

**Task:**
Based on the user's topic sentence, you will generate three distinct content angles to inspire their writing. Each angle must be a unique paragraph that serves as a potential starting point for a blog post or social media update.

**User's Topic:**
{{USER_TOPIC}}

**Required Angles:**
You must generate exactly one of each of the following three angles:
1.  **A Personal Anecdote:** Write a short, engaging, first-person story or memory related to the topic. Make it feel personal and relatable.
2.  **An Informative/Tips Angle:** Provide a practical and helpful paragraph. This could include a key tip, a surprising fact, or a mini "how-to" insight that provides immediate value to the reader.
3.  **A Descriptive/Sensory Angle:** Write a vivid paragraph that focuses on the senses (sight, sound, taste, smell, touch). Your goal is to paint a picture and create a strong atmosphere for the reader.

**Constraints:**
* Each angle must be a single paragraph.
* Each paragraph must be under 150 words.
* The writing style must be engaging and accessible, not overly academic or formal.
* You must provide your response in the JSON format specified below.

**Output Format:**
Respond with a valid JSON object. The root object should have a single key, "angles," which is an array of three objects. Each object in the array must have two keys: "angle_type" and "content".

{
  "angles": [
    {
      "angle_type": "Personal Anecdote",
      "content": "Your generated paragraph for the personal anecdote goes here."
    },
    {
      "angle_type": "Informative/Tips",
      "content": "Your generated paragraph with tips or information goes here."
    },
    {
      "angle_type": "Descriptive/Sensory",
      "content": "Your generated paragraph focusing on sensory details goes here."
    }
  ]
}
```