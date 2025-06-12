export default function NumericInput({
  label,
  value,
  setter,
  required = false,
  placeholder = "",
}) {
  return (
    <label className="font-semibold flex gap-2 justify-between items-center">
      {label}
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^\d+$/.test(v)) {
            setter(v);
          }
        }}
        className="block w-[100px] mt-1 p-1 border rounded"
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
