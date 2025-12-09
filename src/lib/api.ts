// Utility para obter a URL base da API
export function getApiBaseUrl(): string {
  // Helper para garantir que a URL tenha protocolo
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    // Se já tem protocolo, retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Se não tem protocolo, adiciona https:// (assumindo produção)
    return `https://${url}`;
  };

  // Em produção, usar variável de ambiente (configurada no Vercel)
  if (typeof window !== 'undefined') {
    // Cliente (browser)
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.trim() !== '') {
      const fullUrl = ensureProtocol(envUrl.trim());
      console.log('🌐 Usando API URL:', fullUrl);
      return fullUrl;
    }
    
    // Fallback: detectar automaticamente para desenvolvimento
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Se estiver em produção (HTTPS), mas NEXT_PUBLIC_API_URL não configurada
    if (protocol === 'https:' || hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      console.error('❌ NEXT_PUBLIC_API_URL não configurada!');
      console.error('Configure no Vercel: Settings → Environment Variables');
      console.error('Valor esperado: https://seu-backend.railway.app');
      console.error('⚠️ Sem esta variável, as requisições falharão!');
      // Retornar null em vez de string vazia para facilitar validação
      return '';
    }
    
    // Desenvolvimento local
    return `http://${hostname}:3001`;
  }
  
  // Server-side
  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return ensureProtocol(serverUrl);
}

