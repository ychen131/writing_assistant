### High-Level Blueprint

Our strategy is to build the page structurally first, then layer in Next.js-specific optimizations and functionality. We'll start by creating the basic component files, then populate them with the static layout, and finally replace placeholder elements with optimized, interactive Next.js components.

**Key Decisions:**
- **Homepage:** The new welcome page will replace the current `app/page.tsx`.
- **Routing:** All "Sign Up" and "Get Started" buttons will link to the existing `/auth` page.
- **Component Directory:** New components will be stored in `components/landing/`.
- **Styling:** We will use the existing Shadcn/UI component library to ensure design consistency.
- **Image:** The hero image will be located at `public/trovatrip-fitz-roy-hiker.jpg`.

-----

### Part 1: Component Scaffolding and Static Layout

We begin by creating the structure and converting the static HTML into basic, non-interactive JSX.

#### **Prompt 1.1: Create Component Files and Basic Structure**

````text
As a senior software engineer on the WordWise project, your first task is to set up the file structure for the new landing page within the Next.js application.

**Project Context:**
- **Framework:** Next.js 15 with App Router, TypeScript.
- **Goal:** Create the necessary files for a new homepage and break its structure into reusable components.

**Requirements:**
1.  **Update the main page file:** In the `app/` directory, overwrite the existing `page.tsx`. This will serve as our new homepage.
2.  **Create component files:** In your `components/` directory, create a `landing/` subdirectory and add two new files:
    - `LandingHeader.tsx`
    - `LandingHero.tsx`
3.  **Basic Assembly:** In `app/page.tsx`, import and render these two new components in order. The page should be a simple server component that does nothing but assemble the layout.
    ```tsx
    // app/page.tsx
    import LandingHeader from '@/components/landing/LandingHeader';
    import LandingHero from '@/components/landing/LandingHero';

    export default function HomePage() {
      return (
        <>
          <LandingHeader />
          <LandingHero />
        </>
      );
    }
    ```
4.  The new component files (`LandingHeader.tsx` and `LandingHero.tsx`) should, for now, only contain basic placeholder JSX.
````

-----

#### **Prompt 1.2: Implement the Static Header Component**

```text
Building on the previous step, you will now populate the `LandingHeader.tsx` component with the static HTML structure from our design.

**Project Context:**
- You have an empty `LandingHeader.tsx` component.
- You have the final HTML design for the landing page.

**Requirements:**
1.  Copy the `<header>` section from the final HTML design into `LandingHeader.tsx`.
2.  Convert the HTML to JSX:
    - Change all `class` attributes to `className`.
    - Ensure all self-closing tags (like `<svg>`) are properly formatted for JSX.
3.  For this step, all navigation links should remain as standard `<a>` tags with `href="#"`. We are only focusing on the static layout and styling. We will integrate with the UI component library later.
```

-----

#### **Prompt 1.3: Implement the Static Hero Component**

```text
Next, you will populate the `LandingHero.tsx` component with the static HTML structure for the main hero section.

**Project Context:**
- You have an empty `LandingHero.tsx` component.
- You have the final HTML design for the landing page.

**Requirements:**
1.  Copy the `<main>` section from the final HTML design into `LandingHero.tsx`.
2.  Convert the HTML to JSX (`class` to `className`, etc.).
3.  For the image, use a standard `<img>` tag for now, pointing to the final Unsplash URL: `https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2940&auto=format&fit=crop`.
4.  All call-to-action buttons should remain as `<a>` tags with `href="#"`. We will integrate with our UI library in a later step.
```

-----

### Part 2: Next.js Optimizations and Integration

Now that the page is visually complete but static, we will replace elements with optimized Next.js components.

#### **Prompt 2.1: Integrate the Hero Image with `next/image`**

```text
The landing page is statically rendered, but the hero image is not optimized. Your task is to integrate the image locally using the Next.js Image component for better performance.

**Project Context:**
- The `LandingHero.tsx` component currently uses a standard `<img>` tag with an external URL.

**Requirements:**
1.  **Save the image:** Assume the final image file (`trovatrip-fitz-roy-hiker.jpg`) has been saved into the `public/` directory of your Next.js project.
2.  **Update the component:** In `LandingHero.tsx`, import the `Image` component from `next/image`.
3.  Replace the `<img>` tag with the Next.js `<Image>` component.
4.  **Configure the `Image` component:**
    - Set the `src` to `"/trovatrip-fitz-roy-hiker.jpg"`.
    - Use the `fill` property to make the image cover its parent container.
    - Add `style={{ objectFit: 'cover' }}` to replicate the `object-cover` class functionality.
    - Add the `priority` property to ensure the hero image is loaded eagerly, improving the Largest Contentful Paint (LCP) score.
```

-----

#### **Prompt 2.2: Integrate the Font with `next/font`**

```text
To optimize font loading and prevent layout shifts, you will now integrate the "Inter" font using the recommended `next/font` package.

**Project Context:**
- The current implementation relies on a `<link>` tag in the HTML.

**Requirements:**
1.  **Modify the root layout:** Open `app/layout.tsx`.
2.  Import the `Inter` font from `next/font/google`.
3.  Instantiate the font: `const inter = Inter({ subsets: ['latin'] });`.
4.  Apply the font's className to the `<body>` tag: `<body className={inter.className}>`.
5.  **Clean up:** Go back to `app/page.tsx` or the component where the `<head>` section might have been temporarily placed, and remove the `<link>` tags for Google Fonts and the associated `<style>` block. Next.js now handles this automatically.
```

-----

#### **Prompt 2.3: Implement Client-Side Navigation**

```text
The final step is to make the landing page's buttons functional by wiring them up to the application's routing system.

**Project Context:**
- The `LandingHeader.tsx` and `LandingHero.tsx` components use standard `<a>` tags for navigation.
- The goal is to direct users to the sign-up page.

**Requirements:**
1.  **Update Header:** In `LandingHeader.tsx`:
    - Import the `Link` component from `next/link`.
    - Import the `Button` component from `@/components/ui/button`.
    - Replace the `<a>` tag for the "Sign Up Free" button with a `<Link>` component pointing to `/auth`, wrapping a `<Button>` component.
2.  **Update Hero:** In `LandingHero.tsx`:
    - Import the `Link` component from `next/link`.
    - Import the `Button` component from `@/components/ui/button`.
    - Replace the `<a>` tags for both the "Get Started For Free" and "See a Demo" buttons with `<Link>` components wrapping `<Button>` components.
    - The "Get Started" button should point to `/auth`.
    - The "See a Demo" button can remain pointing to `href="#"` for now, or to a future `/demo` route.
3.  Verify that all other links (`Features`, `Pricing`, `Log In`) are also converted to use the `<Link>` component where appropriate for internal navigation.
```