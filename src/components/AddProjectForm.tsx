import { useCallback } from "react";
import { Form, Action, ActionPanel, useNavigation } from "@raycast/api";
import { Project } from "../types";

function AddProjectForm(props: { defaultTitle?: string; onCreate: (project: Project) => void }) {
  const { onCreate, defaultTitle = "" } = props;
  const { pop } = useNavigation();

  const handleSubmit = useCallback(
    (project: Project) => {
      onCreate(project);
      pop();
    },
    [onCreate, pop]
  );

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Project" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" defaultValue={defaultTitle} placeholder="Enter Project Name" title="Project Name" />
      <Form.TextField id="path" defaultValue={defaultTitle} placeholder="Enter Project Root Path" title="Project Root Path" />
    </Form>
  );
}

export default AddProjectForm;