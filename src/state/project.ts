import { Project } from '../models/project.js';
import { ProjectStatus } from '../models/project.js';

type Listner<T> = (items: T[]) => void;

class State<T> {
  protected listners: Listner<T>[] = [];

  addListner(listnerFunction: Listner<T>) {
    this.listners.push(listnerFunction);
  }
}

export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();

    return this.instance;
  }

  addProject(title: string, descreption: string, numOfPeople: number) {
    const id = Math.random().toString();

    const newProject = new Project(id, title, descreption, numOfPeople, ProjectStatus.Active);

    this.projects.push(newProject);

    this.updateListners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => {
      return project.id === projectId;
    });

    if (project && project.status !== newStatus) {
      project.status = newStatus;

      this.updateListners();
    }
  }

  private updateListners() {
    for (const listnerFunction of this.listners) {
      listnerFunction(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.getInstance();
