import { FormikConfig, FormikErrors, FormikValues } from "formik/dist/types";
import { useFormik } from "formik";

export default function useForm<Values extends FormikValues = FormikValues>(config: FormikConfig<Values>) {
  const formik = useFormik(config);

  async function updateFieldValue<T extends keyof Values>(fieldName: T, value: Values[T], shouldValidate?: boolean): Promise<FormikErrors<Values> | void> {
    return formik.setFieldValue(fieldName as string, value, shouldValidate);
  }

  const isFormFieldInvalid = (field: keyof Values) => !!(formik.touched[field] && formik.errors[field]);

  const getFormErrorMessage = (field: keyof Values) => {
    return isFormFieldInvalid(field) ? String(formik.errors[field]) : undefined;
  };

  const checkErrorAndSubmit = async (showError?: (errorText: string) => void) => {
    await formik.submitForm();
    const keys = Object.keys(formik.errors);
    if (keys.length > 0) {
      for (const key of keys) {
        if (formik.errors[key]) {
          showError?.(`Field ${key}: ${String(formik.errors[key])}`);
          return;
        }
      }
      return;
    }
  };

  return {
    ...formik,
    updateFieldValue,
    getFormErrorMessage,
    checkErrorAndSubmit
  };
}

