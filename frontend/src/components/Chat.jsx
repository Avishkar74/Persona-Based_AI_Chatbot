import Message from "./Message.jsx";

export default function Chat({ messages, isLoading }) {
  return (
    <>
      {messages.map((message, index) => (
        <Message key={`${message.role}-${index}`} message={message} />
      ))}
      {isLoading && (
        <div className="message assistant">
          <div className="typing" aria-label="Typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </>
  );
}
