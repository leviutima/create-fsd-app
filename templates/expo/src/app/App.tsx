import { View, Text } from "react-native";

const projectName = "{{PROJECT_NAME}}";

export function App() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{projectName}</Text>
    </View>
  );
}
