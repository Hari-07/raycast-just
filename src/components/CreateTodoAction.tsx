import { Action, Icon } from "@raycast/api";
import { Project } from "../types";
import AddProjectForm from "./AddProjectForm";

function CreateTodoAction(props: { defaultTitle?: string; onCreate: (project: Project) => void }) {
  return (
    <Action.Push
      icon={Icon.Plus}
      title="Create Todo"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<AddProjectForm defaultTitle={props.defaultTitle} onCreate={props.onCreate} />}
    />
  );
}

export default CreateTodoAction;