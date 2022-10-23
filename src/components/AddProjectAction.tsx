import { Action, Icon } from "@raycast/api";
import { Project } from "../types";
import AddProjectForm from "./AddProjectForm";

function AddProjectAction(props: { defaultTitle?: string; onCreate: (project: Project) => void }) {
  return (
    <Action.Push
      icon={Icon.Plus}
      title="Add Project"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<AddProjectForm defaultTitle={props.defaultTitle} onCreate={props.onCreate} />}
    />
  );
}

export default AddProjectAction;