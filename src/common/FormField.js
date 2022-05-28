export class FormField {
  /**
   * Constructor
   * @param { * } defaultValue
   * @param { [(function(*): ({error: boolean, message: string | null}))] } validators
   */
  constructor(defaultValue, validators) {
    this.value = defaultValue;
    this.validators = validators;
    this.error = null;
  }

  /**
   * Validate this field
   * @returns {boolean}
   */
  validate() {
    if (!(this.validators instanceof Array)) throw Error('Validators should be an array instance.');
    for (const validator of this.validators) {
      const result = validator(this.value);
      if (result.error) {
        this.error = { message: result.message };
        return false;
      }
    }
    this.error = null;
    return true;
  }
}

/**
 * Crete field validator
 * @param { (function(*): boolean) } test
 * @param errorMessage
 * @returns {(function(*): ({error: boolean}))|*}
 */
export function fieldValidator(test, errorMessage) {
  return (value) => {
    if (test(value)) return { error: false };
    return { error: true, message: errorMessage };
  };
}

/**
 * Get supported fields from a form
 * @param { Object } form
 * @returns {FormField[]}
 */
export function fieldsOfFrom(form) {
  return Object.entries(form).map(([, value]) => value).filter((field) => field instanceof FormField);
}

/**
 * Validate all fields in a form
 * @param form
 * @returns { boolean }
 */
export function validateAllField(form) {
  const fields = fieldsOfFrom(form);
  fields.forEach((field) => field.validate());
  // eslint-disable-next-line no-param-reassign
  if (form.didFirstValidate !== null) form.didFirstValidate = false;
  // eslint-disable-next-line no-param-reassign
  if (form.isValid !== null) form.isValid = fields.map((item) => !item.error).all();
}

/**
 * Check if a form is valid, will not trigger any validator.
 * @param form
 * @returns { boolean }
 */
export function isFormValid(form) {
  return fieldsOfFrom(form).map((field) => !field.error).all();
}

/**
 * Check if an object support form validations
 * @param { Object } form
 * @returns {boolean}
 */
export function supportFormValidation(form) {
  return fieldsOfFrom(form).any();
}
