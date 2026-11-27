import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, httpClient } from '../httpClient';

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('httpClient', () => {
  it('returns the parsed JSON body of a GET', async () => {
    mockFetch(Response.json({ name: 'TopTop' }));

    await expect(
      httpClient.get<{ name: string }>('/api/shop'),
    ).resolves.toEqual({
      name: 'TopTop',
    });
  });

  it('sends a POST body as JSON', async () => {
    const fetchMock = mockFetch(Response.json({ ok: true }));

    await httpClient.post('/api/shop', { name: 'TopTop' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'TopTop' }));
  });

  it('returns undefined for 204 No Content', async () => {
    mockFetch(new Response(null, { status: 204 }));

    await expect(httpClient.delete('/api/shop/1')).resolves.toBeUndefined();
  });

  it('throws an HttpError carrying the status on a failed response', async () => {
    mockFetch(new Response('nope', { status: 403 }));

    await expect(httpClient.get('/api/shop')).rejects.toMatchObject({
      status: 403,
    });
    await expect(httpClient.get('/api/shop')).rejects.toBeInstanceOf(HttpError);
  });
});
