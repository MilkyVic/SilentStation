export function readinessMessage(responseOk: boolean, payload: unknown): string | null {
  return responseOk && payload !== null && typeof payload === 'object' && 'ok' in payload && payload.ok === true
    ? null
    : 'API chưa sẵn sàng';
}
