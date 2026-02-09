import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/friends/list")
      .then((res) => setFriends(res.data))
      .catch((err) => console.log("Failed to fetch friends", err))
      .finally(() => setLoading(false));
  }, []);

  return { friends, loading, setFriends };
};

export const useMessages = (friendId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/messages/chat/${id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (friendId) {
      loadMessages(friendId);
    }
  }, [friendId, loadMessages]);

  return { messages, loading, setMessages, loadMessages };
};