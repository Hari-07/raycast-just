enum Filter {
  All = "all",
  Open = "open",
  Completed = "completed",
}

interface Project {
	id: string;
	name: string;
	path: string;
}

export { Filter };
export type { Project };
