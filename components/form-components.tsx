import { useStore } from "@tanstack/react-form";

import { cn } from "@/utils/cn";
import { useFormContext, useFieldContext } from "@/hooks/form-context";
import { LucideIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function SubscribeButton({
  label,
  icon: Icon,
  ...props
}: {
  label: string;
  icon?: LucideIcon;
} & React.ComponentProps<"button">) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          {...props}
          type="submit"
          disabled={isSubmitting || props.disabled}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {label}
            </>
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}

export function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>;
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === "string" ? error : error.message}
          className="text-red-500 mt-1 text-sm"
        >
          {typeof error === "string" ? error : error.message}
        </div>
      ))}
    </>
  );
}

export function TextField({
  label,
  placeholder,
  className,
  type,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.ComponentProps<"input">) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="space-y-1">
      <label htmlFor={label}>
        <div className="space-y-2">
          <span>{label}</span>
          <Input
            type={type}
            name={field.name}
            value={field.state.value}
            placeholder={placeholder}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={
              !field.state.meta.isValid && field.state.meta.isTouched
            }
            className={cn("h-10", className)}
            {...props}
          />
        </div>
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}

export function TextArea({
  label,
  rows = 4,
  className,
  ...props
}: {
  label: string;
  rows?: number;
} & React.ComponentProps<"textarea">) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div>
      <label
        htmlFor={label}
        className="block font-medium mb-1 text-sm font-roboto"
      >
        <span className="block mb-2 text-heading">{label}</span>

        <Textarea
          name={field.name}
          rows={rows}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className={cn(className)}
          aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
          {...props}
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}

export function Select({
  label,
  values,
}: {
  label: string;
  values: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div>
      <label htmlFor={label} className="block font-bold mb-1 text-xl">
        {label}
      </label>
      <select
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}

export function SelectField({
  label,
  options,
  required,
  placeholder = "Select an option",
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="space-y-1">
      <label htmlFor={label}>
        <span className="block mb-2 text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        <select
          id={label}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
          className="w-full h-10 px-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}

export function CheckboxField({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="space-y-1">
      <label
        className={cn("flex items-center gap-2 cursor-pointer", className)}
      >
        <input
          type="checkbox"
          name={field.name}
          checked={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          className="w-4 h-4 border-stone-300 rounded"
        />
        <span className="text-sm font-medium text-stone-700">{label}</span>
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
