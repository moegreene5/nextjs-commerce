import { AppFormApi } from "@/hooks/form";
import { countryOptions } from "@/lib/countries";
import { AddAddressInput } from "@/schema/address.schema";

export function LabelSection({ form }: { form: AppFormApi<AddAddressInput> }) {
  return (
    <div>
      <p className="font-geologica capitalize font-medium text-neutral-500">
        Label
      </p>
      <p className="mt-0.5 text-sm text-neutral-400">
        A short name to tell this address apart.
      </p>
      <div className="mt-3">
        <form.AppField name="label">
          {(field) => (
            <field.TextField label="Address name" placeholder="Home" required />
          )}
        </form.AppField>
      </div>
    </div>
  );
}

export function ContactSection<T extends Partial<AddAddressInput>>({
  form,
}: {
  form: AppFormApi<T>;
}) {
  return (
    <div>
      <p className="font-geologica capitalize font-medium text-neutral-500">
        Contact
      </p>
      <p className="mt-0.5 text-sm text-neutral-400">
        Who should the courier hand this to.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.AppField name="recipientName">
          {(field) => (
            <field.TextField
              label="Full name"
              placeholder="Jordan Smith"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="phone">
          {(field) => (
            <field.TextField
              label="Phone number"
              placeholder="+1 555 123 4567"
              required
            />
          )}
        </form.AppField>
      </div>
    </div>
  );
}

export function ShippingAddressSection<T extends Partial<AddAddressInput>>({
  form,
}: {
  form: AppFormApi<T>;
}) {
  return (
    <div>
      <p className="font-geologica capitalize font-medium text-neutral-500">
        Shipping address
      </p>
      <p className="mt-0.5 text-sm text-neutral-400">
        Where should this order arrive.
      </p>
      <div className="mt-3 space-y-4">
        <form.AppField name="line1">
          {(field) => (
            <field.TextField
              label="Address line 1"
              placeholder="123 Main Street"
              required
            />
          )}
        </form.AppField>

        <form.AppField name="line2">
          {(field) => (
            <field.TextField
              label="Address line 2 (optional)"
              placeholder="Apt, suite, floor, landmark"
            />
          )}
        </form.AppField>

        <form.AppField name="country">
          {(field) => (
            <field.SelectField
              label="Country / region"
              required
              placeholder="Select country"
              options={countryOptions}
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.AppField name="city">
            {(field) => (
              <field.TextField
                label="City"
                placeholder="Springfield"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="state">
            {(field) => (
              <field.TextField
                label="State / province"
                placeholder="Illinois"
                required
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="postalCode">
          {(field) => (
            <field.TextField
              label="ZIP / postal code (optional)"
              placeholder="62704"
            />
          )}
        </form.AppField>
      </div>
    </div>
  );
}

export function DefaultToggleSection({
  form,
  label,
}: {
  form: AppFormApi<AddAddressInput>;
  label: string;
}) {
  return (
    <form.AppField name="isDefault">
      {(field) => <field.CheckboxField label={label} />}
    </form.AppField>
  );
}
