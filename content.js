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

        // Reasoning
        if (analysis.reasoningData && analysis.reasoningData.length > 0) {
            const section = createSection('Reasoning');
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
                
                section.appendChild(summaryDiv);
            });
            contentArea.appendChild(section);
        }

        // General Search Main Section
        const generalSearchSection = createSection('General Search');
        const generalSearchSectionContent = [];

        if (analysis.generalQueries && analysis.generalQueries.length > 0) {
            const generalQueriesContent = [];
            analysis.generalQueries.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q;
                li.style.cssText = 'margin-bottom: 6px; font-size: 0.95em;';
                generalQueriesContent.push(li);
            });
            generalSearchSectionContent.push(createCollapsibleWrapper('General Search Queries', generalQueriesContent));
        }

        const usedResultsContent = [];
        if (analysis.resultsUsed.length > 0) {
            analysis.resultsUsed.forEach(item => usedResultsContent.push(createAccordion(item)));
        }
        if (usedResultsContent.length > 0) {
            generalSearchSectionContent.push(createCollapsibleWrapper(`${analysis.resultsUsed.length} Used Search Results`, usedResultsContent));
        }

        const unusedResultsContent = [];
        if (analysis.resultsUnused.length > 0) {
            analysis.resultsUnused.forEach(item => unusedResultsContent.push(createAccordion(item)));
        }
        if (unusedResultsContent.length > 0) {
            generalSearchSectionContent.push(createCollapsibleWrapper(`${analysis.resultsUnused.length} Unused Search Results`, unusedResultsContent));
        }

        if (generalSearchSectionContent.length > 0) {
            generalSearchSectionContent.forEach(el => generalSearchSection.appendChild(el));
            contentArea.appendChild(generalSearchSection);
        }

        // Product Search Main Section
        const productSearchSection = createSection('Product Search');
        const productSearchSectionContent = [];

        if (analysis.productQueries && analysis.productQueries.length > 0) {
            const productQueriesContent = [];
            analysis.productQueries.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q;
                li.style.cssText = 'margin-bottom: 6px; font-size: 0.95em;';
                productQueriesContent.push(li);
            });
            productSearchSectionContent.push(createCollapsibleWrapper('Product Search Queries', productQueriesContent));
        }

        if (analysis.productResults && analysis.productResults.length > 0) {
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
            productSearchSectionContent.push(createCollapsibleWrapper(`${analysis.productResults.length} Product Search Results`, productResultsContent));
        }

        if (productSearchSectionContent.length > 0) {
            productSearchSectionContent.forEach(el => productSearchSection.appendChild(el));
            contentArea.appendChild(productSearchSection);
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
            const generalQueries = new Set();
            const productQueries = new Set();
            const resultsUsed = [];
            const productResults = []; 
            const userMessages = new Set();
            const usedUrlsSet = new Set();
            const unusedUrlsSet = new Set();
            let resultsUnused = [];
            const reasoningData = [];

            const convertDate = (v) => v && /^\d{10}$/.test(v) ? new Date(parseInt(v) * 1000).toISOString().split("T")[0] : v;
            const normalizeUrl = (url) => url ? url.split("?")[0].replace(/\/$/, "") : "";

            const extractData = (obj) => {
                if (!obj || typeof obj !== "object") return;
                if (Array.isArray(obj)) {
                    obj.forEach(item => extractData(item));
                    return;
                }
                
                // Extract thoughts data (summary and content)
                if (obj.content_type === "thoughts" && Array.isArray(obj.thoughts)) {
                    obj.thoughts.forEach(thought => {
                        if (thought.summary && thought.content) {
                            reasoningData.push({
                                summary: thought.summary,
                                content: thought.content
                            });
                        }
                    });
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
                                    generalQueries.add(trimmedPart);
                                }
                            });
                        }
                    });
                }

                // Extract product queries from content
                if (obj.content?.text) {
                    try {
                        const parsed = JSON.parse(obj.content.text);
                        // Check for product_query in the parsed content
                        if (parsed.product_query && Array.isArray(parsed.product_query.search)) {
                            parsed.product_query.search.forEach(product => {
                                if (product && typeof product === 'string') {
                                    const trimmedProduct = product.trim();
                                    if (trimmedProduct) {
                                        queries.add(trimmedProduct);
                                        productQueries.add(trimmedProduct);
                                    }
                                }
                            });
                        }
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
                
                // Extract product search results from content_references
                if (Array.isArray(obj.content_references)) {
                    obj.content_references.forEach(ref => {
                        if (ref.type === "products" && Array.isArray(ref.products)) {
                            ref.products.forEach(product => {
                                productResults.push({
                                    title: product.title,
                                    url: product.url || product.product_lookup_data?.url || '',
                                    price: product.price || '',
                                    rating: product.rating || 'N/A',
                                    num_reviews: product.num_reviews || 'N/A',
                                    merchants: product.merchants || '',
                                    featured_tag: product.featured_tag || '',
                                });
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
                    
                    // Also extract product references from assistant messages (tool responses)
                    if (node.message?.author?.role === "tool" && node.message?.content?.content_type === "text" && Array.isArray(node.message.content?.parts)) {
                        node.message.content.parts.forEach(part => {
                            try {
                                // Regex to find the product name and URL in the format "Product Name (URL)"
                                const productPattern = /(.*?)\s*\((https?:\/\/[^\s]+)\)/g;
                                let match;
                                while ((match = productPattern.exec(part)) !== null) {
                                    const productName = match[1].trim();
                                    const productUrl = match[2].trim();
                                    if (productName && productUrl) {
                                        // Check if this product is already captured from content_references to avoid duplication
                                        const existingProduct = productResults.find(p => p.title === productName);
                                        if (existingProduct) {
                                            // If product exists, update its URL if it was missing
                                            if (!existingProduct.url) {
                                                existingProduct.url = productUrl;
                                            }
                                        } else {
                                            // Add new product with URL
                                            productResults.push({ title: productName, url: productUrl, price: '', rating: 'N/A', num_reviews: 'N/A', merchants: '', featured_tag: '' });
                                        }
                                    }
                                }

                                // Extract Rating, Reviews, Price, and Merchants from text
                                const ratingMatch = part.match(/\*Rating:\*\s*(\d+\.?\d*)\/5\s*\((\d+)\s*reviews\)/);
                                if (ratingMatch) {
                                    const rating = parseFloat(ratingMatch[1]);
                                    const numReviews = parseInt(ratingMatch[2]);
                                    // Find the most recently added product and update its rating/reviews
                                    if (productResults.length > 0) {
                                        const lastProduct = productResults[productResults.length - 1];
                                        lastProduct.rating = rating;
                                        lastProduct.num_reviews = numReviews;
                                    }
                                }

                                const merchantsSectionMatch = part.match(/\*Merchants:\*\n([\s\S]*)/);
                                if (merchantsSectionMatch && productResults.length > 0) {
                                    const merchantsText = merchantsSectionMatch[1];
                                    const merchantLines = merchantsText.split('\n').map(line => line.trim()).filter(line => line.startsWith('-'));
                                    const lastProduct = productResults[productResults.length - 1];
                                    
                                    let extractedMerchants = [];
                                    merchantLines.forEach(line => {
                                        const priceMerchantMatch = line.match(/-\s*(.+):\s*(.+)/);
                                        if (priceMerchantMatch) {
                                            const price = priceMerchantMatch[1].trim();
                                            const merchant = priceMerchantMatch[2].trim();
                                            extractedMerchants.push(merchant); // Only push the merchant name
                                            // Also update the main price for the product with the first price found
                                            if (!lastProduct.price) {
                                                lastProduct.price = price;
                                            }
                                        }
                                    });
                                    if (extractedMerchants.length > 0) {
                                        lastProduct.merchants = extractedMerchants.join('; ');
                                    }
                                }

                                // Also handle the specific product JSON structure if it exists
                                const productJsonMatch = part.match(/\u2b80products\u2b82([^\u2b81]+)\u2b81/);
                                if (productJsonMatch && productJsonMatch[1]) {
                                    const productData = JSON.parse(productJsonMatch[1]);
                                    if (Array.isArray(productData.selections)) {
                                        productData.selections.forEach(selection => {
                                            const productName = selection[1];
                                            // Try to find the product in productResults and update its fields
                                            const existingProduct = productResults.find(p => p.title === productName);
                                            if (existingProduct) {
                                                // Check for comprehensive product details in the selection's product object
                                                if (selection[0]) {
                                                    // Need to find the actual product object from the payload using the ID/key from selection[0]
                                                    // For now, let's just ensure the details are consistent with what we extract from text
                                                }
                                            } else {
                                                // This case should ideally not happen if content_references is processed first
                                                // But as a fallback, add it if not found, though without full details here
                                                productResults.push({ title: productName, url: '', price: '', rating: 'N/A', num_reviews: 'N/A', merchants: '', featured_tag: '' });
                                            }
                                        });
                                    }
                                }
                            } catch (e) { /* Not valid, ignore */ }
                        });
                    }
                });
            }
            log(`Found ${userMessages.size} user messages.`);
            log(`Found ${productResults.length} product results.`);

            // Filter out used URLs from the unused list
            resultsUnused = resultsUnused.filter(r => !usedUrlsSet.has(normalizeUrl(r.url)));
            log(`Final unused results count: ${resultsUnused.length}.`);

            // Filter out product results that have a 'featured_tag'
            const filteredProductResults = productResults.filter(p => !p.featured_tag);
            log(`Filtered out ${productResults.length - filteredProductResults.length} product results with tags.`);

            renderResults(contentArea, {
                queries: Array.from(queries),
                generalQueries: Array.from(generalQueries),
                productQueries: Array.from(productQueries),
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
