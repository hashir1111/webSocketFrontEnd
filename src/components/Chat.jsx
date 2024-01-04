import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { MdAttachFile } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [Url, setUrl] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [uploadImage, setUploadImage] = useState(null);

  const hiddenFileInput = useRef(null);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleUpload = () => {
    if (uploadImage == null) return;
    const imageRef = ref(storage, `images/${uploadImage.name}`);
    uploadBytes(imageRef, uploadImage).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setUrl(url);
      });
    });
  };

  const sendMessage = async () => {
    let messageContent = currentMessage;
    let imageUrl = Url;

    if (Url) {
      messageContent += ` ${Url}`;
      imageUrl = "";
    }

    if (messageContent.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        url: imageUrl,
        message: messageContent,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setUrl("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("datadatadata", data);
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  function Functions() {
    sendMessage();
  }

  useEffect(() => {
    handleUpload();
  }, [uploadImage]);
  console.log(Url);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <div className="buttons">
          <input
            type="file"
            ref={hiddenFileInput}
            onChange={(e) => {
              setUploadImage(e.target.files[0]);
            }}
            style={{ display: "none" }}
          />
          <MdAttachFile size="medium" onClick={handleClick} />
          <IoIosSend size="medium" onClick={Functions} />
        </div>
      </div>
    </div>
  );
}

export default Chat;
