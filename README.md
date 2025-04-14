<div align="center">
<h3 align="center">Write Wonder</h3>

  <p align="center">
    A minimalist writing app with a timer and writing history.
    <br />
     <a href="https://aaditya-aman-write-wonder.com">aaditya-aman-write-wonder.com</a>
  </p>
  <img src="![Screenshot 2025-04-14 110921](https://github.com/user-attachments/assets/a9de360f-6052-4d0d-ade5-5e277b415cc2)
" alt="Write Wonder Interface" width="800"/>
</div>

## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

Write Wonder is a minimalist writing application designed to provide a distraction-free writing environment. It includes a timer to help writers focus, a history feature to save and revisit previous writing sessions, and customizable fonts and themes to personalize the writing experience.

### Key Features

- **Timer:** A built-in timer to track writing time and encourage focused writing sessions.
- **Writing History:** Automatically saves writing sessions, allowing users to revisit and continue their work.
- **Customizable Fonts:** Offers a selection of fonts, including Inter, Georgia, Menlo, Helvetica, and Garamond, to suit individual preferences.
- **Theme Options:** Supports light, dark, and sepia themes for comfortable writing in various lighting conditions.
- **Keyboard Shortcuts:** Provides keyboard shortcuts (Ctrl+N for new session, Ctrl+S for save) for efficient workflow.
- **Fullscreen Mode:** Allows users to toggle fullscreen mode for an immersive writing experience.
- **Responsive Design:** Works seamlessly on various devices, ensuring a consistent writing experience.
- **Local Storage:** Utilizes IndexedDB for storing writing history, with localStorage as a fallback.

## Built With

-   [Next.js](https://nextjs.org/) - The React Framework for Production
-   [React](https://reactjs.org/) - A JavaScript library for building user interfaces
-   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
-   [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for React
-   [Lucide React](https://lucide.dev/) - Beautifully simple icons
-   [Zod](https://zod.dev/) - TypeScript-first schema validation with static types.
-   [Sonner](https://sonner.emilkowal.ski/) - An opinionated toast component for React.
-   [next-themes](https://github.com/pacocoursey/next-themes) - Next.js theme provider

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager

### Installation

1.  Clone the repository:

    ```sh
    git clone https://github.com/aaditya-aman/write-wonder.git
    ```

2.  Navigate to the project directory:

    ```sh
    cd write-wonder
    ```

3.  Install the dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

4.  Run the development server:

    ```sh
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Acknowledgments

-   This project uses components from the [shadcn/ui](https://ui.shadcn.com/) library.
