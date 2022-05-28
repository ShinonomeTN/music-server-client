// noinspection JSUnresolvedVariable
import { BusinessError } from '@/common/business-error';

export function $native(rpcMethodName, paramObject) {
  const n = window.$native;
  if (!n) return Promise.reject(new BusinessError({ error: 'native_invoke_error', message: 'not_at_native_platform' }));
  return n(rpcMethodName, paramObject);
}
