// Frontend/src/services/blockchainService.ts

const getBlockchainApiUrl = (): string => {
  // For CRA
  if (typeof window !== 'undefined' && (window as any).__REACT_APP_BLOCKCHAIN_URL) {
    return (window as any).__REACT_APP_BLOCKCHAIN_URL;
  }

  // For Vite
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BLOCKCHAIN_URL) {
    return (import.meta as any).env.VITE_BLOCKCHAIN_URL;
  }

  return 'http://localhost:4001/blockchain'; // fallback
};

const BLOCKCHAIN_API_URL = getBlockchainApiUrl();

export interface BlockchainProduct {
  productId: string;
  productName: string;
  category: string;
  origin: string;
  certifications: string[];
  ipfsHash?: string;
  isAuthentic?: boolean;
  exists?: boolean;
}

export interface BlockchainResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class BlockchainService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BLOCKCHAIN_API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }

    return response.json();
  }

  async registerProduct(product: BlockchainProduct): Promise<BlockchainResponse<BlockchainProduct>> {
    return this.request(`/products/register`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getProduct(productId: string): Promise<BlockchainResponse<BlockchainProduct>> {
    return this.request(`/products/${productId}`);
  }

  async verifyProduct(productId: string): Promise<BlockchainResponse<{ productId: string; isAuthentic: boolean }>> {
    return this.request(`/products/${productId}/verify`);
  }
}

export const blockchainService = new BlockchainService();