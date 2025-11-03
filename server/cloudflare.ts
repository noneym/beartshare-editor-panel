import FormData from 'form-data';
import fetch from 'node-fetch';

interface CloudflareImagesResponse {
  success: boolean;
  result?: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  errors?: Array<{ code: number; message: string }>;
  messages?: string[];
}

export async function uploadImageToCloudflare(imageUrl: string): Promise<CloudflareImagesResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!accountId || !token || !email || !apiKey) {
    throw new Error('Cloudflare credentials are not configured (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN, CLOUDFLARE_EMAIL, and CLOUDFLARE_API_KEY required)');
  }

  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('requireSignedURLs', 'false');

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey,
    ...formData.getHeaders(),
  };

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers,
      body: formData,
    }
  );

  const result = await response.json() as CloudflareImagesResponse;
  
  if (!result.success) {
    console.error('Cloudflare Images upload failed:', result.errors);
    throw new Error(`Cloudflare upload failed: ${JSON.stringify(result.errors)}`);
  }

  return result;
}

export async function uploadImageFromFile(file: Buffer, filename: string): Promise<CloudflareImagesResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!accountId || !token || !email || !apiKey) {
    throw new Error('Cloudflare credentials are not configured (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN, CLOUDFLARE_EMAIL, and CLOUDFLARE_API_KEY required)');
  }

  const formData = new FormData();
  formData.append('file', file, filename);
  formData.append('requireSignedURLs', 'false');

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey,
    ...formData.getHeaders(),
  };

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const result = await response.json() as CloudflareImagesResponse;
  
  if (!result.success) {
    console.error('Cloudflare Images upload failed:', result.errors);
    console.error('Response status:', response.status);
    throw new Error(`Cloudflare upload failed: ${JSON.stringify(result.errors)}`);
  }

  return result;
}
