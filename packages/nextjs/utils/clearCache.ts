// Add this to browser console to clear cache
export function clearDexCache() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('nexus-dex-tokens');
  localStorage.removeItem('nexus-dex-custom-tokens');
  localStorage.removeItem('nexus-dex-balances');
  
  console.log('✅ Cache cleared! Refresh page.');
}

// Run in browser console:
// clearDexCache()
