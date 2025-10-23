'use client';

// Farcaster username resolution service using Neynar API
export interface FarcasterUser {
  username: string;
  displayName: string;
  fid: number;
  avatar?: string;
}

export interface FarcasterCache {
  [address: string]: {
    user: FarcasterUser | null;
    timestamp: number;
  };
}

// Cache usernames for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_KEY = 'farcaster_username_cache';

// Load cache from localStorage
function loadCache(): FarcasterCache {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    
    const cache = JSON.parse(stored) as FarcasterCache;
    
    // Clean expired entries
    const now = Date.now();
    const cleanCache: FarcasterCache = {};
    
    for (const [address, entry] of Object.entries(cache)) {
      if (now - entry.timestamp < CACHE_DURATION) {
        cleanCache[address] = entry;
      }
    }
    
    return cleanCache;
  } catch {
    return {};
  }
}

// Save cache to localStorage
function saveCache(cache: FarcasterCache): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save Farcaster cache:', error);
  }
}

// Get cached user data
function getCachedUser(address: string): FarcasterUser | null | undefined {
  const cache = loadCache();
  const entry = cache[address.toLowerCase()];
  
  if (!entry) return undefined; // Not in cache
  
  const now = Date.now();
  if (now - entry.timestamp >= CACHE_DURATION) {
    return undefined; // Cache expired
  }
  
  return entry.user; // null if no user found, FarcasterUser if found
}

// Cache user data
function cacheUser(address: string, user: FarcasterUser | null): void {
  const cache = loadCache();
  cache[address.toLowerCase()] = {
    user,
    timestamp: Date.now()
  };
  saveCache(cache);
}

// Fetch user from Neynar API
async function fetchUserFromAPI(address: string): Promise<FarcasterUser | null> {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: 'api.neynar.com',
        path: `/v2/farcaster/user/by-address?address=${address}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': 'NEYNAR_ONCHAIN_KIT' // Using OnchainKit's default key
        }
      })
    });
    
    if (!response.ok) {
      // If 404, user doesn't exist
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.username) {
      return {
        username: data.username,
        displayName: data.display_name || data.username,
        fid: data.fid,
        avatar: data.pfp_url
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch Farcaster user:', error);
    return null;
  }
}

// Main function to resolve address to Farcaster username
export async function getFarcasterUsername(address: string): Promise<string> {
  if (!address) return 'Unknown';
  
  // Check cache first
  const cached = getCachedUser(address);
  if (cached !== undefined) {
    return cached ? `@${cached.username}` : formatAddress(address);
  }
  
  // Fetch from API
  try {
    const user = await fetchUserFromAPI(address);
    
    // Cache the result (even if null)
    cacheUser(address, user);
    
    if (user) {
      return `@${user.username}`;
    }
  } catch (error) {
    console.error('Error fetching Farcaster username:', error);
  }
  
  // Fallback to formatted address
  return formatAddress(address);
}

// Get full user info (for potential future features)
export async function getFarcasterUser(address: string): Promise<FarcasterUser | null> {
  if (!address) return null;
  
  // Check cache first
  const cached = getCachedUser(address);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch from API
  try {
    const user = await fetchUserFromAPI(address);
    
    // Cache the result (even if null)
    cacheUser(address, user);
    
    return user;
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
}

// Format wallet address for display (fallback)
function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Batch resolve multiple addresses (for leaderboard efficiency)
export async function batchResolveFarcasterUsernames(addresses: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const cache = loadCache();
  const now = Date.now();
  
  // First pass: get cached results
  const uncachedAddresses: string[] = [];
  
  for (const address of addresses) {
    const entry = cache[address.toLowerCase()];
    
    if (entry && (now - entry.timestamp < CACHE_DURATION)) {
      // Use cached result
      results[address] = entry.user ? `@${entry.user.username}` : formatAddress(address);
    } else {
      // Need to fetch
      uncachedAddresses.push(address);
    }
  }
  
  // Second pass: fetch uncached addresses
  // Note: Neynar doesn't have a batch endpoint, so we'll limit concurrent requests
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < uncachedAddresses.length; i += BATCH_SIZE) {
    const batch = uncachedAddresses.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (address) => {
      try {
        const user = await fetchUserFromAPI(address);
        cacheUser(address, user);
        return {
          address,
          username: user ? `@${user.username}` : formatAddress(address)
        };
      } catch (error) {
        console.error(`Failed to fetch username for ${address}:`, error);
        return {
          address,
          username: formatAddress(address)
        };
      }
    });
    
    const batchResults = await Promise.all(promises);
    
    for (const result of batchResults) {
      results[result.address] = result.username;
    }
  }
  
  return results;
}

// Clear cache (for development/debugging)
export function clearFarcasterCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear Farcaster cache:', error);
  }
}