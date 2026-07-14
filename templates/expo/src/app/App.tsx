import { View, Text, StyleSheet } from "react-native";
import { UserCard } from "@/entities/user";

const projectName = "{{PROJECT_NAME}}";

export function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{projectName}</Text>
      <UserCard user={{ id: "1", name: "Ada Lovelace" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
