import { useState } from "react";

export default function InputBox({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled) return;
    submit();
  };

  const handleKeyDown = (event) => {
    // Send on Enter, allow newline with Shift+Enter
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (disabled) return;
      submit();
    }
  };

  return (
    <form className="input-row" onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
}
