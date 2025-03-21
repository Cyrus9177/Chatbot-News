class KnowledgeBase {
    constructor() {
        this.facts = new Map();
        this.sources = new Map();
        this.factCheckApiKey = config.factCheckAPI;
    }

    addFact(topic, fact, source) {
        this.facts.set(topic, fact);
        this.sources.set(topic, source);
    }

    getFact(topic) {
        return {
            fact: this.facts.get(topic),
            source: this.sources.get(topic)
        };
    }

    async verifyStatement(statement) {
        try {
            // Google Fact Check API integration
            const response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${this.factCheckApiKey}&query=${encodeURIComponent(statement)}`);
            const data = await response.json();
            
            if (data.claims && data.claims.length > 0) {
                const claim = data.claims[0];
                return {
                    isVerified: true,
                    confidence: this.calculateConfidence(claim),
                    correctInformation: claim.claimReview[0].textualRating,
                    source: claim.claimReview[0].publisher.name,
                    url: claim.claimReview[0].url
                };
            }
        } catch (error) {
            console.error('Fact-checking API error:', error);
        }
        
        return this.fallbackVerification(statement);
    }

    calculateConfidence(claim) {
        return claim.claimReview[0].textualRating.toLowerCase().includes('true') ? 0.9 : 0.3;
    }

    fallbackVerification(statement) {
        // Basic keyword matching when API fails
        const keywords = statement.toLowerCase().split(' ');
        for (const keyword of keywords) {
            const fact = this.getFact(keyword);
            if (fact.fact) {
                return {
                    isVerified: true,
                    confidence: 0.7,
                    correctInformation: fact.fact,
                    source: fact.source
                };
            }
        }
        return {
            isVerified: false,
            confidence: 0,
            correctInformation: "I couldn't verify this statement. Please check reliable sources.",
            source: null
        };
    }
}

// Make it globally available
window.KnowledgeBase = KnowledgeBase;
