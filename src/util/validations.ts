export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validatableInput: Validatable) {
  const value = validatableInput.value;
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof value === 'string') {
    isValid = isValid && value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof value === 'string') {
    isValid = isValid && value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof value === 'number') {
    isValid = isValid && value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof value === 'number') {
    isValid = isValid && value <= validatableInput.max;
  }

  return isValid;
}
