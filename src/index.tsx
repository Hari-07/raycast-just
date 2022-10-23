import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { ActionPanel, Icon, List, LocalStorage } from "@raycast/api";
import { Filter, Project, ProjectWithCommands } from "./types";
import { CreateTodoAction as AddProjectAction, DeleteTodoAction, EmptyView } from "./components";
import { exec } from "child_process";
import { stderr } from "process";
import { readFileSync } from "fs";
import { readFile } from "fs/promises";

type State = {
  filter: Filter;
  isLoading: boolean;
  searchText: string;
  projects: Project[];
  projectsWithCommands: ProjectWithCommands[];
};

export default function Command() {
  const [state, setState] = useState<State>({
    filter: Filter.All,
    isLoading: true,
    searchText: "",
    projects: [],
    projectsWithCommands: [],
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
        const projectsWithCommands = await hydrateProjects(projects);
        setState((previous) => ({ ...previous, projects, projectsWithCommands, isLoading: false }));
      } catch (e) {
        // can't decode todos
        setState((previous) => ({ ...previous, projects: [], projectsWithCommands: [], isLoading: false }));
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

  // TODO: Filter by Project
  const filterTodos = useCallback(() => {
    return state.projects;
  }, [state.projects, state.filter]);

  return (
    <List
      isLoading={state.isLoading}
      searchText={state.searchText}
      // searchBarAccessory={
      //   <List.Dropdown
      //     tooltip="Select Project"
      //     value={state.filter}
      //     onChange={(newValue) => setState((previous) => ({ ...previous, filter: newValue as Filter }))}
      //   >
      //     <List.Dropdown.Item title="All" value={Filter.All} />
      //     <List.Dropdown.Item title="Open" value={Filter.Open} />
      //     <List.Dropdown.Item title="Completed" value={Filter.Completed} />
      //   </List.Dropdown>
      // }
      enableFiltering
      onSearchTextChange={(newValue) => {
        setState((previous) => ({ ...previous, searchText: newValue }));
      }}
    >
      <EmptyView filter={state.filter} projects={filterTodos()} searchText={state.searchText} onCreate={handleCreate} />
      {filterTodos().map((project, index) => (
        <List.Section title={project.name} subtitle={project.path} key={project.id}>
          {state.projectsWithCommands[index].commands.map((command, index) => (
            <List.Item
              key={command}
              title={command}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <DeleteTodoAction onDelete={() => handleDelete(index)} />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <AddProjectAction onCreate={handleCreate} />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}

const hydrateProjects = async (projects: Project[]): Promise<ProjectWithCommands[]> => {
  let projectsWithCommands: ProjectWithCommands[] = [];
  for (const project of projects) {
    try {
      const path = `${project.path}/justfile`;
      const contents = await readFile(path, "utf8");

      const regex = /(\w+)(:\n)/gm;
      const matches = contents.match(regex);

      if (matches == null) {
        projectsWithCommands.push({ ...project, commands: [] });
        continue;
      }

      let commands: string[] = [];
      for (const match of matches) {
        commands.push(match.slice(0, -2));
      }
      projectsWithCommands.push({ ...project, commands });
    } catch {
      projectsWithCommands.push({ ...project, commands: [] });
    }
  }

  return projectsWithCommands;
};
