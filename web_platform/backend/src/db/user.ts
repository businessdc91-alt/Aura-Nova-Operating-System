// Simple in-memory user DB for demo purposes
const users: any[] = [];

export async function getUserByUsername(username: string) {
  return users.find(u => u.username === username);
}

export async function createUser(user: any) {
  users.push(user);
  return user;
}

export async function getUserById(id: string) {
  return users.find(u => u.id === id);
}
