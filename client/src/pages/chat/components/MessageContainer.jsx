import React, { useEffect, useRef, useState } from 'react'
import { useAppstore } from "@/store";
import moment from 'moment';
import { apiClient } from '@/lib/api-client';
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES } from '@/utils/constants';
import { HOST } from '@/utils/constants';
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io"
import { IoCloseSharp } from 'react-icons/io5';
import { getColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CryptoJS from "crypto-js"

const SECRET_KEY = "socket-chat-app" // Replace with a strong key

const MessageContainer = () => {
  const { 
    selectedChatType, 
    selectedChatData, 
    userInfo, 
    selectedChatMessages, 
    setSelectedChatMessages, 
    setIsDownloading, 
    setFileDownloadProgress 
  } = useAppstore();
  
  const scrollRef = useRef();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  // Function to decrypt a message
  const decryptMessage = (encryptedMessage) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Error decrypting message:", error);
      return "[Decryption Failed]";
    }
  };

  // Decrypt all messages in the array
  const decryptMessagesArray = (messages) => {
    return messages.map((message) => {
      if (message.messageType === "text") {
        return { ...message, content: decryptMessage(message.content) };
      }
      return message;
    });
  };

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedChatData?._id) return;
      try {
        const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, { id: selectedChatData._id }, { withCredentials: true });
        if (response.data.messages) {
          const decryptedMessages = decryptMessagesArray(response.data.messages);
          setSelectedChatMessages(decryptedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const getChannelMessages = async () => {
      if (!selectedChatData?._id) return;
      try {
        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, { withCredentials: true });
        if (response.data.messages) {
          const decryptedMessages = decryptMessagesArray(response.data.messages);
          setSelectedChatMessages(decryptedMessages);
        } else {
          console.error("No messages found for this channel.");
        }
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === 'contact') {
        getMessages();
      } else if (selectedChatType === 'channel') {
        getChannelMessages();
      }
    }
  }, [selectedChatData,selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current && selectedChatMessages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages.length]);
  

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  }
  const downdloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (ProgressEvent) => {
        const { loaded, total } = ProgressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentCompleted);
      }
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  }
  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.Timestamp).format("YYYY-MM-DD");
      const showDate = messageDate != lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (<div className="text-center text-gray-500 my-2"> {moment(message.Timestamp).format("LL")} </div>
          )}
          {
            selectedChatType === "contact" && renderDMMessages(message)
          }
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      )
    });
  };
  const renderDMMessages = (message) => <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}
  >
    {
      message.messageType === "text" && (
        <div className={`${message.sender !== selectedChatData._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : " bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words `}>{message.content}
        </div>
      )}
    {
      message.messageType === "file" && <div className={`${message.sender !== selectedChatData._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : " bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words `}>
        {
          checkIfImage(message.fileUrl) ? <div className='cursor-pointer '
            onClick={() => {
              setShowImage(true);
              setImageURL(message.fileUrl);
            }}
          >
            <img src={`${HOST}/${message.fileUrl}`} alt="file" height={300} width={300} />
          </div> : <div className='flex items-center justify-center gap-4 '>
            <span className=' text-white/8 text-3xl bg-black/20 rounded-full p-3 '>
              <MdFolderZip />
            </span>
            <span>
              {message.fileUrl.split("/").pop()}
            </span>
            <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300  ' onClick={() => downdloadFile(message.fileUrl)}> <IoMdArrowRoundDown /></span>
          </div>
        }
      </div>
    }
    <div className="text-xs text-gray-600">{moment(message.Timestamp).format("LT")}</div>
  </div>

  const renderChannelMessages = (message) => {
    const isCurrentUser = message.sender._id === userInfo.id;
  
    return (
      <div className={`mt-5 ${isCurrentUser ? "text-right" : "text-left"}`}>
  
        {message.messageType === "text" && (
          <div className={`${isCurrentUser ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}>
            {message.content}
          </div>
        )}
  
        {!isCurrentUser ? (
          <div className='flex items-center justify-start gap-3'>
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image ? (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <AvatarFallback
                  className={`uppercase h-8 w-8 border-[1px] text-lg flex items-center justify-center rounded-full ${getColor(message.sender.color)}`}
                >
                  {(message.sender.firstName?.charAt(0) || "") + (message.sender.lastName?.charAt(0) || "") || message.sender.email?.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <span className='text-sm text-white/60'>{`${message.sender.firstName || ""} ${message.sender.lastName || ""}`}</span>
              <span className='text-xs text-white/60 ml-1'>{moment(message.Timestamp).format("LT")}</span>
            </div>
          </div>
        ) : (
          <div className='text-xs text-white/60 mt-1'>{moment(message.Timestamp).format("LT")}</div>
        )}
  
        {message.messageType === "file" && (
          <div className={`${isCurrentUser ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}>
            {checkIfImage(message.fileUrl) ? (
              <div className='cursor-pointer' onClick={() => {
                setShowImage(true);
                setImageURL(message.fileUrl);
              }}>
                <img src={`${HOST}/${message.fileUrl}`} alt="file" height={300} width={300} />
              </div>
            ) : (
              <div className='flex items-center justify-center gap-4'>
                <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(message.fileUrl)}>
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
      {renderMessages()}
      <div ref={scrollRef} />
      {
        showImage && <div className='fixed z-[1000] top-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col ' >
          <div>
            <img src={`${HOST}/${imageURL}`} alt="image"
              className='h-[80vh] w-full bg-cover'
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5 ">
            <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300  ' onClick={() => downdloadFile(imageURL)} >
              <IoMdArrowRoundDown />
            </button>
            <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300  ' onClick={() => {
              setShowImage(false);
              setImageURL(null);
            }} >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      }
    </div >
  )
}

export default MessageContainer
