import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { MdAttachFile } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [Url, setUrl] = useState("");
  const [vidUrl, setVidUrl] = useState("");
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
        checkMediaType(url);
      });
    });
  };

  function checkMediaType(link) {
    const path = new URL(link).pathname;

    const fileExtension = path.split(".").pop().toLowerCase();

    if (
      ["mp4", "avi", "mkv", "mov", "webm", "flv", "avchd", "wmv"].includes(
        fileExtension
      )
    ) {
      setVidUrl(link);
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      setUrl(link);
    } else {
      console.log(
        "The provided link does not have a recognized video or image extension."
      );
    }
  }

  const sendMessage = async () => {
    let messageContent = currentMessage;
    let imageUrl = Url;
    let videoUrl = vidUrl;

    if (Url) {
      messageContent += ` ${Url}`;
      imageUrl = "";
    }

    if (vidUrl) {
      messageContent += ` ${vidUrl}`;
      videoUrl = "";
    }

    if (messageContent.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        url: Url,
        video: vidUrl,
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
      setVidUrl("");
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

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            console.log(messageContent);
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div>
                    {messageContent.url !== "" ? (
                      <img className="image" src={messageContent.url} />
                    ) : messageContent.video !== "" ? (
                      <video
                        className="video"
                        src={messageContent.video}
                        controls
                      />
                    ) : (
                      <div className="message-content">
                        <p>{messageContent.message}</p>
                      </div>
                    )}
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
