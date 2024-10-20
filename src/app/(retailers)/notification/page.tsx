"use client";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { useRouter } from 'next/navigation';
import { DateRange } from "react-day-picker"; // Import DateRange type
import { DatePickerWithRange } from "@/components/ui/datepicker";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { format, parseISO } from "date-fns"; // Import the necessary functions from date-fns

type Message = {
  id: string;
  companyName: string;
  productName: string;
  image1: string;
  productId: string;
  createdAt: string; // Assuming this is in a valid date format
  message: string;
  isClickable: boolean;
  read: boolean; // Field to track read/unread status
};

const MessageListPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchInput, setSearchInput] = useState(""); // State to track search input
  const [dateRange, setDateRange] = useState<DateRange | undefined>(); // State to track date range
  const router = useRouter();

  useEffect(() => {
    // Create a real-time listener for the messages collection
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as Message);
      });

      // Sort messages by createdAt in descending order (latest first)
      messagesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const markAllAsRead = async () => {
      const unreadMessages = messages.filter(message => !message.read);
      unreadMessages.forEach(async (message) => {
        const messageRef = doc(db, "messages", message.id);
        await updateDoc(messageRef, { read: true }); // Mark as read
      });
    };
    markAllAsRead();
  }, [messages]);

  const handleClick = (productId: string, isClickable: boolean) => {
    if (isClickable) {
      router.push(`/products/${productId}`);
    }
  };

  // Filter messages based on the search input and date range
  const filteredMessages = messages.filter((message) => {
    const messageDate = new Date(message.createdAt); // Convert message's createdAt to a Date object

    // Check if the message matches the search input
    const matchesSearchInput =
      message.productName.toLowerCase().includes(searchInput.toLowerCase()) || 
      message.companyName.toLowerCase().includes(searchInput.toLowerCase()) ||
      message.message.toLowerCase().includes(searchInput.toLowerCase());

    // Check if the message date falls within the selected date range
    const matchesDateRange =
      dateRange?.from && dateRange?.to
        ? messageDate >= dateRange.from && messageDate <= dateRange.to
        : true; // If no date range is selected, include all messages

    return matchesSearchInput && matchesDateRange;
  });

  // Refresh function to reset the search input
  const handleRefresh = () => {
    setSearchInput(""); // Reset the search input
    setDateRange(undefined); // Reset the date range
  };

  return (
    <div className="message-list">

      {/* Search Bar */}
      <PlaceholdersAndVanishInput
        placeholders={["Search products..."]}
        onChange={(e) => {
          setSearchInput(e.target.value); // Update search input value
        }}
        onSubmit={(e) => e.preventDefault()} // Prevent default form submission
      />

      {/* Date Range Picker */}
      <DatePickerWithRange 
        className="mt-4" 
        onChange={setDateRange} // Pass the date range change handler
      />

      {/* Refresh Button */}
      <button 
        onClick={handleRefresh} 
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        Refresh
      </button>

      <ul>
        {filteredMessages.map((message) => (
          <li 
            key={message.id} 
            onClick={() => handleClick(message.productId, message.isClickable)} 
            className={`bg-gray-600 p-2 mb-5 message-item ${message.isClickable ? 'clickable' : ''}`} 
            style={{ cursor: message.isClickable ? 'pointer' : 'default' }}
          >
            <div>
              <img src={message.image1} alt={message.productName} width={50} height={50} />
            </div>
            <div>
              <h3>{message.productName}</h3>
              <p>{message.companyName}</p>
              <p>{message.message}</p>
              <p className="text-sm text-gray-400">
                {format(parseISO(message.createdAt), "MMM dd, yyyy, hh:mm a")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageListPage;
