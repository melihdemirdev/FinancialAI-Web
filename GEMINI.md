# Project Overview

This is a personal finance management web application built with Next.js, TypeScript, and Tailwind CSS. It allows users to track their assets, liabilities, receivables, and installments. The application calculates the user's net worth, and a "safe to spend" amount, and provides a financial health score. It also features a dark mode and uses Zustand for state management with data persisted in IndexedDB.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the application on [http://localhost:3000](http://localhost:3000).

3.  **Build for production:**
    ```bash
    npm run build
    ```

4.  **Start the production server:**
    ```bash
    npm run start
    ```

5.  **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Custom styles are defined in `tailwind.config.ts` and `src/app/globals.css`.
*   **State Management:** Zustand is used for state management. The stores are located in the `src/store` directory.
    *   `useFinanceStore`: Manages financial data like assets, liabilities, etc.
    *   `useProfileStore`: Manages user profile data.
    *   `useThemeStore`: Manages the application's theme (light/dark mode).
*   **Data Persistence:** The application uses `idb-keyval` to persist data in the browser's IndexedDB.
*   **Code Structure:** The project follows the Next.js App Router structure.
    *   `src/app`: Contains the application's pages and layouts.
    *   `src/components`: Contains reusable React components.
    *   `src/domain`: Contains business logic and calculations.
    *   `src/store`: Contains the Zustand state management stores.
    *   `src/types`: Contains TypeScript type definitions.
