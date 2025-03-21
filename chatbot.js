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
        return 'general';sAPI}`,
    }                    'User-Agent': 'factcheckbot/1.0',

    async fetchRealTimeInfo(query) {
        try {
            console.log('Fetching news for:', query); // Debug logetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en`, options);
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.apis.newsAPI}`);it response.json();
            const data = await response.json();
            console.log('API response:', data); // Debug log
th === 0) {
            if (data.status === 'error' || !data.articles || data.articles.length === 0) { fallback data if API fails
                // Use fallback data if API failsonst fallbackTopic = Object.keys(this.fallbackData).find(key => query.toLowerCase().includes(key));
                const fallbackTopic = Object.keys(this.fallbackData).find(key => query.toLowerCase().includes(key));
                if (fallbackTopic) {       return {
                    return {backData[fallbackTopic]],
                        latestNews: [this.fallbackData[fallbackTopic]],imestamp: new Date(),
                        timestamp: new Date(),Topic].source.name]
                        sources: [this.fallbackData[fallbackTopic].source.name]
                    };       }
                }           throw new Error('No news found');
                throw new Error('No news found');            }
            }cessNewsData(data);
            return this.processNewsData(data);
        } catch (error) {    console.error('API Error:', error);
            console.error('API Error:', error); // Debug logw error;
            throw error;
        }
    }
sNewsData(data) {
    processNewsData(data) {   if (!data.articles || data.articles.length === 0) return null;
        if (!data.articles || data.articles.length === 0) return null;        
        
            latestNews: data.articles.slice(0, 3),
            timestamp: new Date(),
            sources: data.articles.map(article => article.source.name)
        };   sources: data.articles.map(article => article.source.name)
    }

    generateResponse(intent, input, realTimeInfo) {
        console.log('Generating response:', { intent, realTimeInfo }); // Debug loginput, realTimeInfo) {
        if (realTimeInfo && realTimeInfo.latestNews && realTimeInfo.latestNews.length > 0) {t, realTimeInfo }); // Debug log
            return this.formatRealTimeResponse(intent, realTimeInfo);Info && realTimeInfo.latestNews && realTimeInfo.latestNews.length > 0) {
        }
        switch(intent) {
            case 'question':   switch(intent) {
                return this.handleQuestion(input);            case 'question':
            case 'factCheck':.handleQuestion(input);
                return this.handleFactCheck(input);
            default:ck(input);
                return "I'm here to help combat misinformation. How can I assist you?";
        }here to help combat misinformation. How can I assist you?";
    }

    handleQuestion(input) {
        const keywords = input.toLowerCase().split(' ');
        for (const keyword of keywords) {   const keywords = input.toLowerCase().split(' ');
            const fact = this.knowledgeBase.getFact(keyword);        for (const keyword of keywords) {
            if (fact.fact) {s.knowledgeBase.getFact(keyword);
                return `${fact.fact} (Source: ${fact.source})`;
            }           return `${fact.fact} (Source: ${fact.source})`;
        }            }
        return this.fetchRealTimeInfo(input);
    }t);

    handleFactCheck(input) {
        return this.knowledgeBase.verifyStatement(input);
    }atement(input);

    formatRealTimeResponse(intent, info) {
        const latest = info.latestNews[0];    formatRealTimeResponse(intent, info) {
        return `Based on recent information (${new Date(latest.publishedAt).toLocaleDateString()}):atestNews[0];
                "${latest.title}"ormation (${new Date(latest.publishedAt).toLocaleDateString()}):
                Source: ${latest.source.name}                "${latest.title}"







window.FactCheckBot = FactCheckBot;// Make it globally available}    }                Read more: ${latest.url}`;                Source: ${latest.source.name}
                Read more: ${latest.url}`;
    }
}

// Make it globally available
window.FactCheckBot = FactCheckBot;
