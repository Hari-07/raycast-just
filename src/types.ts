import Command from ".";

enum Filter {
  All = "all",
  Open = "open",
  Completed = "completed",
}

interface Commands {
	commands: string[];
}

interface Project {
	id: string;
	name: string;
	path: string;
}

type ProjectWithCommands = Project & Commands;

export { Filter };
export type { Project, ProjectWithCommands };
