import { authService } from './authService';

type ApiTemplateAudience = 'student' | 'teacher' | 'both';

type ApiTestTemplate = {
  id: string;
  title: string;
  description: string;
  targetAudience: ApiTemplateAudience;
  templateCode: string;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  createdByUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  versionCount?: number;
  lastVersionAt?: string | null;
  questionCount?: number;
};

type ApiTestQuestion = {
  id: string;
  text: string;
  subscale?: string;
  isReverse?: boolean;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
};

type ApiTemplateVersion = {
  id: string;
  templateId: string;
  versionNumber: number;
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete';
  actorUserId: string | null;
  snapshot: Record<string, unknown>;
  createdAt: string;
};

type ApiTestResultItem = {
  id: string;
  templateId: string;
  templateTitle: string;
  scoreTotal: number;
  scoreLevel: string;
  scorePayload: Record<string, unknown>;
  suggestDass21: boolean;
  submittedAt: string;
};

type ApiReportAttempt = {
  attemptId: string;
  userId: string;
  userRole: string;
  username: string;
  userName: string;
  school: string;
  className: string;
  templateId: string;
  templateTitle: string;
  scoreTotal: number;
  scoreLevel: string;
  suggestDass21: boolean;
  submittedAt: string;
  riskLevel: 'low' | 'medium' | 'high';
  isHighRisk: boolean;
};

type ServiceResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

const TEST_API_PREFIX = '/api/tests';

const isBrowser = () => typeof window !== 'undefined';

const getApiBaseUrl = () => {
  if (!isBrowser()) return '';
  const envBaseUrl = (import.meta as { env?: Record<string, unknown> }).env?.VITE_AUTH_API_BASE_URL;
  return typeof envBaseUrl === 'string' ? envBaseUrl.trim().replace(/\/$/, '') : '';
};

const buildApiUrl = (path: string) => `${getApiBaseUrl()}${TEST_API_PREFIX}${path}`;

const callApi = async (path: string, init?: RequestInit): Promise<unknown | null> => {
  if (!isBrowser()) return null;
  const token = authService.getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });

    const body = await response.json().catch(() => null);
    if (body) return body;

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: 'AUTH_SERVER_ERROR',
          message: 'Không xử lý được phản hồi máy chủ test.',
        },
      };
    }
  } catch {
    return null;
  }

  return null;
};

const normalizeError = (message: string): ServiceResult<never> => ({
  ok: false,
  error: {
    code: 'AUTH_SERVER_ERROR',
    message,
  },
});

export const testService = {
  async listCatalog(): Promise<ServiceResult<{ userRole: string; templates: ApiTestTemplate[] }>> {
    const payload = await callApi('/catalog', { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Không kết nối được máy chủ danh mục bài test.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      userRole?: string;
      templates?: ApiTestTemplate[];
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Không tải được danh mục bài test.',
        },
      };
    }

    return {
      ok: true,
      data: {
        userRole: result.userRole || '',
        templates: Array.isArray(result.templates) ? result.templates : [],
      },
    };
  },

  async submitResult(payload: {
    templateId: string;
    answers: number[];
    score?: number;
  }): Promise<ServiceResult<{
    attemptId: string;
    scoreTotal: number;
    scoreLevel: string;
    scorePayload: Record<string, unknown>;
    suggestDass21: boolean;
  }>> {
    const body = await callApi('/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!body || typeof body !== 'object') {
      return normalizeError('Không kết nối được máy chủ chấm điểm.');
    }

    const result = body as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      attemptId?: string;
      scoreTotal?: number;
      scoreLevel?: string;
      scorePayload?: Record<string, unknown>;
      suggestDass21?: boolean;
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Không thể nộp bài test.',
        },
      };
    }

    return {
      ok: true,
      data: {
        attemptId: result.attemptId || '',
        scoreTotal: Number(result.scoreTotal || 0),
        scoreLevel: result.scoreLevel || 'Đã hoàn thành',
        scorePayload: result.scorePayload || {},
        suggestDass21: Boolean(result.suggestDass21),
      },
    };
  },

  async getTemplateDetail(templateId: string): Promise<ServiceResult<{
    template: ApiTestTemplate;
    questionList: ApiTestQuestion[];
  }>> {
    const payload = await callApi(`/${encodeURIComponent(templateId)}`, { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Khong ket noi duoc may chu chi tiet bai test.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      template?: ApiTestTemplate;
      questionList?: ApiTestQuestion[];
    };

    if (!result.ok || !result.template) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong tai duoc chi tiet bai test.',
        },
      };
    }

    return {
      ok: true,
      data: {
        template: result.template,
        questionList: Array.isArray(result.questionList) ? result.questionList : [],
      },
    };
  },

  async listMyResults(): Promise<ServiceResult<{ userId: string; results: ApiTestResultItem[] }>> {
    const payload = await callApi('/results/me', { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Không kết nối được máy chủ kết quả bài test.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      userId?: string;
      results?: ApiTestResultItem[];
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Không tải được kết quả bài test.',
        },
      };
    }

    return {
      ok: true,
      data: {
        userId: result.userId || '',
        results: Array.isArray(result.results) ? result.results : [],
      },
    };
  },

  async listManageTemplates(): Promise<ServiceResult<{ userRole: string; templates: ApiTestTemplate[] }>> {
    const payload = await callApi('/templates/manage', { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Khong ket noi duoc may chu quan tri bai test.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      userRole?: string;
      templates?: ApiTestTemplate[];
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong tai duoc danh sach quan tri bai test.',
        },
      };
    }

    return {
      ok: true,
      data: {
        userRole: result.userRole || '',
        templates: Array.isArray(result.templates) ? result.templates : [],
      },
    };
  },

  async createTemplate(payload: {
    title: string;
    description?: string;
    targetAudience?: ApiTemplateAudience;
  }): Promise<ServiceResult<{ template: ApiTestTemplate }>> {
    const body = await callApi('/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!body || typeof body !== 'object') {
      return normalizeError('Khong ket noi duoc may chu tao bai test.');
    }

    const result = body as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      template?: ApiTestTemplate;
    };
    if (!result.ok || !result.template) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong tao duoc bai test.',
        },
      };
    }
    return { ok: true, data: { template: result.template } };
  },

  async updateTemplate(
    templateId: string,
    payload: {
      title?: string;
      description?: string;
      targetAudience?: ApiTemplateAudience;
      isActive?: boolean;
    },
  ): Promise<ServiceResult<{ template: ApiTestTemplate }>> {
    const body = await callApi(`/templates/${encodeURIComponent(templateId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!body || typeof body !== 'object') {
      return normalizeError('Khong ket noi duoc may chu cap nhat bai test.');
    }

    const result = body as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      template?: ApiTestTemplate;
    };
    if (!result.ok || !result.template) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong cap nhat duoc bai test.',
        },
      };
    }
    return { ok: true, data: { template: result.template } };
  },

  async publishTemplate(
    templateId: string,
    isActive: boolean,
  ): Promise<ServiceResult<{ template: ApiTestTemplate }>> {
    const body = await callApi(`/templates/${encodeURIComponent(templateId)}/publish`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
    if (!body || typeof body !== 'object') {
      return normalizeError('Khong ket noi duoc may chu publish/unpublish bai test.');
    }

    const result = body as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      template?: ApiTestTemplate;
    };
    if (!result.ok || !result.template) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong thay doi trang thai bai test duoc.',
        },
      };
    }
    return { ok: true, data: { template: result.template } };
  },

  async deleteTemplate(templateId: string): Promise<ServiceResult<{ id: string }>> {
    const body = await callApi(`/templates/${encodeURIComponent(templateId)}`, {
      method: 'DELETE',
    });
    if (!body || typeof body !== 'object') {
      return normalizeError('Khong ket noi duoc may chu xoa bai test.');
    }

    const result = body as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      id?: string;
    };
    if (!result.ok || !result.id) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong xoa duoc bai test.',
        },
      };
    }
    return { ok: true, data: { id: result.id } };
  },

  async listTemplateVersions(templateId: string): Promise<ServiceResult<{ templateId: string; versions: ApiTemplateVersion[] }>> {
    const payload = await callApi(`/templates/${encodeURIComponent(templateId)}/versions`, { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Khong ket noi duoc may chu lich su phien ban.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      templateId?: string;
      versions?: ApiTemplateVersion[];
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Khong tai duoc lich su phien ban.',
        },
      };
    }

    return {
      ok: true,
      data: {
        templateId: result.templateId || templateId,
        versions: Array.isArray(result.versions) ? result.versions : [],
      },
    };
  },

  async getReportsOverview(params: {
    days?: number;
    school?: string;
    className?: string;
    limit?: number;
  } = {}): Promise<ServiceResult<{
    scope: string;
    filters: {
      days: number;
      school: string;
      className: string;
      limit: number;
    };
    summary: {
      totalAttempts: number;
      uniqueUsers: number;
      avgScore: number;
      highRiskCount: number;
      highRiskRate: number;
    };
    byMonth: Array<{
      month: string;
      count: number;
      avgScore: number;
      highRiskCount: number;
      studentCount: number;
      teacherCount: number;
      studentAvgScore: number;
      teacherAvgScore: number;
    }>;
    byRole: Array<{ role: string; count: number; avgScore: number; highRiskCount: number }>;
    byTemplate: Array<{ templateId: string; templateTitle: string; count: number; avgScore: number; highRiskCount: number }>;
    byClass: Array<{ className: string; count: number; avgScore: number; highRiskCount: number }>;
    recentRiskAlerts: Array<{
      attemptId: string;
      userId: string;
      userName: string;
      username: string;
      role: string;
      school: string;
      className: string;
      templateTitle: string;
      scoreTotal: number;
      scoreLevel: string;
      submittedAt: string;
    }>;
    schoolOptions: string[];
    classOptions: string[];
    attempts: ApiReportAttempt[];
  }>> {
    const query = new URLSearchParams();
    if (Number.isFinite(Number(params.days))) query.set('days', String(params.days));
    if (Number.isFinite(Number(params.limit))) query.set('limit', String(params.limit));
    if (params.school) query.set('school', params.school);
    if (params.className) query.set('className', params.className);
    const suffix = query.toString() ? `?${query.toString()}` : '';

    const payload = await callApi(`/reports/overview${suffix}`, { method: 'GET' });
    if (!payload || typeof payload !== 'object') {
      return normalizeError('Không kết nối được máy chủ báo cáo.');
    }

    const result = payload as {
      ok?: boolean;
      error?: { code?: string; message?: string };
      scope?: string;
      filters?: {
        days?: number;
        school?: string;
        className?: string;
        limit?: number;
      };
      summary?: {
        totalAttempts?: number;
        uniqueUsers?: number;
        avgScore?: number;
        highRiskCount?: number;
        highRiskRate?: number;
      };
      byMonth?: Array<{
        month: string;
        count: number;
        avgScore: number;
        highRiskCount: number;
        studentCount: number;
        teacherCount: number;
        studentAvgScore: number;
        teacherAvgScore: number;
      }>;
      byRole?: Array<{ role: string; count: number; avgScore: number; highRiskCount: number }>;
      byTemplate?: Array<{ templateId: string; templateTitle: string; count: number; avgScore: number; highRiskCount: number }>;
      byClass?: Array<{ className: string; count: number; avgScore: number; highRiskCount: number }>;
      recentRiskAlerts?: Array<{
        attemptId: string;
        userId: string;
        userName: string;
        username: string;
        role: string;
        school: string;
        className: string;
        templateTitle: string;
        scoreTotal: number;
        scoreLevel: string;
        submittedAt: string;
      }>;
      schoolOptions?: string[];
      classOptions?: string[];
      attempts?: ApiReportAttempt[];
    };

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error?.code || 'AUTH_SERVER_ERROR',
          message: result.error?.message || 'Không tải được báo cáo tổng hợp.',
        },
      };
    }

    return {
      ok: true,
      data: {
        scope: result.scope || '',
        filters: {
          days: Number(result.filters?.days || 30),
          school: String(result.filters?.school || ''),
          className: String(result.filters?.className || ''),
          limit: Number(result.filters?.limit || 600),
        },
        summary: {
          totalAttempts: Number(result.summary?.totalAttempts || 0),
          uniqueUsers: Number(result.summary?.uniqueUsers || 0),
          avgScore: Number(result.summary?.avgScore || 0),
          highRiskCount: Number(result.summary?.highRiskCount || 0),
          highRiskRate: Number(result.summary?.highRiskRate || 0),
        },
        byMonth: Array.isArray(result.byMonth) ? result.byMonth : [],
        byRole: Array.isArray(result.byRole) ? result.byRole : [],
        byTemplate: Array.isArray(result.byTemplate) ? result.byTemplate : [],
        byClass: Array.isArray(result.byClass) ? result.byClass : [],
        recentRiskAlerts: Array.isArray(result.recentRiskAlerts) ? result.recentRiskAlerts : [],
        schoolOptions: Array.isArray(result.schoolOptions) ? result.schoolOptions : [],
        classOptions: Array.isArray(result.classOptions) ? result.classOptions : [],
        attempts: Array.isArray(result.attempts) ? result.attempts : [],
      },
    };
  },
};
