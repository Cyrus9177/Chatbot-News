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
        this.newsPortals = {
            philippines: {
                keywords: ['philippines', 'filipino', 'duterte', 'marcos', 'manila'],
                sources: [
                    { name: 'Philippine Daily Inquirer', url: 'https://www.inquirer.net/philippines' },
                    { name: 'Rappler', url: 'https://www.rappler.com/nation' },
                    { name: 'ABS-CBN News', url: 'https://news.abs-cbn.com/news' }
                ]
            },
            technology: {
                keywords: ['tech', 'technology', 'digital', 'ai', 'software'],
                sources: [
                    { name: 'TechCrunch', url: 'https://techcrunch.com' },
                    { name: 'The Verge', url: 'https://www.theverge.com' },
                    { name: 'Wired', url: 'https://www.wired.com' }
                ]
            },
            // Add more categories as needed
        };
        this.newsCategories = {
            philippines: {
                keywords: ['philippines', 'filipino', 'duterte', 'marcos', 'manila'],
                sources: [
                    { 
                        name: 'Inquirer.net', 
                        url: 'https://www.inquirer.net/search?q=',
                        credibility: 'Major news outlet'
                    },
                    { name: 'Rappler', url: 'https://www.rappler.com/search?q=', credibility: 'Independent journalism' },
                    { name: 'ABS-CBN News', url: 'https://news.abs-cbn.com/special-pages/search?q=', credibility: 'Leading broadcaster' }
                ]
            },
            technology: {
                keywords: ['tech', 'technology', 'digital', 'ai', 'software'],
                sources: [
                    { name: 'TechCrunch', url: 'https://techcrunch.com/search?q=', credibility: 'Tech industry leader' },
                    { name: 'The Verge', url: 'https://www.theverge.com/search?q=', credibility: 'Tech news authority' }
                ]
            },
            politics: {
                keywords: ['politics', 'government', 'election', 'policy'],
                sources: [
                    { name: 'Reuters Politics', url: 'https://www.reuters.com/site-search/?query=', credibility: 'Global news agency' },
                    { name: 'AP News Politics', url: 'https://apnews.com/search?q=', credibility: 'Trusted wire service' }
                ]
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
            console.error('Error processing input:', error);
            return "I'm having trouble accessing real-time information. Please try again.";
        }
    }

    async analyzeIntent(input) {
        const normalizedInput = input.toLowerCase();
        if (normalizedInput.includes('?')) return 'question';
        if (normalizedInput.includes('fact')) return 'factCheck';
        return 'general';
    }

    async fetchRealTimeInfo(query) {
        try {
            const userQuery = query.toLowerCase();
            let response = null;

            // First try topic-specific search
            for (const [topic, data] of Object.entries(this.newsCategories)) {
                if (data.keywords.some(keyword => userQuery.includes(keyword))) {
                    const topicSources = data.sources.map(source => ({
                        name: source.name,
                        url: `${source.url}${encodeURIComponent(query)}`,
                        credibility: source.credibility
                    }));

                    return {
                        topic,
                        query,
                        sources: topicSources,
                        searchUrl: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
                        timestamp: new Date()
                    };
                }
            }

            // Default to general news search
            return {
                topic: 'general',
                query,
                sources: [
                    {
                        name: 'Google News',
                        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
                        credibility: 'News aggregator'
                    },
                    {
                        name: 'Reuters Search',
                        url: `https://www.reuters.com/search/news?blob=${encodeURIComponent(query)}`,
                        credibility: 'International news agency'
                    }
                ],
                searchUrl: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    parseNewsData(rssData) {
        // Basic RSS parser - you might want to use a proper RSS parser library
        const parser = new DOMParser();
        const doc = parser.parseFromString(rssData, 'text/xml');
        const items = doc.querySelectorAll('item');
        
        return Array.from(items).map(item => ({
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || ''
        }));
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
        const sourceLinks = info.sources.map(source => 
            `• <a href="${source.url}" target="_blank" class="source-link" title="${source.credibility}">${source.name}</a>`
        ).join('<br>');

        let response = `📰 Results for "${info.query}":<br><br>${sourceLinks}<br><br>`;
        
        if (info.searchUrl) {
            response += `🔍 More results: <a href="${info.searchUrl}" target="_blank" class="more-results">View all news</a><br><br>`;
        }

        response += `💡 Tips:<br>• Check multiple sources<br>• Look for recent updates<br>• Verify claims with official sources`;
        
        return response;
    }
}

// Make it globally available
window.FactCheckBot = FactCheckBot;
