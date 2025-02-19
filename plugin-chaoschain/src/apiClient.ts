const DEFAULT_BASE_URL = process.env.CHAOSCHAIN_API_URL || "http://127.0.0.1:3000/api";

export const ApiConfig = {
  baseUrl: DEFAULT_BASE_URL,
};

/**
 * A generic function to make API calls.
 *
 * @param endpoint The API endpoint (e.g. "/agents/register")
 * @param options The fetch options (e.g. method, headers, body)
 * @returns The parsed JSON response.
 */
export async function callApi(endpoint: string, options: RequestInit): Promise<any> {
  const url = `${ApiConfig.baseUrl}${endpoint}`;
  console.log('options', options);
  const response = await fetch(url, options);
  console.log("API response:", response);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
} 