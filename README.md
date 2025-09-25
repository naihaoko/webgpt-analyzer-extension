# WebGPT Analyzer Chrome Extension

## Overview

The WebGPT Analyzer is a Chrome extension designed to provide insights into the web search activity within your ChatGPT conversations. It extracts and organizes information about the search queries made, the user's messages, and the web sources (URLs) that were both explicitly used and those that were found but not utilized in the conversation.

This extension is particularly useful for understanding how ChatGPT leverages web search in its responses and for reviewing the underlying data sources.

## Features

-   **Comprehensive Search Analysis**: Extracts and categorizes all search queries made by ChatGPT during conversations, with intelligent grouping and organization.
-   **Unified Search Results Display**: All search-related information is organized in a streamlined Web Search section:
    -   **Search Queries**: Complete list of all search queries performed by ChatGPT
    -   **Used Search Results**: Web pages and product recommendations that ChatGPT explicitly referenced in its response, including both web citations and product suggestions with detailed information (price, rating, reviews, merchants)
    -   **Unused Search Results**: Search results that were retrieved but not incorporated into the final response
-   **Product Integration**: Product recommendations now appear seamlessly within the "Used Search Results" section, clearly marked with [Product] prefix and comprehensive details including pricing, ratings, and merchant information.
-   **User Message Display**: Shows the complete conversation context by displaying all user messages sent during the conversation.
-   **Reasoning Analysis**: Extracts and displays ChatGPT's internal reasoning process, including thought summaries and detailed content from its decision-making process.
-   **Smart Data Handling**: Robust extraction logic that handles empty URLs, missing data fields, and various ChatGPT response formats with appropriate fallbacks.
-   **Collapsible Interface**: All sections are expandable/collapsible, allowing users to focus on relevant information and manage display density.
-   **Resilient Design**: Built with fallback CSS selectors and robust data parsing to maintain functionality across ChatGPT interface updates.
-   **Integrated Sidebar UI**: Clean, professional sidebar interface that slides in smoothly without disrupting the ChatGPT conversation experience.

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

3.  **View Analysis**: A sidebar will appear on the right side of the ChatGPT page, displaying:
    -   **User Messages**: Your conversation inputs
    -   **Reasoning**: ChatGPT's internal thought process (when available)
    -   **Web Search**: Comprehensive search analysis including:
        -   Search queries performed by ChatGPT
        -   Used search results (web pages and products ChatGPT referenced)
        -   Unused search results (retrieved but not used)
    -   **Product Results**: Detailed product information when ChatGPT searches for products

    You can click on section headers to expand/collapse details for better information management.

4.  **Close Sidebar**: To close the sidebar, click the "×" button in its header.

## Technical Details

-   **Manifest V3**: The extension is built using Chrome Extension Manifest V3, adhering to the latest security and performance standards.
-   **Background Script (`background.js`)**: Listens for the extension icon click and injects the `content.js` script into the active ChatGPT conversation tab.
-   **Content Script (`content.js`)**: This is the core of the extension. It performs the following actions:
    -   Dynamically creates and injects the sidebar UI into the ChatGPT page with resilient CSS selectors.
    -   Fetches conversation data from ChatGPT's internal `backend-api` using the user's session `accessToken`.
    -   Uses efficient single-pass parsing to extract data from ChatGPT's conversation JSON structure:
        -   **User Messages**: From `role === 'user'` messages with `content_type === 'text'`
        -   **Search Queries**: From `role === 'tool'` + `author.name === 'web.run'` messages
        -   **Search Results**: From tool message metadata in `search_result_groups`
        -   **Used Results**: From final assistant message `content_references` (both web pages and products)
        -   **Reasoning Data**: From `content_type === 'thoughts'` messages with summary/content pairs
    -   Implements robust data handling with product ID-based deduplication (not URL-based) and fallback values for missing data.
    -   Renders extracted data into an interactive sidebar with accordion-style collapsible sections.
    -   Includes comprehensive error handling for network issues, authentication failures, and malformed data structures.