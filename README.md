# WebGPT Analyzer Chrome Extension

## Overview

The WebGPT Analyzer is a Chrome extension designed to provide insights into the web search activity within your ChatGPT conversations. It extracts and organizes information about the search queries made, the user's messages, and the web sources (URLs) that were both explicitly used and those that were found but not utilized in the conversation.

This extension is particularly useful for understanding how ChatGPT leverages web search in its responses and for reviewing the underlying data sources.

## Features

-   **Search Query Extraction**: Identifies and lists all search queries made by ChatGPT during a conversation.
-   **User Message Display**: Shows the messages you, as the user, have sent in the conversation.
-   **Used Web Sources**: Highlights URLs from search results that ChatGPT explicitly referenced or used in its responses.
-   **Unused Web Sources**: Lists URLs from search results that were retrieved but not explicitly incorporated into ChatGPT's output.
-   **Integrated Sidebar UI**: Presents all extracted data in a clean, collapsible sidebar directly on the ChatGPT conversation page for easy access and review.
-   **Dynamic UI**: The entire user interface is dynamically created and injected into the page, ensuring a seamless experience without navigating away from your conversation.

## Installation

To install and use the WebGPT Analyzer extension, follow these steps:

1.  **Download the Project**: Obtain the project files (e.g., by cloning the repository or downloading the ZIP file).

2.  **Open Chrome Extensions Page**: In your Google Chrome browser, navigate to `chrome://extensions`.

3.  **Enable Developer Mode**: In the top-right corner of the extensions page, toggle the "Developer mode" switch to the "on" position.

4.  **Load Unpacked Extension**: Click the "Load unpacked" button that appears on the left side of the page.

5.  **Select Project Directory**: In the file selection dialog, navigate to and select the root directory of the `WebGPT-Analyzer-Extension` project (the folder containing `manifest.json`, `background.js`, `content.js`, etc.).

6.  **Confirm Installation**: The "WebGPT Analyzer" extension should now appear in your list of installed extensions. You might see its icon in your Chrome toolbar (if not, click the puzzle piece icon to find and pin it).

## Usage

1.  **Navigate to a ChatGPT Conversation**: Open your Chrome browser and go to a specific ChatGPT conversation page (the URL should look something like `https://chatgpt.com/c/your-conversation-id`).

2.  **Click the Extension Icon**: Click the "WebGPT Analyzer" icon in your Chrome toolbar.

3.  **View Analysis**: A sidebar will appear on the right side of the ChatGPT page, displaying the extracted search queries, user messages, and categorized web sources. You can click on the result titles to expand/collapse their details.

4.  **Close Sidebar**: To close the sidebar, click the "×" button in its header.

## Technical Details

-   **Manifest V3**: The extension is built using Chrome Extension Manifest V3, adhering to the latest security and performance standards.
-   **Background Script (`background.js`)**: Listens for the extension icon click and injects the `content.js` script into the active ChatGPT conversation tab.
-   **Content Script (`content.js`)**: This is the core of the extension. It performs the following actions:
    -   Dynamically creates and injects the sidebar UI into the ChatGPT page.
    -   Fetches conversation data from ChatGPT's internal `backend-api` using the user's session `accessToken`.
    -   Parses the complex JSON structure of the conversation data to extract relevant information (search queries, user messages, used/unused URLs).
    -   Renders the extracted data into the sidebar with appropriate styling and interactive elements (accordions).
    -   Includes logic to handle potential errors during data fetching or parsing.

## Future Improvements

-   **Export Functionality**: Add options to export the extracted data (e.g., to CSV, JSON, or Markdown).
-   **Enhanced Query Parsing**: Implement more sophisticated natural language processing to better identify and separate complex or combined search queries.
-   **UI/UX Enhancements**: Further refine the sidebar's appearance and interactivity based on user feedback.
-   **Cross-Browser Compatibility**: Extend support to other browsers like Firefox or Edge.
-   **Settings Page**: Allow users to customize certain aspects of the extension's behavior or appearance.

## Contributing

Contributions are welcome! If you have suggestions for improvements, bug reports, or would like to contribute code, please feel free to open an issue or submit a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).