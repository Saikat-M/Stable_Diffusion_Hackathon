import React from "react";

const Chat = ({ messages }) => {
  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.text}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Enter a message"
        onChange={(e) => {
          messages.push({ text: e.target.value });
        }}
      />
    </div>
  );
};

export default Chat;