export class BusinessError extends Error {
  /**
   * Constructor
   * @param { String } error
   * @param { String | null } message
   */
  constructor({ error, message }) {
    super(message);
    this.error = error;
  }
}
