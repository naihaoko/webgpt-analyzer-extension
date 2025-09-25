# WebGPT Analyzer Chrome Extension

## Overview

The WebGPT Analyzer is a Chrome extension designed to provide insights into the web search activity within your ChatGPT conversations. It extracts and organizes information about the search queries made, the user's messages, and the web sources (URLs) that were both explicitly used and those that were found but not utilized in the conversation.

This extension is particularly useful for understanding how ChatGPT leverages web search in its responses and for reviewing the underlying data sources.

## Features

### **Core Analysis Features**
-   **Comprehensive Search Analysis**: Extracts and categorizes all search queries made by ChatGPT during conversations, with intelligent grouping and organization.
-   **Multi-Turn Conversation Support**: Captures data from all conversation turns, not just the final response, ensuring complete analysis of complex multi-turn discussions.
-   **Unified Search Results Display**: All search-related information is organized in a streamlined Web Search section:
    -   **Search Queries**: Complete list of all search queries performed by ChatGPT across all turns
    -   **Used Search Results**: Web pages and product recommendations that ChatGPT explicitly referenced in its response, including both web citations and product suggestions with detailed information (price, rating, reviews, merchants)
    -   **Unused Search Results**: Search results that were retrieved but not incorporated into the final response
-   **Product Integration**: Product recommendations appear both in dedicated "Product Results" section and within "Used Search Results" section, clearly marked with [Product] prefix and comprehensive details including pricing, ratings, and merchant information.
-   **User Message Display**: Shows the complete conversation context by displaying all user messages sent during the conversation in a collapsible interface.
-   **Multi-Turn Reasoning Analysis**: Extracts and displays ChatGPT's internal reasoning process from all conversation turns, including turn summaries with timestamps and detailed content from its decision-making process.

### **User Experience Features**
-   **Responsive Design**: Adapts to different screen sizes with desktop side-by-side layout and mobile overlay mode for optimal viewing on any device.
-   **Drag-to-Resize Functionality**: Interactive drag handle allows users to resize the sidebar width (300-800px) with real-time content adjustment and persistent width storage.
-   **Collapsible Interface**: All sections (User Messages, Reasoning, Web Search components, Product Results) are expandable/collapsible with count indicators, allowing users to focus on relevant information and manage display density.
-   **Visual Feedback**: Smooth animations, hover effects, and visual indicators provide professional user experience with clear interaction cues.
-   **Persistent Preferences**: User's preferred sidebar width is automatically saved and restored across sessions using localStorage.

### **Technical Robustness**
-   **Smart Data Handling**: Robust extraction logic with proper deduplication across multiple turns, handling empty URLs, missing data fields, and various ChatGPT response formats with appropriate fallbacks.
-   **API Evolution Support**: Handles both legacy (`content_type: "thoughts"`) and current (`metadata.turn_summary`) ChatGPT API formats for reasoning data extraction.
-   **Resilient Design**: Built with fallback CSS selectors and robust data parsing to maintain functionality across ChatGPT interface updates.
-   **Professional Sidebar UI**: Clean, responsive sidebar interface that slides in smoothly without disrupting the ChatGPT conversation experience, with proper cleanup and restoration.

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

3.  **View Analysis**: A responsive sidebar will appear on the right side of the ChatGPT page, displaying:
    -   **User Messages** (collapsible): Your conversation inputs with count indicator
    -   **Reasoning** (collapsible): ChatGPT's internal thought process from all conversation turns with timestamps
    -   **Web Search** (collapsible): Comprehensive search analysis including:
        -   Search queries performed by ChatGPT across all turns
        -   Used search results (web pages and products ChatGPT referenced)
        -   Unused search results (retrieved but not used)
    -   **Product Results** (collapsible): Detailed product information when ChatGPT searches for products

4.  **Customize Interface**:
    -   **Expand/Collapse**: Click on any section header to expand/collapse details for better information management
    -   **Resize Sidebar**: Hover over the left edge of the sidebar to see the drag handle, then drag left or right to resize (300-800px range)
    -   **Responsive View**: On mobile devices (<768px), the sidebar automatically switches to overlay mode

5.  **Persistent Settings**: Your preferred sidebar width is automatically saved and restored in future sessions.

6.  **Close Sidebar**: To close the sidebar, click the "×" button in its header.

## Technical Details

### **Architecture**
-   **Manifest V3**: The extension is built using Chrome Extension Manifest V3, adhering to the latest security and performance standards.
-   **Background Script (`background.js`)**: Listens for the extension icon click and injects the `content.js` script into the active ChatGPT conversation tab.
-   **Content Script (`content.js`)**: This is the core of the extension with advanced UI and data processing capabilities.

### **Data Extraction Engine**
-   **Multi-Turn Support**: Uses efficient single-pass parsing to extract data from ALL conversation turns, not just the final response, ensuring complete analysis of complex conversations.
-   **Adaptive API Handling**: Supports both legacy (`content_type: "thoughts"`) and current (`metadata.turn_summary`) ChatGPT API formats for reasoning data.
-   **Comprehensive Data Sources**:
    -   **User Messages**: From all `role === 'user'` messages with `content_type === 'text'`
    -   **Search Queries**: From all `role === 'tool'` + `author.name === 'web.run'` messages across conversation
    -   **Search Results**: From tool message metadata in `search_result_groups` with proper deduplication
    -   **Used Results**: From ALL assistant message `content_references` (both web pages and products), not just final message
    -   **Reasoning Data**: From both `metadata.turn_summary` (current) and `content_type === 'thoughts'` (legacy) with chronological sorting
-   **Advanced Deduplication**: Implements separate tracking sets for web pages (URL-based) and products (ID-based) across multiple conversation turns.

### **Responsive UI System**
-   **Dynamic Sidebar Creation**: Responsive sidebar with drag-to-resize functionality (300-800px constraints) and persistent width storage.
-   **Adaptive Layout Engine**:
    -   **Desktop Mode** (≥768px): Side-by-side layout with real-time ChatGPT content adjustment during resize
    -   **Mobile Mode** (<768px): Overlay layout with optimized width and no content displacement
-   **Interactive Components**:
    -   Visual drag handle with hover indicators and smooth animations
    -   Collapsible sections with count indicators and accordion-style interaction
    -   Professional visual feedback system with hover effects and transitions
-   **Resilient Design**: Built with multiple fallback CSS selectors and robust data parsing to maintain functionality across ChatGPT interface updates.

### **Performance & Reliability**
-   **Error Handling**: Comprehensive error handling for network issues, authentication failures, malformed data structures, and API changes.
-   **Memory Management**: Proper event listener cleanup, localStorage management, and DOM manipulation optimization.
-   **Cross-Session Persistence**: User preferences (sidebar width) automatically saved and restored using localStorage with validation.
-   **Security**: Operates entirely within browser context using existing ChatGPT session, no external data transmission.