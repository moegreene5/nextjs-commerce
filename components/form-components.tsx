import { useStore } from "@tanstack/react-form";

import { useFieldContext, useFormContext } from "@/hooks/form-context";
import { cn } from "@/utils/cn";
import { Loader2, LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const focusRing =
  "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-black focus-visible:!ring-0 focus-visible:!border-black";

const invalidState =
  "aria-invalid:ring-0 aria-invalid:ring-offset-0 aria-invalid:border-2 aria-invalid:border-red-500";

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
          className={cn(
            "h-11 rounded-sm border border-black bg-black text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-50",
            focusRing,
            props.className,
          )}
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
          className="mt-1 text-sm text-red-400"
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
  id,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.ComponentProps<"input">) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const inputId = id || label;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm text-black">
        {label}
        {required && <span className="ml-0.5 text-black">*</span>}
      </label>
      <Input
        id={inputId}
        type={type}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
        className={cn(
          "h-10 rounded-sm border border-black bg-white text-black placeholder:text-neutral-400",
          focusRing,
          invalidState,
          className,
        )}
        {...props}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}

export function TextArea({
  label,
  rows = 4,
  className,
  id,
  ...props
}: {
  label: string;
  rows?: number;
} & React.ComponentProps<"textarea">) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const textareaId = id || label;

  return (
    <div className="space-y-1">
      <label htmlFor={textareaId} className="block text-sm text-black">
        {label}
      </label>
      <Textarea
        id={textareaId}
        name={field.name}
        rows={rows}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(
          "rounded-sm border border-black bg-white text-black placeholder:text-neutral-400",
          focusRing,
          invalidState,
          className,
        )}
        aria-invalid={!field.state.meta.isValid && field.state.meta.isTouched}
        {...props}
      />
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
  const isInvalid = !field.state.meta.isValid && field.state.meta.isTouched;

  return (
    <div className="space-y-1">
      <label htmlFor={label} className="block mb-0 text-sm text-black">
        {label}
        {required && <span className="ml-0.5 text-black">*</span>}
      </label>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        onOpenChange={(open) => !open && field.handleBlur()}
      >
        <SelectTrigger
          id={label}
          aria-invalid={isInvalid}
          aria-label={label}
          className={cn(
            "h-10 w-full rounded-sm border border-black bg-white px-3 text-sm text-black focus:outline-none",
            focusRing,
            invalidState,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-sm border-black bg-white text-black">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        className={cn("flex cursor-pointer items-center gap-2", className)}
      >
        <input
          type="checkbox"
          name={field.name}
          checked={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          className={cn(
            "h-4 w-4 rounded-sm border border-black text-black accent-black",
            focusRing,
          )}
        />
        <span className="text-sm font-medium text-black">{label}</span>
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
