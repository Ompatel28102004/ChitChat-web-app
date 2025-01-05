import CryptoJS from "crypto-js";

export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }, window.location.reload()),
    addMessage: (message) => {
      const decryptMessage = (encryptedMessage) => {
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedMessage, "socket-chat-app");
          return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
          console.error("Error decrypting message:", error);
          return "[Decryption Failed]";
        }
      };
    
      const selectedChatMessages = get().selectedChatMessages;
      const selectedChatType = get().selectedChatType;
      const decryptedMessageContent = decryptMessage(message.content);
    
      set({
        selectedChatMessages: [
          ...selectedChatMessages,
          {
            ...message,
            content: decryptedMessageContent, // Use decrypted content
            recipient: selectedChatType === "channel" ? message.channelId : message.recipient._id,
            sender: selectedChatType === "channel" ? message.sender : message.sender._id,
          },
        ],
      });
    },

  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel) => channel._id === message.channelId); 
    const index = channels.findIndex((channel) => channel._id === message.channelId);
    if (index !== -1 && index !== undefined) {
      channels.splice(index, 1);
      channels.unshift(data);
    }
  },

  addContactInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId = message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact) => contact._id === fromId);
    const index = dmContacts.findIndex((contact) => contact._id === fromId);
    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    }
  }
});
