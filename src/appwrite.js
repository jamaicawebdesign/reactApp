import { Account, Client } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT?.trim();
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID?.trim();

export const appwriteConfigurationError = !endpoint || !projectId
  ? 'Appwrite is not configured. Add the endpoint and project ID to .env.local, then restart the development server.'
  : '';

const client = new Client();

if (!appwriteConfigurationError) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = appwriteConfigurationError ? null : new Account(client);
