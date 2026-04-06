import React from "react";
import { FormikErrors } from "formik/dist/types";
import {Nullable} from "@/shared/utils/AppData.ts";
import validator from "validator";

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export type HtmlProps<T> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>

export type Validator<DataType = never> = (input: Nullable<DataType>) => [boolean, string]

export type FieldValidatorRecord<FormType> = {
    [key in keyof FormType]?: Validator<FormType[key]>[]
}

export class AppValidation {
    static validate<DataType>(input: Nullable<DataType>, validators: Validator<DataType>[]): [boolean, string] {
        for (let i = 0; i < validators.length; i++) {
            const result = validators[i](input);
            if (!result[0]) {
                return result;
            }
        }
        return [true, ""];
    }

    static validateField<FormType, Field extends keyof FormType>(value: FormType[Field], validators: Validator<FormType[Field]>[]): [boolean, string] {
        for (let i = 0; i < validators.length; i++) {
            const result = validators[i](value);
            if (!result[0]) {
                return result;
            }
        }
        return [true, ""];
    }

    static getErrorValidate<FormType extends object>(object: FormType, validatorRecord: FieldValidatorRecord<FormType>): FormikErrors<FormType> {
        const errors: FormikErrors<FormType> = {};
        (Object.keys(object) as (keyof FormType)[])?.forEach(key => {
            const validators = validatorRecord[key];
            if (validators) {
                const result = this.validateField(object[key], validators);
                if (!result[0]) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    errors[key] = result[1];
                }
            }
        });
        return errors;
    }

    static notEmpty: Validator<string> = (input) => {
        if (!input) {
            return [false, "Required"];
        }

        if (!input.trim()) {
            return [false, "Required"];
        }

        return [true, ""];
    };

    static moreThan8Char: Validator<string> = (input) => {
        if (!input) {
            return [false, "Required"];
        }

        if (input.length < 8) {
            return [false, "Must more than 8 characters"];
        }

        return [true, ""];
    };

    static arrayMoreThan3 = function <DataType>(input: Nullable<DataType[]>): ReturnType<Validator<DataType>> {
        if (!input) {
            return [false, "Required"];
        }

        if (input.length < 3) {
            return [false, "Must more than 3"];
        }

        return [true, ""];
    };

    static isEmail: Validator<string> = (input) => {
        if (!input) {
            return [false, "Required"];
        }

        if (!validator.isEmail(input)) {
            return [false, "Email is not right format"];
        }

        return [true, ""];
    };

    static isPhoneNumber: Validator<string> = (input) => {
        if (!input) {
            return [false, "Required"];
        }

        if (!validator.isMobilePhone(input)) {
            return [false, "Phone is not right format"];
        }

        return [true, ""];
    };

    static arrayNotEmpty = function <DataType>(input: Nullable<DataType[]>): ReturnType<Validator<DataType>> {
        if (!input) {
            return [false, "Required"];
        }

        if (input.length === 0) {
            return [false, "Required"];
        }

        return [true, ""];
    };

    static hasNoDuplicates(input: string): boolean {
        // Use a Set to keep track of unique characters
        const uniqueChars = new Set();

        // Iterate through each character in the input string
        for (const char of input) {
            // If the character is already in the set, there is a duplicate
            if (uniqueChars.has(char)) {
                return false;
            }

            // Otherwise, add the character to the set
            uniqueChars.add(char);
        }

        // If the loop completes without returning false, there are no duplicates
        return true;
    }
}
