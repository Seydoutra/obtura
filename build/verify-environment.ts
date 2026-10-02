const GRS_PROJECT_ID = 'npqegxbgzcvgjrvkzodh'

export function verifyObturaEnvironment(env: Record<string, string | undefined>, production: boolean): void {
  const url = env.VITE_SUPABASE_URL?.trim() || ''
  const key = env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  if (url.includes(GRS_PROJECT_ID)) {
    throw new Error('Obtura ne peut pas utiliser le projet Supabase GRS.')
  }
  if (Boolean(url) !== Boolean(key)) {
    throw new Error('Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ensemble.')
  }
  if (url && (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !key)) {
    throw new Error('Configuration Supabase Obtura invalide.')
  }
  if (production && env.VITE_REQUIRE_BACKEND === 'true' && !url) {
    throw new Error('Le déploiement Obtura exige son propre Supabase.')
  }
}
