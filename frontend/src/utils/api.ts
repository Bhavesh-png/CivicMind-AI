const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper to get authorization headers
const getHeaders = (contentType: string = 'application/json') => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Telemetry Metrics
  getMetrics: async () => {
    const res = await fetch(`${API_URL}/data/metrics`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load metrics");
    return res.json();
  },
  
  getTrafficHistory: async (days: number = 7) => {
    const res = await fetch(`${API_URL}/data/traffic-history?days=${days}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load traffic history");
    return res.json();
  },
  
  getPollutionHistory: async (days: number = 7) => {
    const res = await fetch(`${API_URL}/data/pollution-history?days=${days}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load pollution history");
    return res.json();
  },
  
  getEnergyHistory: async (days: number = 7) => {
    const res = await fetch(`${API_URL}/data/energy-history?days=${days}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load energy history");
    return res.json();
  },
  
  getDiseaseHistory: async (weeks: number = 12) => {
    const res = await fetch(`${API_URL}/data/disease-history?weeks=${weeks}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load disease history");
    return res.json();
  },

  getRecommendations: async () => {
    const res = await fetch(`${API_URL}/data/recommendations`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load recommendations");
    return res.json();
  },

  getStreets: async () => {
    const res = await fetch(`${API_URL}/data/streets`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load streets coordinates");
    return res.json();
  },

  getZones: async () => {
    const res = await fetch(`${API_URL}/data/zones`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load zone configurations");
    return res.json();
  },

  // Predictive Analytics
  getForecast: async (category: string, horizonHours: number = 24) => {
    const res = await fetch(`${API_URL}/prediction/forecast?category=${category}&horizon_hours=${horizonHours}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load forecast for ${category}`);
    return res.json();
  },

  // AI Chatbot
  chatWithAI: async (message: string, history: Array<{ role: 'user' | 'model'; text: string }>) => {
    const res = await fetch(`${API_URL}/chatbot/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error("Chatbot API failed");
    return res.json();
  },

  // Report Generator
  previewReport: async (reportType: string, timeFrame: string) => {
    const res = await fetch(`${API_URL}/reports/preview?report_type=${reportType}&time_frame=${timeFrame}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load report preview");
    return res.json();
  },

  downloadReportUrl: (reportType: string, timeFrame: string) => {
    return `${API_URL}/reports/download?report_type=${reportType}&time_frame=${timeFrame}`;
  },

  // Citizen Feedback
  listComplaints: async () => {
    const res = await fetch(`${API_URL}/feedback/list`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load feedback list");
    return res.json();
  },

  submitComplaint: async (title: string, description: string, category: string, zone: string) => {
    const res = await fetch(`${API_URL}/feedback/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, category, zone })
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
  },

  // Alerts & Notifications
  getAlerts: async () => {
    const res = await fetch(`${API_URL}/notifications/alerts`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load active alerts");
    return res.json();
  },

  getTasks: async () => {
    const res = await fetch(`${API_URL}/notifications/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load workflow tasks");
    return res.json();
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    const res = await fetch(`${API_URL}/notifications/tasks/${taskId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`Failed to update status for task ${taskId}`);
    return res.json();
  }
};
