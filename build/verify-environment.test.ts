import { describe, expect, it } from 'vitest'
import { verifyObturaEnvironment } from './verify-environment'

describe('Obtura environment boundary', () => {
  it('rejects the GRS Supabase project', () => {
    expect(() => verifyObturaEnvironment({
      VITE_SUPABASE_URL: 'https://npqegxbgzcvgjrvkzodh.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'example',
    }, true)).toThrow(/GRS/)
  })

  it('rejects incomplete credentials', () => {
    expect(() => verifyObturaEnvironment({ VITE_SUPABASE_URL: 'https://obtura-demo.supabase.co' }, true)).toThrow(/ensemble/)
  })

  it('allows an unconnected local build but rejects production when required', () => {
    expect(() => verifyObturaEnvironment({}, true)).not.toThrow()
    expect(() => verifyObturaEnvironment({ VITE_REQUIRE_BACKEND: 'true' }, true)).toThrow(/propre Supabase/)
  })
})
