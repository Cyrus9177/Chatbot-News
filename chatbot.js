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
        this.categories = {
            philippines: {
                keywords: ['philippines', 'filipino', 'duterte', 'marcos', 'manila', 'ph'],
                title: "Philippine News & Information",
                suggestions: [
                    "🔗 Inquirer.net - Latest Philippine news",
                    "🔗 Philstar.com - Latest headlines",
                    "🔗 Official Gazette - Government updates",
                    "🔗 ABS-CBN News - Breaking news"
                ],
                urls: {
                    news: "https://www.inquirer.net",
                    government: "https://www.gov.ph",
                    factCheck: "https://www.rappler.com/newsbreak/fact-check"
                }
            },
            news: {
                keywords: ['news', 'current', 'latest', 'update', 'today', 'breaking'],
                title: "Current News & Updates",
                suggestions: [
                    "🌐 Reuters - International coverage",
                    "🌐 AP News - Global updates",
                    "🌐 BBC News - World news",
                    "📰 Local news sources for regional context"
                ],
                urls: {
                    international: "https://www.reuters.com",
                    regional: "https://news.google.com"
                }
            },
            // Add more categories as needed
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
            
            // Check categories
            for (const [categoryName, category] of Object.entries(this.categories)) {
                if (category.keywords.some(keyword => userQuery.includes(keyword))) {
                    return {
                        latestNews: [{
                            title: category.title,
                            source: { name: "Verified Sources" },
                            urls: category.urls,
                            publishedAt: new Date().toISOString()
                        }],
                        timestamp: new Date(),
                        suggestions: category.suggestions,
                        category: categoryName
                    };
                }
            }

            // Default to smart search response
            return {
                latestNews: [{
                    title: `Search Results for "${query}"`,
                    source: { name: "Multiple Sources" },
                    urls: {
                        search: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
                        factCheck: `https://www.google.com/search?q=${encodeURIComponent(query)}+fact+check`
                    }
                }],
                suggestions: [
                    "✓ Always verify information from multiple sources",
                    "✓ Check recent news coverage",
                    "✓ Look for official statements",
                    "✓ Consider fact-checking websites"
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
        const latest = info.latestNews[0];
        
        if (info.category) {
            const urls = latest.urls;
            return `📰 ${latest.title}\n\nReliable sources:\n${info.suggestions.join('\n')}\n\n` +
                   `🔍 Quick links:\n` +
                   Object.entries(urls).map(([type, url]) => `• ${type}: ${url}`).join('\n');
        }

        return `🔍 ${latest.title}\n\nRecommendations:\n${info.suggestions.join('\n')}\n\n` +
               `Useful links:\n• News: ${latest.urls.search}\n• Fact Check: ${latest.urls.factCheck}`;
    }
}

// Make it globally available
window.FactCheckBot = FactCheckBot;
