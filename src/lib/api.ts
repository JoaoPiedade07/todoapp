// Utility para obter a URL base da API
export function getApiBaseUrl(): string {
  // Em produção, usar variável de ambiente (configurada no Vercel)
  if (typeof window !== 'undefined') {
    // Cliente (browser)
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      console.log('🌐 Usando API URL:', envUrl);
      return envUrl;
    }
    
    // Fallback: detectar automaticamente para desenvolvimento
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se estiver em produção (HTTPS), mas NEXT_PUBLIC_API_URL não configurada
    if (protocol === 'https:' || hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      console.error('❌ NEXT_PUBLIC_API_URL não configurada!');
      console.error('Configure no Vercel: Settings → Environment Variables');
      console.error('Valor esperado: https://todoapp-production-c3f9.up.railway.app');
      // Retornar URL vazia para forçar erro visível
      return '';
    }
    
    // Desenvolvimento local
    return `http://${hostname}:3001`;
  }
  
  // Server-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

