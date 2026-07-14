import type { User } from "../model/types";

export function UserCard({ user }: { user: User }) {
  return <div className="user-card">{user.name}</div>;
}
