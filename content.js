

(async () => {
    // --- UTILITY FUNCTIONS ---
    const log = (message) => console.log('[WebGPT Analyzer]', message);

    // Function to remove the UI
    const removeUI = () => {
        const existingSidebar = document.getElementById('webgpt-analyzer-sidebar');
        if (existingSidebar) {
            existingSidebar.remove();
        }
        // Restore main content width if it was adjusted
        const mainContent = document.querySelector('.relative.z-0.flex.h-full.w-full.overflow-hidden');
        if (mainContent) {
            mainContent.style.width = '100%';
        }
    };

    // --- INITIALIZATION ---
    log('Executing content script.');
    removeUI(); // Clean up any old UI before creating a new one

    // --- UI CREATION ---
    const createUI = () => {
        log('Creating UI.');
        const sidebar = document.createElement('div');
        sidebar.id = 'webgpt-analyzer-sidebar';
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 450px;
            height: 100%;
            background-color: #fff;
            color: #333;
            border-left: 1px solid #ccc;
            z-index: 20000;
            display: flex;
            flex-direction: column;
            font-family: sans-serif;
            box-shadow: -5px 0 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px;
            background-color: #fff;
            border-bottom: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h1');
        title.textContent = 'WebGPT Analyzer';
        title.style.cssText = 'font-size: 2em; font-weight: 600; color: #E60012; margin: 0; text-align: center; border-bottom: 2px solid #E60012; padding-bottom: 10px;';
        header.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #333;
            font-size: 24px;
            cursor: pointer;
            line-height: 1;
            padding: 0 8px;
        `;
        closeButton.onclick = () => {
            sidebar.style.transform = 'translateX(100%)';
            setTimeout(removeUI, 300);
        };
        header.appendChild(closeButton);
        sidebar.appendChild(header);

        const contentArea = document.createElement('div');
        contentArea.id = 'webgpt-analyzer-content';
        contentArea.style.cssText = 'padding: 20px; overflow-y: auto; flex-grow: 1;';
        sidebar.appendChild(contentArea);

        document.body.appendChild(sidebar);

        // Animate sidebar in
        setTimeout(() => {
            sidebar.style.transform = 'translateX(0)';
        }, 10);

        // Adjust main content width to make space for the sidebar
        const mainContent = document.querySelector('.relative.z-0.flex.h-full.w-full.overflow-hidden');
        if (mainContent) {
            mainContent.style.width = `calc(100% - ${sidebar.style.width})`;
        }

        return contentArea;
    };

    const renderError = (contentArea, message) => {
        contentArea.innerHTML = `<div style="padding: 12px; border-radius: 6px; background-color: #ffe0e0; border: 1px solid #e60012; color: #e60012;"><strong>Error:</strong> ${message}</div>`;
    };

    const renderResults = (contentArea, analysis) => {
        contentArea.innerHTML = ''; // Clear loading message

        const createSection = (titleText) => {
            const section = document.createElement('div');
            section.style.marginBottom = '20px';
            const title = document.createElement('h2');
            title.textContent = titleText;
            title.style.cssText = 'margin-top: 30px; margin-bottom: 12px; font-size: 1.5em; color: #E60012; border-left: 4px solid #E60012; padding-left: 8px;';
            section.appendChild(title);
            return section;
        };

        const createAccordion = (item) => {
            const container = document.createElement('div');
            container.style.marginBottom = '8px';

            const button = document.createElement('button');
            button.textContent = item.title;
            button.style.cssText = `
                width: 100%;
                background-color: #fff;
                color: #333;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 14px 18px;
                text-align: left;
                cursor: pointer;
                font-size: 1em;
                font-weight: 600;
                margin-bottom: 10px;
                transition: background 0.2s, border 0.2s;
            `;

            const panel = document.createElement('div');
            panel.style.cssText = `
                padding: 12px 18px;
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 6px 6px;
                display: none;
                font-size: 0.95em;
                line-height: 1.5;
                margin-bottom: 12px;
            `;
            panel.innerHTML = `
                <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${item.title}</p>
                <p style="margin: 0 0 8px 0;"><strong>URL:</strong> <a href="${item.url}" target="_blank" style="color: #E60012; text-decoration: underline; word-break: break-all;">${item.url}</a></p>
                <p style="margin: 0 0 8px 0;"><strong>Pub Date:</strong> ${item.pub_date || 'N/A'}</p>
                <p style="margin: 0; color: #555;"><strong>Snippet:</strong> ${item.snippet || 'No snippet available.'}</p>
            `;

            button.onclick = () => {
                const isHidden = panel.style.display === 'none';
                panel.style.display = isHidden ? 'block' : 'none';
                button.style.borderRadius = isHidden ? '6px 6px 0 0' : '6px';
            };
            button.onmouseover = () => { button.style.backgroundColor = '#f9f9f9'; button.style.borderColor = '#E60012'; };
            button.onmouseout = () => { button.style.backgroundColor = '#fff'; button.style.borderColor = '#ccc'; };

            container.appendChild(button);
            container.appendChild(panel);
            return container;
        };

        // User Messages
        if (analysis.userMessages.length > 0) {
            const section = createSection('User Messages');
            analysis.userMessages.forEach(msg => {
                const p = document.createElement('p');
                p.textContent = msg;
                p.style.cssText = 'margin: 4px 0; font-size: 0.95em;';
                section.appendChild(p);
            });
            contentArea.appendChild(section);
        }

        // Search Queries
        if (analysis.queries.length > 0) {
            const section = createSection('Search Queries');
            const ul = document.createElement('ul');
            ul.style.cssText = 'padding-left: 20px; margin: 0 0 20px 0; list-style-type: disc;';
            analysis.queries.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q;
                li.style.cssText = 'margin-bottom: 6px; font-size: 0.95em;';
                ul.appendChild(li);
            });
            section.appendChild(ul);
            contentArea.appendChild(section);
        }

        // Used Results
        const usedSection = createSection(`${analysis.resultsUsed.length} Used Search Results`);
        if (analysis.resultsUsed.length > 0) {
            analysis.resultsUsed.forEach(item => usedSection.appendChild(createAccordion(item)));
        } else {
            usedSection.innerHTML += '<p style="font-size: 0.95em; color: #555;">(None found)</p>';
        }
        contentArea.appendChild(usedSection);

        // Unused Results
        const unusedSection = createSection(`${analysis.resultsUnused.length} Unused Search Results`);
        if (analysis.resultsUnused.length > 0) {
            analysis.resultsUnused.forEach(item => unusedSection.appendChild(createAccordion(item)));
        } else {
            unusedSection.innerHTML += '<p style="font-size: 0.95em; color: #555;">(None found)</p>';
        }
        contentArea.appendChild(unusedSection);
    };

    // --- DATA FETCHING AND PROCESSING ---
    const runAnalysis = async (contentArea) => {
        log('Starting analysis.');
        contentArea.innerHTML = '<p style="font-size: 0.95em; color: #555;">Loading analysis...</p>';

        try {
            const conversationId = location.pathname.match(/\/c\/([^/]+)/)?.[1];
            if (!conversationId) {
                throw new Error("Could not find a conversation ID. Please ensure you're on a valid ChatGPT conversation page.");
            }
            log(`Conversation ID: ${conversationId}`);

            const sessionResponse = await fetch("/api/auth/session");
            if (!sessionResponse.ok) throw new Error(`Failed to fetch session (status: ${sessionResponse.status}). Are you logged in?`);
            const sessionData = await sessionResponse.json();
            const accessToken = sessionData.accessToken;
            if (!accessToken) throw new Error("Could not retrieve access token.");
            log('Access token retrieved.');

            const conversationResponse = await fetch(`/backend-api/conversation/${conversationId}`, {
                headers: { Authorization: "Bearer " + accessToken }
            });
            if (!conversationResponse.ok) throw new Error(`Failed to fetch conversation data (status: ${conversationResponse.status}).`);
            const data = await conversationResponse.json();
            log('Conversation data retrieved.');

            const queries = new Set();
            const resultsUsed = [];
            const userMessages = new Set();
            const usedUrlsSet = new Set();
            const unusedUrlsSet = new Set();
            let resultsUnused = [];

            const convertDate = (v) => v && /^\d{10}$/.test(v) ? new Date(parseInt(v) * 1000).toISOString().split("T")[0] : v;
            const normalizeUrl = (url) => url ? url.split("?")[0].replace(/\/$/, "") : "";

            const extractData = (obj) => {
                if (!obj || typeof obj !== "object") return;
                if (Array.isArray(obj)) {
                    obj.forEach(item => extractData(item));
                    return;
                }
                
                // Extract search queries from various possible locations
                const searchQueries = obj.search_queries || obj.metadata?.search_queries || obj.search_query;
                if (Array.isArray(searchQueries)) {
                    searchQueries.forEach(sq => {
                        if (sq.q) {
                            // Attempt to split concatenated queries
                            const parts = sq.q.split(/\s*and\s*|\s*what is\s*/i); // Split by " and " or " what is " (case-insensitive)
                            parts.forEach(part => {
                                const trimmedPart = part.trim();
                                if (trimmedPart) {
                                    queries.add(trimmedPart);
                                }
                            });
                        }
                    });
                }

                // Extract text from content parts (recursively if JSON)
                if (obj.content?.text) {
                    try {
                        const parsed = JSON.parse(obj.content.text);
                        extractData(parsed);
                    } catch (e) { /* Not JSON, ignore */ }
                }

                // Extract all potential search results
                if (Array.isArray(obj.search_result_groups)) {
                    obj.search_result_groups.forEach(group => {
                        if (Array.isArray(group.entries)) {
                            group.entries.forEach(entry => {
                                const normalized = normalizeUrl(entry.url);
                                if (normalized && !unusedUrlsSet.has(normalized)) {
                                    unusedUrlsSet.add(normalized);
                                    resultsUnused.push({
                                        title: entry.title || entry.url,
                                        url: entry.url,
                                        pub_date: convertDate(String(entry.pub_date).split(".")[0]),
                                        snippet: entry.snippet || ""
                                    });
                                }
                            });
                        }
                    });
                }

                // Recurse through object properties
                Object.values(obj).forEach(value => extractData(value));
            };

            extractData(data);
            log(`Initial extraction found ${queries.size} queries and ${resultsUnused.length} potential results.`);

            // Identify explicitly used URLs from the final message's metadata
            const finalNodeKey = data.current_node;
            const finalNode = data.mapping && data.mapping[finalNodeKey];
            if (finalNode?.message?.metadata?.content_references) {
                finalNode.message.metadata.content_references.forEach(ref => {
                    if (ref.type === "grouped_webpages") {
                        const items = [...(ref.items || []), ...(ref.fallback_items || [])];
                        items.forEach(item => {
                            const normalized = normalizeUrl(item.url);
                            if (normalized && !usedUrlsSet.has(normalized)) {
                                usedUrlsSet.add(normalized);
                                resultsUsed.push({
                                    title: item.title || item.url,
                                    url: item.url,
                                    pub_date: convertDate(String(item.pub_date).split(".")[0]),
                                    snippet: item.snippet || ""
                                });
                            }
                        });
                    }
                });
            }
            log(`Found ${resultsUsed.length} explicitly used results.`);

            // Extract user messages from the entire conversation
            if (data.mapping) {
                Object.values(data.mapping).forEach(node => {
                    if (node.message?.author?.role === "user" && Array.isArray(node.message.content?.parts)) {
                        node.message.content.parts.forEach(p => {
                            if (p && typeof p === 'string' && p.trim()) {
                                userMessages.add(p.trim());
                            }
                        });
                    }
                });
            }
            log(`Found ${userMessages.size} user messages.`);

            // Filter out used URLs from the unused list
            resultsUnused = resultsUnused.filter(r => !usedUrlsSet.has(normalizeUrl(r.url)));
            log(`Final unused results count: ${resultsUnused.length}.`);

            renderResults(contentArea, {
                queries: Array.from(queries),
                resultsUsed,
                resultsUnused,
                userMessages: Array.from(userMessages)
            });
            log('Analysis complete and rendered.');

        } catch (e) {
            log(`Error during analysis: ${e.message}`);
            renderError(contentArea, e.message);
            console.error(e);
        }
    };

    // --- MAIN EXECUTION ---
    try {
        const contentArea = createUI();
        runAnalysis(contentArea);
    } catch (e) {
        console.error('[WebGPT Analyzer] Failed to create UI:', e);
        alert(`WebGPT Analyzer failed to initialize: ${e.message}`);
    }

})();
