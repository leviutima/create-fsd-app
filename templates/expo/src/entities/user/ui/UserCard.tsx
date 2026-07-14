import { Text } from "react-native";
import type { User } from "../model/types";

export function UserCard({ user }: { user: User }) {
  return <Text>{user.name}</Text>;
}
