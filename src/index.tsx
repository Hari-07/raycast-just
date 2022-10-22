import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { ActionPanel, Icon, List, LocalStorage } from "@raycast/api";
import { Filter, Project } from "./types";
import { CreateTodoAction, DeleteTodoAction, EmptyView } from "./components";

type State = {
  filter: Filter;
  isLoading: boolean;
  searchText: string;
  projects: Project[];
};

export default function Command() {
  const [state, setState] = useState<State>({
    filter: Filter.All,
    isLoading: true,
    searchText: "",
    projects: [],
  });

  useEffect(() => {
    (async () => {
      const storedProjects = await LocalStorage.getItem<string>("projects");
      if (!storedProjects) {
        setState((previous) => ({ ...previous, isLoading: false }));
        return;
      }

      try {
        const projects: Project[] = JSON.parse(storedProjects);
        setState((previous) => ({ ...previous, projects, isLoading: false }));
      } catch (e) {
        // can't decode todos
        setState((previous) => ({ ...previous, projects: [], isLoading: false }));
      }
    })();
  }, []);

  useEffect(() => {
    LocalStorage.setItem("projects", JSON.stringify(state.projects));
  }, [state.projects]);

  const handleCreate = useCallback(
    (project: Project) => {
      const newProjects = [...state.projects, { id: nanoid(), name: project.name, path: project.path }];
      setState((previous) => ({ ...previous, projects: newProjects, filter: Filter.All, searchText: "" }));
    },
    [state.projects, setState]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const newProjects = [...state.projects];
      newProjects.splice(index, 1);
      setState((previous) => ({ ...previous, projects: newProjects }));
    },
    [state.projects, setState]
  );

  const filterTodos = useCallback(() => {
    // if (state.filter === Filter.Open) {
    //   return state.projects.filter((todo) => !todo.isCompleted);
    // }
    // if (state.filter === Filter.Completed) {
    //   return state.projects.filter((todo) => todo.isCompleted);
    // }
    return state.projects;
  }, [state.projects, state.filter]);

  return (
    <List
      isLoading={state.isLoading}
      searchText={state.searchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Todo List"
          value={state.filter}
          onChange={(newValue) => setState((previous) => ({ ...previous, filter: newValue as Filter }))}
        >
          <List.Dropdown.Item title="All" value={Filter.All} />
          <List.Dropdown.Item title="Open" value={Filter.Open} />
          <List.Dropdown.Item title="Completed" value={Filter.Completed} />
        </List.Dropdown>
      }
      enableFiltering
      onSearchTextChange={(newValue) => {
        setState((previous) => ({ ...previous, searchText: newValue }));
      }}
    >
      <EmptyView filter={state.filter} projects={filterTodos()} searchText={state.searchText} onCreate={handleCreate} />
      {filterTodos().map((project, index) => (
        <List.Section title={project.name} subtitle={project.path} key={project.id}>
          <List.Item
            key={project.id}
            title={project.name}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <CreateTodoAction onCreate={handleCreate} />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <DeleteTodoAction onDelete={() => handleDelete(index)} />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        </List.Section>
      ))}
    </List>
  );
}
