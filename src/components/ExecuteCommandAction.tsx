import { Action, Icon } from "@raycast/api";

function ExecuteCommandAction(props: { onDelete: () => void }) {
  return (
    <Action
      icon={Icon.Terminal}
      title="Execute Command"
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}

export default ExecuteCommandAction;