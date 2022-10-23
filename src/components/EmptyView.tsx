import { ActionPanel, List } from "@raycast/api";
import { Filter, Project } from "../types";
import AddProjectAction from "./AddProjectAction";

function EmptyView(props: { projects: Project[]; filter: Filter; searchText: string; onCreate: (project: Project) => void }) {
  if (props.projects.length > 0) {
    return (
      <List.EmptyView
        icon="😕"
        title="No matching todos found"
        description={`Can't find a todo matching ${props.searchText}.\nCreate it now!`}
        actions={
          <ActionPanel>
            <AddProjectAction defaultTitle={props.searchText} onCreate={props.onCreate} />
          </ActionPanel>
        }
      />
    );
  }
  switch (props.filter) {
    case Filter.Open: {
      return (
        <List.EmptyView
          icon="🎉"
          title="All done"
          description="All todos completed - way to go! Why not create some more?"
          actions={
            <ActionPanel>
              <AddProjectAction defaultTitle={props.searchText} onCreate={props.onCreate} />
            </ActionPanel>
          }
        />
      );
    }
    case Filter.Completed: {
      return (
        <List.EmptyView
          icon="😢"
          title="No todos completed"
          description="Uh-oh, looks like you haven't completed any todos yet."
        />
      );
    }
    case Filter.All:
    default: {
      return (
        <List.EmptyView
          icon="📝"
          title="No todos found"
          description="You don't have any todos yet. Why not add some?"
          actions={
            <ActionPanel>
              <AddProjectAction defaultTitle={props.searchText} onCreate={props.onCreate} />
            </ActionPanel>
          }
        />
      );
    }
  }
}
export default EmptyView;