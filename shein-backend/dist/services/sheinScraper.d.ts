import { SheinProductData } from '../types';
declare class SheinScraperService {
    private baseUrl;
    private userAgent;
    searchProductByCode(productCode: string): Promise<SheinProductData | null>;
    searchProducts(query: string, limit?: number): Promise<SheinProductData[]>;
    getProductDetails(productUrl: string): Promise<SheinProductData | null>;
    getCategories(): Promise<string[]>;
    getTrendingProducts(limit?: number): Promise<SheinProductData[]>;
    private makeRequest;
    private extractProductInfo;
}
export declare const sheinScraperService: SheinScraperService;
export {};
//# sourceMappingURL=sheinScraper.d.ts.map