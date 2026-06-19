import { describe, expect, it } from 'vitest';
import { extractToken } from './auth';

describe('extractToken', () => {
  it('prioriza token cuando viene en la respuesta', () => {
    expect(extractToken({ token: 'principal', jwt: 'jwt', accessToken: 'access' })).toBe(
      'principal',
    );
  });

  it('acepta jwt o accessToken como aliases del token', () => {
    expect(extractToken({ jwt: 'jwt-token' })).toBe('jwt-token');
    expect(extractToken({ accessToken: 'access-token' })).toBe('access-token');
  });

  it('retorna null si la respuesta no trae token', () => {
    expect(extractToken({ tokenType: 'Bearer' })).toBeNull();
  });
});
