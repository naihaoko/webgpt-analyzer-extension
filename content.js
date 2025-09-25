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
        // WARNING: This selector is fragile and may break with ChatGPT UI updates
        // Look for main content area using multiple fallback selectors
        const mainContent = document.querySelector('.relative.z-0.flex.h-full.w-full.overflow-hidden') ||
                           document.querySelector('main') ||
                           document.querySelector('[role="main"]') ||
                           document.querySelector('.flex.h-full.w-full') ||
                           document.querySelector('#__next > div > div');
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.transition = '';
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

        // Get stored width or use default
        const storedWidth = localStorage.getItem('webgpt-analyzer-width') || '450';
        const sidebarWidth = Math.max(300, Math.min(800, parseInt(storedWidth))); // Min 300px, max 800px

        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: ${sidebarWidth}px;
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
            min-width: 300px;
            max-width: 800px;
        `;

        // Create drag handle for resizing
        const dragHandle = document.createElement('div');
        dragHandle.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 8px;
            height: 100%;
            cursor: col-resize;
            background: transparent;
            z-index: 20001;
            user-select: none;
        `;

        // Add hover effect for drag handle
        const dragIndicator = document.createElement('div');
        dragIndicator.style.cssText = `
            position: absolute;
            left: 2px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 40px;
            background: #E60012;
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        dragHandle.appendChild(dragIndicator);
        sidebar.appendChild(dragHandle);

        // Drag functionality
        let isDragging = false;
        let startX = 0;
        let startWidth = sidebarWidth;

        dragHandle.addEventListener('mouseenter', () => {
            dragIndicator.style.opacity = '0.6';
        });

        dragHandle.addEventListener('mouseleave', () => {
            if (!isDragging) {
                dragIndicator.style.opacity = '0';
            }
        });

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWidth = parseInt(sidebar.style.width);
            dragIndicator.style.opacity = '1';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = startX - e.clientX; // Reverse direction for right-side panel
            const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));

            sidebar.style.width = `${newWidth}px`;

            // Update main content width
            updateMainContentWidth(newWidth);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragIndicator.style.opacity = '0';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';

                // Save width to localStorage
                const finalWidth = parseInt(sidebar.style.width);
                localStorage.setItem('webgpt-analyzer-width', finalWidth.toString());
            }
        });

        // Function to update main content width
        const updateMainContentWidth = (sidebarWidth) => {
            const mainContent = document.querySelector('.relative.z-0.flex.h-full.w-full.overflow-hidden') ||
                               document.querySelector('main') ||
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.flex.h-full.w-full') ||
                               document.querySelector('#__next > div > div');
            if (mainContent) {
                // On mobile screens, overlay the sidebar instead of resizing
                if (window.innerWidth < 768) {
                    mainContent.style.width = '100%';
                } else {
                    mainContent.style.width = `calc(100% - ${sidebarWidth}px)`;
                }
                mainContent.style.transition = 'width 0.1s ease';
            }
        };

        // Add responsive behavior
        const handleResize = () => {
            const currentWidth = parseInt(sidebar.style.width);
            if (window.innerWidth < 768) {
                // Mobile: Overlay mode
                sidebar.style.position = 'fixed';
                sidebar.style.width = '100%';
                sidebar.style.maxWidth = '400px';
                updateMainContentWidth(0);
            } else {
                // Desktop: Side-by-side mode
                sidebar.style.position = 'fixed';
                sidebar.style.width = `${Math.min(currentWidth, window.innerWidth * 0.6)}px`;
                updateMainContentWidth(parseInt(sidebar.style.width));
            }
        };

        window.addEventListener('resize', handleResize);

        // Initial responsive setup
        handleResize();

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
            // Adjust main content width using the new function
            updateMainContentWidth(sidebarWidth);
        }, 10);

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

        const createCollapsibleWrapper = (titleText, contentElements) => {
            const container = document.createElement('div');
            container.style.marginBottom = '20px';

            const button = document.createElement('button');
            button.textContent = titleText;
            button.style.cssText = `
                width: 100%;
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 14px 18px;
                text-align: left;
                cursor: pointer;
                font-size: 1.2em;
                font-weight: 600;
                margin-bottom: 0px;
                transition: background 0.2s, border 0.2s;
            `;

            const panel = document.createElement('div');
            panel.style.cssText = `
                padding: 12px 18px;
                background-color: #fcfcfc;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 6px 6px;
                display: none;
                font-size: 0.95em;
                line-height: 1.5;
                margin-bottom: 12px;
            `;

            contentElements.forEach(el => panel.appendChild(el));

            button.onclick = () => {
                const isHidden = panel.style.display === 'none';
                panel.style.display = isHidden ? 'block' : 'none';
                button.style.borderRadius = isHidden ? '6px 6px 0 0' : '6px';
            };
            button.onmouseover = () => { button.style.backgroundColor = '#e5e5e5'; button.style.borderColor = '#E60012'; };
            button.onmouseout = () => { button.style.backgroundColor = '#f0f0f0'; button.style.borderColor = '#ccc'; };

            container.appendChild(button);
            container.appendChild(panel);
            return container;
        };

        // User Messages (collapsible)
        if (analysis.userMessages.length > 0) {
            const userMessagesContent = [];
            analysis.userMessages.forEach(msg => {
                const p = document.createElement('p');
                p.textContent = msg;
                p.style.cssText = 'margin: 4px 0; font-size: 0.95em;';
                userMessagesContent.push(p);
            });
            const userMessagesWrapper = createCollapsibleWrapper(`${analysis.userMessages.length} User Messages`, userMessagesContent);
            contentArea.appendChild(userMessagesWrapper);
        }

        // Reasoning (collapsible)
        if (analysis.reasoningData && analysis.reasoningData.length > 0) {
            const reasoningContent = [];
            analysis.reasoningData.forEach(data => {
                const summaryDiv = document.createElement('div');
                summaryDiv.style.cssText = 'margin-bottom: 12px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 3px solid #E60012;';

                const summaryTitle = document.createElement('h4');
                summaryTitle.textContent = data.summary;
                summaryTitle.style.cssText = 'margin: 0 0 8px 0; font-weight: 600; color: #E60012; font-size: 1em;';
                summaryDiv.appendChild(summaryTitle);

                const contentP = document.createElement('p');
                contentP.textContent = data.content;
                contentP.style.cssText = 'margin: 0; font-size: 0.9em; line-height: 1.4; color: #555;';
                summaryDiv.appendChild(contentP);

                reasoningContent.push(summaryDiv);
            });
            const reasoningWrapper = createCollapsibleWrapper(`${analysis.reasoningData.length} Reasoning Entries`, reasoningContent);
            contentArea.appendChild(reasoningWrapper);
        }

        // Web Search Main Section (consolidated)
        const webSearchSection = createSection('Web Search');
        const webSearchSectionContent = [];

        if (analysis.allQueries && analysis.allQueries.length > 0) {
            const allQueriesContent = [];
            analysis.allQueries.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q;
                li.style.cssText = 'margin-bottom: 6px; font-size: 0.95em;';
                allQueriesContent.push(li);
            });
            webSearchSectionContent.push(createCollapsibleWrapper('Search Queries', allQueriesContent));
        }

        const usedResultsContent = [];
        if (analysis.resultsUsed.length > 0) {
            analysis.resultsUsed.forEach(item => usedResultsContent.push(createAccordion(item)));
        }
        if (usedResultsContent.length > 0) {
            webSearchSectionContent.push(createCollapsibleWrapper(`${analysis.resultsUsed.length} Used Search Results`, usedResultsContent));
        }

        const unusedResultsContent = [];
        if (analysis.resultsUnused.length > 0) {
            analysis.resultsUnused.forEach(item => unusedResultsContent.push(createAccordion(item)));
        }
        if (unusedResultsContent.length > 0) {
            webSearchSectionContent.push(createCollapsibleWrapper(`${analysis.resultsUnused.length} Unused Search Results`, unusedResultsContent));
        }

        if (webSearchSectionContent.length > 0) {
            webSearchSectionContent.forEach(el => webSearchSection.appendChild(el));
            contentArea.appendChild(webSearchSection);
        }

        // Product Results Section (separate from search queries)
        if (analysis.productResults && analysis.productResults.length > 0) {
            const productSection = createSection('Product Results');
            const productResultsContent = [];

            analysis.productResults.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.style.cssText = 'margin-bottom: 12px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border-left: 3px solid #E60012;';

                const productTitle = document.createElement('h4');
                productTitle.textContent = product.title;
                productTitle.style.cssText = 'margin: 0 0 8px 0; font-weight: 600; color: #E60012; font-size: 1em;';
                productDiv.appendChild(productTitle);

                if (product.price) {
                    const productPrice = document.createElement('p');
                    productPrice.innerHTML = `<strong>Price:</strong> ${product.price}`;
                    productPrice.style.cssText = 'margin: 0 0 4px 0; font-size: 0.9em; color: #555;';
                    productDiv.appendChild(productPrice);
                }

                if (product.rating !== 'N/A') {
                    const productRating = document.createElement('p');
                    productRating.innerHTML = `<strong>Rating:</strong> ${product.rating}/5 (${product.num_reviews} reviews)`;
                    productRating.style.cssText = 'margin: 0 0 4px 0; font-size: 0.9em; color: #555;';
                    productDiv.appendChild(productRating);
                }

                if (product.merchants) {
                    const productMerchants = document.createElement('p');
                    productMerchants.innerHTML = `<strong>Merchants:</strong> ${product.merchants}`;
                    productMerchants.style.cssText = 'margin: 0 0 4px 0; font-size: 0.9em; color: #555;';
                    productDiv.appendChild(productMerchants);
                }

                productResultsContent.push(productDiv);
            });

            const productWrapper = createCollapsibleWrapper(`${analysis.productResults.length} Product Results`, productResultsContent);
            productSection.appendChild(productWrapper);
            contentArea.appendChild(productSection);
        }
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
            const allQueries = new Set(); // Consolidated queries from all sources
            const resultsUsed = [];
            const productResults = [];
            const userMessages = new Set();
            const usedUrlsSet = new Set();
            const unusedUrlsSet = new Set();
            const usedProductIdsSet = new Set(); // Track product IDs separately
            const productResultsIdsSet = new Set(); // Track product IDs for Product Results section
            let resultsUnused = [];
            const reasoningData = [];

            const convertDate = (v) => v && /^\d{10}$/.test(v) ? new Date(parseInt(v) * 1000).toISOString().split("T")[0] : v;
            const normalizeUrl = (url) => url ? url.split("?")[0].replace(/\/$/, "") : "";

            // Single-pass extraction through all nodes for efficiency
            let finalAssistantNode = null;

            if (data.mapping) {
                Object.values(data.mapping).forEach(node => {
                    if (!node.message) return;

                    const role = node.message.author?.role;
                    const contentType = node.message.content?.content_type;
                    const authorName = node.message.author?.name;

                    // Extract user messages
                    if (role === 'user' && contentType === 'text' && Array.isArray(node.message.content?.parts)) {
                        const userPrompt = node.message.content.parts[0];
                        if (userPrompt && typeof userPrompt === 'string' && userPrompt.trim()) {
                            userMessages.add(userPrompt.trim());
                        }
                    }

                    // Extract search queries and results from tool messages
                    else if (role === 'tool' && authorName === 'web.run') {
                        // Extract all search queries
                        if (node.message.metadata?.search_model_queries?.queries &&
                            Array.isArray(node.message.metadata.search_model_queries.queries)) {
                            node.message.metadata.search_model_queries.queries.forEach(searchQuery => {
                                if (searchQuery && typeof searchQuery === 'string') {
                                    const trimmedQuery = searchQuery.trim();
                                    if (trimmedQuery) {
                                        queries.add(trimmedQuery);
                                        allQueries.add(trimmedQuery);
                                    }
                                }
                            });
                        }

                        // Extract all search results
                        if (node.message.metadata?.search_result_groups &&
                            Array.isArray(node.message.metadata.search_result_groups)) {
                            node.message.metadata.search_result_groups.forEach(group => {
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
                    }

                    // Extract reasoning data from turn_summary (new format)
                    if (node.message?.metadata?.turn_summary) {
                        const turnSummary = node.message.metadata.turn_summary;
                        if (turnSummary && typeof turnSummary === 'string' && turnSummary.trim()) {
                            // Create a more descriptive turn identifier
                            const turnNumber = reasoningData.length + 1;
                            const timestamp = node.message?.create_time ?
                                new Date(node.message.create_time * 1000).toLocaleTimeString() : '';
                            const displayTitle = timestamp ?
                                `Turn ${turnNumber} Summary (${timestamp})` :
                                `Turn ${turnNumber} Summary`;

                            reasoningData.push({
                                summary: displayTitle,
                                content: turnSummary.trim(),
                                timestamp: node.message?.create_time || 0
                            });
                        }
                    }

                    // Legacy: Extract reasoning data from thoughts (older format)
                    else if (contentType === 'thoughts' && Array.isArray(node.message.content.thoughts)) {
                        node.message.content.thoughts.forEach(thought => {
                            if (thought.summary && thought.content) {
                                reasoningData.push({
                                    summary: thought.summary,
                                    content: thought.content
                                });
                            }
                        });
                    }

                    // Track final assistant message for used results extraction
                    if (role === 'assistant' && node.message.end_turn === true) {
                        finalAssistantNode = node;
                    }

                    // Extract used results and products from ALL assistant messages (multi-turn support)
                    if (role === 'assistant' && node.message?.metadata?.content_references &&
                        Array.isArray(node.message.metadata.content_references)) {
                        node.message.metadata.content_references.forEach(ref => {
                            // Extract used web pages from any assistant message
                            if (ref.type === "grouped_webpages") {
                                const items = ref.items || [];
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
                            // Extract products for both Used Search Results and Product Results sections
                            else if (ref.type === "products" && Array.isArray(ref.products)) {
                                ref.products.forEach(product => {
                                    const productId = product.id;
                                    const productUrl = product.url || product.product_lookup_data?.url || '';

                                    // Add to Product Results section (with separate deduplication)
                                    if (productId && !productResultsIdsSet.has(productId)) {
                                        productResultsIdsSet.add(productId);
                                        productResults.push({
                                            title: product.title || 'Unknown Product',
                                            url: productUrl,
                                            price: product.price || 'Price not available',
                                            rating: product.rating || 'N/A',
                                            num_reviews: product.num_reviews || 'N/A',
                                            merchants: product.merchants || 'See merchants',
                                            featured_tag: product.featured_tag || '',
                                        });
                                    }

                                    // Add to Used Search Results with [Product] prefix (separate deduplication)
                                    if (productId && !usedProductIdsSet.has(productId)) {
                                        usedProductIdsSet.add(productId);
                                        const price = product.price || 'N/A';
                                        const rating = product.rating || 'N/A';
                                        const numReviews = product.num_reviews || 'N/A';
                                        const merchants = product.merchants || 'N/A';
                                        const snippet = `Price: ${price} | Rating: ${rating}/5 (${numReviews} reviews) | Merchants: ${merchants}`;

                                        resultsUsed.push({
                                            title: `[Product] ${product.title || 'Unknown Product'}`,
                                            url: productUrl,
                                            pub_date: 'Product Result',
                                            snippet: snippet
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

                // Extract used results from final assistant message
                if (finalAssistantNode?.message?.metadata?.content_references) {
                    finalAssistantNode.message.metadata.content_references.forEach(ref => {
                        if (ref.type === "grouped_webpages") {
                            const items = ref.items || [];
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
                        // Process product references as used results
                        else if (ref.type === "products" && Array.isArray(ref.products)) {
                            ref.products.forEach(product => {
                                const productId = product.id;
                                const productUrl = product.url || product.product_lookup_data?.url || '#';

                                // Create descriptive snippet from product details
                                const price = product.price || 'N/A';
                                const rating = product.rating || 'N/A';
                                const numReviews = product.num_reviews || 'N/A';
                                const merchants = product.merchants || 'N/A';
                                const snippet = `Price: ${price} | Rating: ${rating}/5 (${numReviews} reviews) | Merchants: ${merchants}`;

                                if (productId && !usedProductIdsSet.has(productId)) {
                                    usedProductIdsSet.add(productId);
                                    resultsUsed.push({
                                        title: `[Product] ${product.title || 'Unknown Product'}`,
                                        url: productUrl,
                                        pub_date: 'Product Result',
                                        snippet: snippet
                                    });
                                }
                            });
                        }
                    });
                }
            }

            log(`Extracted ${queries.size} search queries, ${resultsUnused.length} total results, ${userMessages.size} user messages`);
            log(`Found ${resultsUsed.length} used results, ${productResults.length} product results, ${reasoningData.length} reasoning entries`);

            // Filter out used URLs from the unused list
            resultsUnused = resultsUnused.filter(r => !usedUrlsSet.has(normalizeUrl(r.url)));
            log(`Final unused results count: ${resultsUnused.length}.`);

            // Filter out product results that have a 'featured_tag'
            const filteredProductResults = productResults.filter(p => !p.featured_tag);
            log(`Filtered out ${productResults.length - filteredProductResults.length} product results with tags.`);

            // Sort reasoning data chronologically by timestamp
            reasoningData.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            renderResults(contentArea, {
                queries: Array.from(queries),
                allQueries: Array.from(allQueries),
                resultsUsed,
                resultsUnused,
                userMessages: Array.from(userMessages),
                reasoningData: reasoningData,
                productResults: filteredProductResults // Pass the filtered results
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
