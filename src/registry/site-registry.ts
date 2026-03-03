class SiteRegistry {
    private sites: { [key: string]: string };

    constructor() {
        this.sites = this.initializeDefaultSites();
    }

    private initializeDefaultSites(): { [key: string]: string } {
        return {
            luosearch: 'https://luosearch.com',
            luomail: 'https://luomail.com',
            luosocial: 'https://luosocial.com',
            luodocs: 'https://luodocs.com',
            luoagent: 'https://luoagent.com',
            luodev: 'https://luodev.com'
        };
    }

    public catalogSites(): void {
        console.log('Catalog of Luo-compatible sites:');
        for (const site in this.sites) {
            console.log(`${site}: ${this.sites[site]}`);
        }
    }

    public addSite(name: string, url: string): void {
        if (!this.sites[name]) {
            this.sites[name] = url;
        } else {
            console.log(`Site ${name} already exists.`);
        }
    }

    public getSite(name: string): string | undefined {
        return this.sites[name];
    }
}

export default SiteRegistry;