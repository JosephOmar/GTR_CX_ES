// src/components/FormField.jsx
const FormField = ({ label, name, type, value, onChange, required, autoComplete }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-800"
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      required={required}
      className=" mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
  </div>
);

export default FormField;