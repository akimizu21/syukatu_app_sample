// API communication functions

// 本番環境と開発環境でURLを切り替え
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';


// ========================================
// Company API
// ========================================

// Get companies list
export async function getCompanies() {
  const response = await fetch(`${API_BASE}/companies`);
  if (!response.ok) {
    throw new Error('Failed to get companies');
  }
  return response.json();
}

// Create company
export async function createCompany(data) {
  const response = await fetch(`${API_BASE}/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create company');
  }
  return response.json();
}

// Update company
export async function updateCompany(companyId, data) {
  const response = await fetch(`${API_BASE}/companies/${companyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update company');
  }
  return response.json();
}

// Delete company
export async function deleteCompany(companyId) {
  const response = await fetch(`${API_BASE}/companies/${companyId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete company');
  }
  return response.json();
}

// Health check
export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}