export {};

declare global {
  interface Object {
    entries() : [string, unknown | null | undefined][]
    filteringFields(...fields: string[]) : Record<string, unknown | null | undefined>
  }

  interface Array<T> {
    clear() : Array<T>

    isEmpty() : boolean
    isNotEmpty() : boolean

    delete(index: number) : Array<T>
  }
}
