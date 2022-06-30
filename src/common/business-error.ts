import { Optional } from "@/common/foolish";

export class BusinessError extends Error {
  /**
   * Main Error
   */
  error: string

  /**
   * Any useful message
   */
  attachment: unknown | null

  /**
   * Constructor
   * @param params
   */
  constructor(params: { error : string, message: string, attachment : Optional<unknown> }) {
    super(params.message);
    this.error = params.error;
    this.attachment = params.attachment;
  }
}
