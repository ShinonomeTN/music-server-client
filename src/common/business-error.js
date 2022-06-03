export class BusinessError extends Error {
  /**
   * Constructor
   * @param { String } error
   * @param { String | null } message
   * @param { Object | null | undefined } attachment
   */
  constructor({ error, message, attachment }) {
    super(message);
    this.error = error;
    this.attachment = attachment
  }
}
