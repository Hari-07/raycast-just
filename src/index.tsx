import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { ActionPanel, Icon, List, LocalStorage } from "@raycast/api";
import { Filter, Project, ProjectWithCommands } from "./types";
import { AddProjectAction, EmptyView, ExecuteCommandAction } from "./components";
import { readFile } from "fs/promises";
import { runAppleScriptSync } from "run-applescript";

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
        console.log(projects)
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
    async (project: Project) => {
      const newProject:Project = { id: nanoid(), name: project.name, path: project.path }
      const newProjectWithCommands:ProjectWithCommands =  (await hydrateProjects([newProject]))[0]

      const newProjects = [...state.projects, newProject];
      const newProjectsWithCommands = [...state.projectsWithCommands, newProjectWithCommands]
      setState((previous) => ({ ...previous, projects: newProjects, projectsWithCommands:newProjectsWithCommands, filter: Filter.All, searchText: "" }));
    },
    [state.projects, setState]
  );

  const handleExecuteCommand = (path: string, command: string) => {
    console.log("THS WORKS");
    runAppleScriptSync(`
      tell application "Terminal"
        activate
        my execCmd("cd ${path}")
        my execCmd("just ${command}")
      end tell

      on execCmd(cmd)
        tell application "System Events"
            tell application process "Terminal"
                set frontmost to true
                keystroke cmd
                keystroke return
            end tell
        end tell
      end execCmd
    `);
  };

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
              key={project.id + command}
              title={command}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <ExecuteCommandAction onDelete={() => handleExecuteCommand(project.path, command)} />
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

      const regex = /^[^\s]+:$/gm;
      const matches = contents.match(regex);

      if (matches == null) {
        projectsWithCommands.push({ ...project, commands: [] });
        continue;
      }

      let commands: string[] = [];
      for (const match of matches) {
        commands.push(match.slice(0, -1));
      }
      projectsWithCommands.push({ ...project, commands });
    } catch {
      projectsWithCommands.push({ ...project, commands: [] });
    }
  }

  return projectsWithCommands;
};
