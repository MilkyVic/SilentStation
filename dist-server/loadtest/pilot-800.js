import 'dotenv/config';
const BASE_URL = (process.env.LOADTEST_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const STUDENT_USERNAME = process.env.LOADTEST_STUDENT_USERNAME || 'student_test';
const STUDENT_PASSWORD = process.env.LOADTEST_STUDENT_PASSWORD || '123456';
const ADMIN_OR_TEACHER_USERNAME = process.env.LOADTEST_REPORT_USERNAME || 'teacher_test';
const ADMIN_OR_TEACHER_PASSWORD = process.env.LOADTEST_REPORT_PASSWORD || '123456';
const TEMPLATE_ID = process.env.LOADTEST_TEMPLATE_ID || '1';
const VIRTUAL_USERS = Number(process.env.LOADTEST_VIRTUAL_USERS || 800);
const SUBMIT_CONCURRENCY = Number(process.env.LOADTEST_SUBMIT_CONCURRENCY || 80);
const REPORT_REQUESTS = Number(process.env.LOADTEST_REPORT_REQUESTS || 120);
const REPORT_CONCURRENCY = Number(process.env.LOADTEST_REPORT_CONCURRENCY || 20);
const TIMEOUT_MS = Number(process.env.LOADTEST_TIMEOUT_MS || 15000);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withTimeout = async (promise, timeoutMs) => {
    const timeout = new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error(`timeout:${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, timeout]);
};
const percentile = (values, p) => {
    if (values.length === 0)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[index];
};
const buildAnswers = (templateId) => {
    const id = String(templateId);
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    if (id === '1')
        return Array.from({ length: 9 }, () => random(0, 3));
    if (id === '2')
        return Array.from({ length: 7 }, () => random(0, 3));
    if (id === '3')
        return Array.from({ length: 25 }, () => random(0, 2));
    if (id === '4')
        return Array.from({ length: 20 }, () => random(0, 2));
    if (id === '5')
        return Array.from({ length: 21 }, () => random(0, 3));
    return Array.from({ length: 10 }, () => random(0, 3));
};
const login = async (username, password) => {
    const response = await withTimeout(fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }), TIMEOUT_MS);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.ok || !body?.session?.accessToken) {
        throw new Error(`login_failed:${username}:${response.status}:${body?.error?.message || 'unknown'}`);
    }
    return String(body.session.accessToken);
};
const callSubmit = async (token) => {
    const start = Date.now();
    try {
        const response = await withTimeout(fetch(`${BASE_URL}/api/tests/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                templateId: TEMPLATE_ID,
                answers: buildAnswers(TEMPLATE_ID),
            }),
        }), TIMEOUT_MS);
        return {
            ok: response.ok,
            status: response.status,
            latencyMs: Date.now() - start,
            endpoint: 'submit',
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 0,
            latencyMs: Date.now() - start,
            endpoint: 'submit',
            error: error instanceof Error ? error.message : 'unknown_error',
        };
    }
};
const callReport = async (token) => {
    const start = Date.now();
    try {
        const response = await withTimeout(fetch(`${BASE_URL}/api/tests/reports/overview?days=30&limit=400`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }), TIMEOUT_MS);
        return {
            ok: response.ok,
            status: response.status,
            latencyMs: Date.now() - start,
            endpoint: 'report',
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 0,
            latencyMs: Date.now() - start,
            endpoint: 'report',
            error: error instanceof Error ? error.message : 'unknown_error',
        };
    }
};
const runPool = async (totalRequests, concurrency, worker) => {
    const metrics = [];
    let cursor = 0;
    const size = Math.max(1, concurrency);
    const runners = Array.from({ length: size }).map(async () => {
        while (true) {
            const index = cursor;
            cursor += 1;
            if (index >= totalRequests)
                return;
            const metric = await worker();
            metrics.push(metric);
        }
    });
    await Promise.all(runners);
    return metrics;
};
const printSummary = (title, metrics) => {
    const latencies = metrics.map((item) => item.latencyMs);
    const okCount = metrics.filter((item) => item.ok).length;
    const failCount = metrics.length - okCount;
    const failedSamples = metrics.filter((item) => !item.ok).slice(0, 5);
    console.log(`\n=== ${title} ===`);
    console.log(`requests: ${metrics.length}`);
    console.log(`success: ${okCount}`);
    console.log(`failed: ${failCount}`);
    console.log(`p50: ${percentile(latencies, 50)} ms`);
    console.log(`p95: ${percentile(latencies, 95)} ms`);
    console.log(`p99: ${percentile(latencies, 99)} ms`);
    console.log(`max: ${latencies.length ? Math.max(...latencies) : 0} ms`);
    if (failedSamples.length > 0) {
        console.log('sample_failures:');
        failedSamples.forEach((item) => {
            console.log(`- status=${item.status} latency=${item.latencyMs} error=${item.error || 'http_error'}`);
        });
    }
};
const main = async () => {
    console.log('[phase-f] Pilot load test started');
    console.log(`[phase-f] base_url=${BASE_URL}`);
    console.log(`[phase-f] submit_virtual_users=${VIRTUAL_USERS}, submit_concurrency=${SUBMIT_CONCURRENCY}`);
    console.log(`[phase-f] report_requests=${REPORT_REQUESTS}, report_concurrency=${REPORT_CONCURRENCY}`);
    const studentToken = await login(STUDENT_USERNAME, STUDENT_PASSWORD);
    const reportToken = await login(ADMIN_OR_TEACHER_USERNAME, ADMIN_OR_TEACHER_PASSWORD);
    console.log('[phase-f] login OK');
    await withTimeout(fetch(`${BASE_URL}/api/tests/catalog`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` },
    }), TIMEOUT_MS);
    await wait(200);
    const submitMetrics = await runPool(VIRTUAL_USERS, SUBMIT_CONCURRENCY, async () => callSubmit(studentToken));
    const reportMetrics = await runPool(REPORT_REQUESTS, REPORT_CONCURRENCY, async () => callReport(reportToken));
    printSummary('submit', submitMetrics);
    printSummary('report_overview', reportMetrics);
    const submitP95 = percentile(submitMetrics.map((item) => item.latencyMs), 95);
    const submitFailRate = submitMetrics.length > 0
        ? ((submitMetrics.filter((item) => !item.ok).length / submitMetrics.length) * 100)
        : 100;
    const pass = submitP95 < 500 && submitFailRate < 2;
    console.log(`\n[phase-f] KPI submit p95 < 500ms && fail_rate < 2% => ${pass ? 'PASS' : 'CHECK_REQUIRED'}`);
    if (!pass) {
        process.exitCode = 1;
    }
};
main().catch((error) => {
    console.error('[phase-f] load test failed:', error);
    process.exit(1);
});
