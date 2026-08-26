import { UserProfile, Transaction, ChatMessage } from "../types";

const USERS_KEY = "mock_users";
const CURRENT_USER_KEY = "mock_current_session";
const TRANSACTIONS_KEY = "mock_transactions";
const CHATS_KEY = "mock_chats";

export const mockDb = {
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(USERS_KEY);
    const users: UserProfile[] = data ? JSON.parse(data) : [];
    return users.map(u => {
      if (u.email === "admin@marketdigitaltrading.com" || u.email === "bitcointrading648@gmail.com") {
        return { ...u, email: "termtransfer@gmail.com", role: "admin" };
      }
      return u;
    });
  },
  
  saveUser: (user: UserProfile) => {
    const users = mockDb.getUsers();
    if (user.email === "admin@marketdigitaltrading.com" || user.email === "bitcointrading648@gmail.com") {
      user.email = "termtransfer@gmail.com";
      user.role = "admin";
    }
    const index = users.findIndex(u => u.uid === user.uid || u.email === user.email);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUser: (uid: string): UserProfile | null => {
    const users = mockDb.getUsers();
    const user = users.find(u => u.uid === uid) || null;
    if (user && (user.email === "admin@marketdigitaltrading.com" || user.email === "bitcointrading648@gmail.com")) {
      user.email = "termtransfer@gmail.com";
      user.role = "admin";
    }
    return user;
  },

  getUserByEmail: (email: string): UserProfile | null => {
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === "admin@marketdigitaltrading.com" || normalizedEmail === "bitcointrading648@gmail.com") {
      return mockDb.getUserByEmail("termtransfer@gmail.com");
    }
    const users = mockDb.getUsers();
    return users.find(u => u.email === normalizedEmail) || null;
  },

  setCurrentSession: (user: any) => {
    if (user && (user.email === "admin@marketdigitaltrading.com" || user.email === "bitcointrading648@gmail.com")) {
      user.email = "termtransfer@gmail.com";
      user.role = "admin";
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCurrentSession: () => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    if (session && (session.email === "admin@marketdigitaltrading.com" || session.email === "bitcointrading648@gmail.com")) {
      session.email = "termtransfer@gmail.com";
      session.role = "admin";
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    }
    return session;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("mock_mirror_admin_session");
  },

  setMirrorSession: (adminSession: any) => {
    localStorage.setItem("mock_mirror_admin_session", JSON.stringify(adminSession));
  },

  getMirrorSession: () => {
    const data = localStorage.getItem("mock_mirror_admin_session");
    return data ? JSON.parse(data) : null;
  },

  clearMirrorSession: () => {
    localStorage.removeItem("mock_mirror_admin_session");
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTransaction: (tx: Transaction) => {
    const txs = mockDb.getTransactions();
    txs.push({ ...tx, id: tx.id || Math.random().toString(36).substr(2, 9) });
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  },

  updateTransaction: (id: string, status: string, rejectionReason?: string) => {
    const txs = mockDb.getTransactions();
    const index = txs.findIndex(t => t.id === id);
    if (index > -1) {
      txs[index].status = status as any;
      if (rejectionReason) {
        txs[index].rejectionReason = rejectionReason;
      }
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
    }
  },

  getChatMessages: (userId: string): ChatMessage[] => {
    const data = localStorage.getItem(`${CHATS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveChatMessage: (userId: string, msg: ChatMessage) => {
    const msgs = mockDb.getChatMessages(userId);
    msgs.push({ ...msg, id: Math.random().toString(36).substr(2, 9), createdAt: { seconds: Date.now() / 1000 } as any });
    localStorage.setItem(`${CHATS_KEY}_${userId}`, JSON.stringify(msgs));
  }
};
