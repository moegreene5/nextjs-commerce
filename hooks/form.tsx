import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from "@/components/form-components";
import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});

export type AppFormApi<T> = ReturnType<
  typeof useAppForm<
    T, // form data shape
    any, // TOnMount
    any, // TOnChange
    any, // TOnChangeAsync
    any, // TOnBlur
    any, // TOnBlurAsync
    any, // TOnSubmit
    any, // TOnSubmitAsync
    any, // TFieldMeta
    any, // TFieldArrayMeta
    any, // ErrorMap
    any // SubmitMeta
  >
>;
