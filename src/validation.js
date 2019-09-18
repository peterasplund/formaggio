/* @flow */

import type { FormData } from "./types";

export type ValidationError = {
  error: string,
  field: string,
};

export type Validator<S> = (s: S) => Array<ValidationError>;

export function rules<S>(vs: Array<Validator<S>>): Validator<S> {
  return (s: S): Array<ValidationError> =>
    [].concat(...vs.map((i: Validator<S>): Array<ValidationError> => i(s)));
}

export function nestedRule<S>(k: string, v: Validator<S>): Validator<S> {
  return (s: S): Array<ValidationError> => typeof s === "object" && s ?
    v(s[k]).map(
      ({ error, field }: ValidationError): ValidationError =>
        ({ error, field: k + "." + field })
    ) : [];
}

export function conditional<S>(c: (s: S) => boolean, v: Validator<S>): Validator<S> {
  return (s: S): Array<ValidationError> => c(s) ? v(s) : [];
}

export const POSTAL_CODE = /^\d{3}\s?\d{2}$/;
/* eslint-disable max-len */
export const EMAIL = /^[!#$%&'*+/=?^_`{|}~\-a-z0-9]+(?:\.[!#$%&'*+/=?^_`{|}~\-a-z0-9]+)*@(?:[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])*$/i;
/* eslint-enable max-len */
export const PHONE = /^(?=.*\d{2,})[-\s+()0-9]+$/;

export function isRequired(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    typeof s === "object" && s && (s[f] || s[f] === 0) ? [] : [{ error: "REQUIRED", field: f }];
}

export function lengthGt(f: string, l: number): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    typeof s[f] === "string" && s[f].length > l ?
      [] :
      [{ error: "LENGTH_GT", field: f, lengthGt: l }];
}

export function lengthLt(f: string, l: number): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    typeof s[f] === "string" && s[f].length < l ?
      [] :
      [{ error: "LENGTH_LT", field: f, lengthLt: l }];
}

export function isTruthy(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> => s[f] ? [] : [{ error: "TRUTHY", field: f }];
}

export function match(f1: string, f2: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    s[f1] === s[f2] ? [] : [{ error: "MATCH", field: f2, match: f2 }];
}

export function isPhone(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    typeof s[f] === "string" && PHONE.test(s[f]) ? [] : [{ error: "PHONE", field: f }];
}

export function isPostalCode(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> => {
    const value = parseInt(String(s[f]).replace(/\s/g, ""), 10);

    return (POSTAL_CODE.test(String(s[f])) && !isNaN(value) && value > 10000) ?
      [] :
      [{ error: "POSTCODE", field: f }];
  };
}

export function isEmail(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> =>
    typeof s[f] === "string" && EMAIL.test(s[f]) ? [] : [{ error: "EMAIL", field: f }];
}

function numeric(x: mixed): boolean {
  return !isNaN((x: any) - parseFloat(x));
}

export function isNumeric(f: string): Validator<FormData> {
  return (s: FormData): Array<ValidationError> => numeric(s[f]) ?
    [] :
    [{ error: "NUMERIC", field: f }];
}

