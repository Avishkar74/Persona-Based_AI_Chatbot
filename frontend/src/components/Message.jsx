const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMarkdown = (value) => {
  let html = escapeHtml(value);

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br />");

  return html;
};

export default function Message({ message }) {
  return (
    <div
      className={`message ${message.role}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
    />
  );
}
