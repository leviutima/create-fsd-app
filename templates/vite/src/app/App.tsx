import { UserCard } from "@/entities/user";

const projectName = "{{PROJECT_NAME}}";

export function App() {
  return (
    <div>
      <h1>{projectName}</h1>
      <UserCard user={{ id: "1", name: "Ada Lovelace" }} />
    </div>
  );
}
