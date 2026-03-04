// Luo Search - Our Own Search Engine
class LuoSearch {
    constructor() {
        this.index = [];
        this.results = [];
        
        // Pre-indexed popular sites
        this.popularSites = [
            { name: 'Google', url: 'https://google.com', keywords: 'search engine google gmail', category: 'search' },
            { name: 'YouTube', url: 'https://youtube.com', keywords: 'video streaming youtube music', category: 'video' },
            { name: 'Twitter', url: 'https://twitter.com', keywords: 'social media twitter X tweets', category: 'social' },
            { name: 'GitHub', url: 'https://github.com', keywords: 'code repository git programming', category: 'dev' },
            { name: 'Wikipedia', url: 'https://wikipedia.org', keywords: 'encyclopedia wikipedia knowledge', category: 'reference' },
            { name: 'Reddit', url: 'https://reddit.com', keywords: 'social news reddit discussions', category: 'social' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com', keywords: 'programming code stackoverflow questions', category: 'dev' },
            { name: 'Amazon', url: 'https://amazon.com', keywords: 'shopping amazon ecommerce store', category: 'shopping' },
            { name: 'Netflix', url: 'https://netflix.com', keywords: 'streaming netflix movies tv shows', category: 'entertainment' },
            { name: 'Spotify', url: 'https://spotify.com', keywords: 'music streaming spotify audio', category: 'music' },
            { name: 'Discord', url: 'https://discord.com', keywords: 'chat discord gaming communication', category: 'social' },
            { name: 'Telegram', url: 'https://telegram.org', keywords: 'messaging telegram chat', category: 'social' },
            { name: 'WhatsApp', url: 'https://whatsapp.com', keywords: 'messaging whatsapp chat', category: 'social' },
            { name: 'Instagram', url: 'https://instagram.com', keywords: 'photo instagram social media', category: 'social' },
            { name: 'Facebook', url: 'https://facebook.com', keywords: 'social facebook meta social media', category: 'social' },
            { name: 'LinkedIn', url: 'https://linkedin.com', keywords: 'jobs linkedin professional networking', category: 'social' },
            { name: 'OpenAI', url: 'https://openai.com', keywords: 'ai artificial intelligence chatgpt', category: 'ai' },
            { name: 'Anthropic', url: 'https://anthropic.com', keywords: 'ai claude artificial intelligence', category: 'ai' },
            { name: 'DeepMind', url: 'https://deepmind.google', keywords: 'ai google deepmind artificial intelligence', category: 'ai' },
            { name: 'Hugging Face', url: 'https://huggingface.co', keywords: 'ai ml machine learning models', category: 'ai' },
            { name: 'CoinGecko', url: 'https://coingecko.com', keywords: 'crypto cryptocurrency prices', category: 'crypto' },
            { name: 'CoinMarketCap', url: 'https://coinmarketcap.com', keywords: 'crypto cryptocurrency market cap', category: 'crypto' },
            { name: 'Notcoin', url: 'https://notcoin.com', keywords: 'notcoin crypto telegram', category: 'crypto' },
            { name: 'OpenSea', url: 'https://opensea.io', keywords: 'nft opensea marketplace', category: 'crypto' },
            { name: 'Rarible', url: 'https://rarible.com', keywords: 'nft rarible marketplace', category: 'crypto' },
            { name: 'Medium', url: 'https://medium.com', keywords: 'blog medium articles writing', category: 'blog' },
            { name: 'Dev.to', url: 'https://dev.to', keywords: 'dev blogging programming developers', category: 'dev' },
            { name: 'Hashnode', url: 'https://hashnode.dev', keywords: 'blog developer programming', category: 'dev' },
            { name: 'Vercel', url: 'https://vercel.com', keywords: 'hosting vercel deployment frontend', category: 'dev' },
            { name: 'Netlify', url: 'https://netlify.com', keywords: 'hosting netlify deployment static', category: 'dev' },
        ];
        
        this.init();
    }

    init() {
        // Build index from popular sites
        this.index = this.popularSites.map(site => {
            return {
                ...site,
                score: this.calculateRelevance(site.name + ' ' + site.keywords, '')
            };
        });
    }

    calculateRelevance(text, query) {
        const q = query.toLowerCase();
        const words = q.split(' ').filter(w => w.length > 0);
        let score = 0;
        const lowerText = text.toLowerCase();
        
        words.forEach(word => {
            if (lowerText.includes(word)) score += 10;
            // Fuzzy match
            for (let i = 0; i < lowerText.length - word.length + 1; i++) {
                if (this.levenshtein(lowerText.substr(i, word.length), word) <= 2) {
                    score += 5;
                }
            }
        });
        
        return score;
    }

    levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    search(query) {
        if (!query || query.trim() === '') {
            return this.getDefaultResults();
        }

        const q = query.toLowerCase();
        
        // Score all sites
        const results = this.index.map(site => {
            const score = this.calculateRelevance(site.name + ' ' + site.keywords, q);
            return { ...site, score };
        });

        // Sort by score
        results.sort((a, b) => b.score - a.score);

        // Return top results
        return results.filter(r => r.score > 0).slice(0, 20);
    }

    getDefaultResults() {
        // Return popular/featured sites when no query
        return this.popularSites.slice(0, 12).map(site => ({
            ...site,
            score: 10
        }));
    }

    // Categorized results
    getCategories() {
        const categories = {};
        this.popularSites.forEach(site => {
            if (!categories[site.category]) {
                categories[site.category] = [];
            }
            categories[site.category].push(site);
        });
        return categories;
    }
}

// Global instance
window.luoSearch = new LuoSearch();
