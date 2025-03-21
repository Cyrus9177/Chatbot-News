class FactCheckBot {
    constructor() {
        this.knowledgeBase = new Map();
        this.confidenceThreshold = 0.7;
        this.apis = config;
        this.fallbackData = {
            covid: {
                title: "Latest COVID-19 Information",
                source: { name: "WHO" },
                url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
                publishedAt: new Date().toISOString()
            },
            climate: {
                title: "Climate Change Facts",
                source: { name: "NASA" },
                url: "https://climate.nasa.gov/evidence/",
                publishedAt: new Date().toISOString()
            },
            general: {
                title: "Please check reliable news sources",
                source: { name: "Reuters" },
                url: "https://www.reuters.com",
                publishedAt: new Date().toISOString()
            },
            technology: {
                title: "Technology News and Updates",
                source: { name: "Tech News" },
                url: "https://www.theverge.com/tech",
                publishedAt: new Date().toISOString()
            },
            health: {
                title: "Health Information",
                source: { name: "CDC" },
                url: "https://www.cdc.gov/",
                publishedAt: new Date().toISOString()
            },
            science: {
                title: "Scientific Information",
                source: { name: "Science.gov" },
                url: "https://www.science.gov/",
                publishedAt: new Date().toISOString()
            }
        };
    }

    initialize() {
        this.knowledgeBase = new KnowledgeBase();
        this.loadKnowledgeBase();
    }

    loadKnowledgeBase() {
        // Add some initial facts
        this.knowledgeBase.addFact('covid', 'COVID-19 vaccines are safe and effective', 'WHO');
        this.knowledgeBase.addFact('climate', 'Climate change is real and human-caused', 'NASA');
    }

    async processInput(userInput) {
        try {
            const intent = await this.analyzeIntent(userInput);
            const realTimeInfo = await this.fetchRealTimeInfo(userInput);
            return this.generateResponse(intent, userInput, realTimeInfo);
        } catch (error) {
            return "I'm having trouble accessing real-time information. Please try again.";
        }
    }

    async analyzeIntent(input) {
        // Simple intent analysis - can be enhanced with NLP libraries
        const normalizedInput = input.toLowerCase();
        if (normalizedInput.includes('?')) return 'question';
        if (normalizedInput.includes('fact')) return 'factCheck';
        return 'general';
    }

    async fetchRealTimeInfo(query) {
        try {
            const userQuery = query.toLowerCase();
            
            // Enhanced categories with specific URLs
            const categories = {
                philippines: {
                    keywords: ['philippines', 'filipino', 'duterte', 'marcos', 'manila'],
                    title: "Philippine News",
                    suggestions: [
                        "Philippine News Agency - Official news",
                        "Rappler - Independent journalism",
                        "Inquirer.net - Latest updates",
                        "ABS-CBN News - Breaking news"
                    ],
                    url: "https://www.pna.gov.ph/latest"
                },
                news: {
                    keywords: ['news', 'current', 'latest', 'update', 'today'],
                    title: "Latest News Updates",
                    suggestions: [
                        "Reuters News - World coverage",
                        "AP News - Breaking news",
                        "BBC News - International news",
                        "Al Jazeera - Global perspective"
                    ],
                    url: "https://www.reuters.com/world"
                },
                politics: {
                    keywords: ['politics', 'government', 'election', 'president'],
                    title: "Political Information",
                    suggestions: [
                        "Official government portals",
                        "Election commission updates",
                        "Political fact-checking sites",
                        "Legislative updates"
                    ],
                    url: "https://www.gov.ph"
                }
            };

            // Find matching category
            for (const [categoryName, category] of Object.entries(categories)) {
                if (category.keywords.some(keyword => userQuery.includes(keyword))) {
                    return {
                        latestNews: [{
                            title: category.title,
                            source: { name: category.title },
                            url: category.url,
                            publishedAt: new Date().toISOString()
                        }],
                        timestamp: new Date(),
                        sources: category.suggestions,
                        category: categoryName,
                        specificSuggestions: category.suggestions,
                        specificUrl: category.url
                    };
                }
            }

            // If no category matches, return topic-specific search
            const searchQuery = encodeURIComponent(query);
            return {
                latestNews: [{
                    title: `Information about "${query}"`,
                    source: { name: "Search Results" },
                    url: `https://www.google.com/search?q=${searchQuery}+fact+check`,
                    publishedAt: new Date().toISOString()
                }],
                timestamp: new Date(),
                sources: ["Multiple Sources"],
                suggestions: [
                    `Search results for "${query}"`,
                    "Fact-checking websites",
                    "Official sources",
                    "News archives"
                ]
            };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    processNewsData(data) {
        if (!data.articles || data.articles.length === 0) return null;
        return {
            latestNews: data.articles.slice(0, 3),
            timestamp: new Date(),
            sources: data.articles.map(article => article.source.name)
        };
    }

    generateResponse(intent, input, realTimeInfo) {
        console.log('Generating response:', { intent, realTimeInfo }); // Debug log
        if (realTimeInfo && realTimeInfo.latestNews && realTimeInfo.latestNews.length > 0) {
            return this.formatRealTimeResponse(intent, realTimeInfo);
        }
        switch(intent) {
            case 'question':
                return this.handleQuestion(input);
            case 'factCheck':
                return this.handleFactCheck(input);
            default:
                return "I'm here to help combat misinformation. How can I assist you?";
        }
    }

    handleQuestion(input) {
        const keywords = input.toLowerCase().split(' ');
        for (const keyword of keywords) {
            const fact = this.knowledgeBase.getFact(keyword);
            if (fact.fact) {
                return `${fact.fact} (Source: ${fact.source})`;
            }
        }
        return this.fetchRealTimeInfo(input);
    }

    handleFactCheck(input) {
        return this.knowledgeBase.verifyStatement(input);
    }

    formatRealTimeResponse(intent, info) {
        if (info.specificSuggestions) {
            return `Here are reliable sources for ${info.latestNews[0].title}:\n\n` +
                   info.specificSuggestions.map(s => `• ${s}`).join('\n') +
                   `\n\nStart here: ${info.specificUrl}`;
        }

        if (info.category) {
            return `Regarding "${info.latestNews[0].title}":\n\n` +
                   info.suggestions.map(s => `• ${s}`).join('\n') +
                   `\n\nRecommended source: ${info.latestNews[0].url}`;
        }

        if (info.suggestions) {
            return `To verify information about "${info.latestNews[0].title.replace('Information about ', '').replace(/"/g, '')}":\n\n` +
                   info.suggestions.map(s => `• ${s}`).join('\n') +
                   `\n\nStart here: ${info.latestNews[0].url}`;
        }

        return `Based on reliable information about ${info.topic}:\n` +
               `"${info.latestNews[0].title}"\n` +
               `Source: ${info.latestNews[0].source.name}\n` +
               `Read more: ${info.latestNews[0].url}`;
    }
}

// Make it globally available
window.FactCheckBot = FactCheckBot;
