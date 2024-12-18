import React, { useState } from 'react'
import { useAppstore } from '@/store'
import { RiCloseFill, RiInformationLine } from "react-icons/ri"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getColor } from "@/lib/utils"
import ChannelInfo from './ChannelInfo'

export default function ChatHeader() {
  const { closeChat, selectedChatData, selectedChatType } = useAppstore()
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false)

  return (
    <div className='h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20'>
      <div className="flex gap-5 items-center w-full justify-between">
        <div className='flex gap-3 items-center justify-center'>
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={selectedChatData.image}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black" 
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 border-[1px] text-lg flex items-center justify-center rounded-full ${getColor(selectedChatData.color)}`}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName.charAt(0) + selectedChatData.lastName.charAt(0)
                      : selectedChatData.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div
                    className={`uppercase h-12 w-12 border-[1px] text-lg flex items-center justify-center rounded-full ${getColor(selectedChatData.color)}`}
                  >
                    {selectedChatData.name.charAt(0) }
                  </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name ? selectedChatData.name : null}
            {selectedChatType === "contact" && selectedChatData.firstName 
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}` 
              : selectedChatData.email}
          </div>
        </div>

        <div className="flex justify-center items-center gap-5">
          {selectedChatType === "channel" && (
            <button
              className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
              onClick={() => setIsChannelInfoOpen(true)}
            >
              <RiInformationLine className='text-3xl' />
            </button>
          )}
          <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all' onClick={closeChat}>
            <RiCloseFill className='text-3xl' />
          </button>
        </div>
      </div>
      {selectedChatType === "channel" && isChannelInfoOpen && (
        <ChannelInfo isOpen={isChannelInfoOpen} onClose={() => setIsChannelInfoOpen(false)} />
      )}
    </div>
  )
}