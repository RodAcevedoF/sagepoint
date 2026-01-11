import { User } from '@sagepoint/domain';
import { IUserRepository } from '@sagepoint/domain';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  // Quick lookup index for emails
  private emails: Map<string, string> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
    this.emails.set(user.email, user.id);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.emails.get(email);
    if (!id) return null;
    return this.users.get(id) || null;
  }
}
