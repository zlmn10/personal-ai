import type { Conversation } from '../types/chat';

export interface MongoStatus {
  isConnected: boolean;
  readyState: number;
  host: string;
  name: string;
  conversationCount: number;
}

export class DBService {
  /**
   * Check connection to MongoDB backend
   */
  static async checkStatus(): Promise<MongoStatus> {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        return (await res.json()) as MongoStatus;
      }
      return {
        isConnected: false,
        readyState: 0,
        host: '127.0.0.1',
        name: 'personal_ai',
        conversationCount: 0,
      };
    } catch {
      return {
        isConnected: false,
        readyState: 0,
        host: '127.0.0.1',
        name: 'personal_ai',
        conversationCount: 0,
      };
    }
  }

  /**
   * Fetch all conversations from MongoDB
   */
  static async getConversations(): Promise<Conversation[] | null> {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? (data as Conversation[]) : null;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch conversations from MongoDB backend:', err);
      return null;
    }
  }

  /**
   * Save or update single conversation in MongoDB
   */
  static async saveConversation(conversation: Conversation): Promise<boolean> {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      });
      return res.ok;
    } catch (err) {
      console.warn(`Failed to save conversation ${conversation.id} to MongoDB:`, err);
      return false;
    }
  }

  /**
   * Delete conversation from MongoDB
   */
  static async deleteConversation(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn(`Failed to delete conversation ${id} from MongoDB:`, err);
      return false;
    }
  }

  /**
   * Clear all conversations from MongoDB
   */
  static async clearAll(): Promise<boolean> {
    try {
      const res = await fetch('/api/conversations', {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to clear conversations from MongoDB:', err);
      return false;
    }
  }

  /**
   * Bulk sync local conversations to MongoDB
   */
  static async bulkSync(conversations: Conversation[]): Promise<{ success: boolean; syncedCount: number }> {
    try {
      const res = await fetch('/api/conversations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversations }),
      });
      if (res.ok) {
        return await res.json();
      }
      return { success: false, syncedCount: 0 };
    } catch (err) {
      console.error('Failed to bulk sync conversations to MongoDB:', err);
      return { success: false, syncedCount: 0 };
    }
  }
}

