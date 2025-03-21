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
            // First, check for specific topics
            const topics = ['covid', 'climate', 'health', 'science', 'technology'];
            const userQuery = query.toLowerCase();
            
            for (const topic of topics) {
                if (userQuery.includes(topic)) {
                    return {
                        latestNews: [this.fallbackData[topic]],
                        timestamp: new Date(),
                        sources: [this.fallbackData[topic].source.name],
                        topic: topic
                    };
                }
            }

            // If no specific topic found, provide a more helpful general response
            const generalResponse = {
                title: `Information about "${query}"`,
                source: { name: "Multiple Sources" },
                url: "https://www.reuters.com/fact-check",
                publishedAt: new Date().toISOString(),
                description: "To get accurate information about this topic, try:"
            };

            return {
                latestNews: [generalResponse],
                timestamp: new Date(),
                sources: ["Multiple Sources"],
                suggestions: [
                    "WHO.int for health information",
                    "NASA.gov for space and climate",
                    "CDC.gov for disease control",
                    "Reuters Fact Check for general verification"
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
        
        if (info.suggestions) {
            return `Here are reliable sources for "${info.latestNews[0].title}":
                    \n${info.suggestions.join('\n')}
                    \nFor fact-checking, visit: ${latest.url}`;
        }

        return `Based on reliable information about ${info.topic || 'this topic'}:
                \n"${latest.title}"
                \nSource: ${latest.source.name}
                \nRead more: ${latest.url}`;
    }
}

// Make it globally available
window.FactCheckBot = FactCheckBot;
