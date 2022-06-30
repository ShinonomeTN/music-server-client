const microRPCPattern = /^([A-Za-z\d.\-_]+):?([^:].+)?$/;

export type MicroRpcParameterList = Array<unknown | unknown[]>

export default class MicroRpc {
  method: string
  parameters: MicroRpcParameterList

  private constructor(method: string, parameters: MicroRpcParameterList) {
    this.method = method;
    this.parameters = parameters;
  }

  static parse(value: string): MicroRpc | null {
    if (!value) return null;
    // @ts-ignore
    const [matched, name, parameters] = value.match(microRPCPattern);
    if (!matched) return null;
    let parameterList: MicroRpcParameterList = [];
    if (!!parameters) parameterList = parameters.split(',').map((i: string) => {
      const decoded = decodeURIComponent(i);
      const matching = decoded.match(/^\[(.+?)?]$/);
      if (!!matching) {
        const [, values] = matching;
        if (!values) return [];
        return values.split(',');
      }
      return decoded;
    });

    return new MicroRpc(name, parameterList);
  }

  static format(name: string, parameters: MicroRpcParameterList): string {
    const paramString = parameters.map((i: unknown | unknown[]) => {
      switch (typeof i) {
        case 'object': // @ts-ignore
          return `[${Object.entries(i).map(([, value]) => encodeURIComponent(String(value))).join(',')}]`;
        default:
          return encodeURIComponent(String(i));
      }
    }).join(',');
    return `${name}${paramString === '' ? '' : `:${paramString}`}`;
  }
}
